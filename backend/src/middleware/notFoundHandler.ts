import { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../constants/errorCodes';
import { HttpStatus } from '../constants/httpStatus';
import { AppError } from '../utils/AppError';

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  next(
    new AppError({
      statusCode: HttpStatus.NOT_FOUND,
      code: ErrorCode.NOT_FOUND,
      message: `Cannot ${req.method} ${req.originalUrl}`,
    }),
  );
};
