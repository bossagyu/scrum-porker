'use client'

import { useEffect, useRef, useState } from 'react'
import { useRoomStore } from '@/stores/room-store'
import { revealOnTimerExpiry } from '@/actions/vote'

export function CountdownTimer() {
  const timerDuration = useRoomStore((s) => s.timerDuration)
  const currentSession = useRoomStore((s) => s.currentSession)
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null)
  const hasTriggeredReveal = useRef(false)

  const sessionId = currentSession?.id ?? null
  const sessionCreatedAt = currentSession?.created_at ?? null
  const isRevealed = currentSession?.is_revealed ?? false

  useEffect(() => {
    hasTriggeredReveal.current = false
  }, [sessionId])

  useEffect(() => {
    if (!timerDuration || !sessionCreatedAt || isRevealed) {
      setRemainingSeconds(null)
      return
    }

    const calculateRemaining = () => {
      const endTime = new Date(sessionCreatedAt).getTime() + timerDuration * 1000
      const now = Date.now()
      return Math.max(0, Math.ceil((endTime - now) / 1000))
    }

    setRemainingSeconds(calculateRemaining())

    const interval = setInterval(() => {
      const remaining = calculateRemaining()
      setRemainingSeconds(remaining)

      if (remaining <= 0 && sessionId && !hasTriggeredReveal.current) {
        hasTriggeredReveal.current = true
        revealOnTimerExpiry(sessionId)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [timerDuration, sessionCreatedAt, sessionId, isRevealed])

  if (remainingSeconds === null) {
    return null
  }

  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  const display = `${minutes}:${seconds.toString().padStart(2, '0')}`
  const isUrgent = remainingSeconds <= 10

  return (
    <div
      className={`rounded-md px-3 py-1 text-lg font-mono font-bold ${
        isUrgent ? 'bg-destructive/10 text-destructive' : 'bg-muted text-foreground'
      }`}
      role="timer"
      aria-label={`残り時間 ${display}`}
    >
      {display}
    </div>
  )
}
