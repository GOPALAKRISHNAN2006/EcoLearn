import api from "./api";

// ============ SYLLABUS CRUD OPERATIONS ============

/**
 * Create a new syllabus
 */
export const createSyllabus = async (syllabusData) => {
  try {
    const response = await api.post("/syllabus", syllabusData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get all syllabi with pagination
 */
export const getAllSyllabi = async (params = {}) => {
  try {
    const response = await api.get("/syllabus", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get a single syllabus by ID
 */
export const getSyllabusById = async (id) => {
  try {
    const response = await api.get(`/syllabus/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update a syllabus
 */
export const updateSyllabus = async (id, syllabusData) => {
  try {
    const response = await api.put(`/syllabus/${id}`, syllabusData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete a syllabus
 */
export const deleteSyllabus = async (id) => {
  try {
    const response = await api.delete(`/syllabus/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ============ PROMPT & VIDEO GENERATION ============

/**
 * Generate prompt from syllabus
 */
export const generatePromptFromSyllabus = async (
  syllabusId,
  customPrompt = null
) => {
  try {
    const response = await api.post(`/syllabus/${syllabusId}/generate-prompt`, {
      customPrompt,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Generate video from syllabus using Pollo AI
 */
export const generateVideoFromSyllabus = async (syllabusId, options = {}) => {
  try {
    const response = await api.post(`/syllabus/${syllabusId}/generate-video`, {
      customPrompt: options.customPrompt,
      options: {
        duration: options.duration || "5",
        aspectRatio: options.aspectRatio || "16:9",
        mode: options.mode || "std",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Check video generation status for a syllabus
 */
export const checkVideoStatus = async (syllabusId) => {
  try {
    const response = await api.get(`/syllabus/${syllabusId}/video-status`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Generate video directly from a text prompt
 */
export const generateVideoFromPrompt = async (
  prompt,
  title = "",
  options = {}
) => {
  try {
    const response = await api.post("/syllabus/video/generate", {
      prompt,
      title,
      options: {
        duration: options.duration || "5",
        aspectRatio: options.aspectRatio || "16:9",
        mode: options.mode || "std",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Check task status by task ID
 */
export const checkTaskStatus = async (taskId) => {
  try {
    const response = await api.get(`/syllabus/video/status/${taskId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ============ QUIZ OPERATIONS ============

/**
 * Submit quiz answers
 */
export const submitQuiz = async (syllabusId, quizData) => {
  try {
    const response = await api.post(
      `/syllabus/${syllabusId}/quiz/submit`,
      quizData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get quiz leaderboard
 */
export const getQuizLeaderboard = async (params = {}) => {
  try {
    const response = await api.get("/syllabus/quiz/leaderboard", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get student's quiz history
 */
export const getStudentQuizHistory = async (studentId) => {
  try {
    const response = await api.get(`/syllabus/quiz/history/${studentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Check if student has completed a quiz
 */
export const checkQuizCompletion = async (syllabusId, studentId) => {
  try {
    const response = await api.get(
      `/syllabus/${syllabusId}/quiz/check/${studentId}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Regenerate quiz for a syllabus using AI
 */
export const regenerateQuiz = async (syllabusId) => {
  try {
    const response = await api.post(`/syllabus/${syllabusId}/regenerate-quiz`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  createSyllabus,
  getAllSyllabi,
  getSyllabusById,
  updateSyllabus,
  deleteSyllabus,
  generatePromptFromSyllabus,
  generateVideoFromSyllabus,
  checkVideoStatus,
  generateVideoFromPrompt,
  checkTaskStatus,
  submitQuiz,
  getQuizLeaderboard,
  getStudentQuizHistory,
  checkQuizCompletion,
  regenerateQuiz,
};
