import { test, expect } from '@playwright/test'
import { createRoom } from './helpers'

test.describe('Room Creation', () => {
  test('should create a room and redirect to room page', async ({ page }) => {
    const code = await createRoom(page, 'Sprint Planning', 'Alice')

    expect(code).toMatch(/^[A-Z0-9]{6}$/)

    await expect(page.getByText(`Room: ${code}`)).toBeVisible()
  })

  test('should show the creator as a participant', async ({ page }) => {
    await createRoom(page, 'Estimation', 'Bob')

    await expect(page.getByText('Bob')).toBeVisible()
  })

  test('should show the facilitator badge', async ({ page }) => {
    await createRoom(page, 'Estimation', 'Carol')

    await expect(page.getByText('ファシリテーター')).toBeVisible()
  })

  test('should show participant count', async ({ page }) => {
    await createRoom(page, 'Estimation', 'Dave')

    await expect(page.getByText('参加者 (1)')).toBeVisible()
  })

  test('should show validation error when room name is empty', async ({
    page,
  }) => {
    await page.goto('/')
    await page.locator('#displayName').fill('TestUser')
    await page.getByRole('button', { name: 'ルームを作成' }).click()

    await expect(page.locator('#name')).toHaveAttribute('required', '')
  })

  test('should show validation error when display name is empty', async ({
    page,
  }) => {
    await page.goto('/')
    await page.locator('#name').fill('Test Room')
    await page.getByRole('button', { name: 'ルームを作成' }).click()

    await expect(page.locator('#displayName')).toHaveAttribute('required', '')
  })
})
