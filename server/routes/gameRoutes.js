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
import { authenticateUser, authorizeRoles, verifyOwnership } from '../middleware/authMiddleware.js';

const gameRouter = express.Router();

// Protect all routes
gameRouter.use(authenticateUser);

// Student routes
gameRouter.get('/class/:studentClass', getGamesForClass);
gameRouter.post('/complete', completeGame);
gameRouter.get('/history/:studentId', verifyOwnership, getGameHistory);
gameRouter.get('/rewards/:studentId', verifyOwnership, getStudentRewards);
gameRouter.post('/redeem', redeemReward);
gameRouter.get('/redemptions/:studentId', verifyOwnership, getRedemptionHistory);

// Admin routes
gameRouter.get('/all', authorizeRoles('admin'), getAllGames);
gameRouter.get('/classes', authorizeRoles('admin'), getAvailableClasses);
gameRouter.post('/create', authorizeRoles('admin'), createGame);
gameRouter.post('/seed', authorizeRoles('admin'), seedGames);
gameRouter.put('/:gameId', authorizeRoles('admin'), updateGame);
gameRouter.put('/:gameId/classes', authorizeRoles('admin'), updateGameClasses);
gameRouter.put('/:gameId/toggle-status', authorizeRoles('admin'), toggleGameStatus);
gameRouter.post('/bulk-update-classes', authorizeRoles('admin'), bulkUpdateGameClasses);
gameRouter.delete('/:gameId', authorizeRoles('admin'), deleteGame);

export default gameRouter;
