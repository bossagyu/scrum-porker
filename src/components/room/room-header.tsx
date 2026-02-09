'use client'

import { useTransition } from 'react'
import { useRoomStore } from '@/stores/room-store'
import { revealVotes, resetVoting } from '@/actions/vote'
import { Button } from '@/components/ui/button'
import { CountdownTimer } from './countdown-timer'

type RoomHeaderProps = {
  readonly onToggleHistory: () => void
}

export function RoomHeader({ onToggleHistory }: RoomHeaderProps) {
  const roomCode = useRoomStore((s) => s.roomCode)
  const roomId = useRoomStore((s) => s.roomId)
  const currentSession = useRoomStore((s) => s.currentSession)
  const participants = useRoomStore((s) => s.participants)
  const currentParticipantId = useRoomStore((s) => s.currentParticipantId)
  const [isPending, startTransition] = useTransition()

  const isRevealed = currentSession?.is_revealed ?? false
  const currentParticipant = participants.find(
    (p) => p.id === currentParticipantId,
  )
  const isFacilitator = currentParticipant?.is_facilitator ?? false

  const handleReveal = () => {
    if (!currentSession?.id) return
    startTransition(async () => {
      await revealVotes(currentSession.id)
    })
  }

  const handleReset = () => {
    if (!roomId) return
    startTransition(async () => {
      await resetVoting(roomId)
    })
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Room: {roomCode}</h1>
          {currentSession?.topic && (
            <p className="text-muted-foreground text-sm">
              {currentSession.topic}
            </p>
          )}
        </div>
        <CountdownTimer />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onToggleHistory}>
          履歴
        </Button>
        {isFacilitator && (
          <>
            {!isRevealed && currentSession && (
              <Button onClick={handleReveal} disabled={isPending}>
                結果を公開
              </Button>
            )}
            {isRevealed && (
              <Button onClick={handleReset} disabled={isPending} variant="outline">
                次のラウンド
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
