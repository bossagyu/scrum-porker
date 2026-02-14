'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRoomStore } from '@/stores/room-store'
import { submitVote } from '@/actions/vote'
import { getCardsForRoom } from '@/lib/constants'
import { VotingCard } from './voting-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function VotingCards() {
  const cardSet = useRoomStore((s) => s.cardSet)
  const customCards = useRoomStore((s) => s.customCards)
  const currentSession = useRoomStore((s) => s.currentSession)
  const currentParticipantId = useRoomStore((s) => s.currentParticipantId)
  const votes = useRoomStore((s) => s.votes)
  const participants = useRoomStore((s) => s.participants)
  const [isPending, startTransition] = useTransition()
  const [selectedCard, setSelectedCard] = useState<string | null>(null)

  useEffect(() => {
    setSelectedCard(null)
  }, [currentSession?.id])

  const isRevealed = currentSession?.is_revealed ?? false
  const hasSession = currentSession !== null
  const currentParticipant = participants.find(
    (p) => p.id === currentParticipantId,
  )
  const isObserver = currentParticipant?.is_observer ?? false

  const cards = getCardsForRoom(cardSet, customCards)

  const currentVote = votes.find(
    (v) => v.participant_id === currentParticipantId,
  )
  const displaySelected = selectedCard ?? currentVote?.card_value ?? null

  const addOptimisticVote = useRoomStore((s) => s.addOptimisticVote)

  const handleSelect = (value: string) => {
    if (!currentSession?.id || !currentParticipantId || isRevealed || isObserver) {
      return
    }
    setSelectedCard(value)
    addOptimisticVote(currentParticipantId, value)
    startTransition(async () => {
      await submitVote(currentSession.id, currentParticipantId, value)
    })
  }

  if (isObserver) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            オブザーバーは投票できません
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!hasSession) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            投票セッションがまだ開始されていません
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>カードを選択</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {cards.map((card) => (
            <VotingCard
              key={card}
              value={card}
              isSelected={displaySelected === card}
              isDisabled={isRevealed || isPending}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
