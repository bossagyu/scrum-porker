'use client'

import { useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRoomStore } from '@/stores/room-store'
import { revealVotes, resetVoting } from '@/actions/vote'
import { Button } from '@/components/ui/button'
import { CountdownTimer } from './countdown-timer'
import { InviteDialog } from './invite-dialog'
import { RoomSettingsDialog } from './room-settings-dialog'

type RoomHeaderProps = {
  readonly onToggleHistory: () => void
}

export function RoomHeader({ onToggleHistory }: RoomHeaderProps) {
  const t = useTranslations()
  const roomCode = useRoomStore((s) => s.roomCode)
  const roomName = useRoomStore((s) => s.roomName)
  const roomId = useRoomStore((s) => s.roomId)
  const currentSession = useRoomStore((s) => s.currentSession)
  const participants = useRoomStore((s) => s.participants)
  const votes = useRoomStore((s) => s.votes)
  const currentParticipantId = useRoomStore((s) => s.currentParticipantId)
  const [isPending, startTransition] = useTransition()

  const isRevealed = currentSession?.is_revealed ?? false
  const currentParticipant = participants.find((p) => p.id === currentParticipantId)
  const isFacilitator = currentParticipant?.is_facilitator ?? false
  const allowAllControl = useRoomStore((s) => s.allowAllControl)

  const voters = participants.filter((p) => !p.is_observer)
  const votedCount = votes.length
  const totalVoters = voters.length

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
      {/* min-w-0 がないと、折り返し機会の無い長いルーム名（上限100文字）で
          この列がコンテンツ幅を主張し、ページ全体が横にあふれる。
          参加者リスト（participant-list.tsx）と同じ原因。 */}
      <div className="flex min-w-0 items-center gap-4">
        <div className="min-w-0">
          {roomName ? (
            <>
              <h1 className="truncate text-2xl font-bold" title={roomName}>
                {roomName}
              </h1>
              <p className="text-muted-foreground text-sm">Room: {roomCode}</p>
            </>
          ) : (
            <h1 className="text-2xl font-bold">Room: {roomCode}</h1>
          )}
          {currentSession?.topic && (
            <p className="text-muted-foreground truncate text-sm" title={currentSession.topic}>
              {currentSession.topic}
            </p>
          )}
        </div>
        <CountdownTimer />
        {currentSession && !isRevealed && totalVoters > 0 && (
          // shrink-0 と whitespace-nowrap が無いと、狭い画面で 1 文字ずつ
          // 縦に折り返されて潰れる（min-w-0 により縮める余地ができたため）
          <span className="text-muted-foreground shrink-0 text-sm whitespace-nowrap">
            {t('roomHeader.votingProgress', { voted: votedCount, total: totalVoters })}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        {isFacilitator && <RoomSettingsDialog />}
        <Button variant="outline" size="sm" onClick={onToggleHistory}>
          {t('roomHeader.history')}
        </Button>
        {roomCode && <InviteDialog roomCode={roomCode} />}
        {(isFacilitator || allowAllControl) && (
          <>
            {!isRevealed && currentSession && (
              <Button onClick={handleReveal} disabled={isPending}>
                {t('roomHeader.reveal')}
              </Button>
            )}
            {isRevealed && (
              <Button onClick={handleReset} disabled={isPending} variant="outline">
                {t('roomHeader.nextRound')}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
