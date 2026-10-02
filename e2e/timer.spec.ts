import { test, expect } from '@playwright/test'
import { createRoom, joinRoom } from './helpers'

test.describe('Countdown Timer', () => {
  test('should display timer when timerDuration is set', async ({ page }) => {
    await createRoom(page, 'Timer Test', 'Host', { timerDuration: 60 })

    const timer = page.getByRole('timer')
    await expect(timer).toBeVisible({ timeout: 10_000 })
  })

  test('should not display timer when timerDuration is not set', async ({ page }) => {
    await createRoom(page, 'No Timer Test', 'Host')

    await expect(page.getByText('カードを選択')).toBeVisible()
    await expect(page.getByRole('timer')).not.toBeVisible()
  })

  test('should auto-reveal when timer expires', async ({ browser }) => {
    test.setTimeout(60_000)

    const hostContext = await browser.newContext()
    const hostPage = await hostContext.newPage()
    // autoReveal を切らないと、2人が投票を終えた瞬間に auto_reveal_if_complete が
    // 公開してしまい、タイマー満了ではなく投票完了で「投票結果」が出る。
    // それだと revealOnTimerExpiry が一度も呼ばれず、このテストは緑のまま
    // タイマー機能を一切検証しないことになる。
    const code = await createRoom(hostPage, 'Timer Expiry Test', 'Host', {
      timerDuration: 30,
      autoReveal: false,
    })

    const joinerContext = await browser.newContext()
    const joinerPage = await joinerContext.newPage()
    await joinRoom(joinerPage, code, 'Joiner')

    // Both users vote
    await hostPage.getByRole('button', { name: '5', exact: true }).click()
    await joinerPage.getByRole('button', { name: '8', exact: true }).click()

    // Wait for votes to register
    await expect(hostPage.getByText('投票済み', { exact: true })).toHaveCount(2, {
      timeout: 10_000,
    })

    // 全員投票しても公開されず、カウントダウンが動いていること
    await expect(hostPage.getByRole('timer')).toBeVisible()
    await expect(hostPage.getByText('投票結果')).not.toBeVisible()

    // Wait for timer to expire and auto-reveal
    const startedAt = Date.now()
    await expect(hostPage.getByText('投票結果')).toBeVisible({
      timeout: 40_000,
    })
    const waitedMs = Date.now() - startedAt

    // 「投票完了による公開」で通ってしまう回帰を検出する。タイマー満了を
    // 待っていれば、投票完了直後からでも 20 秒以上は経過しているはず。
    expect(waitedMs).toBeGreaterThan(20_000)

    // Statistics should be displayed
    await expect(hostPage.getByText('平均')).toBeVisible()
    await expect(hostPage.getByText('中央値')).toBeVisible()

    await hostContext.close()
    await joinerContext.close()
  })
})
