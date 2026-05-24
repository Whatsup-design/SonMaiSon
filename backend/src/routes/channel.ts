import { Router } from 'express';
import {
  getChannelMessagesController,
  sendChannelMessageController,
} from '../controllers/guildController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import {
  getChannelMessagesSchema,
  sendChannelMessageSchema,
} from '../schemas/guild.schema';
import { asyncHandler } from '../utils/asyncHandler';
import { messageRateLimiter } from '../utils/rateLimit';

const router = Router();

router.use(authMiddleware);

router.get(
  '/:channelId/messages',
  validateRequest(getChannelMessagesSchema),
  asyncHandler(getChannelMessagesController),
);

router.post(
  '/:channelId/messages',
  messageRateLimiter,
  validateRequest(sendChannelMessageSchema),
  asyncHandler(sendChannelMessageController),
);

export default router;
