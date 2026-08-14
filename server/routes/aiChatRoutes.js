import express from 'express';
import {
  getChatHistory,
  saveChatMessage,
  getAIStats,
  clearChatHistory,
  getPopularTopics
} from '../controllers/aiChatController.js';

const router = express.Router();

// Get chat history for a student
router.get('/history/:studentId', getChatHistory);

// Save a chat message
router.post('/message', saveChatMessage);

// Get AI stats for a student
router.get('/stats/:studentId', getAIStats);

// Clear chat history
router.delete('/history/:studentId', clearChatHistory);

// Get popular topics
router.get('/popular-topics', getPopularTopics);

export default router;
