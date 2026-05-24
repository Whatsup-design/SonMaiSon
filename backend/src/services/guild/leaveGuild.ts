import { ErrorCode } from '../../constants/errorCodes';
import { HttpStatus } from '../../constants/httpStatus';
import { supabase } from '../../lib/supabase';
import { AppError } from '../../utils/AppError';
import {
  assertGuildMember,
  getAppUserByAuthId,
  throwSupabaseError,
} from './guildShared';

export const leaveGuild = async (authId: string, guildId: string) => {
  const currentUser = await getAppUserByAuthId(authId);
  const membership = await assertGuildMember(guildId, currentUser.id);

  if (membership.role === 'owner') {
    throw new AppError({
      statusCode: HttpStatus.BAD_REQUEST,
      code: ErrorCode.GUILD_OWNER_CANNOT_LEAVE,
      message: 'Guild owner cannot leave before transferring ownership',
    });
  }

  const { error } = await supabase
    .from('guild_members')
    .delete()
    .eq('guild_id', guildId)
    .eq('user_id', currentUser.id);

  if (error) {
    throwSupabaseError(error.message, error);
  }

  return {
    guildId,
    userId: currentUser.id,
    leftAt: new Date().toISOString(),
  };
};
