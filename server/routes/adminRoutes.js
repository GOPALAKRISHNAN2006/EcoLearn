import express from 'express';
import {
  loginAdmin,
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  createTeacher,
  getAllTeachers,
  getAllStudents,
  deleteTeacher,
  deleteStudent
} from '../controllers/adminController.js';

const adminRouter = express.Router();

// ============ ADMIN USER ROUTES ============
// POST /api/admin/user/login - Admin login
adminRouter.post('/user/login', loginAdmin);

// POST /api/admin/user - Create new admin
adminRouter.post('/user', createAdmin);

// GET /api/admin/user - Get all admins
adminRouter.get('/user', getAllAdmins);

// GET /api/admin/user/:id - Get admin by ID
adminRouter.get('/user/:id', getAdminById);

// PUT /api/admin/user/:id - Update admin
adminRouter.put('/user/:id', updateAdmin);

// DELETE /api/admin/user/:id - Delete admin
adminRouter.delete('/user/:id', deleteAdmin);

// ============ TEACHER MANAGEMENT ROUTES ============
// POST /api/admin/teacher - Create new teacher
adminRouter.post('/teacher', createTeacher);

// GET /api/admin/teacher - Get all teachers
adminRouter.get('/teacher', getAllTeachers);

// DELETE /api/admin/teacher/:id - Delete teacher
adminRouter.delete('/teacher/:id', deleteTeacher);

// ============ STUDENT MANAGEMENT ROUTES ============
// GET /api/admin/student - Get all students
adminRouter.get('/student', getAllStudents);

// DELETE /api/admin/student/:id - Delete student
adminRouter.delete('/student/:id', deleteStudent);

export default adminRouter;
