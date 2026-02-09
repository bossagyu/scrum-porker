'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type ErrorPageProps = {
  readonly error: Error & { digest?: string }
  readonly reset: () => void
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <div className="mx-auto max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle>エラーが発生しました</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            予期しないエラーが発生しました。もう一度お試しください。
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
