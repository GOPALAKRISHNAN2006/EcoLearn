import express from 'express';
import {
  createClass,
  getClassesByTeacher,
  getClassWithStudents,
  updateClass,
  deleteClass,
  getClassSummary
} from '../controllers/classController.js';
import { authenticateUser, authorizeRoles, verifyOwnership } from '../middleware/authMiddleware.js';

const classRouter = express.Router();

// Protect all routes
classRouter.use(authenticateUser);
classRouter.use(authorizeRoles('teacher', 'admin'));

// Create a new class
classRouter.post('/create', createClass);

// Get all classes by teacher ID with student counts
classRouter.get('/teacher/:teacherId', verifyOwnership, getClassesByTeacher);

// Get class summary (total classes and students)
classRouter.get('/summary/:teacherId', verifyOwnership, getClassSummary);

// Get a single class with its students
classRouter.get('/:classId/students', getClassWithStudents);

// Update a class
classRouter.put('/:classId', updateClass);

// Delete a class
classRouter.delete('/:classId', deleteClass);

export default classRouter;
