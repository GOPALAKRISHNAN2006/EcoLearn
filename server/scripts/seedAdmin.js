import mongoose from 'mongoose';
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

// Admin Schema
const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  adminId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  schoolName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

const seedAdmin = async () => {
  await connectDB();

  try {
    console.log('Creating demo admin...\n');

    // Create demo admin with plain password (as per existing implementation)
    const existingAdmin = await Admin.findOne({ adminId: 'admin001' });
    
    if (!existingAdmin) {
      await Admin.create({
        name: 'Admin User',
        adminId: 'admin001',
        password: 'admin123', // Plain password as per existing controller
        schoolName: 'EcoLearn School'
      });
      console.log('✅ Demo Admin created:');
      console.log('   Admin ID: admin001');
      console.log('   Password: admin123\n');
    } else {
      // Update password if admin exists
      await Admin.updateOne({ adminId: 'admin001' }, { password: 'admin123' });
      console.log('✅ Demo Admin already exists (password updated):');
      console.log('   Admin ID: admin001');
      console.log('   Password: admin123\n');
    }

    console.log('========================================');
    console.log('Admin credentials summary:');
    console.log('========================================');
    console.log('ADMIN LOGIN:');
    console.log('  Admin ID: admin001');
    console.log('  Password: admin123');
    console.log('========================================');

  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  }
};

seedAdmin();
