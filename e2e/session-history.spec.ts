import { test, expect } from '@playwright/test'
import { createRoom, joinRoom } from './helpers'

test.describe('Session History', () => {
  test('should show empty history message when no rounds completed', async ({
    page,
  }) => {
    await createRoom(page, 'History Empty Test', 'Host')

    // Click history button
    await page.getByRole('button', { name: '履歴' }).click()

    // Session history panel should appear with empty message
    await expect(page.getByText('セッション履歴')).toBeVisible()
    await expect(
      page.getByText('まだ公開済みのラウンドはありません'),
    ).toBeVisible()

    // Export buttons should NOT be visible when no history
    await expect(
      page.getByRole('button', { name: 'CSV' }),
    ).not.toBeVisible()
    await expect(
      page.getByRole('button', { name: 'JSON' }),
    ).not.toBeVisible()
  })

  test('should show round history after voting and revealing', async ({
    browser,
  }) => {
    const facilitatorContext = await browser.newContext()
    const facilitatorPage = await facilitatorContext.newPage()
    const code = await createRoom(
      facilitatorPage,
      'History Round Test',
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

    // Reveal votes
    await facilitatorPage.getByRole('button', { name: '結果を公開' }).click()
    await expect(facilitatorPage.getByText('投票結果')).toBeVisible({
      timeout: 10_000,
    })

    // Open history panel
    await facilitatorPage.getByRole('button', { name: '履歴' }).click()

    // Should show round 1 with vote values
    await expect(facilitatorPage.getByText('セッション履歴')).toBeVisible()
    await expect(facilitatorPage.getByText('ラウンド 1')).toBeVisible({
      timeout: 10_000,
    })
    // Check vote values within the history panel (participant: value format)
    await expect(facilitatorPage.getByText('Facilitator:')).toBeVisible()
    await expect(facilitatorPage.getByText('Joiner:')).toBeVisible()

    await facilitatorContext.close()
    await joinerContext.close()
  })

  test('should show CSV and JSON export buttons when rounds exist', async ({
    page,
  }) => {
    await createRoom(page, 'Export Button Test', 'Host')

    // Vote and reveal to create a completed round
    await page.getByRole('button', { name: '3', exact: true }).click()
    await expect(page.getByText('投票済み')).toBeVisible()
    await page.getByRole('button', { name: '結果を公開' }).click()
    await expect(page.getByText('投票結果')).toBeVisible({ timeout: 10_000 })

    // Open history panel
    await page.getByRole('button', { name: '履歴' }).click()

    // Wait for history to load and show round
    await expect(page.getByText('ラウンド 1')).toBeVisible({ timeout: 10_000 })

    // Export buttons should be visible
    await expect(page.getByRole('button', { name: 'CSV' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'JSON' })).toBeVisible()
  })

  test('should show multiple rounds in reverse order', async ({ page }) => {
    await createRoom(page, 'Multi Round Test', 'Host')

    // Round 1: vote and reveal
    await page.getByRole('button', { name: '3', exact: true }).click()
    await expect(page.getByText('投票済み')).toBeVisible()
    await page.getByRole('button', { name: '結果を公開' }).click()
    await expect(page.getByText('投票結果')).toBeVisible({ timeout: 10_000 })

    // Start round 2
    await page.getByRole('button', { name: '次のラウンド' }).click()
    await expect(page.getByText('カードを選択')).toBeVisible({
      timeout: 10_000,
    })

    // Round 2: vote and reveal
    await page.getByRole('button', { name: '8', exact: true }).click()
    await expect(page.getByText('投票済み')).toBeVisible()
    await page.getByRole('button', { name: '結果を公開' }).click()
    await expect(page.getByText('投票結果')).toBeVisible({ timeout: 10_000 })

    // Open history panel
    await page.getByRole('button', { name: '履歴' }).click()

    // Wait for history to load
    await expect(page.getByText('セッション履歴')).toBeVisible()
    await expect(page.getByText('ラウンド 2')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('ラウンド 1')).toBeVisible()

    // Round 2 should appear before round 1 (reverse chronological order)
    const roundLabels = page.locator('text=/ラウンド \\d+/')
    const texts = await roundLabels.allTextContents()
    const roundNumbers = texts.map((t) => {
      const match = t.match(/ラウンド (\d+)/)
      return match ? parseInt(match[1], 10) : 0
    })

    // First round label should be the higher number (most recent)
    expect(roundNumbers[0]).toBeGreaterThan(roundNumbers[roundNumbers.length - 1])
  })
})
