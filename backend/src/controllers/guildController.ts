import { Request, Response } from 'express';
import { ErrorCode } from '../constants/errorCodes';
import { HttpStatus } from '../constants/httpStatus';
import { createGuild } from '../services/guild/createGuild';
import { createGuildChannel } from '../services/guild/createGuildChannel';
import { getChannelMessages } from '../services/guild/getChannelMessages';
import { getGuildChannels } from '../services/guild/getGuildChannels';
import { getGuildDetail } from '../services/guild/getGuildDetail';
import { getMyGuilds } from '../services/guild/getMyGuilds';
import { leaveGuild } from '../services/guild/leaveGuild';
import { sendChannelMessage } from '../services/guild/sendChannelMessage';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/apiResponse';

const getAuthId = (req: Request) => {
  const authId = req.authUser?.id;

  if (!authId) {
    throw new AppError({
      statusCode: HttpStatus.UNAUTHORIZED,
      code: ErrorCode.AUTH_TOKEN_REQUIRED,
      message: 'Authenticated user is required',
    });
  }

  return authId;
};

export const getMyGuildsController = async (req: Request, res: Response) => {
  const guilds = await getMyGuilds(getAuthId(req));

  sendSuccess(res, {
    message: 'Guilds fetched successfully',
    data: guilds,
  });
};

export const createGuildController = async (req: Request, res: Response) => {
  const guild = await createGuild(getAuthId(req), req.body);

  sendSuccess(res, {
    statusCode: HttpStatus.CREATED,
    message: 'Guild created successfully',
    data: guild,
  });
};

export const getGuildDetailController = async (
  req: Request,
  res: Response,
) => {
  const guild = await getGuildDetail(getAuthId(req), String(req.params.guildId));

  sendSuccess(res, {
    message: 'Guild fetched successfully',
    data: guild,
  });
};

export const getGuildChannelsController = async (
  req: Request,
  res: Response,
) => {
  const channels = await getGuildChannels(
    getAuthId(req),
    String(req.params.guildId),
  );

  sendSuccess(res, {
    message: 'Guild channels fetched successfully',
    data: channels,
  });
};

export const createGuildChannelController = async (
  req: Request,
  res: Response,
) => {
  const channel = await createGuildChannel(
    getAuthId(req),
    String(req.params.guildId),
    req.body,
  );

  sendSuccess(res, {
    statusCode: HttpStatus.CREATED,
    message: 'Guild channel created successfully',
    data: channel,
  });
};

export const leaveGuildController = async (req: Request, res: Response) => {
  const result = await leaveGuild(getAuthId(req), String(req.params.guildId));

  sendSuccess(res, {
    message: 'Left guild successfully',
    data: result,
  });
};

export const getChannelMessagesController = async (
  req: Request,
  res: Response,
) => {
  const { limit = 50, before } = req.query;
  const messages = await getChannelMessages(
    getAuthId(req),
    String(req.params.channelId),
    {
      limit: Number(limit),
      before: before ? String(before) : undefined,
    },
  );

  sendSuccess(res, {
    message: 'Channel messages fetched successfully',
    data: messages,
  });
};

export const sendChannelMessageController = async (
  req: Request,
  res: Response,
) => {
  const message = await sendChannelMessage(
    getAuthId(req),
    String(req.params.channelId),
    req.body.content,
  );

  sendSuccess(res, {
    statusCode: HttpStatus.CREATED,
    message: 'Channel message sent successfully',
    data: message,
  });
};
