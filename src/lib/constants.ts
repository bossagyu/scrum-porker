export const CARD_SETS = {
  fibonacci: {
    name: 'フィボナッチ数列',
    cards: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '?', '∞', '☕'],
  },
  tshirt: {
    name: 'Tシャツサイズ',
    cards: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?', '☕'],
  },
  powerOf2: {
    name: '2のべき乗',
    cards: ['1', '2', '4', '8', '16', '32', '64', '?', '∞', '☕'],
  },
  custom: {
    name: 'カスタム',
    cards: [] as string[],
  },
} as const

export type CardSetType = keyof typeof CARD_SETS

// Special cards that cannot be used in numeric calculations
export const SPECIAL_CARDS = ['?', '∞', '☕'] as const

// Get cards for a room, merging custom cards with special cards if custom
export function getCardsForRoom(
  cardSet: string,
  customCards: string[] | null,
): readonly string[] {
  if (cardSet === 'custom' && customCards && customCards.length > 0) {
    return [...customCards, ...SPECIAL_CARDS]
  }
  const preset = CARD_SETS[cardSet as CardSetType]
  return preset ? preset.cards : CARD_SETS.fibonacci.cards
}

// Timer duration options in seconds (null = no timer)
export const TIMER_OPTIONS = [
  { value: null, label: 'なし' },
  { value: 30, label: '30秒' },
  { value: 60, label: '1分' },
  { value: 120, label: '2分' },
  { value: 300, label: '5分' },
] as const
