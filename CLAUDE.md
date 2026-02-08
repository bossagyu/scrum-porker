# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev                    # Start dev server (Turbopack, port 3000)
npx supabase start          # Start local Supabase Docker (required first)
npx supabase db reset       # Reset DB and re-run all migrations

# Testing
pnpm test                   # Vitest unit tests (single run)
pnpm test:watch             # Vitest watch mode
pnpm test:e2e               # Playwright E2E tests (starts dev server automatically)
pnpm test:e2e:ui            # Playwright UI mode
npx playwright test e2e/voting.spec.ts              # Run single E2E file
npx playwright test --grep "should select a card"   # Run single E2E test by name

# Build & Lint
pnpm build                  # Production build
pnpm lint                   # ESLint
pnpm format                 # Prettier (src/)
```

## Architecture

Scrum Poker real-time estimation app: Next.js 16 App Router + Supabase + Zustand.

### Data Flow

1. **Server Actions** (`src/actions/`) handle mutations (create room, join, vote, reveal, reset)
2. **Zustand store** (`src/stores/room-store.ts`) holds client-side state, subscribes to Supabase Realtime + 3s polling fallback
3. **Server components** (`src/app/room/[code]/page.tsx`) fetch initial data, pass to client `RoomView`

### Key Patterns

- **Auth**: Anonymous Supabase auth. Server Action `redirect()` doesn't persist auth cookies, so actions return `{ redirectTo }` and forms use `window.location.href`
- **Realtime**: Supabase Realtime subscriptions are broken by SECURITY DEFINER RLS functions, so the store also polls every 3 seconds as fallback
- **Optimistic updates**: Votes use `optimistic-` ID prefix in Zustand, reconciled when real data arrives from polling/Realtime
- **DB types**: Manually maintained in `src/lib/supabase/types.ts` (not auto-generated). Must include `Relationships: []` for proper `.select().single()` inference
- **RLS**: Uses `SECURITY DEFINER` helper functions (`get_my_room_ids()`, etc.) to avoid infinite recursion in self-referencing policies

### Route Structure

- `/` — Home page: create room form + join room form
- `/room/[code]` — Room view (redirects to `/room/[code]/join` if user not a participant)
- `/room/[code]/join` — Join page for existing room

### Database Tables

`rooms` → `participants` → `voting_sessions` → `votes`. All with RLS. Realtime enabled on participants, voting_sessions, votes.

## Conventions

- **Formatting**: Prettier — no semicolons, single quotes, trailing commas, 100 char width
- **Immutability**: Always create new objects, never mutate state
- **UI text**: All user-facing strings in Japanese
- **Card sets**: fibonacci, tshirt, powerOf2. Special cards (`?`, `∞`, `☕`) excluded from statistics
- **Room codes**: 6 uppercase alphanumeric, excludes ambiguous chars (I, O, 0, 1)
- **Page params**: Next.js 16 uses `Promise<{ code: string }>` (async params)
- **Components**: shadcn/ui (new-york style) via `radix-ui` package
- **React 19**: `useActionState` is from `react`, not `react-dom`
- **Playwright selectors**: Always use `exact: true` for card buttons (e.g., `{ name: '3', exact: true }`) to avoid matching '13', '34'

## Rules

### ワークフロー
- DB スキーマを変更したら `supabase/migrations/` に新しいマイグレーションファイルを作成し、`npx supabase db reset` で適用する
- `src/lib/supabase/types.ts` は手動管理。テーブルやRPC関数を追加・変更したら必ずこのファイルも更新する
- コードを変更・追加したら、必ず関連するテスト (`pnpm test` / `pnpm test:e2e`) を実行して通ることを確認する
- E2E テストを追加したら `pnpm test:e2e` で既存テストを含め全テスト通過を確認する

### 禁止事項
- このリポジトリ外のファイルを変更してはいけない
- `npx supabase gen types` で型を自動生成しない（手動管理の `types.ts` と競合する）
- RLS ポリシーでテーブル自身を参照しない（無限再帰になる）。必ず `SECURITY DEFINER` 関数を経由する
- Server Action 内で `redirect()` を使わない（匿名認証のCookieが消える）。`{ redirectTo }` を返してクライアント側で `window.location.href` を使う
- Supabase Realtime だけに依存しない（SECURITY DEFINER ポリシーでイベントが配信されない）。ポーリングを併用する

### Git
- 実装を始める前に `git pull origin main` で最新を取得し、`main` から feature ブランチを作成する（例: `feat/timer`, `fix/auto-reveal-bug`）
- `main` に直接コミットしない
- コミットメッセージは Conventional Commits 形式: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`
- マイグレーションファイル名は `YYYYMMDDHHMMSS_<description>.sql` 形式
- `.env.local` や Supabase のシークレットをコミットしない
- 実装完了後は GitHub に PR を作成する

### テスト
- Playwright でカードボタンを指定する際は必ず `exact: true` を使う（例: `{ name: '3', exact: true }`）。省略すると '13', '34' 等にもマッチする
- マルチユーザーテストは `browser.newContext()` で別のブラウザコンテキストを作成し、ユーザーごとに独立した認証セッションを使う
- E2E テストのヘルパー関数は `e2e/helpers.ts` に集約する

## Environment Setup

Copy `.env.local.example` to `.env.local`. For local dev, get anon key from `npx supabase status`.
