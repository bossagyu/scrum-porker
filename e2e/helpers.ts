import type { Page } from '@playwright/test'

type CreateRoomOptions = {
  readonly autoReveal?: boolean
  readonly timerDuration?: 30 | 60 | 120 | 300
}

export async function createRoom(
  page: Page,
  roomName: string,
  displayName: string,
  options?: CreateRoomOptions,
): Promise<string> {
  await page.goto('/')
  await page.locator('#name').fill(roomName)
  await page.locator('#displayName').fill(displayName)

  if (options?.timerDuration) {
    await page.locator(`input[name="timerDuration"][value="${options.timerDuration}"]`).check()
  }

  if (options?.autoReveal) {
    await page.locator('#autoReveal').check()
  }

  await page.getByRole('button', { name: 'ルームを作成' }).click()

  await page.waitForURL(/\/room\/[A-Z0-9]{6}$/)

  const url = page.url()
  const code = url.split('/').pop()!
  return code
}

export async function joinRoom(
  page: Page,
  roomCode: string,
  displayName: string,
): Promise<void> {
  await page.goto('/')
  await page.locator('#roomCode').fill(roomCode)
  await page.locator('#joinDisplayName').fill(displayName)
  await page.getByRole('button', { name: 'ルームに参加' }).click()

  await page.waitForURL(/\/room\/[A-Z0-9]{6}$/)
}
