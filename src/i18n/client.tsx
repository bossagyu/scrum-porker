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
  const [locale, setLocaleState] = useState<Locale>('ja')
  const [messages, setMessages] = useState<Record<string, unknown> | null>(null)

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
  }

  useEffect(() => {
    // detectLocale は localStorage と navigator.language を読むため
    // サーバーでは実行できない。既定の 'ja' で描画してからマウント後に
    // 上書きする（描画中に行うとハイドレーション不一致になる）。
    const detected = detectLocale()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocaleState(detected)
  }, [])

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
