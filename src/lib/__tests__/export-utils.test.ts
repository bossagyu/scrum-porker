import { describe, it, expect } from 'vitest'
import { generateCsv, generateJson, type ExportSession } from '../export-utils'

const makeSession = (
  overrides: Partial<ExportSession> = {},
): ExportSession => ({
  topic: 'ユーザー認証',
  createdAt: '2026-02-09T10:00:00Z',
  votes: [
    { participantName: 'Alice', cardValue: '5' },
    { participantName: 'Bob', cardValue: '8' },
  ],
  ...overrides,
})

describe('generateCsv', () => {
  it('generates correct header row', () => {
    const csv = generateCsv([])
    expect(csv).toBe('ラウンド,トピック,日時,参加者,投票値')
  })

  it('generates CSV for a single session', () => {
    const session = makeSession()
    const csv = generateCsv([session])
    const lines = csv.split('\n')

    expect(lines).toHaveLength(3)
    expect(lines[0]).toBe('ラウンド,トピック,日時,参加者,投票値')
    expect(lines[1]).toBe('1,ユーザー認証,2026-02-09T10:00:00Z,Alice,5')
    expect(lines[2]).toBe('1,ユーザー認証,2026-02-09T10:00:00Z,Bob,8')
  })

  it('assigns incrementing round numbers for multiple sessions', () => {
    const sessions = [
      makeSession({ topic: 'Sprint 1' }),
      makeSession({ topic: 'Sprint 2' }),
      makeSession({ topic: 'Sprint 3' }),
    ]
    const csv = generateCsv(sessions)
    const lines = csv.split('\n')

    expect(lines[1]).toMatch(/^1,/)
    expect(lines[3]).toMatch(/^2,/)
    expect(lines[5]).toMatch(/^3,/)
  })

  it('returns only header for empty sessions array', () => {
    const csv = generateCsv([])
    expect(csv).toBe('ラウンド,トピック,日時,参加者,投票値')
    expect(csv.split('\n')).toHaveLength(1)
  })

  it('uses (トピックなし) when topic is empty string', () => {
    const session = makeSession({ topic: '' })
    const csv = generateCsv([session])
    const lines = csv.split('\n')

    expect(lines[1]).toContain('(トピックなし)')
  })

  it('escapes fields containing commas', () => {
    const session = makeSession({
      votes: [{ participantName: 'Last, First', cardValue: '3' }],
    })
    const csv = generateCsv([session])
    const lines = csv.split('\n')

    expect(lines[1]).toContain('"Last, First"')
  })

  it('escapes fields containing double quotes', () => {
    const session = makeSession({
      topic: 'Feature "Alpha"',
    })
    const csv = generateCsv([session])
    const lines = csv.split('\n')

    expect(lines[1]).toContain('"Feature ""Alpha"""')
  })

  it('escapes fields containing newlines', () => {
    const session = makeSession({
      votes: [{ participantName: 'Line1\nLine2', cardValue: '5' }],
    })
    const csv = generateCsv([session])

    expect(csv).toContain('"Line1\nLine2"')
  })

  it('does not escape fields without special characters', () => {
    const session = makeSession({
      topic: 'Simple Topic',
      votes: [{ participantName: 'Alice', cardValue: '5' }],
    })
    const csv = generateCsv([session])
    const lines = csv.split('\n')

    expect(lines[1]).toBe('1,Simple Topic,2026-02-09T10:00:00Z,Alice,5')
  })
})

describe('generateJson', () => {
  it('generates valid JSON for a single session', () => {
    const session = makeSession()
    const json = generateJson([session])
    const parsed = JSON.parse(json)

    expect(parsed).toHaveLength(1)
    expect(parsed[0]).toEqual({
      round: 1,
      topic: 'ユーザー認証',
      createdAt: '2026-02-09T10:00:00Z',
      votes: [
        { participant: 'Alice', value: '5' },
        { participant: 'Bob', value: '8' },
      ],
    })
  })

  it('assigns incrementing round numbers for multiple sessions', () => {
    const sessions = [
      makeSession({ topic: 'Round A' }),
      makeSession({ topic: 'Round B' }),
    ]
    const json = generateJson(sessions)
    const parsed = JSON.parse(json)

    expect(parsed[0].round).toBe(1)
    expect(parsed[1].round).toBe(2)
  })

  it('sets topic to null when topic is empty string', () => {
    const session = makeSession({ topic: '' })
    const json = generateJson([session])
    const parsed = JSON.parse(json)

    expect(parsed[0].topic).toBeNull()
  })

  it('returns empty array JSON for empty sessions', () => {
    const json = generateJson([])
    const parsed = JSON.parse(json)

    expect(parsed).toEqual([])
  })

  it('produces pretty-printed JSON with 2-space indent', () => {
    const session = makeSession({
      votes: [{ participantName: 'Alice', cardValue: '3' }],
    })
    const json = generateJson([session])

    expect(json).toContain('\n')
    expect(json).toContain('  ')
    expect(json).toBe(JSON.stringify(JSON.parse(json), null, 2))
  })

  it('maps participantName to participant and cardValue to value', () => {
    const session = makeSession({
      votes: [{ participantName: 'Taro', cardValue: '13' }],
    })
    const json = generateJson([session])
    const parsed = JSON.parse(json)

    expect(parsed[0].votes[0]).toEqual({
      participant: 'Taro',
      value: '13',
    })
    expect(parsed[0].votes[0]).not.toHaveProperty('participantName')
    expect(parsed[0].votes[0]).not.toHaveProperty('cardValue')
  })
})
