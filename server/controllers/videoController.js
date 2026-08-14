import * as klingAI from '../services/klingAIService.js';

// Store video generation jobs
const videoJobs = new Map();

// Generate video from text prompt using Pollo AI
export const generateVideo = async (req, res) => {
  try {
    const { prompt, duration = 5, aspectRatio = '16:9' } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    // Create a job ID
    const jobId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store job status
    videoJobs.set(jobId, {
      status: 'processing',
      prompt,
      createdAt: new Date(),
      progress: 0
    });

    // Start video generation in background
    generateVideoAsync(jobId, prompt, aspectRatio);

    res.status(200).json({
      success: true,
      message: 'Video generation started',
      data: {
        jobId,
        status: 'processing',
        estimatedTime: '60-120 seconds'
      }
    });

  } catch (error) {
    console.error('Generate video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during video generation',
      error: error.message
    });
  }
};

// Async video generation with Pollo AI
const generateVideoAsync = async (jobId, prompt, aspectRatio) => {
  try {
    console.log(`Starting video generation for job: ${jobId} with Pollo AI`);
    
    // Update progress
    videoJobs.set(jobId, {
      ...videoJobs.get(jobId),
      progress: 10,
      status: 'processing'
    });

    // Simulate progress while waiting (video gen takes 1-2 min)
    const progressInterval = setInterval(() => {
      const currentJob = videoJobs.get(jobId);
      if (currentJob && currentJob.status === 'processing' && currentJob.progress < 85) {
        videoJobs.set(jobId, {
          ...currentJob,
          progress: currentJob.progress + 5
        });
      }
    }, 5000); // Update every 5 seconds

    // Enhanced prompt for educational content
    const enhancedPrompt = `${prompt}. High quality, educational, cinematic visuals.`;

    // Generate video with Kling AI
    const result = await klingAI.generateAndWaitForVideo(enhancedPrompt, {
      duration: 5,
      aspectRatio: aspectRatio,
      mode: 'std'
    });

    clearInterval(progressInterval);

    console.log(`Video generation completed for job: ${jobId}`, JSON.stringify(result, null, 2));

    // Extract video URL
    const videoUrl = result?.videoUrl || null;
    const thumbnailUrl = result?.thumbnailUrl || `https://picsum.photos/seed/${jobId}/640/360`;
    
    if (!videoUrl) {
      console.error(`No video URL found in result for job ${jobId}`);
    }

    // Update job with completed status
    videoJobs.set(jobId, {
      ...videoJobs.get(jobId),
      status: 'completed',
      progress: 100,
      videoUrl: videoUrl,
      thumbnailUrl: thumbnailUrl,
      completedAt: new Date()
    });

  } catch (error) {
    console.error(`Video generation failed for job ${jobId}:`, error);
    
    videoJobs.set(jobId, {
      ...videoJobs.get(jobId),
      status: 'failed',
      progress: 0,
      error: error.message,
      failedAt: new Date()
    });
  }
};

// Check video generation status
export const getVideoStatus = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!videoJobs.has(jobId)) {
      return res.status(404).json({
        success: false,
        message: 'Video job not found'
      });
    }

    const job = videoJobs.get(jobId);

    res.status(200).json({
      success: true,
      data: job
    });

  } catch (error) {
    console.error('Get video status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error checking video status'
    });
  }
};

// Get all videos for a teacher
export const getTeacherVideos = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Get all completed videos (in production, this would query a database)
    const videos = [];
    videoJobs.forEach((job, jobId) => {
      if (job.status === 'completed') {
        videos.push({
          jobId,
          ...job
        });
      }
    });

    res.status(200).json({
      success: true,
      data: videos
    });

  } catch (error) {
    console.error('Get teacher videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching videos'
    });
  }
};

// Generate video using Imagen (for image-to-video)
export const generateImageToVideo = async (req, res) => {
  try {
    const { imageUrl, prompt, duration = 4 } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    const jobId = `img2vid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    videoJobs.set(jobId, {
      status: 'processing',
      type: 'image-to-video',
      prompt,
      imageUrl,
      createdAt: new Date(),
      progress: 0
    });

    // Simulate processing
    setTimeout(() => {
      videoJobs.set(jobId, {
        ...videoJobs.get(jobId),
        status: 'completed',
        progress: 100,
        videoUrl: `/api/video/placeholder/${jobId}`,
        thumbnailUrl: imageUrl,
        completedAt: new Date()
      });
    }, 5000);

    res.status(200).json({
      success: true,
      message: 'Image-to-video generation started',
      data: {
        jobId,
        status: 'processing'
      }
    });

  } catch (error) {
    console.error('Image to video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during image-to-video generation'
    });
  }
};
