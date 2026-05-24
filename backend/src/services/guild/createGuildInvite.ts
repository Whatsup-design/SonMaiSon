import { randomBytes } from 'crypto';
import { supabase } from '../../lib/supabase';
import {
  assertGuildManager,
  formatGuild,
  Guild,
  getAppUserByAuthId,
  throwSupabaseError,
} from './guildShared';
import { formatGuildInvite, GuildInvite } from './inviteShared';

type CreateGuildInviteInput = {
  maxUses?: number | null;
  expiresInMinutes?: number | null;
};

const createInviteCode = () => randomBytes(6).toString('base64url');

export const createGuildInvite = async (
  authId: string,
  guildId: string,
  { maxUses, expiresInMinutes }: CreateGuildInviteInput = {},
) => {
  const currentUser = await getAppUserByAuthId(authId);

  await assertGuildManager(guildId, currentUser.id);

  const expiresAt = expiresInMinutes
    ? new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString()
    : null;

  const { data, error } = await supabase
    .from('guild_invites')
    .insert({
      guild_id: guildId,
      code: createInviteCode(),
      created_by: currentUser.id,
      max_uses: maxUses ?? null,
      expires_at: expiresAt,
    })
    .select(
      `
      id,
      guild_id,
      code,
      created_by,
      max_uses,
      uses,
      expires_at,
      created_at,
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
    .single();

  if (error || !data) {
    throwSupabaseError(error?.message ?? 'Failed to create guild invite', error);
  }

  const invite = data as GuildInvite;

  return {
    ...formatGuildInvite(invite),
    guild: formatGuild(invite.guild as Guild),
  };
};
