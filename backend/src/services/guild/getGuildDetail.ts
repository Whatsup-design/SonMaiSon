import { ErrorCode } from '../../constants/errorCodes';
import { HttpStatus } from '../../constants/httpStatus';
import { supabase } from '../../lib/supabase';
import { AppError } from '../../utils/AppError';
import {
  assertGuildMember,
  formatGuild,
  formatGuildChannel,
  formatGuildMember,
  Guild,
  GuildChannel,
  getAppUserByAuthId,
  GuildMember,
  throwSupabaseError,
} from './guildShared';

export const getGuildDetail = async (authId: string, guildId: string) => {
  const currentUser = await getAppUserByAuthId(authId);

  await assertGuildMember(guildId, currentUser.id);

  const { data: guild, error: guildError } = await supabase
    .from('guilds')
    .select('id, name, icon_url, owner_id, created_at, updated_at')
    .eq('id', guildId)
    .single();

  if (guildError || !guild) {
    throw new AppError({
      statusCode: HttpStatus.NOT_FOUND,
      code: ErrorCode.GUILD_NOT_FOUND,
      message: 'Guild not found',
      details: guildError,
    });
  }

  const { data: members, error: membersError } = await supabase
    .from('guild_members')
    .select(
      `
      guild_id,
      user_id,
      role,
      nickname,
      joined_at,
      user:users (
        id,
        auth_id,
        email,
        username,
        display_name,
        avatar_url,
        status
      )
    `,
    )
    .eq('guild_id', guildId)
    .order('joined_at', { ascending: true });

  if (membersError) {
    throwSupabaseError(membersError.message, membersError);
  }

  const { data: channels, error: channelsError } = await supabase
    .from('guild_channels')
    .select('id, guild_id, name, type, position, created_by, created_at, updated_at')
    .eq('guild_id', guildId)
    .order('position', { ascending: true });

  if (channelsError) {
    throwSupabaseError(channelsError.message, channelsError);
  }

  return {
    guild: formatGuild(guild as Guild),
    members: ((members ?? []) as GuildMember[]).map(formatGuildMember),
    channels: ((channels ?? []) as GuildChannel[]).map(formatGuildChannel),
  };
};
