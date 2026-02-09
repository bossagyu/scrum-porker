'use client'

import { useRoomStore } from '@/stores/room-store'
import {
  calculateAverage,
  calculateMedian,
  calculateMode,
  calculateDistribution,
} from '@/lib/room-utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function VoteSummary() {
  const votes = useRoomStore((s) => s.votes)

  const cardValues = votes.map((v) => v.card_value)
  const average = calculateAverage(cardValues)
  const median = calculateMedian(cardValues)
  const mode = calculateMode(cardValues)
  const distribution = calculateDistribution(cardValues)

  const totalVotes = cardValues.length
  const maxCount = Math.max(...distribution.values(), 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>統計</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-muted-foreground text-sm">平均</p>
            <p className="text-2xl font-bold">
              {average !== null ? average.toFixed(1) : '---'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">中央値</p>
            <p className="text-2xl font-bold">
              {median !== null ? median.toFixed(1) : '---'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">最頻値</p>
            <p className="text-2xl font-bold">
              {mode.length > 0 ? mode.join(', ') : '---'}
            </p>
          </div>
        </div>

        {totalVotes > 0 && (
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm font-medium">分布</p>
            {[...distribution.entries()].map(([value, count]) => (
              <div key={value} className="flex items-center gap-2">
                <span className="w-10 text-right text-sm font-medium">
                  {value}
                </span>
                <div className="flex-1">
                  <div
                    className="bg-primary h-6 rounded transition-all duration-700 ease-out"
                    style={{
                      width:
                        maxCount > 0
                          ? `${(count / maxCount) * 100}%`
                          : '0%',
                    }}
                  />
                </div>
                <span className="text-muted-foreground w-8 text-sm">
                  {count}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
