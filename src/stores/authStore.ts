import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  userRole: 'teacher' | 'student' | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, role: 'teacher' | 'student') => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userRole: null,
  loading: true,

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        // Get user role from our users table
        let { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single();

        // If user does not exist in users table, insert with default role 'student'
        if (!userData) {
          // Try to get role from metadata if available (for sign up page, you may want to pass role in localStorage or similar)
          let role = localStorage.getItem('pendingRole') || 'student';
          await supabase.from('users').insert({
            id: data.user.id,
            email: data.user.email!,
            role,
          });
          userData = { role };
          localStorage.removeItem('pendingRole');
        }
        set({ user: data.user, userRole: userData.role, loading: false });
      }

      return {};
    } catch (error) {
      return { error: 'حدث خطأ أثناء تسجيل الدخول' };
    }
  },

  signUp: async (email: string, password: string, role: 'teacher' | 'student') => {
    try {
      localStorage.setItem('pendingRole', role); // Save role for later if email confirmation is needed
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      // If session exists, user is authenticated and we can insert into users table
      if (data.session && data.user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            role,
          });
        if (insertError) {
          return { error: 'حدث خطأ أثناء إنشاء الحساب' };
        }
        set({ user: data.user, userRole: role, loading: false });
        localStorage.removeItem('pendingRole');
        return {};
      }

      // If no session, user must confirm email first
      if (!data.session && data.user) {
        return { error: 'تم إنشاء الحساب بنجاح. يرجى تأكيد بريدك الإلكتروني أولاً عبر الرابط المرسل.' };
      }

      return {};
    } catch (error) {
      return { error: 'حدث خطأ أثناء إنشاء الحساب' };
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, userRole: null, loading: false });
  },

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        let { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        // If user does not exist in users table, insert with default role from localStorage or 'student'
        if (!userData) {
          let role = localStorage.getItem('pendingRole') || 'student';
          await supabase.from('users').insert({
            id: session.user.id,
            email: session.user.email!,
            role,
          });
          userData = { role };
          localStorage.removeItem('pendingRole');
        }
        set({ 
          user: session.user, 
          userRole: userData?.role || null, 
          loading: false 
        });
      } else {
        set({ user: null, userRole: null, loading: false });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          let { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();
          if (!userData) {
            let role = localStorage.getItem('pendingRole') || 'student';
            await supabase.from('users').insert({
              id: session.user.id,
              email: session.user.email!,
              role,
            });
            userData = { role };
            localStorage.removeItem('pendingRole');
          }
          set({ 
            user: session.user, 
            userRole: userData?.role || null, 
            loading: false 
          });
        } else {
          set({ user: null, userRole: null, loading: false });
        }
      });
    } catch (error) {
      set({ user: null, userRole: null, loading: false });
    }
  },
}));