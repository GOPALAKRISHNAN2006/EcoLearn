import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  role: { type: String, required: true, enum: ['student', 'teacher', 'admin'] },
  expiresAt: { type: Date, required: true }
}, {
  timestamps: true
});

// Auto-delete document after it expires (using MongoDB TTL index)
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

export default RefreshToken;
