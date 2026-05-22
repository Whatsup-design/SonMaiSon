import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

export const createSupabaseUserClient = (accessToken: string) =>
  createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
