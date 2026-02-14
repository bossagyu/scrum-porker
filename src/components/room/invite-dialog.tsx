'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Copy, Check, Share2, UserPlus } from 'lucide-react'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  const [open, setOpen] = useState(false)

  const joinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/room/${roomCode}/join`
      : ''

  useEffect(() => {
    setSupportsShare(typeof navigator.share === 'function')
  }, [])

  const canvasCallback = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      if (!canvas || !joinUrl) return
      QRCode.toCanvas(canvas, joinUrl, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      })
    },
    [joinUrl],
  )

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
          <DialogDescription className="sr-only">
            {t('invite.roomCode')}: {roomCode}
          </DialogDescription>
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
              {open && <canvas ref={canvasCallback} />}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
