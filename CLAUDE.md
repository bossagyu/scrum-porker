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

- **テスト実行**: コードを変更・追加したら、必ず関連するテスト (`pnpm test` / `pnpm test:e2e`) を実行して通ることを確認する
- **作業範囲**: このリポジトリ (`/Users/kouhei/Program/bossagyu/scrum-porker`) 内のファイルのみ編集すること。リポジトリ外のファイルを変更してはいけない

## Environment Setup

Copy `.env.local.example` to `.env.local`. For local dev, get anon key from `npx supabase status`.
