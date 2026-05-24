import { supabase } from '../../lib/supabase';
import {
  formatGuild,
  getAppUserByAuthId,
  Guild,
  throwSupabaseError,
} from './guildShared';

type GuildRow = {
  guild_id: string;
  user_id: number;
  role: string;
  nickname: string | null;
  joined_at: string;
  guild?: Guild | Guild[] | null;
};

export const getMyGuilds = async (authId: string) => {
  const currentUser = await getAppUserByAuthId(authId);

  const { data, error } = await supabase
    .from('guild_members')
    .select(
      `
      guild_id,
      user_id,
      role,
      nickname,
      joined_at,
      guild:guilds (
        id,
        name,
        icon_url,
        owner_id,
        created_at,
        updated_at
      )
    `,
    )
    .eq('user_id', currentUser.id)
    .order('joined_at', { ascending: false });

  if (error) {
    throwSupabaseError(error.message, error);
  }

  return ((data ?? []) as GuildRow[]).map((membership) => ({
    guild: formatGuild(membership.guild),
    membership: {
      guildId: membership.guild_id,
      userId: membership.user_id,
      role: membership.role,
      nickname: membership.nickname,
      joinedAt: membership.joined_at,
    },
  }));
};
