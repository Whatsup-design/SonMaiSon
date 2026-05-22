import { Request, Response } from 'express';
import { HttpStatus } from '../../constants/httpStatus';
import {
  getOAuthUrl,
  loginUser,
  logoutUser,
  signupUser,
} from '../../services/auth/authService';
import { sendSuccess } from '../../utils/apiResponse';

export const signupController = async (req: Request, res: Response) => {
  const data = await signupUser(req.body);

  sendSuccess(res, {
    statusCode: HttpStatus.CREATED,
    message: 'Signup successful',
    data,
  });
};

export const loginController = async (req: Request, res: Response) => {
  const data = await loginUser(req.body);

  sendSuccess(res, {
    message: 'Login successful',
    data,
  });
};

export const logoutController = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  await logoutUser(token);

  sendSuccess(res, {
    message: 'Logout successful',
  });
};

export const oauthController = async (req: Request, res: Response) => {
  const provider = String(req.params.provider);
  const data = await getOAuthUrl(provider);

  sendSuccess(res, {
    message: 'OAuth URL created',
    data,
  });
};
