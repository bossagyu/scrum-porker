# 表示名の自動入力 実装計画

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** ルーム作成・参加時の表示名を localStorage に保存し、次回アクセス時にフォームへ自動入力する

**Architecture:** localStorage にキー `scrum-poker-display-name` で保存。フォームマウント時に `useEffect` で読み込み、リダイレクト成功時に保存。両フォームで同じキーを共有し、最後に成功した名前が優先される

**Tech Stack:** Next.js 16, React 19, localStorage

---

### Task 1: localStorage キー定数の追加

**Files:**
- Modify: `src/lib/constants.ts:47`
- Test: `src/lib/__tests__/constants.test.ts`

**Step 1: 定数を追加**

`src/lib/constants.ts` の末尾に追加:

```typescript
// localStorage key for remembering display name
export const DISPLAY_NAME_STORAGE_KEY = 'scrum-poker-display-name'
```

**Step 2: ユニットテスト実行**

Run: `pnpm test`
Expected: 全テスト通過（既存テストに影響なし）

**Step 3: コミット**

```bash
git add src/lib/constants.ts
git commit -m "feat: 表示名記憶用の localStorage キー定数を追加"
```

---

### Task 2: CreateRoomForm に表示名の読み込み・保存を追加

**Files:**
- Modify: `src/components/room/create-room-form.tsx:3,9,17-19,50-54,76-82`

**Step 1: import に定数を追加**

`src/components/room/create-room-form.tsx` 9行目を変更:

```typescript
// Before
import { CARD_SETS, type CardSetType, TIMER_OPTIONS } from '@/lib/constants'
// After
import { CARD_SETS, type CardSetType, DISPLAY_NAME_STORAGE_KEY, TIMER_OPTIONS } from '@/lib/constants'
```

**Step 2: 表示名の state と useEffect を追加**

`const [customCardsError, ...]` の後（19行目の後）に追加:

```typescript
const [savedDisplayName, setSavedDisplayName] = useState('')

useEffect(() => {
  const saved = localStorage.getItem(DISPLAY_NAME_STORAGE_KEY)
  if (saved) setSavedDisplayName(saved)
}, [])
```

**Step 3: リダイレクト時に表示名を保存**

既存の `useEffect`（50-54行目）を変更:

```typescript
// Before
useEffect(() => {
  if (state.redirectTo) {
    window.location.href = state.redirectTo
  }
}, [state.redirectTo])

// After
useEffect(() => {
  if (state.redirectTo) {
    const form = document.querySelector<HTMLFormElement>('#create-room-form')
    if (form) {
      const displayName = new FormData(form).get('displayName') as string
      if (displayName) {
        localStorage.setItem(DISPLAY_NAME_STORAGE_KEY, displayName)
      }
    }
    window.location.href = state.redirectTo
  }
}, [state.redirectTo])
```

**Step 4: フォームに id を追加し、Input に defaultValue を設定**

form タグに id を追加:

```tsx
// Before
<form action={formAction} className="space-y-4">
// After
<form id="create-room-form" action={formAction} className="space-y-4">
```

displayName の Input を変更:

```tsx
// Before
<Input
  id="displayName"
  name="displayName"
  placeholder={t('createRoom.displayNamePlaceholder')}
  required
  maxLength={20}
/>
// After
<Input
  id="displayName"
  name="displayName"
  placeholder={t('createRoom.displayNamePlaceholder')}
  required
  maxLength={20}
  defaultValue={savedDisplayName}
  key={savedDisplayName}
/>
```

`key={savedDisplayName}` により、`useEffect` で値が読み込まれた際に Input が再マウントされ `defaultValue` が反映される。

**Step 5: ビルド確認**

Run: `pnpm build`
Expected: 成功

**Step 6: コミット**

```bash
git add src/components/room/create-room-form.tsx
git commit -m "feat: ルーム作成フォームに表示名の記憶機能を追加"
```

---

### Task 3: JoinRoomForm に表示名の読み込み・保存を追加

**Files:**
- Modify: `src/components/room/join-room-form.tsx:2,9,21,23-27,57-63`

**Step 1: import に定数を追加**

`src/components/room/join-room-form.tsx` 9行目の後に追加:

```typescript
import { DISPLAY_NAME_STORAGE_KEY } from '@/lib/constants'
```

**Step 2: 表示名の state と useEffect を追加**

`const [roomCodeValue, ...]`（21行目）の後に追加:

```typescript
const [savedDisplayName, setSavedDisplayName] = useState('')

useEffect(() => {
  const saved = localStorage.getItem(DISPLAY_NAME_STORAGE_KEY)
  if (saved) setSavedDisplayName(saved)
}, [])
```

**Step 3: リダイレクト時に表示名を保存**

既存の `useEffect`（23-27行目）を変更:

```typescript
// Before
useEffect(() => {
  if (state.redirectTo) {
    window.location.href = state.redirectTo
  }
}, [state.redirectTo])

// After
useEffect(() => {
  if (state.redirectTo) {
    const form = document.querySelector<HTMLFormElement>('#join-room-form')
    if (form) {
      const displayName = new FormData(form).get('displayName') as string
      if (displayName) {
        localStorage.setItem(DISPLAY_NAME_STORAGE_KEY, displayName)
      }
    }
    window.location.href = state.redirectTo
  }
}, [state.redirectTo])
```

**Step 4: フォームに id を追加し、Input に defaultValue を設定**

form タグに id を追加:

```tsx
// Before
<form action={formAction} className="space-y-4">
// After
<form id="join-room-form" action={formAction} className="space-y-4">
```

displayName の Input を変更:

```tsx
// Before
<Input
  id="joinDisplayName"
  name="displayName"
  placeholder={t('joinRoom.displayNamePlaceholder')}
  required
  maxLength={20}
/>
// After
<Input
  id="joinDisplayName"
  name="displayName"
  placeholder={t('joinRoom.displayNamePlaceholder')}
  required
  maxLength={20}
  defaultValue={savedDisplayName}
  key={savedDisplayName}
/>
```

**Step 5: ビルド確認**

Run: `pnpm build`
Expected: 成功

**Step 6: コミット**

```bash
git add src/components/room/join-room-form.tsx
git commit -m "feat: ルーム参加フォームに表示名の記憶機能を追加"
```

---

### Task 4: E2E テストで動作確認

**Files:**
- Test: `e2e/` (既存テスト)

**Step 1: ユニットテスト実行**

Run: `pnpm test`
Expected: 全テスト通過

**Step 2: E2E テスト実行**

Run: `pnpm test:e2e`
Expected: 全テスト通過（既存テストは表示名を毎回入力するため影響なし）

**Step 3: コミット（テストに変更がある場合のみ）**

変更なければスキップ。
