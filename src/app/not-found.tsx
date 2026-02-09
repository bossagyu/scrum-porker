import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle>ページが見つかりません</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            お探しのページは存在しないか、移動した可能性があります。
          </p>
          <Button asChild>
            <Link href="/">ホームに戻る</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
