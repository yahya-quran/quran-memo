import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: 'teacher' | 'student';
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role: 'teacher' | 'student';
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'teacher' | 'student';
          created_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          teacher_id: string;
          title: string;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          title: string;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          title?: string;
          date?: string;
          created_at?: string;
        };
      };
      entries: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          full_name: string;
          memorization: string;
          revision: string;
          stars: number | null;
          comments: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          full_name: string;
          memorization: string;
          revision: string;
          stars?: number | null;
          comments?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          full_name?: string;
          memorization?: string;
          revision?: string;
          stars?: number | null;
          comments?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};