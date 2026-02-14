'use client'

import { useActionState, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { joinRoom, type JoinRoomState } from '@/actions/room'

type JoinRoomFormProps = {
  readonly defaultRoomCode?: string
  readonly roomName?: string
}

const initialState: JoinRoomState = {}

export function JoinRoomForm({ defaultRoomCode, roomName }: JoinRoomFormProps) {
  const t = useTranslations()
  const [state, formAction, isPending] = useActionState(joinRoom, initialState)
  const [roomCodeValue, setRoomCodeValue] = useState(defaultRoomCode ?? '')

  useEffect(() => {
    if (state.redirectTo) {
      window.location.href = state.redirectTo
    }
  }, [state.redirectTo])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('joinRoom.title')}</CardTitle>
        <CardDescription>
          {roomName
            ? t('joinRoom.descriptionWithName', { roomName })
            : t('joinRoom.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roomCode">{t('joinRoom.roomCode')}</Label>
            <Input
              id="roomCode"
              name="roomCode"
              placeholder="ABC123"
              value={roomCodeValue}
              onChange={(e) => setRoomCodeValue(e.target.value.toUpperCase())}
              required
              maxLength={6}
              className="uppercase"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="joinDisplayName">{t('joinRoom.displayName')}</Label>
            <Input
              id="joinDisplayName"
              name="displayName"
              placeholder={t('joinRoom.displayNamePlaceholder')}
              required
              maxLength={20}
            />
          </div>

          {state.error && (
            <p className="text-sm text-destructive" role="alert">
              {t(state.error)}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? t('joinRoom.submitting') : t('joinRoom.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
