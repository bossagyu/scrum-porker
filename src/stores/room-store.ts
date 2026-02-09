'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type ParticipantRow = Database['public']['Tables']['participants']['Row']
type VotingSessionRow = Database['public']['Tables']['voting_sessions']['Row']
type VoteRow = Database['public']['Tables']['votes']['Row']

type RoomState = {
  readonly roomId: string | null
  readonly roomCode: string | null
  readonly cardSet: string
  readonly timerDuration: number | null
  readonly participants: readonly ParticipantRow[]
  readonly currentSession: VotingSessionRow | null
  readonly votes: readonly VoteRow[]
  readonly currentParticipantId: string | null
  readonly isSubscribed: boolean
}

type RoomActions = {
  initialize: (params: {
    readonly roomId: string
    readonly roomCode: string
    readonly cardSet: string
    readonly timerDuration: number | null
    readonly participants: readonly ParticipantRow[]
    readonly currentSession: VotingSessionRow | null
    readonly votes: readonly VoteRow[]
    readonly currentParticipantId: string
  }) => void
  addOptimisticVote: (participantId: string, cardValue: string) => void
  subscribe: () => () => void
  reset: () => void
}

type RoomStore = RoomState & RoomActions

const initialState: RoomState = {
  roomId: null,
  roomCode: null,
  cardSet: 'fibonacci',
  timerDuration: null,
  participants: [],
  currentSession: null,
  votes: [],
  currentParticipantId: null,
  isSubscribed: false,
}

export const useRoomStore = create<RoomStore>((set, get) => ({
  ...initialState,

  initialize: (params) => {
    set({
      roomId: params.roomId,
      roomCode: params.roomCode,
      cardSet: params.cardSet,
      timerDuration: params.timerDuration,
      participants: params.participants,
      currentSession: params.currentSession,
      votes: params.votes,
      currentParticipantId: params.currentParticipantId,
    })
  },

  addOptimisticVote: (participantId, cardValue) => {
    const state = get()
    const sessionId = state.currentSession?.id
    if (!sessionId) return

    const existing = state.votes.find(
      (v) => v.participant_id === participantId,
    )
    if (existing) {
      set({
        votes: state.votes.map((v) =>
          v.participant_id === participantId
            ? { ...v, card_value: cardValue }
            : v,
        ),
      })
    } else {
      const optimisticVote: VoteRow = {
        id: `optimistic-${participantId}`,
        session_id: sessionId,
        participant_id: participantId,
        card_value: cardValue,
        voted_at: new Date().toISOString(),
      }
      set({ votes: [...state.votes, optimisticVote] })
    }
  },

  subscribe: () => {
    const { roomId } = get()
    if (!roomId) return () => {}

    const supabase = createClient()

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const state = get()
          if (payload.eventType === 'INSERT') {
            set({
              participants: [...state.participants, payload.new as ParticipantRow],
            })
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as ParticipantRow
            set({
              participants: state.participants.map((p) =>
                p.id === updated.id ? updated : p,
              ),
            })
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as { id: string }
            set({
              participants: state.participants.filter((p) => p.id !== deleted.id),
            })
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'voting_sessions',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            set({
              currentSession: payload.new as VotingSessionRow,
              votes: [],
            })
          } else if (payload.eventType === 'UPDATE') {
            set({ currentSession: payload.new as VotingSessionRow })
          }
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        (payload) => {
          const state = get()
          const currentSessionId = state.currentSession?.id
          if (!currentSessionId) return

          if (payload.eventType === 'INSERT') {
            const newVote = payload.new as VoteRow
            if (newVote.session_id === currentSessionId) {
              const hasOptimistic = state.votes.some(
                (v) =>
                  v.participant_id === newVote.participant_id &&
                  v.id.startsWith('optimistic-'),
              )
              if (hasOptimistic) {
                set({
                  votes: state.votes.map((v) =>
                    v.participant_id === newVote.participant_id &&
                    v.id.startsWith('optimistic-')
                      ? newVote
                      : v,
                  ),
                })
              } else {
                set({ votes: [...state.votes, newVote] })
              }
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedVote = payload.new as VoteRow
            if (updatedVote.session_id === currentSessionId) {
              set({
                votes: state.votes.map((v) =>
                  v.id === updatedVote.id ||
                  (v.id.startsWith('optimistic-') &&
                    v.participant_id === updatedVote.participant_id)
                    ? updatedVote
                    : v,
                ),
              })
            }
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as { id: string }
            set({
              votes: state.votes.filter((v) => v.id !== deleted.id),
            })
          }
        },
      )
      .subscribe()

    const pollInterval = setInterval(async () => {
      const state = get()
      const sessionId = state.currentSession?.id
      if (!sessionId) return

      const { data: votes } = await supabase
        .from('votes')
        .select('*')
        .eq('session_id', sessionId)

      if (votes) {
        set({ votes })
      }

      const { data: participants } = await supabase
        .from('participants')
        .select('*')
        .eq('room_id', roomId)

      if (participants) {
        set({ participants })
      }

      const { data: session } = await supabase
        .from('voting_sessions')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (session) {
        const prevSession = get().currentSession
        if (session.id !== prevSession?.id) {
          set({ currentSession: session, votes: [] })
        } else {
          set({ currentSession: session })
        }
      }
    }, 3000)

    set({ isSubscribed: true })

    return () => {
      clearInterval(pollInterval)
      supabase.removeChannel(channel)
      set({ isSubscribed: false })
    }
  },

  reset: () => set(initialState),
}))
