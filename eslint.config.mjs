// eslint-config-next 16 は flat config を直接 export する。
// FlatCompat.extends() で包むと、既に flat なオブジェクト（プラグインの
// 自己参照を含む）を JSON 化しようとして
// "TypeError: Converting circular structure to JSON" で落ちる。
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
// typescript 側は必須。core-web-vitals だけだと @typescript-eslint/* が 0 件で、
// no-explicit-any / no-unused-vars / ban-ts-comment など 20 ルールが入らない
// （core-web-vitals が内部に持つ next/typescript はパーサ設定のみ）。
import nextTypescript from 'eslint-config-next/typescript'

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'next-env.d.ts',
      // Claude Code のエージェント worktree（リポジトリ内に作られるが git 管理外）
      '.claude/worktrees/**',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
]

export default eslintConfig
