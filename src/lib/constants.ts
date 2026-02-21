export const CARD_SETS = {
  fibonacci: {
    nameKey: 'cardSets.fibonacci',
    cards: ['0', '0.5', '1', '2', '3', '5', '8', '13', '21', '34', '?', '∞', '☕'],
  },
  tshirt: {
    nameKey: 'cardSets.tshirt',
    cards: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?', '☕'],
  },
  powerOf2: {
    nameKey: 'cardSets.powerOf2',
    cards: ['1', '2', '4', '8', '16', '32', '64', '?', '∞', '☕'],
  },
  custom: {
    nameKey: 'cardSets.custom',
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
  if (cardSet === 'custom') {
    if (customCards && customCards.length > 0) {
      return [...customCards, ...SPECIAL_CARDS]
    }
    return CARD_SETS.fibonacci.cards
  }
  const preset = CARD_SETS[cardSet as CardSetType]
  return preset ? preset.cards : CARD_SETS.fibonacci.cards
}

// Timer duration options in seconds (null = no timer)
export const TIMER_OPTIONS = [
  { value: null, labelKey: 'timer.none' },
  { value: 30, labelKey: 'timer.seconds' },
  { value: 60, labelKey: 'timer.minutes' },
  { value: 120, labelKey: 'timer.minutes' },
  { value: 300, labelKey: 'timer.minutes' },
] as const

// localStorage key for remembering display name
export const DISPLAY_NAME_STORAGE_KEY = 'scrum-poker-display-name'
