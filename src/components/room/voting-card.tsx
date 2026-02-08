'use client'

import { cn } from '@/lib/utils'

type VotingCardProps = {
  readonly value: string
  readonly isSelected: boolean
  readonly isDisabled: boolean
  readonly onSelect: (value: string) => void
}

export function VotingCard({
  value,
  isSelected,
  isDisabled,
  onSelect,
}: VotingCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      disabled={isDisabled}
      className={cn(
        'flex h-24 w-16 items-center justify-center rounded-lg border-2 text-lg font-bold transition-all',
        'hover:scale-105 hover:shadow-md',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none',
        isSelected
          ? 'border-primary bg-primary text-primary-foreground shadow-md'
          : 'border-border bg-card hover:border-primary/50',
      )}
    >
      {value}
    </button>
  )
}
