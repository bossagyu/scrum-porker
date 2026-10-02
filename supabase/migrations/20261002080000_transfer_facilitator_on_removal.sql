-- 参加者を削除したとき、それがそのルームで唯一のファシリテーターだった場合に、
-- 最も古くから居るアクティブな参加者へファシリテーターを自動で移譲する。
--
-- RoomSettingsDialog（room-header.tsx）は is_facilitator の参加者にしか出ない。
-- 一方、参加者の削除は is_facilitator または allow_all_control で実行でき、
-- allow_all_control は既定 ON。つまり一般参加者がファシリテーターを削除でき、
-- その後そのルームでは誰もカードセット・タイマー・自動公開を変更できなくなる。
--
-- 「設定も allow_all_control で開放する」案は採らなかった。allow_all_control
-- 自体が設定項目なので、ファシリテーター不在のルームで誰かがそれを OFF にすると、
-- 今度こそ誰も設定を開けない行き止まりになるため。
--
-- 同一ルームの削除は rooms 行のロックで直列化する（並行削除で昇格が
-- どちらも起きない競合を防ぐため）。
--
-- 削除された側の is_facilitator は落とさない。元の主催者が再参加したときに
-- 設定へ戻れる余地を残すため（ファシリテーターが複数居ても実害はない。
-- get_my_facilitator_room_ids も複数行を返して問題なく動く）。

CREATE OR REPLACE FUNCTION public.remove_participant(p_participant_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room_id UUID;
  v_was_facilitator BOOLEAN;
  v_caller_participant_id UUID;
  v_session_id UUID;
BEGIN
  SELECT room_id, is_facilitator INTO v_room_id, v_was_facilitator
  FROM participants
  WHERE id = p_participant_id;

  IF v_room_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- NOT EXISTS rather than NOT IN: safe even if get_my_controllable_room_ids()
  -- is ever changed to return a NULL row (NOT IN would then silently reject
  -- every caller).
  IF NOT EXISTS (
    SELECT 1 FROM public.get_my_controllable_room_ids() AS id WHERE id = v_room_id
  ) THEN
    RAISE EXCEPTION 'permission denied: caller does not control this room';
  END IF;

  -- 同一ルームの削除を直列化する。これが無いと READ COMMITTED では、
  -- 2 人がほぼ同時に削除したときに互いの中間状態が見えず、
  -- 「どちらの削除も昇格を起こさないまま両方コミットされ、
  -- アクティブなファシリテーターが 0 になる」という本 issue の状態が再発する。
  PERFORM 1 FROM rooms WHERE id = v_room_id FOR UPDATE;

  SELECT id INTO v_caller_participant_id
  FROM participants
  WHERE room_id = v_room_id AND user_id = auth.uid();

  -- Self-removal is out of scope for this RPC.
  IF v_caller_participant_id = p_participant_id THEN
    RETURN FALSE;
  END IF;

  UPDATE participants
  SET is_active = false
  WHERE id = p_participant_id;

  -- 唯一のファシリテーターが外れたなら、最古参のアクティブな参加者へ移譲する。
  -- 誰も残っていなければ移譲先が無いので何もしない（空のルームになる）。
  IF v_was_facilitator AND NOT EXISTS (
    SELECT 1 FROM participants
    WHERE room_id = v_room_id AND is_active = true AND is_facilitator = true
  ) THEN
    UPDATE participants
    SET is_facilitator = true
    WHERE id = (
      SELECT id FROM participants
      WHERE room_id = v_room_id AND is_active = true
      ORDER BY joined_at ASC, id ASC
      LIMIT 1
    );
  END IF;

  -- Drop the removed participant's votes from any session that has not been
  -- revealed yet, so they stop counting toward the voting progress/average.
  -- Votes in already-revealed sessions are left untouched to preserve history.
  DELETE FROM votes
  WHERE participant_id = p_participant_id
    AND session_id IN (
      SELECT id FROM voting_sessions
      WHERE room_id = v_room_id AND is_revealed = false
    );

  -- Removing a participant can complete the remaining voters' set (they may
  -- have already voted before this participant left), so re-run the
  -- auto-reveal check. Only the room's latest session is considered: the UI
  -- (page.tsx / room-store.ts) only ever reads the newest session, and
  -- resetVoting inserts unconditionally, so older unrevealed sessions can
  -- linger. Revealing those would make ghost rounds with partial votes
  -- appear in the session history (history.ts filters is_revealed = true).
  -- No is_revealed filter here on purpose: if the latest session is already
  -- revealed, auto_reveal_if_complete checks is_revealed/auto_reveal itself
  -- and is a no-op.
  SELECT id INTO v_session_id
  FROM voting_sessions
  WHERE room_id = v_room_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_session_id IS NOT NULL THEN
    PERFORM public.auto_reveal_if_complete(v_session_id);
  END IF;

  RETURN TRUE;
END;
$$;
