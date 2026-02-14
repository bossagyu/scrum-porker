'use client'

import Link from 'next/link'
import { Globe } from 'lucide-react'
import { useLocale } from '@/i18n/client'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/layout/theme-toggle'

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
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocale(locale === 'ja' ? 'en' : 'ja')}
            className="gap-1.5"
          >
            <Globe className="size-4" />
            {locale === 'ja' ? 'EN' : '日本語'}
          </Button>
        </div>
      </div>
    </header>
  )
}
