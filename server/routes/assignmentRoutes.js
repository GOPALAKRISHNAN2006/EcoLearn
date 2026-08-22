import express from 'express';
import {
  createAssignment,
  getAssignmentsByClass,
  getAssignmentsByTeacher,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  getAssignmentsByGradeSection,
  generateExpectedAnswer,
  extractTextFromImage
} from '../controllers/assignmentController.js';
import { authenticateUser, authorizeRoles, verifyOwnership } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(authenticateUser);

// Generate expected answer using AI (Teacher / Admin only)
router.post('/generate-answer', authorizeRoles('teacher', 'admin'), generateExpectedAnswer);

// Extract text from image (OCR)
router.post('/extract-text', extractTextFromImage);

// Create a new assignment (Teacher / Admin only)
router.post('/create', authorizeRoles('teacher', 'admin'), createAssignment);

// Get all assignments for a specific class (by classId)
router.get('/class/:classId', getAssignmentsByClass);

// Get all assignments by grade and section
router.get('/class/:grade/:section', getAssignmentsByGradeSection);

// Get all assignments for a teacher (Teacher / Admin only)
router.get('/teacher/:teacherId', authorizeRoles('teacher', 'admin'), verifyOwnership, getAssignmentsByTeacher);

// Get a single assignment by ID
router.get('/:id', getAssignmentById);

// Update an assignment (Teacher / Admin only)
router.put('/:id', authorizeRoles('teacher', 'admin'), updateAssignment);

// Delete an assignment (Teacher / Admin only)
router.delete('/:id', authorizeRoles('teacher', 'admin'), deleteAssignment);

export default router;
