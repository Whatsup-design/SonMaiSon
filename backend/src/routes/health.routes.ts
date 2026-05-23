import { Router } from 'express';
import { env } from '../config/env';
import { sendSuccess } from '../utils/apiResponse';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  sendSuccess(res, {
    message: 'Health check successful',
    data: {
      status: 'ok',
      environment: env.nodeEnv,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});
