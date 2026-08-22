import express from "express";
import {
  getAllAchievements,
  getStudentAchievements,
  updateAchievementProgress,
  seedAchievements,
} from "../controllers/achievementController.js";
import { authenticateUser, authorizeRoles, verifyOwnership } from "../middleware/authMiddleware.js";

const achievementRouter = express.Router();

// Protect all routes
achievementRouter.use(authenticateUser);

// Get all achievements
achievementRouter.get("/", getAllAchievements);

// Get student's achievement progress
achievementRouter.get("/student/:studentId", verifyOwnership, getStudentAchievements);

// Update achievement progress
achievementRouter.post("/student/:studentId/update", verifyOwnership, updateAchievementProgress);

// Seed default achievements (admin only - for setup)
achievementRouter.post("/seed", authorizeRoles('admin'), seedAchievements);

export default achievementRouter;
