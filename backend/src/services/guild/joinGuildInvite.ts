import { ErrorCode } from '../../constants/errorCodes';
import { HttpStatus } from '../../constants/httpStatus';
import { supabase } from '../../lib/supabase';
import { AppError } from '../../utils/AppError';
import {
  formatGuild,
  getAppUserByAuthId,
  Guild,
  throwSupabaseError,
} from './guildShared';
import {
  assertInviteUsable,
  formatGuildInvite,
  GuildInvite,
} from './inviteShared';

export const joinGuildInvite = async (authId: string, code: string) => {
  const currentUser = await getAppUserByAuthId(authId);

  const { data, error } = await supabase
    .from('guild_invites')
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
    .eq('code', code)
    .maybeSingle();

  if (error) {
    throwSupabaseError(error.message, error);
  }

  if (!data) {
    throw new AppError({
      statusCode: HttpStatus.NOT_FOUND,
      code: ErrorCode.INVITE_NOT_FOUND,
      message: 'Guild invite not found',
    });
  }

  const invite = data as GuildInvite;

  assertInviteUsable(invite);

  const { data: existingMember, error: memberLookupError } = await supabase
    .from('guild_members')
    .select('guild_id, user_id, role, nickname, joined_at')
    .eq('guild_id', invite.guild_id)
    .eq('user_id', currentUser.id)
    .maybeSingle();

  if (memberLookupError) {
    throwSupabaseError(memberLookupError.message, memberLookupError);
  }

  if (existingMember) {
    return {
      alreadyMember: true,
      guild: formatGuild(invite.guild as Guild),
      membership: {
        guildId: existingMember.guild_id,
        userId: existingMember.user_id,
        role: existingMember.role,
        nickname: existingMember.nickname,
        joinedAt: existingMember.joined_at,
      },
      invite: formatGuildInvite(invite),
    };
  }

  const { data: membership, error: joinError } = await supabase
    .from('guild_members')
    .insert({
      guild_id: invite.guild_id,
      user_id: currentUser.id,
      role: 'member',
      nickname: currentUser.display_name ?? currentUser.username,
    })
    .select('guild_id, user_id, role, nickname, joined_at')
    .single();

  if (joinError || !membership) {
    throwSupabaseError(joinError?.message ?? 'Failed to join guild', joinError);
  }

  const createdMembership = membership as {
    guild_id: string;
    user_id: number;
    role: string;
    nickname: string | null;
    joined_at: string;
  };

  const { error: updateInviteError } = await supabase
    .from('guild_invites')
    .update({
      uses: invite.uses + 1,
    })
    .eq('id', invite.id);

  if (updateInviteError) {
    throwSupabaseError(updateInviteError.message, updateInviteError);
  }

  return {
    alreadyMember: false,
    guild: formatGuild(invite.guild as Guild),
    membership: {
      guildId: createdMembership.guild_id,
      userId: createdMembership.user_id,
      role: createdMembership.role,
      nickname: createdMembership.nickname,
      joinedAt: createdMembership.joined_at,
    },
    invite: {
      ...formatGuildInvite(invite),
      uses: invite.uses + 1,
    },
  };
};
