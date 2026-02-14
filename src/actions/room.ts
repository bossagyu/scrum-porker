'use server'

import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { generateRoomCode } from '@/lib/room-utils'

const createRoomSchema = z.object({
  name: z.string().min(1, 'ルーム名を入力してください').max(100, 'ルーム名は100文字以内で入力してください'),
  cardSet: z.enum(['fibonacci', 'tshirt', 'powerOf2', 'custom']),
  customCards: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined
      return val.split(',').map((v) => v.trim()).filter(Boolean)
    }),
  autoReveal: z.boolean().default(false),
  allowAllControl: z.boolean().default(false),
  timerDuration: z
    .union([z.literal(30), z.literal(60), z.literal(120), z.literal(300), z.null()])
    .default(null),
  displayName: z
    .string()
    .min(1, '表示名を入力してください')
    .max(20, '表示名は20文字以内で入力してください'),
}).refine((data) => {
  if (data.cardSet === 'custom') {
    if (!data.customCards || data.customCards.length < 2 || data.customCards.length > 20) {
      return false
    }
    return data.customCards.every((card) => /^\d+$/.test(card))
  }
  return true
}, {
  message: 'カスタムカードは2〜20枚の数値のみを入力してください',
  path: ['customCards'],
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

  const timerRaw = formData.get('timerDuration')
  const timerDuration = timerRaw && timerRaw !== '' ? Number(timerRaw) : null

  const parsed = createRoomSchema.safeParse({
    name: formData.get('name'),
    cardSet: formData.get('cardSet'),
    customCards: formData.get('customCards') || undefined,
    autoReveal: formData.get('autoReveal') === 'true',
    allowAllControl: formData.get('allowAllControl') === 'true',
    timerDuration,
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
      custom_cards: parsed.data.cardSet === 'custom' ? parsed.data.customCards : null,
      auto_reveal: parsed.data.autoReveal,
      timer_duration: parsed.data.timerDuration,
      allow_all_control: parsed.data.allowAllControl,
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

const updateRoomSettingsSchema = z.object({
  roomId: z.string().uuid(),
  cardSet: z.enum(['fibonacci', 'tshirt', 'powerOf2', 'custom']),
  customCards: z.array(z.string()).optional(),
  timerDuration: z
    .union([z.literal(30), z.literal(60), z.literal(120), z.literal(300), z.null()])
    .default(null),
  autoReveal: z.boolean(),
  allowAllControl: z.boolean(),
}).refine((data) => {
  if (data.cardSet === 'custom') {
    if (!data.customCards || data.customCards.length < 2 || data.customCards.length > 20) {
      return false
    }
    return data.customCards.every((card) => /^\d+$/.test(card))
  }
  return true
}, {
  message: 'カスタムカードは2〜20枚の数値のみを入力してください',
  path: ['customCards'],
})

export type UpdateRoomSettingsState = {
  readonly error?: string
  readonly success?: boolean
}

export async function updateRoomSettings(
  input: z.infer<typeof updateRoomSettingsSchema>,
): Promise<UpdateRoomSettingsState> {
  const parsed = updateRoomSettingsSchema.safeParse(input)
  if (!parsed.success) {
    return { error: '入力が無効です' }
  }

  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: '認証が必要です' }

    const { data: participant } = await supabase
      .from('participants')
      .select('is_facilitator')
      .eq('room_id', parsed.data.roomId)
      .eq('user_id', user.id)
      .single()

    if (!participant?.is_facilitator) {
      return { error: '設定を変更する権限がありません' }
    }

    const { error } = await supabase
      .from('rooms')
      .update({
        card_set: parsed.data.cardSet,
        custom_cards: parsed.data.cardSet === 'custom' ? parsed.data.customCards : null,
        timer_duration: parsed.data.timerDuration,
        auto_reveal: parsed.data.autoReveal,
        allow_all_control: parsed.data.allowAllControl,
      })
      .eq('id', parsed.data.roomId)

    if (error) {
      return { error: '設定の更新に失敗しました' }
    }

    return { success: true }
  } catch {
    return { error: '設定の更新に失敗しました' }
  }
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
