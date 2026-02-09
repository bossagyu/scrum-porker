export type Database = {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string
          code: string
          name: string
          created_by: string | null
          card_set: string
          auto_reveal: boolean
          timer_duration: number | null
          allow_all_control: boolean
          is_active: boolean
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          created_by?: string | null
          card_set?: string
          auto_reveal?: boolean
          timer_duration?: number | null
          allow_all_control?: boolean
          is_active?: boolean
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          created_by?: string | null
          card_set?: string
          auto_reveal?: boolean
          timer_duration?: number | null
          allow_all_control?: boolean
          is_active?: boolean
          created_at?: string
          expires_at?: string
        }
        Relationships: []
      }
      participants: {
        Row: {
          id: string
          room_id: string
          user_id: string | null
          display_name: string
          is_facilitator: boolean
          is_observer: boolean
          is_active: boolean
          joined_at: string
          last_active_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id?: string | null
          display_name: string
          is_facilitator?: boolean
          is_observer?: boolean
          is_active?: boolean
          joined_at?: string
          last_active_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string | null
          display_name?: string
          is_facilitator?: boolean
          is_observer?: boolean
          is_active?: boolean
          joined_at?: string
          last_active_at?: string
        }
        Relationships: []
      }
      voting_sessions: {
        Row: {
          id: string
          room_id: string
          topic: string
          is_revealed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          topic?: string
          is_revealed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          topic?: string
          is_revealed?: boolean
          created_at?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          id: string
          session_id: string
          participant_id: string
          card_value: string
          voted_at: string
        }
        Insert: {
          id?: string
          session_id: string
          participant_id: string
          card_value: string
          voted_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          participant_id?: string
          card_value?: string
          voted_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_reveal_if_complete: {
        Args: { p_session_id: string }
        Returns: boolean
      }
      reveal_on_timer_expiry: {
        Args: { p_session_id: string }
        Returns: boolean
      }
      get_my_room_ids: {
        Args: Record<string, never>
        Returns: string[]
      }
      get_my_participant_ids: {
        Args: Record<string, never>
        Returns: string[]
      }
      get_my_facilitator_room_ids: {
        Args: Record<string, never>
        Returns: string[]
      }
      get_my_controllable_room_ids: {
        Args: Record<string, never>
        Returns: string[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
