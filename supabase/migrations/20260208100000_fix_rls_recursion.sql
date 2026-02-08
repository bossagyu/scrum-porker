-- Fix infinite recursion in RLS policies
-- The participants SELECT policy references itself, causing recursion.
-- Solution: use SECURITY DEFINER functions that bypass RLS.

-- Helper: get room IDs where the current user is a participant
CREATE OR REPLACE FUNCTION public.get_my_room_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT room_id FROM participants WHERE user_id = auth.uid();
$$;

-- Helper: get participant IDs for the current user
CREATE OR REPLACE FUNCTION public.get_my_participant_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id FROM participants WHERE user_id = auth.uid();
$$;

-- Helper: get room IDs where the current user is a facilitator
CREATE OR REPLACE FUNCTION public.get_my_facilitator_room_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT room_id FROM participants WHERE user_id = auth.uid() AND is_facilitator = true;
$$;

-- Drop old recursive policies
DROP POLICY IF EXISTS "Room participants can view" ON participants;
DROP POLICY IF EXISTS "Room participants can view sessions" ON voting_sessions;
DROP POLICY IF EXISTS "Facilitator can update sessions" ON voting_sessions;
DROP POLICY IF EXISTS "Room participants can view votes" ON votes;
DROP POLICY IF EXISTS "Voters can update own votes" ON votes;
DROP POLICY IF EXISTS "Voters can delete own votes" ON votes;

-- Recreated policies using helper functions (no recursion)
CREATE POLICY "Room participants can view" ON participants
  FOR SELECT USING (room_id IN (SELECT public.get_my_room_ids()));

CREATE POLICY "Room participants can view sessions" ON voting_sessions
  FOR SELECT USING (room_id IN (SELECT public.get_my_room_ids()));

CREATE POLICY "Facilitator can update sessions" ON voting_sessions
  FOR UPDATE USING (room_id IN (SELECT public.get_my_facilitator_room_ids()));

CREATE POLICY "Room participants can view votes" ON votes
  FOR SELECT USING (
    session_id IN (
      SELECT vs.id FROM voting_sessions vs
      WHERE vs.room_id IN (SELECT public.get_my_room_ids())
    )
  );

CREATE POLICY "Voters can update own votes" ON votes
  FOR UPDATE USING (
    participant_id IN (SELECT public.get_my_participant_ids())
  );

CREATE POLICY "Voters can delete own votes" ON votes
  FOR DELETE USING (
    participant_id IN (SELECT public.get_my_participant_ids())
  );
