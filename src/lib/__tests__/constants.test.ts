import { describe, it, expect } from 'vitest'
import { CARD_SETS, SPECIAL_CARDS, getCardsForRoom, isAllowedCardValue } from '../constants'

describe('CARD_SETS', () => {
  describe('fibonacci', () => {
    it('has the correct nameKey', () => {
      expect(CARD_SETS.fibonacci.nameKey).toBe('cardSets.fibonacci')
    })

    it('has the correct cards', () => {
      expect(CARD_SETS.fibonacci.cards).toEqual([
        '0',
        '0.5',
        '1',
        '2',
        '3',
        '5',
        '8',
        '13',
        '21',
        '34',
        '?',
        '∞',
        '☕',
      ])
    })
  })

  describe('tshirt', () => {
    it('has the correct nameKey', () => {
      expect(CARD_SETS.tshirt.nameKey).toBe('cardSets.tshirt')
    })

    it('has the correct cards', () => {
      expect(CARD_SETS.tshirt.cards).toEqual(['XS', 'S', 'M', 'L', 'XL', 'XXL', '?', '☕'])
    })
  })

  describe('powerOf2', () => {
    it('has the correct nameKey', () => {
      expect(CARD_SETS.powerOf2.nameKey).toBe('cardSets.powerOf2')
    })

    it('has the correct cards', () => {
      expect(CARD_SETS.powerOf2.cards).toEqual([
        '1',
        '2',
        '4',
        '8',
        '16',
        '32',
        '64',
        '?',
        '∞',
        '☕',
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

describe('isAllowedCardValue', () => {
  it('accepts values from the room card set', () => {
    expect(isAllowedCardValue('fibonacci', null, '5')).toBe(true)
    expect(isAllowedCardValue('fibonacci', null, '0.5')).toBe(true)
    expect(isAllowedCardValue('tshirt', null, 'M')).toBe(true)
    expect(isAllowedCardValue('powerOf2', null, '64')).toBe(true)
  })

  it('accepts special cards', () => {
    expect(isAllowedCardValue('fibonacci', null, '?')).toBe(true)
    expect(isAllowedCardValue('fibonacci', null, '☕')).toBe(true)
    expect(isAllowedCardValue('tshirt', null, '☕')).toBe(true)
  })

  it('rejects values that are not on any card of the room', () => {
    // 細工したリクエストで最頻値に空白や Infinity が出るのを防ぐ
    expect(isAllowedCardValue('fibonacci', null, ' ')).toBe(false)
    expect(isAllowedCardValue('fibonacci', null, '')).toBe(false)
    expect(isAllowedCardValue('fibonacci', null, 'Infinity')).toBe(false)
    expect(isAllowedCardValue('fibonacci', null, '-3')).toBe(false)
    expect(isAllowedCardValue('fibonacci', null, '7')).toBe(false)
  })

  it('rejects a card from a different card set', () => {
    // フィボナッチのルームに T シャツの値は投げられない
    expect(isAllowedCardValue('fibonacci', null, 'M')).toBe(false)
    expect(isAllowedCardValue('tshirt', null, '13')).toBe(false)
  })

  it('uses the room custom cards when the set is custom', () => {
    expect(isAllowedCardValue('custom', ['2', '4', '6'], '4')).toBe(true)
    expect(isAllowedCardValue('custom', ['2', '4', '6'], '☕')).toBe(true)
    expect(isAllowedCardValue('custom', ['2', '4', '6'], '5')).toBe(false)
  })
})
