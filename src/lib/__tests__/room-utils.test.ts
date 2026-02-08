import { describe, it, expect } from 'vitest'
import {
  generateRoomCode,
  isNumericCard,
  calculateAverage,
  calculateMedian,
  calculateMode,
  calculateDistribution,
} from '../room-utils'

describe('generateRoomCode', () => {
  const validChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

  it('generates a 6 character string', () => {
    const code = generateRoomCode()
    expect(code).toHaveLength(6)
  })

  it('only contains valid characters', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateRoomCode()
      for (const char of code) {
        expect(validChars).toContain(char)
      }
    }
  })

  it('generates different codes each time', () => {
    const codes = new Set(Array.from({ length: 20 }, () => generateRoomCode()))
    expect(codes.size).toBeGreaterThan(1)
  })

  it('excludes ambiguous characters (O, I, 0, 1)', () => {
    for (let i = 0; i < 100; i++) {
      const code = generateRoomCode()
      expect(code).not.toMatch(/[OI01]/)
    }
  })
})

describe('isNumericCard', () => {
  it('returns true for numeric strings', () => {
    expect(isNumericCard('0')).toBe(true)
    expect(isNumericCard('1')).toBe(true)
    expect(isNumericCard('5')).toBe(true)
    expect(isNumericCard('13')).toBe(true)
    expect(isNumericCard('34')).toBe(true)
  })

  it('returns false for special cards', () => {
    expect(isNumericCard('?')).toBe(false)
    expect(isNumericCard('∞')).toBe(false)
    expect(isNumericCard('☕')).toBe(false)
  })

  it('returns false for non-numeric strings', () => {
    expect(isNumericCard('XS')).toBe(false)
    expect(isNumericCard('S')).toBe(false)
    expect(isNumericCard('M')).toBe(false)
    expect(isNumericCard('L')).toBe(false)
  })
})

describe('calculateAverage', () => {
  it('returns correct average for numeric votes', () => {
    expect(calculateAverage(['1', '2', '3'])).toBe(2)
    expect(calculateAverage(['5', '8', '13'])).toBeCloseTo(8.667, 2)
  })

  it('returns null for empty array', () => {
    expect(calculateAverage([])).toBeNull()
  })

  it('ignores special cards', () => {
    expect(calculateAverage(['1', '3', '?', '∞', '☕'])).toBe(2)
  })

  it('returns null when all votes are special cards', () => {
    expect(calculateAverage(['?', '∞', '☕'])).toBeNull()
  })

  it('handles single vote', () => {
    expect(calculateAverage(['5'])).toBe(5)
  })
})

describe('calculateMedian', () => {
  it('returns correct median for odd count', () => {
    expect(calculateMedian(['1', '3', '5'])).toBe(3)
    expect(calculateMedian(['2', '8', '13'])).toBe(8)
  })

  it('returns correct median for even count', () => {
    expect(calculateMedian(['1', '2', '3', '8'])).toBe(2.5)
    expect(calculateMedian(['5', '8'])).toBe(6.5)
  })

  it('returns null for empty array', () => {
    expect(calculateMedian([])).toBeNull()
  })

  it('ignores special cards', () => {
    expect(calculateMedian(['1', '5', '8', '?', '☕'])).toBe(5)
  })

  it('returns null when all votes are special cards', () => {
    expect(calculateMedian(['?', '∞'])).toBeNull()
  })

  it('handles single vote', () => {
    expect(calculateMedian(['13'])).toBe(13)
  })

  it('sorts numerically, not lexicographically', () => {
    expect(calculateMedian(['2', '13', '8'])).toBe(8)
  })
})

describe('calculateMode', () => {
  it('returns the most frequent value', () => {
    expect(calculateMode(['5', '5', '8'])).toEqual(['5'])
  })

  it('handles ties by returning multiple values', () => {
    const result = calculateMode(['3', '3', '5', '5'])
    expect(result).toContain('3')
    expect(result).toContain('5')
    expect(result).toHaveLength(2)
  })

  it('returns empty array for empty input', () => {
    expect(calculateMode([])).toEqual([])
  })

  it('includes special cards in mode calculation', () => {
    expect(calculateMode(['?', '?', '5'])).toEqual(['?'])
  })

  it('handles single vote', () => {
    expect(calculateMode(['8'])).toEqual(['8'])
  })

  it('returns all values when all have equal count', () => {
    const result = calculateMode(['1', '3', '5'])
    expect(result).toHaveLength(3)
    expect(result).toContain('1')
    expect(result).toContain('3')
    expect(result).toContain('5')
  })
})

describe('calculateDistribution', () => {
  it('returns correct distribution map', () => {
    const result = calculateDistribution(['5', '5', '8', '13'])
    expect(result.get('5')).toBe(2)
    expect(result.get('8')).toBe(1)
    expect(result.get('13')).toBe(1)
  })

  it('returns empty map for empty input', () => {
    const result = calculateDistribution([])
    expect(result.size).toBe(0)
  })

  it('includes special cards in distribution', () => {
    const result = calculateDistribution(['5', '?', '?', '☕'])
    expect(result.get('5')).toBe(1)
    expect(result.get('?')).toBe(2)
    expect(result.get('☕')).toBe(1)
  })

  it('handles all same votes', () => {
    const result = calculateDistribution(['3', '3', '3'])
    expect(result.size).toBe(1)
    expect(result.get('3')).toBe(3)
  })
})
