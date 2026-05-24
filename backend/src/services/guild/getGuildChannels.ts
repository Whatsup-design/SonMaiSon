import { supabase } from '../../lib/supabase';
import { assertGuildMember, getAppUserByAuthId, throwSupabaseError } from './guildShared';

export const getGuildChannels = async (authId: string, guildId: string) => {
  const currentUser = await getAppUserByAuthId(authId);

  await assertGuildMember(guildId, currentUser.id);

  const { data, error } = await supabase
    .from('guild_channels')
    .select('id, guild_id, name, type, position, created_by, created_at, updated_at')
    .eq('guild_id', guildId)
    .order('position', { ascending: true });

  if (error) {
    throwSupabaseError(error.message, error);
  }

  return data ?? [];
};
