import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Next.js 16.4 以降、`next dev` がリポジトリルートに AGENTS.md（AI エージェント
  // 向けルール）を自動生成し、起動のたびに書き戻す。untracked のまま残ると
  // 全開発者の worktree が恒久的に汚れ、`git add -A` で誤ってコミットされる。
  // false にすると生成しないだけでなく既存ファイルも削除される
  // （next/dist/server/lib/app-info-log.js の syncAgentRulesForDev が
  //   falsy のとき removeAgentRulesFiles を呼ぶ）。
  agentRules: false,
}

export default nextConfig
