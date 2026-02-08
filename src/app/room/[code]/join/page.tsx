import { notFound } from 'next/navigation'
import { getRoomByCode } from '@/actions/room'
import { JoinRoomForm } from '@/components/room/join-room-form'
import { CARD_SETS, type CardSetType } from '@/lib/constants'

type JoinPageProps = {
  readonly params: Promise<{ code: string }>
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { code } = await params
  const room = await getRoomByCode(code)

  if (!room) {
    notFound()
  }

  const cardSetName = CARD_SETS[room.card_set as CardSetType]?.name ?? room.card_set

  return (
    <div className="mx-auto max-w-md space-y-6">
      <section className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{room.name}</h1>
        <p className="text-sm text-muted-foreground">カードセット: {cardSetName}</p>
      </section>

      <JoinRoomForm defaultRoomCode={code.toUpperCase()} roomName={room.name} />
    </div>
  )
}
