import { supabase } from '../../lib/supabase';
import {
  getAppUserByAuthId,
  getSingleRelation,
  GuildMember,
  throwSupabaseError,
} from './guildShared';

type GuildRow = {
  guild_id: string;
  user_id: number;
  role: string;
  nickname: string | null;
  joined_at: string;
  guild?: {
    id: string;
    name: string;
    icon_url: string | null;
    owner_id: number;
    created_at: string;
    updated_at: string;
  } | {
    id: string;
    name: string;
    icon_url: string | null;
    owner_id: number;
    created_at: string;
    updated_at: string;
  }[] | null;
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
    guild: getSingleRelation(membership.guild),
    membership: {
      userId: membership.user_id,
      role: membership.role,
      nickname: membership.nickname,
      joinedAt: membership.joined_at,
    },
  }));
};
