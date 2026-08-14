import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecolearn');
    console.log('Database Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Teacher Schema
const teacherSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  teacherId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  password: { type: String, required: true }
}, { timestamps: true });

// Student Schema
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  school: { type: String },
  class: { type: String },
  joiningDate: { type: Date, default: Date.now },
  teacherId: { type: String },
  passwordHash: { type: String },
  plainPassword: { type: String },
  credentialsGenerated: { type: Boolean, default: false }
}, { timestamps: true });

const Teacher = mongoose.model('Teacher', teacherSchema);
const Student = mongoose.model('Student', studentSchema);

const seedData = async () => {
  await connectDB();

  try {
    // Clear existing demo data (optional)
    console.log('Creating demo users...\n');

    // Create demo teacher
    const teacherPassword = await bcrypt.hash('teacher123', 10);
    
    const existingTeacher = await Teacher.findOne({ teacherId: 'TEACH001' });
    if (!existingTeacher) {
      await Teacher.create({
        Name: 'Demo Teacher',
        teacherId: 'TEACH001',
        email: 'teacher@ecolearn.com',
        password: teacherPassword
      });
      console.log('✅ Demo Teacher created:');
      console.log('   Teacher ID: TEACH001');
      console.log('   Password: teacher123\n');
    } else {
      // Update password if teacher exists
      await Teacher.updateOne({ teacherId: 'TEACH001' }, { password: teacherPassword });
      console.log('✅ Demo Teacher already exists (password updated):');
      console.log('   Teacher ID: TEACH001');
      console.log('   Password: teacher123\n');
    }

    // Create demo student
    const studentPassword = await bcrypt.hash('student123', 10);
    
    const existingStudent = await Student.findOne({ rollNumber: 'STU001' });
    if (!existingStudent) {
      await Student.create({
        name: 'Demo Student',
        rollNumber: 'STU001',
        email: 'student@ecolearn.com',
        phone: '1234567890',
        address: 'Demo Address',
        school: 'Demo School',
        class: '10th',
        teacherId: 'TEACH001',
        passwordHash: studentPassword,
        plainPassword: 'student123',
        credentialsGenerated: true
      });
      console.log('✅ Demo Student created:');
      console.log('   Roll Number: STU001');
      console.log('   Password: student123\n');
    } else {
      // Update password if student exists
      await Student.updateOne({ rollNumber: 'STU001' }, { 
        passwordHash: studentPassword,
        plainPassword: 'student123',
        credentialsGenerated: true 
      });
      console.log('✅ Demo Student already exists (password updated):');
      console.log('   Roll Number: STU001');
      console.log('   Password: student123\n');
    }

    console.log('========================================');
    console.log('Demo credentials summary:');
    console.log('========================================');
    console.log('TEACHER LOGIN:');
    console.log('  Username: TEACH001');
    console.log('  Password: teacher123');
    console.log('');
    console.log('STUDENT LOGIN:');
    console.log('  Username: STU001');
    console.log('  Password: student123');
    console.log('========================================');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  }
};

seedData();
