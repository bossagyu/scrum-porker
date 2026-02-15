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
        width: 140,
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
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-sm">
        <DialogHeader className="min-w-0">
          <DialogTitle>{t('invite.title')}</DialogTitle>
          <DialogDescription className="sr-only">
            {t('invite.roomCode')}: {roomCode}
          </DialogDescription>
        </DialogHeader>
        <div className="min-w-0 space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {t('invite.roomCode')}
            </p>
            <p className="text-2xl font-bold tracking-widest">{roomCode}</p>
          </div>

          <div>
            <p className="mb-1 text-sm font-medium text-muted-foreground">
              {t('invite.joinUrl')}
            </p>
            <code className="block truncate rounded-md bg-muted px-3 py-2 text-xs">
              {joinUrl}
            </code>
            <div className="mt-2 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex-1 gap-1.5"
              >
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                {copied ? t('invite.copied') : t('invite.copy')}
              </Button>
              {supportsShare && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="flex-1 gap-1.5"
                >
                  <Share2 className="size-4" />
                  {t('invite.share')}
                </Button>
              )}
            </div>
          </div>

          <div>
            <p className="mb-1 text-sm font-medium text-muted-foreground">
              {t('invite.qrCode')}
            </p>
            <div className="flex justify-center rounded-lg border bg-white p-2">
              {open && <canvas ref={canvasCallback} />}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
