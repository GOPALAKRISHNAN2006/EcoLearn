import Achievement from "../models/Achievement.js";
import Student from "../models/Student.js";

/**
 * Get all achievements
 */
export const getAllAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ isActive: true }).sort({ rarity: -1, targetValue: 1 });
    
    res.status(200).json({
      success: true,
      data: achievements,
    });
  } catch (error) {
    console.error("Get achievements error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching achievements",
    });
  }
};

/**
 * Get student's achievement progress
 */
export const getStudentAchievements = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Get all achievements
    const allAchievements = await Achievement.find({ isActive: true });

    // Calculate current progress for each achievement
    const achievementsWithProgress = allAchievements.map(achievement => {
      // Find if student has progress on this achievement
      const studentProgress = student.achievements?.find(
        a => a.achievementId === achievement.achievementId
      );

      // Calculate current progress based on achievement type
      let currentProgress = studentProgress?.currentProgress || 0;
      
      // Auto-calculate progress based on student's actual stats
      switch (achievement.targetType) {
        case 'videos':
          currentProgress = student.watchedVideos?.length || 0;
          break;
        case 'quizzes':
          currentProgress = student.completedQuizzes?.length || 0;
          break;
        case 'games':
          currentProgress = student.gamesPlayed?.length || 0;
          break;
        case 'days':
          currentProgress = student.streak || 0;
          break;
        case 'points':
          currentProgress = student.points || 0;
          break;
        default:
          currentProgress = studentProgress?.currentProgress || 0;
      }

      const percentage = Math.min((currentProgress / achievement.targetValue) * 100, 100);
      const isCompleted = currentProgress >= achievement.targetValue;

      return {
        achievementId: achievement.achievementId,
        title: achievement.title,
        description: achievement.description,
        category: achievement.category,
        icon: achievement.icon,
        points: achievement.points,
        currentProgress,
        targetValue: achievement.targetValue,
        targetType: achievement.targetType,
        percentage: Math.round(percentage),
        completed: isCompleted,
        completedAt: studentProgress?.completedAt || null,
        rarity: achievement.rarity,
      };
    });

    res.status(200).json({
      success: true,
      data: achievementsWithProgress,
    });
  } catch (error) {
    console.error("Get student achievements error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching student achievements",
    });
  }
};

/**
 * Update achievement progress
 */
export const updateAchievementProgress = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { achievementId, progress } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const achievement = await Achievement.findOne({ achievementId });
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: "Achievement not found",
      });
    }

    // Find or create achievement progress
    let achievementProgress = student.achievements?.find(
      a => a.achievementId === achievementId
    );

    if (!achievementProgress) {
      student.achievements = student.achievements || [];
      achievementProgress = {
        achievementId,
        title: achievement.title,
        currentProgress: 0,
        targetValue: achievement.targetValue,
        completed: false,
      };
      student.achievements.push(achievementProgress);
    }

    // Update progress
    achievementProgress.currentProgress = progress;

    // Check if completed
    if (progress >= achievement.targetValue && !achievementProgress.completed) {
      achievementProgress.completed = true;
      achievementProgress.completedAt = new Date();
      
      // Award points
      student.points += achievement.points;
    }

    await student.save();

    res.status(200).json({
      success: true,
      message: "Achievement progress updated",
      data: achievementProgress,
    });
  } catch (error) {
    console.error("Update achievement progress error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating achievement progress",
    });
  }
};

/**
 * Seed default achievements
 */
export const seedAchievements = async (req, res) => {
  try {
    // Clear existing achievements
    await Achievement.deleteMany({});

    const defaultAchievements = [
      {
        achievementId: "forest_guardian",
        title: "Forest Guardian",
        description: "Plant 100 virtual trees",
        category: "environment",
        icon: "🌳",
        points: 100,
        targetValue: 100,
        targetType: "trees",
        rarity: "common",
      },
      {
        achievementId: "ocean_protector",
        title: "Ocean Protector",
        description: "Complete marine missions",
        category: "environment",
        icon: "🌊",
        points: 150,
        targetValue: 10,
        targetType: "missions",
        rarity: "rare",
      },
      {
        achievementId: "energy_master",
        title: "Energy Master",
        description: "Build 10 solar farms",
        category: "environment",
        icon: "⚡",
        points: 200,
        targetValue: 10,
        targetType: "farms",
        rarity: "epic",
      },
      {
        achievementId: "video_learner",
        title: "Video Learner",
        description: "Watch 20 educational videos",
        category: "learning",
        icon: "📹",
        points: 75,
        targetValue: 20,
        targetType: "videos",
        rarity: "common",
      },
      {
        achievementId: "quiz_master",
        title: "Quiz Master",
        description: "Complete 30 quizzes",
        category: "learning",
        icon: "📝",
        points: 120,
        targetValue: 30,
        targetType: "quizzes",
        rarity: "rare",
      },
      {
        achievementId: "game_champion",
        title: "Game Champion",
        description: "Play 50 games",
        category: "gaming",
        icon: "🎮",
        points: 150,
        targetValue: 50,
        targetType: "games",
        rarity: "epic",
      },
      {
        achievementId: "streak_legend",
        title: "Streak Legend",
        description: "Maintain a 30-day streak",
        category: "special",
        icon: "🔥",
        points: 300,
        targetValue: 30,
        targetType: "days",
        rarity: "legendary",
      },
      {
        achievementId: "point_collector",
        title: "Point Collector",
        description: "Earn 1000 points",
        category: "special",
        icon: "⭐",
        points: 500,
        targetValue: 1000,
        targetType: "points",
        rarity: "legendary",
      },
    ];

    await Achievement.insertMany(defaultAchievements);

    res.status(200).json({
      success: true,
      message: "Achievements seeded successfully",
      count: defaultAchievements.length,
    });
  } catch (error) {
    console.error("Seed achievements error:", error);
    res.status(500).json({
      success: false,
      message: "Server error seeding achievements",
    });
  }
};
