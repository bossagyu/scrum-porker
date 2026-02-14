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

  test('should create a room with custom card set', async ({ page }) => {
    await page.goto('/')
    await page.locator('#name').fill('Custom Cards Room')
    await page.locator('#displayName').fill('CustomUser')

    // Select custom card set
    await page.locator('input[name="cardSet"][value="custom"]').check()

    // Enter custom card values
    await page.locator('input[name="customCards"]').fill('1, 2, 3, 5, 8, 13')

    await page.getByRole('button', { name: 'ルームを作成' }).click()

    await page.waitForURL(/\/room\/[A-Z0-9]{6}$/)

    // Verify custom cards are displayed
    await expect(page.getByRole('button', { name: '1', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '2', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '3', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '5', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '8', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '13', exact: true })).toBeVisible()

    // Verify special cards are also present
    await expect(page.getByRole('button', { name: '?', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '∞', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '☕', exact: true })).toBeVisible()

    // Verify that fibonacci-only cards like 21, 34 are NOT present
    await expect(page.getByRole('button', { name: '21', exact: true })).not.toBeVisible()
    await expect(page.getByRole('button', { name: '34', exact: true })).not.toBeVisible()
  })
})
