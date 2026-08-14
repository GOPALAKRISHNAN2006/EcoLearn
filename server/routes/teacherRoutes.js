import express from 'express';
import multer from 'multer';
import { 
  teacherLogin, 
  createStudent, 
  importStudentsFromFile, 
  getStudentsByTeacher, 
  generateCredentials,
  deleteStudent,
  updateStudent,
  getStudentDetails
} from '../controllers/teacherController.js';

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
// teacherRouter.post('/register', teacherRegister);

// Teacher manages students
teacherRouter.post('/create-students', createStudent);
teacherRouter.post('/import-students-file', upload.single('file'), importStudentsFromFile);
teacherRouter.get('/students/:teacherId', getStudentsByTeacher);
teacherRouter.get('/student-details/:studentId', getStudentDetails);
teacherRouter.post('/generate-credentials', generateCredentials);
teacherRouter.delete('/students/:studentId', deleteStudent);
teacherRouter.put('/students/:studentId', updateStudent);

export default teacherRouter;
