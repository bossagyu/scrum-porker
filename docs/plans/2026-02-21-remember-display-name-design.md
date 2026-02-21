# 表示名の自動入力（localStorage 記憶）設計

## 概要

ルーム作成・参加時に入力した表示名を localStorage に保存し、次回アクセス時にフォームへ自動入力する。複数回利用した場合は最後に成功した名前が使われる。

## 動作仕様

- **保存タイミング**: ルーム作成/参加が成功しリダイレクトする直前
- **読み込みタイミング**: フォームマウント時に `useEffect` で localStorage から読み込み、input の `defaultValue` に設定
- **localStorage キー**: `scrum-poker-display-name`
- **上書きルール**: 常に最新の成功した表示名で上書き

## 変更対象ファイル

| ファイル | 変更内容 |
|---|---|
| `src/lib/constants.ts` | `DISPLAY_NAME_STORAGE_KEY` 定数を追加 |
| `src/components/room/create-room-form.tsx` | `useEffect` で初期値読み込み + リダイレクト前に保存 |
| `src/components/room/join-room-form.tsx` | `useEffect` で初期値読み込み + リダイレクト前に保存 |

## 実装方針

### 定数

```typescript
export const DISPLAY_NAME_STORAGE_KEY = 'scrum-poker-display-name'
```

### 読み込み（両フォーム共通パターン）

```typescript
const [displayNameDefault, setDisplayNameDefault] = useState('')

useEffect(() => {
  const saved = localStorage.getItem(DISPLAY_NAME_STORAGE_KEY)
  if (saved) setDisplayNameDefault(saved)
}, [])
```

Input に `defaultValue` ではなく `value`/`onChange` で制御するか、`key` を使って再レンダリングさせる。

### 保存（リダイレクト成功時）

既存の `useEffect` でリダイレクトを行っている箇所に保存処理を追加:

```typescript
useEffect(() => {
  if (state.redirectTo) {
    const form = document.querySelector('form')
    const displayName = new FormData(form!).get('displayName') as string
    if (displayName) {
      localStorage.setItem(DISPLAY_NAME_STORAGE_KEY, displayName)
    }
    window.location.href = state.redirectTo
  }
}, [state.redirectTo])
```

## 注意点

- SSR で `localStorage` にアクセスしないよう `useEffect` 内で読み込む
- 両フォームは `'use client'` コンポーネントなので `useEffect` が使える
- `defaultValue` は初回レンダリング時のみ反映されるため、`useEffect` で読み込んだ値を反映するには state + `value` 制御が必要
