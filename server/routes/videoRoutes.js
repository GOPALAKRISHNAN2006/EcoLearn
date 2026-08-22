import express from 'express';
import {
  generateVideo,
  getVideoStatus,
  getTeacherVideos,
  generateImageToVideo
} from '../controllers/videoController.js';
import { authenticateUser, authorizeRoles, verifyOwnership } from '../middleware/authMiddleware.js';

const videoRouter = express.Router();

// Protect all routes - restrict to teachers and admins
videoRouter.use(authenticateUser);
videoRouter.use(authorizeRoles('teacher', 'admin'));

// Generate video from text prompt
videoRouter.post('/generate', generateVideo);

// Generate video from image
videoRouter.post('/generate-from-image', generateImageToVideo);

// Check video generation status
videoRouter.get('/status/:jobId', getVideoStatus);

// Get all videos for a teacher
videoRouter.get('/teacher/:teacherId', verifyOwnership, getTeacherVideos);

export default videoRouter;
