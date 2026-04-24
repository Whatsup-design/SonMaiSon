import { Router } from 'express';
import { healthRouter } from './health.routes';

export const router = Router();

router.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Backend API is running',
  });
});

router.use('/health', healthRouter);
