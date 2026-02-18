'use client'

import { useActionState, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CARD_SETS, type CardSetType, TIMER_OPTIONS } from '@/lib/constants'
import { createRoom, type CreateRoomState } from '@/actions/room'

const initialState: CreateRoomState = {}

export function CreateRoomForm() {
  const t = useTranslations()
  const [state, formAction, isPending] = useActionState(createRoom, initialState)
  const [selectedCardSet, setSelectedCardSet] = useState<CardSetType>('fibonacci')
  const [customCardsValue, setCustomCardsValue] = useState('')
  const [customCardsError, setCustomCardsError] = useState<string | null>(null)

  const validateCustomCards = (value: string) => {
    if (!value.trim()) {
      setCustomCardsError(null)
      return
    }
    const cards = value
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c !== '')
    if (cards.length < 3) {
      setCustomCardsError(t('validation.customCardsMinimum'))
      return
    }
    setCustomCardsError(null)
  }

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

  useEffect(() => {
    if (state.redirectTo) {
      window.location.href = state.redirectTo
    }
  }, [state.redirectTo])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('createRoom.title')}</CardTitle>
        <CardDescription>{t('createRoom.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('createRoom.roomName')}</Label>
            <Input
              id="name"
              name="name"
              placeholder={t('createRoom.roomNamePlaceholder')}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">{t('createRoom.displayName')}</Label>
            <Input
              id="displayName"
              name="displayName"
              placeholder={t('createRoom.displayNamePlaceholder')}
              required
              maxLength={20}
            />
          </div>

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
                    name="cardSet"
                    value={option.value}
                    checked={selectedCardSet === option.value}
                    onChange={(e) => setSelectedCardSet(e.target.value as CardSetType)}
                    className="accent-primary"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {option.value === 'custom'
                        ? t('createRoom.customCardHint')
                        : CARD_SETS[option.value].cards.join(', ')}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {selectedCardSet === 'custom' && (
              <div className="mt-2 space-y-1">
                <Input
                  name="customCards"
                  placeholder="0.5, 1, 2, 3, 5, 8"
                  className="w-full"
                  value={customCardsValue}
                  onChange={(e) => {
                    setCustomCardsValue(e.target.value)
                    validateCustomCards(e.target.value)
                  }}
                />
                {customCardsError && (
                  <p className="text-xs text-destructive">{customCardsError}</p>
                )}
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
                    name="timerDuration"
                    value={option.value ?? ''}
                    defaultChecked={option.value === null}
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
              id="autoReveal"
              name="autoReveal"
              value="true"
              className="accent-primary"
            />
            <Label htmlFor="autoReveal">{t('createRoom.autoReveal')}</Label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allowAllControl"
              name="allowAllControl"
              value="true"
              className="accent-primary"
            />
            <Label htmlFor="allowAllControl">{t('createRoom.allowAllControl')}</Label>
          </div>

          {state.error && (
            <p className="text-sm text-destructive" role="alert">
              {t(state.error)}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? t('createRoom.submitting') : t('createRoom.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
