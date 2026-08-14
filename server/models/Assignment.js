import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  subject: {
    type: String,
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  className: {
    type: String,
    required: true
  },
  maxPoints: {
    type: Number,
    default: 100
  },
  type: {
    type: String,
    enum: ['traditional', 'land-pollution', 'air-pollution', 'water-pollution'],
    default: 'traditional'
  },
  dueDate: {
    type: Date,
    required: true
  },
  totalStudents: {
    type: Number,
    default: 0
  },
  submissions: {
    type: Number,
    default: 0
  },
  avgScore: {
    type: Number,
    default: 0
  },
  expectedAnswer: {
    type: String,
    default: ''
  },
  keyPoints: [{
    type: String
  }],
  enableAIGrading: {
    type: Boolean,
    default: true
  },
  // Pollution Project fields
  requireLocation: {
    type: Boolean,
    default: false
  },
  requireVideoDuration: {
    type: Boolean,
    default: false
  },
  minVideoDuration: {
    type: Number,
    default: 2
  },
  maxVideoDuration: {
    type: Number,
    default: 5
  },
  projectInstructions: {
    type: String,
    default: ''
  },
  locationInstructions: {
    type: String,
    default: ''
  },
  teacherId: {
    type: String,
    required: true
  },
  teacherName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'closed'],
    default: 'published'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
assignmentSchema.index({ classId: 1, teacherId: 1 });
assignmentSchema.index({ teacherId: 1, status: 1 });

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;