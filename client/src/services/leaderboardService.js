import api from "./api";

/**
 * Get global leaderboard
 */
export const getGlobalLeaderboard = async (limit = 50) => {
  try {
    const response = await api.get("/student/leaderboard/global", {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get school-specific leaderboard
 */
export const getSchoolLeaderboard = async (school, limit = 50) => {
  try {
    const response = await api.get(`/student/leaderboard/school/${encodeURIComponent(school)}`, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
