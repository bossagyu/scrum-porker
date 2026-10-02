import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { RoomHeader } from '../room-header'
import { useRoomStore } from '@/stores/room-store'
import messages from '../../../../messages/ja.json'

const initialStoreState = useRoomStore.getState()

function renderRoomHeader() {
  return render(
    <NextIntlClientProvider locale="ja" messages={messages}>
      <RoomHeader onToggleHistory={() => {}} />
    </NextIntlClientProvider>,
  )
}

describe('RoomHeader', () => {
  beforeEach(() => {
    useRoomStore.setState(initialStoreState, true)
  })

  it('ルーム名がある場合、見出しにルーム名が表示される', () => {
    useRoomStore.setState({
      roomId: 'room-1',
      roomCode: 'ABC123',
      roomName: 'スプリント27計画',
    })

    renderRoomHeader()

    expect(
      screen.getByRole('heading', { level: 1, name: 'スプリント27計画' }),
    ).toBeInTheDocument()
  })

  it('ルーム名がある場合でも、ルームコードが画面上に表示される', () => {
    useRoomStore.setState({
      roomId: 'room-1',
      roomCode: 'ABC123',
      roomName: 'スプリント27計画',
    })

    renderRoomHeader()

    expect(screen.getByText('Room: ABC123')).toBeInTheDocument()
  })

  it('ルーム名が無い場合、見出しに Room: <コード> が表示される', () => {
    useRoomStore.setState({
      roomId: 'room-1',
      roomCode: 'ABC123',
      roomName: null,
    })

    renderRoomHeader()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Room: ABC123' }),
    ).toBeInTheDocument()
  })
})
