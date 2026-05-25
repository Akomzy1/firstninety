/**
 * Supabase database types.
 *
 * Hand-written to mirror what `supabase gen types typescript` would emit for
 * supabase/migrations/00001_initial_schema.sql. The standard regenerator
 * needs either local Docker or a Personal Access Token + `--project-id`,
 * neither of which is set up in this workspace yet. Once one is available,
 * run `pnpm db:types` and overwrite this file.
 *
 * Source of truth: supabase/migrations/00001_initial_schema.sql.
 * If you change the schema, regenerate this file.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          // Nullable since migration 00002 — set in onboarding step 2.
          primary_role: Database["public"]["Enums"]["role_enum"] | null;
          secondary_role: Database["public"]["Enums"]["role_enum"] | null;
          signup_source: string | null;
          // Set on step 4 submission (migration 00003).
          onboarding_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          primary_role?: Database["public"]["Enums"]["role_enum"] | null;
          secondary_role?: Database["public"]["Enums"]["role_enum"] | null;
          signup_source?: string | null;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          primary_role?: Database["public"]["Enums"]["role_enum"] | null;
          secondary_role?: Database["public"]["Enums"]["role_enum"] | null;
          signup_source?: string | null;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          status: Database["public"]["Enums"]["subscription_status_enum"];
          tier: Database["public"]["Enums"]["tier_enum"];
          current_period_end: string | null;
          trial_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          status?: Database["public"]["Enums"]["subscription_status_enum"];
          tier?: Database["public"]["Enums"]["tier_enum"];
          current_period_end?: string | null;
          trial_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          status?: Database["public"]["Enums"]["subscription_status_enum"];
          tier?: Database["public"]["Enums"]["tier_enum"];
          current_period_end?: string | null;
          trial_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_responsibilities: {
        Row: {
          id: string;
          user_id: string;
          description: string;
          source: Database["public"]["Enums"]["memory_source_enum"];
          is_current: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          description: string;
          source: Database["public"]["Enums"]["memory_source_enum"];
          is_current?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          description?: string;
          source?: Database["public"]["Enums"]["memory_source_enum"];
          is_current?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_responsibilities_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_context: {
        Row: {
          user_id: string;
          start_date: string | null;
          sector: string | null;
          work_setup: Database["public"]["Enums"]["work_setup_enum"] | null;
          current_week: number;
          current_day: number;
          focus_areas: string[] | null;
          last_sunday_prompt_at: string | null;
          probation_review_date: string | null;
          probation_mode_active: boolean;
          probation_window_days: number;
          probation_brief_generated_at: string | null;
          probation_outcome:
            | Database["public"]["Enums"]["probation_outcome_enum"]
            | null;
          probation_outcome_captured_at: string | null;
          // Set when the daily cron first nudges the user (migration 00004).
          probation_activation_prompted_at: string | null;
          timezone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          start_date?: string | null;
          sector?: string | null;
          work_setup?: Database["public"]["Enums"]["work_setup_enum"] | null;
          current_week?: number;
          current_day?: number;
          focus_areas?: string[] | null;
          last_sunday_prompt_at?: string | null;
          probation_review_date?: string | null;
          probation_mode_active?: boolean;
          probation_window_days?: number;
          probation_brief_generated_at?: string | null;
          probation_outcome?:
            | Database["public"]["Enums"]["probation_outcome_enum"]
            | null;
          probation_outcome_captured_at?: string | null;
          probation_activation_prompted_at?: string | null;
          timezone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          start_date?: string | null;
          sector?: string | null;
          work_setup?: Database["public"]["Enums"]["work_setup_enum"] | null;
          current_week?: number;
          current_day?: number;
          focus_areas?: string[] | null;
          last_sunday_prompt_at?: string | null;
          probation_review_date?: string | null;
          probation_mode_active?: boolean;
          probation_window_days?: number;
          probation_brief_generated_at?: string | null;
          probation_outcome?:
            | Database["public"]["Enums"]["probation_outcome_enum"]
            | null;
          probation_outcome_captured_at?: string | null;
          probation_activation_prompted_at?: string | null;
          timezone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_context_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      scenarios: {
        Row: {
          id: string;
          slug: string;
          role: Database["public"]["Enums"]["role_enum"];
          title: string;
          one_liner: string;
          brief: string;
          objective: string;
          curveball: string;
          personas: Json;
          rubric: Json;
          estimated_minutes: number;
          difficulty: number;
          career_stage: string;
          is_published: boolean;
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          role: Database["public"]["Enums"]["role_enum"];
          title: string;
          one_liner: string;
          brief: string;
          objective: string;
          curveball: string;
          personas: Json;
          rubric: Json;
          estimated_minutes?: number;
          difficulty?: number;
          career_stage?: string;
          is_published?: boolean;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          role?: Database["public"]["Enums"]["role_enum"];
          title?: string;
          one_liner?: string;
          brief?: string;
          objective?: string;
          curveball?: string;
          personas?: Json;
          rubric?: Json;
          estimated_minutes?: number;
          difficulty?: number;
          career_stage?: string;
          is_published?: boolean;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      playbooks: {
        Row: {
          id: string;
          slug: string;
          role: Database["public"]["Enums"]["role_enum"];
          artefact_type: string;
          title: string;
          variant: string | null;
          description: string;
          empty_template_md: string;
          worked_examples: Json;
          common_mistakes: string[];
          variant_patterns: string[] | null;
          related_scenarios: string[] | null;
          career_stage: string;
          is_published: boolean;
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          role: Database["public"]["Enums"]["role_enum"];
          artefact_type: string;
          title: string;
          variant?: string | null;
          description: string;
          empty_template_md: string;
          worked_examples: Json;
          common_mistakes: string[];
          variant_patterns?: string[] | null;
          related_scenarios?: string[] | null;
          career_stage?: string;
          is_published?: boolean;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          role?: Database["public"]["Enums"]["role_enum"];
          artefact_type?: string;
          title?: string;
          variant?: string | null;
          description?: string;
          empty_template_md?: string;
          worked_examples?: Json;
          common_mistakes?: string[];
          variant_patterns?: string[] | null;
          related_scenarios?: string[] | null;
          career_stage?: string;
          is_published?: boolean;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      missions: {
        Row: {
          id: string;
          slug: string;
          role: Database["public"]["Enums"]["role_enum"];
          week: number;
          sequence_in_week: number;
          title: string;
          why_matters: string;
          steps: string[];
          resource_refs: Json | null;
          success_criteria: string;
          reflection_prompt: string;
          estimated_minutes: number;
          prerequisites: string[] | null;
          career_stage: string;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          role: Database["public"]["Enums"]["role_enum"];
          week: number;
          sequence_in_week: number;
          title: string;
          why_matters: string;
          steps: string[];
          resource_refs?: Json | null;
          success_criteria: string;
          reflection_prompt: string;
          estimated_minutes: number;
          prerequisites?: string[] | null;
          career_stage?: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          role?: Database["public"]["Enums"]["role_enum"];
          week?: number;
          sequence_in_week?: number;
          title?: string;
          why_matters?: string;
          steps?: string[];
          resource_refs?: Json | null;
          success_criteria?: string;
          reflection_prompt?: string;
          estimated_minutes?: number;
          prerequisites?: string[] | null;
          career_stage?: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      mission_completions: {
        Row: {
          id: string;
          user_id: string;
          mission_id: string;
          status: Database["public"]["Enums"]["mission_status_enum"];
          reflection_response: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mission_id: string;
          status?: Database["public"]["Enums"]["mission_status_enum"];
          reflection_response?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mission_id?: string;
          status?: Database["public"]["Enums"]["mission_status_enum"];
          reflection_response?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mission_completions_mission_id_fkey";
            columns: ["mission_id"];
            isOneToOne: false;
            referencedRelation: "missions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mission_completions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      scenario_runs: {
        Row: {
          id: string;
          user_id: string;
          scenario_id: string;
          transcript: Json;
          status: Database["public"]["Enums"]["scenario_run_status_enum"];
          debrief: Json | null;
          outcome: string | null;
          started_at: string;
          ended_at: string | null;
          duration_seconds: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          scenario_id: string;
          transcript?: Json;
          status?: Database["public"]["Enums"]["scenario_run_status_enum"];
          debrief?: Json | null;
          outcome?: string | null;
          started_at?: string;
          ended_at?: string | null;
          duration_seconds?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          scenario_id?: string;
          transcript?: Json;
          status?: Database["public"]["Enums"]["scenario_run_status_enum"];
          debrief?: Json | null;
          outcome?: string | null;
          started_at?: string;
          ended_at?: string | null;
          duration_seconds?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scenario_runs_scenario_id_fkey";
            columns: ["scenario_id"];
            isOneToOne: false;
            referencedRelation: "scenarios";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scenario_runs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      situation_sessions: {
        Row: {
          id: string;
          user_id: string;
          entry_type: Database["public"]["Enums"]["situation_entry_type_enum"];
          situation_summary: string;
          transcript: Json;
          related_playbook_ids: string[] | null;
          related_scenario_id: string | null;
          flagged_for_safety: boolean;
          safety_referral_shown: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entry_type: Database["public"]["Enums"]["situation_entry_type_enum"];
          situation_summary: string;
          transcript?: Json;
          related_playbook_ids?: string[] | null;
          related_scenario_id?: string | null;
          flagged_for_safety?: boolean;
          safety_referral_shown?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          entry_type?: Database["public"]["Enums"]["situation_entry_type_enum"];
          situation_summary?: string;
          transcript?: Json;
          related_playbook_ids?: string[] | null;
          related_scenario_id?: string | null;
          flagged_for_safety?: boolean;
          safety_referral_shown?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "situation_sessions_related_scenario_id_fkey";
            columns: ["related_scenario_id"];
            isOneToOne: false;
            referencedRelation: "scenarios";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "situation_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      coach_threads: {
        Row: {
          id: string;
          user_id: string;
          topic_title: string;
          is_archived: boolean;
          last_message_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          topic_title: string;
          is_archived?: boolean;
          last_message_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          topic_title?: string;
          is_archived?: boolean;
          last_message_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "coach_threads_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      coach_messages: {
        Row: {
          id: string;
          thread_id: string;
          user_id: string;
          role: Database["public"]["Enums"]["coach_message_role_enum"];
          content: string;
          tool_calls: Json | null;
          cost_usd: number | null;
          input_tokens: number | null;
          output_tokens: number | null;
          model: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          thread_id: string;
          user_id: string;
          role: Database["public"]["Enums"]["coach_message_role_enum"];
          content: string;
          tool_calls?: Json | null;
          cost_usd?: number | null;
          input_tokens?: number | null;
          output_tokens?: number | null;
          model?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          thread_id?: string;
          user_id?: string;
          role?: Database["public"]["Enums"]["coach_message_role_enum"];
          content?: string;
          tool_calls?: Json | null;
          cost_usd?: number | null;
          input_tokens?: number | null;
          output_tokens?: number | null;
          model?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "coach_messages_thread_id_fkey";
            columns: ["thread_id"];
            isOneToOne: false;
            referencedRelation: "coach_threads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "coach_messages_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_calls: {
        Row: {
          id: string;
          user_id: string | null;
          surface: string;
          model: string;
          input_tokens: number;
          output_tokens: number;
          cost_usd: number;
          latency_ms: number | null;
          tool_calls_count: number | null;
          error: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          surface: string;
          model: string;
          input_tokens: number;
          output_tokens: number;
          cost_usd: number;
          latency_ms?: number | null;
          tool_calls_count?: number | null;
          error?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          surface?: string;
          model?: string;
          input_tokens?: number;
          output_tokens?: number;
          cost_usd?: number;
          latency_ms?: number | null;
          tool_calls_count?: number | null;
          error?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_calls_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      usage_limits: {
        Row: {
          user_id: string;
          simulator_runs_lifetime: number;
          situation_sessions_week: number;
          coach_messages_week: number;
          week_reset_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          simulator_runs_lifetime?: number;
          situation_sessions_week?: number;
          coach_messages_week?: number;
          week_reset_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          simulator_runs_lifetime?: number;
          situation_sessions_week?: number;
          coach_messages_week?: number;
          week_reset_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "usage_limits_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      probation_artefacts: {
        Row: {
          id: string;
          user_id: string;
          artefact_type: Database["public"]["Enums"]["probation_artefact_type_enum"];
          content: Json;
          is_current: boolean;
          generated_at: string;
          exported_at: string | null;
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          artefact_type: Database["public"]["Enums"]["probation_artefact_type_enum"];
          content: Json;
          is_current?: boolean;
          generated_at?: string;
          exported_at?: string | null;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          artefact_type?: Database["public"]["Enums"]["probation_artefact_type_enum"];
          content?: Json;
          is_current?: boolean;
          generated_at?: string;
          exported_at?: string | null;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "probation_artefacts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      role_enum: "ba" | "pm" | "sm" | "po" | "da" | "aie";
      subscription_status_enum:
        | "free"
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "incomplete";
      tier_enum: "free" | "pro";
      memory_source_enum:
        | "onboarding"
        | "sunday_prompt"
        | "coach_inferred"
        | "user_manual";
      work_setup_enum: "remote" | "hybrid" | "office";
      mission_status_enum: "in_progress" | "completed" | "skipped";
      scenario_run_status_enum: "active" | "completed" | "abandoned";
      situation_entry_type_enum: "prep" | "is_this_normal" | "debrief";
      coach_message_role_enum: "user" | "assistant" | "tool" | "system";
      probation_outcome_enum:
        | "continued"
        | "extended"
        | "ended"
        | "prefer_not_to_say";
      probation_artefact_type_enum:
        | "brief"
        | "self_assessment"
        | "evidence_portfolio"
        | "pre_review_agenda";
    };
    CompositeTypes: Record<string, never>;
  };
};

// Convenience aliases matching the supabase gen types output convention.

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
