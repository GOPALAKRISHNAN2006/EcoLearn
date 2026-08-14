import express from "express";
import {
  getAllAchievements,
  getStudentAchievements,
  updateAchievementProgress,
  seedAchievements,
} from "../controllers/achievementController.js";

const achievementRouter = express.Router();

// Get all achievements
achievementRouter.get("/", getAllAchievements);

// Get student's achievement progress
achievementRouter.get("/student/:studentId", getStudentAchievements);

// Update achievement progress
achievementRouter.post("/student/:studentId/update", updateAchievementProgress);

// Seed default achievements (admin only - for setup)
achievementRouter.post("/seed", seedAchievements);

export default achievementRouter;
