'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRoomStore } from '@/stores/room-store'
import { submitVote } from '@/actions/vote'
import { getCardsForRoom } from '@/lib/constants'
import { VotingCard } from './voting-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function VotingCards() {
  const t = useTranslations()
  const cardSet = useRoomStore((s) => s.cardSet)
  const customCards = useRoomStore((s) => s.customCards)
  const currentSession = useRoomStore((s) => s.currentSession)
  const currentParticipantId = useRoomStore((s) => s.currentParticipantId)
  const votes = useRoomStore((s) => s.votes)
  const participants = useRoomStore((s) => s.participants)
  const addOptimisticVote = useRoomStore((s) => s.addOptimisticVote)
  const rollbackOptimisticVote = useRoomStore((s) => s.rollbackOptimisticVote)
  const [isPending, startTransition] = useTransition()
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // セッションが切り替わったら選択とエラーを捨てる。effect の中で setState すると
  // 一度古い選択のまま描画してから再描画が走るので、React 公式の
  // 「props が変わったときに描画中に state を調整する」パターンを使う。
  // https://react.dev/learn/you-might-not-need-an-effect
  const [lastSessionId, setLastSessionId] = useState(currentSession?.id ?? null)
  if (lastSessionId !== (currentSession?.id ?? null)) {
    setLastSessionId(currentSession?.id ?? null)
    setSelectedCard(null)
    setError(null)
  }

  const isRevealed = currentSession?.is_revealed ?? false
  const hasSession = currentSession !== null
  const currentParticipant = participants.find((p) => p.id === currentParticipantId)
  const isObserver = currentParticipant?.is_observer ?? false

  const cards = getCardsForRoom(cardSet, customCards)

  if (!currentParticipant) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">{t('voting.removedFromRoom')}</p>
        </CardContent>
      </Card>
    )
  }

  const currentVote = votes.find((v) => v.participant_id === currentParticipantId)
  const displaySelected = selectedCard ?? currentVote?.card_value ?? null

  const handleSelect = (value: string) => {
    if (!currentSession?.id || !currentParticipantId || isRevealed || isObserver) {
      return
    }
    // ファシリテーターがカードセットを変更した直後など、古いカードを描画している
    // クライアントは存在しない値を送りうる。拒否されたら楽観更新を巻き戻して
    // 理由を表示する（放置すると「投票済み」のまま次のポーリングで無言で消える）。
    const previousValue = currentVote?.card_value ?? null
    setError(null)
    setSelectedCard(value)
    addOptimisticVote(currentParticipantId, value)
    startTransition(async () => {
      const result = await submitVote(currentSession.id, currentParticipantId, value)
      if (result?.error) {
        setSelectedCard(previousValue)
        rollbackOptimisticVote(currentParticipantId, previousValue)
        setError(result.error)
      }
    })
  }

  if (isObserver) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">{t('voting.observerCannotVote')}</p>
        </CardContent>
      </Card>
    )
  }

  if (!hasSession) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">{t('voting.noSession')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('voting.selectCard')}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-destructive mb-3 text-sm" role="alert">
            {t(error)}
          </p>
        )}
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
