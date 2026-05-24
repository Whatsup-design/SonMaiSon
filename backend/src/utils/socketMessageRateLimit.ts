import { ErrorCode } from '../constants/errorCodes';
import { HttpStatus } from '../constants/httpStatus';
import { AppError } from './AppError';

const MESSAGE_LIMIT = 10;
const WINDOW_MS = 60 * 1000;

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

export const assertSocketMessageRateLimit = (
  authId: string,
  scope: 'dm' | 'channel',
) => {
  const now = Date.now();
  const key = `${scope}:${authId}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return;
  }

  if (bucket.count >= MESSAGE_LIMIT) {
    const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000);

    throw new AppError({
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      message: 'You are sending messages too quickly. Please slow down.',
      details: {
        limit: MESSAGE_LIMIT,
        windowSeconds: WINDOW_MS / 1000,
        retryAfterSeconds,
      },
    });
  }

  bucket.count += 1;
};
