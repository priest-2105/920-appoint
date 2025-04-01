export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      hairstyles: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          duration: number
          category: string
          image_url: string | null
          materials: string | null // Add materials field
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          duration: number
          category: string
          image_url?: string | null
          materials?: string | null // Add materials field
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          duration?: number
          category?: string
          image_url?: string | null
          materials?: string | null // Add materials field
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          customer_id: string | null
          hairstyle_id: string | null
          appointment_date: string
          status: string
          payment_id: string | null
          payment_status: string | null
          payment_amount: number | null
          google_calendar_event_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          hairstyle_id?: string | null
          appointment_date: string
          status?: string
          payment_id?: string | null
          payment_status?: string | null
          payment_amount?: number | null
          google_calendar_event_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          hairstyle_id?: string | null
          appointment_date?: string
          status?: string
          payment_id?: string | null
          payment_status?: string | null
          payment_amount?: number | null
          google_calendar_event_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          created_at?: string
          updated_at?: string
        }
      }
      available_slots: {
        Row: {
          id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          day_of_week: number
          start_time: string
          end_time: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      blocked_dates: {
        Row: {
          id: string
          date: string
          reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

