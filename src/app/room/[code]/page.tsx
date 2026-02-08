import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { RoomView } from '@/components/room/room-view'

type PageProps = {
  readonly params: Promise<{ code: string }>
}

export default async function RoomPage({ params }: PageProps) {
  const { code } = await params
  const supabase = await createServerSupabaseClient()

  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (roomError || !room) {
    redirect('/')
  }

  const { data: participants } = await supabase
    .from('participants')
    .select('*')
    .eq('room_id', room.id)
    .eq('is_active', true)
    .order('joined_at', { ascending: true })

  const { data: sessions } = await supabase
    .from('voting_sessions')
    .select('*')
    .eq('room_id', room.id)
    .order('created_at', { ascending: false })
    .limit(1)

  const currentSession = sessions?.[0] ?? null

  const { data: votes } = currentSession
    ? await supabase
        .from('votes')
        .select('*')
        .eq('session_id', currentSession.id)
    : { data: [] }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const currentParticipant = (participants ?? []).find(
    (p) => p.user_id === user?.id,
  )

  if (!currentParticipant) {
    redirect(`/room/${code}/join`)
  }

  return (
    <RoomView
      room={room}
      initialParticipants={participants ?? []}
      initialSession={currentSession}
      initialVotes={votes ?? []}
      currentParticipantId={currentParticipant.id}
    />
  )
}
