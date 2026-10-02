-- Logical removal of a participant by anyone with room control rights.
-- Does not touch RLS policies: writes go through this SECURITY DEFINER RPC only,
-- so the participants UPDATE policy ("Participants can update self") does not
-- need to be relaxed to let a controller write another participant's row.

CREATE OR REPLACE FUNCTION public.remove_participant(p_participant_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room_id UUID;
  v_caller_participant_id UUID;
  v_session_id UUID;
BEGIN
  SELECT room_id INTO v_room_id
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
