import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Next.js 16.3 以降、`next dev` がリポジトリルートに AGENTS.md（AI エージェント
  // 向けルール）を生成する。生成されるのは AI エージェント経由で起動したときだけ
  // （CLAUDECODE / CURSOR_TRACE_ID / CODEX_* 等の env で判定）だが、このリポジトリは
  // エージェント駆動なので実質毎回。untracked のまま残すと worktree が汚れ続け、
  // `git add -A` で誤ってコミットされる。
  //
  // false にすると生成しないうえ、既存の管理ブロックを除去する（16.4 以降）。
  // 除去対象は AGENTS.md 内の `<!-- BEGIN:nextjs-agent-rules -->` ブロックのみで、
  // 手書きの内容は保全され、残りが空になったときだけファイルが削除される。
  // CLAUDE.md には一切触らない。
  // 詳細: node_modules/next/dist/docs 配下の next-config-js/agentRules.md
  agentRules: false,
}

export default nextConfig
