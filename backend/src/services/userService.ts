import { supabase } from '../lib/supabase';

export type DatabaseUser = Record<string, unknown>;

export const getUserDataByAuthId = async (authId: string): Promise<DatabaseUser | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
