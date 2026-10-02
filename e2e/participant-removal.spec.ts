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

  test('should auto-reveal immediately when removing the last outstanding voter (removal happens last)', async ({
    browser,
  }) => {
    // Regression test for the actual motivation behind #24: votes can already
    // be complete among the *remaining* voters before the removal happens.
    // auto_reveal_if_complete is normally only triggered from submitVote, so
    // if remove_participant doesn't also re-run it, the room gets stuck
    // showing "2/2 voted" forever with nothing left to trigger a reveal.
    const facilitatorContext = await browser.newContext()
    const facilitatorPage = await facilitatorContext.newPage()
    const code = await createRoom(
      facilitatorPage,
      'Auto Reveal On Removal',
      'Facilitator',
      { autoReveal: true },
    )

    const joiner1Context = await browser.newContext()
    const joiner1Page = await joiner1Context.newPage()
    await joinRoom(joiner1Page, code, 'Joiner1')

    const joiner2Context = await browser.newContext()
    const joiner2Page = await joiner2Context.newPage()
    await joinRoom(joiner2Page, code, 'Joiner2')

    await expect(facilitatorPage.getByText('Joiner1', { exact: true })).toBeVisible()
    await expect(facilitatorPage.getByText('Joiner2', { exact: true })).toBeVisible()

    // Facilitator and Joiner1 vote; Joiner2 never votes. With 3 active
    // voters, this must NOT reveal yet.
    await facilitatorPage.getByRole('button', { name: '5', exact: true }).click()
    await joiner1Page.getByRole('button', { name: '8', exact: true }).click()
    await facilitatorPage.waitForTimeout(4000)
    await expect(facilitatorPage.getByText('投票結果')).not.toBeVisible()

    // Removing the only remaining non-voter (last, after the votes) must
    // trigger the reveal on its own, with no further voting action.
    await removeParticipant(facilitatorPage, 'Joiner2')

    await expect(facilitatorPage.getByText('投票結果')).toBeVisible({ timeout: 10_000 })
    await expect(joiner1Page.getByText('投票結果')).toBeVisible({ timeout: 10_000 })

    await facilitatorContext.close()
    await joiner1Context.close()
    await joiner2Context.close()
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

  test('should let a removed participant rejoin without a redirect loop, keeping the original display name', async ({
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

    // Rejoin via the home page join form, reusing the same browser context
    // (same auth session) but typing a DIFFERENT display name. Reactivation
    // must keep the original display_name ('Joiner') and ignore the new
    // input ('Joiner2') -- otherwise this would silently start colliding
    // with the UNIQUE(room_id, display_name) constraint on re-use.
    await joinRoom(joinerPage, code, 'Joiner2')

    await expect(joinerPage).toHaveURL(new RegExp(`/room/${code}$`))
    await expect(joinerPage.getByText('カードを選択')).toBeVisible()
    await expect(facilitatorPage.getByText('Joiner', { exact: true })).toBeVisible({
      timeout: 10_000,
    })
    await expect(facilitatorPage.getByText('Joiner2', { exact: true })).not.toBeVisible()
    await expect(joinerPage.getByText('Joiner', { exact: true })).toBeVisible()
    await expect(joinerPage.getByText('Joiner2', { exact: true })).not.toBeVisible()

    await facilitatorContext.close()
    await joinerContext.close()
  })
})
