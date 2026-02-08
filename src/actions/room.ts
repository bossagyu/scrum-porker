'use server'

import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { generateRoomCode } from '@/lib/room-utils'

const createRoomSchema = z.object({
  name: z.string().min(1, 'ルーム名を入力してください').max(100, 'ルーム名は100文字以内で入力してください'),
  cardSet: z.enum(['fibonacci', 'tshirt', 'powerOf2']),
  autoReveal: z.boolean().default(false),
  displayName: z
    .string()
    .min(1, '表示名を入力してください')
    .max(20, '表示名は20文字以内で入力してください'),
})

const joinRoomSchema = z.object({
  roomCode: z.string().min(1, 'ルームコードを入力してください'),
  displayName: z
    .string()
    .min(1, '表示名を入力してください')
    .max(20, '表示名は20文字以内で入力してください'),
})

export type CreateRoomState = {
  readonly error?: string
  readonly redirectTo?: string
}

export type JoinRoomState = {
  readonly error?: string
  readonly redirectTo?: string
}

export async function createRoom(
  _prevState: CreateRoomState,
  formData: FormData,
): Promise<CreateRoomState> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  let userId = user?.id

  if (!userId) {
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously()
    if (authError) return { error: '認証に失敗しました' }
    userId = authData.user?.id
  }

  const parsed = createRoomSchema.safeParse({
    name: formData.get('name'),
    cardSet: formData.get('cardSet'),
    autoReveal: formData.get('autoReveal') === 'true',
    displayName: formData.get('displayName'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const code = generateRoomCode()

  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .insert({
      code,
      name: parsed.data.name,
      created_by: userId!,
      card_set: parsed.data.cardSet,
      auto_reveal: parsed.data.autoReveal,
    })
    .select('*')
    .single()

  if (roomError) return { error: 'ルームの作成に失敗しました' }

  const { error: participantError } = await supabase.from('participants').insert({
    room_id: room.id,
    user_id: userId!,
    display_name: parsed.data.displayName,
    is_facilitator: true,
  })

  if (participantError) return { error: '参加者の登録に失敗しました' }

  await supabase.from('voting_sessions').insert({
    room_id: room.id,
    topic: '',
  })

  return { redirectTo: `/room/${code}` }
}

export async function joinRoom(
  _prevState: JoinRoomState,
  formData: FormData,
): Promise<JoinRoomState> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  let userId = user?.id

  if (!userId) {
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously()
    if (authError) return { error: '認証に失敗しました' }
    userId = authData.user?.id
  }

  const parsed = joinRoomSchema.safeParse({
    roomCode: formData.get('roomCode'),
    displayName: formData.get('displayName'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const roomCode = parsed.data.roomCode.toUpperCase()

  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', roomCode)
    .eq('is_active', true)
    .single()

  if (roomError || !room) return { error: 'ルームが見つかりません' }

  const { data: existing } = await supabase
    .from('participants')
    .select('*')
    .eq('room_id', room.id)
    .eq('user_id', userId!)
    .single()

  if (existing) {
    return { redirectTo: `/room/${roomCode}` }
  }

  const { error: joinError } = await supabase.from('participants').insert({
    room_id: room.id,
    user_id: userId!,
    display_name: parsed.data.displayName,
  })

  if (joinError) {
    if (joinError.code === '23505') {
      return { error: 'この表示名は既に使われています' }
    }
    return { error: 'ルームへの参加に失敗しました' }
  }

  return { redirectTo: `/room/${roomCode}` }
}

export async function getRoomByCode(code: string) {
  const supabase = await createServerSupabaseClient()

  const { data: room } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  return room
}

export async function getCurrentParticipant(roomId: string) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: participant } = await supabase
    .from('participants')
    .select('*')
    .eq('room_id', roomId)
    .eq('user_id', user.id)
    .single()

  return participant
}
