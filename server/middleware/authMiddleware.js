import { verifyToken } from '../utils/jwtHelper.js';
import logger from '../config/logger.js';
import Student from '../models/Student.js';

// Authenticate JWT Access Token
export const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    logger.warn(`Failed token verification attempt from IP: ${req.ip}`);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }

  req.user = decoded;
  next();
};

// Restrict access by user role
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt by user: ${req.user?.userId} (role: ${req.user?.role}) on ${req.originalUrl}`);
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. You do not have permission.'
      });
    }
    next();
  };
};

// Verify resource ownership:
// - Admin has master access
// - Teacher can access/manage their own profile or their own students
// - Student can only access/manage their own profile/records
export const verifyOwnership = async (req, res, next) => {
  const { id: tokenUserId, userId: tokenUserIdVal, role } = req.user;
  const paramStudentId = req.params.studentId || req.body.studentId;
  const paramTeacherId = req.params.teacherId || req.body.teacherId;

  if (role === 'admin') {
    return next();
  }

  // Teacher ownership checks
  if (role === 'teacher') {
    // If the request targets a specific teacher resource
    if (paramTeacherId && paramTeacherId !== tokenUserIdVal && paramTeacherId !== tokenUserId) {
      return res.status(403).json({ success: false, message: 'Access denied. Resource belongs to another teacher.' });
    }

    // If the request targets a student resource, check if the student belongs to this teacher
    if (paramStudentId) {
      try {
        const student = await Student.findById(paramStudentId) || await Student.findOne({ rollNumber: paramStudentId });
        if (student && student.teacherId !== tokenUserIdVal && student.teacherId !== tokenUserId) {
          return res.status(403).json({ success: false, message: 'Access denied. Student belongs to another teacher.' });
        }
      } catch (err) {
        logger.error(`Error in verifyOwnership student check: ${err.message}`);
      }
    }
    return next();
  }

  // Student ownership checks
  if (role === 'student') {
    if (paramStudentId && paramStudentId !== tokenUserIdVal && paramStudentId !== tokenUserId) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only access your own profile.' });
    }
    return next();
  }

  return res.status(403).json({ success: false, message: 'Access denied. Unknown role.' });
};
