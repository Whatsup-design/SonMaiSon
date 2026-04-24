import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/dashboard', authMiddleware, (req, res) => {
  res.status(200).json({
    message: 'User Dashboard',
    authUser: req.authUser,
    tokenPayload: req.tokenPayload,
    databaseUser: req.databaseUser,
  });
});

// router.get('/Market', MarketController);

// router.get('/Ledaerboard', LeaderboardController);

export default router;
