import { Router } from 'express';
import {
  createGuildChannelController,
  createGuildController,
  getGuildChannelsController,
  getGuildDetailController,
  getMyGuildsController,
  leaveGuildController,
} from '../controllers/guildController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import {
  createGuildChannelSchema,
  createGuildSchema,
  guildIdParamSchema,
} from '../schemas/guild.schema';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authMiddleware);

router.get('/', asyncHandler(getMyGuildsController));
router.post('/', validateRequest(createGuildSchema), asyncHandler(createGuildController));

router.get(
  '/:guildId',
  validateRequest(guildIdParamSchema),
  asyncHandler(getGuildDetailController),
);

router.get(
  '/:guildId/channels',
  validateRequest(guildIdParamSchema),
  asyncHandler(getGuildChannelsController),
);

router.post(
  '/:guildId/leave',
  validateRequest(guildIdParamSchema),
  asyncHandler(leaveGuildController),
);

router.post(
  '/:guildId/channels',
  validateRequest(createGuildChannelSchema),
  asyncHandler(createGuildChannelController),
);

export default router;
