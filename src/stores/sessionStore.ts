import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Session = Database['public']['Tables']['sessions']['Row'];
type Entry = Database['public']['Tables']['entries']['Row'];

interface SessionState {
  sessions: Session[];
  currentSession: Session | null;
  entries: Entry[];
  loading: boolean;
  error: string | null;
  
  fetchSessions: () => Promise<void>;
  createSession: (title: string, date: string) => Promise<{ error?: string }>;
  fetchSession: (id: string) => Promise<void>;
  fetchEntries: (sessionId: string) => Promise<void>;
  updateEntry: (id: string, updates: Partial<Entry>) => Promise<{ error?: string }>;
  createEntry: (entry: Omit<Entry, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error?: string }>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  currentSession: null,
  entries: [],
  loading: false,
  error: null,

  fetchSessions: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ sessions: data || [], loading: false });
    } catch (error) {
      set({ error: 'حدث خطأ أثناء جلب الجلسات', loading: false });
    }
  },

  createSession: async (title: string, date: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return { error: 'يجب تسجيل الدخول أولاً' };

      const { data, error } = await supabase
        .from('sessions')
        .insert({
          teacher_id: user.user.id,
          title,
          date,
        })
        .select()
        .single();

      if (error) throw error;
      
      const { sessions } = get();
      set({ sessions: [data, ...sessions] });
      
      return {};
    } catch (error) {
      return { error: 'حدث خطأ أثناء إنشاء الجلسة' };
    }
  },

  fetchSession: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      set({ currentSession: data, loading: false });
    } catch (error) {
      set({ error: 'حدث خطأ أثناء جلب الجلسة', loading: false });
    }
  },

  fetchEntries: async (sessionId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      set({ entries: data || [], loading: false });
    } catch (error) {
      set({ error: 'حدث خطأ أثناء جلب البيانات', loading: false });
    }
  },

  updateEntry: async (id: string, updates: Partial<Entry>) => {
    try {
      const { error } = await supabase
        .from('entries')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      const { entries } = get();
      const updatedEntries = entries.map(entry => 
        entry.id === id ? { ...entry, ...updates } : entry
      );
      set({ entries: updatedEntries });

      return {};
    } catch (error) {
      return { error: 'حدث خطأ أثناء التحديث' };
    }
  },

  createEntry: async (entry: Omit<Entry, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .insert(entry)
        .select()
        .single();

      if (error) throw error;

      const { entries } = get();
      set({ entries: [...entries, data] });

      return {};
    } catch (error) {
      return { error: 'حدث خطأ أثناء إنشاء الإدخال' };
    }
  },
}));