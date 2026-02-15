'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRoomStore } from '@/stores/room-store'
import { updateRoomSettings } from '@/actions/room'
import { CARD_SETS, type CardSetType, TIMER_OPTIONS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function RoomSettingsDialog() {
  const t = useTranslations()

  const cardSetOptions = [
    { value: 'fibonacci' as const, label: t('cardSets.fibonacci') },
    { value: 'tshirt' as const, label: t('cardSets.tshirt') },
    { value: 'powerOf2' as const, label: t('cardSets.powerOf2') },
    { value: 'custom' as const, label: t('cardSets.custom') },
  ]

  function getTimerLabel(option: (typeof TIMER_OPTIONS)[number]): string {
    if (option.value === null) return t('timer.none')
    if (option.value < 60) return t('timer.seconds', { value: option.value })
    return t('timer.minutes', { value: option.value / 60 })
  }

  const roomId = useRoomStore((s) => s.roomId)
  const currentCardSet = useRoomStore((s) => s.cardSet)
  const currentCustomCards = useRoomStore((s) => s.customCards)
  const currentTimerDuration = useRoomStore((s) => s.timerDuration)
  const currentAutoReveal = useRoomStore((s) => s.autoReveal)
  const currentAllowAllControl = useRoomStore((s) => s.allowAllControl)

  const [cardSet, setCardSet] = useState(currentCardSet)
  const [customCardsInput, setCustomCardsInput] = useState(
    currentCustomCards ? currentCustomCards.join(', ') : '',
  )
  const [timerDuration, setTimerDuration] = useState<number | null>(currentTimerDuration)
  const [autoReveal, setAutoReveal] = useState(currentAutoReveal)
  const [allowAllControl, setAllowAllControl] = useState(currentAllowAllControl)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setCardSet(currentCardSet)
      setCustomCardsInput(currentCustomCards ? currentCustomCards.join(', ') : '')
      setTimerDuration(currentTimerDuration)
      setAutoReveal(currentAutoReveal)
      setAllowAllControl(currentAllowAllControl)
      setError(null)
    }
    setOpen(newOpen)
  }

  const handleSave = () => {
    if (!roomId) return
    startTransition(async () => {
      const customCards =
        cardSet === 'custom' && customCardsInput.trim()
          ? customCardsInput
              .split(',')
              .map((card) => card.trim())
              .filter((card) => card.length > 0)
          : null

      const result = await updateRoomSettings({
        roomId,
        cardSet: cardSet as 'fibonacci' | 'tshirt' | 'powerOf2' | 'custom',
        customCards: customCards ?? undefined,
        timerDuration: timerDuration as 30 | 60 | 120 | 300 | null,
        autoReveal,
        allowAllControl,
      })
      if (result.error) {
        setError(result.error)
      } else {
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {t('common.settings')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('roomSettings.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('createRoom.cardSet')}</Label>
            <div className="grid gap-2">
              {cardSetOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-3 rounded-md border p-3 hover:bg-accent"
                >
                  <input
                    type="radio"
                    name="settingsCardSet"
                    value={option.value}
                    checked={cardSet === option.value}
                    onChange={() => setCardSet(option.value)}
                    className="accent-primary"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{option.label}</div>
                    {option.value !== 'custom' && (
                      <div className="text-xs text-muted-foreground">
                        {CARD_SETS[option.value].cards.join(', ')}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
            {cardSet === 'custom' && (
              <div className="space-y-2 pt-2">
                <Label htmlFor="customCardsInput">{t('cardSets.customCardLabel')}</Label>
                <Input
                  id="customCardsInput"
                  type="text"
                  placeholder={t('cardSets.customCardPlaceholder')}
                  value={customCardsInput}
                  onChange={(e) => setCustomCardsInput(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {t('cardSets.specialCardsNote')}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t('createRoom.timer')}</Label>
            <div className="flex flex-wrap gap-2">
              {TIMER_OPTIONS.map((option) => (
                <label
                  key={String(option.value)}
                  className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 hover:bg-accent"
                >
                  <input
                    type="radio"
                    name="settingsTimerDuration"
                    checked={timerDuration === option.value}
                    onChange={() => setTimerDuration(option.value)}
                    className="accent-primary"
                  />
                  <span className="text-sm">{getTimerLabel(option)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="settingsAutoReveal"
              checked={autoReveal}
              onChange={(e) => setAutoReveal(e.target.checked)}
              className="accent-primary"
            />
            <Label htmlFor="settingsAutoReveal">{t('createRoom.autoReveal')}</Label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="settingsAllowAllControl"
              checked={allowAllControl}
              onChange={(e) => setAllowAllControl(e.target.checked)}
              className="accent-primary"
            />
            <Label htmlFor="settingsAllowAllControl">
              {t('createRoom.allowAllControl')}
            </Label>
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button onClick={handleSave} className="w-full" disabled={isPending}>
            {isPending ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
