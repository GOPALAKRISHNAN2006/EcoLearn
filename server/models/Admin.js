import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  adminId: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Plain password for now
  schoolName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
