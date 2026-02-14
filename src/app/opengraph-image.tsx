import { ImageResponse } from 'next/og'

export const alt = 'Scrum Poker - チームでストーリーポイントを見積もるためのシンプルなツール'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#1a1a2e',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 120, marginBottom: 20 }}>🃏</div>
        <div
          style={{
            display: 'flex',
            fontSize: 64,
            fontWeight: 700,
            marginBottom: 24,
            letterSpacing: '0.02em',
          }}
        >
          Scrum Poker
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            color: '#a0a0b8',
            maxWidth: 800,
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          チームでストーリーポイントを見積もるためのシンプルなツール
        </div>
      </div>
    ),
    { ...size },
  )
}
