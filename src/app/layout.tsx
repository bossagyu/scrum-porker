import type { Metadata } from 'next'
import Script from 'next/script'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Header } from '@/components/layout/header'
import { HtmlLangSync } from '@/components/layout/html-lang-sync'
import { ThemeProvider } from '@/components/layout/theme-provider'
import { I18nProvider } from '@/i18n/client'
import './globals.css'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Scrum Poker',
    template: '%s | Scrum Poker',
  },
  description:
    'シンプルで使いやすいスクラムポーカーツール。リアルタイムでチームのストーリーポイント見積もりを効率化。',
  keywords: [
    'スクラム',
    'ポーカー',
    'アジャイル',
    '見積もり',
    'プランニングポーカー',
    'scrum',
    'poker',
    'agile',
    'estimation',
    'planning poker',
  ],
  authors: [{ name: 'Scrum Poker Team' }],
  icons: {
    icon: '/favicon.svg',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
    languages: {
      ja: '/',
      en: '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: 'en_US',
    url: baseUrl,
    siteName: 'Scrum Poker',
    title: 'Scrum Poker',
    description: 'シンプルで使いやすいスクラムポーカーツール',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scrum Poker',
    description: 'シンプルで使いやすいスクラムポーカーツール',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Scrum Poker',
  description:
    'シンプルで使いやすいスクラムポーカーツール。リアルタイムでチームのストーリーポイント見積もりを効率化。',
  url: baseUrl,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'All',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'JPY',
  },
  inLanguage: ['ja', 'en'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LKL6BQNC8V"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LKL6BQNC8V');
          `}
        </Script>
      </head>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider>
          <I18nProvider>
            <HtmlLangSync />
            <Header />
            <main className="container mx-auto px-4 py-8">{children}</main>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
