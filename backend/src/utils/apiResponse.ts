import { Response } from 'express';
import { ErrorCode } from '../constants/errorCodes';
import { HttpStatus } from '../constants/httpStatus';

type SuccessResponseOptions<TData> = {
  statusCode?: HttpStatus;
  message: string;
  data?: TData;
  meta?: Record<string, unknown>;
};

type ErrorResponseOptions = {
  statusCode?: HttpStatus;
  message: string;
  code: ErrorCode;
  details?: unknown;
};

export const sendSuccess = <TData>(
  res: Response,
  {
    statusCode = HttpStatus.OK,
    message,
    data,
    meta,
  }: SuccessResponseOptions<TData>,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined ? { data } : {}),
    ...(meta !== undefined ? { meta } : {}),
  });
};

export const sendError = (
  res: Response,
  {
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    message,
    code,
    details,
  }: ErrorResponseOptions,
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      details: details ?? null,
    },
  });
};
