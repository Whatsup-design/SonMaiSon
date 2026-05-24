import { Router } from 'express';
import {
  createOrGetDmConversationController,
  getDmConversationsController,
  getDmMessagesController,
  searchDmMessagesController,
} from '../controllers/dmController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import {
  createDmConversationSchema,
  getDmMessagesSchema,
  searchDmMessagesSchema,
} from '../schemas/dm.schema';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authMiddleware);

router.get('/conversations', asyncHandler(getDmConversationsController));

router.post(
  '/conversations',
  validateRequest(createDmConversationSchema),
  asyncHandler(createOrGetDmConversationController),
);

router.get(
  '/conversations/:conversationId/messages/search',
  validateRequest(searchDmMessagesSchema),
  asyncHandler(searchDmMessagesController),
);

router.get(
  '/conversations/:conversationId/messages',
  validateRequest(getDmMessagesSchema),
  asyncHandler(getDmMessagesController),
);

export default router;
