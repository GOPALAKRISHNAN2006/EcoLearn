import Video from "../models/Video.js";
import Student from "../models/Student.js";
import aiService from "../services/aiGradingService.js";

// Generate quiz using AI based on title and description
export const generateQuiz = async (req, res) => {
  try {
    const { title, description, subject, grade } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required to generate quiz",
      });
    }

    console.log("Generating quiz for:", title, description);

    // Use the AI service to generate quiz (same format as syllabus)
    const result = await aiService.generateQuizFromSyllabus({
      title: title,
      subject: subject || "Environmental Science",
      grade: grade || "Grade 5",
      content: description || "",
      description: description || "",
      topics: [],
    });

    if (result.success && result.quiz) {
      return res.status(200).json({
        success: true,
        message: "Quiz generated successfully",
        data: result.quiz,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to generate quiz",
        error: result.error || "AI service returned no quiz",
      });
    }
  } catch (error) {
    console.error("Generate quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Server error generating quiz",
      error: error.message,
    });
  }
};

// Create a new video lesson
export const createVideo = async (req, res) => {
  try {
    const {
      title,
      subject,
      grade,
      description,
      videoUrl,
      thumbnailUrl,
      duration,
      videoType,
      quiz,
      gameType,
      watchPoints,
      quizPoints,
      gamePoints,
    } = req.body;

    // Validate required fields
    if (!title || !subject || !grade || !videoUrl) {
      return res.status(400).json({
        success: false,
        message: "Title, subject, grade, and video URL are required",
      });
    }

    // Get admin from request (set by auth middleware)
    const adminId = req.admin?._id || req.body.createdBy;

    const video = new Video({
      title,
      subject,
      grade,
      description,
      videoUrl,
      thumbnailUrl,
      duration,
      videoType: videoType || "external",
      quiz: quiz || { questions: [], passingScore: 70, timeLimit: 600 },
      gameType: gameType || "snake-ladder",
      watchPoints: watchPoints || 10,
      quizPoints: quizPoints || 20,
      gamePoints: gamePoints || 15,
      createdBy: adminId,
    });

    await video.save();

    res.status(201).json({
      success: true,
      message: "Video lesson created successfully",
      data: video,
    });
  } catch (error) {
    console.error("Create video error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating video lesson",
      error: error.message,
    });
  }
};

// Get all video lessons
export const getAllVideos = async (req, res) => {
  try {
    const { grade, subject, isActive } = req.query;

    const filter = {};
    if (grade) filter.grade = grade;
    if (subject) filter.subject = subject;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const videos = await Video.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name");

    res.status(200).json({
      success: true,
      data: videos,
    });
  } catch (error) {
    console.error("Get all videos error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching videos",
      error: error.message,
    });
  }
};

// Get video by ID
export const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id).populate("createdBy", "name");

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    res.status(200).json({
      success: true,
      data: video,
    });
  } catch (error) {
    console.error("Get video by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching video",
      error: error.message,
    });
  }
};

// Update video
export const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const video = await Video.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Video updated successfully",
      data: video,
    });
  } catch (error) {
    console.error("Update video error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating video",
      error: error.message,
    });
  }
};

// Delete video
export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findByIdAndDelete(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    console.error("Delete video error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting video",
      error: error.message,
    });
  }
};

// Get videos by grade (for students)
export const getVideosByGrade = async (req, res) => {
  try {
    const { grade } = req.params;

    const videos = await Video.find({ grade, isActive: true })
      .select("-quiz.questions.correctAnswer -quiz.questions.explanation")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: videos,
    });
  } catch (error) {
    console.error("Get videos by grade error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching videos",
      error: error.message,
    });
  }
};

// Submit quiz for video
export const submitVideoQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, answers, score, timeTaken } = req.body;

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    // Update student points if passed
    if (score >= (video.quiz?.passingScore || 70)) {
      const student = await Student.findById(studentId);
      if (student) {
        student.points = (student.points || 0) + (video.quizPoints || 20);
        await student.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      data: {
        score,
        passed: score >= (video.quiz?.passingScore || 70),
        pointsEarned:
          score >= (video.quiz?.passingScore || 70)
            ? video.quizPoints || 20
            : 0,
      },
    });
  } catch (error) {
    console.error("Submit video quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Server error submitting quiz",
      error: error.message,
    });
  }
};

// Award points for watching video
export const awardVideoWatchPoints = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if already watched (stored in student's watchedVideos)
    if (!student.watchedVideos) {
      student.watchedVideos = [];
    }

    const alreadyWatched = student.watchedVideos.some(
      (v) => v.videoId?.toString() === id
    );

    if (alreadyWatched) {
      return res.status(200).json({
        success: true,
        message: "Video already watched",
        data: { pointsAwarded: 0, alreadyWatched: true },
      });
    }

    // Award points
    student.points = (student.points || 0) + (video.watchPoints || 10);
    student.watchedVideos.push({
      videoId: id,
      watchedAt: new Date(),
    });
    await student.save();

    res.status(200).json({
      success: true,
      message: "Points awarded for watching video",
      data: {
        pointsAwarded: video.watchPoints || 10,
        totalPoints: student.points,
      },
    });
  } catch (error) {
    console.error("Award video watch points error:", error);
    res.status(500).json({
      success: false,
      message: "Server error awarding points",
      error: error.message,
    });
  }
};

// Award points for playing game
export const awardGamePoints = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, gameCompleted } = req.body;

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    if (!gameCompleted) {
      return res.status(200).json({
        success: true,
        message: "Game not completed",
        data: { pointsAwarded: 0 },
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Award game points
    student.points = (student.points || 0) + (video.gamePoints || 15);
    student.gamePoints = (student.gamePoints || 0) + (video.gamePoints || 15);
    await student.save();

    res.status(200).json({
      success: true,
      message: "Points awarded for completing game",
      data: {
        pointsAwarded: video.gamePoints || 15,
        totalPoints: student.points,
      },
    });
  } catch (error) {
    console.error("Award game points error:", error);
    res.status(500).json({
      success: false,
      message: "Server error awarding points",
      error: error.message,
    });
  }
};
