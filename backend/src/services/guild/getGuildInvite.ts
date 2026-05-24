import { ErrorCode } from '../../constants/errorCodes';
import { HttpStatus } from '../../constants/httpStatus';
import { supabase } from '../../lib/supabase';
import { AppError } from '../../utils/AppError';
import { throwSupabaseError } from './guildShared';
import {
  assertInviteUsable,
  formatGuildInvite,
  GuildInvite,
} from './inviteShared';

export const getGuildInvite = async (code: string) => {
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

  return formatGuildInvite(invite);
};
