'use client'

import { useTranslations } from 'next-intl'

export function CardSetLabel({ cardSet }: { readonly cardSet: string }) {
  const t = useTranslations()
  return (
    <p className="text-sm text-muted-foreground">
      {t('joinRoom.cardSet', { name: t(`cardSets.${cardSet}` as never) })}
    </p>
  )
}
