'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type RoomErrorPageProps = {
  readonly error: Error & { digest?: string }
  readonly reset: () => void
}

export default function RoomErrorPage({ reset }: RoomErrorPageProps) {
  return (
    <div className="mx-auto max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle>ルームの読み込みに失敗しました</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            ルーム情報の取得中にエラーが発生しました。ルームが存在しないか、接続に問題がある可能性があります。
          </p>
          <div className="flex gap-2">
            <Button onClick={reset}>再試行</Button>
            <Button variant="outline" onClick={() => (window.location.href = '/')}>
              ホームに戻る
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
