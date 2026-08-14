import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  teacherId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' }, // optional
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;
