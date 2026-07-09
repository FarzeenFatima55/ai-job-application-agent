export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      certifications: {
        Row: {
          created_at: string;
          id: string;
          issued_on: string | null;
          issuer: string | null;
          name: string;
          sort_order: number;
          url: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          issued_on?: string | null;
          issuer?: string | null;
          name: string;
          sort_order?: number;
          url?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          issued_on?: string | null;
          issuer?: string | null;
          name?: string;
          sort_order?: number;
          url?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      education_entries: {
        Row: {
          created_at: string;
          degree: string | null;
          end_date: string | null;
          field_of_study: string | null;
          gpa: string | null;
          id: string;
          institution: string;
          sort_order: number;
          start_date: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          degree?: string | null;
          end_date?: string | null;
          field_of_study?: string | null;
          gpa?: string | null;
          id?: string;
          institution: string;
          sort_order?: number;
          start_date?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          degree?: string | null;
          end_date?: string | null;
          field_of_study?: string | null;
          gpa?: string | null;
          id?: string;
          institution?: string;
          sort_order?: number;
          start_date?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      profile_links: {
        Row: {
          created_at: string;
          id: string;
          label: string;
          sort_order: number;
          url: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          label: string;
          sort_order?: number;
          url: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          label?: string;
          sort_order?: number;
          url?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profile_skills: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          sort_order: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          sort_order?: number;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          sort_order?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string | null;
          full_name: string | null;
          github_url: string | null;
          id: string;
          linkedin_url: string | null;
          location: string | null;
          phone: string | null;
          portfolio_url: string | null;
          professional_summary: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          github_url?: string | null;
          id: string;
          linkedin_url?: string | null;
          location?: string | null;
          phone?: string | null;
          portfolio_url?: string | null;
          professional_summary?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          github_url?: string | null;
          id?: string;
          linkedin_url?: string | null;
          location?: string | null;
          phone?: string | null;
          portfolio_url?: string | null;
          professional_summary?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          sort_order: number;
          technologies: string[];
          url: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          sort_order?: number;
          technologies?: string[];
          url?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          sort_order?: number;
          technologies?: string[];
          url?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      resumes: {
        Row: {
          created_at: string;
          error_message: string | null;
          file_name: string;
          file_size: number;
          id: string;
          mime_type: string;
          parse_status: string;
          parsed_at: string | null;
          storage_path: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          error_message?: string | null;
          file_name: string;
          file_size: number;
          id?: string;
          mime_type: string;
          parse_status?: string;
          parsed_at?: string | null;
          storage_path: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          error_message?: string | null;
          file_name?: string;
          file_size?: number;
          id?: string;
          mime_type?: string;
          parse_status?: string;
          parsed_at?: string | null;
          storage_path?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      work_experiences: {
        Row: {
          company: string;
          created_at: string;
          end_date: string | null;
          id: string;
          is_current: boolean;
          location: string | null;
          responsibilities: Json;
          sort_order: number;
          start_date: string | null;
          title: string;
          user_id: string;
        };
        Insert: {
          company: string;
          created_at?: string;
          end_date?: string | null;
          id?: string;
          is_current?: boolean;
          location?: string | null;
          responsibilities?: Json;
          sort_order?: number;
          start_date?: string | null;
          title: string;
          user_id: string;
        };
        Update: {
          company?: string;
          created_at?: string;
          end_date?: string | null;
          id?: string;
          is_current?: boolean;
          location?: string | null;
          responsibilities?: Json;
          sort_order?: number;
          start_date?: string | null;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type ParseStatus = "pending" | "processing" | "completed" | "failed";

export const RESUME_MIME_TYPES = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;

export const MAX_RESUME_SIZE_BYTES = 10 * 1024 * 1024;
