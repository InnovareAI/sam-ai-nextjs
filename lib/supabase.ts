import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Handle missing Supabase configuration gracefully for demo
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://your-project.supabase.co' || supabaseUrl === 'demo-mode') {
  console.warn('🎭 Demo Mode: Using simulated authentication with localStorage.');
  // Set demo values to prevent createClient errors (won't be used for actual calls)
  supabaseUrl = 'https://demo.supabase.co';
  supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MjYwNDQwMCwiZXhwIjoxOTU4MTgwNDAwfQ.demo-key';
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database schema
export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          settings: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id: string;
          settings?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string;
          settings?: any;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          workspace_id: string;
          full_name: string | null;
          company_name: string | null;
          email: string;
          role: string;
          avatar_url: string | null;
          settings: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          workspace_id: string;
          full_name?: string | null;
          company_name?: string | null;
          email: string;
          role?: string;
          avatar_url?: string | null;
          settings?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          full_name?: string | null;
          company_name?: string | null;
          email?: string;
          role?: string;
          avatar_url?: string | null;
          settings?: any;
          updated_at?: string;
        };
      };
      prospects: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          email: string | null;
          company: string | null;
          title: string | null;
          status: string;
          score: number | null;
          tags: string[] | null;
          metadata: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          email?: string | null;
          company?: string | null;
          title?: string | null;
          status?: string;
          score?: number | null;
          tags?: string[] | null;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          email?: string | null;
          company?: string | null;
          title?: string | null;
          status?: string;
          score?: number | null;
          tags?: string[] | null;
          metadata?: any;
          updated_at?: string;
        };
      };
      campaigns: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          description: string | null;
          type: string;
          status: string;
          settings: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          description?: string | null;
          type: string;
          status?: string;
          settings?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          description?: string | null;
          type?: string;
          status?: string;
          settings?: any;
          updated_at?: string;
        };
      };
    };
  };
}