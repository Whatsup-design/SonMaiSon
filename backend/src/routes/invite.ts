import { Router } from 'express';
import {
  getGuildInviteController,
  joinGuildInviteController,
} from '../controllers/inviteController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { inviteCodeParamSchema } from '../schemas/guild.schema';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authMiddleware);

router.get(
  '/:code',
  validateRequest(inviteCodeParamSchema),
  asyncHandler(getGuildInviteController),
);

router.post(
  '/:code/join',
  validateRequest(inviteCodeParamSchema),
  asyncHandler(joinGuildInviteController),
);

export default router;
