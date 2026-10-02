import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // node_modules/** はトップレベルにしか一致しない。エージェントの worktree
    // （.claude/worktrees/*/node_modules）配下のテストまで収集してしまい、
    // 実際に 1 万件超のライブラリのテストを拾って失敗した。
    exclude: ['e2e/**', '**/node_modules/**', '.claude/**'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
