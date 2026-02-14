'use client'

import { useEffect } from 'react'
import { useLocale } from '@/i18n/client'

export function HtmlLangSync() {
  const { locale } = useLocale()

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return null
}
