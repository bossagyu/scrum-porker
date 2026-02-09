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
        'flex h-20 w-14 items-center justify-center rounded-lg border-2 text-lg font-bold',
        'transition-all duration-200 ease-out',
        'sm:h-24 sm:w-16',
        'hover:-translate-y-1 hover:shadow-md',
        'active:scale-95',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none',
        isSelected
          ? 'border-primary bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30'
          : 'border-border bg-card hover:border-primary/50',
      )}
    >
      {value}
    </button>
  )
}
