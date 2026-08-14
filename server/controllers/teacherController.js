import { validationResult } from 'express-validator';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import bcrypt from 'bcryptjs';
import xlsx from 'xlsx';

// Generate random password
const generateRandomPassword = (length = 8) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Teacher Login
export const teacherLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { teacherId, password } = req.body;
    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, teacher.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }


    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: teacher._id,
          Name: teacher.Name,
          teacherId: teacher.teacherId,
          email: teacher.email,
          role: 'teacher'
        }
      }
    });
  } catch (error) {
    console.error('Teacher login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
};

// Create student manually
export const createStudent = async (req, res) => {
  try {
    const { name, rollNumber, email, phone, address, school, studentClass, joiningDate, teacherId } = req.body;
    
    // Use studentClass or class from request body
    const classValue = studentClass || 'Default';

    // Validate required fields
    if (!name || !rollNumber || !email || !phone || !teacherId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: name, rollNumber, email, phone, and teacherId are required' 
      });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ rollNumber});
    
    if (existingStudent) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student already exists with this roll number' 
      });
    }

    // Generate password automatically
    const plainPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const student = await Student.create({
      name, rollNumber, email, phone, address, school, class: classValue,
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      teacherId,
      passwordHash: hashedPassword,
      plainPassword: plainPassword,
      credentialsGenerated: true
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: {
        ...student.toObject(),
        generatedPassword: plainPassword // Return password so teacher can share it
      }
    });

  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while creating student' 
    });
  }
};

// Import multiple students from CSV/Excel file
export const importStudentsFromFile = async (req, res) => {
  try {
    const { teacherId } = req.body;

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    if (!teacherId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Teacher ID is required' 
      });
    }

    // Parse the Excel/CSV file
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No data found in the file' 
      });
    }

    const results = {
      success: [],
      failed: []
    };

    for (const row of data) {
      try {
        // Trim all keys to handle leading/trailing spaces in column names
        const trimmedRow = {};
        for (const key in row) {
          trimmedRow[key.trim()] = row[key];
        }

        // Map column names (case-insensitive)
        const studentData = {
          name: trimmedRow.name || trimmedRow.Name || trimmedRow.NAME,
          rollNumber: String(trimmedRow.rollNumber || trimmedRow.RollNumber || trimmedRow.ROLLNUMBER || trimmedRow['Roll Number'] || ''),
          email: trimmedRow.email || trimmedRow.Email || trimmedRow.EMAIL,
          phone: String(trimmedRow.phone || trimmedRow.Phone || trimmedRow.PHONE || trimmedRow['Phone Number'] || ''),
          address: trimmedRow.address || trimmedRow.Address || trimmedRow.ADDRESS || '',
          school: trimmedRow.school || trimmedRow.School || trimmedRow.SCHOOL || '',
          studentClass: trimmedRow.class || trimmedRow.Class || trimmedRow.CLASS || 'Default',
          joiningDate: trimmedRow.joiningDate || trimmedRow.JoiningDate || trimmedRow['Joining Date'] || new Date()
        };

        if (!studentData.name || !studentData.rollNumber || !studentData.email) {
          results.failed.push({
            row: row,
            reason: 'Missing required fields (name, rollNumber, or email)'
          });
          continue;
        }

        const existingStudent = await Student.findOne({ rollNumber: studentData.rollNumber });

        if (existingStudent) {
          results.failed.push({
            rollNumber: studentData.rollNumber,
            reason: 'Student already exists with this roll number'
          });
          continue;
        }

        // Generate password automatically
        const plainPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const student = await Student.create({
          name: studentData.name,
          rollNumber: studentData.rollNumber,
          email: studentData.email,
          phone: studentData.phone,
          address: studentData.address,
          school: studentData.school,
          class: studentData.studentClass,
          joiningDate: studentData.joiningDate ? new Date(studentData.joiningDate) : new Date(),
          teacherId,
          passwordHash: hashedPassword,
          plainPassword: plainPassword,
          credentialsGenerated: true
        });

        results.success.push({
          _id: student._id,
          name: student.name,
          rollNumber: student.rollNumber,
          email: student.email,
          username: student.rollNumber,
          password: plainPassword
        });
      } catch (err) {
        console.error('Error creating student:', err);
        results.failed.push({
          row: row,
          reason: err.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Imported ${results.success.length} students. ${results.failed.length} failed.`,
      data: results,
      credentials: results.success // Include credentials for display
    });
  } catch (error) {
    console.error('Import students from file error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while importing students: ' + error.message 
    });
  }
};

// Import multiple students from JSON (parsed CSV from frontend)
export const importStudents = async (req, res) => {
  try {
    const { students, teacherId } = req.body;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No students data provided' 
      });
    }

    if (!teacherId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Teacher ID is required' 
      });
    }

    const results = {
      success: [],
      failed: []
    };

    for (const studentData of students) {
      try {
        const existingStudent = await Student.findOne({
          $or: [{ rollNumber: studentData.rollNumber }, { email: studentData.email }]
        });

        if (existingStudent) {
          results.failed.push({
            rollNumber: studentData.rollNumber,
            reason: 'Student already exists with this roll number or email'
          });
          continue;
        }

        // Generate password automatically
        const plainPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const student = await Student.create({
          name: studentData.name,
          rollNumber: studentData.rollNumber,
          email: studentData.email,
          phone: studentData.phone || '',
          address: studentData.address || '',
          school: studentData.school || '',
          class: studentData.studentClass || 'Default',
          joiningDate: studentData.joiningDate ? new Date(studentData.joiningDate) : new Date(),
          teacherId,
          passwordHash: hashedPassword,
          plainPassword: plainPassword,
          credentialsGenerated: true
        });

        results.success.push({
          _id: student._id,
          name: student.name,
          rollNumber: student.rollNumber,
          email: student.email,
          username: student.rollNumber,
          password: plainPassword
        });
      } catch (err) {
        results.failed.push({
          rollNumber: studentData.rollNumber,
          reason: err.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Imported ${results.success.length} students. ${results.failed.length} failed.`,
      data: results,
      credentials: results.success // Include credentials for display
    });
  } catch (error) {
    console.error('Import students error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while importing students' 
    });
  }
};

// Get all students by teacher ID
export const getStudentsByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const students = await Student.find({ teacherId }).select('-password');

    res.status(200).json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching students' 
    });
  }
};

// Generate credentials for selected students
export const generateCredentials = async (req, res) => {
  try {
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No student IDs provided' 
      });
    }

    const updatedStudents = [];

    for (const studentId of studentIds) {
      const student = await Student.findById(studentId);
      
      if (!student) continue;

      const plainPassword = generateRandomPassword();
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      await Student.findByIdAndUpdate(studentId, {
        passwordHash: hashedPassword,
        plainPassword: plainPassword,
        credentialsGenerated: true
      });

      updatedStudents.push({
        _id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        email: student.email,
        username: student.rollNumber,
        password: plainPassword
      });
    }

    res.status(200).json({
      success: true,
      message: `Generated credentials for ${updatedStudents.length} students`,
      data: updatedStudents
    });
  } catch (error) {
    console.error('Generate credentials error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while generating credentials' 
    });
  }
};

// Delete student
export const deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findByIdAndDelete(studentId);
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting student' 
    });
  }
};

// Update student
export const updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { name, email, phone, address, school, joiningDate } = req.body;

    const student = await Student.findByIdAndUpdate(
      studentId,
      { name, email, phone, address, school, joiningDate },
      { new: true }
    ).select('-password');
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating student' 
    });
  }
};

// Get detailed student information
export const getStudentDetails = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId)
      .select('-passwordHash -plainPassword')
      .populate('watchedVideos.syllabusId', 'title subject grade')
      .populate('completedQuizzes.syllabusId', 'title subject grade');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Calculate total points from different sources
    const totalPoints = student.points || 0;
    const gamePoints = student.gamePoints || 0;
    const lessonPoints = student.completedQuizzes.reduce((sum, quiz) => sum + (quiz.pointsAwarded || 0), 0);
    const videoPoints = student.watchedVideos.reduce((sum, video) => sum + (video.pointsEarned || 0), 0);

    // Calculate completed lessons
    const completedLessons = student.watchedVideos.length;
    const completedQuizzes = student.completedQuizzes.length;

    // Get last login from timestamps
    const lastLogin = student.updatedAt || student.createdAt;

    // Get learning hours
    const hoursLearned = student.hoursLearned || 0;

    // Recent activity (last 10 activities)
    const recentActivity = [];
    
    // Add completed quizzes
    student.completedQuizzes.slice(-5).forEach(quiz => {
      recentActivity.push({
        type: 'quiz',
        title: quiz.quizTitle || 'Quiz Completed',
        points: quiz.pointsAwarded,
        date: quiz.completedAt,
        score: quiz.score
      });
    });

    // Add watched videos
    student.watchedVideos.slice(-5).forEach(video => {
      recentActivity.push({
        type: 'video',
        title: video.syllabusId?.title || 'Video Watched',
        points: video.pointsEarned,
        date: video.watchedAt
      });
    });

    // Add games played
    student.gamesPlayed.slice(-5).forEach(game => {
      recentActivity.push({
        type: 'game',
        title: game.gameName || 'Game Played',
        points: game.pointsEarned,
        date: game.playedAt
      });
    });

    // Sort by date and take last 10
    recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
    const limitedActivity = recentActivity.slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        student: {
          _id: student._id,
          name: student.name,
          rollNumber: student.rollNumber,
          email: student.email,
          phone: student.phone,
          address: student.address,
          school: student.school,
          class: student.class,
          joiningDate: student.joiningDate,
          lastLogin: lastLogin,
        },
        stats: {
          totalPoints: totalPoints,
          gamePoints: gamePoints,
          lessonPoints: lessonPoints,
          videoPoints: videoPoints,
          hoursLearned: hoursLearned,
          completedLessons: completedLessons,
          completedQuizzes: completedQuizzes,
          gamesPlayed: student.gamesPlayed.length,
          level: student.level || 1,
          currentXP: student.currentXP || 0,
          nextLevelXP: student.nextLevelXP || 100,
          streak: student.streak || 0,
          badges: student.badges.length,
        },
        recentActivity: limitedActivity,
        badges: student.badges,
        achievements: student.achievements,
        completedLessons: student.watchedVideos.map(video => ({
          title: video.syllabusId?.title || 'Unknown Lesson',
          subject: video.syllabusId?.subject,
          grade: video.syllabusId?.grade,
          watchedAt: video.watchedAt,
          pointsEarned: video.pointsEarned
        })),
        completedQuizzes: student.completedQuizzes.map(quiz => ({
          title: quiz.quizTitle,
          score: quiz.score,
          pointsAwarded: quiz.pointsAwarded,
          completedAt: quiz.completedAt
        })),
        gamesPlayed: student.gamesPlayed.map(game => ({
          gameName: game.gameName,
          pointsEarned: game.pointsEarned,
          playedAt: game.playedAt
        }))
      }
    });
  } catch (error) {
    console.error('Get student details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student details'
    });
  }
};