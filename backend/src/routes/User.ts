import express from 'express';

const router = express.Router();

router.get('/dashboard', (_req, res) => {
  res.status(200).json({
    message: 'User Dashboard',
  });
});

// router.get('/Market', MarketController);

// router.get('/Ledaerboard', LeaderboardController);

export default router;
