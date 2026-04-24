import e from 'cors';
import express from 'express';
import { loginController, logoutController, signupController } from '../controllers/authController';


const router = express.Router();

router.post('/login', loginController);
router.post('/signup', signupController);
router.post('/logout', logoutController);

export default router;