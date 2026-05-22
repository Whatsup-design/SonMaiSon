import { ErrorCode } from '../constants/errorCodes';
import { HttpStatus } from '../constants/httpStatus';

type AppErrorOptions = {
  statusCode: HttpStatus;
  code: ErrorCode;
  message: string;
  details?: unknown;
  isOperational?: boolean;
};

export class AppError extends Error {
  statusCode: HttpStatus;
  code: ErrorCode;
  details?: unknown;
  isOperational: boolean;

  constructor({
    statusCode,
    code,
    message,
    details,
    isOperational = true,
  }: AppErrorOptions) {
    super(message);

    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}
