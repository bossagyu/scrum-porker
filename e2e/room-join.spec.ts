import { test, expect } from '@playwright/test'
import { createRoom, joinRoom } from './helpers'

test.describe('Room Join', () => {
  test('should join a room with valid code', async ({ browser }) => {
    const facilitatorContext = await browser.newContext()
    const facilitatorPage = await facilitatorContext.newPage()
    const code = await createRoom(facilitatorPage, 'Sprint', 'Facilitator')

    const joinerContext = await browser.newContext()
    const joinerPage = await joinerContext.newPage()
    await joinRoom(joinerPage, code, 'Joiner')

    await expect(joinerPage.getByText(`Room: ${code}`)).toBeVisible()
    await expect(joinerPage.getByText('Joiner')).toBeVisible()

    await facilitatorContext.close()
    await joinerContext.close()
  })

  test('should show error for invalid room code', async ({ page }) => {
    await page.goto('/')
    await page.locator('#roomCode').fill('ZZZZZZ')
    await page.locator('#joinDisplayName').fill('TestUser')
    await page.getByRole('button', { name: 'ルームに参加' }).click()

    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByText('ルームが見つかりません')).toBeVisible()
  })

  test('should update participant count when someone joins', async ({
    browser,
  }) => {
    const facilitatorContext = await browser.newContext()
    const facilitatorPage = await facilitatorContext.newPage()
    const code = await createRoom(facilitatorPage, 'Sprint', 'Facilitator')

    await expect(facilitatorPage.getByText('参加者 (1)')).toBeVisible()

    const joinerContext = await browser.newContext()
    const joinerPage = await joinerContext.newPage()
    await joinRoom(joinerPage, code, 'Joiner')

    await expect(joinerPage.getByText('参加者 (2)')).toBeVisible()

    // Facilitator page should also update via realtime
    await expect(facilitatorPage.getByText('参加者 (2)')).toBeVisible({
      timeout: 10_000,
    })

    await facilitatorContext.close()
    await joinerContext.close()
  })
})
