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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ad_targets: {
        Row: {
          ad_id: string
          created_at: string
          id: string
          location_id: string
          region_id: string
          sort_order: number
        }
        Insert: {
          ad_id: string
          created_at?: string
          id?: string
          location_id: string
          region_id: string
          sort_order?: number
        }
        Update: {
          ad_id?: string
          created_at?: string
          id?: string
          location_id?: string
          region_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "ad_targets_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_targets_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_targets_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      ads: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string | null
          credits_spent: number
          description: string | null
          duration_days: number | null
          end_at: string | null
          host_location_id: string | null
          id: string
          image_url: string | null
          location_id: string | null
          placement: Database["public"]["Enums"]["ad_placement"]
          region_id: string
          sort_order: number
          start_at: string | null
          status: Database["public"]["Enums"]["ad_status"]
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          credits_spent?: number
          description?: string | null
          duration_days?: number | null
          end_at?: string | null
          host_location_id?: string | null
          id?: string
          image_url?: string | null
          location_id?: string | null
          placement: Database["public"]["Enums"]["ad_placement"]
          region_id: string
          sort_order?: number
          start_at?: string | null
          status?: Database["public"]["Enums"]["ad_status"]
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          credits_spent?: number
          description?: string | null
          duration_days?: number | null
          end_at?: string | null
          host_location_id?: string | null
          id?: string
          image_url?: string | null
          location_id?: string | null
          placement?: Database["public"]["Enums"]["ad_placement"]
          region_id?: string
          sort_order?: number
          start_at?: string | null
          status?: Database["public"]["Enums"]["ad_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_host_location_id_fkey"
            columns: ["host_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: number
          metadata: Json
          region_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: number
          metadata?: Json
          region_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: number
          metadata?: Json
          region_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          is_system: boolean
          name: string
          region_id: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_system?: boolean
          name: string
          region_id?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_system?: boolean
          name?: string
          region_id?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      couriers: {
        Row: {
          coordinates: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          region_id: string
          sort_order: number
          updated_at: string
          whatsapp: string
        }
        Insert: {
          coordinates?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          region_id: string
          sort_order?: number
          updated_at?: string
          whatsapp: string
        }
        Update: {
          coordinates?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          region_id?: string
          sort_order?: number
          updated_at?: string
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "couriers_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_ledger: {
        Row: {
          actor_id: string | null
          ad_id: string | null
          balance_after: number
          created_at: string
          delta: number
          id: number
          reason: string
          region_id: string
        }
        Insert: {
          actor_id?: string | null
          ad_id?: string | null
          balance_after: number
          created_at?: string
          delta: number
          id?: number
          reason: string
          region_id: string
        }
        Update: {
          actor_id?: string | null
          ad_id?: string | null
          balance_after?: number
          created_at?: string
          delta?: number
          id?: number
          reason?: string
          region_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_ledger_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      engagement_events: {
        Row: {
          created_at: string
          id: number
          kind: Database["public"]["Enums"]["engagement_kind"]
          location_id: string | null
          region_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          kind: Database["public"]["Enums"]["engagement_kind"]
          location_id?: string | null
          region_id: string
        }
        Update: {
          created_at?: string
          id?: number
          kind?: Database["public"]["Enums"]["engagement_kind"]
          location_id?: string | null
          region_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "engagement_events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engagement_events_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      info_posts: {
        Row: {
          body: string
          category_id: string | null
          cover_image_url: string | null
          created_at: string
          gallery_urls: string[]
          id: string
          is_published: boolean
          published_at: string
          region_id: string
          title: string
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          body?: string
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          gallery_urls?: string[]
          id?: string
          is_published?: boolean
          published_at?: string
          region_id: string
          title: string
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          body?: string
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          gallery_urls?: string[]
          id?: string
          is_published?: boolean
          published_at?: string
          region_id?: string
          title?: string
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "info_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "info_posts_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          category_id: string | null
          coordinates: string | null
          created_at: string
          description: string | null
          gallery_urls: string[]
          hours: string | null
          id: string
          is_featured: boolean
          is_published: boolean
          name: string
          photo_url: string | null
          price_range: string | null
          region_id: string
          slug: string
          sort_order: number
          updated_at: string
          whatsapp: string | null
          youtube_url: string | null
        }
        Insert: {
          category_id?: string | null
          coordinates?: string | null
          created_at?: string
          description?: string | null
          gallery_urls?: string[]
          hours?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          name: string
          photo_url?: string | null
          price_range?: string | null
          region_id: string
          slug: string
          sort_order?: number
          updated_at?: string
          whatsapp?: string | null
          youtube_url?: string | null
        }
        Update: {
          category_id?: string | null
          coordinates?: string | null
          created_at?: string
          description?: string | null
          gallery_urls?: string[]
          hours?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          name?: string
          photo_url?: string | null
          price_range?: string | null
          region_id?: string
          slug?: string
          sort_order?: number
          updated_at?: string
          whatsapp?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          region_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          region_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          region_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_prices: {
        Row: {
          created_at: string
          credits: number
          duration_days: number
          id: string
          is_active: boolean
          placement: Database["public"]["Enums"]["ad_placement"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          credits: number
          duration_days: number
          id?: string
          is_active?: boolean
          placement: Database["public"]["Enums"]["ad_placement"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          credits?: number
          duration_days?: number
          id?: string
          is_active?: boolean
          placement?: Database["public"]["Enums"]["ad_placement"]
          updated_at?: string
        }
        Relationships: []
      }
      push_dispatches: {
        Row: {
          actor_id: string | null
          body: string
          created_at: string
          dedupe_key: string | null
          entity_id: string | null
          entity_type: string
          failed_count: number
          id: string
          region_id: string
          sent_count: number
          title: string
          url: string | null
        }
        Insert: {
          actor_id?: string | null
          body: string
          created_at?: string
          dedupe_key?: string | null
          entity_id?: string | null
          entity_type: string
          failed_count?: number
          id?: string
          region_id: string
          sent_count?: number
          title: string
          url?: string | null
        }
        Update: {
          actor_id?: string | null
          body?: string
          created_at?: string
          dedupe_key?: string | null
          entity_id?: string | null
          entity_type?: string
          failed_count?: number
          id?: string
          region_id?: string
          sent_count?: number
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_dispatches_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      push_region_follows: {
        Row: {
          created_at: string
          id: string
          region_id: string
          subscription_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          region_id: string
          subscription_id: string
        }
        Update: {
          created_at?: string
          id?: string
          region_id?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_region_follows_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_region_follows_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "push_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          is_active: boolean
          last_seen_at: string
          p256dh: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          is_active?: boolean
          last_seen_at?: string
          p256dh: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          is_active?: boolean
          last_seen_at?: string
          p256dh?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      qr_assets: {
        Row: {
          batch_label: string | null
          code: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          printed_at: string | null
          region_id: string | null
          status: Database["public"]["Enums"]["qr_status"]
          updated_at: string
        }
        Insert: {
          batch_label?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          printed_at?: string | null
          region_id?: string | null
          status?: Database["public"]["Enums"]["qr_status"]
          updated_at?: string
        }
        Update: {
          batch_label?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          printed_at?: string | null
          region_id?: string | null
          status?: Database["public"]["Enums"]["qr_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_assets_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          location_id: string
          placement_note: string | null
          qr_id: string
          region_id: string
          released_at: string | null
          released_by: string | null
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          location_id: string
          placement_note?: string | null
          qr_id: string
          region_id: string
          released_at?: string | null
          released_by?: string | null
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          location_id?: string
          placement_note?: string | null
          qr_id?: string
          region_id?: string
          released_at?: string | null
          released_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_assignments_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_assignments_qr_id_fkey"
            columns: ["qr_id"]
            isOneToOne: false
            referencedRelation: "qr_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_assignments_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      region_credits: {
        Row: {
          balance: number
          created_at: string
          region_id: string
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          region_id: string
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          region_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "region_credits_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: true
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          admin_whatsapp: string | null
          coordinates: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          mascot_name: string | null
          name: string
          slug: string
          tagline: string | null
          updated_at: string
          welcome_message: string | null
        }
        Insert: {
          admin_whatsapp?: string | null
          coordinates?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          mascot_name?: string | null
          name: string
          slug: string
          tagline?: string | null
          updated_at?: string
          welcome_message?: string | null
        }
        Update: {
          admin_whatsapp?: string | null
          coordinates?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          mascot_name?: string | null
          name?: string
          slug?: string
          tagline?: string | null
          updated_at?: string
          welcome_message?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          region_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          region_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          region_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visits: {
        Row: {
          country: string | null
          created_at: string
          id: number
          location_id: string | null
          qr_assignment_id: string | null
          referrer: string | null
          region_id: string | null
          source: Database["public"]["Enums"]["visit_source"]
          user_agent_hash: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          id?: number
          location_id?: string | null
          qr_assignment_id?: string | null
          referrer?: string | null
          region_id?: string | null
          source?: Database["public"]["Enums"]["visit_source"]
          user_agent_hash?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          id?: number
          location_id?: string | null
          qr_assignment_id?: string | null
          referrer?: string | null
          region_id?: string | null
          source?: Database["public"]["Enums"]["visit_source"]
          user_agent_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_qr_assignment_id_fkey"
            columns: ["qr_assignment_id"]
            isOneToOne: false
            referencedRelation: "qr_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_ad: {
        Args: { _ad_id: string; _duration_days: number }
        Returns: Json
      }
      admin_analytics_summary: { Args: { _days?: number }; Returns: Json }
    }
    Enums: {
      ad_placement: "banner" | "featured" | "contextual"
      ad_status: "draft" | "active" | "paused" | "expired"
      app_role: "super_admin" | "regional_admin" | "field_operator"
      engagement_kind: "whatsapp" | "gmaps" | "save" | "share"
      qr_status: "draft" | "active" | "retired"
      visit_source: "qr" | "gps" | "direct"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      ad_placement: ["banner", "featured", "contextual"],
      ad_status: ["draft", "active", "paused", "expired"],
      app_role: ["super_admin", "regional_admin", "field_operator"],
      engagement_kind: ["whatsapp", "gmaps", "save", "share"],
      qr_status: ["draft", "active", "retired"],
      visit_source: ["qr", "gps", "direct"],
    },
  },
} as const
