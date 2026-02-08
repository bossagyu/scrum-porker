'use client'

import { useRoomStore } from '@/stores/room-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function VoteResult() {
  const participants = useRoomStore((s) => s.participants)
  const votes = useRoomStore((s) => s.votes)

  const votesByParticipant = new Map(
    votes.map((v) => [v.participant_id, v.card_value]),
  )

  const activeVoters = participants.filter((p) => !p.is_observer)

  return (
    <Card>
      <CardHeader>
        <CardTitle>投票結果</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {activeVoters.map((participant) => {
            const cardValue = votesByParticipant.get(participant.id)

            return (
              <li
                key={participant.id}
                className="flex items-center justify-between"
              >
                <span>{participant.display_name}</span>
                <span className="text-lg font-bold">
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
