import { describe, it, expect } from 'vitest'
import { CARD_SETS, SPECIAL_CARDS } from '../constants'

describe('CARD_SETS', () => {
  describe('fibonacci', () => {
    it('has the correct name', () => {
      expect(CARD_SETS.fibonacci.name).toBe('フィボナッチ数列')
    })

    it('has the correct cards', () => {
      expect(CARD_SETS.fibonacci.cards).toEqual([
        '0', '1', '2', '3', '5', '8', '13', '21', '34', '?', '∞', '☕',
      ])
    })
  })

  describe('tshirt', () => {
    it('has the correct name', () => {
      expect(CARD_SETS.tshirt.name).toBe('Tシャツサイズ')
    })

    it('has the correct cards', () => {
      expect(CARD_SETS.tshirt.cards).toEqual([
        'XS', 'S', 'M', 'L', 'XL', 'XXL', '?', '☕',
      ])
    })
  })

  describe('powerOf2', () => {
    it('has the correct name', () => {
      expect(CARD_SETS.powerOf2.name).toBe('2のべき乗')
    })

    it('has the correct cards', () => {
      expect(CARD_SETS.powerOf2.cards).toEqual([
        '1', '2', '4', '8', '16', '32', '64', '?', '∞', '☕',
      ])
    })
  })

  it('all card sets have a name property', () => {
    for (const key of Object.keys(CARD_SETS) as (keyof typeof CARD_SETS)[]) {
      expect(CARD_SETS[key].name).toBeDefined()
      expect(typeof CARD_SETS[key].name).toBe('string')
      expect(CARD_SETS[key].name.length).toBeGreaterThan(0)
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
