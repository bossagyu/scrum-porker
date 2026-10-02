import { test, expect } from '@playwright/test'
import { createRoom, joinRoom } from './helpers'

// 折り返し機会の無い表示名（上限の 20 文字）。日本語名は任意位置で折り返されるため
// 行が縦に伸びるだけだが、ASCII の連続文字列では横にはみ出す。
const UNBREAKABLE_NAME = 'WWWWWWWWWWWWWWWWWWWW'

test.describe('Participant List Layout', () => {
  test('should keep the remove button inside the card with a long display name', async ({
    browser,
  }) => {
    const hostContext = await browser.newContext()
    const hostPage = await hostContext.newPage()
    const code = await createRoom(hostPage, 'Overflow Test', 'Host')

    const joinerContext = await browser.newContext()
    const joinerPage = await joinerContext.newPage()
    await joinRoom(joinerPage, code, UNBREAKABLE_NAME)

    await expect(hostPage.getByText(UNBREAKABLE_NAME)).toBeVisible({ timeout: 15_000 })

    // 「投票済み」バッジも出た状態（行の中身が最も多い状態）で検証する
    await joinerPage.getByRole('button', { name: '5', exact: true }).click()
    await expect(hostPage.getByText('投票済み', { exact: true })).toHaveCount(1, {
      timeout: 15_000,
    })

    const card = hostPage.locator('aside > div').first()
    const cardBox = await card.boundingBox()
    expect(cardBox).not.toBeNull()
    const cardRight = cardBox!.x + cardBox!.width

    const removeButton = hostPage.getByRole('button', {
      name: `${UNBREAKABLE_NAME}を削除`,
    })
    await expect(removeButton).toBeVisible()
    const buttonBox = await removeButton.boundingBox()
    expect(buttonBox).not.toBeNull()

    // 削除ボタンが Card の右端を越えない
    expect(buttonBox!.x + buttonBox!.width).toBeLessThanOrEqual(cardRight)

    // 参加者リストが横にあふれていない
    const listOverflow = await hostPage
      .locator('aside ul')
      .evaluate((el) => el.scrollWidth - el.clientWidth)
    expect(listOverflow).toBeLessThanOrEqual(0)

    // ページ全体に横スクロールが発生していない
    const pageOverflow = await hostPage.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(pageOverflow).toBeLessThanOrEqual(0)

    await hostContext.close()
    await joinerContext.close()
  })

  test('should truncate a long display name and expose it via the title attribute', async ({
    browser,
  }) => {
    const hostContext = await browser.newContext()
    const hostPage = await hostContext.newPage()
    const code = await createRoom(hostPage, 'Truncate Test', 'Host')

    const joinerContext = await browser.newContext()
    const joinerPage = await joinerContext.newPage()
    await joinRoom(joinerPage, code, UNBREAKABLE_NAME)

    const nameCell = hostPage.locator('aside ul > li', { hasText: UNBREAKABLE_NAME })
    await expect(nameCell).toBeVisible({ timeout: 15_000 })

    const nameSpan = nameCell.getByTestId('participant-name')
    await expect(nameSpan).toHaveAttribute('title', UNBREAKABLE_NAME)

    // 省略されている（描画幅が本来の文字列幅より狭い）ことを確認する
    const isTruncated = await nameSpan.evaluate((el) => el.scrollWidth > el.clientWidth)
    expect(isTruncated).toBe(true)

    await hostContext.close()
    await joinerContext.close()
  })

  // ファシリテーター行は「ファシリテーター」バッジ・「投票済み」バッジ・削除ボタンが
  // 固定幅で並ぶため、300px サイドバーでは名前に残る幅がごく僅かになる。短い名前が
  // 省略記号だけに潰れないことを保証する。
  test('should not truncate a short display name on the facilitator row', async ({ browser }) => {
    const hostContext = await browser.newContext()
    const hostPage = await hostContext.newPage()
    const code = await createRoom(hostPage, 'Short Name Test', '田中太郎')

    const joinerContext = await browser.newContext()
    const joinerPage = await joinerContext.newPage()
    await joinRoom(joinerPage, code, 'Joiner')

    // 参加者側から見たファシリテーター行（削除ボタンが出る側）を検証する
    const hostRow = joinerPage.locator('aside ul > li', { hasText: '田中太郎' })
    await expect(hostRow).toBeVisible({ timeout: 15_000 })
    await expect(hostRow.getByRole('button', { name: '田中太郎を削除' })).toBeVisible()

    // 「投票済み」バッジも出した、行の中身が最も多い状態で検証する
    await hostPage.getByRole('button', { name: '5', exact: true }).click()
    await expect(joinerPage.getByText('投票済み', { exact: true })).toHaveCount(1, {
      timeout: 15_000,
    })

    const nameSpan = hostRow.getByTestId('participant-name')
    const metrics = await nameSpan.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }))
    expect(metrics.clientWidth).toBeGreaterThanOrEqual(metrics.scrollWidth)

    // はみ出しが再発していないことも同時に確認する
    const pageOverflow = await joinerPage.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(pageOverflow).toBeLessThanOrEqual(0)

    await hostContext.close()
    await joinerContext.close()
  })
})
