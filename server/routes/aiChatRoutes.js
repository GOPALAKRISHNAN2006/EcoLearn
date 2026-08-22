import express from 'express';
import {
  getChatHistory,
  saveChatMessage,
  getAIStats,
  clearChatHistory,
  getPopularTopics
} from '../controllers/aiChatController.js';
import { authenticateUser, verifyOwnership } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(authenticateUser);

// Get chat history for a student
router.get('/history/:studentId', verifyOwnership, getChatHistory);

// Save a chat message
router.post('/message', saveChatMessage);

// Get AI stats for a student
router.get('/stats/:studentId', verifyOwnership, getAIStats);

// Clear chat history
router.delete('/history/:studentId', verifyOwnership, clearChatHistory);

// Get popular topics
router.get('/popular-topics', getPopularTopics);

export default router;
