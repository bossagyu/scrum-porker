'use client'

import { useTranslations } from 'next-intl'
import { CreateRoomForm } from '@/components/room/create-room-form'
import { JoinRoomForm } from '@/components/room/join-room-form'

export default function Home() {
  const t = useTranslations()
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <section className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Scrum Poker</h1>
        <p className="text-muted-foreground">{t('home.description')}</p>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        <CreateRoomForm />
        <JoinRoomForm />
      </div>
    </div>
  )
}
