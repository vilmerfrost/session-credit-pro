export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_insights: {
        Row: {
          client_id: string
          created_at: string
          generated_at: string
          id: string
          insights: Json
          trainer_id: string
          viewed_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          generated_at?: string
          id?: string
          insights: Json
          trainer_id: string
          viewed_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          generated_at?: string
          id?: string
          insights?: Json
          trainer_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_insights_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_history: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          invoice_pdf_url: string | null
          paid_at: string | null
          status: string
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          trainer_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          id?: string
          invoice_pdf_url?: string | null
          paid_at?: string | null
          status: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          trainer_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          invoice_pdf_url?: string | null
          paid_at?: string | null
          status?: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_history_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_slots: {
        Row: {
          created_at: string
          current_bookings: number
          end_time: string
          id: string
          is_available: boolean
          max_bookings: number
          notes: string | null
          start_time: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_bookings?: number
          end_time: string
          id?: string
          is_available?: boolean
          max_bookings?: number
          notes?: string | null
          start_time: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_bookings?: number
          end_time?: string
          id?: string
          is_available?: boolean
          max_bookings?: number
          notes?: string | null
          start_time?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_slots_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_slot_id: string | null
          canceled_at: string | null
          cancellation_reason: string | null
          client_id: string
          client_user_id: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          id: string
          notes: string | null
          reminder_sent: boolean
          scheduled_end: string
          scheduled_start: string
          session_id: string | null
          status: Database["public"]["Enums"]["booking_status"]
          trainer_id: string
          updated_at: string
        }
        Insert: {
          booking_slot_id?: string | null
          canceled_at?: string | null
          cancellation_reason?: string | null
          client_id: string
          client_user_id?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          reminder_sent?: boolean
          scheduled_end: string
          scheduled_start: string
          session_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          trainer_id: string
          updated_at?: string
        }
        Update: {
          booking_slot_id?: string | null
          canceled_at?: string | null
          cancellation_reason?: string | null
          client_id?: string
          client_user_id?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          reminder_sent?: boolean
          scheduled_end?: string
          scheduled_start?: string
          session_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_booking_slot_id_fkey"
            columns: ["booking_slot_id"]
            isOneToOne: false
            referencedRelation: "booking_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_client_user_id_fkey"
            columns: ["client_user_id"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_invitations: {
        Row: {
          accepted_at: string | null
          client_id: string | null
          created_at: string
          email: string
          expires_at: string
          full_name: string
          id: string
          invitation_token: string
          trainer_id: string
        }
        Insert: {
          accepted_at?: string | null
          client_id?: string | null
          created_at?: string
          email: string
          expires_at?: string
          full_name: string
          id?: string
          invitation_token: string
          trainer_id: string
        }
        Update: {
          accepted_at?: string | null
          client_id?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          full_name?: string
          id?: string
          invitation_token?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_invitations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invitations_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_measurements: {
        Row: {
          arms_cm: number | null
          body_fat_percentage: number | null
          chest_cm: number | null
          client_id: string
          client_user_id: string | null
          created_at: string
          hips_cm: number | null
          id: string
          measured_at: string
          muscle_mass_kg: number | null
          notes: string | null
          thighs_cm: number | null
          trainer_id: string
          updated_at: string
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          arms_cm?: number | null
          body_fat_percentage?: number | null
          chest_cm?: number | null
          client_id: string
          client_user_id?: string | null
          created_at?: string
          hips_cm?: number | null
          id?: string
          measured_at?: string
          muscle_mass_kg?: number | null
          notes?: string | null
          thighs_cm?: number | null
          trainer_id: string
          updated_at?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          arms_cm?: number | null
          body_fat_percentage?: number | null
          chest_cm?: number | null
          client_id?: string
          client_user_id?: string | null
          created_at?: string
          hips_cm?: number | null
          id?: string
          measured_at?: string
          muscle_mass_kg?: number | null
          notes?: string | null
          thighs_cm?: number | null
          trainer_id?: string
          updated_at?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_measurements_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_measurements_client_user_id_fkey"
            columns: ["client_user_id"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_measurements_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_permissions: {
        Row: {
          can_book_sessions: boolean
          can_message_trainer: boolean
          can_purchase_packages: boolean
          can_view_progress: boolean
          can_view_workout_plans: boolean
          client_user_id: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          can_book_sessions?: boolean
          can_message_trainer?: boolean
          can_purchase_packages?: boolean
          can_view_progress?: boolean
          can_view_workout_plans?: boolean
          client_user_id: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          can_book_sessions?: boolean
          can_message_trainer?: boolean
          can_purchase_packages?: boolean
          can_view_progress?: boolean
          can_view_workout_plans?: boolean
          client_user_id?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_permissions_client_user_id_fkey"
            columns: ["client_user_id"]
            isOneToOne: true
            referencedRelation: "client_users"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_tokens: {
        Row: {
          client_id: string
          created_at: string
          id: string
          token: string
          trainer_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          token?: string
          trainer_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          token?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_tokens_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portal_tokens_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_users: {
        Row: {
          avatar_url: string | null
          client_id: string | null
          created_at: string
          email: string
          email_verified: boolean
          fcm_token: string | null
          full_name: string
          id: string
          onboarding_completed: boolean
          phone: string | null
          trainer_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          client_id?: string | null
          created_at?: string
          email: string
          email_verified?: boolean
          fcm_token?: string | null
          full_name: string
          id?: string
          onboarding_completed?: boolean
          phone?: string | null
          trainer_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          client_id?: string | null
          created_at?: string
          email?: string
          email_verified?: boolean
          fcm_token?: string | null
          full_name?: string
          id?: string
          onboarding_completed?: boolean
          phone?: string | null
          trainer_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_users_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          status: string
          stripe_customer_id: string | null
          trainer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          status?: string
          stripe_customer_id?: string | null
          trainer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          status?: string
          stripe_customer_id?: string | null
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_ledger: {
        Row: {
          client_id: string
          created_at: string
          delta_credits: number
          id: string
          note: string | null
          purchase_id: string | null
          session_id: string | null
          source: string
          trainer_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          delta_credits: number
          id?: string
          note?: string | null
          purchase_id?: string | null
          session_id?: string | null
          source: string
          trainer_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          delta_credits?: number
          id?: string
          note?: string | null
          purchase_id?: string | null
          session_id?: string | null
          source?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_ledger_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_ledger_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_ledger_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_ledger_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          category: string
          created_at: string
          description_en: string | null
          description_sv: string | null
          equipment: string[] | null
          id: string
          image_url: string | null
          is_public: boolean
          name_en: string | null
          name_sv: string
          trainer_id: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description_en?: string | null
          description_sv?: string | null
          equipment?: string[] | null
          id?: string
          image_url?: string | null
          is_public?: boolean
          name_en?: string | null
          name_sv: string
          trainer_id?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description_en?: string | null
          description_sv?: string | null
          equipment?: string[] | null
          id?: string
          image_url?: string | null
          is_public?: boolean
          name_en?: string | null
          name_sv?: string
          trainer_id?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          message_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          message_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          client_id: string | null
          content: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
          recipient_type: string
          sender_id: string
          sender_type: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id: string
          recipient_type: string
          sender_id: string
          sender_type: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string
          recipient_type?: string
          sender_id?: string
          sender_type?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          joined_at: string
          organization_id: string
          permissions: Json | null
          role: Database["public"]["Enums"]["organization_role"]
          trainer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          joined_at?: string
          organization_id: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["organization_role"]
          trainer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          joined_at?: string
          organization_id?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["organization_role"]
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_revenue_splits: {
        Row: {
          created_at: string
          id: string
          month: string
          organization_id: string
          organization_share_cents: number
          paid: boolean
          paid_at: string | null
          split_percentage: number
          total_revenue_cents: number
          trainer_id: string
          trainer_share_cents: number
        }
        Insert: {
          created_at?: string
          id?: string
          month: string
          organization_id: string
          organization_share_cents?: number
          paid?: boolean
          paid_at?: string | null
          split_percentage: number
          total_revenue_cents?: number
          trainer_id: string
          trainer_share_cents?: number
        }
        Update: {
          created_at?: string
          id?: string
          month?: string
          organization_id?: string
          organization_share_cents?: number
          paid?: boolean
          paid_at?: string | null
          split_percentage?: number
          total_revenue_cents?: number
          trainer_id?: string
          trainer_share_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "organization_revenue_splits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_revenue_splits_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_records: {
        Row: {
          achieved_at: string
          client_id: string
          client_user_id: string | null
          created_at: string
          exercise_name: string
          id: string
          notes: string | null
          record_type: string
          trainer_id: string
          unit: string
          value: number
        }
        Insert: {
          achieved_at?: string
          client_id: string
          client_user_id?: string | null
          created_at?: string
          exercise_name: string
          id?: string
          notes?: string | null
          record_type: string
          trainer_id: string
          unit: string
          value: number
        }
        Update: {
          achieved_at?: string
          client_id?: string
          client_user_id?: string | null
          created_at?: string
          exercise_name?: string
          id?: string
          notes?: string | null
          record_type?: string
          trainer_id?: string
          unit?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "personal_records_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_client_user_id_fkey"
            columns: ["client_user_id"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          created_at: string
          credits_amount: number
          currency: string
          expiry_days: number | null
          id: string
          name: string
          price_cents: number
          stripe_price_id: string | null
          trainer_id: string
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          credits_amount: number
          currency?: string
          expiry_days?: number | null
          id?: string
          name: string
          price_cents: number
          stripe_price_id?: string | null
          trainer_id: string
          type: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          credits_amount?: number
          currency?: string
          expiry_days?: number | null
          id?: string
          name?: string
          price_cents?: number
          stripe_price_id?: string | null
          trainer_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_photos: {
        Row: {
          client_id: string
          client_user_id: string | null
          created_at: string
          id: string
          notes: string | null
          photo_type: string | null
          photo_url: string
          taken_at: string
          trainer_id: string
        }
        Insert: {
          client_id: string
          client_user_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          photo_type?: string | null
          photo_url: string
          taken_at?: string
          trainer_id: string
        }
        Update: {
          client_id?: string
          client_user_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          photo_type?: string | null
          photo_url?: string
          taken_at?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_photos_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_photos_client_user_id_fkey"
            columns: ["client_user_id"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_photos_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          amount_cents: number
          client_id: string
          created_at: string
          currency: string
          id: string
          paid_at: string | null
          product_id: string
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          stripe_subscription_id: string | null
          trainer_id: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          client_id: string
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          product_id: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          trainer_id: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          client_id?: string
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          product_id?: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_events: {
        Row: {
          channel: string
          client_id: string
          created_at: string
          id: string
          payload_json: Json | null
          status: string
          trainer_id: string
          type: string
        }
        Insert: {
          channel?: string
          client_id: string
          created_at?: string
          id?: string
          payload_json?: Json | null
          status?: string
          trainer_id: string
          type: string
        }
        Update: {
          channel?: string
          client_id?: string
          created_at?: string
          id?: string
          payload_json?: Json | null
          status?: string
          trainer_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminder_events_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          booking_status: Database["public"]["Enums"]["booking_status"] | null
          client_id: string
          created_at: string
          credits_used: number
          duration_minutes: number
          id: string
          notes: string | null
          occurred_at: string
          scheduled_end: string | null
          scheduled_start: string | null
          trainer_id: string
        }
        Insert: {
          booking_status?: Database["public"]["Enums"]["booking_status"] | null
          client_id: string
          created_at?: string
          credits_used?: number
          duration_minutes?: number
          id?: string
          notes?: string | null
          occurred_at?: string
          scheduled_end?: string | null
          scheduled_start?: string | null
          trainer_id: string
        }
        Update: {
          booking_status?: Database["public"]["Enums"]["booking_status"] | null
          client_id?: string
          created_at?: string
          credits_used?: number
          duration_minutes?: number
          id?: string
          notes?: string | null
          occurred_at?: string
          scheduled_end?: string | null
          scheduled_start?: string | null
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          plan_tier: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string
          stripe_subscription_id: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end: string
          current_period_start: string
          id?: string
          plan_tier?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string
          stripe_subscription_id: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_tier?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string
          stripe_subscription_id?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      swish_payments: {
        Row: {
          amount_cents: number
          client_id: string | null
          created_at: string
          currency: string
          id: string
          paid_at: string | null
          payment_reference: string
          phone_number: string | null
          status: Database["public"]["Enums"]["swish_payment_status"]
          swish_response: Json | null
          trainer_id: string | null
          updated_at: string
        }
        Insert: {
          amount_cents: number
          client_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          payment_reference: string
          phone_number?: string | null
          status?: Database["public"]["Enums"]["swish_payment_status"]
          swish_response?: Json | null
          trainer_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          client_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          payment_reference?: string
          phone_number?: string | null
          status?: Database["public"]["Enums"]["swish_payment_status"]
          swish_response?: Json | null
          trainer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "swish_payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swish_payments_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean
          start_time: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean
          start_time: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean
          start_time?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_availability_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_profiles: {
        Row: {
          business_name: string
          created_at: string
          currency: string
          fcm_token: string | null
          id: string
          language_preference: string
          logo_url: string | null
          onboarding_completed: boolean
          organization_id: string | null
          plan_tier: string
          reminder_low_credits: boolean
          reminder_payment_due: boolean
          reminder_renewal: boolean
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_started_at: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          timezone: string
          trial_ends_at: string | null
          trial_started_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_name?: string
          created_at?: string
          currency?: string
          fcm_token?: string | null
          id?: string
          language_preference?: string
          logo_url?: string | null
          onboarding_completed?: boolean
          organization_id?: string | null
          plan_tier?: string
          reminder_low_credits?: boolean
          reminder_payment_due?: boolean
          reminder_renewal?: boolean
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_started_at?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          timezone?: string
          trial_ends_at?: string | null
          trial_started_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_name?: string
          created_at?: string
          currency?: string
          fcm_token?: string | null
          id?: string
          language_preference?: string
          logo_url?: string | null
          onboarding_completed?: boolean
          organization_id?: string | null
          plan_tier?: string
          reminder_low_credits?: boolean
          reminder_payment_due?: boolean
          reminder_renewal?: boolean
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_started_at?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          timezone?: string
          trial_ends_at?: string | null
          trial_started_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workout_plan_days: {
        Row: {
          created_at: string
          day_number: number
          description: string | null
          id: string
          name: string
          workout_plan_id: string
        }
        Insert: {
          created_at?: string
          day_number: number
          description?: string | null
          id?: string
          name: string
          workout_plan_id: string
        }
        Update: {
          created_at?: string
          day_number?: number
          description?: string | null
          id?: string
          name?: string
          workout_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_plan_days_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_plan_exercises: {
        Row: {
          created_at: string
          duration_seconds: number | null
          exercise_id: string
          id: string
          notes: string | null
          order_number: number
          reps: string | null
          rest_seconds: number | null
          sets: number | null
          workout_plan_day_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          exercise_id: string
          id?: string
          notes?: string | null
          order_number: number
          reps?: string | null
          rest_seconds?: number | null
          sets?: number | null
          workout_plan_day_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          exercise_id?: string
          id?: string
          notes?: string | null
          order_number?: number
          reps?: string | null
          rest_seconds?: number | null
          sets?: number | null
          workout_plan_day_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_plan_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_plan_exercises_workout_plan_day_id_fkey"
            columns: ["workout_plan_day_id"]
            isOneToOne: false
            referencedRelation: "workout_plan_days"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_plans: {
        Row: {
          active: boolean
          client_id: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          duration_weeks: number | null
          goal: string | null
          id: string
          is_template: boolean
          name: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          client_id?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_weeks?: number | null
          goal?: string | null
          id?: string
          is_template?: boolean
          name: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          client_id?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_weeks?: number | null
          goal?: string | null
          id?: string
          is_template?: boolean
          name?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_plans_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_trainer_id: { Args: never; Returns: string }
    }
    Enums: {
      app_role: "trainer"
      booking_status:
        | "scheduled"
        | "confirmed"
        | "completed"
        | "canceled"
        | "no_show"
      organization_role: "owner" | "admin" | "trainer" | "viewer"
      subscription_status:
        | "trial"
        | "active"
        | "past_due"
        | "canceled"
        | "incomplete"
      swish_payment_status:
        | "pending"
        | "paid"
        | "declined"
        | "error"
        | "cancelled"
      user_role: "trainer" | "client"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["trainer"],
      booking_status: [
        "scheduled",
        "confirmed",
        "completed",
        "canceled",
        "no_show",
      ],
      organization_role: ["owner", "admin", "trainer", "viewer"],
      subscription_status: [
        "trial",
        "active",
        "past_due",
        "canceled",
        "incomplete",
      ],
      swish_payment_status: [
        "pending",
        "paid",
        "declined",
        "error",
        "cancelled",
      ],
      user_role: ["trainer", "client"],
    },
  },
} as const
