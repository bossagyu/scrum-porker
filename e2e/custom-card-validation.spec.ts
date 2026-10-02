import { test, expect } from '@playwright/test'

// カスタムカードの検証は Server Action のスキーマ側にあり、ユニットテストは
// isValidCustomCardValue を直接呼ぶだけなので、スキーマから検証が外れても
// 気づけなかった（実際に一度外してしまい、ユニットテストは全件緑のままだった）。
// ここでフォーム送信からサーバー検証までを通しで固定する。

async function submitCustomRoom(page: import('@playwright/test').Page, cards: string) {
  await page.goto('/')
  await page.locator('#name').fill('Custom Card Test')
  await page.locator('#displayName').fill('Host')
  await page.locator('input[name="cardSet"][value="custom"]').check()
  await page.locator('input[name="customCards"]').fill(cards)
  await page.getByRole('button', { name: 'ルームを作成' }).click()
}

test.describe('Custom Card Validation', () => {
  const rejected = [
    ['Infinity を含む', 'Infinity, 5, 8'],
    ['指数表記を含む', '1e3, 5, 8'],
    ['16進表記を含む', '0x10, 5, 8'],
    ['負の数を含む', '-3, 5, 8'],
    ['数値でない値を含む', 'M, 5, 8'],
  ] as const

  for (const [label, cards] of rejected) {
    test(`should reject custom cards: ${label}`, async ({ page }) => {
      await submitCustomRoom(page, cards)

      // ルームは作られず、翻訳済みのエラーが表示される
      await expect(
        page.getByText('カスタムカードは2〜20枚の数値をカンマ区切りで入力してください'),
      ).toBeVisible({ timeout: 10_000 })
      expect(page.url()).not.toMatch(/\/room\/[A-Z0-9]{6}$/)
    })
  }

  test('should accept plain decimal custom cards', async ({ page }) => {
    await submitCustomRoom(page, '0.5, 1, 2, 3, 5, 8')

    await page.waitForURL(/\/room\/[A-Z0-9]{6}$/, { timeout: 15_000 })
    // 入力したカードと特殊カードが並ぶ
    await expect(page.getByRole('button', { name: '0.5', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '8', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '☕', exact: true })).toBeVisible()
  })
})
