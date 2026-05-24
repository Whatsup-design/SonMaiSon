import { Request, Response } from 'express';
import { ErrorCode } from '../constants/errorCodes';
import { HttpStatus } from '../constants/httpStatus';
import { getGuildInvite } from '../services/guild/getGuildInvite';
import { joinGuildInvite } from '../services/guild/joinGuildInvite';
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

export const getGuildInviteController = async (
  req: Request,
  res: Response,
) => {
  const invite = await getGuildInvite(String(req.params.code));

  sendSuccess(res, {
    message: 'Guild invite fetched successfully',
    data: invite,
  });
};

export const joinGuildInviteController = async (
  req: Request,
  res: Response,
) => {
  const result = await joinGuildInvite(getAuthId(req), String(req.params.code));

  sendSuccess(res, {
    message: result.alreadyMember
      ? 'User is already a guild member'
      : 'Joined guild successfully',
    data: result,
  });
};
