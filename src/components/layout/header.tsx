import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <span role="img" aria-label="playing card">
            🃏
          </span>
          <span>Scrum Poker</span>
        </Link>
      </div>
    </header>
  )
}
