-- Realtime broadcast triggers for low-latency updates
-- Bypasses RLS/SECURITY DEFINER issues by broadcasting directly from DB triggers
-- Uses realtime.send() with private=false for reliable delivery

-- A-1: participants trigger
CREATE OR REPLACE FUNCTION public.broadcast_participants_changes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_topic text;
  v_payload jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_topic := 'room:' || OLD.room_id::text;
  ELSE
    v_topic := 'room:' || NEW.room_id::text;
  END IF;

  v_payload := jsonb_build_object(
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'operation', TG_OP,
    'record', CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
    'old_record', CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END
  );

  PERFORM realtime.send(v_payload, TG_OP, v_topic, false);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER broadcast_participants_changes
  AFTER INSERT OR UPDATE OR DELETE ON participants
  FOR EACH ROW EXECUTE FUNCTION public.broadcast_participants_changes();

-- A-2: voting_sessions trigger
CREATE OR REPLACE FUNCTION public.broadcast_voting_sessions_changes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_topic text;
  v_payload jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_topic := 'room:' || OLD.room_id::text;
  ELSE
    v_topic := 'room:' || NEW.room_id::text;
  END IF;

  v_payload := jsonb_build_object(
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'operation', TG_OP,
    'record', CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
    'old_record', CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END
  );

  PERFORM realtime.send(v_payload, TG_OP, v_topic, false);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER broadcast_voting_sessions_changes
  AFTER INSERT OR UPDATE OR DELETE ON voting_sessions
  FOR EACH ROW EXECUTE FUNCTION public.broadcast_voting_sessions_changes();

-- A-3: votes trigger (needs JOIN to get room_id)
CREATE OR REPLACE FUNCTION public.broadcast_votes_changes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room_id uuid;
  v_session_id uuid;
  v_payload jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_session_id := OLD.session_id;
  ELSE
    v_session_id := NEW.session_id;
  END IF;

  SELECT vs.room_id INTO v_room_id
  FROM voting_sessions vs
  WHERE vs.id = v_session_id;

  IF v_room_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  v_payload := jsonb_build_object(
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'operation', TG_OP,
    'record', CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
    'old_record', CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END
  );

  PERFORM realtime.send(v_payload, TG_OP, 'room:' || v_room_id::text, false);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER broadcast_votes_changes
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION public.broadcast_votes_changes();

-- A-4: rooms trigger
CREATE OR REPLACE FUNCTION public.broadcast_rooms_changes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_topic text;
  v_payload jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_topic := 'room:' || OLD.id::text;
  ELSE
    v_topic := 'room:' || NEW.id::text;
  END IF;

  v_payload := jsonb_build_object(
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'operation', TG_OP,
    'record', CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
    'old_record', CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END
  );

  PERFORM realtime.send(v_payload, TG_OP, v_topic, false);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER broadcast_rooms_changes
  AFTER INSERT OR UPDATE OR DELETE ON rooms
  FOR EACH ROW EXECUTE FUNCTION public.broadcast_rooms_changes();
