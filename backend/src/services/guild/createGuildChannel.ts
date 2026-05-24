import { supabase } from '../../lib/supabase';
import {
  assertGuildManager,
  formatGuildChannel,
  getAppUserByAuthId,
  GuildChannel,
  throwSupabaseError,
} from './guildShared';

type CreateGuildChannelInput = {
  name: string;
  type: 'text' | 'voice';
  position?: number;
};

export const createGuildChannel = async (
  authId: string,
  guildId: string,
  { name, type, position }: CreateGuildChannelInput,
) => {
  const currentUser = await getAppUserByAuthId(authId);

  await assertGuildManager(guildId, currentUser.id);

  const { data, error } = await supabase
    .from('guild_channels')
    .insert({
      guild_id: guildId,
      name,
      type,
      position: position ?? 0,
      created_by: currentUser.id,
      updated_at: new Date().toISOString(),
    })
    .select('id, guild_id, name, type, position, created_by, created_at, updated_at')
    .single();

  if (error || !data) {
    throwSupabaseError(error?.message ?? 'Failed to create guild channel', error);
  }

  return formatGuildChannel(data as GuildChannel);
};
