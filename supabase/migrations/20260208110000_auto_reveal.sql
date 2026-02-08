-- Auto-reveal: when all non-observer participants have voted and the room
-- has auto_reveal enabled, automatically set is_revealed = true.
-- Uses SECURITY DEFINER so any participant can trigger the reveal,
-- not just the facilitator.

CREATE OR REPLACE FUNCTION public.auto_reveal_if_complete(p_session_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room_id UUID;
  v_auto_reveal BOOLEAN;
  v_is_revealed BOOLEAN;
  v_voter_count INT;
  v_vote_count INT;
BEGIN
  -- Get room info from the session
  SELECT vs.room_id, r.auto_reveal, vs.is_revealed
  INTO v_room_id, v_auto_reveal, v_is_revealed
  FROM voting_sessions vs
  JOIN rooms r ON r.id = vs.room_id
  WHERE vs.id = p_session_id;

  -- Skip if not found, already revealed, or auto_reveal disabled
  IF v_room_id IS NULL OR v_is_revealed OR NOT v_auto_reveal THEN
    RETURN FALSE;
  END IF;

  -- Count active non-observer participants
  SELECT COUNT(*)
  INTO v_voter_count
  FROM participants
  WHERE room_id = v_room_id
    AND is_active = true
    AND is_observer = false;

  -- Count votes for this session
  SELECT COUNT(*)
  INTO v_vote_count
  FROM votes
  WHERE session_id = p_session_id;

  -- If all voters have voted, reveal
  IF v_voter_count > 0 AND v_vote_count >= v_voter_count THEN
    UPDATE voting_sessions
    SET is_revealed = true
    WHERE id = p_session_id;
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;
