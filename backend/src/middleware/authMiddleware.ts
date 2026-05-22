import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ErrorCode } from '../constants/errorCodes';
import { HttpStatus } from '../constants/httpStatus';
import { supabase } from '../lib/supabase';
import { AppError } from '../utils/AppError';

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
      next(
        new AppError({
          statusCode: HttpStatus.UNAUTHORIZED,
          code: ErrorCode.AUTH_TOKEN_REQUIRED,
          message: 'Access token is required',
        }),
      );
      return;
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      next(
        new AppError({
          statusCode: HttpStatus.UNAUTHORIZED,
          code: ErrorCode.AUTH_TOKEN_INVALID,
          message: 'Invalid or expired token',
        }),
      );
      return;
    }

    const tokenPayload = jwt.decode(token) as JwtPayload | string | null;

    req.accessToken = token;
    req.authUser = data.user;
    req.tokenPayload = tokenPayload;

    next();
  } catch (error) {
    next(error);
  }
};
