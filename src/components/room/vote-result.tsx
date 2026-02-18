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

  const sortedVoters = [...activeVoters].sort((a, b) => {
    const aValue = votesByParticipant.get(a.id)
    const bValue = votesByParticipant.get(b.id)
    const aNum = aValue !== undefined ? Number(aValue) : NaN
    const bNum = bValue !== undefined ? Number(bValue) : NaN
    const aIsNumeric = !isNaN(aNum)
    const bIsNumeric = !isNaN(bNum)

    if (aIsNumeric && bIsNumeric) return bNum - aNum
    if (aIsNumeric) return -1
    if (bIsNumeric) return 1
    return 0
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('voting.result')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {sortedVoters.map((participant, index) => {
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
