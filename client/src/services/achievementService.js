import api from "./api";

/**
 * Get all achievements
 */
export const getAllAchievements = async () => {
  try {
    const response = await api.get("/achievement");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get student's achievement progress
 */
export const getStudentAchievements = async (studentId) => {
  try {
    const response = await api.get(`/achievement/student/${studentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update achievement progress
 */
export const updateAchievementProgress = async (studentId, achievementId, progress) => {
  try {
    const response = await api.post(`/achievement/student/${studentId}/update`, {
      achievementId,
      progress,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Seed default achievements (admin only)
 */
export const seedAchievements = async () => {
  try {
    const response = await api.post("/achievement/seed");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
