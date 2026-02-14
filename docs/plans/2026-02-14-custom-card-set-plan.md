# カスタムカードセット Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** ルーム作成時に「カスタム」カードセットを選択し、ユーザーが数値カードを自由に定義できるようにする。

**Architecture:** DB に `custom_cards` カラムを追加し、`card_set='custom'` の場合に配列から読み取る。フロントエンドは `getCardsForRoom()` ヘルパーでプリセット/カスタムを統一的に扱う。

**Tech Stack:** PostgreSQL (マイグレーション), Zod (バリデーション), React (フォーム UI), Zustand (状態管理)

---

### Task 1: DB マイグレーション

**Files:**
- Create: `supabase/migrations/20260214200000_custom_card_set.sql`
- Modify: `src/lib/supabase/types.ts:1-164`

**Step 1: マイグレーションファイル作成**

```sql
-- Add custom_cards column to rooms table
ALTER TABLE rooms ADD COLUMN custom_cards TEXT[] DEFAULT NULL;
```

**Step 2: 型定義を更新**

`src/lib/supabase/types.ts` の rooms テーブルに `custom_cards` を追加:
- `Row`: `custom_cards: string[] | null`
- `Insert`: `custom_cards?: string[] | null`
- `Update`: `custom_cards?: string[] | null`

**Step 3: マイグレーション適用**

Run: `source .env.local && npx supabase db push`
Expected: Migration applied successfully

**Step 4: コミット**

```bash
git add supabase/migrations/20260214200000_custom_card_set.sql src/lib/supabase/types.ts
git commit -m "feat: custom_cards カラムを追加"
```

---

### Task 2: constants.ts にカスタムカードセット対応を追加

**Files:**
- Modify: `src/lib/constants.ts:1-28`

**Step 1: CardSetType に `custom` を追加し、カード取得ヘルパーを作成**

`CARD_SETS` に `custom` エントリを追加（空のカード配列）。`getCardsForRoom()` 関数を新規作成:
- `card_set` が `custom` の場合: `custom_cards` 配列 + `SPECIAL_CARDS` を返す
- それ以外: 既存の `CARD_SETS[cardSet].cards` を返す

```typescript
export const CARD_SETS = {
  fibonacci: { ... },
  tshirt: { ... },
  powerOf2: { ... },
  custom: {
    name: 'カスタム',
    cards: [] as string[],
  },
} as const

export type CardSetType = keyof typeof CARD_SETS

export function getCardsForRoom(cardSet: string, customCards: string[] | null): readonly string[] {
  if (cardSet === 'custom' && customCards && customCards.length > 0) {
    return [...customCards, ...SPECIAL_CARDS]
  }
  const preset = CARD_SETS[cardSet as CardSetType]
  return preset ? preset.cards : CARD_SETS.fibonacci.cards
}
```

**Step 2: コミット**

```bash
git add src/lib/constants.ts
git commit -m "feat: カスタムカードセットの定数とヘルパー関数を追加"
```

---

### Task 3: Server Action のバリデーション更新

**Files:**
- Modify: `src/actions/room.ts:7-19` (createRoomSchema)
- Modify: `src/actions/room.ts:74-84` (insert 部分)
- Modify: `src/actions/room.ts:184-192` (updateRoomSettingsSchema)
- Modify: `src/actions/room.ts:226-233` (update 部分)

**Step 1: createRoomSchema を更新**

`cardSet` に `'custom'` を追加。`customCards` フィールドを追加（カスタム時のみ必須）:

```typescript
const createRoomSchema = z.object({
  name: z.string().min(1, 'ルーム名を入力してください').max(100),
  cardSet: z.enum(['fibonacci', 'tshirt', 'powerOf2', 'custom']),
  customCards: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return null
      return val.split(',').map((s) => s.trim()).filter((s) => s.length > 0)
    }),
  autoReveal: z.boolean().default(false),
  allowAllControl: z.boolean().default(false),
  timerDuration: z
    .union([z.literal(30), z.literal(60), z.literal(120), z.literal(300), z.null()])
    .default(null),
  displayName: z.string().min(1, '表示名を入力してください').max(20),
}).refine(
  (data) => {
    if (data.cardSet !== 'custom') return true
    if (!data.customCards || data.customCards.length < 2) return false
    if (data.customCards.length > 20) return false
    return data.customCards.every((c) => !isNaN(Number(c)))
  },
  { message: 'カスタムカードは2〜20枚の数値をカンマ区切りで入力してください' },
)
```

**Step 2: createRoom の insert に `custom_cards` を追加**

```typescript
.insert({
  code,
  name: parsed.data.name,
  created_by: userId!,
  card_set: parsed.data.cardSet,
  custom_cards: parsed.data.cardSet === 'custom' ? parsed.data.customCards : null,
  auto_reveal: parsed.data.autoReveal,
  timer_duration: parsed.data.timerDuration,
  allow_all_control: parsed.data.allowAllControl,
})
```

**Step 3: updateRoomSettingsSchema も同様に更新**

`cardSet` に `'custom'` を追加、`customCards` フィールド追加、update クエリに `custom_cards` を含める。

**Step 4: formData から `customCards` を読み取り**

`createRoom` 関数内:
```typescript
customCards: formData.get('customCards') as string | undefined,
```

**Step 5: コミット**

```bash
git add src/actions/room.ts
git commit -m "feat: Server Action にカスタムカードセット対応を追加"
```

---

### Task 4: ルーム作成フォーム UI

**Files:**
- Modify: `src/components/room/create-room-form.tsx`

**Step 1: カスタムオプションを追加**

`cardSetOptions` に `{ value: 'custom', label: 'カスタム' }` を追加。

**Step 2: カスタム選択時にテキスト入力を表示**

useState で選択中のカードセットを管理。`custom` 選択時に `<Input name="customCards" placeholder="0.5, 1, 2, 3, 5, 8" />` を表示。カード説明部分はカスタムの場合「数値をカンマ区切りで入力」と表示。

**Step 3: コミット**

```bash
git add src/components/room/create-room-form.tsx
git commit -m "feat: ルーム作成フォームにカスタムカードセットUIを追加"
```

---

### Task 5: ルーム設定ダイアログ UI

**Files:**
- Modify: `src/components/room/room-settings-dialog.tsx`

**Step 1: カスタムオプションとテキスト入力を追加**

Task 4 と同様に `cardSetOptions` にカスタムを追加。`custom` 選択時にカスタムカード入力欄を表示。初期値はストアから `customCards` を読み取る。

**Step 2: handleSave でカスタムカードを送信**

`updateRoomSettings` に `customCards` を渡す。

**Step 3: コミット**

```bash
git add src/components/room/room-settings-dialog.tsx
git commit -m "feat: ルーム設定ダイアログにカスタムカードセット対応を追加"
```

---

### Task 6: Zustand ストアとカード表示の対応

**Files:**
- Modify: `src/stores/room-store.ts` — `customCards` state を追加
- Modify: `src/components/room/voting-cards.tsx` — `getCardsForRoom()` を使用
- Modify: `src/components/room/room-view.tsx` — `customCards` を initialize に渡す

**Step 1: room-store.ts に `customCards` を追加**

- `RoomState` に `customCards: string[] | null` を追加
- `initialize` パラメータに追加
- `handleRooms` で `custom_cards` を反映
- ポーリングの `roomData` select に `custom_cards` を追加

**Step 2: voting-cards.tsx で `getCardsForRoom()` を使用**

```typescript
import { getCardsForRoom } from '@/lib/constants'

const cardSet = useRoomStore((s) => s.cardSet)
const customCards = useRoomStore((s) => s.customCards)
const cards = getCardsForRoom(cardSet, customCards)
```

**Step 3: room-view.tsx の initialize に `customCards` を追加**

`room.custom_cards` を initialize に渡す。

**Step 4: コミット**

```bash
git add src/stores/room-store.ts src/components/room/voting-cards.tsx src/components/room/room-view.tsx
git commit -m "feat: ストアとカード表示のカスタムカードセット対応"
```

---

### Task 7: ビルド確認 & E2E テスト

**Files:**
- Modify: `e2e/room-creation.spec.ts` — カスタムカードセットのテストを追加

**Step 1: ビルド確認**

Run: `pnpm build`
Expected: Build succeeds

**Step 2: 既存テスト確認**

Run: `pnpm test`
Expected: All tests pass

**Step 3: E2E テスト追加**

`e2e/room-creation.spec.ts` にカスタムカードセットのテストを追加:
- カスタムを選択してカード値を入力
- ルーム作成後にカスタムカード + 特殊カードが表示されることを確認

**Step 4: E2E テスト実行**

Run: `pnpm test:e2e`
Expected: All tests pass

**Step 5: コミット**

```bash
git add e2e/room-creation.spec.ts
git commit -m "test: カスタムカードセットのE2Eテストを追加"
```

---

### Task 8: マイグレーション適用 & デプロイ

**Step 1: Supabase Cloud にマイグレーション適用**

Run: `source .env.local && npx supabase db push`

**Step 2: PR 作成**

```bash
git push -u origin feat/custom-card-set
gh pr create --title "feat: カスタムカードセット機能を追加"
```
