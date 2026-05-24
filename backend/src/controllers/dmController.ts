import { Request, Response } from 'express';
import { HttpStatus } from '../constants/httpStatus';
import { ErrorCode } from '../constants/errorCodes';
import {
  createOrGetDmConversation,
  getDmConversations,
  getDmMessages,
} from '../services/dmService';
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

export const getDmConversationsController = async (
  req: Request,
  res: Response,
) => {
  const conversations = await getDmConversations(getAuthId(req));

  sendSuccess(res, {
    message: 'DM conversations fetched successfully',
    data: conversations,
  });
};

export const createOrGetDmConversationController = async (
  req: Request,
  res: Response,
) => {
  const conversation = await createOrGetDmConversation(
    getAuthId(req),
    req.body.targetUserId,
  );

  sendSuccess(res, {
    statusCode: HttpStatus.CREATED,
    message: 'DM conversation ready',
    data: conversation,
  });
};

export const getDmMessagesController = async (
  req: Request,
  res: Response,
) => {
  const conversationId = String(req.params.conversationId);
  const { limit = 50, before } = req.query;

  const messages = await getDmMessages(getAuthId(req), conversationId, {
    limit: Number(limit),
    before: before ? String(before) : undefined,
  });

  sendSuccess(res, {
    message: 'DM messages fetched successfully',
    data: messages,
  });
};
