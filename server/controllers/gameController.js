import Game from '../models/Game.js';
import Student from '../models/Student.js';

// Badge rewards for level-ups
const LEVEL_BADGES = {
  2: { badgeId: 'beginner', name: 'Beginner Explorer', description: 'Started your eco journey!', icon: '🌱', rarity: 'common' },
  3: { badgeId: 'eco-learner', name: 'Eco Learner', description: 'Learning about the environment', icon: '📚', rarity: 'common' },
  5: { badgeId: 'tree-planter', name: 'Tree Planter', description: 'Planted 100 virtual trees!', icon: '🌳', rarity: 'common' },
  7: { badgeId: 'climate-warrior', name: 'Climate Warrior', description: 'Fighting climate change!', icon: '⚔️', rarity: 'rare' },
  10: { badgeId: 'green-champion', name: 'Green Champion', description: 'A true environmental champion!', icon: '🏆', rarity: 'rare' },
  15: { badgeId: 'eco-master', name: 'Eco Master', description: 'Master of environmental knowledge', icon: '🎓', rarity: 'epic' },
  20: { badgeId: 'nature-hero', name: 'Nature Hero', description: 'A hero for planet Earth!', icon: '🦸', rarity: 'epic' },
  25: { badgeId: 'earth-savior', name: 'Earth Savior', description: 'Legendary protector of Earth!', icon: '🌍', rarity: 'legendary' },
  30: { badgeId: 'planet-guardian', name: 'Planet Guardian', description: 'Ultimate guardian of our planet!', icon: '💫', rarity: 'legendary' }
};

// XP required for each level (progressive)
const calculateXPForLevel = (level) => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Default games to seed
const defaultGames = [
  {
    title: "EcoQuest Adventure",
    description: "Explore different ecosystems and learn about biodiversity",
    difficulty: "Easy",
    duration: "15 min",
    points: 50,
    icon: "Leaf",
    category: "Ecosystems",
    route: "/student/ecoquest-adventure",
    allowedClasses: [],
    order: 1
  },
  {
    title: "Ocean Cleanup Hero",
    description: "Clean up the ocean and save marine life",
    difficulty: "Medium",
    duration: "20 min",
    points: 75,
    icon: "Droplets",
    category: "Ocean Conservation",
    route: "/student/ocean-cleanup-hero",
    allowedClasses: [],
    order: 2
  },
  {
    title: "Solar Power Master",
    description: "Build and manage renewable energy systems",
    difficulty: "Hard",
    duration: "30 min",
    points: 100,
    icon: "Sun",
    category: "Energy",
    route: "/student/solar-power-master",
    allowedClasses: [],
    order: 3
  },
  {
    title: "Recycling Wizard",
    description: "Sort waste and learn about proper recycling",
    difficulty: "Easy",
    duration: "10 min",
    points: 40,
    icon: "Recycle",
    category: "Waste Management",
    route: "/student/recycling-wizard",
    allowedClasses: [],
    order: 4
  },
  {
    title: "Save the Trees",
    description: "Plant and manage your own forest while learning about conservation",
    difficulty: "Medium",
    duration: "25 min",
    points: 80,
    icon: "TreePine",
    category: "Forest Conservation",
    route: "/student/save-the-trees",
    allowedClasses: [],
    order: 5
  },
  {
    title: "Wind Farm Engineer",
    description: "Design and build efficient wind energy farms",
    difficulty: "Hard",
    duration: "35 min",
    points: 120,
    icon: "Wind",
    category: "Renewable Energy",
    route: "/student/wind-farm-engineer",
    allowedClasses: [],
    order: 6
  },
  {
    title: "Mountain Ranger",
    description: "Protect mountain ecosystems and wildlife habitats",
    difficulty: "Medium",
    duration: "22 min",
    points: 85,
    icon: "Mountain",
    category: "Wildlife Protection",
    route: "/student/mountain-ranger",
    allowedClasses: [],
    order: 7
  },
  {
    title: "Aquatic Life Guardian",
    description: "Restore coral reefs and protect marine biodiversity",
    difficulty: "Hard",
    duration: "28 min",
    points: 110,
    icon: "Fish",
    category: "Marine Biology",
    route: "/student/aquatic-life-guardian",
    allowedClasses: [],
    order: 8
  },
  {
    title: "Arctic Rescue Mission",
    description: "Save polar animals and understand climate change impacts",
    difficulty: "Medium",
    duration: "18 min",
    points: 70,
    icon: "Snowflake",
    category: "Climate Change",
    route: "/student/arctic-rescue-mission",
    allowedClasses: [],
    order: 9
  },
  {
    title: "Electric Vehicle City",
    description: "Build sustainable transportation systems",
    difficulty: "Hard",
    duration: "40 min",
    points: 130,
    icon: "Zap",
    category: "Sustainable Transport",
    route: "/student/electric-vehicle-city",
    allowedClasses: [],
    order: 10
  },
  {
    title: "Global Weather Detective",
    description: "Track weather patterns and predict climate changes",
    difficulty: "Medium",
    duration: "24 min",
    points: 90,
    icon: "Globe",
    category: "Climate Science",
    route: "/student/global-weather-detective",
    allowedClasses: [],
    order: 11
  },
  {
    title: "Pollinator Paradise",
    description: "Create gardens to save bees and butterflies",
    difficulty: "Easy",
    duration: "12 min",
    points: 55,
    icon: "Flower2",
    category: "Biodiversity",
    route: "/student/pollinator-paradise",
    allowedClasses: [],
    order: 12
  },
  {
    title: "Ecosystem Food Web",
    description: "Balance predator and prey relationships in nature",
    difficulty: "Hard",
    duration: "32 min",
    points: 115,
    icon: "Bug",
    category: "Ecology",
    route: "/student/ecosystem-food-web",
    allowedClasses: [],
    order: 13
  },
  {
    title: "Carbon Footprint Hunter",
    description: "Track and reduce carbon emissions in daily life",
    difficulty: "Medium",
    duration: "20 min",
    points: 75,
    icon: "Leaf",
    category: "Carbon Management",
    route: "/student/carbon-footprint-hunter",
    allowedClasses: [],
    order: 14
  },
  {
    title: "Green Chemistry Lab",
    description: "Create eco-friendly products using safe chemicals",
    difficulty: "Hard",
    duration: "45 min",
    points: 140,
    icon: "Droplets",
    category: "Green Chemistry",
    route: "/student/green-chemistry-lab",
    allowedClasses: [],
    order: 15
  }
];

// Get all games (admin)
export const getAllGames = async (req, res) => {
  try {
    const games = await Game.find().sort({ order: 1, title: 1 });
    res.status(200).json({
      success: true,
      games
    });
  } catch (error) {
    console.error('Get all games error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch games'
    });
  }
};

// Get games for a specific class (student)
export const getGamesForClass = async (req, res) => {
  try {
    const { studentClass } = req.params;
    
    if (!studentClass) {
      return res.status(400).json({
        success: false,
        message: 'Student class is required'
      });
    }

    const games = await Game.getGamesForClass(studentClass);
    
    res.status(200).json({
      success: true,
      games
    });
  } catch (error) {
    console.error('Get games for class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch games'
    });
  }
};

// Create a new game (admin)
export const createGame = async (req, res) => {
  try {
    const gameData = req.body;
    
    // Check if game with same route exists
    const existingGame = await Game.findOne({ route: gameData.route });
    if (existingGame) {
      return res.status(400).json({
        success: false,
        message: 'A game with this route already exists'
      });
    }

    const game = await Game.create(gameData);
    
    res.status(201).json({
      success: true,
      message: 'Game created successfully',
      game
    });
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create game'
    });
  }
};

// Update a game (admin)
export const updateGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const updateData = req.body;
    
    const game = await Game.findByIdAndUpdate(
      gameId,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Game updated successfully',
      game
    });
  } catch (error) {
    console.error('Update game error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update game'
    });
  }
};

// Delete a game (admin)
export const deleteGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    
    const game = await Game.findByIdAndDelete(gameId);
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Game deleted successfully'
    });
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete game'
    });
  }
};

// Update allowed classes for a game (admin)
export const updateGameClasses = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { allowedClasses } = req.body;
    
    const game = await Game.findByIdAndUpdate(
      gameId,
      { allowedClasses, updatedAt: new Date() },
      { new: true }
    );
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Game classes updated successfully',
      game
    });
  } catch (error) {
    console.error('Update game classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update game classes'
    });
  }
};

// Bulk update classes for multiple games
export const bulkUpdateGameClasses = async (req, res) => {
  try {
    const { updates } = req.body; // Array of { gameId, allowedClasses }
    
    const results = await Promise.all(
      updates.map(async ({ gameId, allowedClasses }) => {
        return Game.findByIdAndUpdate(
          gameId,
          { allowedClasses, updatedAt: new Date() },
          { new: true }
        );
      })
    );
    
    res.status(200).json({
      success: true,
      message: 'Games updated successfully',
      games: results.filter(g => g !== null)
    });
  } catch (error) {
    console.error('Bulk update game classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update games'
    });
  }
};

// Seed default games (admin)
export const seedGames = async (req, res) => {
  try {
    // Check if games already exist
    const existingCount = await Game.countDocuments();
    
    if (existingCount > 0) {
      return res.status(400).json({
        success: false,
        message: `${existingCount} games already exist. Delete them first to reseed.`
      });
    }

    const games = await Game.insertMany(defaultGames);
    
    res.status(201).json({
      success: true,
      message: `${games.length} games seeded successfully`,
      games
    });
  } catch (error) {
    console.error('Seed games error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed games'
    });
  }
};

// Get available classes (for admin dropdown)
export const getAvailableClasses = async (req, res) => {
  try {
    // Common class formats
    const classes = [
      '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'
    ];
    
    res.status(200).json({
      success: true,
      classes
    });
  } catch (error) {
    console.error('Get available classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classes'
    });
  }
};

// Toggle game active status
export const toggleGameStatus = async (req, res) => {
  try {
    const { gameId } = req.params;
    
    const game = await Game.findById(gameId);
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }
    
    game.isActive = !game.isActive;
    game.updatedAt = new Date();
    await game.save();
    
    res.status(200).json({
      success: true,
      message: `Game ${game.isActive ? 'activated' : 'deactivated'} successfully`,
      game
    });
  } catch (error) {
    console.error('Toggle game status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle game status'
    });
  }
};

/**
 * Complete a game and award points
 */
export const completeGame = async (req, res) => {
  try {
    const { studentId, gameId, gameName, pointsEarned, coinsEarned } = req.body;
    
    console.log('=== Complete Game Request ===');
    console.log('Request body:', req.body);
    console.log('Student ID:', studentId);
    console.log('Game ID:', gameId);
    console.log('Points Earned:', pointsEarned);
    console.log('Coins Earned:', coinsEarned);

    if (!studentId || !gameId || !gameName || pointsEarned === undefined) {
      return res.status(400).json({
        success: false,
        message: "Student ID, game ID, game name, and points earned are required",
      });
    }

    // First check if student exists using lean() to avoid validation
    const studentCheck = await Student.findById(studentId).lean();
    if (!studentCheck) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Migrate old badges format (number) to new format (array) if needed
    if (typeof studentCheck.badges === 'number' || !Array.isArray(studentCheck.badges)) {
      await Student.updateOne(
        { _id: studentId },
        { 
          $set: { 
            badges: [],
            gamePoints: 0
          } 
        }
      );
    }

    // Now fetch the student with correct schema
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found after update",
      });
    }

    // Ensure gamePoints exists
    if (typeof student.gamePoints !== 'number') {
      student.gamePoints = 0;
    }

    // Add game to played games
    student.gamesPlayed.push({
      gameId,
      gameName,
      pointsEarned,
      playedAt: new Date(),
    });

    // Update GAME POINTS (not eco points) and XP
    student.gamePoints += pointsEarned;
    student.currentXP += pointsEarned;
    
    // Add coins if provided
    if (coinsEarned && coinsEarned > 0) {
      console.log('Adding coins - Before:', student.coins);
      student.coins = (student.coins || 0) + coinsEarned;
      console.log('Adding coins - After:', student.coins);
    }

    // Check for level up and award badges
    const levelUpRewards = [];
    const earnedBadges = [];
    
    while (student.currentXP >= student.nextLevelXP) {
      student.currentXP -= student.nextLevelXP;
      student.level += 1;
      
      // Calculate next level XP
      student.nextLevelXP = calculateXPForLevel(student.level);

      // Award badge if available for this level
      const badge = LEVEL_BADGES[student.level];
      if (badge) {
        const newBadge = {
          badgeId: badge.badgeId,
          name: badge.name,
          description: badge.description,
          level: student.level,
          icon: badge.icon,
          rarity: badge.rarity,
          earnedAt: new Date(),
        };
        
        student.badges.push(newBadge);
        earnedBadges.push(newBadge);
        
        levelUpRewards.push({
          type: 'badge',
          badge: newBadge,
          level: student.level,
        });
        
        student.levelUpRewards.push({
          level: student.level,
          rewardType: 'badge',
          rewardValue: newBadge,
        });
      }
    }

    await student.save();
    
    console.log('Student saved successfully');
    console.log('Final coin count:', student.coins);

    res.status(200).json({
      success: true,
      message: "Game completed successfully!",
      data: {
        pointsEarned,
        coinsEarned,
        gamePoints: student.gamePoints,
        ecoPoints: student.points,
        currentLevel: student.level,
        currentXP: student.currentXP,
        nextLevelXP: student.nextLevelXP,
        coins: student.coins,
        leveledUp: levelUpRewards.length > 0,
        levelUpRewards,
        earnedBadges,
      },
    });
  } catch (error) {
    console.error("Complete game error:", error);
    res.status(500).json({
      success: false,
      message: "Server error completing game",
      error: error.message,
    });
  }
};

/**
 * Get student's game history
 */
export const getGameHistory = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        gamesPlayed: student.gamesPlayed,
        totalGames: student.gamesPlayed.length,
        totalPointsFromGames: student.gamesPlayed.reduce((sum, game) => sum + game.pointsEarned, 0),
      },
    });
  } catch (error) {
    console.error("Get game history error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting game history",
      error: error.message,
    });
  }
};

/**
 * Get student's rewards (coins, gifts, cards)
 */
export const getStudentRewards = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Ensure badges is an array
    const badges = Array.isArray(student.badges) ? student.badges : [];
    const gamePoints = typeof student.gamePoints === 'number' ? student.gamePoints : 0;

    res.status(200).json({
      success: true,
      data: {
        coins: student.coins,
        gifts: student.gifts,
        cards: student.cards,
        badges: badges,
        level: student.level,
        currentXP: student.currentXP,
        nextLevelXP: student.nextLevelXP,
        ecoPoints: student.points,
        gamePoints: gamePoints,
      },
    });
  } catch (error) {
    console.error("Get student rewards error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting student rewards",
      error: error.message,
    });
  }
};

/**
 * Redeem reward item with coins
 */
export const redeemReward = async (req, res) => {
  try {
    const { studentId, itemId, itemName, category, coinsSpent } = req.body;

    // Validate required fields
    if (!studentId || !itemId || !itemName || !coinsSpent) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Find student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if student has enough coins
    if (student.coins < coinsSpent) {
      return res.status(400).json({
        success: false,
        message: "Insufficient coins",
        currentCoins: student.coins,
        required: coinsSpent,
      });
    }

    // Deduct coins and add redemption record
    student.coins -= coinsSpent;
    student.redemptions.push({
      itemId,
      itemName,
      category,
      coinsSpent,
      redeemedAt: new Date(),
    });

    await student.save();

    res.status(200).json({
      success: true,
      message: "Reward redeemed successfully",
      data: {
        remainingCoins: student.coins,
        redemption: student.redemptions[student.redemptions.length - 1],
      },
    });
  } catch (error) {
    console.error("Redeem reward error:", error);
    res.status(500).json({
      success: false,
      message: "Server error redeeming reward",
      error: error.message,
    });
  }
};

/**
 * Get student's redemption history
 */
export const getRedemptionHistory = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Sort redemptions by most recent first
    const redemptions = student.redemptions.sort((a, b) => 
      new Date(b.redeemedAt) - new Date(a.redeemedAt)
    );

    res.status(200).json({
      success: true,
      data: {
        redemptions,
        totalRedemptions: redemptions.length,
        totalCoinsSpent: redemptions.reduce((sum, r) => sum + r.coinsSpent, 0),
        currentCoins: student.coins,
      },
    });
  } catch (error) {
    console.error("Get redemption history error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting redemption history",
      error: error.message,
    });
  }
};

