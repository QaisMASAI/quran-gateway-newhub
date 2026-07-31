export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      achievements: {
        Row: {
          code: string;
          earned_at: string;
          id: string;
          meta: Json;
          user_id: string;
        };
        Insert: {
          code: string;
          earned_at?: string;
          id?: string;
          meta?: Json;
          user_id: string;
        };
        Update: {
          code?: string;
          earned_at?: string;
          id?: string;
          meta?: Json;
          user_id?: string;
        };
        Relationships: [];
      };
      admin_account_status: {
        Row: {
          created_at: string;
          is_suspended: boolean;
          reason: string | null;
          updated_at: string;
          updated_by: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          is_suspended?: boolean;
          reason?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          is_suspended?: boolean;
          reason?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      admin_audit_log: {
        Row: {
          action: string;
          actor_user_id: string;
          created_at: string;
          id: string;
          ip_address: string | null;
          metadata: Json;
          new_value: Json | null;
          old_value: Json | null;
          target_user_id: string | null;
          user_agent: string | null;
        };
        Insert: {
          action: string;
          actor_user_id: string;
          created_at?: string;
          id?: string;
          ip_address?: string | null;
          metadata?: Json;
          new_value?: Json | null;
          old_value?: Json | null;
          target_user_id?: string | null;
          user_agent?: string | null;
        };
        Update: {
          action?: string;
          actor_user_id?: string;
          created_at?: string;
          id?: string;
          ip_address?: string | null;
          metadata?: Json;
          new_value?: Json | null;
          old_value?: Json | null;
          target_user_id?: string | null;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      admin_feature_flags: {
        Row: {
          created_at: string;
          description: string | null;
          enabled: boolean;
          flag_key: string;
          id: string;
          metadata: Json;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          enabled?: boolean;
          flag_key: string;
          id?: string;
          metadata?: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          enabled?: boolean;
          flag_key?: string;
          id?: string;
          metadata?: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      admin_integrations: {
        Row: {
          created_at: string;
          id: string;
          integration_key: string;
          masked_value: string | null;
          metadata: Json;
          status: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          integration_key: string;
          masked_value?: string | null;
          metadata?: Json;
          status?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          integration_key?: string;
          masked_value?: string | null;
          metadata?: Json;
          status?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      admin_job_runs: {
        Row: {
          created_at: string;
          error_message: string | null;
          finished_at: string | null;
          id: string;
          job_key: string;
          payload: Json;
          requested_by: string;
          result: Json | null;
          started_at: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          error_message?: string | null;
          finished_at?: string | null;
          id?: string;
          job_key: string;
          payload?: Json;
          requested_by: string;
          result?: Json | null;
          started_at?: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          error_message?: string | null;
          finished_at?: string | null;
          id?: string;
          job_key?: string;
          payload?: Json;
          requested_by?: string;
          result?: Json | null;
          started_at?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_runtime_settings: {
        Row: {
          created_at: string;
          key: string;
          updated_at: string;
          updated_by: string | null;
          value_json: Json;
        };
        Insert: {
          created_at?: string;
          key: string;
          updated_at?: string;
          updated_by?: string | null;
          value_json?: Json;
        };
        Update: {
          created_at?: string;
          key?: string;
          updated_at?: string;
          updated_by?: string | null;
          value_json?: Json;
        };
        Relationships: [];
      };
      ai_research_queries: {
        Row: {
          answer: string | null;
          citations: Json;
          confidence: number | null;
          created_at: string;
          id: string;
          language: string;
          question: string;
          user_id: string | null;
        };
        Insert: {
          answer?: string | null;
          citations?: Json;
          confidence?: number | null;
          created_at?: string;
          id?: string;
          language?: string;
          question: string;
          user_id?: string | null;
        };
        Update: {
          answer?: string | null;
          citations?: Json;
          confidence?: number | null;
          created_at?: string;
          id?: string;
          language?: string;
          question?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      asbab_nuzul: {
        Row: {
          ayah_end: number;
          ayah_start: number;
          body: string;
          citation: string | null;
          created_at: string;
          id: string;
          lang: string;
          source_id: string;
          surah: number;
        };
        Insert: {
          ayah_end: number;
          ayah_start: number;
          body: string;
          citation?: string | null;
          created_at?: string;
          id?: string;
          lang: string;
          source_id: string;
          surah: number;
        };
        Update: {
          ayah_end?: number;
          ayah_start?: number;
          body?: string;
          citation?: string | null;
          created_at?: string;
          id?: string;
          lang?: string;
          source_id?: string;
          surah?: number;
        };
        Relationships: [
          {
            foreignKeyName: "asbab_nuzul_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "tafsir_sources";
            referencedColumns: ["id"];
          },
        ];
      };
      ayah_translations: {
        Row: {
          ayah: number;
          id: number;
          source_id: string;
          surah: number;
          text: string;
        };
        Insert: {
          ayah: number;
          id?: number;
          source_id: string;
          surah: number;
          text: string;
        };
        Update: {
          ayah?: number;
          id?: number;
          source_id?: string;
          surah?: number;
          text?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ayah_translations_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "translation_sources";
            referencedColumns: ["id"];
          },
        ];
      };
      bookmarks: {
        Row: {
          arabic_snapshot: string | null;
          ayah: number;
          created_at: string;
          hebrew_snapshot: string | null;
          id: string;
          note: string | null;
          surah: number;
          surah_name: string | null;
          user_id: string;
        };
        Insert: {
          arabic_snapshot?: string | null;
          ayah: number;
          created_at?: string;
          hebrew_snapshot?: string | null;
          id?: string;
          note?: string | null;
          surah: number;
          surah_name?: string | null;
          user_id: string;
        };
        Update: {
          arabic_snapshot?: string | null;
          ayah?: number;
          created_at?: string;
          hebrew_snapshot?: string | null;
          id?: string;
          note?: string | null;
          surah?: number;
          surah_name?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      cms_page_versions: {
        Row: {
          change_note: string | null;
          content: Json;
          created_at: string;
          editor_user_id: string | null;
          id: string;
          page_id: string;
          version_no: number;
        };
        Insert: {
          change_note?: string | null;
          content?: Json;
          created_at?: string;
          editor_user_id?: string | null;
          id?: string;
          page_id: string;
          version_no: number;
        };
        Update: {
          change_note?: string | null;
          content?: Json;
          created_at?: string;
          editor_user_id?: string | null;
          id?: string;
          page_id?: string;
          version_no?: number;
        };
        Relationships: [
          {
            foreignKeyName: "cms_page_versions_page_id_fkey";
            columns: ["page_id"];
            isOneToOne: false;
            referencedRelation: "cms_pages";
            referencedColumns: ["id"];
          },
        ];
      };
      cms_pages: {
        Row: {
          archived_at: string | null;
          body_i18n: Json;
          breadcrumbs: Json;
          canonical_url: string | null;
          created_at: string;
          id: string;
          jsonld: Json;
          language_visibility: string[];
          last_editor: string | null;
          menu_visible: boolean;
          og_i18n: Json;
          published_at: string | null;
          scheduled_at: string | null;
          search_visible: boolean;
          seo_description_i18n: Json;
          seo_title_i18n: Json;
          slug: string;
          status: Database["public"]["Enums"]["knowledge_publication_status"];
          template_key: string | null;
          title_i18n: Json;
          twitter_i18n: Json;
          updated_at: string;
        };
        Insert: {
          archived_at?: string | null;
          body_i18n?: Json;
          breadcrumbs?: Json;
          canonical_url?: string | null;
          created_at?: string;
          id?: string;
          jsonld?: Json;
          language_visibility?: string[];
          last_editor?: string | null;
          menu_visible?: boolean;
          og_i18n?: Json;
          published_at?: string | null;
          scheduled_at?: string | null;
          search_visible?: boolean;
          seo_description_i18n?: Json;
          seo_title_i18n?: Json;
          slug: string;
          status?: Database["public"]["Enums"]["knowledge_publication_status"];
          template_key?: string | null;
          title_i18n?: Json;
          twitter_i18n?: Json;
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          body_i18n?: Json;
          breadcrumbs?: Json;
          canonical_url?: string | null;
          created_at?: string;
          id?: string;
          jsonld?: Json;
          language_visibility?: string[];
          last_editor?: string | null;
          menu_visible?: boolean;
          og_i18n?: Json;
          published_at?: string | null;
          scheduled_at?: string | null;
          search_visible?: boolean;
          seo_description_i18n?: Json;
          seo_title_i18n?: Json;
          slug?: string;
          status?: Database["public"]["Enums"]["knowledge_publication_status"];
          template_key?: string | null;
          title_i18n?: Json;
          twitter_i18n?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      collection_items: {
        Row: {
          ayah_end: number | null;
          ayah_start: number | null;
          collection_id: string;
          created_at: string;
          entity_id: string | null;
          id: string;
          item_kind: string;
          note: string | null;
          sort_order: number;
          surah: number | null;
        };
        Insert: {
          ayah_end?: number | null;
          ayah_start?: number | null;
          collection_id: string;
          created_at?: string;
          entity_id?: string | null;
          id?: string;
          item_kind: string;
          note?: string | null;
          sort_order?: number;
          surah?: number | null;
        };
        Update: {
          ayah_end?: number | null;
          ayah_start?: number | null;
          collection_id?: string;
          created_at?: string;
          entity_id?: string | null;
          id?: string;
          item_kind?: string;
          note?: string | null;
          sort_order?: number;
          surah?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "collection_items_entity_id_fkey";
            columns: ["entity_id"];
            isOneToOne: false;
            referencedRelation: "knowledge_entities";
            referencedColumns: ["id"];
          },
        ];
      };
      collections: {
        Row: {
          cover_color: string | null;
          created_at: string;
          description: string | null;
          id: string;
          is_public: boolean;
          name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cover_color?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_public?: boolean;
          name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          cover_color?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_public?: boolean;
          name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      daily_journeys: {
        Row: {
          ayah: number;
          completed: boolean;
          created_at: string;
          day: string;
          entity_id: string | null;
          id: string;
          reflection: string | null;
          surah: number;
          user_id: string;
        };
        Insert: {
          ayah: number;
          completed?: boolean;
          created_at?: string;
          day: string;
          entity_id?: string | null;
          id?: string;
          reflection?: string | null;
          surah: number;
          user_id: string;
        };
        Update: {
          ayah?: number;
          completed?: boolean;
          created_at?: string;
          day?: string;
          entity_id?: string | null;
          id?: string;
          reflection?: string | null;
          surah?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "daily_journeys_entity_id_fkey";
            columns: ["entity_id"];
            isOneToOne: false;
            referencedRelation: "knowledge_entities";
            referencedColumns: ["id"];
          },
        ];
      };
      embedding_jobs: {
        Row: {
          created_at: string;
          duration_ms: number | null;
          embedding_model: string;
          entry_id: string;
          failed_reason: string | null;
          finished_at: string | null;
          id: string;
          language_code: string;
          max_retries: number;
          requested_by: string | null;
          retry_count: number;
          started_at: string | null;
          status: Database["public"]["Enums"]["knowledge_job_status"];
          updated_at: string;
          worker_id: string | null;
        };
        Insert: {
          created_at?: string;
          duration_ms?: number | null;
          embedding_model?: string;
          entry_id: string;
          failed_reason?: string | null;
          finished_at?: string | null;
          id?: string;
          language_code: string;
          max_retries?: number;
          requested_by?: string | null;
          retry_count?: number;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["knowledge_job_status"];
          updated_at?: string;
          worker_id?: string | null;
        };
        Update: {
          created_at?: string;
          duration_ms?: number | null;
          embedding_model?: string;
          entry_id?: string;
          failed_reason?: string | null;
          finished_at?: string | null;
          id?: string;
          language_code?: string;
          max_retries?: number;
          requested_by?: string | null;
          retry_count?: number;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["knowledge_job_status"];
          updated_at?: string;
          worker_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "embedding_jobs_entry_id_fkey";
            columns: ["entry_id"];
            isOneToOne: false;
            referencedRelation: "knowledge_entries";
            referencedColumns: ["id"];
          },
        ];
      };
      grounded_chunks: {
        Row: {
          ayah_end: number | null;
          ayah_key: string | null;
          ayah_start: number | null;
          chunk_text: string;
          content_type: string;
          created_at: string;
          embedding: string | null;
          embedding_model: string;
          fts: unknown;
          id: string;
          language: string;
          source_key: string;
          source_name: string;
          source_row_id: string | null;
          source_table: string;
          surah: number | null;
          translator_name: string | null;
        };
        Insert: {
          ayah_end?: number | null;
          ayah_key?: string | null;
          ayah_start?: number | null;
          chunk_text: string;
          content_type: string;
          created_at?: string;
          embedding?: string | null;
          embedding_model?: string;
          fts?: unknown;
          id?: string;
          language: string;
          source_key: string;
          source_name: string;
          source_row_id?: string | null;
          source_table: string;
          surah?: number | null;
          translator_name?: string | null;
        };
        Update: {
          ayah_end?: number | null;
          ayah_key?: string | null;
          ayah_start?: number | null;
          chunk_text?: string;
          content_type?: string;
          created_at?: string;
          embedding?: string | null;
          embedding_model?: string;
          fts?: unknown;
          id?: string;
          language?: string;
          source_key?: string;
          source_name?: string;
          source_row_id?: string | null;
          source_table?: string;
          surah?: number | null;
          translator_name?: string | null;
        };
        Relationships: [];
      };
      hadith_books: {
        Row: {
          book_id: number;
          collection_slug: string;
          hadith_count: number;
          id: number;
          name_ar: string;
          name_en: string;
          name_he: string | null;
        };
        Insert: {
          book_id: number;
          collection_slug: string;
          hadith_count?: number;
          id?: number;
          name_ar: string;
          name_en: string;
          name_he?: string | null;
        };
        Update: {
          book_id?: number;
          collection_slug?: string;
          hadith_count?: number;
          id?: number;
          name_ar?: string;
          name_en?: string;
          name_he?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "hadith_books_collection_slug_fkey";
            columns: ["collection_slug"];
            isOneToOne: false;
            referencedRelation: "hadith_collections";
            referencedColumns: ["slug"];
          },
        ];
      };
      hadith_chapters: {
        Row: {
          book_id: number;
          chapter_number: number;
          collection_slug: string;
          created_at: string;
          id: number;
          metadata: Json;
          title_ar: string | null;
          title_en: string | null;
          title_he: string | null;
        };
        Insert: {
          book_id: number;
          chapter_number: number;
          collection_slug: string;
          created_at?: string;
          id?: number;
          metadata?: Json;
          title_ar?: string | null;
          title_en?: string | null;
          title_he?: string | null;
        };
        Update: {
          book_id?: number;
          chapter_number?: number;
          collection_slug?: string;
          created_at?: string;
          id?: number;
          metadata?: Json;
          title_ar?: string | null;
          title_en?: string | null;
          title_he?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "hadith_chapters_collection_slug_fkey";
            columns: ["collection_slug"];
            isOneToOne: false;
            referencedRelation: "hadith_collections";
            referencedColumns: ["slug"];
          },
        ];
      };
      hadith_collections: {
        Row: {
          author_ar: string | null;
          author_en: string | null;
          created_at: string;
          slug: string;
          sort_order: number;
          title_ar: string;
          title_en: string;
          title_he: string | null;
          total_books: number;
          total_hadith: number;
        };
        Insert: {
          author_ar?: string | null;
          author_en?: string | null;
          created_at?: string;
          slug: string;
          sort_order?: number;
          title_ar: string;
          title_en: string;
          title_he?: string | null;
          total_books?: number;
          total_hadith?: number;
        };
        Update: {
          author_ar?: string | null;
          author_en?: string | null;
          created_at?: string;
          slug?: string;
          sort_order?: number;
          title_ar?: string;
          title_en?: string;
          title_he?: string | null;
          total_books?: number;
          total_hadith?: number;
        };
        Relationships: [];
      };
      hadith_entity_links: {
        Row: {
          ayah: number | null;
          entity_id: string | null;
          hadith_id: number;
          id: number;
          surah: number | null;
          weight: number;
        };
        Insert: {
          ayah?: number | null;
          entity_id?: string | null;
          hadith_id: number;
          id?: number;
          surah?: number | null;
          weight?: number;
        };
        Update: {
          ayah?: number | null;
          entity_id?: string | null;
          hadith_id?: number;
          id?: number;
          surah?: number | null;
          weight?: number;
        };
        Relationships: [
          {
            foreignKeyName: "hadith_entity_links_entity_id_fkey";
            columns: ["entity_id"];
            isOneToOne: false;
            referencedRelation: "knowledge_entities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "hadith_entity_links_hadith_id_fkey";
            columns: ["hadith_id"];
            isOneToOne: false;
            referencedRelation: "hadith_entries";
            referencedColumns: ["id"];
          },
        ];
      };
      hadith_entries: {
        Row: {
          api_source: string;
          arabic_text: string;
          book_id: number;
          chain_text: string | null;
          chapter_id: number | null;
          collection_slug: string;
          created_at: string;
          embedded_at: string | null;
          embedding: string | null;
          embedding_model: string | null;
          english_text: string | null;
          fts: unknown;
          global_id: number;
          grade: string | null;
          grade_source: string | null;
          hebrew_text: string | null;
          id: number;
          id_in_book: number;
          import_run_id: string | null;
          narrator: string | null;
          notes: string | null;
          reference_text: string | null;
          source_payload: Json;
          updated_at: string;
        };
        Insert: {
          api_source?: string;
          arabic_text: string;
          book_id: number;
          chain_text?: string | null;
          chapter_id?: number | null;
          collection_slug: string;
          created_at?: string;
          embedded_at?: string | null;
          embedding?: string | null;
          embedding_model?: string | null;
          english_text?: string | null;
          fts?: unknown;
          global_id: number;
          grade?: string | null;
          grade_source?: string | null;
          hebrew_text?: string | null;
          id?: number;
          id_in_book: number;
          import_run_id?: string | null;
          narrator?: string | null;
          notes?: string | null;
          reference_text?: string | null;
          source_payload?: Json;
          updated_at?: string;
        };
        Update: {
          api_source?: string;
          arabic_text?: string;
          book_id?: number;
          chain_text?: string | null;
          chapter_id?: number | null;
          collection_slug?: string;
          created_at?: string;
          embedded_at?: string | null;
          embedding?: string | null;
          embedding_model?: string | null;
          english_text?: string | null;
          fts?: unknown;
          global_id?: number;
          grade?: string | null;
          grade_source?: string | null;
          hebrew_text?: string | null;
          id?: number;
          id_in_book?: number;
          import_run_id?: string | null;
          narrator?: string | null;
          notes?: string | null;
          reference_text?: string | null;
          source_payload?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hadith_entries_chapter_id_fkey";
            columns: ["chapter_id"];
            isOneToOne: false;
            referencedRelation: "hadith_chapters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "hadith_entries_collection_slug_fkey";
            columns: ["collection_slug"];
            isOneToOne: false;
            referencedRelation: "hadith_collections";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "hadith_entries_import_run_id_fkey";
            columns: ["import_run_id"];
            isOneToOne: false;
            referencedRelation: "import_jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      hadith_translations: {
        Row: {
          body: string;
          created_at: string;
          fts: unknown;
          hadith_id: number;
          id: number;
          is_machine: boolean;
          language_code: string;
          metadata: Json;
          source: string | null;
          title: string | null;
          translated_at: string | null;
          translator: string | null;
          updated_at: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          fts?: unknown;
          hadith_id: number;
          id?: number;
          is_machine?: boolean;
          language_code: string;
          metadata?: Json;
          source?: string | null;
          title?: string | null;
          translated_at?: string | null;
          translator?: string | null;
          updated_at?: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          fts?: unknown;
          hadith_id?: number;
          id?: number;
          is_machine?: boolean;
          language_code?: string;
          metadata?: Json;
          source?: string | null;
          title?: string | null;
          translated_at?: string | null;
          translator?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hadith_translations_hadith_id_fkey";
            columns: ["hadith_id"];
            isOneToOne: false;
            referencedRelation: "hadith_entries";
            referencedColumns: ["id"];
          },
        ];
      };
      import_jobs: {
        Row: {
          cancelled_at: string | null;
          checkpoint: Json;
          checksum: string | null;
          created_at: string;
          error_message: string | null;
          failed_batches: Json;
          finished_at: string | null;
          id: string;
          job_name: string;
          max_retries: number;
          paused_at: string | null;
          requested_by: string | null;
          retry_count: number;
          source_id: string | null;
          started_at: string | null;
          stats: Json;
          status: Database["public"]["Enums"]["knowledge_job_status"];
          updated_at: string;
          worker_id: string | null;
        };
        Insert: {
          cancelled_at?: string | null;
          checkpoint?: Json;
          checksum?: string | null;
          created_at?: string;
          error_message?: string | null;
          failed_batches?: Json;
          finished_at?: string | null;
          id?: string;
          job_name: string;
          max_retries?: number;
          paused_at?: string | null;
          requested_by?: string | null;
          retry_count?: number;
          source_id?: string | null;
          started_at?: string | null;
          stats?: Json;
          status?: Database["public"]["Enums"]["knowledge_job_status"];
          updated_at?: string;
          worker_id?: string | null;
        };
        Update: {
          cancelled_at?: string | null;
          checkpoint?: Json;
          checksum?: string | null;
          created_at?: string;
          error_message?: string | null;
          failed_batches?: Json;
          finished_at?: string | null;
          id?: string;
          job_name?: string;
          max_retries?: number;
          paused_at?: string | null;
          requested_by?: string | null;
          retry_count?: number;
          source_id?: string | null;
          started_at?: string | null;
          stats?: Json;
          status?: Database["public"]["Enums"]["knowledge_job_status"];
          updated_at?: string;
          worker_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "import_jobs_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "knowledge_sources";
            referencedColumns: ["id"];
          },
        ];
      };
      kids_pin_audit_logs: {
        Row: {
          attempt_type: string;
          created_at: string;
          failure_reason: string | null;
          id: string;
          ip_address: string | null;
          profile_id: string;
          success: boolean;
          user_agent: string | null;
          user_id: string;
        };
        Insert: {
          attempt_type: string;
          created_at?: string;
          failure_reason?: string | null;
          id?: string;
          ip_address?: string | null;
          profile_id: string;
          success: boolean;
          user_agent?: string | null;
          user_id: string;
        };
        Update: {
          attempt_type?: string;
          created_at?: string;
          failure_reason?: string | null;
          id?: string;
          ip_address?: string | null;
          profile_id?: string;
          success?: boolean;
          user_agent?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "kids_pin_audit_logs_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "kids_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      kids_profile_progress: {
        Row: {
          activity_log: Json;
          created_at: string;
          id: string;
          offline_sync_version: number;
          profile_id: string;
          progress: Json;
          rewards: Json;
          settings: Json;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          activity_log?: Json;
          created_at?: string;
          id?: string;
          offline_sync_version?: number;
          profile_id: string;
          progress?: Json;
          rewards?: Json;
          settings?: Json;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          activity_log?: Json;
          created_at?: string;
          id?: string;
          offline_sync_version?: number;
          profile_id?: string;
          progress?: Json;
          rewards?: Json;
          settings?: Json;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "kids_profile_progress_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "kids_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      kids_profiles: {
        Row: {
          age_group: string;
          avatar_emoji: string;
          created_at: string;
          difficulty_limit: number;
          id: string;
          is_active: boolean;
          name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          age_group?: string;
          avatar_emoji?: string;
          created_at?: string;
          difficulty_limit?: number;
          id?: string;
          is_active?: boolean;
          name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          age_group?: string;
          avatar_emoji?: string;
          created_at?: string;
          difficulty_limit?: number;
          id?: string;
          is_active?: boolean;
          name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      kids_progress: {
        Row: {
          activity_log: Json;
          progress: Json;
          rewards: Json;
          settings: Json;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          activity_log?: Json;
          progress?: Json;
          rewards?: Json;
          settings?: Json;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          activity_log?: Json;
          progress?: Json;
          rewards?: Json;
          settings?: Json;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      kids_questions: {
        Row: {
          age_group: string;
          answer_index: number;
          category: string;
          created_at: string;
          created_by: string | null;
          difficulty: number;
          expected_answer: string | null;
          hint: string | null;
          id: string;
          language_code: string;
          options: Json;
          published: boolean;
          question: string;
          question_kind: string;
          related_ref: string | null;
          updated_at: string;
        };
        Insert: {
          age_group: string;
          answer_index: number;
          category: string;
          created_at?: string;
          created_by?: string | null;
          difficulty?: number;
          expected_answer?: string | null;
          hint?: string | null;
          id?: string;
          language_code?: string;
          options: Json;
          published?: boolean;
          question: string;
          question_kind?: string;
          related_ref?: string | null;
          updated_at?: string;
        };
        Update: {
          age_group?: string;
          answer_index?: number;
          category?: string;
          created_at?: string;
          created_by?: string | null;
          difficulty?: number;
          expected_answer?: string | null;
          hint?: string | null;
          id?: string;
          language_code?: string;
          options?: Json;
          published?: boolean;
          question?: string;
          question_kind?: string;
          related_ref?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      knowledge_embeddings: {
        Row: {
          checksum: string | null;
          created_at: string;
          dimensions: number;
          embedding: string | null;
          embedding_model: string;
          entry_id: string;
          id: string;
          language_code: string;
          metadata: Json;
          translation_id: string | null;
          updated_at: string;
        };
        Insert: {
          checksum?: string | null;
          created_at?: string;
          dimensions?: number;
          embedding?: string | null;
          embedding_model?: string;
          entry_id: string;
          id?: string;
          language_code: string;
          metadata?: Json;
          translation_id?: string | null;
          updated_at?: string;
        };
        Update: {
          checksum?: string | null;
          created_at?: string;
          dimensions?: number;
          embedding?: string | null;
          embedding_model?: string;
          entry_id?: string;
          id?: string;
          language_code?: string;
          metadata?: Json;
          translation_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "knowledge_embeddings_entry_id_fkey";
            columns: ["entry_id"];
            isOneToOne: false;
            referencedRelation: "knowledge_entries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "knowledge_embeddings_translation_id_fkey";
            columns: ["translation_id"];
            isOneToOne: false;
            referencedRelation: "knowledge_translations";
            referencedColumns: ["id"];
          },
        ];
      };
      knowledge_entities: {
        Row: {
          alt_names_i18n: Json;
          country_code: string | null;
          created_at: string;
          description_i18n: Json;
          embedding: string | null;
          era_end_year: number | null;
          era_start_year: number | null;
          fts: unknown;
          hero_image: string | null;
          icon: string | null;
          id: string;
          keywords_i18n: Json;
          kind: Database["public"]["Enums"]["knowledge_kind"];
          latitude: number | null;
          longitude: number | null;
          published: boolean;
          revelation_period: string | null;
          seo_i18n: Json;
          slug: string;
          sort_order: number;
          summary_i18n: Json;
          title_i18n: Json;
          updated_at: string;
          verse_count: number;
        };
        Insert: {
          alt_names_i18n?: Json;
          country_code?: string | null;
          created_at?: string;
          description_i18n?: Json;
          embedding?: string | null;
          era_end_year?: number | null;
          era_start_year?: number | null;
          fts?: unknown;
          hero_image?: string | null;
          icon?: string | null;
          id?: string;
          keywords_i18n?: Json;
          kind: Database["public"]["Enums"]["knowledge_kind"];
          latitude?: number | null;
          longitude?: number | null;
          published?: boolean;
          revelation_period?: string | null;
          seo_i18n?: Json;
          slug: string;
          sort_order?: number;
          summary_i18n?: Json;
          title_i18n?: Json;
          updated_at?: string;
          verse_count?: number;
        };
        Update: {
          alt_names_i18n?: Json;
          country_code?: string | null;
          created_at?: string;
          description_i18n?: Json;
          embedding?: string | null;
          era_end_year?: number | null;
          era_start_year?: number | null;
          fts?: unknown;
          hero_image?: string | null;
          icon?: string | null;
          id?: string;
          keywords_i18n?: Json;
          kind?: Database["public"]["Enums"]["knowledge_kind"];
          latitude?: number | null;
          longitude?: number | null;
          published?: boolean;
          revelation_period?: string | null;
          seo_i18n?: Json;
          slug?: string;
          sort_order?: number;
          summary_i18n?: Json;
          title_i18n?: Json;
          updated_at?: string;
          verse_count?: number;
        };
        Relationships: [];
      };
      knowledge_entity_verses: {
        Row: {
          asbab_id: string | null;
          ayah_end: number;
          ayah_start: number;
          created_at: string;
          entity_id: string;
          id: string;
          note_i18n: Json;
          relevance: number;
          sort_order: number;
          surah: number;
          tafsir_passage_id: string | null;
        };
        Insert: {
          asbab_id?: string | null;
          ayah_end: number;
          ayah_start: number;
          created_at?: string;
          entity_id: string;
          id?: string;
          note_i18n?: Json;
          relevance?: number;
          sort_order?: number;
          surah: number;
          tafsir_passage_id?: string | null;
        };
        Update: {
          asbab_id?: string | null;
          ayah_end?: number;
          ayah_start?: number;
          created_at?: string;
          entity_id?: string;
          id?: string;
          note_i18n?: Json;
          relevance?: number;
          sort_order?: number;
          surah?: number;
          tafsir_passage_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "knowledge_entity_verses_asbab_id_fkey";
            columns: ["asbab_id"];
            isOneToOne: false;
            referencedRelation: "asbab_nuzul";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "knowledge_entity_verses_entity_id_fkey";
            columns: ["entity_id"];
            isOneToOne: false;
            referencedRelation: "knowledge_entities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "knowledge_entity_verses_tafsir_passage_id_fkey";
            columns: ["tafsir_passage_id"];
            isOneToOne: false;
            referencedRelation: "tafsir_passages";
            referencedColumns: ["id"];
          },
        ];
      };
      knowledge_entries: {
        Row: {
          ayah_end: number | null;
          ayah_start: number | null;
          canonical_ref: string | null;
          checksum: string | null;
          content_kind: string;
          created_at: string;
          external_key: string;
          id: string;
          metadata: Json;
          publication_status: Database["public"]["Enums"]["knowledge_publication_status"];
          published_at: string | null;
          source_id: string;
          surah: number | null;
          updated_at: string;
        };
        Insert: {
          ayah_end?: number | null;
          ayah_start?: number | null;
          canonical_ref?: string | null;
          checksum?: string | null;
          content_kind: string;
          created_at?: string;
          external_key: string;
          id?: string;
          metadata?: Json;
          publication_status?: Database["public"]["Enums"]["knowledge_publication_status"];
          published_at?: string | null;
          source_id: string;
          surah?: number | null;
          updated_at?: string;
        };
        Update: {
          ayah_end?: number | null;
          ayah_start?: number | null;
          canonical_ref?: string | null;
          checksum?: string | null;
          content_kind?: string;
          created_at?: string;
          external_key?: string;
          id?: string;
          metadata?: Json;
          publication_status?: Database["public"]["Enums"]["knowledge_publication_status"];
          published_at?: string | null;
          source_id?: string;
          surah?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "knowledge_entries_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "knowledge_sources";
            referencedColumns: ["id"];
          },
        ];
      };
      knowledge_job_logs: {
        Row: {
          actor_user_id: string | null;
          created_at: string;
          details: Json;
          id: string;
          job_id: string;
          job_type: string;
          level: string;
          message: string;
          status: Database["public"]["Enums"]["knowledge_job_status"] | null;
        };
        Insert: {
          actor_user_id?: string | null;
          created_at?: string;
          details?: Json;
          id?: string;
          job_id: string;
          job_type: string;
          level?: string;
          message: string;
          status?: Database["public"]["Enums"]["knowledge_job_status"] | null;
        };
        Update: {
          actor_user_id?: string | null;
          created_at?: string;
          details?: Json;
          id?: string;
          job_id?: string;
          job_type?: string;
          level?: string;
          message?: string;
          status?: Database["public"]["Enums"]["knowledge_job_status"] | null;
        };
        Relationships: [];
      };
      knowledge_journey_progress: {
        Row: {
          completed_at: string;
          id: string;
          journey_id: string;
          step_id: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string;
          id?: string;
          journey_id: string;
          step_id: string;
          user_id: string;
        };
        Update: {
          completed_at?: string;
          id?: string;
          journey_id?: string;
          step_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "knowledge_journey_progress_journey_id_fkey";
            columns: ["journey_id"];
            isOneToOne: false;
            referencedRelation: "knowledge_journeys";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "knowledge_journey_progress_step_id_fkey";
            columns: ["step_id"];
            isOneToOne: false;
            referencedRelation: "knowledge_journey_steps";
            referencedColumns: ["id"];
          },
        ];
      };
      knowledge_journey_steps: {
        Row: {
          ayah_end: number | null;
          ayah_start: number | null;
          created_at: string;
          entity_id: string | null;
          id: string;
          journey_id: string;
          notes_i18n: Json;
          step_order: number;
          surah: number | null;
        };
        Insert: {
          ayah_end?: number | null;
          ayah_start?: number | null;
          created_at?: string;
          entity_id?: string | null;
          id?: string;
          journey_id: string;
          notes_i18n?: Json;
          step_order: number;
          surah?: number | null;
        };
        Update: {
          ayah_end?: number | null;
          ayah_start?: number | null;
          created_at?: string;
          entity_id?: string | null;
          id?: string;
          journey_id?: string;
          notes_i18n?: Json;
          step_order?: number;
          surah?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "knowledge_journey_steps_entity_id_fkey";
            columns: ["entity_id"];
            isOneToOne: false;
            referencedRelation: "knowledge_entities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "knowledge_journey_steps_journey_id_fkey";
            columns: ["journey_id"];
            isOneToOne: false;
            referencedRelation: "knowledge_journeys";
            referencedColumns: ["id"];
          },
        ];
      };
      knowledge_journeys: {
        Row: {
          created_at: string;
          hero_image: string | null;
          id: string;
          level: number;
          published: boolean;
          slug: string;
          sort_order: number;
          summary_i18n: Json;
          title_i18n: Json;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          hero_image?: string | null;
          id?: string;
          level?: number;
          published?: boolean;
          slug: string;
          sort_order?: number;
          summary_i18n?: Json;
          title_i18n?: Json;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          hero_image?: string | null;
          id?: string;
          level?: number;
          published?: boolean;
          slug?: string;
          sort_order?: number;
          summary_i18n?: Json;
          title_i18n?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      knowledge_relations: {
        Row: {
          created_at: string;
          from_id: string;
          id: string;
          relation: Database["public"]["Enums"]["knowledge_relation"];
          to_id: string;
          weight: number;
        };
        Insert: {
          created_at?: string;
          from_id: string;
          id?: string;
          relation?: Database["public"]["Enums"]["knowledge_relation"];
          to_id: string;
          weight?: number;
        };
        Update: {
          created_at?: string;
          from_id?: string;
          id?: string;
          relation?: Database["public"]["Enums"]["knowledge_relation"];
          to_id?: string;
          weight?: number;
        };
        Relationships: [
          {
            foreignKeyName: "knowledge_relations_from_id_fkey";
            columns: ["from_id"];
            isOneToOne: false;
            referencedRelation: "knowledge_entities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "knowledge_relations_to_id_fkey";
            columns: ["to_id"];
            isOneToOne: false;
            referencedRelation: "knowledge_entities";
            referencedColumns: ["id"];
          },
        ];
      };
      knowledge_relationships: {
        Row: {
          created_at: string;
          from_entry_id: string;
          id: string;
          metadata: Json;
          relation_type: string;
          to_entry_id: string;
          weight: number;
        };
        Insert: {
          created_at?: string;
          from_entry_id: string;
          id?: string;
          metadata?: Json;
          relation_type: string;
          to_entry_id: string;
          weight?: number;
        };
        Update: {
          created_at?: string;
          from_entry_id?: string;
          id?: string;
          metadata?: Json;
          relation_type?: string;
          to_entry_id?: string;
          weight?: number;
        };
        Relationships: [
          {
            foreignKeyName: "knowledge_relationships_from_entry_id_fkey";
            columns: ["from_entry_id"];
            isOneToOne: false;
            referencedRelation: "knowledge_entries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "knowledge_relationships_to_entry_id_fkey";
            columns: ["to_entry_id"];
            isOneToOne: false;
            referencedRelation: "knowledge_entries";
            referencedColumns: ["id"];
          },
        ];
      };
      knowledge_sources: {
        Row: {
          code: string | null;
          created_at: string;
          description_i18n: Json;
          id: string;
          is_active: boolean;
          last_import_at: string | null;
          metadata: Json;
          name_i18n: Json;
          slug: string;
          source_type: string;
          updated_at: string;
        };
        Insert: {
          code?: string | null;
          created_at?: string;
          description_i18n?: Json;
          id?: string;
          is_active?: boolean;
          last_import_at?: string | null;
          metadata?: Json;
          name_i18n?: Json;
          slug: string;
          source_type: string;
          updated_at?: string;
        };
        Update: {
          code?: string | null;
          created_at?: string;
          description_i18n?: Json;
          id?: string;
          is_active?: boolean;
          last_import_at?: string | null;
          metadata?: Json;
          name_i18n?: Json;
          slug?: string;
          source_type?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      knowledge_translations: {
        Row: {
          ai_model: string | null;
          ai_provider: string | null;
          body: string;
          checksum: string | null;
          created_at: string;
          duration_ms: number | null;
          entry_id: string;
          estimated_cost_usd: number;
          id: string;
          is_manual_edit: boolean;
          language_code: string;
          manual_locked: boolean;
          metadata: Json;
          prompt_version: string | null;
          quality_score: number | null;
          review_status: Database["public"]["Enums"]["translation_review_status"];
          source_kind: string;
          source_language_code: string | null;
          summary: string | null;
          title: string | null;
          token_count: number;
          translation_status: Database["public"]["Enums"]["knowledge_job_status"];
          translation_version: string;
          updated_at: string;
        };
        Insert: {
          ai_model?: string | null;
          ai_provider?: string | null;
          body: string;
          checksum?: string | null;
          created_at?: string;
          duration_ms?: number | null;
          entry_id: string;
          estimated_cost_usd?: number;
          id?: string;
          is_manual_edit?: boolean;
          language_code: string;
          manual_locked?: boolean;
          metadata?: Json;
          prompt_version?: string | null;
          quality_score?: number | null;
          review_status?: Database["public"]["Enums"]["translation_review_status"];
          source_kind?: string;
          source_language_code?: string | null;
          summary?: string | null;
          title?: string | null;
          token_count?: number;
          translation_status?: Database["public"]["Enums"]["knowledge_job_status"];
          translation_version?: string;
          updated_at?: string;
        };
        Update: {
          ai_model?: string | null;
          ai_provider?: string | null;
          body?: string;
          checksum?: string | null;
          created_at?: string;
          duration_ms?: number | null;
          entry_id?: string;
          estimated_cost_usd?: number;
          id?: string;
          is_manual_edit?: boolean;
          language_code?: string;
          manual_locked?: boolean;
          metadata?: Json;
          prompt_version?: string | null;
          quality_score?: number | null;
          review_status?: Database["public"]["Enums"]["translation_review_status"];
          source_kind?: string;
          source_language_code?: string | null;
          summary?: string | null;
          title?: string | null;
          token_count?: number;
          translation_status?: Database["public"]["Enums"]["knowledge_job_status"];
          translation_version?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "knowledge_translations_entry_id_fkey";
            columns: ["entry_id"];
            isOneToOne: false;
            referencedRelation: "knowledge_entries";
            referencedColumns: ["id"];
          },
        ];
      };
      notes: {
        Row: {
          ayah: number;
          body: string;
          created_at: string;
          id: string;
          surah: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          ayah: number;
          body: string;
          created_at?: string;
          id?: string;
          surah: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          ayah?: number;
          body?: string;
          created_at?: string;
          id?: string;
          surah?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      permissions: {
        Row: {
          code: string;
          created_at: string;
          description: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          description: string;
          id?: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          description?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      quran_audio_files: {
        Row: {
          ayah: number | null;
          bitrate_kbps: number | null;
          checksum: string | null;
          created_at: string;
          duration_ms: number | null;
          format: string;
          id: string;
          metadata: Json;
          quality_label: string;
          reciter_id: string;
          surah: number;
          updated_at: string;
          url: string;
        };
        Insert: {
          ayah?: number | null;
          bitrate_kbps?: number | null;
          checksum?: string | null;
          created_at?: string;
          duration_ms?: number | null;
          format?: string;
          id?: string;
          metadata?: Json;
          quality_label: string;
          reciter_id: string;
          surah: number;
          updated_at?: string;
          url: string;
        };
        Update: {
          ayah?: number | null;
          bitrate_kbps?: number | null;
          checksum?: string | null;
          created_at?: string;
          duration_ms?: number | null;
          format?: string;
          id?: string;
          metadata?: Json;
          quality_label?: string;
          reciter_id?: string;
          surah?: number;
          updated_at?: string;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quran_audio_files_reciter_id_fkey";
            columns: ["reciter_id"];
            isOneToOne: false;
            referencedRelation: "quran_reciters";
            referencedColumns: ["id"];
          },
        ];
      };
      quran_chapters: {
        Row: {
          chapter_number: number;
          created_at: string;
          id: string;
          name_ar: string;
          name_he: string | null;
          name_simple_en: string;
          name_translated_en: string | null;
          revelation_place: string | null;
          updated_at: string;
          verses_count: number;
        };
        Insert: {
          chapter_number: number;
          created_at?: string;
          id?: string;
          name_ar: string;
          name_he?: string | null;
          name_simple_en: string;
          name_translated_en?: string | null;
          revelation_place?: string | null;
          updated_at?: string;
          verses_count: number;
        };
        Update: {
          chapter_number?: number;
          created_at?: string;
          id?: string;
          name_ar?: string;
          name_he?: string | null;
          name_simple_en?: string;
          name_translated_en?: string | null;
          revelation_place?: string | null;
          updated_at?: string;
          verses_count?: number;
        };
        Relationships: [];
      };
      quran_dataset_items: {
        Row: {
          ayah_end: number | null;
          ayah_start: number | null;
          body_i18n: Json;
          checksum: string | null;
          chronology_order: number | null;
          content_type: string;
          created_at: string;
          dataset_id: string;
          external_key: string;
          hizb: number | null;
          id: string;
          is_meccan: boolean | null;
          juz: number | null;
          language_code: string | null;
          metadata: Json;
          page: number | null;
          payload: Json;
          publication_status: Database["public"]["Enums"]["knowledge_publication_status"];
          revelation_order: number | null;
          surah: number | null;
          tags: string[];
          title_i18n: Json;
          updated_at: string;
        };
        Insert: {
          ayah_end?: number | null;
          ayah_start?: number | null;
          body_i18n?: Json;
          checksum?: string | null;
          chronology_order?: number | null;
          content_type?: string;
          created_at?: string;
          dataset_id: string;
          external_key: string;
          hizb?: number | null;
          id?: string;
          is_meccan?: boolean | null;
          juz?: number | null;
          language_code?: string | null;
          metadata?: Json;
          page?: number | null;
          payload?: Json;
          publication_status?: Database["public"]["Enums"]["knowledge_publication_status"];
          revelation_order?: number | null;
          surah?: number | null;
          tags?: string[];
          title_i18n?: Json;
          updated_at?: string;
        };
        Update: {
          ayah_end?: number | null;
          ayah_start?: number | null;
          body_i18n?: Json;
          checksum?: string | null;
          chronology_order?: number | null;
          content_type?: string;
          created_at?: string;
          dataset_id?: string;
          external_key?: string;
          hizb?: number | null;
          id?: string;
          is_meccan?: boolean | null;
          juz?: number | null;
          language_code?: string | null;
          metadata?: Json;
          page?: number | null;
          payload?: Json;
          publication_status?: Database["public"]["Enums"]["knowledge_publication_status"];
          revelation_order?: number | null;
          surah?: number | null;
          tags?: string[];
          title_i18n?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quran_dataset_items_dataset_id_fkey";
            columns: ["dataset_id"];
            isOneToOne: false;
            referencedRelation: "quran_datasets";
            referencedColumns: ["id"];
          },
        ];
      };
      quran_datasets: {
        Row: {
          code: string;
          created_at: string;
          created_by: string | null;
          description_i18n: Json;
          id: string;
          import_mode: string;
          is_active: boolean;
          is_public: boolean;
          kind: Database["public"]["Enums"]["quran_dataset_kind"];
          language_code: string | null;
          metadata: Json;
          schema_version: number;
          source_license: string | null;
          source_name: string | null;
          source_url: string | null;
          title_i18n: Json;
          updated_at: string;
          version: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          created_by?: string | null;
          description_i18n?: Json;
          id?: string;
          import_mode?: string;
          is_active?: boolean;
          is_public?: boolean;
          kind: Database["public"]["Enums"]["quran_dataset_kind"];
          language_code?: string | null;
          metadata?: Json;
          schema_version?: number;
          source_license?: string | null;
          source_name?: string | null;
          source_url?: string | null;
          title_i18n?: Json;
          updated_at?: string;
          version?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          created_by?: string | null;
          description_i18n?: Json;
          id?: string;
          import_mode?: string;
          is_active?: boolean;
          is_public?: boolean;
          kind?: Database["public"]["Enums"]["quran_dataset_kind"];
          language_code?: string | null;
          metadata?: Json;
          schema_version?: number;
          source_license?: string | null;
          source_name?: string | null;
          source_url?: string | null;
          title_i18n?: Json;
          updated_at?: string;
          version?: string;
        };
        Relationships: [];
      };
      quran_ingest_reports: {
        Row: {
          actor_user_id: string | null;
          batch_errors: Json;
          batches: number;
          completed_at: string | null;
          created_at: string;
          dataset_id: string | null;
          deduped: number;
          failed_count: number;
          id: string;
          kind: string;
          metadata: Json;
          received: number;
          reciter_id: string | null;
          row_errors: Json;
          started_at: string;
          status: string;
          written: number;
        };
        Insert: {
          actor_user_id?: string | null;
          batch_errors?: Json;
          batches?: number;
          completed_at?: string | null;
          created_at?: string;
          dataset_id?: string | null;
          deduped?: number;
          failed_count?: number;
          id?: string;
          kind: string;
          metadata?: Json;
          received?: number;
          reciter_id?: string | null;
          row_errors?: Json;
          started_at?: string;
          status?: string;
          written?: number;
        };
        Update: {
          actor_user_id?: string | null;
          batch_errors?: Json;
          batches?: number;
          completed_at?: string | null;
          created_at?: string;
          dataset_id?: string | null;
          deduped?: number;
          failed_count?: number;
          id?: string;
          kind?: string;
          metadata?: Json;
          received?: number;
          reciter_id?: string | null;
          row_errors?: Json;
          started_at?: string;
          status?: string;
          written?: number;
        };
        Relationships: [];
      };
      quran_item_embeddings: {
        Row: {
          chunk_index: number;
          chunk_text: string;
          created_at: string;
          embedding: string | null;
          embedding_model: string;
          id: string;
          item_id: string;
          language_code: string;
          metadata: Json;
          updated_at: string;
        };
        Insert: {
          chunk_index?: number;
          chunk_text: string;
          created_at?: string;
          embedding?: string | null;
          embedding_model?: string;
          id?: string;
          item_id: string;
          language_code: string;
          metadata?: Json;
          updated_at?: string;
        };
        Update: {
          chunk_index?: number;
          chunk_text?: string;
          created_at?: string;
          embedding?: string | null;
          embedding_model?: string;
          id?: string;
          item_id?: string;
          language_code?: string;
          metadata?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quran_item_embeddings_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "quran_dataset_items";
            referencedColumns: ["id"];
          },
        ];
      };
      quran_item_relations: {
        Row: {
          created_at: string;
          from_item_id: string;
          id: string;
          metadata: Json;
          relation_type: string;
          to_item_id: string;
          weight: number;
        };
        Insert: {
          created_at?: string;
          from_item_id: string;
          id?: string;
          metadata?: Json;
          relation_type: string;
          to_item_id: string;
          weight?: number;
        };
        Update: {
          created_at?: string;
          from_item_id?: string;
          id?: string;
          metadata?: Json;
          relation_type?: string;
          to_item_id?: string;
          weight?: number;
        };
        Relationships: [
          {
            foreignKeyName: "quran_item_relations_from_item_id_fkey";
            columns: ["from_item_id"];
            isOneToOne: false;
            referencedRelation: "quran_dataset_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quran_item_relations_to_item_id_fkey";
            columns: ["to_item_id"];
            isOneToOne: false;
            referencedRelation: "quran_dataset_items";
            referencedColumns: ["id"];
          },
        ];
      };
      quran_reciters: {
        Row: {
          code: string;
          country_code: string | null;
          created_at: string;
          id: string;
          is_active: boolean;
          language_code: string;
          metadata: Json;
          name_i18n: Json;
          style: string | null;
          updated_at: string;
        };
        Insert: {
          code: string;
          country_code?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          language_code?: string;
          metadata?: Json;
          name_i18n?: Json;
          style?: string | null;
          updated_at?: string;
        };
        Update: {
          code?: string;
          country_code?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          language_code?: string;
          metadata?: Json;
          name_i18n?: Json;
          style?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      quran_word_annotations: {
        Row: {
          audio_end_ms: number | null;
          audio_start_ms: number | null;
          ayah: number;
          created_at: string;
          grammar_i18n: Json;
          id: string;
          lemma_ar: string | null;
          metadata: Json;
          morphology_code: string | null;
          morphology_detail_i18n: Json;
          normalized_ar: string | null;
          pos_tag: string | null;
          root_ar: string | null;
          surah: number;
          tajweed_i18n: Json;
          tajweed_rule_codes: string[];
          token_ar: string;
          token_uthmani: string | null;
          translation_i18n: Json;
          transliteration_en: string | null;
          transliteration_he: string | null;
          updated_at: string;
          word_index: number;
        };
        Insert: {
          audio_end_ms?: number | null;
          audio_start_ms?: number | null;
          ayah: number;
          created_at?: string;
          grammar_i18n?: Json;
          id?: string;
          lemma_ar?: string | null;
          metadata?: Json;
          morphology_code?: string | null;
          morphology_detail_i18n?: Json;
          normalized_ar?: string | null;
          pos_tag?: string | null;
          root_ar?: string | null;
          surah: number;
          tajweed_i18n?: Json;
          tajweed_rule_codes?: string[];
          token_ar: string;
          token_uthmani?: string | null;
          translation_i18n?: Json;
          transliteration_en?: string | null;
          transliteration_he?: string | null;
          updated_at?: string;
          word_index: number;
        };
        Update: {
          audio_end_ms?: number | null;
          audio_start_ms?: number | null;
          ayah?: number;
          created_at?: string;
          grammar_i18n?: Json;
          id?: string;
          lemma_ar?: string | null;
          metadata?: Json;
          morphology_code?: string | null;
          morphology_detail_i18n?: Json;
          normalized_ar?: string | null;
          pos_tag?: string | null;
          root_ar?: string | null;
          surah?: number;
          tajweed_i18n?: Json;
          tajweed_rule_codes?: string[];
          token_ar?: string;
          token_uthmani?: string | null;
          translation_i18n?: Json;
          transliteration_en?: string | null;
          transliteration_he?: string | null;
          updated_at?: string;
          word_index?: number;
        };
        Relationships: [];
      };
      reading_plan_progress: {
        Row: {
          completed_at: string;
          day: number;
          plan_slug: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string;
          day: number;
          plan_slug: string;
          user_id: string;
        };
        Update: {
          completed_at?: string;
          day?: number;
          plan_slug?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      reading_progress: {
        Row: {
          ayah: number;
          last_read_at: string;
          surah: number;
          user_id: string;
        };
        Insert: {
          ayah?: number;
          last_read_at?: string;
          surah: number;
          user_id: string;
        };
        Update: {
          ayah?: number;
          last_read_at?: string;
          surah?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: {
          created_at: string;
          id: string;
          permission_id: string;
          role_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          permission_id: string;
          role_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          permission_id?: string;
          role_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey";
            columns: ["permission_id"];
            isOneToOne: false;
            referencedRelation: "permissions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
        ];
      };
      roles: {
        Row: {
          created_at: string;
          id: string;
          is_system: boolean;
          level: number;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_system?: boolean;
          level: number;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_system?: boolean;
          level?: number;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tafsir_hebrew: {
        Row: {
          ayah_key: string | null;
          ayah_number: number;
          created_at: string;
          hebrew_translation: string;
          id: string;
          original_arabic_text: string;
          original_tafsir_id: string;
          quality_score: number | null;
          source_tafsir_name: string;
          surah_id: number;
          translation_model: string;
        };
        Insert: {
          ayah_key?: string | null;
          ayah_number: number;
          created_at?: string;
          hebrew_translation: string;
          id?: string;
          original_arabic_text: string;
          original_tafsir_id: string;
          quality_score?: number | null;
          source_tafsir_name: string;
          surah_id: number;
          translation_model: string;
        };
        Update: {
          ayah_key?: string | null;
          ayah_number?: number;
          created_at?: string;
          hebrew_translation?: string;
          id?: string;
          original_arabic_text?: string;
          original_tafsir_id?: string;
          quality_score?: number | null;
          source_tafsir_name?: string;
          surah_id?: number;
          translation_model?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tafsir_hebrew_original_tafsir_id_fkey";
            columns: ["original_tafsir_id"];
            isOneToOne: false;
            referencedRelation: "tafsir_passages";
            referencedColumns: ["id"];
          },
        ];
      };
      tafsir_passages: {
        Row: {
          ayah_end: number;
          ayah_start: number;
          body: string;
          citation: string | null;
          created_at: string;
          id: string;
          lang: string;
          source_id: string;
          surah: number;
        };
        Insert: {
          ayah_end: number;
          ayah_start: number;
          body: string;
          citation?: string | null;
          created_at?: string;
          id?: string;
          lang: string;
          source_id: string;
          surah: number;
        };
        Update: {
          ayah_end?: number;
          ayah_start?: number;
          body?: string;
          citation?: string | null;
          created_at?: string;
          id?: string;
          lang?: string;
          source_id?: string;
          surah?: number;
        };
        Relationships: [
          {
            foreignKeyName: "tafsir_passages_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "tafsir_sources";
            referencedColumns: ["id"];
          },
        ];
      };
      tafsir_sources: {
        Row: {
          author: string | null;
          created_at: string;
          era: string | null;
          id: string;
          license: string | null;
          name_ar: string;
          name_en: string;
          name_he: string;
          slug: string;
        };
        Insert: {
          author?: string | null;
          created_at?: string;
          era?: string | null;
          id?: string;
          license?: string | null;
          name_ar: string;
          name_en: string;
          name_he: string;
          slug: string;
        };
        Update: {
          author?: string | null;
          created_at?: string;
          era?: string | null;
          id?: string;
          license?: string | null;
          name_ar?: string;
          name_en?: string;
          name_he?: string;
          slug?: string;
        };
        Relationships: [];
      };
      topic_lessons: {
        Row: {
          body: string;
          citation: string | null;
          created_at: string;
          entity_id: string;
          id: string;
          lang: string;
          source_id: string;
        };
        Insert: {
          body: string;
          citation?: string | null;
          created_at?: string;
          entity_id: string;
          id?: string;
          lang: string;
          source_id: string;
        };
        Update: {
          body?: string;
          citation?: string | null;
          created_at?: string;
          entity_id?: string;
          id?: string;
          lang?: string;
          source_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "topic_lessons_entity_id_fkey";
            columns: ["entity_id"];
            isOneToOne: false;
            referencedRelation: "knowledge_entities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "topic_lessons_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "tafsir_sources";
            referencedColumns: ["id"];
          },
        ];
      };
      translation_jobs: {
        Row: {
          created_at: string;
          duration_ms: number | null;
          entry_id: string;
          estimated_cost_usd: number;
          failed_reason: string | null;
          finished_at: string | null;
          id: string;
          max_retries: number;
          model: string | null;
          prompt_version: string | null;
          provider: string | null;
          quality_score: number | null;
          requested_by: string | null;
          retry_count: number;
          source_language_code: string;
          started_at: string | null;
          status: Database["public"]["Enums"]["knowledge_job_status"];
          target_language_code: string;
          token_count: number;
          updated_at: string;
          worker_id: string | null;
        };
        Insert: {
          created_at?: string;
          duration_ms?: number | null;
          entry_id: string;
          estimated_cost_usd?: number;
          failed_reason?: string | null;
          finished_at?: string | null;
          id?: string;
          max_retries?: number;
          model?: string | null;
          prompt_version?: string | null;
          provider?: string | null;
          quality_score?: number | null;
          requested_by?: string | null;
          retry_count?: number;
          source_language_code: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["knowledge_job_status"];
          target_language_code: string;
          token_count?: number;
          updated_at?: string;
          worker_id?: string | null;
        };
        Update: {
          created_at?: string;
          duration_ms?: number | null;
          entry_id?: string;
          estimated_cost_usd?: number;
          failed_reason?: string | null;
          finished_at?: string | null;
          id?: string;
          max_retries?: number;
          model?: string | null;
          prompt_version?: string | null;
          provider?: string | null;
          quality_score?: number | null;
          requested_by?: string | null;
          retry_count?: number;
          source_language_code?: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["knowledge_job_status"];
          target_language_code?: string;
          token_count?: number;
          updated_at?: string;
          worker_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "translation_jobs_entry_id_fkey";
            columns: ["entry_id"];
            isOneToOne: false;
            referencedRelation: "knowledge_entries";
            referencedColumns: ["id"];
          },
        ];
      };
      translation_sources: {
        Row: {
          author: string | null;
          code: string;
          created_at: string;
          id: string;
          is_default: boolean;
          language: string;
          license: string | null;
          name_en: string | null;
          name_he: string;
          source_url: string | null;
        };
        Insert: {
          author?: string | null;
          code: string;
          created_at?: string;
          id?: string;
          is_default?: boolean;
          language?: string;
          license?: string | null;
          name_en?: string | null;
          name_he: string;
          source_url?: string | null;
        };
        Update: {
          author?: string | null;
          code?: string;
          created_at?: string;
          id?: string;
          is_default?: boolean;
          language?: string;
          license?: string | null;
          name_en?: string | null;
          name_he?: string;
          source_url?: string | null;
        };
        Relationships: [];
      };
      user_preferences: {
        Row: {
          created_at: string;
          interests: string[];
          onboarded_at: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          interests?: string[];
          onboarded_at?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          interests?: string[];
          onboarded_at?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      verse_embeddings: {
        Row: {
          arabic: string;
          ayah: number;
          created_at: string;
          embedded_at: string | null;
          embedding: string | null;
          embedding_model: string | null;
          fts: unknown;
          hebrew: string;
          surah: number;
          themes: string[];
          updated_at: string;
        };
        Insert: {
          arabic: string;
          ayah: number;
          created_at?: string;
          embedded_at?: string | null;
          embedding?: string | null;
          embedding_model?: string | null;
          fts?: unknown;
          hebrew: string;
          surah: number;
          themes?: string[];
          updated_at?: string;
        };
        Update: {
          arabic?: string;
          ayah?: number;
          created_at?: string;
          embedded_at?: string | null;
          embedding?: string | null;
          embedding_model?: string | null;
          fts?: unknown;
          hebrew?: string;
          surah?: number;
          themes?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      hadith_narrators: {
        Row: {
          collections: string[] | null;
          hadith_count: number | null;
          narrator: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      can_user: {
        Args: { _permission_code: string; _user_id: string };
        Returns: boolean;
      };
      claim_first_admin: { Args: { _user_id: string }; Returns: boolean };
      claim_next_embedding_job: {
        Args: { _worker_id: string };
        Returns: string;
      };
      claim_next_translation_job: {
        Args: { _worker_id: string };
        Returns: string;
      };
      claim_or_sync_super_admin_by_email: {
        Args: { _email: string; _user_id: string };
        Returns: boolean;
      };
      get_current_user_role: {
        Args: { _user_id: string };
        Returns: Database["public"]["Enums"]["app_role"];
      };
      has_permission: {
        Args: { _permission_code: string; _user_id: string };
        Returns: boolean;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      log_knowledge_job_event: {
        Args: {
          _actor_user_id: string;
          _details: Json;
          _job_id: string;
          _job_type: string;
          _level: string;
          _message: string;
          _status: Database["public"]["Enums"]["knowledge_job_status"];
        };
        Returns: string;
      };
      match_grounded_chunks: {
        Args: {
          language_filter?: string;
          match_count?: number;
          min_similarity?: number;
          query_embedding: string;
          surah_filter?: number;
        };
        Returns: {
          ayah_end: number;
          ayah_key: string;
          ayah_start: number;
          chunk_text: string;
          content_type: string;
          id: string;
          language: string;
          similarity: number;
          source_name: string;
          surah: number;
          translator_name: string;
        }[];
      };
      match_hadith_to_entities: {
        Args: {
          match_count?: number;
          min_similarity?: number;
          query_embedding: string;
        };
        Returns: {
          entity_id: string;
          similarity: number;
        }[];
      };
      match_hadith_to_verses: {
        Args: {
          match_count?: number;
          min_similarity?: number;
          query_embedding: string;
        };
        Returns: {
          ayah: number;
          similarity: number;
          surah: number;
        }[];
      };
      match_verses: {
        Args: {
          match_count?: number;
          min_similarity?: number;
          query_embedding: string;
          theme_filter?: string[];
        };
        Returns: {
          arabic: string;
          ayah: number;
          hebrew: string;
          similarity: number;
          surah: number;
          themes: string[];
        }[];
      };
      role_level: {
        Args: { _role: Database["public"]["Enums"]["app_role"] };
        Returns: number;
      };
      search_entities_hybrid: {
        Args: {
          kind_filter?: Database["public"]["Enums"]["knowledge_kind"][];
          match_count?: number;
          q: string;
          query_embedding?: string;
        };
        Returns: {
          hero_image: string;
          icon: string;
          id: string;
          kind: Database["public"]["Enums"]["knowledge_kind"];
          score: number;
          slug: string;
          summary_i18n: Json;
          title_i18n: Json;
        }[];
      };
      search_hadith_hybrid: {
        Args: { collections?: string[]; match_count?: number; q: string };
        Returns: {
          arabic_text: string;
          book_id: number;
          collection_slug: string;
          english_text: string;
          global_id: number;
          id: number;
          id_in_book: number;
          narrator: string;
          score: number;
        }[];
      };
      search_quran_items_hybrid: {
        Args: {
          kind_filter?: Database["public"]["Enums"]["quran_dataset_kind"][];
          language_filter?: string;
          match_count?: number;
          meccan_filter?: boolean;
          q: string;
          query_embedding?: string;
        };
        Returns: {
          ayah_end: number;
          ayah_start: number;
          body_i18n: Json;
          dataset_id: string;
          dataset_kind: Database["public"]["Enums"]["quran_dataset_kind"];
          item_id: string;
          language_code: string;
          score: number;
          surah: number;
          title_i18n: Json;
        }[];
      };
      search_verses_hybrid: {
        Args: {
          match_count?: number;
          q: string;
          query_embedding?: string;
          theme_filter?: string[];
        };
        Returns: {
          arabic: string;
          ayah: number;
          hebrew: string;
          score: number;
          surah: number;
          themes: string[];
        }[];
      };
    };
    Enums: {
      app_role: "admin" | "moderator" | "user" | "editor" | "super_admin";
      knowledge_job_status:
        | "queued"
        | "running"
        | "succeeded"
        | "failed"
        | "retrying"
        | "paused"
        | "cancelled";
      knowledge_kind:
        | "topic"
        | "prophet"
        | "story"
        | "event"
        | "place"
        | "nation"
        | "concept"
        | "theme"
        | "person";
      knowledge_publication_status: "draft" | "published" | "scheduled" | "archived";
      knowledge_relation:
        | "related"
        | "child_of"
        | "happened_in"
        | "involves"
        | "teaches"
        | "mentions"
        | "part_of";
      quran_dataset_kind:
        | "translation"
        | "tafsir"
        | "hadith"
        | "asbab"
        | "word_by_word"
        | "root_lexicon"
        | "morphology"
        | "grammar"
        | "tajweed"
        | "recitation"
        | "topic_map"
        | "entity_map"
        | "timeline"
        | "revelation_metadata"
        | "cross_reference"
        | "audio_asset"
        | "other";
      translation_review_status: "pending" | "reviewed" | "approved" | "rejected";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "editor", "super_admin"],
      knowledge_job_status: [
        "queued",
        "running",
        "succeeded",
        "failed",
        "retrying",
        "paused",
        "cancelled",
      ],
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
      knowledge_publication_status: ["draft", "published", "scheduled", "archived"],
      knowledge_relation: [
        "related",
        "child_of",
        "happened_in",
        "involves",
        "teaches",
        "mentions",
        "part_of",
      ],
      quran_dataset_kind: [
        "translation",
        "tafsir",
        "hadith",
        "asbab",
        "word_by_word",
        "root_lexicon",
        "morphology",
        "grammar",
        "tajweed",
        "recitation",
        "topic_map",
        "entity_map",
        "timeline",
        "revelation_metadata",
        "cross_reference",
        "audio_asset",
        "other",
      ],
      translation_review_status: ["pending", "reviewed", "approved", "rejected"],
    },
  },
} as const;
