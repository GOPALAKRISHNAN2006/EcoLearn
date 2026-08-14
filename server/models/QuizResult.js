import mongoose from "mongoose";

const quizResultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    studentEmail: {
      type: String,
      required: true,
    },
    syllabusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Syllabus",
      required: true,
    },
    syllabusTitle: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    timeTaken: {
      type: Number, // in seconds
      default: 0,
    },
    answers: [
      {
        questionIndex: Number,
        selectedAnswer: Number,
        isCorrect: Boolean,
      },
    ],
    passed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for leaderboard queries
quizResultSchema.index({ score: -1, completedAt: 1 });
quizResultSchema.index({ studentId: 1, syllabusId: 1 });
quizResultSchema.index({ grade: 1, score: -1 });

// Static method to get leaderboard
quizResultSchema.statics.getLeaderboard = async function (options = {}) {
  const { grade, subject, limit = 50 } = options;

  const matchStage = {};
  if (grade) matchStage.grade = grade;
  if (subject) matchStage.subject = subject;

  // Aggregate to get best score per student
  const leaderboard = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$studentId",
        studentName: { $first: "$studentName" },
        studentEmail: { $first: "$studentEmail" },
        grade: { $first: "$grade" },
        totalScore: { $sum: "$score" },
        quizzesCompleted: { $sum: 1 },
        averageScore: { $avg: "$score" },
        bestScore: { $max: "$score" },
        lastActivity: { $max: "$completedAt" },
      },
    },
    { $sort: { totalScore: -1, averageScore: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        studentId: "$_id",
        studentName: 1,
        studentEmail: 1,
        grade: 1,
        totalScore: { $round: ["$totalScore", 0] },
        quizzesCompleted: 1,
        averageScore: { $round: ["$averageScore", 1] },
        bestScore: 1,
        lastActivity: 1,
      },
    },
  ]);

  return leaderboard;
};

// Static method to get student's quiz history
quizResultSchema.statics.getStudentHistory = async function (studentId) {
  return this.find({ studentId }).sort({ completedAt: -1 }).lean();
};

// Check if student already completed this quiz
quizResultSchema.statics.hasCompletedQuiz = async function (
  studentId,
  syllabusId
) {
  const result = await this.findOne({ studentId, syllabusId });
  return !!result;
};

const QuizResult = mongoose.model("QuizResult", quizResultSchema);

export default QuizResult;
