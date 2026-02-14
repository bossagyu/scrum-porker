'use client'

import { useTranslations } from 'next-intl'
import { useRoomStore } from '@/stores/room-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function VoteResult() {
  const t = useTranslations()
  const participants = useRoomStore((s) => s.participants)
  const votes = useRoomStore((s) => s.votes)

  const votesByParticipant = new Map(
    votes.map((v) => [v.participant_id, v.card_value]),
  )

  const activeVoters = participants.filter((p) => !p.is_observer)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('voting.result')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {activeVoters.map((participant, index) => {
            const cardValue = votesByParticipant.get(participant.id)

            return (
              <li
                key={participant.id}
                className="flex items-center justify-between"
                style={{
                  animation: 'fade-in 0.3s ease-out forwards',
                  animationDelay: `${index * 0.05}s`,
                  opacity: 0,
                }}
              >
                <span>{participant.display_name}</span>
                <span
                  className="text-lg font-bold"
                  style={{
                    animation: 'card-flip 0.4s ease-out forwards',
                    animationDelay: `${index * 0.05 + 0.1}s`,
                    opacity: 0,
                  }}
                >
                  {cardValue ?? '---'}
                </span>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
