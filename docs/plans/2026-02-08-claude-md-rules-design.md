# CLAUDE.md Rules セクション改善設計

## 目的

CLAUDE.md の Rules セクションを充実させ、Claude Code がこのプロジェクトで作業する際の行動指針を明確にする。

## 方針

- グローバルルール（`~/.claude/rules/`）と重複しない
- このプロジェクト固有のルールのみ記載する

## 追加したルール

### ワークフロー
- DB スキーマ変更時のマイグレーション + DB リセットフロー
- 手動型定義ファイル (`types.ts`) の同期
- コード変更後のテスト実行必須
- E2E テスト追加時の全テスト通過確認

### 禁止事項
- リポジトリ外のファイル変更禁止
- `supabase gen types` 自動生成禁止（手動管理と競合）
- RLS 自己参照禁止（SECURITY DEFINER 経由必須）
- Server Action の `redirect()` 禁止（Cookie 消失問題）
- Realtime 単独依存禁止（ポーリング併用必須）

### Git
- `main` から最新取得後に feature ブランチ作成
- `main` 直接コミット禁止
- Conventional Commits 形式
- マイグレーションファイル命名規則
- シークレットのコミット禁止
- 実装完了後の PR 作成

### テスト
- Playwright カードボタンの `exact: true` 必須
- マルチユーザーテストは `browser.newContext()` 使用
- ヘルパー関数は `e2e/helpers.ts` に集約
