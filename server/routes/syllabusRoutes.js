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

const syllabusRouter = express.Router();

// ============ SYLLABUS CRUD ROUTES ============

// POST /api/syllabus - Create new syllabus (auto-generates quiz with AI)
syllabusRouter.post("/", createSyllabus);

// GET /api/syllabus - Get all syllabi
syllabusRouter.get("/", getAllSyllabi);

// GET /api/syllabus/:id - Get syllabus by ID
syllabusRouter.get("/:id", getSyllabusById);

// PUT /api/syllabus/:id - Update syllabus
syllabusRouter.put("/:id", updateSyllabus);

// DELETE /api/syllabus/:id - Delete syllabus
syllabusRouter.delete("/:id", deleteSyllabus);

// ============ PROMPT & VIDEO GENERATION ROUTES ============

// POST /api/syllabus/:id/generate-prompt - Generate prompt from syllabus
syllabusRouter.post("/:id/generate-prompt", generatePrompt);

// POST /api/syllabus/:id/generate-video - Generate video from syllabus using Pollo AI
syllabusRouter.post("/:id/generate-video", generateVideo);

// GET /api/syllabus/:id/video-status - Check video generation status
syllabusRouter.get("/:id/video-status", checkVideoStatus);

// ============ DIRECT VIDEO GENERATION ROUTES ============

// POST /api/syllabus/video/generate - Generate video directly from prompt
syllabusRouter.post("/video/generate", generateVideoFromText);

// GET /api/syllabus/video/status/:taskId - Check task status by task ID
syllabusRouter.get("/video/status/:taskId", checkTaskStatus);

// ============ QUIZ ROUTES ============

// POST /api/syllabus/:id/regenerate-quiz - Regenerate quiz with AI
syllabusRouter.post("/:id/regenerate-quiz", regenerateQuiz);

// POST /api/syllabus/:syllabusId/quiz/submit - Submit quiz answers
syllabusRouter.post("/:syllabusId/quiz/submit", submitQuiz);

// GET /api/syllabus/quiz/leaderboard - Get quiz leaderboard
syllabusRouter.get("/quiz/leaderboard", getQuizLeaderboard);

// GET /api/syllabus/quiz/history/:studentId - Get student's quiz history
syllabusRouter.get("/quiz/history/:studentId", getStudentQuizHistory);

// GET /api/syllabus/:syllabusId/quiz/check/:studentId - Check if student completed quiz
syllabusRouter.get("/:syllabusId/quiz/check/:studentId", checkQuizCompletion);

export default syllabusRouter;
