import api from "./api";

/**
 * Generate quiz using AI based on title and description
 */
export const generateVideoQuiz = async (title, description, subject, grade) => {
  try {
    const response = await api.post("/video-lesson/generate-quiz", {
      title,
      description,
      subject,
      grade,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Upload video file to server
 */
export const uploadVideoFile = async (file, onProgress) => {
  try {
    const formData = new FormData();
    formData.append("video", file);

    const response = await api.post("/video-lesson/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Create a new video lesson
 */
export const createVideoLesson = async (videoData) => {
  try {
    const response = await api.post("/video-lesson", videoData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get all video lessons
 */
export const getAllVideoLessons = async (filters = {}) => {
  try {
    const response = await api.get("/video-lesson", { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get video lesson by ID
 */
export const getVideoLessonById = async (id) => {
  try {
    const response = await api.get(`/video-lesson/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update video lesson
 */
export const updateVideoLesson = async (id, videoData) => {
  try {
    const response = await api.put(`/video-lesson/${id}`, videoData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete video lesson
 */
export const deleteVideoLesson = async (id) => {
  try {
    const response = await api.delete(`/video-lesson/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get videos by grade for students
 */
export const getVideosByGrade = async (grade) => {
  try {
    const response = await api.get(`/video-lesson/grade/${encodeURIComponent(grade)}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Submit quiz for video
 */
export const submitVideoQuiz = async (videoId, quizData) => {
  try {
    const response = await api.post(`/video-lesson/${videoId}/quiz/submit`, quizData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Award points for watching video
 */
export const awardVideoWatchPoints = async (videoId, studentId) => {
  try {
    const response = await api.post(`/video-lesson/${videoId}/watch-points`, { studentId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Award points for completing game
 */
export const awardGamePoints = async (videoId, studentId, gameCompleted) => {
  try {
    const response = await api.post(`/video-lesson/${videoId}/game-points`, { 
      studentId, 
      gameCompleted 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
