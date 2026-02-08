'use client'

import { useEffect, useState } from 'react'
import { useRoomStore } from '@/stores/room-store'
import { getSessionHistory, type SessionHistoryEntry } from '@/actions/history'
import { generateCsv, generateJson, downloadFile, type ExportSession } from '@/lib/export-utils'
import { SPECIAL_CARDS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function calculateSessionAverage(
  votes: readonly { readonly cardValue: string }[],
): string {
  const numericVotes = votes
    .map((v) => v.cardValue)
    .filter((v) => !SPECIAL_CARDS.includes(v as (typeof SPECIAL_CARDS)[number]))
    .map(Number)
    .filter((n) => !isNaN(n))

  if (numericVotes.length === 0) return '---'
  const avg = numericVotes.reduce((sum, v) => sum + v, 0) / numericVotes.length
  return avg.toFixed(1)
}

type SessionHistoryProps = {
  readonly onClose: () => void
}

export function SessionHistory({ onClose }: SessionHistoryProps) {
  const roomId = useRoomStore((s) => s.roomId)
  const [history, setHistory] = useState<readonly SessionHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!roomId) return

    const fetchHistory = async () => {
      setLoading(true)
      const result = await getSessionHistory(roomId)
      if (result.error) {
        setError(result.error)
      } else {
        setHistory(result.data ?? [])
      }
      setLoading(false)
    }

    fetchHistory()
  }, [roomId])

  const handleExportCsv = () => {
    const sessions: ExportSession[] = history.map((h) => ({
      topic: h.topic,
      createdAt: h.createdAt,
      votes: h.votes,
    }))
    const csv = generateCsv(sessions)
    downloadFile(csv, 'scrum-poker-history.csv', 'text/csv;charset=utf-8')
  }

  const handleExportJson = () => {
    const sessions: ExportSession[] = history.map((h) => ({
      topic: h.topic,
      createdAt: h.createdAt,
      votes: h.votes,
    }))
    const json = generateJson(sessions)
    downloadFile(json, 'scrum-poker-history.json', 'application/json')
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>セッション履歴</CardTitle>
        <div className="flex gap-2">
          {history.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={handleExportCsv}>
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportJson}>
                JSON
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            閉じる
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-muted-foreground text-sm">読み込み中...</p>}
        {error && <p className="text-destructive text-sm">{error}</p>}
        {!loading && !error && history.length === 0 && (
          <p className="text-muted-foreground text-sm">まだ公開済みのラウンドはありません</p>
        )}
        {!loading && !error && history.length > 0 && (
          <div className="space-y-4">
            {history.map((session, index) => (
              <div key={session.id} className="rounded-md border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    ラウンド {history.length - index}
                    {session.topic ? `: ${session.topic}` : ''}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    平均: {calculateSessionAverage(session.votes)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {session.votes.map((vote, vIndex) => (
                    <div
                      key={`${session.id}-${vIndex}`}
                      className="flex items-center gap-1 rounded bg-muted px-2 py-1 text-sm"
                    >
                      <span className="text-muted-foreground">{vote.participantName}:</span>
                      <span className="font-bold">{vote.cardValue}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
