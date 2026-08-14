import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    achievementId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['environment', 'learning', 'gaming', 'social', 'special'],
      required: true 
    },
    icon: { type: String, required: true }, // Emoji or icon name
    points: { type: Number, default: 0 }, // Points awarded for completing
    targetValue: { type: Number, required: true }, // Target to achieve (e.g., 100 trees)
    targetType: { 
      type: String, 
      enum: ['trees', 'missions', 'farms', 'videos', 'quizzes', 'games', 'days', 'points'],
      required: true 
    },
    rarity: {
      type: String,
      enum: ['common', 'rare', 'epic', 'legendary'],
      default: 'common'
    },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const Achievement = mongoose.model("Achievement", achievementSchema);

export default Achievement;
