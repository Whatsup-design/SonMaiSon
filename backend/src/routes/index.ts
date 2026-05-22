import { Router } from 'express';
import { sendSuccess } from '../utils/apiResponse';
import { healthRouter } from './health.routes';

export const router = Router();

router.get('/', (_req, res) => {
  sendSuccess(res, {
    message: 'Backend API is running',
  });
});

router.use('/health', healthRouter);
