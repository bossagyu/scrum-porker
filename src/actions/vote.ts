'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isAllowedCardValue } from '@/lib/constants'

export async function submitVote(sessionId: string, participantId: string, cardValue: string) {
  if (!sessionId || !participantId || !cardValue) {
    return { error: 'errors.invalidInput' }
  }

  try {
    const supabase = await createServerSupabaseClient()

    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('is_active, room_id')
      .eq('id', participantId)
      .single()

    if (participantError || !participant?.is_active) {
      return { error: 'errors.participantRemoved' }
    }

    // カード集合はセッション側のルームから引く。participant 側から引くと、
    // 別ルームの participant と組み合わせた細工リクエストで、検証に使う
    // カード集合と実際に書き込まれるセッションがずれる。
    const { data: session, error: sessionError } = await supabase
      .from('voting_sessions')
      .select('room_id')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return { error: 'errors.invalidSession' }
    }

    if (session.room_id !== participant.room_id) {
      return { error: 'errors.invalidInput' }
    }

    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('card_set, custom_cards')
      .eq('id', session.room_id)
      .single()

    if (roomError || !room) {
      return { error: 'errors.invalidRoom' }
    }

    if (!isAllowedCardValue(room.card_set, room.custom_cards, cardValue)) {
      return { error: 'errors.invalidInput' }
    }

    const { error } = await supabase.from('votes').upsert(
      {
        session_id: sessionId,
        participant_id: participantId,
        card_value: cardValue,
      },
      { onConflict: 'session_id,participant_id' },
    )

    if (error) {
      return { error: 'errors.vote' }
    }

    await supabase.rpc('auto_reveal_if_complete', {
      p_session_id: sessionId,
    })

    return { success: true }
  } catch {
    return { error: 'errors.vote' }
  }
}

export async function revealVotes(sessionId: string) {
  if (!sessionId) {
    return { error: 'errors.invalidSession' }
  }

  try {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from('voting_sessions')
      .update({ is_revealed: true })
      .eq('id', sessionId)

    if (error) {
      return { error: 'errors.reveal' }
    }

    return { success: true }
  } catch {
    return { error: 'errors.reveal' }
  }
}

export async function revealOnTimerExpiry(sessionId: string) {
  if (!sessionId) {
    return { error: 'errors.invalidSession' }
  }

  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.rpc('reveal_on_timer_expiry', {
      p_session_id: sessionId,
    })

    if (error) {
      return { error: 'errors.timerReveal' }
    }

    return { success: true, revealed: data }
  } catch {
    return { error: 'errors.timerReveal' }
  }
}

export async function resetVoting(roomId: string) {
  if (!roomId) {
    return { error: 'errors.invalidRoom' }
  }

  try {
    const supabase = await createServerSupabaseClient()

    const { data: session, error } = await supabase
      .from('voting_sessions')
      .insert({ room_id: roomId, topic: '' })
      .select()
      .single()

    if (error) {
      return { error: 'errors.reset' }
    }

    return { success: true, session }
  } catch {
    return { error: 'errors.reset' }
  }
}
