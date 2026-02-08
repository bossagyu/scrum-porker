import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import './globals.css'

export const metadata: Metadata = {
  title: 'Scrum Poker',
  description: 'シンプルで使いやすいスクラムポーカーツール',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-background antialiased">
        <Header />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  )
}
