import express from "express";
import {
  createSyllabus,
  getAllSyllabi,
  getSyllabusById,
  updateSyllabus,
  deleteSyllabus,
  generatePrompt,
  generateVideo,
  checkVideoStatus,
  generateVideoFromText,
  checkTaskStatus,
  submitQuiz,
  getQuizLeaderboard,
  getStudentQuizHistory,
  checkQuizCompletion,
  regenerateQuiz,
} from "../controllers/syllabusController.js";
import { authenticateUser, authorizeRoles, verifyOwnership } from "../middleware/authMiddleware.js";

const syllabusRouter = express.Router();

// Protect all routes
syllabusRouter.use(authenticateUser);

// ============ SYLLABUS CRUD ROUTES ============

// POST /api/syllabus - Create new syllabus (auto-generates quiz with AI) (Teacher / Admin only)
syllabusRouter.post("/", authorizeRoles('teacher', 'admin'), createSyllabus);

// GET /api/syllabus - Get all syllabi
syllabusRouter.get("/", getAllSyllabi);

// GET /api/syllabus/:id - Get syllabus by ID
syllabusRouter.get("/:id", getSyllabusById);

// PUT /api/syllabus/:id - Update syllabus (Teacher / Admin only)
syllabusRouter.put("/:id", authorizeRoles('teacher', 'admin'), updateSyllabus);

// DELETE /api/syllabus/:id - Delete syllabus (Teacher / Admin only)
syllabusRouter.delete("/:id", authorizeRoles('teacher', 'admin'), deleteSyllabus);

// ============ PROMPT & VIDEO GENERATION ROUTES ============

// POST /api/syllabus/:id/generate-prompt - Generate prompt from syllabus (Teacher / Admin only)
syllabusRouter.post("/:id/generate-prompt", authorizeRoles('teacher', 'admin'), generatePrompt);

// POST /api/syllabus/:id/generate-video - Generate video from syllabus using Pollo AI (Teacher / Admin only)
syllabusRouter.post("/:id/generate-video", authorizeRoles('teacher', 'admin'), generateVideo);

// GET /api/syllabus/:id/video-status - Check video generation status (Teacher / Admin only)
syllabusRouter.get("/:id/video-status", authorizeRoles('teacher', 'admin'), checkVideoStatus);

// ============ DIRECT VIDEO GENERATION ROUTES ============

// POST /api/syllabus/video/generate - Generate video directly from prompt (Teacher / Admin only)
syllabusRouter.post("/video/generate", authorizeRoles('teacher', 'admin'), generateVideoFromText);

// GET /api/syllabus/video/status/:taskId - Check task status by task ID (Teacher / Admin only)
syllabusRouter.get("/video/status/:taskId", authorizeRoles('teacher', 'admin'), checkTaskStatus);

// ============ QUIZ ROUTES ============

// POST /api/syllabus/:id/regenerate-quiz - Regenerate quiz with AI (Teacher / Admin only)
syllabusRouter.post("/:id/regenerate-quiz", authorizeRoles('teacher', 'admin'), regenerateQuiz);

// POST /api/syllabus/:syllabusId/quiz/submit - Submit quiz answers
syllabusRouter.post("/:syllabusId/quiz/submit", submitQuiz);

// GET /api/syllabus/quiz/leaderboard - Get quiz leaderboard
syllabusRouter.get("/quiz/leaderboard", getQuizLeaderboard);

// GET /api/syllabus/quiz/history/:studentId - Get student's quiz history
syllabusRouter.get("/quiz/history/:studentId", verifyOwnership, getStudentQuizHistory);

// GET /api/syllabus/:syllabusId/quiz/check/:studentId - Check if student completed quiz
syllabusRouter.get("/:syllabusId/quiz/check/:studentId", verifyOwnership, checkQuizCompletion);

export default syllabusRouter;
