import { describe, it, expect } from 'vitest'
import { CARD_SETS, SPECIAL_CARDS, getCardsForRoom } from '../constants'

describe('CARD_SETS', () => {
  describe('fibonacci', () => {
    it('has the correct nameKey', () => {
      expect(CARD_SETS.fibonacci.nameKey).toBe('cardSets.fibonacci')
    })

    it('has the correct cards', () => {
      expect(CARD_SETS.fibonacci.cards).toEqual([
        '0', '1', '2', '3', '5', '8', '13', '21', '34', '?', '∞', '☕',
      ])
    })
  })

  describe('tshirt', () => {
    it('has the correct nameKey', () => {
      expect(CARD_SETS.tshirt.nameKey).toBe('cardSets.tshirt')
    })

    it('has the correct cards', () => {
      expect(CARD_SETS.tshirt.cards).toEqual([
        'XS', 'S', 'M', 'L', 'XL', 'XXL', '?', '☕',
      ])
    })
  })

  describe('powerOf2', () => {
    it('has the correct nameKey', () => {
      expect(CARD_SETS.powerOf2.nameKey).toBe('cardSets.powerOf2')
    })

    it('has the correct cards', () => {
      expect(CARD_SETS.powerOf2.cards).toEqual([
        '1', '2', '4', '8', '16', '32', '64', '?', '∞', '☕',
      ])
    })
  })

  it('all card sets have a nameKey property', () => {
    for (const key of Object.keys(CARD_SETS) as (keyof typeof CARD_SETS)[]) {
      expect(CARD_SETS[key].nameKey).toBeDefined()
      expect(typeof CARD_SETS[key].nameKey).toBe('string')
      expect(CARD_SETS[key].nameKey.length).toBeGreaterThan(0)
    }
  })
})

describe('SPECIAL_CARDS', () => {
  it('contains the expected special cards', () => {
    expect(SPECIAL_CARDS).toContain('?')
    expect(SPECIAL_CARDS).toContain('∞')
    expect(SPECIAL_CARDS).toContain('☕')
  })

  it('has exactly 3 special cards', () => {
    expect(SPECIAL_CARDS).toHaveLength(3)
  })
})

describe('getCardsForRoom', () => {
  it('returns preset cards for fibonacci', () => {
    expect(getCardsForRoom('fibonacci', null)).toEqual(CARD_SETS.fibonacci.cards)
  })

  it('returns preset cards for tshirt', () => {
    expect(getCardsForRoom('tshirt', null)).toEqual(CARD_SETS.tshirt.cards)
  })

  it('returns custom cards + special cards when cardSet is custom', () => {
    const customCards = ['1', '2', '3', '5', '8']
    const result = getCardsForRoom('custom', customCards)
    expect(result).toEqual(['1', '2', '3', '5', '8', '?', '∞', '☕'])
  })

  it('falls back to fibonacci when custom has empty array', () => {
    expect(getCardsForRoom('custom', [])).toEqual(CARD_SETS.fibonacci.cards)
  })

  it('falls back to fibonacci when custom has null', () => {
    expect(getCardsForRoom('custom', null)).toEqual(CARD_SETS.fibonacci.cards)
  })

  it('falls back to fibonacci for unknown card set', () => {
    expect(getCardsForRoom('unknown', null)).toEqual(CARD_SETS.fibonacci.cards)
  })
})
