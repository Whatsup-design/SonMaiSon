import express from 'express';
import {
  loginController,
  logoutController,
  oauthController,
  signupController,
} from '../controllers/auth/authController';
import { asyncHandler } from '../utils/asyncHandler';


const router = express.Router();

router.post('/login', asyncHandler(loginController));
router.post('/signup', asyncHandler(signupController));
router.post('/logout', asyncHandler(logoutController));
router.get('/oauth/:provider', asyncHandler(oauthController));

export default router;
