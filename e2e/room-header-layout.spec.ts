import { test, expect } from '@playwright/test'
import { createRoom } from './helpers'

// ルーム名の上限は 100 文字（src/actions/room.ts の createRoomSchema）。
// 折り返し機会の無い ASCII の連続文字列で、横あふれが顕在化する。
const UNBREAKABLE_ROOM_NAME = 'W'.repeat(100)

test.describe('Room Header Layout', () => {
  test('should not overflow the page with a long room name on a narrow viewport', async ({
    browser,
  }) => {
    // 1280px では左カラムが広くあふれないため、狭い viewport で検証する
    const context = await browser.newContext({ viewport: { width: 375, height: 800 } })
    const page = await context.newPage()
    await createRoom(page, UNBREAKABLE_ROOM_NAME, 'Host')

    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()

    const pageOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(pageOverflow).toBeLessThanOrEqual(0)

    await context.close()
  })

  test('should clamp a long room name and expose it via the title attribute', async ({
    browser,
  }) => {
    const context = await browser.newContext({ viewport: { width: 375, height: 800 } })
    const page = await context.newPage()
    await createRoom(page, UNBREAKABLE_ROOM_NAME, 'Host')

    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toHaveAttribute('title', UNBREAKABLE_ROOM_NAME)

    // line-clamp は横ではなく縦に切るので、scrollHeight で判定する
    const isClamped = await heading.evaluate((el) => el.scrollHeight > el.clientHeight)
    expect(isClamped).toBe(true)

    // ルームコードは招待に必要なので、省略されず読めること
    const code = page.url().split('/').pop()!
    const codeLine = page.getByText(`Room: ${code}`)
    await expect(codeLine).toBeVisible()
    const codeMetrics = await codeLine.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }))
    expect(codeMetrics.clientWidth).toBeGreaterThanOrEqual(codeMetrics.scrollWidth)

    await context.close()
  })

  // truncate（1行省略）だと、折り返せる日本語名まで狭い画面で大きく切られてしまう。
  // 退避手段の title はタッチ端末でホバーできないため、唯一影響を受ける環境で
  // 全文が読めなくなる。wrap-anywhere + line-clamp-2 でこれを避けている。
  test('should keep an ordinary Japanese room name fully readable on a narrow viewport', async ({
    browser,
  }) => {
    const context = await browser.newContext({ viewport: { width: 375, height: 800 } })
    const page = await context.newPage()
    await createRoom(page, 'リリース前バックログ見積もり会', 'Host')

    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()

    const metrics = await heading.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
    }))
    expect(metrics.clientWidth).toBeGreaterThanOrEqual(metrics.scrollWidth)
    expect(metrics.clientHeight).toBeGreaterThanOrEqual(metrics.scrollHeight)

    const pageOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(pageOverflow).toBeLessThanOrEqual(0)

    await context.close()
  })

  // 左列に min-w-0 を付けると進捗表示にも縮む余地ができ、shrink-0 と
  // whitespace-nowrap が無いと 1 文字ずつ縦に折り返されて潰れる。
  test('should keep the voting progress text on a single line', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 375, height: 800 } })
    const page = await context.newPage()
    await createRoom(page, UNBREAKABLE_ROOM_NAME, 'Host')

    const progress = page.getByText('投票済み', { exact: false }).first()
    await expect(progress).toBeVisible()

    const box = await progress.boundingBox()
    expect(box).not.toBeNull()
    // 1 行に収まっていれば高さは 1 行分、幅のほうが大きくなる
    expect(box!.height).toBeLessThan(40)
    expect(box!.width).toBeGreaterThan(box!.height)

    await context.close()
  })

  test('should keep a short room name fully visible', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 375, height: 800 } })
    const page = await context.newPage()
    await createRoom(page, 'スプリント27', 'Host')

    const heading = page.getByRole('heading', { level: 1, name: 'スプリント27' })
    await expect(heading).toBeVisible()

    const metrics = await heading.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
    }))
    expect(metrics.clientWidth).toBeGreaterThanOrEqual(metrics.scrollWidth)
    expect(metrics.clientHeight).toBeGreaterThanOrEqual(metrics.scrollHeight)

    await context.close()
  })
})
