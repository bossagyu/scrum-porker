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
  readonly autoReveal: boolean
  readonly allowAllControl: boolean
  readonly customCards: string[] | null
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
    readonly autoReveal: boolean
    readonly allowAllControl: boolean
    readonly customCards: string[] | null
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
  autoReveal: false,
  allowAllControl: false,
  customCards: null,
  participants: [],
  currentSession: null,
  votes: [],
  currentParticipantId: null,
  isSubscribed: false,
}

const POLL_INTERVAL_MS = 3000

export const useRoomStore = create<RoomStore>((set, get) => ({
  ...initialState,

  initialize: (params) => {
    set({
      roomId: params.roomId,
      roomCode: params.roomCode,
      cardSet: params.cardSet,
      timerDuration: params.timerDuration,
      autoReveal: params.autoReveal,
      allowAllControl: params.allowAllControl,
      customCards: params.customCards,
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

    const existing = state.votes.find((v) => v.participant_id === participantId)
    if (existing) {
      set({
        votes: state.votes.map((v) =>
          v.participant_id === participantId ? { ...v, card_value: cardValue } : v,
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

    const handleParticipants = (
      eventType: string,
      newRecord: Record<string, unknown> | null,
      oldRecord: Record<string, unknown> | null,
    ) => {
      const state = get()
      if (eventType === 'INSERT' && newRecord) {
        const participant = newRecord as unknown as ParticipantRow
        const exists = state.participants.some((p) => p.id === participant.id)
        if (!exists) {
          set({ participants: [...state.participants, participant] })
        }
      } else if (eventType === 'UPDATE' && newRecord) {
        const updated = newRecord as unknown as ParticipantRow
        set({
          participants: state.participants.map((p) => (p.id === updated.id ? updated : p)),
        })
      } else if (eventType === 'DELETE' && oldRecord) {
        const deleted = oldRecord as unknown as { id: string }
        set({
          participants: state.participants.filter((p) => p.id !== deleted.id),
        })
      }
    }

    const handleVotingSessions = (
      eventType: string,
      newRecord: Record<string, unknown> | null,
    ) => {
      if (eventType === 'INSERT' && newRecord) {
        set({
          currentSession: newRecord as unknown as VotingSessionRow,
          votes: [],
        })
      } else if (eventType === 'UPDATE' && newRecord) {
        set({ currentSession: newRecord as unknown as VotingSessionRow })
      } else if (eventType === 'DELETE') {
        set({ currentSession: null, votes: [] })
      }
    }

    const handleVotes = (
      eventType: string,
      newRecord: Record<string, unknown> | null,
      oldRecord: Record<string, unknown> | null,
    ) => {
      const state = get()
      const currentSessionId = state.currentSession?.id
      if (!currentSessionId) return

      if (eventType === 'INSERT' && newRecord) {
        const newVote = newRecord as unknown as VoteRow
        if (newVote.session_id === currentSessionId) {
          const hasOptimistic = state.votes.some(
            (v) => v.participant_id === newVote.participant_id && v.id.startsWith('optimistic-'),
          )
          if (hasOptimistic) {
            set({
              votes: state.votes.map((v) =>
                v.participant_id === newVote.participant_id && v.id.startsWith('optimistic-')
                  ? newVote
                  : v,
              ),
            })
          } else {
            const exists = state.votes.some((v) => v.id === newVote.id)
            if (!exists) {
              set({ votes: [...state.votes, newVote] })
            }
          }
        }
      } else if (eventType === 'UPDATE' && newRecord) {
        const updatedVote = newRecord as unknown as VoteRow
        if (updatedVote.session_id === currentSessionId) {
          set({
            votes: state.votes.map((v) =>
              v.id === updatedVote.id ||
              (v.id.startsWith('optimistic-') && v.participant_id === updatedVote.participant_id)
                ? updatedVote
                : v,
            ),
          })
        }
      } else if (eventType === 'DELETE' && oldRecord) {
        const deleted = oldRecord as unknown as { id: string }
        set({
          votes: state.votes.filter((v) => v.id !== deleted.id),
        })
      }
    }

    const handleRooms = (newRecord: Record<string, unknown> | null) => {
      if (!newRecord) return
      const room = newRecord as unknown as {
        card_set: string
        timer_duration: number | null
        auto_reveal: boolean
        allow_all_control: boolean
        custom_cards: string[] | null
      }
      set({
        cardSet: room.card_set,
        timerDuration: room.timer_duration,
        autoReveal: room.auto_reveal,
        allowAllControl: room.allow_all_control,
        customCards: room.custom_cards,
      })
    }

    const handleBroadcast = (eventType: string, raw: Record<string, unknown>) => {
      const inner = raw.payload as {
        table: string
        schema: string
        record: Record<string, unknown> | null
        old_record: Record<string, unknown> | null
        operation: string
      } | undefined
      if (!inner || typeof inner.table !== 'string') return
      const { table, record, old_record } = inner
      switch (table) {
        case 'participants':
          handleParticipants(eventType, record, old_record)
          break
        case 'voting_sessions':
          handleVotingSessions(eventType, record)
          break
        case 'votes':
          handleVotes(eventType, record, old_record)
          break
        case 'rooms':
          handleRooms(record)
          break
      }
    }

    const channel = supabase
      .channel(`room:${roomId}`)
      .on('broadcast', { event: 'INSERT' }, (payload) => handleBroadcast('INSERT', payload))
      .on('broadcast', { event: 'UPDATE' }, (payload) => handleBroadcast('UPDATE', payload))
      .on('broadcast', { event: 'DELETE' }, (payload) => handleBroadcast('DELETE', payload))
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

      const { data: roomData } = await supabase
        .from('rooms')
        .select('card_set, timer_duration, auto_reveal, allow_all_control, custom_cards')
        .eq('id', roomId)
        .single()

      if (roomData) {
        set({
          cardSet: roomData.card_set,
          timerDuration: roomData.timer_duration,
          autoReveal: roomData.auto_reveal,
          allowAllControl: roomData.allow_all_control,
          customCards: roomData.custom_cards,
        })
      }
    }, POLL_INTERVAL_MS)

    set({ isSubscribed: true })

    return () => {
      clearInterval(pollInterval)
      supabase.removeChannel(channel)
      set({ isSubscribed: false })
    }
  },

  reset: () => set(initialState),
}))
