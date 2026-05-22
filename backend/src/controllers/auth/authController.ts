import { Request, Response } from 'express';
import {
  getOAuthUrl,
  loginUser,
  logoutUser,
  signupUser,
} from '../services/authService';

export const signupController = async (req: Request, res: Response) => {
  try {
    const data = await signupUser(req.body);

    res.status(201).json({
      message: 'Signup successful',
      data,
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Signup failed',
    });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const data = await loginUser(req.body);

    res.status(200).json({
      message: 'Login successful',
      data,
    });
  } catch (error) {
    res.status(401).json({
      message: error instanceof Error ? error.message : 'Login failed',
    });
  }
};

export const logoutController = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const data = await logoutUser(token);

    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Logout failed',
    });
  }
};

export const oauthController = async (req: Request, res: Response) => {
  try {
    const provider = String(req.params.provider);
    const data = await getOAuthUrl(provider);

    res.status(200).json({
      message: 'OAuth URL created',
      data,
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : 'OAuth failed',
    });
  }
};
