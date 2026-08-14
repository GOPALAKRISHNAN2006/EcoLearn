import mongoose from "mongoose";

// Quiz question schema
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

const syllabusSchema = new mongoose.Schema({
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
  content: {
    type: String,
    required: true,
  },
  topics: [
    {
      topicName: String,
      description: String,
      duration: String,
    },
  ],
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
  generatedPrompt: {
    type: String,
  },
  videoGenerationStatus: {
    type: String,
    enum: ["pending", "generating", "completed", "failed", "demo"],
    default: "pending",
  },
  videoUrl: {
    type: String,
  },
  videoTaskId: {
    type: String,
  },
  thumbnailUrl: {
    type: String,
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

syllabusSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Syllabus = mongoose.model("Syllabus", syllabusSchema);

export default Syllabus;
