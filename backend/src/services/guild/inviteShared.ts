import { ErrorCode } from '../../constants/errorCodes';
import { HttpStatus } from '../../constants/httpStatus';
import { env } from '../../config/env';
import { AppError } from '../../utils/AppError';
import { formatGuild, Guild } from './guildShared';

export type GuildInvite = {
  id: string;
  guild_id: string;
  code: string;
  created_by: number;
  max_uses: number | null;
  uses: number;
  expires_at: string | null;
  created_at: string;
  guild?: Guild | Guild[] | null;
};

export const getInviteUrl = (code: string) => `${env.clientUrl}/invite/${code}`;

export const assertInviteUsable = (invite: GuildInvite) => {
  if (invite.expires_at && new Date(invite.expires_at).getTime() <= Date.now()) {
    throw new AppError({
      statusCode: HttpStatus.BAD_REQUEST,
      code: ErrorCode.INVITE_EXPIRED,
      message: 'Guild invite has expired',
    });
  }

  if (invite.max_uses !== null && invite.uses >= invite.max_uses) {
    throw new AppError({
      statusCode: HttpStatus.BAD_REQUEST,
      code: ErrorCode.INVITE_MAX_USES_REACHED,
      message: 'Guild invite has reached its maximum uses',
    });
  }
};

export const formatGuildInvite = (invite: GuildInvite) => ({
  id: invite.id,
  guildId: invite.guild_id,
  code: invite.code,
  inviteUrl: getInviteUrl(invite.code),
  createdBy: invite.created_by,
  maxUses: invite.max_uses,
  uses: invite.uses,
  expiresAt: invite.expires_at,
  createdAt: invite.created_at,
  guild: formatGuild(invite.guild),
});
