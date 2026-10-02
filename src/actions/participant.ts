'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export type RemoveParticipantState = {
  readonly error?: string
  readonly success?: boolean
}

export async function removeParticipant(
  participantId: string,
): Promise<RemoveParticipantState> {
  if (!participantId) {
    return { error: 'errors.invalidInput' }
  }

  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.rpc('remove_participant', {
      p_participant_id: participantId,
    })

    if (error) {
      return { error: 'errors.removeParticipant' }
    }

    if (!data) {
      return { error: 'errors.removeParticipantFailed' }
    }

    return { success: true }
  } catch {
    return { error: 'errors.removeParticipant' }
  }
}
