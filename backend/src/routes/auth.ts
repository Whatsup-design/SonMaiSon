import express from 'express';
import {
  loginController,
  logoutController,
  oauthController,
  signupController,
} from '../controllers/auth/authController';


const router = express.Router();

router.post('/login', loginController);
router.post('/signup', signupController);
router.post('/logout', logoutController);
router.get('/oauth/:provider', oauthController);

export default router;
