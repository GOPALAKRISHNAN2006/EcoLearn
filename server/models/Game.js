import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  difficulty: { 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  duration: { 
    type: String, 
    required: true 
  },
  points: { 
    type: Number, 
    default: 50 
  },
  icon: { 
    type: String, 
    default: 'Gamepad2' 
  },
  category: { 
    type: String, 
    required: true 
  },
  route: { 
    type: String, 
    required: true,
    unique: true
  },
  // Classes that can access this game (e.g., ["6th", "7th", "8th"])
  // Empty array means available to all classes
  allowedClasses: [{
    type: String
  }],
  isActive: { 
    type: Boolean, 
    default: true 
  },
  order: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Index for faster queries
gameSchema.index({ allowedClasses: 1 });
gameSchema.index({ isActive: 1 });

// Static method to get games for a specific class
gameSchema.statics.getGamesForClass = async function(studentClass) {
  // Normalize class format (e.g., "6th", "6", "Grade 6" -> "6")
  const normalizedClass = studentClass.replace(/[^0-9]/g, '');
  
  return this.find({
    isActive: true,
    $or: [
      { allowedClasses: { $size: 0 } }, // Games available to all
      { allowedClasses: { $in: [studentClass, normalizedClass, `${normalizedClass}th`, `Grade ${normalizedClass}`] } }
    ]
  }).sort({ order: 1, title: 1 });
};

const Game = mongoose.model('Game', gameSchema);

export default Game;
