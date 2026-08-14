import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  submitAssignment,
  getStudentSubmissions,
  getAssignmentSubmissions,
  gradeSubmission,
  checkSubmission,
  getStudentAssignmentsWithStatus
} from '../controllers/submissionController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for assignment file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/assignments'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept videos, images, documents
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp4|mov|avi|mkv|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only video, image, and document files are allowed!'));
    }
  },
});

// Submit an assignment with file uploads
router.post('/submit', (req, res, next) => {
  upload.array('files', 10)(req, res, (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      return res.status(400).json({ message: err.message });
    }
    console.log('Files received by multer:', req.files?.length || 0);
    next();
  });
}, submitAssignment);

// Get all submissions for a student
router.get('/student/:studentId', getStudentSubmissions);

// Get all submissions for an assignment
router.get('/assignment/:assignmentId', getAssignmentSubmissions);

// Get student assignments with submission status
router.get('/student/:studentId/class/:grade/:section', getStudentAssignmentsWithStatus);

// Check if student has submitted an assignment
router.get('/check/:assignmentId/:studentId', checkSubmission);

// Grade a submission
router.put('/grade/:submissionId', gradeSubmission);

export default router;