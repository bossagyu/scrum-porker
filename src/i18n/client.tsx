'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { type Locale, detectLocale, getMessages } from './config'

type LocaleContextType = {
  readonly locale: Locale
  readonly setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextType>({
  locale: 'ja',
  setLocale: () => {},
})

export function useLocale() {
  return useContext(LocaleContext)
}

export function I18nProvider({ children }: { readonly children: ReactNode }) {
  // detectLocale 自身が typeof window === 'undefined' を見て既定値を返すので、
  // 遅延初期化で足りる。effect で上書きすると余分な再描画が1回増える。
  const [locale, setLocaleState] = useState<Locale>(detectLocale)
  const [messages, setMessages] = useState<Record<string, unknown> | null>(null)

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
  }

  useEffect(() => {
    getMessages(locale).then(setMessages)
  }, [locale])

  if (!messages) return null

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  )
}
