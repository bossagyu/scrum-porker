'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type ErrorPageProps = {
  readonly error: Error & { digest?: string }
  readonly reset: () => void
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  const t = useTranslations()
  return (
    <div className="mx-auto max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle>{t('errors.unexpected')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('errors.unexpectedDescription')}</p>
          <div className="flex gap-2">
            <Button onClick={reset}>{t('common.retry')}</Button>
            <Button variant="outline" onClick={() => (window.location.href = '/')}>
              {t('common.homeLink')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
