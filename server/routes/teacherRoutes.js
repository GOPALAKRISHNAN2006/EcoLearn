import express from 'express';
import multer from 'multer';
import { 
  teacherLogin,
  teacherRegister,
  createStudent, 
  importStudentsFromFile,
  importStudents,
  getStudentsByTeacher, 
  generateCredentials,
  deleteStudent,
  updateStudent,
  getStudentDetails
} from '../controllers/teacherController.js';
import { authenticateUser, authorizeRoles, verifyOwnership } from '../middleware/authMiddleware.js';

const teacherRouter = express.Router();

// Configure multer for file uploads (memory storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'application/vnd.ms-excel', // xls
      'text/csv',
      'application/csv'
    ];
    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls|csv)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel and CSV files are allowed'), false);
    }
  }
});

// Teacher authentication
teacherRouter.post('/login', teacherLogin);
teacherRouter.post('/register', teacherRegister);

// Protect all routes below this line
teacherRouter.use(authenticateUser);
teacherRouter.use(authorizeRoles('teacher', 'admin'));

// Teacher manages students
teacherRouter.post('/create-students', createStudent);
teacherRouter.post('/import-students-file', upload.single('file'), importStudentsFromFile);
teacherRouter.post('/import-students', importStudents);
teacherRouter.get('/students/:teacherId', verifyOwnership, getStudentsByTeacher);
teacherRouter.get('/student-details/:studentId', verifyOwnership, getStudentDetails);
teacherRouter.post('/generate-credentials', generateCredentials);
teacherRouter.delete('/students/:studentId', verifyOwnership, deleteStudent);
teacherRouter.put('/students/:studentId', verifyOwnership, updateStudent);

export default teacherRouter;
