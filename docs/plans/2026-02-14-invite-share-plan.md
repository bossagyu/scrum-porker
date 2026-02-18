# Invite / Share Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an invite dialog to room header with URL copy, Web Share API, and QR code for easy room sharing.

**Architecture:** A new `InviteDialog` component is opened from the room header. It displays the room code, a copyable join URL, a native share button (Web Share API, shown only when supported), and a QR code generated via the `qrcode` library. All text is internationalized via next-intl.

**Tech Stack:** qrcode (QR generation), Web Share API, navigator.clipboard, shadcn/ui Dialog, next-intl, lucide-react

---

### Task 1: Install qrcode dependency

**Files:**
- Modify: `package.json`

**Step 1: Install qrcode and its types**

```bash
pnpm add qrcode
pnpm add -D @types/qrcode
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: qrcodeパッケージを追加"
```

---

### Task 2: Add translation keys

**Files:**
- Modify: `messages/ja.json`
- Modify: `messages/en.json`

**Step 1: Add invite translations to ja.json**

Add a new `"invite"` section (after `"roomHeader"`):

```json
"invite": {
  "title": "メンバーを招待",
  "roomCode": "ルームコード",
  "joinUrl": "参加URL",
  "copy": "コピー",
  "copied": "コピーしました",
  "share": "共有",
  "qrCode": "QRコード"
}
```

**Step 2: Add invite translations to en.json**

```json
"invite": {
  "title": "Invite Members",
  "roomCode": "Room Code",
  "joinUrl": "Join URL",
  "copy": "Copy",
  "copied": "Copied!",
  "share": "Share",
  "qrCode": "QR Code"
}
```

**Step 3: Add invite button label to roomHeader in ja.json**

In the existing `"roomHeader"` section, add:
```json
"invite": "招待"
```

**Step 4: Add invite button label to roomHeader in en.json**

In the existing `"roomHeader"` section, add:
```json
"invite": "Invite"
```

**Step 5: Verify build**

Run: `pnpm build`
Expected: Build succeeds.

**Step 6: Commit**

```bash
git add messages/ja.json messages/en.json
git commit -m "feat: 招待機能の翻訳キーを追加"
```

---

### Task 3: Create InviteDialog component

**Files:**
- Create: `src/components/room/invite-dialog.tsx`

**Step 1: Create the InviteDialog component**

Create `src/components/room/invite-dialog.tsx`:

```tsx
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Copy, Check, Share2, QrCode, UserPlus } from 'lucide-react'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

type InviteDialogProps = {
  readonly roomCode: string
}

export function InviteDialog({ roomCode }: InviteDialogProps) {
  const t = useTranslations()
  const [copied, setCopied] = useState(false)
  const [supportsShare, setSupportsShare] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [open, setOpen] = useState(false)

  const joinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/room/${roomCode}/join`
      : ''

  useEffect(() => {
    setSupportsShare(typeof navigator.share === 'function')
  }, [])

  useEffect(() => {
    if (!open || !canvasRef.current || !joinUrl) return
    QRCode.toCanvas(canvasRef.current, joinUrl, {
      width: 200,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })
  }, [open, joinUrl])

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(joinUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [joinUrl])

  const handleShare = useCallback(async () => {
    await navigator.share({
      title: `Scrum Poker - Room ${roomCode}`,
      url: joinUrl,
    })
  }, [roomCode, joinUrl])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <UserPlus className="size-4" />
          {t('roomHeader.invite')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('invite.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {t('invite.roomCode')}
            </p>
            <p className="text-3xl font-bold tracking-widest">{roomCode}</p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              {t('invite.joinUrl')}
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-md bg-muted px-3 py-2 text-sm">
                {joinUrl}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="shrink-0 gap-1.5"
              >
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                {copied ? t('invite.copied') : t('invite.copy')}
              </Button>
            </div>
          </div>

          {supportsShare && (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleShare}
            >
              <Share2 className="size-4" />
              {t('invite.share')}
            </Button>
          )}

          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              {t('invite.qrCode')}
            </p>
            <div className="flex justify-center rounded-lg bg-white p-4">
              <canvas ref={canvasRef} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/components/room/invite-dialog.tsx
git commit -m "feat: 招待ダイアログコンポーネントを作成"
```

---

### Task 4: Add invite button to room header

**Files:**
- Modify: `src/components/room/room-header.tsx`

**Step 1: Integrate InviteDialog into room-header.tsx**

1. Add import at the top:
```tsx
import { InviteDialog } from './invite-dialog'
```

2. Add the `<InviteDialog>` component in the button row, after the history button and before the reveal/reset buttons:
```tsx
<InviteDialog roomCode={roomCode} />
```

The button section should look like:
```tsx
<div className="flex gap-2">
  {isFacilitator && <RoomSettingsDialog />}
  <Button variant="outline" size="sm" onClick={onToggleHistory}>
    {t('roomHeader.history')}
  </Button>
  <InviteDialog roomCode={roomCode} />
  {(isFacilitator || allowAllControl) && (
    ...
  )}
</div>
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds.

**Step 3: Manual verification**

Run: `pnpm dev`
1. Create a room at http://localhost:3000
2. Verify "招待" button appears in room header
3. Click "招待" → dialog opens
4. Verify room code is displayed
5. Verify URL is shown and "コピー" button works
6. Verify QR code is rendered
7. Close and reopen dialog — QR should render correctly

**Step 4: Commit**

```bash
git add src/components/room/room-header.tsx
git commit -m "feat: ルームヘッダーに招待ボタンを追加"
```

---

### Task 5: Run all tests

**Files:** None (test-only task)

**Step 1: Run unit tests**

Run: `pnpm test`
Expected: All 59 tests pass.

**Step 2: Run E2E tests**

Run: `pnpm test:e2e`
Expected: All 25 tests pass.

**Step 3: Run build**

Run: `pnpm build`
Expected: Build succeeds.
