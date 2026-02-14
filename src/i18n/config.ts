export const locales = ['ja', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'ja'

export function getMessages(locale: Locale) {
  return locale === 'ja'
    ? import('../../messages/ja.json').then((m) => m.default)
    : import('../../messages/en.json').then((m) => m.default)
}

export function detectLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale
  const stored = localStorage.getItem('locale')
  if (stored === 'ja' || stored === 'en') return stored
  const browserLang = navigator.language
  return browserLang.startsWith('ja') ? 'ja' : 'en'
}
