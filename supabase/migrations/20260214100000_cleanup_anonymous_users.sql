-- Schedule daily cleanup of anonymous users older than 30 days at UTC 0:05
SELECT cron.schedule(
  'cleanup-anonymous-users',
  '5 0 * * *',
  $$DELETE FROM auth.users WHERE is_anonymous IS TRUE AND created_at < NOW() - INTERVAL '30 days'$$
);
