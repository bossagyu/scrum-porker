export type ExportSession = {
  readonly topic: string
  readonly createdAt: string
  readonly votes: readonly {
    readonly participantName: string
    readonly cardValue: string
  }[]
}

export function generateCsv(sessions: readonly ExportSession[]): string {
  const header = 'ラウンド,トピック,日時,参加者,投票値'
  const rows = sessions.flatMap((session, index) =>
    session.votes.map((vote) =>
      [
        index + 1,
        escapeCsvField(session.topic || '(トピックなし)'),
        session.createdAt,
        escapeCsvField(vote.participantName),
        escapeCsvField(vote.cardValue),
      ].join(','),
    ),
  )

  return [header, ...rows].join('\n')
}

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function generateJson(sessions: readonly ExportSession[]): string {
  return JSON.stringify(
    sessions.map((session, index) => ({
      round: index + 1,
      topic: session.topic || null,
      createdAt: session.createdAt,
      votes: session.votes.map((v) => ({
        participant: v.participantName,
        value: v.cardValue,
      })),
    })),
    null,
    2,
  )
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
