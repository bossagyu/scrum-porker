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
  -- have already voted before this participant left). Re-run the auto-reveal
  -- check for every unrevealed session in the room so the room doesn't get
  -- stuck showing "N/N voted" with no one left to trigger a reveal.
  -- auto_reveal_if_complete is idempotent (it checks is_revealed/auto_reveal
  -- itself), so looping over all unrevealed sessions is safe.
  FOR v_session_id IN
    SELECT id FROM voting_sessions
    WHERE room_id = v_room_id AND is_revealed = false
  LOOP
    PERFORM public.auto_reveal_if_complete(v_session_id);
  END LOOP;

  RETURN TRUE;
END;
$$;
