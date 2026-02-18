import { test, expect } from '@playwright/test'
import { createRoom, joinRoom } from './helpers'

test.describe('Auto Reveal', () => {
  test('should auto-reveal when sole participant votes with auto-reveal enabled', async ({
    page,
  }) => {
    await createRoom(page, 'Auto Reveal Solo', 'Facilitator', {
      autoReveal: true,
    })

    // Vote
    await page.getByRole('button', { name: '5', exact: true }).click()

    // Results should appear automatically without clicking "結果を公開"
    await expect(page.getByText('投票結果')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('統計')).toBeVisible()
  })

  test('should auto-reveal when all participants vote with auto-reveal enabled', async ({
    browser,
  }) => {
    const facilitatorContext = await browser.newContext()
    const facilitatorPage = await facilitatorContext.newPage()
    const code = await createRoom(
      facilitatorPage,
      'Auto Reveal Multi',
      'Facilitator',
      { autoReveal: true },
    )

    const joinerContext = await browser.newContext()
    const joinerPage = await joinerContext.newPage()
    await joinRoom(joinerPage, code, 'Joiner')

    // First user votes - should NOT reveal yet
    await facilitatorPage
      .getByRole('button', { name: '5', exact: true })
      .click()
    await facilitatorPage.waitForTimeout(4000)
    await expect(facilitatorPage.getByText('投票結果')).not.toBeVisible()

    // Second user votes - should auto-reveal
    await joinerPage.getByRole('button', { name: '8', exact: true }).click()

    // Results should appear on both pages
    await expect(facilitatorPage.getByText('投票結果')).toBeVisible({
      timeout: 10_000,
    })
    await expect(joinerPage.getByText('投票結果')).toBeVisible({
      timeout: 10_000,
    })

    await facilitatorContext.close()
    await joinerContext.close()
  })

  test('should NOT auto-reveal when auto-reveal is disabled', async ({
    page,
  }) => {
    await createRoom(page, 'No Auto Reveal', 'Facilitator', {
      autoReveal: false,
    })

    // Vote
    await page.getByRole('button', { name: '5', exact: true }).click()
    await expect(page.getByText('投票済み', { exact: true })).toBeVisible()

    // Wait and confirm results do NOT appear
    await page.waitForTimeout(5000)
    await expect(page.getByText('投票結果')).not.toBeVisible()
  })
})
