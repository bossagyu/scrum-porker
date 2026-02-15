'use client'

import { useEffect, useState } from 'react'
import { useRoomStore } from '@/stores/room-store'
import { ParticipantList } from './participant-list'
import { VotingCards } from './voting-cards'
import { VoteResult } from './vote-result'
import { VoteSummary } from './vote-summary'
import { RoomHeader } from './room-header'
import { SessionHistory } from './session-history'
import type { Database } from '@/lib/supabase/types'

type RoomRow = Database['public']['Tables']['rooms']['Row']
type ParticipantRow = Database['public']['Tables']['participants']['Row']
type VotingSessionRow = Database['public']['Tables']['voting_sessions']['Row']
type VoteRow = Database['public']['Tables']['votes']['Row']

type RoomViewProps = {
  readonly room: RoomRow
  readonly initialParticipants: readonly ParticipantRow[]
  readonly initialSession: VotingSessionRow | null
  readonly initialVotes: readonly VoteRow[]
  readonly currentParticipantId: string
}

export function RoomView({
  room,
  initialParticipants,
  initialSession,
  initialVotes,
  currentParticipantId,
}: RoomViewProps) {
  const initialize = useRoomStore((s) => s.initialize)
  const subscribe = useRoomStore((s) => s.subscribe)
  const currentSession = useRoomStore((s) => s.currentSession)
  const isRevealed = currentSession?.is_revealed ?? false
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    initialize({
      roomId: room.id,
      roomCode: room.code,
      cardSet: room.card_set,
      timerDuration: room.timer_duration,
      autoReveal: room.auto_reveal,
      allowAllControl: room.allow_all_control,
      customCards: room.custom_cards ?? null,
      participants: initialParticipants,
      currentSession: initialSession,
      votes: initialVotes,
      currentParticipantId,
    })

    const unsubscribe = subscribe()
    return unsubscribe
  }, [
    room.id,
    room.code,
    room.card_set,
    room.timer_duration,
    room.auto_reveal,
    room.allow_all_control,
    room.custom_cards,
    initialParticipants,
    initialSession,
    initialVotes,
    currentParticipantId,
    initialize,
    subscribe,
  ])

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <RoomHeader onToggleHistory={() => setShowHistory((prev) => !prev)} />
      {showHistory && <SessionHistory onClose={() => setShowHistory(false)} />}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_280px] lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <VotingCards />
          {isRevealed && (
            <>
              <VoteResult />
              <VoteSummary />
            </>
          )}
        </div>
        <aside>
          <ParticipantList />
        </aside>
      </div>
    </div>
  )
}
