import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    studentRollNumber: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    files: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
        fileSize: Number,
      },
    ],
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["submitted", "graded", "ai-graded", "late", "pending"],
      default: "submitted",
    },
    grade: {
      type: String,
      default: "",
    },
    score: {
      type: Number,
      default: null,
    },
    feedback: {
      type: String,
      default: "",
    },
    gradedAt: {
      type: Date,
      default: null,
    },
    gradedBy: {
      type: String,
      default: "",
    },
    pointsAwarded: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });
submissionSchema.index({ studentId: 1, status: 1 });

const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;
