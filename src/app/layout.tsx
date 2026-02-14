import type { Metadata } from 'next'
import Script from 'next/script'
import { Header } from '@/components/layout/header'
import './globals.css'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  title: {
    default: 'Scrum Poker',
    template: '%s | Scrum Poker',
  },
  description:
    'シンプルで使いやすいスクラムポーカーツール。リアルタイムでチームのストーリーポイント見積もりを効率化。',
  keywords: ['スクラム', 'ポーカー', 'アジャイル', '見積もり', 'プランニングポーカー'],
  authors: [{ name: 'Scrum Poker Team' }],
  icons: {
    icon: '/favicon.svg',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: baseUrl,
    siteName: 'Scrum Poker',
    title: 'Scrum Poker',
    description: 'シンプルで使いやすいスクラムポーカーツール',
  },
  twitter: {
    card: 'summary',
    title: 'Scrum Poker',
    description: 'シンプルで使いやすいスクラムポーカーツール',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
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
        <Header />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  )
}
