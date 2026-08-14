import express from 'express';
import {
  createClass,
  getClassesByTeacher,
  getClassWithStudents,
  updateClass,
  deleteClass,
  getClassSummary
} from '../controllers/classController.js';

const classRouter = express.Router();

// Create a new class
classRouter.post('/create', createClass);

// Get all classes by teacher ID with student counts
classRouter.get('/teacher/:teacherId', getClassesByTeacher);

// Get class summary (total classes and students)
classRouter.get('/summary/:teacherId', getClassSummary);

// Get a single class with its students
classRouter.get('/:classId/students', getClassWithStudents);

// Update a class
classRouter.put('/:classId', updateClass);

// Delete a class
classRouter.delete('/:classId', deleteClass);

export default classRouter;
