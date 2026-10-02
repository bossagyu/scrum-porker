'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { UserX } from 'lucide-react'
import { removeParticipant } from '@/actions/participant'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

type RemoveParticipantButtonProps = {
  readonly participantId: string
  readonly displayName: string
}

export function RemoveParticipantButton({
  participantId,
  displayName,
}: RemoveParticipantButtonProps) {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setError(null)
    }
    setOpen(newOpen)
  }

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await removeParticipant(participantId)
      if (result.error) {
        setError(result.error)
        return
      }
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t('participant.removeAriaLabel', { name: displayName })}
        >
          <UserX className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('participant.removeConfirmTitle', { name: displayName })}
          </DialogTitle>
        </DialogHeader>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {t(error)}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            {t('common.cancel')}
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {t('participant.removeConfirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
