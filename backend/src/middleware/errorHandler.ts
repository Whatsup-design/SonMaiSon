import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error(err);

  res.status(500).json({
    message: 'Internal server error',
    ...(env.nodeEnv === 'development' ? { error: err.message } : {}),
  });
};
