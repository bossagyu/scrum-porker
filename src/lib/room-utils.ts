import { SPECIAL_CARDS } from './constants'

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const codeLength = 6
  const codeChars = Array.from({ length: codeLength }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  )
  return codeChars.join('')
}

export function isSpecialCard(value: string): boolean {
  return SPECIAL_CARDS.includes(value as (typeof SPECIAL_CARDS)[number])
}

export function isNumericCard(value: string): boolean {
  // Number('') と Number(' ') は 0 を返すので、空白のみの値は先に弾く。
  // Number.isFinite は 'Infinity' も弾く（平均が Infinity になるのを防ぐ）。
  if (value.trim() === '') return false
  return !isSpecialCard(value) && Number.isFinite(Number(value))
}

// カスタムカードに許す形。'0x10' や '1e3' や 'Infinity' は Number() を通ってしまい、
// カード面の文字列と計算に使われる値が食い違うため、素直な十進表記だけを許可する。
const DECIMAL_CARD_PATTERN = /^\d+(\.\d+)?$/

export function isValidCustomCardValue(value: string): boolean {
  return DECIMAL_CARD_PATTERN.test(value.trim())
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
    // 特殊カードは平均・中央値と同じく統計から除外する。
    // 数値でないカード（Tシャツの S/M/L）は除外しない — そちらは平均・中央値が
    // そもそも null なので、最頻値が唯一の統計になる。
    if (isSpecialCard(vote)) continue
    counts.set(vote, (counts.get(vote) ?? 0) + 1)
  }
  if (counts.size === 0) return []

  const maxCount = Math.max(...counts.values())
  // 何も重複していなければ最頻値は意味を持たない（全員が1票ずつのケース）。
  if (maxCount === 1) return []

  return [...counts.entries()].filter(([, count]) => count === maxCount).map(([value]) => value)
}

export function calculateDistribution(votes: readonly string[]): ReadonlyMap<string, number> {
  const distribution = new Map<string, number>()
  for (const vote of votes) {
    distribution.set(vote, (distribution.get(vote) ?? 0) + 1)
  }
  return distribution
}
