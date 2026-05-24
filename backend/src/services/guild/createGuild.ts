import { supabase } from '../../lib/supabase';
import { getAppUserByAuthId, throwSupabaseError } from './guildShared';

type CreateGuildInput = {
  name: string;
  iconUrl?: string;
};

export const createGuild = async (
  authId: string,
  { name, iconUrl }: CreateGuildInput,
) => {
  const currentUser = await getAppUserByAuthId(authId);

  const { data: guild, error: guildError } = await supabase
    .from('guilds')
    .insert({
      name,
      icon_url: iconUrl,
      owner_id: currentUser.id,
      updated_at: new Date().toISOString(),
    })
    .select('id, name, icon_url, owner_id, created_at, updated_at')
    .single();

  if (guildError || !guild) {
    throwSupabaseError(guildError?.message ?? 'Failed to create guild', guildError);
  }

  const createdGuild = guild as {
    id: string;
    name: string;
    icon_url: string | null;
    owner_id: number;
    created_at: string;
    updated_at: string;
  };
  const guildId = createdGuild.id;

  const { error: memberError } = await supabase.from('guild_members').insert({
    guild_id: guildId,
    user_id: currentUser.id,
    role: 'owner',
    nickname: currentUser.display_name ?? currentUser.username,
  });

  if (memberError) {
    throwSupabaseError(memberError.message, memberError);
  }

  const { data: channel, error: channelError } = await supabase
    .from('guild_channels')
    .insert({
      guild_id: guildId,
      name: 'general',
      type: 'text',
      position: 0,
      created_by: currentUser.id,
      updated_at: new Date().toISOString(),
    })
    .select('id, guild_id, name, type, position, created_by, created_at, updated_at')
    .single();

  if (channelError || !channel) {
    throwSupabaseError(
      channelError?.message ?? 'Failed to create default guild channel',
      channelError,
    );
  }

  return {
    guild: createdGuild,
    membership: {
      userId: currentUser.id,
      role: 'owner',
    },
    defaultChannel: channel,
  };
};
