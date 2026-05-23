import { rateLimit } from 'express-rate-limit';
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
