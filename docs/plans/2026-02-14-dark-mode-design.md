# Dark Mode Design

## Goal

ライト/ダーク/システム連動の3モードテーマ切替をアプリに追加する。

## Requirements

- OS のダークモード設定を自動検知（system モード）
- ユーザーが手動で ライト/ダーク/システム を選択可能
- 選択は localStorage に永続化
- FOUC（Flash of Unstyled Content）なし
- ヘッダー右側に切替ボタン配置（言語ボタンの横）

## Approach

**next-themes** ライブラリを採用。

理由:
- Tailwind CSS + shadcn/ui との親和性が高い
- FOUC 防止が組み込み
- 軽量（~2KB）
- globals.css に既にダークモード CSS 変数（`.dark { ... }`）定義済み

## Architecture

### New Files

- `src/components/layout/theme-provider.tsx` — next-themes ThemeProvider ラッパー
- `src/components/layout/theme-toggle.tsx` — テーマ切替ドロップダウンボタン

### Modified Files

- `src/app/layout.tsx` — ThemeProvider でラップ、`suppressHydrationWarning` を `<html>` に追加
- `src/components/layout/header.tsx` — ThemeToggle を配置

### Theme Toggle UI

- shadcn/ui の DropdownMenu を使用
- Sun/Moon アイコン表示（lucide-react）
- 3つの選択肢: ライト / ダーク / システム
- 現在のテーマにチェックマーク

### CSS

追加変更なし。既存の globals.css `.dark { ... }` CSS 変数と Tailwind の `@custom-variant dark` がそのまま動作する。

### Existing Component Impact

shadcn/ui コンポーネントは CSS 変数ベースのため、個別修正不要。テーマ切替で自動的に色が切り替わる。
