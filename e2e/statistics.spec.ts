import { test, expect } from '@playwright/test'
import { createRoom, joinRoom } from './helpers'

// 統計の計算そのものは src/lib/__tests__/room-utils.test.ts が担当する。
// ここでは「投票 → 公開 → 画面に出る数値」までの配線が正しいかを確認する。
// 既存の voting.spec.ts はラベルの表示しか見ていない。

/** 統計カード内の指定ラベルの直下に出ている値を読む */
async function readStat(page: import('@playwright/test').Page, label: string) {
  return page
    .locator('div', { has: page.getByText(label, { exact: true }) })
    .last()
    .locator('p')
    .last()
    .innerText()
}

test.describe('Statistics', () => {
  test('should show average, median and mode computed from the actual votes', async ({
    browser,
  }) => {
    const hostContext = await browser.newContext()
    const hostPage = await hostContext.newPage()
    const code = await createRoom(hostPage, 'Stats Test', 'Host', { autoReveal: false })

    const joinerContext = await browser.newContext()
    const joinerPage = await joinerContext.newPage()
    await joinRoom(joinerPage, code, 'Joiner')

    // 5 と 8 → 平均 6.5 / 中央値 6.5 / 最頻値は重複が無いので ---
    await hostPage.getByRole('button', { name: '5', exact: true }).click()
    await joinerPage.getByRole('button', { name: '8', exact: true }).click()
    await expect(hostPage.getByText('投票済み', { exact: true })).toHaveCount(2, {
      timeout: 15_000,
    })

    await hostPage.getByRole('button', { name: '結果を公開' }).click()
    await expect(hostPage.getByText('統計')).toBeVisible({ timeout: 15_000 })

    expect(await readStat(hostPage, '平均')).toBe('6.5')
    expect(await readStat(hostPage, '中央値')).toBe('6.5')
    expect(await readStat(hostPage, '最頻値')).toBe('---')

    await hostContext.close()
    await joinerContext.close()
  })

  // 最頻値はチームが採用する見積もり値なので、平均・中央値より目立つこと。
  test('should render the mode more prominently than the other statistics', async ({ browser }) => {
    const hostContext = await browser.newContext()
    const hostPage = await hostContext.newPage()
    const code = await createRoom(hostPage, 'Prominence Test', 'Host', {
      autoReveal: false,
    })

    const joinerContext = await browser.newContext()
    const joinerPage = await joinerContext.newPage()
    await joinRoom(joinerPage, code, 'Joiner')

    await hostPage.getByRole('button', { name: '5', exact: true }).click()
    await joinerPage.getByRole('button', { name: '5', exact: true }).click()
    await expect(hostPage.getByText('投票済み', { exact: true })).toHaveCount(2, {
      timeout: 15_000,
    })

    await hostPage.getByRole('button', { name: '結果を公開' }).click()
    await expect(hostPage.getByText('統計')).toBeVisible({ timeout: 15_000 })

    const fontSizeOf = (label: string) =>
      hostPage
        .locator('div', { has: hostPage.getByText(label, { exact: true }) })
        .last()
        .locator('p')
        .last()
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize))

    const modeSize = await fontSizeOf('最頻値')
    const averageSize = await fontSizeOf('平均')
    const medianSize = await fontSizeOf('中央値')

    expect(modeSize).toBeGreaterThan(averageSize)
    expect(modeSize).toBeGreaterThan(medianSize)

    // 最頻値が平均・中央値より先に（上に）置かれていること
    const modeBox = await hostPage.getByText('最頻値', { exact: true }).boundingBox()
    const averageBox = await hostPage.getByText('平均', { exact: true }).boundingBox()
    expect(modeBox!.y).toBeLessThan(averageBox!.y)

    await hostContext.close()
    await joinerContext.close()
  })

  test('should exclude special cards from every statistic', async ({ browser }) => {
    const hostContext = await browser.newContext()
    const hostPage = await hostContext.newPage()
    const code = await createRoom(hostPage, 'Special Cards Test', 'Host', {
      autoReveal: false,
    })

    const joinerContext = await browser.newContext()
    const joinerPage = await joinerContext.newPage()
    await joinRoom(joinerPage, code, 'Joiner')

    const thirdContext = await browser.newContext()
    const thirdPage = await thirdContext.newPage()
    await joinRoom(thirdPage, code, 'Third')

    // 5 / ☕ / ☕ → ☕ が最多だが特殊カードなので最頻値から除外される。
    // 平均・中央値は 5 のみから計算される。
    await hostPage.getByRole('button', { name: '5', exact: true }).click()
    await joinerPage.getByRole('button', { name: '☕', exact: true }).click()
    await thirdPage.getByRole('button', { name: '☕', exact: true }).click()
    await expect(hostPage.getByText('投票済み', { exact: true })).toHaveCount(3, {
      timeout: 15_000,
    })

    await hostPage.getByRole('button', { name: '結果を公開' }).click()
    await expect(hostPage.getByText('統計')).toBeVisible({ timeout: 15_000 })

    expect(await readStat(hostPage, '平均')).toBe('5.0')
    expect(await readStat(hostPage, '中央値')).toBe('5.0')
    // ☕ が 2 票で最多でも最頻値にはならない
    expect(await readStat(hostPage, '最頻値')).toBe('---')

    await hostContext.close()
    await joinerContext.close()
    await thirdContext.close()
  })
})
