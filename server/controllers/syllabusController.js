import Syllabus from "../models/Syllabus.js";
import QuizResult from "../models/QuizResult.js";
import aiGradingService from "../services/aiGradingService.js";
import * as klingAI from '../services/klingAIService.js';

// Helper to generate prompt from syllabus
const generatePromptFromSyllabus = (syllabus) => {
  const { title, subject, grade, content } = syllabus;
  return `Create an educational video about: ${title}. Subject: ${subject}, Grade: ${grade}. Content: ${content.substring(0, 200)}...`;
};

/**
 * Create a new syllabus with AI-generated quiz
 */
export const createSyllabus = async (req, res) => {
  try {
    const {
      title,
      subject,
      grade,
      description,
      content,
      topics,
      adminId,
      generateQuiz = true,
    } = req.body;

    if (!title || !subject || !grade || !content) {
      return res.status(400).json({
        success: false,
        message: "Title, subject, grade, and content are required",
      });
    }

    const syllabus = new Syllabus({
      title,
      subject,
      grade,
      description,
      content,
      topics: topics || [],
      createdBy: adminId,
    });

    // Auto-generate prompt from syllabus
    syllabus.generatedPrompt = generatePromptFromSyllabus(syllabus);

    // Auto-generate quiz using AI if requested
    if (generateQuiz) {
      try {
        console.log("Auto-generating quiz for syllabus:", title);
        const quizResult = await aiGradingService.generateQuizFromSyllabus({
          title,
          subject,
          grade,
          description,
          content,
          topics,
        });

        if (quizResult.success && quizResult.quiz) {
          syllabus.quiz = quizResult.quiz;
          console.log(
            "Quiz generated successfully with",
            quizResult.quiz.questions.length,
            "questions"
          );
        } else {
          console.log(
            "Quiz generation failed, will have empty quiz:",
            quizResult.error
          );
        }
      } catch (quizError) {
        console.error("Error generating quiz:", quizError);
        // Continue without quiz if generation fails
      }
    }

    await syllabus.save();

    res.status(201).json({
      success: true,
      message:
        "Syllabus created successfully" +
        (syllabus.quiz?.questions?.length ? " with AI-generated quiz" : ""),
      data: syllabus,
    });
  } catch (error) {
    console.error("Create syllabus error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating syllabus",
      error: error.message,
    });
  }
};

/**
 * Get all syllabi
 */
export const getAllSyllabi = async (req, res) => {
  try {
    const { page = 1, limit = 10, subject, grade } = req.query;

    const query = {};
    if (subject) query.subject = subject;
    if (grade) query.grade = grade;

    const syllabi = await Syllabus.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Syllabus.countDocuments(query);

    res.status(200).json({
      success: true,
      data: syllabi,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get syllabi error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching syllabi",
      error: error.message,
    });
  }
};

/**
 * Get a single syllabus by ID
 */
export const getSyllabusById = async (req, res) => {
  try {
    const { id } = req.params;

    const syllabus = await Syllabus.findById(id);

    if (!syllabus) {
      return res.status(404).json({
        success: false,
        message: "Syllabus not found",
      });
    }

    res.status(200).json({
      success: true,
      data: syllabus,
    });
  } catch (error) {
    console.error("Get syllabus error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching syllabus",
      error: error.message,
    });
  }
};

/**
 * Update a syllabus
 */
export const updateSyllabus = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subject, grade, description, content, topics } = req.body;

    const syllabus = await Syllabus.findById(id);

    if (!syllabus) {
      return res.status(404).json({
        success: false,
        message: "Syllabus not found",
      });
    }

    if (title) syllabus.title = title;
    if (subject) syllabus.subject = subject;
    if (grade) syllabus.grade = grade;
    if (description) syllabus.description = description;
    if (content) syllabus.content = content;
    if (topics) syllabus.topics = topics;

    // Regenerate prompt if content changed
    syllabus.generatedPrompt = generatePromptFromSyllabus(syllabus);

    await syllabus.save();

    res.status(200).json({
      success: true,
      message: "Syllabus updated successfully",
      data: syllabus,
    });
  } catch (error) {
    console.error("Update syllabus error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating syllabus",
      error: error.message,
    });
  }
};

/**
 * Delete a syllabus
 */
export const deleteSyllabus = async (req, res) => {
  try {
    const { id } = req.params;

    const syllabus = await Syllabus.findByIdAndDelete(id);

    if (!syllabus) {
      return res.status(404).json({
        success: false,
        message: "Syllabus not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Syllabus deleted successfully",
    });
  } catch (error) {
    console.error("Delete syllabus error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting syllabus",
      error: error.message,
    });
  }
};

/**
 * Regenerate quiz for an existing syllabus using AI
 */
export const regenerateQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const syllabus = await Syllabus.findById(id);

    if (!syllabus) {
      return res.status(404).json({
        success: false,
        message: "Syllabus not found",
      });
    }

    console.log("Regenerating quiz for syllabus:", syllabus.title);

    const quizResult = await aiGradingService.generateQuizFromSyllabus({
      title: syllabus.title,
      subject: syllabus.subject,
      grade: syllabus.grade,
      description: syllabus.description,
      content: syllabus.content,
      topics: syllabus.topics,
    });

    if (!quizResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate quiz",
        error: quizResult.error,
      });
    }

    syllabus.quiz = quizResult.quiz;
    await syllabus.save();

    res.status(200).json({
      success: true,
      message: "Quiz regenerated successfully",
      data: {
        syllabusId: syllabus._id,
        quiz: syllabus.quiz,
      },
    });
  } catch (error) {
    console.error("Regenerate quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Server error regenerating quiz",
      error: error.message,
    });
  }
};

/**
 * Generate prompt from syllabus
 */
export const generatePrompt = async (req, res) => {
  try {
    const { id } = req.params;
    const { customPrompt } = req.body;

    const syllabus = await Syllabus.findById(id);

    if (!syllabus) {
      return res.status(404).json({
        success: false,
        message: "Syllabus not found",
      });
    }

    // Use custom prompt if provided, otherwise generate from syllabus
    const prompt = customPrompt || generatePromptFromSyllabus(syllabus);

    syllabus.generatedPrompt = prompt;
    await syllabus.save();

    res.status(200).json({
      success: true,
      message: "Prompt generated successfully",
      data: {
        prompt,
        syllabusId: syllabus._id,
      },
    });
  } catch (error) {
    console.error("Generate prompt error:", error);
    res.status(500).json({
      success: false,
      message: "Server error generating prompt",
      error: error.message,
    });
  }
};

/**
 * Generate video from syllabus using Pollo AI
 */
export const generateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { customPrompt, options } = req.body;

    const syllabus = await Syllabus.findById(id);

    if (!syllabus) {
      return res.status(404).json({
        success: false,
        message: "Syllabus not found",
      });
    }

    // Use custom prompt or the stored/generated prompt
    const prompt =
      customPrompt ||
      syllabus.generatedPrompt ||
      generatePromptFromSyllabus(syllabus);

    // Auto-generate quiz if not present
    if (!syllabus.quiz || !syllabus.quiz.questions || syllabus.quiz.questions.length === 0) {
      try {
        console.log("Auto-generating quiz for syllabus (video generation):", syllabus.title);
        const quizResult = await aiGradingService.generateQuizFromSyllabus({
          title: syllabus.title,
          subject: syllabus.subject,
          grade: syllabus.grade,
          description: syllabus.description,
          content: syllabus.content,
          topics: syllabus.topics,
        });

        if (quizResult.success && quizResult.quiz) {
          syllabus.quiz = quizResult.quiz;
          console.log(
            "Quiz generated successfully with",
            quizResult.quiz.questions.length,
            "questions"
          );
        }
      } catch (quizError) {
        console.error("Error generating quiz:", quizError);
        // Continue with video generation even if quiz fails
      }
    }

    // Update syllabus with the prompt
    syllabus.generatedPrompt = prompt;
    syllabus.videoGenerationStatus = "generating";

    await syllabus.save();

    // Start video generation with Kling AI
    const videoOptions = options || {
      duration: 5,
      aspectRatio: '16:9',
      mode: 'std'
    };
    
    console.log('Starting Kling AI video generation:', { prompt, videoOptions });
    
    const videoResult = await klingAI.generateVideo(prompt, videoOptions);
    
    if (videoResult.success && videoResult.taskId) {
      syllabus.videoTaskId = videoResult.taskId;
      syllabus.videoGenerationStatus = "generating";
      await syllabus.save();

      res.status(200).json({
        success: true,
        message: "Video generation started with Kling AI",
        data: {
          syllabusId: syllabus._id,
          taskId: videoResult.taskId,
          prompt,
          status: "generating",
        },
      });
    } else {
      throw new Error("Failed to start video generation");
    }
  } catch (error) {
    console.error("Generate video error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error generating video",
      error: error.message,
    });
  }
};

/**
 * Check video generation status
 */
export const checkVideoStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const syllabus = await Syllabus.findById(id);

    if (!syllabus) {
      return res.status(404).json({
        success: false,
        message: "Syllabus not found",
      });
    }

    if (!syllabus.videoTaskId) {
      return res.status(400).json({
        success: false,
        message: "No video generation task found for this syllabus",
      });
    }

    // Check status with Kling AI
    const statusResult = await klingAI.checkVideoStatus(syllabus.videoTaskId);

    if (statusResult.completed) {
      syllabus.videoGenerationStatus = "completed";
      syllabus.videoUrl = statusResult.videoUrl;
      await syllabus.save();
    } else if (statusResult.failed) {
      syllabus.videoGenerationStatus = "failed";
      await syllabus.save();
    }

    res.status(200).json({
      success: true,
      data: {
        status: syllabus.videoGenerationStatus,
        videoUrl: syllabus.videoUrl,
        taskId: syllabus.videoTaskId,
      },
    });
  } catch (error) {
    console.error("Check video status error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error checking video status",
    });
  }
};

/**
 * Generate video directly from prompt (without syllabus)
 */
export const generateVideoFromText = async (req, res) => {
  try {
    const { prompt, title, options } = req.body;

    // Video generation disabled
    res.status(200).json({
      success: true,
      message: "Video generation is disabled",
      data: {
        status: "demo",
        message: "Video generation feature has been removed",
      },
    });
  } catch (error) {
    console.error("Generate video from text error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error generating video",
      error: error.message,
    });
  }
};

/**
 * Check video task status by task ID
 */
export const checkTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Video generation disabled
    res.status(200).json({
      success: true,
      data: {
        taskId,
        status: "demo",
        message: "Video generation is disabled",
      },
    });
  } catch (error) {
    console.error("Check task status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error checking task status",
      error: error.message,
    });
  }
};

/**
 * Submit quiz answers and calculate score
 */
export const submitQuiz = async (req, res) => {
  try {
    const { syllabusId } = req.params;
    const { studentId, studentName, studentEmail, answers, timeTaken } =
      req.body;

    if (!studentId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Student ID and answers are required",
      });
    }

    // Get syllabus with quiz
    const syllabus = await Syllabus.findById(syllabusId);
    if (!syllabus) {
      return res.status(404).json({
        success: false,
        message: "Syllabus not found",
      });
    }

    if (
      !syllabus.quiz ||
      !syllabus.quiz.questions ||
      syllabus.quiz.questions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "This syllabus has no quiz",
      });
    }

    // Check if student already completed this quiz
    const existingResult = await QuizResult.findOne({ studentId, syllabusId });
    if (existingResult) {
      return res.status(400).json({
        success: false,
        message: "You have already completed this quiz",
        data: existingResult,
      });
    }

    // Calculate score
    const questions = syllabus.quiz.questions;
    let correctCount = 0;
    const answerDetails = [];

    answers.forEach((answer, index) => {
      if (index < questions.length) {
        const isCorrect = answer === questions[index].correctAnswer;
        if (isCorrect) correctCount++;
        answerDetails.push({
          questionIndex: index,
          selectedAnswer: answer,
          isCorrect,
        });
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= (syllabus.quiz.passingScore || 70);

    // Save quiz result
    const quizResult = new QuizResult({
      studentId,
      studentName: studentName || "Student",
      studentEmail: studentEmail || "",
      syllabusId,
      syllabusTitle: syllabus.title,
      subject: syllabus.subject,
      grade: syllabus.grade,
      score,
      correctAnswers: correctCount,
      totalQuestions: questions.length,
      timeTaken: timeTaken || 0,
      answers: answerDetails,
      passed,
    });

    await quizResult.save();

    res.status(200).json({
      success: true,
      message: passed
        ? "Congratulations! You passed the quiz!"
        : "Quiz completed. Keep practicing!",
      data: {
        score,
        correctAnswers: correctCount,
        totalQuestions: questions.length,
        passed,
        passingScore: syllabus.quiz.passingScore || 70,
        timeTaken,
      },
    });
  } catch (error) {
    console.error("Submit quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Server error submitting quiz",
      error: error.message,
    });
  }
};

/**
 * Get quiz leaderboard
 */
export const getQuizLeaderboard = async (req, res) => {
  try {
    const { grade, subject, limit = 50 } = req.query;

    const leaderboard = await QuizResult.getLeaderboard({
      grade,
      subject,
      limit: parseInt(limit),
    });

    res.status(200).json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error("Get leaderboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching leaderboard",
      error: error.message,
    });
  }
};

/**
 * Get student's quiz history
 */
export const getStudentQuizHistory = async (req, res) => {
  try {
    const { studentId } = req.params;

    const history = await QuizResult.getStudentHistory(studentId);

    // Calculate summary stats
    const totalQuizzes = history.length;
    const totalScore = history.reduce((sum, h) => sum + h.score, 0);
    const averageScore =
      totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;
    const passedQuizzes = history.filter((h) => h.passed).length;

    res.status(200).json({
      success: true,
      data: {
        history,
        summary: {
          totalQuizzes,
          totalScore,
          averageScore,
          passedQuizzes,
          passRate:
            totalQuizzes > 0
              ? Math.round((passedQuizzes / totalQuizzes) * 100)
              : 0,
        },
      },
    });
  } catch (error) {
    console.error("Get quiz history error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching quiz history",
      error: error.message,
    });
  }
};

/**
 * Check if student has completed a specific quiz
 */
export const checkQuizCompletion = async (req, res) => {
  try {
    const { syllabusId, studentId } = req.params;

    const result = await QuizResult.findOne({ studentId, syllabusId });

    res.status(200).json({
      success: true,
      data: {
        completed: !!result,
        result: result || null,
      },
    });
  } catch (error) {
    console.error("Check quiz completion error:", error);
    res.status(500).json({
      success: false,
      message: "Server error checking quiz completion",
      error: error.message,
    });
  }
};
