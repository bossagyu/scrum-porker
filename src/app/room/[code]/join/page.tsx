import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getRoomByCode } from '@/actions/room'
import { JoinRoomForm } from '@/components/room/join-room-form'
import { CardSetLabel } from '@/components/room/card-set-label'

type JoinPageProps = {
  readonly params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: JoinPageProps): Promise<Metadata> {
  const { code } = await params
  return {
    title: `ルーム ${code.toUpperCase()} に参加`,
    robots: { index: false },
  }
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { code } = await params
  const room = await getRoomByCode(code)

  if (!room) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <section className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{room.name || code.toUpperCase()}</h1>
        <CardSetLabel cardSet={room.card_set} />
      </section>

      <JoinRoomForm defaultRoomCode={code.toUpperCase()} roomName={room.name || undefined} />
    </div>
  )
}
