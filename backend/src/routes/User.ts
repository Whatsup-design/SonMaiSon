import express from 'express';
import {
  createTodoController,
  dashboardController,
  deleteTodoController,
  getTodosController,
  updateTodoController,
} from '../controllers/userController';

const router = express.Router();

router.get('/dashboard', dashboardController);
router.get('/todos', getTodosController);
router.post('/todos', createTodoController);
router.patch('/todos/:id', updateTodoController);
router.delete('/todos/:id', deleteTodoController);

// router.get('/Market', MarketController);

// router.get('/Ledaerboard', LeaderboardController);

export default router;
