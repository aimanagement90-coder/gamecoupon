import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Only create client if we have valid environment variables
export const supabase = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseKey !== 'placeholder-key' 
  ? createClient(supabaseUrl, supabaseKey)
  : createClient('https://placeholder.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder')

export type Database = {
  public: {
    Tables: {
      games: {
        Row: {
          id: string
          name: string
          description: string
          code: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          code: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          code?: string
          created_at?: string
        }
      }
      coupons: {
        Row: {
          id: string
          user_id: string
          game_id: string
          code: string
          description: string
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_id: string
          code: string
          description: string
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_id?: string
          code?: string
          description?: string
          discount_type?: 'percentage' | 'fixed'
          discount_value?: number
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          business_name: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          business_name?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          business_name?: string
          created_at?: string
        }
      }
    }
  }
}