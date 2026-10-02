import { test, expect } from '@playwright/test'
import { createRoom, joinRoom, removeParticipant } from './helpers'

test.describe('Participant Removal', () => {
  test('should let a participant remove another participant from the list', async ({
    browser,
  }) => {
    const facilitatorContext = await browser.newContext()
    const facilitatorPage = await facilitatorContext.newPage()
    const code = await createRoom(facilitatorPage, 'Remove Participant', 'Facilitator')

    const joinerContext = await browser.newContext()
    const joinerPage = await joinerContext.newPage()
    await joinRoom(joinerPage, code, 'Joiner')

    await expect(facilitatorPage.getByText('Joiner', { exact: true })).toBeVisible()

    // allow_all_control is on by default, so the non-facilitator joiner can remove too.
    await removeParticipant(joinerPage, 'Facilitator')

    await expect(joinerPage.getByText('Facilitator', { exact: true })).not.toBeVisible()
    await expect(facilitatorContext.pages()[0].getByText('参加者 (1)')).toBeVisible({
      timeout: 10_000,
    })

    await facilitatorContext.close()
    await joinerContext.close()
  })

  test('should not show a remove button on the current user own row', async ({ page }) => {
    await createRoom(page, 'No Self Removal', 'Solo')

    await expect(
      page.getByRole('button', { name: 'Soloを削除' }),
    ).not.toBeVisible()
  })

  test('should auto-reveal once remaining participants vote after a removal', async ({
    browser,
  }) => {
    const facilitatorContext = await browser.newContext()
    const facilitatorPage = await facilitatorContext.newPage()
    const code = await createRoom(facilitatorPage, 'Auto Reveal After Removal', 'Facilitator', {
      autoReveal: true,
    })

    const joinerContext = await browser.newContext()
    const joinerPage = await joinerContext.newPage()
    await joinRoom(joinerPage, code, 'Joiner')

    await expect(facilitatorPage.getByText('Joiner', { exact: true })).toBeVisible()

    // Remove the joiner before anyone votes.
    await removeParticipant(facilitatorPage, 'Joiner')

    // Only the facilitator remains; voting alone should trigger auto-reveal.
    await facilitatorPage.getByRole('button', { name: '5', exact: true }).click()

    await expect(facilitatorPage.getByText('投票結果')).toBeVisible({ timeout: 10_000 })

    await facilitatorContext.close()
    await joinerContext.close()
  })

  test('should show a removed message on the removed participant screen', async ({
    browser,
  }) => {
    const facilitatorContext = await browser.newContext()
    const facilitatorPage = await facilitatorContext.newPage()
    const code = await createRoom(facilitatorPage, 'Removed Message', 'Facilitator')

    const joinerContext = await browser.newContext()
    const joinerPage = await joinerContext.newPage()
    await joinRoom(joinerPage, code, 'Joiner')

    await expect(facilitatorPage.getByText('Joiner', { exact: true })).toBeVisible()

    await removeParticipant(facilitatorPage, 'Joiner')

    await expect(joinerPage.getByText('このルームから削除されました')).toBeVisible({
      timeout: 10_000,
    })

    await facilitatorContext.close()
    await joinerContext.close()
  })

  test('should let a removed participant rejoin without a redirect loop', async ({
    browser,
  }) => {
    const facilitatorContext = await browser.newContext()
    const facilitatorPage = await facilitatorContext.newPage()
    const code = await createRoom(facilitatorPage, 'Rejoin After Removal', 'Facilitator')

    const joinerContext = await browser.newContext()
    const joinerPage = await joinerContext.newPage()
    await joinRoom(joinerPage, code, 'Joiner')

    await expect(facilitatorPage.getByText('Joiner', { exact: true })).toBeVisible()

    await removeParticipant(facilitatorPage, 'Joiner')

    await expect(joinerPage.getByText('このルームから削除されました')).toBeVisible({
      timeout: 10_000,
    })

    // Rejoin via the home page join form, reusing the same browser context (same auth session).
    await joinRoom(joinerPage, code, 'Joiner')

    await expect(joinerPage).toHaveURL(new RegExp(`/room/${code}$`))
    await expect(joinerPage.getByText('カードを選択')).toBeVisible()
    await expect(facilitatorPage.getByText('Joiner', { exact: true })).toBeVisible({
      timeout: 10_000,
    })

    await facilitatorContext.close()
    await joinerContext.close()
  })
})
