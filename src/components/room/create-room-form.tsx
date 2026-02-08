'use client'

import { useActionState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CARD_SETS, type CardSetType } from '@/lib/constants'
import { createRoom, type CreateRoomState } from '@/actions/room'

const initialState: CreateRoomState = {}

const cardSetOptions: readonly { readonly value: CardSetType; readonly label: string }[] = [
  { value: 'fibonacci', label: CARD_SETS.fibonacci.name },
  { value: 'tshirt', label: CARD_SETS.tshirt.name },
  { value: 'powerOf2', label: CARD_SETS.powerOf2.name },
]

export function CreateRoomForm() {
  const [state, formAction, isPending] = useActionState(createRoom, initialState)

  useEffect(() => {
    if (state.redirectTo) {
      window.location.href = state.redirectTo
    }
  }, [state.redirectTo])

  return (
    <Card>
      <CardHeader>
        <CardTitle>ルームを作成</CardTitle>
        <CardDescription>新しいスクラムポーカールームを作成します</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">ルーム名</Label>
            <Input
              id="name"
              name="name"
              placeholder="スプリント計画"
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">表示名</Label>
            <Input
              id="displayName"
              name="displayName"
              placeholder="あなたの名前"
              required
              maxLength={20}
            />
          </div>

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
                    name="cardSet"
                    value={option.value}
                    defaultChecked={option.value === 'fibonacci'}
                    className="accent-primary"
                  />
                  <div>
                    <div className="text-sm font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {CARD_SETS[option.value].cards.join(', ')}
                    </div>
                  </div>
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
            <Label htmlFor="autoReveal">全員投票後に自動で結果を表示</Label>
          </div>

          {state.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? '作成中...' : 'ルームを作成'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
