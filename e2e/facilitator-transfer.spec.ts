import { test, expect } from '@playwright/test'
import { createRoom, joinRoom, removeParticipant } from './helpers'

// ルーム設定は is_facilitator の参加者にしか出ない。一方 allow_all_control は
// 既定 ON なので、一般参加者がファシリテーターを削除できる。移譲が無いと
// その時点で誰もカードセット・タイマー・自動公開を変更できなくなる。

test.describe('Facilitator Transfer', () => {
  test('should hand the facilitator role to the oldest remaining participant', async ({
    browser,
  }) => {
    const hostContext = await browser.newContext()
    const hostPage = await hostContext.newPage()
    const code = await createRoom(hostPage, 'Transfer Test', 'Host')

    // 参加順が移譲先の決め手になるので、順番に参加させる
    const firstContext = await browser.newContext()
    const firstPage = await firstContext.newPage()
    await joinRoom(firstPage, code, 'First')

    const secondContext = await browser.newContext()
    const secondPage = await secondContext.newPage()
    await joinRoom(secondPage, code, 'Second')

    await expect(hostPage.getByText('参加者 (3)')).toBeVisible({ timeout: 15_000 })

    // 削除前は Host だけがファシリテーターで、設定を開けるのも Host だけ
    await expect(hostPage.getByRole('button', { name: '設定' })).toBeVisible()
    await expect(secondPage.getByRole('button', { name: '設定' })).not.toBeVisible()

    // 一般参加者がファシリテーターを削除する（allow_all_control 既定 ON）
    await removeParticipant(secondPage, 'Host')

    // 最古参の First に移譲される
    const firstRow = firstPage.locator('aside ul > li', { hasText: 'First' })
    await expect(firstRow.getByText('ファシリテーター')).toBeVisible({ timeout: 15_000 })
    await expect(firstPage.getByRole('button', { name: '設定' })).toBeVisible()

    // 後から参加した Second は昇格しない
    const secondRowSelf = secondPage.locator('aside ul > li', { hasText: 'Second' })
    await expect(secondRowSelf.getByText('ファシリテーター')).not.toBeVisible()
    await expect(secondPage.getByRole('button', { name: '設定' })).not.toBeVisible()

    await hostContext.close()
    await firstContext.close()
    await secondContext.close()
  })

  test('should actually let the promoted participant change the room settings', async ({
    browser,
  }) => {
    const hostContext = await browser.newContext()
    const hostPage = await hostContext.newPage()
    const code = await createRoom(hostPage, 'Transfer Usable', 'Host')

    const joinerContext = await browser.newContext()
    const joinerPage = await joinerContext.newPage()
    await joinRoom(joinerPage, code, 'Joiner')

    await expect(hostPage.getByText('参加者 (2)')).toBeVisible({ timeout: 15_000 })
    await removeParticipant(joinerPage, 'Host')

    await expect(joinerPage.getByRole('button', { name: '設定' })).toBeVisible({
      timeout: 15_000,
    })
    await joinerPage.getByRole('button', { name: '設定' }).click()
    await expect(joinerPage.getByRole('heading', { name: 'ルーム設定' })).toBeVisible()

    // 実際に保存できること（権限エラーにならないこと）まで見る
    await joinerPage.getByRole('button', { name: '保存' }).click()
    await expect(joinerPage.getByText('設定を変更する権限がありません')).not.toBeVisible()

    await hostContext.close()
    await joinerContext.close()
  })

  test('should not transfer while another facilitator is still active', async ({ browser }) => {
    const hostContext = await browser.newContext()
    const hostPage = await hostContext.newPage()
    const code = await createRoom(hostPage, 'No Transfer Needed', 'Host')

    const joinerContext = await browser.newContext()
    const joinerPage = await joinerContext.newPage()
    await joinRoom(joinerPage, code, 'Joiner')

    await expect(hostPage.getByText('参加者 (2)')).toBeVisible({ timeout: 15_000 })

    // ファシリテーター以外を削除しても、誰も昇格しない
    await removeParticipant(hostPage, 'Joiner')

    await expect(hostPage.getByText('参加者 (1)')).toBeVisible({ timeout: 15_000 })
    const hostRow = hostPage.locator('aside ul > li', { hasText: 'Host' })
    await expect(hostRow.getByText('ファシリテーター')).toBeVisible()
    await expect(hostPage.getByText('ファシリテーター')).toHaveCount(1)

    await hostContext.close()
    await joinerContext.close()
  })
})
