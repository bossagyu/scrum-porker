'use client'

import Link from 'next/link'
import { useLocale } from '@/i18n/client'
import { Button } from '@/components/ui/button'

export function Header() {
  const { locale, setLocale } = useLocale()

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <span role="img" aria-label="playing card">
            🃏
          </span>
          <span>Scrum Poker</span>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocale(locale === 'ja' ? 'en' : 'ja')}
        >
          {locale === 'ja' ? 'EN' : '日本語'}
        </Button>
      </div>
    </header>
  )
}
