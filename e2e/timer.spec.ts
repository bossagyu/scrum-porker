import { test, expect } from '@playwright/test'
import { createRoom, joinRoom } from './helpers'

test.describe('Countdown Timer', () => {
  test('should display timer when timerDuration is set', async ({ page }) => {
    await createRoom(page, 'Timer Test', 'Host', { timerDuration: 60 })

    const timer = page.getByRole('timer')
    await expect(timer).toBeVisible({ timeout: 10_000 })
  })

  test('should not display timer when timerDuration is not set', async ({
    page,
  }) => {
    await createRoom(page, 'No Timer Test', 'Host')

    await expect(page.getByText('カードを選択')).toBeVisible()
    await expect(page.getByRole('timer')).not.toBeVisible()
  })

  test('should auto-reveal when timer expires', async ({ browser }) => {
    test.setTimeout(60_000)

    const hostContext = await browser.newContext()
    const hostPage = await hostContext.newPage()
    const code = await createRoom(hostPage, 'Timer Expiry Test', 'Host', {
      timerDuration: 30,
    })

    const joinerContext = await browser.newContext()
    const joinerPage = await joinerContext.newPage()
    await joinRoom(joinerPage, code, 'Joiner')

    // Both users vote
    await hostPage.getByRole('button', { name: '5', exact: true }).click()
    await joinerPage.getByRole('button', { name: '8', exact: true }).click()

    // Wait for votes to register
    await expect(hostPage.getByText('投票済み')).toHaveCount(2, {
      timeout: 10_000,
    })

    // Wait for timer to expire and auto-reveal
    await expect(hostPage.getByText('投票結果')).toBeVisible({
      timeout: 40_000,
    })

    // Statistics should be displayed
    await expect(hostPage.getByText('平均')).toBeVisible()
    await expect(hostPage.getByText('中央値')).toBeVisible()

    await hostContext.close()
    await joinerContext.close()
  })
})
