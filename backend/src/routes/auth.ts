import express from 'express';
import {
  loginController,
  logoutController,
  oauthController,
  signupController,
} from '../controllers/auth/authController';
import {
  loginSchema,
  oauthProviderSchema,
  signupSchema,
} from '../schemas/auth.schema';
import { asyncHandler } from '../utils/asyncHandler';
import { authRateLimiter } from '../utils/rateLimit';
import { validateRequest } from '../middleware/validateRequest';


const router = express.Router();

router.use(authRateLimiter);

router.post('/login', validateRequest(loginSchema), asyncHandler(loginController));
router.post('/signup', validateRequest(signupSchema), asyncHandler(signupController));
router.post('/logout', asyncHandler(logoutController));
router.get(
  '/oauth/:provider',
  validateRequest(oauthProviderSchema),
  asyncHandler(oauthController),
);

export default router;
