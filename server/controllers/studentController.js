import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import Student from "../models/Student.js";

// Student Login
export const studentLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { rollNumber, password } = req.body;
    const student = await Student.findOne({ rollNumber });

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    if (!student.credentialsGenerated || !student.passwordHash) {
      return res.status(401).json({
        success: false,
        message: "Credentials not generated yet. Contact your teacher.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      student.passwordHash
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Check if this is first login (need to change password)
    const isFirstLogin = student.isFirstLogin !== false;

    res.status(200).json({
      success: true,
      message: isFirstLogin
        ? "First login - password change required"
        : "Login successful",
      data: {
        user: {
          id: student._id,
          name: student.name,
          rollNumber: student.rollNumber,
          email: student.email,
          phone: student.phone,
          address: student.address,
          school: student.school,
          class: student.class,
          joiningDate: student.joiningDate,
          role: "student",
          isFirstLogin: isFirstLogin,
        },
      },
    });
  } catch (error) {
    console.error("Student login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// Change password for first login
export const changePassword = async (req, res) => {
  try {
    const { rollNumber, oldPassword, newPassword } = req.body;

    if (!rollNumber || !oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Roll number, old password, and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    const student = await Student.findOne({ rollNumber });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(
      oldPassword,
      student.passwordHash
    );
    if (!isOldPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password and clear first login flag
    await Student.findByIdAndUpdate(student._id, {
      passwordHash: newPasswordHash,
      plainPassword: null,
      isFirstLogin: false,
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
      data: {
        user: {
          id: student._id,
          name: student.name,
          rollNumber: student.rollNumber,
          email: student.email,
          phone: student.phone,
          address: student.address,
          school: student.school,
          class: student.class,
          joiningDate: student.joiningDate,
          role: "student",
          isFirstLogin: false,
        },
      },
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during password change",
    });
  }
};

// Award points for watching a video
export const awardVideoPoints = async (req, res) => {
  try {
    const { studentId, syllabusId, videoTitle } = req.body;

    if (!studentId || !syllabusId) {
      return res.status(400).json({
        success: false,
        message: "Student ID and Syllabus ID are required",
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if video was already watched
    const alreadyWatched = student.watchedVideos?.some(
      (v) => v.syllabusId?.toString() === syllabusId
    );

    if (alreadyWatched) {
      return res.status(200).json({
        success: true,
        message: "Video already watched, no additional points awarded",
        data: {
          pointsAwarded: 0,
          xpAwarded: 0,
          totalPoints: student.points || 0,
          currentXP: student.currentXP || 0,
          level: student.level || 1,
          alreadyWatched: true,
          dailyChallengeCompleted: student.dailyChallengeCompleted || false,
        },
      });
    }

    // Award points and XP for watching a video
    const pointsToAward = 10;
    const xpToAward = 15;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get or initialize daily challenges as array
    let dailyChallenges = student.dailyChallenges || [];
    let todayPoints = student.todayPoints || 0;

    // Check if we need to reset for a new day
    const lastPointsDate = student.lastPointsDate
      ? new Date(student.lastPointsDate)
      : null;
    const isNewDay =
      !lastPointsDate ||
      new Date(lastPointsDate).setHours(0, 0, 0, 0) < today.getTime();

    if (
      isNewDay ||
      !Array.isArray(dailyChallenges) ||
      dailyChallenges.length === 0
    ) {
      // Reset for new day with fresh challenges
      todayPoints = 0;
      dailyChallenges = [
        {
          id: "watch-video",
          type: "watch-video",
          title: "Watch a Video",
          description: "Watch any educational video",
          xpReward: 50,
          completed: false,
          completedAt: null,
        },
        {
          id: "complete-quiz",
          type: "complete-quiz",
          title: "Complete a Quiz",
          description: "Complete any quiz with 70% or higher",
          xpReward: 75,
          completed: false,
          completedAt: null,
        },
        {
          id: "play-game",
          type: "play-game",
          title: "Play a Game",
          description: "Play any educational game",
          xpReward: 50,
          completed: false,
          completedAt: null,
        },
      ];
    }

    // Mark "Watch a Video" challenge as complete and award bonus XP
    let dailyChallengeBonus = 0;
    const watchVideoChallenge = dailyChallenges.find(
      (c) => c.type === "watch-video" || c.id === "watch-video"
    );
    if (watchVideoChallenge && !watchVideoChallenge.completed) {
      watchVideoChallenge.completed = true;
      watchVideoChallenge.completedAt = new Date();
      dailyChallengeBonus = watchVideoChallenge.xpReward || 50;
    }

    // Calculate new XP and check for level up
    let currentXP = (student.currentXP || 0) + xpToAward + dailyChallengeBonus;
    let level = student.level || 1;
    let nextLevelXP = student.nextLevelXP || 100;

    // Level up if XP exceeds threshold
    while (currentXP >= nextLevelXP) {
      currentXP -= nextLevelXP;
      level += 1;
      nextLevelXP = Math.floor(nextLevelXP * 1.5); // Increase XP needed for next level
    }

    // Update student with new points, XP, and watched video
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      {
        $inc: { points: pointsToAward + dailyChallengeBonus },
        $set: {
          todayPoints: todayPoints + pointsToAward + dailyChallengeBonus,
          lastPointsDate: new Date(),
          currentXP: currentXP,
          level: level,
          nextLevelXP: nextLevelXP,
          dailyChallenges: dailyChallenges,
        },
        $push: {
          watchedVideos: {
            syllabusId: syllabusId,
            watchedAt: new Date(),
            pointsEarned: pointsToAward,
          },
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Congratulations! You earned ${
        pointsToAward + dailyChallengeBonus
      } points for watching "${videoTitle || "the video"}"!`,
      data: {
        pointsAwarded: pointsToAward,
        xpAwarded: xpToAward + dailyChallengeBonus,
        dailyChallengeBonus: dailyChallengeBonus,
        totalPoints: updatedStudent.points,
        todayPoints: updatedStudent.todayPoints,
        currentXP: updatedStudent.currentXP,
        level: updatedStudent.level,
        nextLevelXP: updatedStudent.nextLevelXP,
        dailyChallenges: updatedStudent.dailyChallenges,
        alreadyWatched: false,
      },
    });
  } catch (error) {
    console.error("Award video points error:", error);
    res.status(500).json({
      success: false,
      message: "Server error awarding points",
    });
  }
};

// Get student stats (points, watched videos, etc.)
export const getStudentStats = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Calculate daily challenges - reset if needed
    const today = new Date().toDateString();
    let dailyChallenges = student.dailyChallenges;

    // Check if dailyChallenges is valid array with proper structure
    const isValidChallenges =
      Array.isArray(dailyChallenges) &&
      dailyChallenges.length === 3 &&
      dailyChallenges.every(
        (c) => c.title && c.type && c.xpReward !== undefined
      );

    // Check if it's a new day (need to reset challenges)
    const isNewDay =
      student.lastPointsDate &&
      new Date(student.lastPointsDate).toDateString() !== today;

    // Reset challenges if invalid format or new day
    if (!isValidChallenges || isNewDay) {
      dailyChallenges = [
        {
          id: "watch-video",
          type: "watch-video",
          title: "Watch a Video",
          description: "Watch any educational video",
          xpReward: 50,
          completed: false,
          completedAt: null,
        },
        {
          id: "complete-quiz",
          type: "complete-quiz",
          title: "Complete a Quiz",
          description: "Complete any quiz with 70% or higher",
          xpReward: 75,
          completed: false,
          completedAt: null,
        },
        {
          id: "play-game",
          type: "play-game",
          title: "Play a Game",
          description: "Play any educational game",
          xpReward: 50,
          completed: false,
          completedAt: null,
        },
      ];

      // Save new challenges
      student.dailyChallenges = dailyChallenges;
      await student.save();
    }

    res.status(200).json({
      success: true,
      data: {
        points: student.points || 0,
        todayPoints: student.todayPoints || 0,
        streak: student.streak || 0,
        level: student.level || 1,
        currentXP: student.currentXP || 0,
        nextLevelXP: student.nextLevelXP || 100,
        badges: Array.isArray(student.badges) ? student.badges : [],
        badgeCount: Array.isArray(student.badges) ? student.badges.length : 0,
        gamePoints: student.gamePoints || 0,
        hoursLearned: student.hoursLearned || 0,
        watchedVideosCount: student.watchedVideos?.length || 0,
        watchedVideos: student.watchedVideos || [],
        dailyChallenges: dailyChallenges,
        name: student.name,
        email: student.email,
      },
    });
  } catch (error) {
    console.error("Get student stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching stats",
    });
  }
};

// Award points for completing a quiz
export const awardQuizPoints = async (req, res) => {
  try {
    const { studentId, syllabusId, quizTitle, score } = req.body;

    if (!studentId || !syllabusId) {
      return res.status(400).json({
        success: false,
        message: "Student ID and Syllabus ID are required",
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Initialize arrays if they don't exist
    if (!student.completedQuizzes) {
      student.completedQuizzes = [];
    }

    // Check if quiz already completed
    const alreadyCompleted = student.completedQuizzes.some(
      (q) => q.syllabusId.toString() === syllabusId.toString()
    );

    if (alreadyCompleted) {
      return res.status(200).json({
        success: true,
        message: "Quiz already completed",
        data: {
          pointsAwarded: 0,
          totalPoints: student.points || 0,
          todayPoints: student.todayPoints || 0,
          currentXP: student.currentXP || 0,
          level: student.level || 1,
          nextLevelXP: student.nextLevelXP || 100,
          alreadyCompleted: true,
        },
      });
    }

    // Award points based on score (base 20 points + bonus for high scores)
    let pointsAwarded = 20; // Base points for completing quiz
    if (score >= 90) pointsAwarded += 30; // Bonus for 90%+
    else if (score >= 80) pointsAwarded += 20; // Bonus for 80%+
    else if (score >= 70) pointsAwarded += 10; // Bonus for 70%+

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

    // Update XP
    const xpEarned = pointsAwarded; // 1:1 ratio
    student.currentXP = (student.currentXP || 0) + xpEarned;

    // Check for daily challenge completion (Complete a Quiz)
    let dailyChallengeCompleted = false;
    if (student.dailyChallenges && student.dailyChallenges.length > 0) {
      const quizChallenge = student.dailyChallenges.find(
        (c) => c.type === "complete-quiz" && !c.completed
      );

      if (quizChallenge && score >= 70) {
        quizChallenge.completed = true;
        quizChallenge.completedAt = new Date();
        dailyChallengeCompleted = true;

        // Add bonus XP for daily challenge
        student.currentXP = (student.currentXP || 0) + quizChallenge.xpReward;
        student.points = (student.points || 0) + quizChallenge.xpReward;
        student.todayPoints =
          (student.todayPoints || 0) + quizChallenge.xpReward;
      }
    }

    // Check for level up
    while (student.currentXP >= student.nextLevelXP) {
      student.currentXP -= student.nextLevelXP;
      student.level = (student.level || 1) + 1;
      student.nextLevelXP = Math.floor((student.nextLevelXP || 100) * 1.5);
    }

    // Record the completed quiz
    student.completedQuizzes.push({
      syllabusId,
      quizTitle: quizTitle || "Quiz",
      score,
      completedAt: new Date(),
      pointsAwarded,
    });

    const updatedStudent = await student.save();

    res.status(200).json({
      success: true,
      message: "Quiz points awarded",
      data: {
        pointsAwarded: dailyChallengeCompleted
          ? pointsAwarded + 75
          : pointsAwarded,
        totalPoints: updatedStudent.points,
        todayPoints: updatedStudent.todayPoints,
        currentXP: updatedStudent.currentXP,
        level: updatedStudent.level,
        nextLevelXP: updatedStudent.nextLevelXP,
        dailyChallengeCompleted,
        dailyChallenges: updatedStudent.dailyChallenges,
      },
    });
  } catch (error) {
    console.error("Award quiz points error:", error);
    res.status(500).json({
      success: false,
      message: "Server error awarding quiz points",
    });
  }
};

/**
 * Get global leaderboard - top students by points
 */
export const getGlobalLeaderboard = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const students = await Student.find({})
      .select('name school class points level streak badges gamePoints coins')
      .sort({ points: -1 })
      .limit(parseInt(limit));

    const leaderboard = students.map((student, index) => ({
      rank: index + 1,
      studentId: student._id,
      name: student.name,
      school: student.school || 'Unknown School',
      class: student.class,
      totalPoints: student.points || 0,
      gamePoints: student.gamePoints || 0,
      coins: student.coins || 0,
      level: student.level || 1,
      streak: student.streak || 0,
      badgeCount: student.badges?.length || 0,
      avatar: getAvatarEmoji(index + 1),
    }));

    res.status(200).json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error("Get global leaderboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching global leaderboard",
      error: error.message,
    });
  }
};

/**
 * Get school-specific leaderboard
 */
export const getSchoolLeaderboard = async (req, res) => {
  try {
    const { school } = req.params;
    const { limit = 50 } = req.query;

    if (!school) {
      return res.status(400).json({
        success: false,
        message: "School name is required",
      });
    }

    const students = await Student.find({ school })
      .select('name school class points level streak badges gamePoints coins')
      .sort({ points: -1 })
      .limit(parseInt(limit));

    const leaderboard = students.map((student, index) => ({
      rank: index + 1,
      studentId: student._id,
      name: student.name,
      school: student.school,
      class: student.class,
      totalPoints: student.points || 0,
      gamePoints: student.gamePoints || 0,
      coins: student.coins || 0,
      gamePoints: student.gamePoints || 0,
      level: student.level || 1,
      streak: student.streak || 0,
      badgeCount: student.badges?.length || 0,
      avatar: getAvatarEmoji(index + 1),
    }));

    res.status(200).json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error("Get school leaderboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching school leaderboard",
      error: error.message,
    });
  }
};

/**
 * Helper function to get avatar emoji based on rank
 */
const getAvatarEmoji = (rank) => {
  const avatars = ['👑', '🥇', '🥈', '🥉', '🌟', '⭐', '✨', '💫', '🎯', '🔥', '🌱', '🌿', '🍃', '🌳', '🌲'];
  if (rank <= 3) return avatars[rank - 1];
  return avatars[Math.floor(Math.random() * (avatars.length - 3)) + 3];
};
