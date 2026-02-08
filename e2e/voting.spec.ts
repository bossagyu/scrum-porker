import { test, expect } from '@playwright/test'
import { createRoom, joinRoom } from './helpers'

test.describe('Voting Flow', () => {
  test('should select a card and show voted badge', async ({ page }) => {
    await createRoom(page, 'Voting Test', 'Voter')

    await page.getByRole('button', { name: '5', exact: true }).click()

    await expect(page.getByText('投票済み')).toBeVisible()
  })

  test('should highlight the selected card', async ({ page }) => {
    await createRoom(page, 'Voting Test', 'Voter')

    const card = page.getByRole('button', { name: '3', exact: true })
    await card.click()

    await expect(card).toHaveClass(/bg-primary/)
  })

  test('should reveal votes and show results', async ({ browser }) => {
    const facilitatorContext = await browser.newContext()
    const facilitatorPage = await facilitatorContext.newPage()
    const code = await createRoom(
      facilitatorPage,
      'Reveal Test',
      'Facilitator',
    )

    const joinerContext = await browser.newContext()
    const joinerPage = await joinerContext.newPage()
    await joinRoom(joinerPage, code, 'Joiner')

    // Both vote
    await facilitatorPage
      .getByRole('button', { name: '5', exact: true })
      .click()
    await joinerPage.getByRole('button', { name: '8', exact: true }).click()

    // Wait for votes to register
    await expect(facilitatorPage.getByText('投票済み')).toHaveCount(2, {
      timeout: 10_000,
    })

    // Facilitator reveals
    await facilitatorPage.getByRole('button', { name: '結果を公開' }).click()

    // Results section appears
    await expect(facilitatorPage.getByText('投票結果')).toBeVisible({
      timeout: 10_000,
    })
    await expect(facilitatorPage.getByText('統計')).toBeVisible()

    // Statistics should show
    await expect(facilitatorPage.getByText('平均')).toBeVisible()
    await expect(facilitatorPage.getByText('中央値')).toBeVisible()
    await expect(facilitatorPage.getByText('最頻値')).toBeVisible()

    await facilitatorContext.close()
    await joinerContext.close()
  })

  test('should reset voting for next round', async ({ page }) => {
    await createRoom(page, 'Reset Test', 'Facilitator')

    // Vote on a card
    await page.getByRole('button', { name: '5', exact: true }).click()
    await expect(page.getByText('投票済み')).toBeVisible()

    // Reveal
    await page.getByRole('button', { name: '結果を公開' }).click()
    await expect(page.getByText('投票結果')).toBeVisible({ timeout: 10_000 })

    // Next round
    await page.getByRole('button', { name: '次のラウンド' }).click()

    // Card selection should reset - "投票結果" section disappears
    await expect(page.getByText('投票結果')).not.toBeVisible({
      timeout: 10_000,
    })

    // Should be able to vote again
    await expect(page.getByText('カードを選択')).toBeVisible()
  })

  test('should show voting cards section', async ({ page }) => {
    await createRoom(page, 'Cards Test', 'Voter')

    await expect(page.getByText('カードを選択')).toBeVisible()

    // Fibonacci cards should be displayed
    const expectedCards = [
      '0', '1', '2', '3', '5', '8', '13', '21', '34', '?',
    ]
    for (const card of expectedCards) {
      await expect(
        page.getByRole('button', { name: card, exact: true }),
      ).toBeVisible()
    }
  })
})
