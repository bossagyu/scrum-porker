'use client'

import { useTranslations } from 'next-intl'
import { useRoomStore } from '@/stores/room-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function ParticipantList() {
  const t = useTranslations()
  const participants = useRoomStore((s) => s.participants)
  const votes = useRoomStore((s) => s.votes)
  const currentSession = useRoomStore((s) => s.currentSession)
  const currentParticipantId = useRoomStore((s) => s.currentParticipantId)

  const hasSession = currentSession !== null
  const votedParticipantIds = new Set(votes.map((v) => v.participant_id))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('participant.title', { count: participants.length })}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {participants.map((participant) => {
            const hasVoted = votedParticipantIds.has(participant.id)
            const isCurrentUser = participant.id === currentParticipantId

            return (
              <li
                key={participant.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className={isCurrentUser ? 'font-bold' : ''}>
                    {participant.display_name}
                  </span>
                  {participant.is_facilitator && (
                    <Badge variant="secondary">{t('participant.facilitator')}</Badge>
                  )}
                  {participant.is_observer && (
                    <Badge variant="outline">{t('participant.observer')}</Badge>
                  )}
                </div>
                {hasSession && !participant.is_observer && (
                  <Badge
                    variant={hasVoted ? 'default' : 'outline'}
                    className={hasVoted ? '' : 'bg-muted'}
                  >
                    {hasVoted ? t('participant.voted') : t('participant.notVoted')}
                  </Badge>
                )}
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
