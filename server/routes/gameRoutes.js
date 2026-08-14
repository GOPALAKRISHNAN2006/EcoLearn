import express from 'express';
import {
  getAllGames,
  getGamesForClass,
  createGame,
  updateGame,
  deleteGame,
  updateGameClasses,
  bulkUpdateGameClasses,
  seedGames,
  getAvailableClasses,
  toggleGameStatus,
  completeGame,
  getGameHistory,
  getStudentRewards,
  redeemReward,
  getRedemptionHistory
} from '../controllers/gameController.js';

const gameRouter = express.Router();

// Student routes
gameRouter.get('/class/:studentClass', getGamesForClass);
gameRouter.post('/complete', completeGame);
gameRouter.get('/history/:studentId', getGameHistory);
gameRouter.get('/rewards/:studentId', getStudentRewards);
gameRouter.post('/redeem', redeemReward);
gameRouter.get('/redemptions/:studentId', getRedemptionHistory);

// Admin routes
gameRouter.get('/all', getAllGames);
gameRouter.get('/classes', getAvailableClasses);
gameRouter.post('/create', createGame);
gameRouter.post('/seed', seedGames);
gameRouter.put('/:gameId', updateGame);
gameRouter.put('/:gameId/classes', updateGameClasses);
gameRouter.put('/:gameId/toggle-status', toggleGameStatus);
gameRouter.post('/bulk-update-classes', bulkUpdateGameClasses);
gameRouter.delete('/:gameId', deleteGame);

export default gameRouter;
