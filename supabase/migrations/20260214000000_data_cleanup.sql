-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Change default expires_at from 24 hours to 7 days
ALTER TABLE rooms ALTER COLUMN expires_at SET DEFAULT NOW() + INTERVAL '7 days';

-- Schedule daily cleanup of expired rooms at UTC 0:00
-- ON DELETE CASCADE will remove participants, voting_sessions, and votes
SELECT cron.schedule(
  'cleanup-expired-rooms',
  '0 0 * * *',
  $$DELETE FROM public.rooms WHERE expires_at < NOW()$$
);
