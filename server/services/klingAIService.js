import axios from 'axios';

const KLING_ACCESS_KEY = process.env.KLING_ACCESS_KEY;
const KLING_SECRET_KEY = process.env.KLING_SECRET_KEY;
const KLING_API_URL = 'https://api.klingai.com/v1/videos/text2video';

/**
 * Generate video using Kling AI text-to-video API
 * @param {string} prompt - Text prompt for video generation
 * @param {object} options - Video generation options
 * @returns {Promise<object>} Video generation result with task ID
 */
export const generateVideo = async (prompt, options = {}) => {
  try {
    const {
      duration = 5, // 5 or 10 seconds
      aspectRatio = '16:9', // 16:9, 9:16, or 1:1
      mode = 'std', // std (standard) or pro (professional)
    } = options;

    if (!KLING_ACCESS_KEY || !KLING_SECRET_KEY) {
      throw new Error('KLING_ACCESS_KEY and KLING_SECRET_KEY are not configured');
    }

    console.log('Generating video with Kling AI:', { prompt, duration, aspectRatio, mode });

    const response = await axios.post(
      KLING_API_URL,
      {
        prompt,
        duration,
        aspect_ratio: aspectRatio,
        mode,
      },
      {
        headers: {
          'Authorization': `Bearer ${KLING_ACCESS_KEY}:${KLING_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Kling AI video generation started:', response.data);

    return {
      success: true,
      taskId: response.data.data?.task_id,
      status: 'processing',
      message: 'Video generation started',
    };
  } catch (error) {
    console.error('Kling AI video generation error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to generate video with Kling AI');
  }
};

/**
 * Check video generation status
 * @param {string} taskId - Task ID from video generation
 * @returns {Promise<object>} Video status and URL if completed
 */
export const checkVideoStatus = async (taskId) => {
  try {
    if (!KLING_ACCESS_KEY || !KLING_SECRET_KEY) {
      throw new Error('KLING_ACCESS_KEY and KLING_SECRET_KEY are not configured');
    }

    const response = await axios.get(
      `https://api.klingai.com/v1/videos/text2video/${taskId}`,
      {
        headers: {
          'Authorization': `Bearer ${KLING_ACCESS_KEY}:${KLING_SECRET_KEY}`,
        },
      }
    );

    const { status, video_url } = response.data.data || {};

    console.log('Kling AI video status:', { taskId, status });

    return {
      success: true,
      status: status, // processing, succeeded, failed
      videoUrl: video_url,
      completed: status === 'succeeded',
      failed: status === 'failed',
    };
  } catch (error) {
    console.error('Kling AI status check error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to check video status');
  }
};

/**
 * Generate video and wait for completion with polling
 * @param {string} prompt - Text prompt for video generation
 * @param {object} options - Video generation options
 * @param {number} maxWaitTime - Maximum wait time in milliseconds (default: 5 minutes)
 * @returns {Promise<object>} Completed video result
 */
export const generateAndWaitForVideo = async (prompt, options = {}, maxWaitTime = 300000) => {
  try {
    // Start video generation
    const generateResult = await generateVideo(prompt, options);
    
    if (!generateResult.success || !generateResult.taskId) {
      throw new Error('Failed to start video generation');
    }

    const taskId = generateResult.taskId;
    const startTime = Date.now();
    const pollInterval = 10000; // Poll every 10 seconds

    // Poll for completion
    while (Date.now() - startTime < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const statusResult = await checkVideoStatus(taskId);

      if (statusResult.completed) {
        console.log('Kling AI video generation completed:', statusResult.videoUrl);
        return {
          success: true,
          status: 'completed',
          videoUrl: statusResult.videoUrl,
          taskId,
        };
      }

      if (statusResult.failed) {
        throw new Error('Video generation failed');
      }

      console.log('Kling AI video still processing...', {
        taskId,
        elapsed: Math.round((Date.now() - startTime) / 1000) + 's',
      });
    }

    // Timeout
    console.log('Kling AI video generation timeout');
    return {
      success: false,
      status: 'timeout',
      message: 'Video generation timed out',
      taskId,
    };
  } catch (error) {
    console.error('Kling AI generate and wait error:', error.message);
    throw error;
  }
};
