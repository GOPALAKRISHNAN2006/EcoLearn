import mongoose from "mongoose";

// Quiz question schema (same as Syllabus)
const quizQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    options: [
      {
        type: String,
        required: true,
      },
    ],
    correctAnswer: {
      type: Number, // Index of correct option (0-3)
      required: true,
    },
    explanation: {
      type: String,
    },
  },
  { _id: false }
);

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  grade: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  // Video URL - can be YouTube URL, uploaded file URL, or any video URL
  videoUrl: {
    type: String,
    required: true,
  },
  // Thumbnail URL
  thumbnailUrl: {
    type: String,
  },
  // Video duration in seconds
  duration: {
    type: Number,
    default: 0,
  },
  // Video type - youtube, upload, external
  videoType: {
    type: String,
    enum: ["youtube", "upload", "external"],
    default: "external",
  },
  // Quiz with 10 questions
  quiz: {
    questions: {
      type: [quizQuestionSchema],
      validate: [
        (arr) => arr.length <= 10,
        "Quiz can have maximum 10 questions",
      ],
    },
    passingScore: {
      type: Number,
      default: 70, // 70% to pass
    },
    timeLimit: {
      type: Number,
      default: 600, // 10 minutes in seconds
    },
  },
  // Game to show after video (before quiz)
  gameType: {
    type: String,
    enum: ["snake-ladder", "eco-ninja", "word-search", "eco-puzzle", "none"],
    default: "snake-ladder",
  },
  // Points awarded for watching video
  watchPoints: {
    type: Number,
    default: 10,
  },
  // Points awarded for completing quiz
  quizPoints: {
    type: Number,
    default: 20,
  },
  // Points awarded for playing game
  gamePoints: {
    type: Number,
    default: 15,
  },
  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
videoSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Video = mongoose.model("Video", videoSchema);

export default Video;
