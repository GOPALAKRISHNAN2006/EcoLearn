import Submission from "../models/Submission.js";
import Assignment from "../models/Assignment.js";
import Student from "../models/Student.js";
import aiGradingService from "../services/aiGradingService.js";

// Helper function to award points based on grade
const awardAssignmentPoints = async (studentId, grade, score) => {
  try {
    const student = await Student.findById(studentId);
    if (!student) return null;

    // Points based on grade
    let pointsAwarded = 0;
    switch (grade) {
      case "A+":
        pointsAwarded = 100;
        break;
      case "A":
        pointsAwarded = 90;
        break;
      case "A-":
        pointsAwarded = 85;
        break;
      case "B+":
        pointsAwarded = 80;
        break;
      case "B":
        pointsAwarded = 75;
        break;
      case "B-":
        pointsAwarded = 70;
        break;
      case "C+":
        pointsAwarded = 65;
        break;
      case "C":
        pointsAwarded = 60;
        break;
      case "C-":
        pointsAwarded = 55;
        break;
      case "D+":
        pointsAwarded = 50;
        break;
      case "D":
        pointsAwarded = 45;
        break;
      case "D-":
        pointsAwarded = 40;
        break;
      case "F":
        pointsAwarded = 10;
        break;
      default:
        pointsAwarded = Math.round(score / 2); // Fallback based on score
    }

    const today = new Date().toDateString();
    const lastPointsDate = student.lastPointsDate
      ? new Date(student.lastPointsDate).toDateString()
      : null;

    // Reset daily points if it's a new day
    if (lastPointsDate !== today) {
      student.todayPoints = 0;
    }

    // Update points
    student.points = (student.points || 0) + pointsAwarded;
    student.todayPoints = (student.todayPoints || 0) + pointsAwarded;
    student.lastPointsDate = new Date();

    // Update XP (1:1 ratio)
    student.currentXP = (student.currentXP || 0) + pointsAwarded;

    // Check for level up
    while (student.currentXP >= (student.nextLevelXP || 100)) {
      student.currentXP -= student.nextLevelXP;
      student.level = (student.level || 1) + 1;
      student.nextLevelXP = Math.floor((student.nextLevelXP || 100) * 1.5);
    }

    await student.save();
    return { pointsAwarded, totalPoints: student.points, level: student.level };
  } catch (error) {
    console.error("Error awarding assignment points:", error);
    return null;
  }
};

// Submit an assignment with AI grading
export const submitAssignment = async (req, res) => {
  try {
    console.log('=== SUBMISSION REQUEST ===');
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    console.log('========================');
    
    const {
      assignmentId,
      studentId,
      studentName,
      studentRollNumber,
      content,
    } = req.body;

    // Handle uploaded files from multer
    const uploadedFiles = req.files ? req.files.map(file => {
      console.log('Processing uploaded file:', {
        originalName: file.originalname,
        savedAs: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype
      });
      return {
        fileName: `${file.originalname}`,
        fileUrl: `/uploads/assignments/${file.filename}`,
        fileType: file.mimetype,
        fileSize: file.size
      };
    }) : [];
    
    console.log('Total files processed:', uploadedFiles.length);
    
    if (uploadedFiles.length === 0 && !content) {
      console.log('WARNING: No files or content submitted');
    }

    // Check if assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      assignmentId,
      studentId,
    });
    if (existingSubmission) {
      return res
        .status(400)
        .json({ message: "You have already submitted this assignment" });
    }

    // Check if submission is late
    const isLate = new Date() > new Date(assignment.dueDate);

    // Create initial submission
    const submission = new Submission({
      assignmentId,
      studentId,
      studentName,
      studentRollNumber,
      content,
      files: uploadedFiles,
      status: isLate ? "late" : "submitted",
    });

    await submission.save();

    // Update assignment submission count
    await Assignment.findByIdAndUpdate(assignmentId, {
      $inc: { submissions: 1 },
    });

    // AI Grading (if enabled and content exists)
    let aiGradingResult = null;
    
    console.log('AI Grading check:', {
      enableAIGrading: assignment.enableAIGrading,
      hasContent: !!content,
      contentLength: content?.trim().length || 0,
      willGrade: assignment.enableAIGrading !== false && content && content.trim().length > 10
    });
    
    if (
      assignment.enableAIGrading !== false &&
      content &&
      content.trim().length > 10
    ) {
      try {
        console.log("Starting AI grading for submission:", submission._id);

        // Get previous submissions for uniqueness comparison
        const previousSubmissions = await Submission.find({
          assignmentId,
          _id: { $ne: submission._id },
        })
          .select("content")
          .limit(10);

        // Run AI grading
        aiGradingResult = await aiGradingService.gradeAssignment(
          content,
          assignment,
          previousSubmissions
        );

        if (aiGradingResult.success) {
          // Update submission with AI grading results
          submission.status = "ai-graded";
          submission.grade = aiGradingResult.grade;
          submission.score = aiGradingResult.score;
          submission.feedback = aiGradingResult.feedback || "";
          submission.gradedAt = new Date();
          submission.gradedBy = "AI Auto-Grader";

          // Map AI grading result to submission model structure
          submission.aiGrading = {
            isGraded: true,
            gradedAt: new Date(),
            scores: aiGradingResult.aiGrading?.scores || {},
            analysis: {
              isCorrect: aiGradingResult.aiGrading?.analysis?.isCorrect,
              wrongFacts: aiGradingResult.aiGrading?.analysis?.wrongFacts || [],
              keyPointsCovered:
                aiGradingResult.aiGrading?.analysis?.keyPointsCovered || [],
              keyPointsMissing:
                aiGradingResult.aiGrading?.analysis?.keyPointsMissing || [],
              strengths: aiGradingResult.aiGrading?.analysis?.strengths || [],
              improvements:
                aiGradingResult.aiGrading?.analysis?.improvements || [],
              topicMatch: aiGradingResult.aiGrading?.analysis?.topicMatch || "",
            },
            flags: aiGradingResult.aiGrading?.flags || [],
            studentFeedback: aiGradingResult.feedback || "",
            confidence: aiGradingResult.aiGrading?.confidence || 0,
          };

          await submission.save();

          // Update assignment average score
          const allGradedSubmissions = await Submission.find({
            assignmentId,
            score: { $ne: null },
          });

          if (allGradedSubmissions.length > 0) {
            const totalScore = allGradedSubmissions.reduce(
              (sum, sub) => sum + (sub.score || 0),
              0
            );
            const avgScore = totalScore / allGradedSubmissions.length;

            await Assignment.findByIdAndUpdate(assignmentId, {
              avgScore: Math.round(avgScore * 10) / 10,
            });
          }

          // Award points to student based on grade
          const pointsResult = await awardAssignmentPoints(
            studentId,
            aiGradingResult.grade,
            aiGradingResult.score
          );
          if (pointsResult) {
            submission.pointsAwarded = pointsResult.pointsAwarded;
            await submission.save();
          }

          console.log(
            "AI grading completed. Grade:",
            aiGradingResult.grade,
            "Score:",
            aiGradingResult.score,
            "Points:",
            pointsResult?.pointsAwarded
          );
        }
      } catch (aiError) {
        console.error("AI grading error:", aiError);
        // Don't fail the submission if AI grading fails
        submission.aiGrading = {
          isGraded: false,
          flags: [
            {
              type: "grading_error",
              severity: "medium",
              message:
                "AI grading temporarily unavailable. Teacher will grade manually.",
            },
          ],
        };
        await submission.save();
      }
    }

    res.status(201).json({
      message: "Assignment submitted successfully",
      submission,
      aiGrading: aiGradingResult
        ? {
            graded: aiGradingResult.success,
            grade: aiGradingResult.grade,
            score: aiGradingResult.score,
            maxPoints: aiGradingResult.maxPoints,
            feedback:
              aiGradingResult.feedback || aiGradingResult.aiGrading?.feedback,
            scores: aiGradingResult.aiGrading?.scores,
            analysis: aiGradingResult.aiGrading?.analysis,
            pointsAwarded: submission.pointsAwarded || 0,
          }
        : null,
    });
  } catch (error) {
    console.error("Error submitting assignment:", error);
    res
      .status(500)
      .json({ message: "Error submitting assignment", error: error.message });
  }
};

// Get all submissions for a student
export const getStudentSubmissions = async (req, res) => {
  try {
    const { studentId } = req.params;

    const submissions = await Submission.find({ studentId })
      .populate("assignmentId")
      .sort({ submittedAt: -1 });

    res.status(200).json(submissions);
  } catch (error) {
    console.error("Error fetching student submissions:", error);
    res
      .status(500)
      .json({ message: "Error fetching submissions", error: error.message });
  }
};

// Get all submissions for an assignment
export const getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const submissions = await Submission.find({ assignmentId }).sort({
      submittedAt: -1,
    });

    res.status(200).json(submissions);
  } catch (error) {
    console.error("Error fetching assignment submissions:", error);
    res
      .status(500)
      .json({ message: "Error fetching submissions", error: error.message });
  }
};

// Grade a submission
export const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, score, feedback, gradedBy } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      submissionId,
      {
        grade,
        score,
        feedback,
        gradedBy,
        status: "graded",
        gradedAt: new Date(),
      },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Update assignment average score
    const allSubmissions = await Submission.find({
      assignmentId: submission.assignmentId,
      status: "graded",
      score: { $ne: null },
    });

    if (allSubmissions.length > 0) {
      const totalScore = allSubmissions.reduce(
        (sum, sub) => sum + (sub.score || 0),
        0
      );
      const avgScore = totalScore / allSubmissions.length;

      await Assignment.findByIdAndUpdate(submission.assignmentId, {
        avgScore: Math.round(avgScore * 10) / 10,
      });
    }

    res.status(200).json({
      message: "Submission graded successfully",
      submission,
    });
  } catch (error) {
    console.error("Error grading submission:", error);
    res
      .status(500)
      .json({ message: "Error grading submission", error: error.message });
  }
};

// Check if student has submitted an assignment
export const checkSubmission = async (req, res) => {
  try {
    const { assignmentId, studentId } = req.params;

    const submission = await Submission.findOne({ assignmentId, studentId });

    res.status(200).json({
      hasSubmitted: !!submission,
      submission: submission || null,
    });
  } catch (error) {
    console.error("Error checking submission:", error);
    res
      .status(500)
      .json({ message: "Error checking submission", error: error.message });
  }
};

// Get student's assignments with submission status
export const getStudentAssignmentsWithStatus = async (req, res) => {
  try {
    const { studentId, grade, section } = req.params;

    // Build multiple possible className formats to match
    // Student class format: "5-A"
    // Assignment className format could be: "Grade 5th - Section A" or "5-A"
    const simpleClassName = `${grade}-${section}`;

    // Convert grade number to ordinal (5 -> 5th, 1 -> 1st, etc.)
    const getOrdinal = (n) => {
      const num = parseInt(n);
      if (num === 1) return "1st";
      if (num === 2) return "2nd";
      if (num === 3) return "3rd";
      return `${num}th`;
    };

    const fullClassName = `Grade ${getOrdinal(grade)} - Section ${section}`;

    // Get all assignments for this class (match either format)
    const assignments = await Assignment.find({
      $or: [
        { className: simpleClassName },
        { className: fullClassName },
        { className: { $regex: new RegExp(`${grade}.*${section}`, "i") } },
      ],
      status: "published",
    }).sort({ dueDate: 1 });

    // Get all submissions by this student
    const submissions = await Submission.find({ studentId });
    const submissionMap = {};
    submissions.forEach((sub) => {
      submissionMap[sub.assignmentId.toString()] = sub;
    });

    // Combine assignments with submission status
    const assignmentsWithStatus = assignments.map((assignment) => {
      const submission = submissionMap[assignment._id.toString()];
      const dueDate = new Date(assignment.dueDate);
      const now = new Date();
      const isPastDue = now > dueDate;

      return {
        _id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        subject: assignment.subject,
        className: assignment.className,
        maxPoints: assignment.maxPoints,
        type: assignment.type,
        dueDate: assignment.dueDate,
        teacherName: assignment.teacherName,
        isPastDue,
        hasSubmitted: !!submission,
        submission: submission
          ? {
              _id: submission._id,
              submittedAt: submission.submittedAt,
              status: submission.status,
              grade: submission.grade,
              score: submission.score,
              feedback: submission.feedback,
              aiGrading: submission.aiGrading,
            }
          : null,
      };
    });

    res.status(200).json(assignmentsWithStatus);
  } catch (error) {
    console.error("Error fetching student assignments:", error);
    res
      .status(500)
      .json({ message: "Error fetching assignments", error: error.message });
  }
};