'use client'

import { useState, useTransition } from 'react'
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

const cardSetOptions: readonly { readonly value: CardSetType; readonly label: string }[] = [
  { value: 'fibonacci', label: CARD_SETS.fibonacci.name },
  { value: 'tshirt', label: CARD_SETS.tshirt.name },
  { value: 'powerOf2', label: CARD_SETS.powerOf2.name },
  { value: 'custom', label: CARD_SETS.custom.name },
]

export function RoomSettingsDialog() {
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
        customCards,
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
          設定
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ルーム設定</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>カードセット</Label>
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
                <Label htmlFor="customCardsInput">カスタムカード（カンマ区切り）</Label>
                <Input
                  id="customCardsInput"
                  type="text"
                  placeholder="例: 1, 2, 3, 5, 8, 13"
                  value={customCardsInput}
                  onChange={(e) => setCustomCardsInput(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  特殊カード（?, ∞, ☕）は自動的に追加されます
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>タイマー</Label>
            <div className="flex flex-wrap gap-2">
              {TIMER_OPTIONS.map((option) => (
                <label
                  key={option.label}
                  className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 hover:bg-accent"
                >
                  <input
                    type="radio"
                    name="settingsTimerDuration"
                    checked={timerDuration === option.value}
                    onChange={() => setTimerDuration(option.value)}
                    className="accent-primary"
                  />
                  <span className="text-sm">{option.label}</span>
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
            <Label htmlFor="settingsAutoReveal">全員投票後に自動で結果を表示</Label>
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
              全員が結果の公開・次のラウンドを操作可能
            </Label>
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button onClick={handleSave} className="w-full" disabled={isPending}>
            {isPending ? '保存中...' : '保存'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
