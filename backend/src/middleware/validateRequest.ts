import { NextFunction, Request, RequestHandler, Response } from 'express';
import { z, ZodError } from 'zod';
import { ErrorCode } from '../constants/errorCodes';
import { HttpStatus } from '../constants/httpStatus';
import { AppError } from '../utils/AppError';

type RequestSchema = z.ZodType<{
  body?: unknown;
  params?: unknown;
  query?: unknown;
}>;

const formatZodIssues = (error: ZodError) => {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
};

export const validateRequest = (schema: RequestSchema): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      next(
        new AppError({
          statusCode: HttpStatus.BAD_REQUEST,
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Validation failed',
          details: formatZodIssues(result.error),
        }),
      );
      return;
    }

    if (result.data.body !== undefined) {
      req.body = result.data.body;
    }

    if (result.data.params !== undefined) {
      req.params = result.data.params as Request['params'];
    }

    next();
  };
};
