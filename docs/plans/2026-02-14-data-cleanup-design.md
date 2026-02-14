# データクリーンアップ設計

## 課題

ルーム・参加者・投票データと匿名ユーザーが蓄積され続け、削除する仕組みがない。

## 設計

### 1. ルームデータの自動削除（pg_cron）

- `rooms.expires_at` のデフォルトを 24時間 → **7日間**に変更
- `pg_cron` で**毎日 UTC 0:00** に `expires_at < NOW()` のルームを DELETE
- `ON DELETE CASCADE` により participants, voting_sessions, votes も連鎖削除

### 2. 匿名ユーザーの自動削除（pg_cron）

- `pg_cron` で**毎日 UTC 0:05** に作成から30日以上経過した匿名ユーザーを DELETE
- `auth.users` の `is_anonymous` と `created_at` で判定

## 変更内容

| 対象 | 変更 |
|------|------|
| `20260214000000_data_cleanup.sql` | pg_cron 有効化 + `expires_at` デフォルト7日 + ルーム削除ジョブ |
| `20260214100000_cleanup_anonymous_users.sql` | 匿名ユーザー削除ジョブ |
