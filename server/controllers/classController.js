import Class from '../models/Class.js';
import Student from '../models/Student.js';

// Create a new class
export const createClass = async (req, res) => {
  try {
    const { grade, section, subject, teacherId, teacherName, description } = req.body;

    if (!grade || !section || !subject || !teacherId || !teacherName) {
      return res.status(400).json({
        success: false,
        message: 'Grade, section, subject, teacher ID, and teacher name are required'
      });
    }

    // Check if class already exists for this teacher
    const existingClass = await Class.findOne({ grade, section, subject, teacherId });
    if (existingClass) {
      return res.status(400).json({
        success: false,
        message: 'This class already exists'
      });
    }

    const newClass = await Class.create({
      grade,
      section,
      subject,
      teacherId,
      teacherName,
      description: description || ''
    });

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: {
        ...newClass.toObject(),
        totalStudents: 0
      }
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating class'
    });
  }
};

// Get all classes by teacher with student counts
export const getClassesByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID is required'
      });
    }

    const classes = await Class.getClassesWithStudentCount(teacherId);

    res.status(200).json({
      success: true,
      data: classes
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching classes'
    });
  }
};

// Get a single class with its students
export const getClassWithStudents = async (req, res) => {
  try {
    const { classId } = req.params;

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    const grade = classData.grade;
    const section = classData.section;

    // Build a very flexible regex to match various class naming patterns
    // Examples: "5", "5th", "5 A", "5th A", "5-A", "5th-A", "Grade 5", "Grade 5 A", "Class 5", etc.
    const gradePattern = grade.replace(/th|st|nd|rd/gi, ''); // Remove ordinal suffixes to get base number
    const regexPattern = new RegExp(`(^|grade|class)?\\s*${gradePattern}(th|st|nd|rd)?\\s*[-\\s]?${section}?`, 'i');

    // Find students matching the class
    const students = await Student.find({ 
      teacherId: classData.teacherId,
      class: regexPattern
    }).select('-passwordHash -plainPassword');

    res.status(200).json({
      success: true,
      data: {
        ...classData.toObject(),
        totalStudents: students.length,
        students
      }
    });
  } catch (error) {
    console.error('Get class with students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching class'
    });
  }
};

// Update class
export const updateClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { grade, section, subject, description } = req.body;

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Update class
    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { grade, section, subject, description },
      { new: true }
    );

    // Get updated student count using the new grade/section
    const studentCount = await Student.countDocuments({
      teacherId: updatedClass.teacherId,
      $or: [
        { class: `${updatedClass.grade}` },
        { class: `${updatedClass.grade} ${updatedClass.section}` },
        { class: `${updatedClass.grade}-${updatedClass.section}` },
        { class: `Grade ${updatedClass.grade} - Section ${updatedClass.section}` },
        { class: new RegExp(`^${updatedClass.grade}.*${updatedClass.section}$`, 'i') }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Class updated successfully',
      data: {
        ...updatedClass.toObject(),
        totalStudents: studentCount
      }
    });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating class'
    });
  }
};

// Delete class
export const deleteClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Check if there are students in this class
    const studentCount = await Student.countDocuments({
      class: classData.className,
      teacherId: classData.teacherId
    });

    if (studentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete class. ${studentCount} students are assigned to this class. Please reassign or remove them first.`
      });
    }

    await Class.findByIdAndDelete(classId);

    res.status(200).json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting class'
    });
  }
};

// Get class summary (total classes, total students per class)
export const getClassSummary = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const classes = await Class.getClassesWithStudentCount(teacherId);
    
    const totalStudents = classes.reduce((sum, cls) => sum + cls.totalStudents, 0);

    res.status(200).json({
      success: true,
      data: {
        totalClasses: classes.length,
        totalStudents,
        classes
      }
    });
  } catch (error) {
    console.error('Get class summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching class summary'
    });
  }
};
