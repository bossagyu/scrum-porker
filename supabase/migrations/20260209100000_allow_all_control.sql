-- Add allow_all_control column
ALTER TABLE rooms ADD COLUMN allow_all_control boolean NOT NULL DEFAULT false;

-- Helper: get room IDs where the current user can control (facilitator OR allow_all_control=true)
CREATE OR REPLACE FUNCTION public.get_my_controllable_room_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT p.room_id
  FROM participants p
  JOIN rooms r ON r.id = p.room_id
  WHERE p.user_id = auth.uid()
    AND p.is_active = true
    AND (p.is_facilitator = true OR r.allow_all_control = true);
$$;

-- Fix C1: Update voting_sessions UPDATE policy to allow participants when allow_all_control=true
DROP POLICY IF EXISTS "Facilitator can update sessions" ON voting_sessions;
CREATE POLICY "Controller can update sessions" ON voting_sessions
  FOR UPDATE USING (room_id IN (SELECT public.get_my_controllable_room_ids()));

-- Fix H1: Update rooms UPDATE policy to allow facilitators (not just creator)
DROP POLICY IF EXISTS "Room creator can update" ON rooms;
CREATE POLICY "Facilitator can update room" ON rooms
  FOR UPDATE USING (
    id IN (SELECT public.get_my_facilitator_room_ids())
    OR created_by = auth.uid()
  );
