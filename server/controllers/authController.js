import RefreshToken from '../models/RefreshToken.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwtHelper.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Admin from '../models/Admin.js';
import logger from '../config/logger.js';

// Refresh access token using rotation
export const refreshSession = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token missing.' });
    }

    // Find token in database
    const dbToken = await RefreshToken.findOne({ token: refreshToken });
    if (!dbToken || dbToken.expiresAt < new Date()) {
      if (dbToken) await RefreshToken.deleteOne({ _id: dbToken._id });
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      return res.status(401).json({ success: false, message: 'Invalid or expired session.' });
    }

    const decoded = verifyToken(refreshToken);
    if (!decoded) {
      await RefreshToken.deleteOne({ _id: dbToken._id });
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      return res.status(401).json({ success: false, message: 'Invalid session token.' });
    }

    // Get user details
    let user;
    if (dbToken.role === 'student') {
      user = await Student.findById(dbToken.userId);
    } else if (dbToken.role === 'teacher') {
      user = await Teacher.findById(dbToken.userId);
    } else if (dbToken.role === 'admin') {
      user = await Admin.findById(dbToken.userId);
    }

    if (!user) {
      await RefreshToken.deleteOne({ _id: dbToken._id });
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    // Prepare user object format for token generation
    const userPayload = {
      id: user._id,
      studentId: user.rollNumber,
      teacherId: user.teacherId,
      adminId: user.adminId,
      role: dbToken.role
    };

    // Rotate tokens
    const newAccessToken = generateAccessToken(userPayload);
    const newRefreshTokenString = generateRefreshToken(userPayload);

    // Update database (replace old refresh token)
    await RefreshToken.deleteOne({ _id: dbToken._id });
    await RefreshToken.create({
      token: newRefreshTokenString,
      userId: user._id.toString(),
      role: dbToken.role,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    // Set new cookie
    res.cookie('refreshToken', newRefreshTokenString, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      user: {
        id: user._id,
        name: user.name || user.Name,
        email: user.email,
        role: dbToken.role,
        ...(dbToken.role === 'student' ? { rollNumber: user.rollNumber, school: user.school, class: user.class, streak: user.streak, address: user.address, phone: user.phone, joiningDate: user.joiningDate, isFirstLogin: user.isFirstLogin } : {}),
        ...(dbToken.role === 'teacher' ? { teacherId: user.teacherId } : {}),
        ...(dbToken.role === 'admin' ? { adminId: user.adminId, schoolName: user.schoolName } : {})
      }
    });
  } catch (error) {
    next(error);
  }
};

// Logout session
export const logoutSession = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};
