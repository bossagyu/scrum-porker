'use client'

import { useActionState, useEffect } from 'react'
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
  const [state, formAction, isPending] = useActionState(joinRoom, initialState)

  useEffect(() => {
    if (state.redirectTo) {
      window.location.href = state.redirectTo
    }
  }, [state.redirectTo])

  return (
    <Card>
      <CardHeader>
        <CardTitle>ルームに参加</CardTitle>
        <CardDescription>
          {roomName
            ? `「${roomName}」に参加します`
            : 'ルームコードを入力して参加します'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roomCode">ルームコード</Label>
            <Input
              id="roomCode"
              name="roomCode"
              placeholder="ABC123"
              defaultValue={defaultRoomCode}
              required
              maxLength={6}
              className="uppercase"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="joinDisplayName">表示名</Label>
            <Input
              id="joinDisplayName"
              name="displayName"
              placeholder="あなたの名前"
              required
              maxLength={20}
            />
          </div>

          {state.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? '参加中...' : 'ルームに参加'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
