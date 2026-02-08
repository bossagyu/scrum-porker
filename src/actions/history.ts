'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export type SessionHistoryEntry = {
  readonly id: string
  readonly topic: string
  readonly createdAt: string
  readonly votes: readonly {
    readonly participantName: string
    readonly cardValue: string
  }[]
}

export async function getSessionHistory(roomId: string): Promise<{
  readonly data?: readonly SessionHistoryEntry[]
  readonly error?: string
}> {
  if (!roomId) {
    return { error: '無効なルームIDです' }
  }

  try {
    const supabase = await createServerSupabaseClient()

    const { data: sessions, error: sessionsError } = await supabase
      .from('voting_sessions')
      .select('*')
      .eq('room_id', roomId)
      .eq('is_revealed', true)
      .order('created_at', { ascending: false })

    if (sessionsError) {
      return { error: '履歴の取得に失敗しました' }
    }

    if (!sessions || sessions.length === 0) {
      return { data: [] }
    }

    const { data: participants } = await supabase
      .from('participants')
      .select('*')
      .eq('room_id', roomId)

    const participantMap = new Map(
      (participants ?? []).map((p) => [p.id, p.display_name]),
    )

    const sessionIds = sessions.map((s) => s.id)
    const { data: allVotes } = await supabase
      .from('votes')
      .select('*')
      .in('session_id', sessionIds)

    const votesBySession = new Map<string, typeof allVotes>()
    for (const vote of allVotes ?? []) {
      const existing = votesBySession.get(vote.session_id) ?? []
      votesBySession.set(vote.session_id, [...existing, vote])
    }

    const history: SessionHistoryEntry[] = sessions.map((session) => {
      const sessionVotes = votesBySession.get(session.id) ?? []
      return {
        id: session.id,
        topic: session.topic,
        createdAt: session.created_at,
        votes: sessionVotes.map((v) => ({
          participantName: participantMap.get(v.participant_id) ?? '不明',
          cardValue: v.card_value,
        })),
      }
    })

    return { data: history }
  } catch {
    return { error: '履歴の取得に失敗しました' }
  }
}
