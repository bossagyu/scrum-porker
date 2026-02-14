'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NotFound() {
  const t = useTranslations()
  return (
    <div className="mx-auto max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle>{t('errors.pageNotFound')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('errors.pageNotFoundDescription')}</p>
          <Button asChild>
            <Link href="/">{t('common.homeLink')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
