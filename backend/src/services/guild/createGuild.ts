import { supabase } from '../../lib/supabase';
import {
  formatGuild,
  formatGuildChannel,
  Guild,
  GuildChannel,
  getAppUserByAuthId,
  throwSupabaseError,
} from './guildShared';

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

  const createdGuild = guild as Guild;
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
    guild: formatGuild(createdGuild),
    membership: {
      guildId,
      userId: currentUser.id,
      role: 'owner',
      nickname: currentUser.display_name ?? currentUser.username,
    },
    defaultChannel: formatGuildChannel(channel as GuildChannel),
  };
};
