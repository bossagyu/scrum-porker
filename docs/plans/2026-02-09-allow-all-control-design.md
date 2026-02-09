# 全員操作可能設定 + ルーム設定変更

## 概要

- ルーム作成時に「全員が結果の公開・次のラウンドを操作可能」設定を追加
- ファシリテーターがルーム内で設定を変更できるダイアログを追加

## データモデル

`rooms` テーブルに `allow_all_control boolean NOT NULL DEFAULT false` を追加。

## 変更一覧

### 新規 (2)
- `supabase/migrations/20260209100000_allow_all_control.sql`
- `src/components/room/room-settings-dialog.tsx`

### 変更 (7)
- `src/lib/supabase/types.ts` — Row/Insert/Update に `allow_all_control`
- `src/actions/room.ts` — createRoom 変更 + `updateRoomSettings` 追加
- `src/components/room/create-room-form.tsx` — チェックボックス追加
- `src/components/room/room-header.tsx` — 設定ボタン + 権限条件変更
- `src/components/room/room-view.tsx` — allowAllControl 伝搬
- `src/stores/room-store.ts` — allowAllControl 状態追加
- `src/app/room/[code]/page.tsx` — room.allow_all_control を渡す
