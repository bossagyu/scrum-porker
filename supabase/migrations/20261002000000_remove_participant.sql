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
BEGIN
  SELECT room_id INTO v_room_id
  FROM participants
  WHERE id = p_participant_id;

  IF v_room_id IS NULL THEN
    RETURN FALSE;
  END IF;

  IF v_room_id NOT IN (SELECT public.get_my_controllable_room_ids()) THEN
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

  RETURN TRUE;
END;
$$;
