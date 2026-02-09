'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function submitVote(
  sessionId: string,
  participantId: string,
  cardValue: string,
) {
  if (!sessionId || !participantId || !cardValue) {
    return { error: '無効な入力です' }
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
      return { error: '投票に失敗しました' }
    }

    await supabase.rpc('auto_reveal_if_complete', {
      p_session_id: sessionId,
    })

    return { success: true }
  } catch {
    return { error: '投票に失敗しました' }
  }
}

export async function revealVotes(sessionId: string) {
  if (!sessionId) {
    return { error: '無効なセッションIDです' }
  }

  try {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from('voting_sessions')
      .update({ is_revealed: true })
      .eq('id', sessionId)

    if (error) {
      return { error: '結果の公開に失敗しました' }
    }

    return { success: true }
  } catch {
    return { error: '結果の公開に失敗しました' }
  }
}

export async function revealOnTimerExpiry(sessionId: string) {
  if (!sessionId) {
    return { error: '無効なセッションIDです' }
  }

  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.rpc('reveal_on_timer_expiry', {
      p_session_id: sessionId,
    })

    if (error) {
      return { error: 'タイマー公開に失敗しました' }
    }

    return { success: true, revealed: data }
  } catch {
    return { error: 'タイマー公開に失敗しました' }
  }
}

export async function resetVoting(roomId: string) {
  if (!roomId) {
    return { error: '無効なルームIDです' }
  }

  try {
    const supabase = await createServerSupabaseClient()

    const { data: session, error } = await supabase
      .from('voting_sessions')
      .insert({ room_id: roomId, topic: '' })
      .select()
      .single()

    if (error) {
      return { error: 'リセットに失敗しました' }
    }

    return { success: true, session }
  } catch {
    return { error: 'リセットに失敗しました' }
  }
}
