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
      goal_events: {
        Row: {
          created_at: string | null
          id: string
          is_own_goal: boolean
          match_id: string
          minute: number | null
          player_name: string
          team_id: string
          tournament_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_own_goal?: boolean
          match_id: string
          minute?: number | null
          player_name: string
          team_id: string
          tournament_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_own_goal?: boolean
          match_id?: string
          minute?: number | null
          player_name?: string
          team_id?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_events_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          api_fixture_id: number | null
          away_score: number | null
          away_team: string | null
          created_at: string | null
          finished: boolean
          group_letter: string | null
          home_score: number | null
          home_team: string | null
          id: string
          kickoff: string
          match_number: number
          source: string | null
          stage: string
          status: string
          tournament_id: string
          winner_team: string | null
        }
        Insert: {
          api_fixture_id?: number | null
          away_score?: number | null
          away_team?: string | null
          created_at?: string | null
          finished?: boolean
          group_letter?: string | null
          home_score?: number | null
          home_team?: string | null
          id?: string
          kickoff: string
          match_number: number
          source?: string | null
          stage: string
          status?: string
          tournament_id: string
          winner_team?: string | null
        }
        Update: {
          api_fixture_id?: number | null
          away_score?: number | null
          away_team?: string | null
          created_at?: string | null
          finished?: boolean
          group_letter?: string | null
          home_score?: number | null
          home_team?: string | null
          id?: string
          kickoff?: string
          match_number?: number
          source?: string | null
          stage?: string
          status?: string
          tournament_id?: string
          winner_team?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_away_team_fkey"
            columns: ["away_team"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_team_fkey"
            columns: ["home_team"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_winner_team_fkey"
            columns: ["winner_team"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_log: {
        Row: {
          id: string
          kind: string
          match_id: string
          recipients: number
          sent_at: string
        }
        Insert: {
          id?: string
          kind: string
          match_id: string
          recipients?: number
          sent_at?: string
        }
        Update: {
          id?: string
          kind?: string
          match_id?: string
          recipients?: number
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_log_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      participations: {
        Row: {
          display_name: string
          is_admin: boolean
          joined_at: string | null
          pool_id: string
          user_id: string
        }
        Insert: {
          display_name: string
          is_admin?: boolean
          joined_at?: string | null
          pool_id: string
          user_id: string
        }
        Update: {
          display_name?: string
          is_admin?: boolean
          joined_at?: string | null
          pool_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participations_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_results_extra: {
        Row: {
          kind: string
          pool_id: string
          updated_at: string
          updated_by: string | null
          value: string
        }
        Insert: {
          kind: string
          pool_id: string
          updated_at?: string
          updated_by?: string | null
          value: string
        }
        Update: {
          kind?: string
          pool_id?: string
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "pool_results_extra_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      pools: {
        Row: {
          created_at: string | null
          created_by: string
          deadline: string
          hide_extras: boolean
          id: string
          invite_code: string
          name: string
          notifications_enabled: boolean
          scoring_frozen_at: string | null
          scoring_rules: Json
          starts_at: string | null
          status: string
          tournament_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          deadline: string
          hide_extras?: boolean
          id?: string
          invite_code?: string
          name: string
          notifications_enabled?: boolean
          scoring_frozen_at?: string | null
          scoring_rules?: Json
          starts_at?: string | null
          status?: string
          tournament_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          deadline?: string
          hide_extras?: boolean
          id?: string
          invite_code?: string
          name?: string
          notifications_enabled?: boolean
          scoring_frozen_at?: string | null
          scoring_rules?: Json
          starts_at?: string | null
          status?: string
          tournament_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pools_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      predicted_team_rounds: {
        Row: {
          created_at: string | null
          pool_id: string
          round: string
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          pool_id: string
          round: string
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          pool_id?: string
          round?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "predicted_team_rounds_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predicted_team_rounds_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions_extra: {
        Row: {
          created_at: string | null
          kind: string
          pool_id: string
          updated_at: string | null
          user_id: string
          value: string
        }
        Insert: {
          created_at?: string | null
          kind: string
          pool_id: string
          updated_at?: string | null
          user_id: string
          value: string
        }
        Update: {
          created_at?: string | null
          kind?: string
          pool_id?: string
          updated_at?: string | null
          user_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_extra_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions_first_scorer: {
        Row: {
          created_at: string | null
          match_id: string
          player_name: string
          pool_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          match_id: string
          player_name: string
          pool_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          match_id?: string
          player_name?: string
          pool_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_first_scorer_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_first_scorer_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions_group: {
        Row: {
          created_at: string | null
          first_team: string
          group_letter: string
          pool_id: string
          second_team: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          first_team: string
          group_letter: string
          pool_id: string
          second_team: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          first_team?: string
          group_letter?: string
          pool_id?: string
          second_team?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_group_first_team_fkey"
            columns: ["first_team"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_group_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_group_second_team_fkey"
            columns: ["second_team"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions_group_tiebreak: {
        Row: {
          group_letter: string
          ordered_team_ids: string[]
          pool_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          group_letter: string
          ordered_team_ids: string[]
          pool_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          group_letter?: string
          ordered_team_ids?: string[]
          pool_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_group_tiebreak_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions_knockout: {
        Row: {
          created_at: string | null
          pool_id: string
          slot: number
          stage: string
          team_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          pool_id: string
          slot: number
          stage: string
          team_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          pool_id?: string
          slot?: number
          stage?: string
          team_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_knockout_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_knockout_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions_match: {
        Row: {
          away_score: number
          created_at: string | null
          home_score: number
          id: string
          match_id: string
          pool_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          away_score: number
          created_at?: string | null
          home_score: number
          id?: string
          match_id: string
          pool_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          away_score?: number
          created_at?: string | null
          home_score?: number
          id?: string
          match_id?: string
          pool_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_match_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_match_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          keys_auth: string
          keys_p256dh: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          keys_auth: string
          keys_p256dh: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          keys_auth?: string
          keys_p256dh?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      scores: {
        Row: {
          category: string
          exact_hits: number
          sign_hits: number
          points: number
          pool_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          exact_hits?: number
          sign_hits?: number
          points?: number
          pool_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          exact_hits?: number
          sign_hits?: number
          points?: number
          pool_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scores_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          code: string
          flag_emoji: string | null
          group_letter: string
          id: string
          name: string
          tournament_id: string
        }
        Insert: {
          code: string
          flag_emoji?: string | null
          group_letter: string
          id?: string
          name: string
          tournament_id: string
        }
        Update: {
          code?: string
          flag_emoji?: string | null
          group_letter?: string
          id?: string
          name?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          starts_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          starts_at: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          starts_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      pool_lookup_by_invite_code: {
        Args: { p_code: string }
        Returns: {
          deadline: string
          id: string
          name: string
          participant_count: number
          status: string
          tournament_id: string
        }[]
      }
      user_pool_ids: { Args: never; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
