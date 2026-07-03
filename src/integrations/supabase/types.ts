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
      achievements: {
        Row: {
          code: string
          earned_at: string
          id: string
          meta: Json
          user_id: string
        }
        Insert: {
          code: string
          earned_at?: string
          id?: string
          meta?: Json
          user_id: string
        }
        Update: {
          code?: string
          earned_at?: string
          id?: string
          meta?: Json
          user_id?: string
        }
        Relationships: []
      }
      admin_account_status: {
        Row: {
          created_at: string
          is_suspended: boolean
          reason: string | null
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          is_suspended?: boolean
          reason?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          is_suspended?: boolean
          reason?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          actor_user_id: string
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json
          new_value: Json | null
          old_value: Json | null
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_user_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json
          new_value?: Json | null
          old_value?: Json | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json
          new_value?: Json | null
          old_value?: Json | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_job_runs: {
        Row: {
          created_at: string
          error_message: string | null
          finished_at: string | null
          id: string
          job_key: string
          payload: Json
          requested_by: string
          result: Json | null
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          job_key: string
          payload?: Json
          requested_by: string
          result?: Json | null
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          job_key?: string
          payload?: Json
          requested_by?: string
          result?: Json | null
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_runtime_settings: {
        Row: {
          created_at: string
          key: string
          updated_at: string
          updated_by: string | null
          value_json: Json
        }
        Insert: {
          created_at?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value_json?: Json
        }
        Update: {
          created_at?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value_json?: Json
        }
        Relationships: []
      }
      ai_research_queries: {
        Row: {
          answer: string | null
          citations: Json
          confidence: number | null
          created_at: string
          id: string
          language: string
          question: string
          user_id: string | null
        }
        Insert: {
          answer?: string | null
          citations?: Json
          confidence?: number | null
          created_at?: string
          id?: string
          language?: string
          question: string
          user_id?: string | null
        }
        Update: {
          answer?: string | null
          citations?: Json
          confidence?: number | null
          created_at?: string
          id?: string
          language?: string
          question?: string
          user_id?: string | null
        }
        Relationships: []
      }
      asbab_nuzul: {
        Row: {
          ayah_end: number
          ayah_start: number
          body: string
          citation: string | null
          created_at: string
          id: string
          lang: string
          source_id: string
          surah: number
        }
        Insert: {
          ayah_end: number
          ayah_start: number
          body: string
          citation?: string | null
          created_at?: string
          id?: string
          lang: string
          source_id: string
          surah: number
        }
        Update: {
          ayah_end?: number
          ayah_start?: number
          body?: string
          citation?: string | null
          created_at?: string
          id?: string
          lang?: string
          source_id?: string
          surah?: number
        }
        Relationships: [
          {
            foreignKeyName: "asbab_nuzul_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "tafsir_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      ayah_translations: {
        Row: {
          ayah: number
          id: number
          source_id: string
          surah: number
          text: string
        }
        Insert: {
          ayah: number
          id?: number
          source_id: string
          surah: number
          text: string
        }
        Update: {
          ayah?: number
          id?: number
          source_id?: string
          surah?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "ayah_translations_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "translation_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          arabic_snapshot: string | null
          ayah: number
          created_at: string
          hebrew_snapshot: string | null
          id: string
          note: string | null
          surah: number
          surah_name: string | null
          user_id: string
        }
        Insert: {
          arabic_snapshot?: string | null
          ayah: number
          created_at?: string
          hebrew_snapshot?: string | null
          id?: string
          note?: string | null
          surah: number
          surah_name?: string | null
          user_id: string
        }
        Update: {
          arabic_snapshot?: string | null
          ayah?: number
          created_at?: string
          hebrew_snapshot?: string | null
          id?: string
          note?: string | null
          surah?: number
          surah_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      collection_items: {
        Row: {
          ayah_end: number | null
          ayah_start: number | null
          collection_id: string
          created_at: string
          entity_id: string | null
          id: string
          item_kind: string
          note: string | null
          sort_order: number
          surah: number | null
        }
        Insert: {
          ayah_end?: number | null
          ayah_start?: number | null
          collection_id: string
          created_at?: string
          entity_id?: string | null
          id?: string
          item_kind: string
          note?: string | null
          sort_order?: number
          surah?: number | null
        }
        Update: {
          ayah_end?: number | null
          ayah_start?: number | null
          collection_id?: string
          created_at?: string
          entity_id?: string | null
          id?: string
          item_kind?: string
          note?: string | null
          sort_order?: number
          surah?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "knowledge_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          cover_color: string | null
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_journeys: {
        Row: {
          ayah: number
          completed: boolean
          created_at: string
          day: string
          entity_id: string | null
          id: string
          reflection: string | null
          surah: number
          user_id: string
        }
        Insert: {
          ayah: number
          completed?: boolean
          created_at?: string
          day: string
          entity_id?: string | null
          id?: string
          reflection?: string | null
          surah: number
          user_id: string
        }
        Update: {
          ayah?: number
          completed?: boolean
          created_at?: string
          day?: string
          entity_id?: string | null
          id?: string
          reflection?: string | null
          surah?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_journeys_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "knowledge_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      grounded_chunks: {
        Row: {
          ayah_end: number | null
          ayah_key: string | null
          ayah_start: number | null
          chunk_text: string
          content_type: string
          created_at: string
          embedding: string | null
          embedding_model: string
          fts: unknown
          id: string
          language: string
          source_key: string
          source_name: string
          source_row_id: string | null
          source_table: string
          surah: number | null
          translator_name: string | null
        }
        Insert: {
          ayah_end?: number | null
          ayah_key?: string | null
          ayah_start?: number | null
          chunk_text: string
          content_type: string
          created_at?: string
          embedding?: string | null
          embedding_model?: string
          fts?: unknown
          id?: string
          language: string
          source_key: string
          source_name: string
          source_row_id?: string | null
          source_table: string
          surah?: number | null
          translator_name?: string | null
        }
        Update: {
          ayah_end?: number | null
          ayah_key?: string | null
          ayah_start?: number | null
          chunk_text?: string
          content_type?: string
          created_at?: string
          embedding?: string | null
          embedding_model?: string
          fts?: unknown
          id?: string
          language?: string
          source_key?: string
          source_name?: string
          source_row_id?: string | null
          source_table?: string
          surah?: number | null
          translator_name?: string | null
        }
        Relationships: []
      }
      hadith_books: {
        Row: {
          book_id: number
          collection_slug: string
          hadith_count: number
          id: number
          name_ar: string
          name_en: string
          name_he: string | null
        }
        Insert: {
          book_id: number
          collection_slug: string
          hadith_count?: number
          id?: number
          name_ar: string
          name_en: string
          name_he?: string | null
        }
        Update: {
          book_id?: number
          collection_slug?: string
          hadith_count?: number
          id?: number
          name_ar?: string
          name_en?: string
          name_he?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hadith_books_collection_slug_fkey"
            columns: ["collection_slug"]
            isOneToOne: false
            referencedRelation: "hadith_collections"
            referencedColumns: ["slug"]
          },
        ]
      }
      hadith_collections: {
        Row: {
          author_ar: string | null
          author_en: string | null
          created_at: string
          slug: string
          sort_order: number
          title_ar: string
          title_en: string
          title_he: string | null
          total_books: number
          total_hadith: number
        }
        Insert: {
          author_ar?: string | null
          author_en?: string | null
          created_at?: string
          slug: string
          sort_order?: number
          title_ar: string
          title_en: string
          title_he?: string | null
          total_books?: number
          total_hadith?: number
        }
        Update: {
          author_ar?: string | null
          author_en?: string | null
          created_at?: string
          slug?: string
          sort_order?: number
          title_ar?: string
          title_en?: string
          title_he?: string | null
          total_books?: number
          total_hadith?: number
        }
        Relationships: []
      }
      hadith_entity_links: {
        Row: {
          ayah: number | null
          entity_id: string | null
          hadith_id: number
          id: number
          surah: number | null
          weight: number
        }
        Insert: {
          ayah?: number | null
          entity_id?: string | null
          hadith_id: number
          id?: number
          surah?: number | null
          weight?: number
        }
        Update: {
          ayah?: number | null
          entity_id?: string | null
          hadith_id?: number
          id?: number
          surah?: number | null
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "hadith_entity_links_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "knowledge_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hadith_entity_links_hadith_id_fkey"
            columns: ["hadith_id"]
            isOneToOne: false
            referencedRelation: "hadith_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      hadith_entries: {
        Row: {
          arabic_text: string
          book_id: number
          collection_slug: string
          created_at: string
          embedded_at: string | null
          embedding: string | null
          embedding_model: string | null
          english_text: string | null
          fts: unknown
          global_id: number
          hebrew_text: string | null
          id: number
          id_in_book: number
          narrator: string | null
        }
        Insert: {
          arabic_text: string
          book_id: number
          collection_slug: string
          created_at?: string
          embedded_at?: string | null
          embedding?: string | null
          embedding_model?: string | null
          english_text?: string | null
          fts?: unknown
          global_id: number
          hebrew_text?: string | null
          id?: number
          id_in_book: number
          narrator?: string | null
        }
        Update: {
          arabic_text?: string
          book_id?: number
          collection_slug?: string
          created_at?: string
          embedded_at?: string | null
          embedding?: string | null
          embedding_model?: string | null
          english_text?: string | null
          fts?: unknown
          global_id?: number
          hebrew_text?: string | null
          id?: number
          id_in_book?: number
          narrator?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hadith_entries_collection_slug_fkey"
            columns: ["collection_slug"]
            isOneToOne: false
            referencedRelation: "hadith_collections"
            referencedColumns: ["slug"]
          },
        ]
      }
      knowledge_entities: {
        Row: {
          alt_names_i18n: Json
          country_code: string | null
          created_at: string
          description_i18n: Json
          embedding: string | null
          era_end_year: number | null
          era_start_year: number | null
          fts: unknown
          hero_image: string | null
          icon: string | null
          id: string
          keywords_i18n: Json
          kind: Database["public"]["Enums"]["knowledge_kind"]
          latitude: number | null
          longitude: number | null
          published: boolean
          revelation_period: string | null
          seo_i18n: Json
          slug: string
          sort_order: number
          summary_i18n: Json
          title_i18n: Json
          updated_at: string
          verse_count: number
        }
        Insert: {
          alt_names_i18n?: Json
          country_code?: string | null
          created_at?: string
          description_i18n?: Json
          embedding?: string | null
          era_end_year?: number | null
          era_start_year?: number | null
          fts?: unknown
          hero_image?: string | null
          icon?: string | null
          id?: string
          keywords_i18n?: Json
          kind: Database["public"]["Enums"]["knowledge_kind"]
          latitude?: number | null
          longitude?: number | null
          published?: boolean
          revelation_period?: string | null
          seo_i18n?: Json
          slug: string
          sort_order?: number
          summary_i18n?: Json
          title_i18n?: Json
          updated_at?: string
          verse_count?: number
        }
        Update: {
          alt_names_i18n?: Json
          country_code?: string | null
          created_at?: string
          description_i18n?: Json
          embedding?: string | null
          era_end_year?: number | null
          era_start_year?: number | null
          fts?: unknown
          hero_image?: string | null
          icon?: string | null
          id?: string
          keywords_i18n?: Json
          kind?: Database["public"]["Enums"]["knowledge_kind"]
          latitude?: number | null
          longitude?: number | null
          published?: boolean
          revelation_period?: string | null
          seo_i18n?: Json
          slug?: string
          sort_order?: number
          summary_i18n?: Json
          title_i18n?: Json
          updated_at?: string
          verse_count?: number
        }
        Relationships: []
      }
      knowledge_entity_verses: {
        Row: {
          asbab_id: string | null
          ayah_end: number
          ayah_start: number
          created_at: string
          entity_id: string
          id: string
          note_i18n: Json
          relevance: number
          sort_order: number
          surah: number
          tafsir_passage_id: string | null
        }
        Insert: {
          asbab_id?: string | null
          ayah_end: number
          ayah_start: number
          created_at?: string
          entity_id: string
          id?: string
          note_i18n?: Json
          relevance?: number
          sort_order?: number
          surah: number
          tafsir_passage_id?: string | null
        }
        Update: {
          asbab_id?: string | null
          ayah_end?: number
          ayah_start?: number
          created_at?: string
          entity_id?: string
          id?: string
          note_i18n?: Json
          relevance?: number
          sort_order?: number
          surah?: number
          tafsir_passage_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_entity_verses_asbab_id_fkey"
            columns: ["asbab_id"]
            isOneToOne: false
            referencedRelation: "asbab_nuzul"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_entity_verses_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "knowledge_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_entity_verses_tafsir_passage_id_fkey"
            columns: ["tafsir_passage_id"]
            isOneToOne: false
            referencedRelation: "tafsir_passages"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_journey_progress: {
        Row: {
          completed_at: string
          id: string
          journey_id: string
          step_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          journey_id: string
          step_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          journey_id?: string
          step_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_journey_progress_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "knowledge_journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_journey_progress_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "knowledge_journey_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_journey_steps: {
        Row: {
          ayah_end: number | null
          ayah_start: number | null
          created_at: string
          entity_id: string | null
          id: string
          journey_id: string
          notes_i18n: Json
          step_order: number
          surah: number | null
        }
        Insert: {
          ayah_end?: number | null
          ayah_start?: number | null
          created_at?: string
          entity_id?: string | null
          id?: string
          journey_id: string
          notes_i18n?: Json
          step_order: number
          surah?: number | null
        }
        Update: {
          ayah_end?: number | null
          ayah_start?: number | null
          created_at?: string
          entity_id?: string | null
          id?: string
          journey_id?: string
          notes_i18n?: Json
          step_order?: number
          surah?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_journey_steps_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "knowledge_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_journey_steps_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "knowledge_journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_journeys: {
        Row: {
          created_at: string
          hero_image: string | null
          id: string
          level: number
          published: boolean
          slug: string
          sort_order: number
          summary_i18n: Json
          title_i18n: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          hero_image?: string | null
          id?: string
          level?: number
          published?: boolean
          slug: string
          sort_order?: number
          summary_i18n?: Json
          title_i18n?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          hero_image?: string | null
          id?: string
          level?: number
          published?: boolean
          slug?: string
          sort_order?: number
          summary_i18n?: Json
          title_i18n?: Json
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_relations: {
        Row: {
          created_at: string
          from_id: string
          id: string
          relation: Database["public"]["Enums"]["knowledge_relation"]
          to_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          from_id: string
          id?: string
          relation?: Database["public"]["Enums"]["knowledge_relation"]
          to_id: string
          weight?: number
        }
        Update: {
          created_at?: string
          from_id?: string
          id?: string
          relation?: Database["public"]["Enums"]["knowledge_relation"]
          to_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_relations_from_id_fkey"
            columns: ["from_id"]
            isOneToOne: false
            referencedRelation: "knowledge_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_relations_to_id_fkey"
            columns: ["to_id"]
            isOneToOne: false
            referencedRelation: "knowledge_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          ayah: number
          body: string
          created_at: string
          id: string
          surah: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ayah: number
          body: string
          created_at?: string
          id?: string
          surah: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ayah?: number
          body?: string
          created_at?: string
          id?: string
          surah?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          code: string
          created_at: string
          description: string
          id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description: string
          id?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      quran_chapters: {
        Row: {
          chapter_number: number
          created_at: string
          id: string
          name_ar: string
          name_he: string | null
          name_simple_en: string
          name_translated_en: string | null
          revelation_place: string | null
          updated_at: string
          verses_count: number
        }
        Insert: {
          chapter_number: number
          created_at?: string
          id?: string
          name_ar: string
          name_he?: string | null
          name_simple_en: string
          name_translated_en?: string | null
          revelation_place?: string | null
          updated_at?: string
          verses_count: number
        }
        Update: {
          chapter_number?: number
          created_at?: string
          id?: string
          name_ar?: string
          name_he?: string | null
          name_simple_en?: string
          name_translated_en?: string | null
          revelation_place?: string | null
          updated_at?: string
          verses_count?: number
        }
        Relationships: []
      }
      reading_plan_progress: {
        Row: {
          completed_at: string
          day: number
          plan_slug: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          day: number
          plan_slug: string
          user_id: string
        }
        Update: {
          completed_at?: string
          day?: number
          plan_slug?: string
          user_id?: string
        }
        Relationships: []
      }
      reading_progress: {
        Row: {
          ayah: number
          last_read_at: string
          surah: number
          user_id: string
        }
        Insert: {
          ayah?: number
          last_read_at?: string
          surah: number
          user_id: string
        }
        Update: {
          ayah?: number
          last_read_at?: string
          surah?: number
          user_id?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          id: string
          is_system: boolean
          level: number
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_system?: boolean
          level: number
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_system?: boolean
          level?: number
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      tafsir_hebrew: {
        Row: {
          ayah_key: string | null
          ayah_number: number
          created_at: string
          hebrew_translation: string
          id: string
          original_arabic_text: string
          original_tafsir_id: string
          quality_score: number | null
          source_tafsir_name: string
          surah_id: number
          translation_model: string
        }
        Insert: {
          ayah_key?: string | null
          ayah_number: number
          created_at?: string
          hebrew_translation: string
          id?: string
          original_arabic_text: string
          original_tafsir_id: string
          quality_score?: number | null
          source_tafsir_name: string
          surah_id: number
          translation_model: string
        }
        Update: {
          ayah_key?: string | null
          ayah_number?: number
          created_at?: string
          hebrew_translation?: string
          id?: string
          original_arabic_text?: string
          original_tafsir_id?: string
          quality_score?: number | null
          source_tafsir_name?: string
          surah_id?: number
          translation_model?: string
        }
        Relationships: [
          {
            foreignKeyName: "tafsir_hebrew_original_tafsir_id_fkey"
            columns: ["original_tafsir_id"]
            isOneToOne: false
            referencedRelation: "tafsir_passages"
            referencedColumns: ["id"]
          },
        ]
      }
      tafsir_passages: {
        Row: {
          ayah_end: number
          ayah_start: number
          body: string
          citation: string | null
          created_at: string
          id: string
          lang: string
          source_id: string
          surah: number
        }
        Insert: {
          ayah_end: number
          ayah_start: number
          body: string
          citation?: string | null
          created_at?: string
          id?: string
          lang: string
          source_id: string
          surah: number
        }
        Update: {
          ayah_end?: number
          ayah_start?: number
          body?: string
          citation?: string | null
          created_at?: string
          id?: string
          lang?: string
          source_id?: string
          surah?: number
        }
        Relationships: [
          {
            foreignKeyName: "tafsir_passages_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "tafsir_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      tafsir_sources: {
        Row: {
          author: string | null
          created_at: string
          era: string | null
          id: string
          license: string | null
          name_ar: string
          name_en: string
          name_he: string
          slug: string
        }
        Insert: {
          author?: string | null
          created_at?: string
          era?: string | null
          id?: string
          license?: string | null
          name_ar: string
          name_en: string
          name_he: string
          slug: string
        }
        Update: {
          author?: string | null
          created_at?: string
          era?: string | null
          id?: string
          license?: string | null
          name_ar?: string
          name_en?: string
          name_he?: string
          slug?: string
        }
        Relationships: []
      }
      topic_lessons: {
        Row: {
          body: string
          citation: string | null
          created_at: string
          entity_id: string
          id: string
          lang: string
          source_id: string
        }
        Insert: {
          body: string
          citation?: string | null
          created_at?: string
          entity_id: string
          id?: string
          lang: string
          source_id: string
        }
        Update: {
          body?: string
          citation?: string | null
          created_at?: string
          entity_id?: string
          id?: string
          lang?: string
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topic_lessons_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "knowledge_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_lessons_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "tafsir_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      translation_sources: {
        Row: {
          author: string | null
          code: string
          created_at: string
          id: string
          is_default: boolean
          language: string
          license: string | null
          name_en: string | null
          name_he: string
          source_url: string | null
        }
        Insert: {
          author?: string | null
          code: string
          created_at?: string
          id?: string
          is_default?: boolean
          language?: string
          license?: string | null
          name_en?: string | null
          name_he: string
          source_url?: string | null
        }
        Update: {
          author?: string | null
          code?: string
          created_at?: string
          id?: string
          is_default?: boolean
          language?: string
          license?: string | null
          name_en?: string | null
          name_he?: string
          source_url?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          interests: string[]
          onboarded_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          interests?: string[]
          onboarded_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          interests?: string[]
          onboarded_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      verse_embeddings: {
        Row: {
          arabic: string
          ayah: number
          created_at: string
          embedded_at: string | null
          embedding: string | null
          embedding_model: string | null
          fts: unknown
          hebrew: string
          surah: number
          themes: string[]
          updated_at: string
        }
        Insert: {
          arabic: string
          ayah: number
          created_at?: string
          embedded_at?: string | null
          embedding?: string | null
          embedding_model?: string | null
          fts?: unknown
          hebrew: string
          surah: number
          themes?: string[]
          updated_at?: string
        }
        Update: {
          arabic?: string
          ayah?: number
          created_at?: string
          embedded_at?: string | null
          embedding?: string | null
          embedding_model?: string | null
          fts?: unknown
          hebrew?: string
          surah?: number
          themes?: string[]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      hadith_narrators: {
        Row: {
          collections: string[] | null
          hadith_count: number | null
          narrator: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_user: {
        Args: { _permission_code: string; _user_id: string }
        Returns: boolean
      }
      claim_first_admin: { Args: { _user_id: string }; Returns: boolean }
      claim_or_sync_super_admin_by_email: {
        Args: { _email: string; _user_id: string }
        Returns: boolean
      }
      get_current_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_permission: {
        Args: { _permission_code: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      match_grounded_chunks: {
        Args: {
          language_filter?: string
          match_count?: number
          min_similarity?: number
          query_embedding: string
          surah_filter?: number
        }
        Returns: {
          ayah_end: number
          ayah_key: string
          ayah_start: number
          chunk_text: string
          content_type: string
          id: string
          language: string
          similarity: number
          source_name: string
          surah: number
          translator_name: string
        }[]
      }
      match_hadith_to_entities: {
        Args: {
          match_count?: number
          min_similarity?: number
          query_embedding: string
        }
        Returns: {
          entity_id: string
          similarity: number
        }[]
      }
      match_hadith_to_verses: {
        Args: {
          match_count?: number
          min_similarity?: number
          query_embedding: string
        }
        Returns: {
          ayah: number
          similarity: number
          surah: number
        }[]
      }
      match_verses: {
        Args: {
          match_count?: number
          min_similarity?: number
          query_embedding: string
          theme_filter?: string[]
        }
        Returns: {
          arabic: string
          ayah: number
          hebrew: string
          similarity: number
          surah: number
          themes: string[]
        }[]
      }
      role_level: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: number
      }
      search_entities_hybrid: {
        Args: {
          kind_filter?: Database["public"]["Enums"]["knowledge_kind"][]
          match_count?: number
          q: string
          query_embedding?: string
        }
        Returns: {
          hero_image: string
          icon: string
          id: string
          kind: Database["public"]["Enums"]["knowledge_kind"]
          score: number
          slug: string
          summary_i18n: Json
          title_i18n: Json
        }[]
      }
      search_hadith_hybrid: {
        Args: { collections?: string[]; match_count?: number; q: string }
        Returns: {
          arabic_text: string
          book_id: number
          collection_slug: string
          english_text: string
          global_id: number
          id: number
          id_in_book: number
          narrator: string
          score: number
        }[]
      }
      search_verses_hybrid: {
        Args: {
          match_count?: number
          q: string
          query_embedding?: string
          theme_filter?: string[]
        }
        Returns: {
          arabic: string
          ayah: number
          hebrew: string
          score: number
          surah: number
          themes: string[]
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "editor" | "super_admin"
      knowledge_kind:
        | "topic"
        | "prophet"
        | "story"
        | "event"
        | "place"
        | "nation"
        | "concept"
        | "theme"
        | "person"
      knowledge_relation:
        | "related"
        | "child_of"
        | "happened_in"
        | "involves"
        | "teaches"
        | "mentions"
        | "part_of"
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
      app_role: ["admin", "moderator", "user", "editor", "super_admin"],
      knowledge_kind: [
        "topic",
        "prophet",
        "story",
        "event",
        "place",
        "nation",
        "concept",
        "theme",
        "person",
      ],
      knowledge_relation: [
        "related",
        "child_of",
        "happened_in",
        "involves",
        "teaches",
        "mentions",
        "part_of",
      ],
    },
  },
} as const
