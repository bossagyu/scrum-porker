import type { CardSetType } from '@/lib/constants'

export type Room = {
  readonly id: string
  readonly code: string
  readonly name: string
  readonly createdBy: string | null
  readonly cardSet: CardSetType
  readonly autoReveal: boolean
  readonly isActive: boolean
  readonly createdAt: string
  readonly expiresAt: string
}

export type Participant = {
  readonly id: string
  readonly roomId: string
  readonly userId: string | null
  readonly displayName: string
  readonly isFacilitator: boolean
  readonly isObserver: boolean
  readonly isActive: boolean
  readonly joinedAt: string
  readonly lastActiveAt: string
}

export type VotingSession = {
  readonly id: string
  readonly roomId: string
  readonly topic: string
  readonly isRevealed: boolean
  readonly createdAt: string
}

export type Vote = {
  readonly id: string
  readonly sessionId: string
  readonly participantId: string
  readonly cardValue: string
  readonly votedAt: string
}

export type VoteWithParticipant = Vote & {
  readonly participant: Participant
}

export type VotingState = 'waiting' | 'voting' | 'revealed'
