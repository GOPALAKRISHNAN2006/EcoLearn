import mongoose from 'mongoose';

const aiStatsSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    unique: true
  },
  questionsAsked: {
    type: Number,
    default: 0
  },
  topicsExplored: [{
    topic: String,
    count: Number,
    lastAsked: Date
  }],
  learningStreak: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: Date,
    default: Date.now
  },
  totalInteractions: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const AIStats = mongoose.model('AIStats', aiStatsSchema);

export default AIStats;
