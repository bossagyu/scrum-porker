import { SPECIAL_CARDS } from './constants'

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const codeLength = 6
  const codeChars = Array.from({ length: codeLength }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  )
  return codeChars.join('')
}

export function isNumericCard(value: string): boolean {
  return !SPECIAL_CARDS.includes(value as (typeof SPECIAL_CARDS)[number]) && !isNaN(Number(value))
}

export function getNumericValues(votes: readonly string[]): readonly number[] {
  return votes.filter(isNumericCard).map(Number)
}

export function calculateAverage(votes: readonly string[]): number | null {
  const numeric = getNumericValues(votes)
  if (numeric.length === 0) return null
  return numeric.reduce((sum, v) => sum + v, 0) / numeric.length
}

export function calculateMedian(votes: readonly string[]): number | null {
  const numeric = [...getNumericValues(votes)].sort((a, b) => a - b)
  if (numeric.length === 0) return null
  const mid = Math.floor(numeric.length / 2)
  return numeric.length % 2 !== 0 ? numeric[mid] : (numeric[mid - 1] + numeric[mid]) / 2
}

export function calculateMode(votes: readonly string[]): readonly string[] {
  const counts = new Map<string, number>()
  for (const vote of votes) {
    counts.set(vote, (counts.get(vote) ?? 0) + 1)
  }
  const maxCount = Math.max(...counts.values())
  if (maxCount === 0) return []
  return [...counts.entries()]
    .filter(([, count]) => count === maxCount)
    .map(([value]) => value)
}

export function calculateDistribution(votes: readonly string[]): ReadonlyMap<string, number> {
  const distribution = new Map<string, number>()
  for (const vote of votes) {
    distribution.set(vote, (distribution.get(vote) ?? 0) + 1)
  }
  return distribution
}
