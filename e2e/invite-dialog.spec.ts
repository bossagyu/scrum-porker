import { test, expect } from '@playwright/test'
import { createRoom } from './helpers'

test.describe('Invite Dialog', () => {
  test('should open invite dialog when clicking invite button', async ({
    page,
  }) => {
    await createRoom(page, 'Invite Test', 'Alice')

    await page.getByRole('button', { name: '招待' }).click()

    await expect(
      page.getByRole('heading', { name: 'メンバーを招待' }),
    ).toBeVisible()
  })

  test('should display the room code in the dialog', async ({ page }) => {
    const code = await createRoom(page, 'Code Test', 'Bob')

    await page.getByRole('button', { name: '招待' }).click()

    await expect(
      page.getByRole('dialog').getByText(code, { exact: true }),
    ).toBeVisible()
  })

  test('should display the join URL', async ({ page }) => {
    const code = await createRoom(page, 'URL Test', 'Carol')

    await page.getByRole('button', { name: '招待' }).click()

    const joinUrl = `http://localhost:3000/room/${code}/join`
    await expect(page.getByRole('dialog').locator('code')).toHaveText(joinUrl)
  })

  test('should render a QR code', async ({ page }) => {
    await createRoom(page, 'QR Test', 'Dave')

    await page.getByRole('button', { name: '招待' }).click()

    const canvas = page.getByRole('dialog').locator('canvas')
    await expect(canvas).toBeVisible()

    // Verify canvas has content (non-zero dimensions)
    const width = await canvas.evaluate(
      (el: HTMLCanvasElement) => el.width,
    )
    expect(width).toBeGreaterThan(0)
  })

  test('should close the dialog with close button', async ({ page }) => {
    await createRoom(page, 'Close Test', 'Eve')

    await page.getByRole('button', { name: '招待' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByRole('button', { name: 'Close' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('should re-render QR code when reopening dialog', async ({ page }) => {
    await createRoom(page, 'Reopen Test', 'Frank')

    // Open dialog first time
    await page.getByRole('button', { name: '招待' }).click()
    await expect(
      page.getByRole('dialog').locator('canvas'),
    ).toBeVisible()

    // Close
    await page.getByRole('button', { name: 'Close' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Reopen
    await page.getByRole('button', { name: '招待' }).click()
    const canvas = page.getByRole('dialog').locator('canvas')
    await expect(canvas).toBeVisible()

    const width = await canvas.evaluate(
      (el: HTMLCanvasElement) => el.width,
    )
    expect(width).toBeGreaterThan(0)
  })
})
