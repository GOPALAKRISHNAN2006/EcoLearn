import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import connectDB from './config/database.js';
import studentRoutes from './routes/studentRouter.js';
import teacherRouter from './routes/teacherRoutes.js';
import classRouter from './routes/classRoutes.js';
import assignmentRouter from './routes/assignmentRoutes.js';
import submissionRouter from './routes/submissionRoutes.js';
import aiChatRouter from './routes/aiChatRoutes.js';
import videoRouter from './routes/videoRoutes.js';
import syllabusRouter from './routes/syllabusRoutes.js';
import gameRouter from './routes/gameRoutes.js';
import achievementRouter from './routes/achievementRoutes.js';
import videoLessonRouter from './routes/videoLessonRoutes.js';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import cookieParser from 'cookie-parser';
import logger from './config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import adminRouter from './routes/adminRoutes.js';
import Admin from './models/Admin.js';
import authRouter from './routes/authRoutes.js';

const app = express();
const port = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads/assignments');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create videos uploads directory
const videosDir = path.join(__dirname, 'uploads/videos');
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

await connectDB();

// Auto-seed default admin if database is empty
try {
  const adminCount = await Admin.countDocuments();
  if (adminCount === 0) {
    await Admin.create({
      name: 'Admin User',
      adminId: 'admin001',
      password: 'admin123',
      schoolName: 'EcoLearn School'
    });
    console.log('✅ Auto-seeded default admin user (admin001) for production');
  }
} catch (error) {
  console.error('Error auto-seeding admin:', error);
}

// Security Middleware Configuration
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "*"],
      connectSrc: ["'self'", "*"],
      mediaSrc: ["'self'", "data:", "blob:", "*"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    }
  } : false
}));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  optionsSuccessStatus: 200
}));

// Parsers & Sanitisers
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize());
app.use(xss());

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  limit: 100, // 100 requests per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit hit: ${req.ip} -> ${req.originalUrl}`);
    res.status(options.statusCode).json(options.message);
  }
});
app.use(globalLimiter);

// Specific Auth Limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10, // 10 attempts
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again in 15 minutes.' },
  handler: (req, res, next, options) => {
    logger.warn(`Auth Rate limit hit: ${req.ip} -> ${req.originalUrl}`);
    res.status(options.statusCode).json(options.message);
  }
});

// Apply auth rate limiters to all login / register routes
app.use('/api/student/login', authLimiter);
app.use('/api/teacher/login', authLimiter);
app.use('/api/teacher/register', authLimiter);
app.use('/api/admin/user/login', authLimiter);

// Serve uploaded files with proper headers
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => res.send("API is Working"));

// Debug endpoint to list uploaded files
app.get('/api/files/list', (req, res) => {
  const uploadsPath = path.join(__dirname, 'uploads/assignments');
  fs.readdir(uploadsPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ files, path: uploadsPath });
  });
});

app.use('/api/auth', authRouter);
app.use('/api/teacher', teacherRouter);
app.use('/api/student', studentRoutes);
app.use('/api/class', classRouter);
app.use('/api/assignment', assignmentRouter);
app.use('/api/submission', submissionRouter);
app.use('/api/ai-chat', aiChatRouter);
app.use('/api/video', videoRouter);
app.use('/api/admin', adminRouter);
app.use('/api/syllabus', syllabusRouter);
app.use('/api/game', gameRouter);
app.use('/api/achievement', achievementRouter);
app.use('/api/video-lesson', videoLessonRouter);

// Central Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  if (process.env.NODE_ENV === 'production') {
    return res.status(err.status || 500).json({
      success: false,
      message: 'An internal server error occurred'
    });
  }
  return res.status(err.status || 500).json({
    success: false,
    message: err.message,
    stack: err.stack
  });
});

app.listen(port, '0.0.0.0', ()=>{
    console.log(`Server is running on port ${port}`)
})