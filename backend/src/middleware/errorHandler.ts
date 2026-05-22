import { ErrorRequestHandler } from 'express';
import { ErrorCode } from '../constants/errorCodes';
import { HttpStatus } from '../constants/httpStatus';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { sendError } from '../utils/apiResponse';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);

  if (err instanceof AppError) {
    sendError(res, {
      statusCode: err.statusCode,
      message: err.message,
      code: err.code,
      details: err.details,
    });
    return;
  }

  sendError(res, {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message:
      env.nodeEnv === 'development'
        ? err instanceof Error
          ? err.message
          : 'Internal server error'
        : 'Internal server error',
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    details:
      env.nodeEnv === 'development' && err instanceof Error
        ? { stack: err.stack }
        : null,
  });
};
