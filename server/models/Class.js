import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  grade: {
    type: String,
    required: true,
    trim: true
  },
  section: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  teacherId: {
    type: String,
    required: true
  },
  teacherName: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound unique index for grade + section + subject + teacherId
classSchema.index({ grade: 1, section: 1, subject: 1, teacherId: 1 }, { unique: true });

// Static method to get class with student count
classSchema.statics.getClassesWithStudentCount = async function(teacherId) {
  const classes = await this.find({ teacherId }).lean();
  
  const Student = mongoose.model('Student');
  
  const classesWithCount = await Promise.all(
    classes.map(async (cls) => {
      // Match students where class contains grade and section
      // Student class field could be: "10th", "10th A", "Grade 10 - Section A", etc.
      const studentCount = await Student.countDocuments({ 
        teacherId: teacherId,
        $or: [
          { class: `${cls.grade}` },
          { class: `${cls.grade} ${cls.section}` },
          { class: `${cls.grade}-${cls.section}` },
          { class: `Grade ${cls.grade} - Section ${cls.section}` },
          { class: new RegExp(`^${cls.grade}.*${cls.section}$`, 'i') }
        ]
      });
      return {
        ...cls,
        totalStudents: studentCount
      };
    })
  );
  
  return classesWithCount;
};

const Class = mongoose.model('Class', classSchema);

export default Class;
