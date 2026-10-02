'use client'

import { useTranslations } from 'next-intl'
import { useRoomStore } from '@/stores/room-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { RemoveParticipantButton } from './remove-participant-button'

export function ParticipantList() {
  const t = useTranslations()
  const participants = useRoomStore((s) => s.participants)
  const votes = useRoomStore((s) => s.votes)
  const currentSession = useRoomStore((s) => s.currentSession)
  const currentParticipantId = useRoomStore((s) => s.currentParticipantId)
  const allowAllControl = useRoomStore((s) => s.allowAllControl)

  const hasSession = currentSession !== null
  const votedParticipantIds = new Set(votes.map((v) => v.participant_id))
  const currentParticipant = participants.find((p) => p.id === currentParticipantId)
  // currentParticipant === undefined means the current user has themselves
  // been removed from the room; they must not get a (non-functional) button
  // to remove someone else.
  const canRemove =
    currentParticipant !== undefined && (currentParticipant.is_facilitator || allowAllControl)

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
              <li key={participant.id} className="flex items-center justify-between gap-2">
                {/* min-w-0 がないと、折り返し機会の無い長い表示名で左側が
                    コンテンツ幅を主張し、Badge と Button の shrink-0 により
                    右側が Card の外へ押し出される。
                    flex-wrap はバッジを2行目に送るためのもので、これが無いと
                    唯一 shrink できる名前が省略記号だけに潰れる（狭い
                    サイドバーではバッジとボタンの固定幅だけで行幅をほぼ使う）。*/}
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                  <span
                    data-testid="participant-name"
                    className={cn('truncate', isCurrentUser && 'font-bold')}
                    title={participant.display_name}
                  >
                    {participant.display_name}
                  </span>
                  {participant.is_facilitator && (
                    <Badge variant="secondary">{t('participant.facilitator')}</Badge>
                  )}
                  {participant.is_observer && (
                    <Badge variant="outline">{t('participant.observer')}</Badge>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {hasSession && !participant.is_observer && (
                    <Badge
                      variant={hasVoted ? 'default' : 'outline'}
                      className={hasVoted ? '' : 'bg-muted'}
                    >
                      {hasVoted ? t('participant.voted') : t('participant.notVoted')}
                    </Badge>
                  )}
                  {canRemove && !isCurrentUser && (
                    <RemoveParticipantButton
                      participantId={participant.id}
                      displayName={participant.display_name}
                    />
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
