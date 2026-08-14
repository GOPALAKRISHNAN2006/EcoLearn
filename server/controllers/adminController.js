import Admin from '../models/Admin.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import bcrypt from 'bcryptjs';

// Login admin
export const loginAdmin = async (req, res) => {
  try {
    const { adminId, password } = req.body;

    if (!adminId || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Admin ID and password are required' 
      });
    }

    const admin = await Admin.findOne({ adminId });

    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      });
    }

    // Plain password comparison (as requested)
    if (admin.password !== password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: admin._id,
        name: admin.name,
        adminId: admin.adminId,
        schoolName: admin.schoolName
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Create new admin
export const createAdmin = async (req, res) => {
  try {
    const { name, adminId, password, schoolName } = req.body;

    if (!name || !adminId || !password || !schoolName) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required: name, adminId, password, schoolName' 
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ adminId });
    if (existingAdmin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Admin with this ID already exists' 
      });
    }

    const newAdmin = new Admin({
      name,
      adminId,
      password, // Plain password
      schoolName
    });

    await newAdmin.save();

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: {
        id: newAdmin._id,
        name: newAdmin.name,
        adminId: newAdmin.adminId,
        schoolName: newAdmin.schoolName
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get all admins
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    
    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get admin by ID
export const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id).select('-password');

    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Update admin
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, adminId, password, schoolName } = req.body;

    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      });
    }

    // Check if new adminId is already taken by another admin
    if (adminId && adminId !== admin.adminId) {
      const existingAdmin = await Admin.findOne({ adminId });
      if (existingAdmin) {
        return res.status(400).json({ 
          success: false, 
          message: 'Admin ID already in use' 
        });
      }
    }

    if (name) admin.name = name;
    if (adminId) admin.adminId = adminId;
    if (password) admin.password = password;
    if (schoolName) admin.schoolName = schoolName;

    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Admin updated successfully',
      data: {
        id: admin._id,
        name: admin.name,
        adminId: admin.adminId,
        schoolName: admin.schoolName
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Delete admin
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findByIdAndDelete(id);

    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// ============ TEACHER MANAGEMENT BY ADMIN ============

// Create teacher (by admin)
export const createTeacher = async (req, res) => {
  try {
    const { name, email, phone, teacherId, password } = req.body;

    if (!name || !email || !phone || !teacherId || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required: name, email, phone, teacherId, password' 
      });
    }

    // Check if teacher already exists
    const existingTeacher = await Teacher.findOne({ 
      $or: [{ teacherId }, { email }, { phone }] 
    });
    
    if (existingTeacher) {
      return res.status(400).json({ 
        success: false, 
        message: 'Teacher with this ID, email, or phone already exists' 
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newTeacher = new Teacher({
      Name: name,
      email,
      phone,
      teacherId,
      password: hashedPassword
    });

    await newTeacher.save();

    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: {
        id: newTeacher._id,
        name: newTeacher.Name,
        email: newTeacher.email,
        phone: newTeacher.phone,
        teacherId: newTeacher.teacherId
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get all teachers (by admin)
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().select('-password');
    
    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get all students (by admin)
export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select('-passwordHash -plainPassword');
    
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Delete teacher (by admin)
export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findByIdAndDelete(id);

    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        message: 'Teacher not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Teacher deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Delete student (by admin)
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findByIdAndDelete(id);

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
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};
