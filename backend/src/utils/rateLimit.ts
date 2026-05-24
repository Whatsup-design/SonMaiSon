import { rateLimit } from 'express-rate-limit';
import { Request } from 'express';
import { ErrorCode } from '../constants/errorCodes';
import { HttpStatus } from '../constants/httpStatus';
import { sendError } from './apiResponse';

export const authRateLimiter = rateLimit({
  // Limit each IP to 30 requests per 15 minutes for authentication routes
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, {
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      message: 'Too many authentication requests. Please try again later.',
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
    });
  },
});

export const messageRateLimiter = rateLimit({
  // Limit each authenticated user to 10 message sends per minute for REST message routes
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.authUser?.id ?? req.ip ?? 'anonymous',
  handler: (_req, res) => {
    sendError(res, {
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      message: 'You are sending messages too quickly. Please slow down.',
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
    });
  },
});
