-- Add timer_duration to rooms (null = no timer, value in seconds)
ALTER TABLE rooms ADD COLUMN timer_duration INTEGER DEFAULT NULL;

-- Add CHECK constraint for allowed timer values
ALTER TABLE rooms ADD CONSTRAINT rooms_timer_duration_check
  CHECK (timer_duration IS NULL OR timer_duration IN (30, 60, 120, 300));

-- SECURITY DEFINER function to reveal votes when timer expires
-- Idempotent: only sets is_revealed = true if timer has expired
CREATE OR REPLACE FUNCTION reveal_on_timer_expiry(p_session_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_created_at TIMESTAMPTZ;
  v_timer_duration INTEGER;
  v_is_revealed BOOLEAN;
BEGIN
  -- Get session info and room timer_duration
  SELECT vs.created_at, r.timer_duration, vs.is_revealed
  INTO v_session_created_at, v_timer_duration, v_is_revealed
  FROM voting_sessions vs
  JOIN rooms r ON r.id = vs.room_id
  WHERE vs.id = p_session_id;

  -- If session not found, no timer, or already revealed, return false
  IF v_session_created_at IS NULL OR v_timer_duration IS NULL OR v_is_revealed THEN
    RETURN FALSE;
  END IF;

  -- Check if timer has expired
  IF NOW() >= v_session_created_at + (v_timer_duration || ' seconds')::INTERVAL THEN
    UPDATE voting_sessions SET is_revealed = TRUE WHERE id = p_session_id;
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;
