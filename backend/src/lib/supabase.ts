import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey,{
    auth: {
        persistSession: false
    }
});

export const createSupabaseUserClient = (accessToken: string) =>
  createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
