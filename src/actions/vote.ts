'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function submitVote(
  sessionId: string,
  participantId: string,
  cardValue: string,
) {
  if (!sessionId || !participantId || !cardValue) {
    return { error: 'errors.invalidInput' }
  }

  try {
    const supabase = await createServerSupabaseClient()

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
