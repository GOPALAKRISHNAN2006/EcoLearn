import express from "express";
import {
  studentLogin,
  changePassword,
  awardVideoPoints,
  awardQuizPoints,
  getStudentStats,
  getGlobalLeaderboard,
  getSchoolLeaderboard,
} from "../controllers/studentController.js";
import { authenticateUser, verifyOwnership } from "../middleware/authMiddleware.js";

const studentRouter = express.Router();

// Student authentication (public)
studentRouter.post("/login", studentLogin);
studentRouter.post("/change-password", changePassword);

// Protect all routes below this line
studentRouter.use(authenticateUser);

// Points and stats
studentRouter.post("/award-video-points", awardVideoPoints);
studentRouter.post("/award-quiz-points", awardQuizPoints);
studentRouter.get("/stats/:studentId", verifyOwnership, getStudentStats);

// Leaderboards
studentRouter.get("/leaderboard/global", getGlobalLeaderboard);
studentRouter.get("/leaderboard/school/:school", getSchoolLeaderboard);

export default studentRouter;
