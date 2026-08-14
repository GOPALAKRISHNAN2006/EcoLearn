import express from 'express';
import {
  generateVideo,
  getVideoStatus,
  getTeacherVideos,
  generateImageToVideo
} from '../controllers/videoController.js';

const videoRouter = express.Router();

// Generate video from text prompt
videoRouter.post('/generate', generateVideo);

// Generate video from image
videoRouter.post('/generate-from-image', generateImageToVideo);

// Check video generation status
videoRouter.get('/status/:jobId', getVideoStatus);

// Get all videos for a teacher
videoRouter.get('/teacher/:teacherId', getTeacherVideos);

export default videoRouter;
