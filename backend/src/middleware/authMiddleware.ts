import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { supabase } from '../lib/supabase';
import { getUserDataByAuthId } from '../services/userService';

const getBearerToken = (authorization?: string) => {
  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  return authorization.replace('Bearer ', '').trim();
};

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = getBearerToken(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        message: 'Access token is required',
      });
      return;
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      res.status(401).json({
        message: 'Invalid or expired token',
      });
      return;
    }

    const tokenPayload = jwt.decode(token) as JwtPayload | string | null;
    const databaseUser = await getUserDataByAuthId(data.user.id, token);

    req.accessToken = token;
    req.authUser = data.user;
    req.tokenPayload = tokenPayload;
    req.databaseUser = databaseUser;

    next();
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Authentication failed',
    });
  }
};
