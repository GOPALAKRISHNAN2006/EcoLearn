import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-extremely-long-secret-key-64-chars-long-for-local-development-only';

export const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      id: user.id || user._id, 
      userId: user.studentId || user.teacherId || user.adminId || user.rollNumber,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { 
      id: user.id || user._id, 
      userId: user.studentId || user.teacherId || user.adminId || user.rollNumber,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
