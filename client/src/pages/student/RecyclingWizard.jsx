import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Recycle, Star, Trophy, Timer, Target, Award, Zap, Coins } from "lucide-react";

const RecyclingWizard = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState({
    score: 0,
    level: 1,
    timeLeft: 60,
    correctSorts: 0,
    wrongSorts: 0,
    streak: 0,
    maxStreak: 0,
    isPlaying: false,
    gameOver: false,
    currentItem: null,
    totalItems: 0,
    wizardXP: 0,
    wizardLevel: 1,
    powerUps: {
      timeFreeze: 0,
      doublePoints: 0,
      hintMode: 0
    },
    activePowerUp: null,
    conveyorSpeed: 1,
    combo: 0,
    achievements: [],
    specialEffects: []
  });

  const gameTimerRef = useRef(null);
  const itemTimerRef = useRef(null);
  const conveyorRef = useRef(null);

  const wasteItems = [
    // Paper items
    { name: 'Newspaper', emoji: '📰', category: 'paper', points: 10, rarity: 'common', tip: 'Newspapers can be recycled into new paper products' },
    { name: 'Cardboard Box', emoji: '📦', category: 'paper', points: 15, rarity: 'common', tip: 'Flatten cardboard boxes to save space' },
    { name: 'Magazine', emoji: '📖', category: 'paper', points: 10, rarity: 'common', tip: 'Magazines can be recycled even with glossy pages' },
    { name: 'Paper Bag', emoji: '🛍️', category: 'paper', points: 8, rarity: 'common', tip: 'Paper bags are biodegradable and recyclable' },
    { name: 'Office Paper', emoji: '📄', category: 'paper', points: 12, rarity: 'common', tip: 'Remove staples and clips before recycling' },
    { name: 'Gift Wrap', emoji: '🎁', category: 'paper', points: 5, rarity: 'uncommon', tip: 'Avoid metallic or plastic-coated wrapping paper' },

    // Plastic items
    { name: 'Water Bottle', emoji: '🍼', category: 'plastic', points: 12, rarity: 'common', tip: 'Remove caps and labels before recycling' },
    { name: 'Plastic Bag', emoji: '🛒', category: 'plastic', points: 8, rarity: 'common', tip: 'Take plastic bags to special collection points' },
    { name: 'Food Container', emoji: '🥡', category: 'plastic', points: 10, rarity: 'common', tip: 'Clean containers before recycling' },
    { name: 'Shampoo Bottle', emoji: '🧴', category: 'plastic', points: 12, rarity: 'common', tip: 'Pump dispensers should be removed' },
    { name: 'Yogurt Cup', emoji: '🥤', category: 'plastic', points: 8, rarity: 'common', tip: 'Rinse thoroughly to remove all food residue' },
    { name: 'Plastic Toy', emoji: '🧸', category: 'plastic', points: 15, rarity: 'rare', tip: 'Check if toy has multiple materials' },

    // Glass items
    { name: 'Wine Bottle', emoji: '🍷', category: 'glass', points: 15, rarity: 'common', tip: 'Glass can be recycled infinitely without quality loss' },
    { name: 'Jam Jar', emoji: '🫙', category: 'glass', points: 12, rarity: 'common', tip: 'Remove lids and clean jars before recycling' },
    { name: 'Soda Bottle', emoji: '🥤', category: 'glass', points: 12, rarity: 'common', tip: 'Glass bottles can become new bottles in 30 days' },
    { name: 'Light Bulb', emoji: '💡', category: 'glass', points: 20, rarity: 'rare', tip: 'Special handling required for different bulb types' },
    { name: 'Perfume Bottle', emoji: '🧴', category: 'glass', points: 18, rarity: 'uncommon', tip: 'Remove spray mechanisms before recycling' },

    // Metal items
    { name: 'Aluminum Can', emoji: '🥫', category: 'metal', points: 18, rarity: 'common', tip: 'Aluminum cans are infinitely recyclable' },
    { name: 'Tin Can', emoji: '🥫', category: 'metal', points: 15, rarity: 'common', tip: 'Remove labels and rinse cans' },
    { name: 'Foil', emoji: '🔘', category: 'metal', points: 10, rarity: 'common', tip: 'Ball up foil to make recycling easier' },
    { name: 'Bottle Cap', emoji: '🧢', category: 'metal', points: 8, rarity: 'uncommon', tip: 'Small metal caps can be recycled with cans' },
    { name: 'Copper Wire', emoji: '🔌', category: 'metal', points: 25, rarity: 'rare', tip: 'Copper is highly valuable for recycling' },

    // Organic waste
    { name: 'Apple Core', emoji: '🍎', category: 'organic', points: 8, rarity: 'common', tip: 'Compost organic waste to create nutrient-rich soil' },
    { name: 'Banana Peel', emoji: '🍌', category: 'organic', points: 8, rarity: 'common', tip: 'Banana peels decompose in 3-5 weeks' },
    { name: 'Vegetable Scraps', emoji: '🥬', category: 'organic', points: 10, rarity: 'common', tip: 'Organic waste can become compost for gardens' },
    { name: 'Coffee Grounds', emoji: '☕', category: 'organic', points: 12, rarity: 'common', tip: 'Coffee grounds are excellent for composting' },
    { name: 'Eggshells', emoji: '🥚', category: 'organic', points: 10, rarity: 'uncommon', tip: 'Crush eggshells for faster composting' },

    // Electronic waste
    { name: 'Old Phone', emoji: '📱', category: 'electronic', points: 30, rarity: 'rare', tip: 'Take electronics to special e-waste centers' },
    { name: 'Battery', emoji: '🔋', category: 'electronic', points: 25, rarity: 'uncommon', tip: 'Batteries contain hazardous materials' },
    { name: 'Computer Mouse', emoji: '🖱️', category: 'electronic', points: 20, rarity: 'rare', tip: 'Electronics need special recycling facilities' },

    // Non-recyclable
    { name: 'Pizza Box', emoji: '🍕', category: 'trash', points: 5, rarity: 'common', tip: 'Greasy pizza boxes contaminate paper recycling' },
    { name: 'Broken Glass', emoji: '🔸', category: 'trash', points: 5, rarity: 'uncommon', tip: 'Broken glass is dangerous and goes to regular trash' },
    { name: 'Styrofoam', emoji: '📦', category: 'trash', points: 5, rarity: 'common', tip: 'Styrofoam is not recyclable in most areas' },
    { name: 'Dirty Diaper', emoji: '👶', category: 'trash', points: 3, rarity: 'uncommon', tip: 'Contaminated items cannot be recycled' },
    { name: 'Rubber Gloves', emoji: '🧤', category: 'trash', points: 4, rarity: 'uncommon', tip: 'Most rubber products are not recyclable' }
  ];

  const categories = [
    { id: 'paper', name: 'Paper', emoji: '📄', color: 'bg-blue-500', description: 'Newspapers, cardboard, magazines', multiplier: 1 },
    { id: 'plastic', name: 'Plastic', emoji: '♻️', color: 'bg-green-500', description: 'Bottles, containers, bags', multiplier: 1.2 },
    { id: 'glass', name: 'Glass', emoji: '🫙', color: 'bg-purple-500', description: 'Bottles, jars, containers', multiplier: 1.5 },
    { id: 'metal', name: 'Metal', emoji: '🔩', color: 'bg-gray-500', description: 'Cans, foil, metal items', multiplier: 1.8 },
    { id: 'organic', name: 'Organic', emoji: '🌱', color: 'bg-green-600', description: 'Food scraps, yard waste', multiplier: 1 },
    { id: 'electronic', name: 'E-Waste', emoji: '⚡', color: 'bg-yellow-500', description: 'Electronics, batteries', multiplier: 2.5 },
    { id: 'trash', name: 'Trash', emoji: '🗑️', color: 'bg-red-500', description: 'Non-recyclable items', multiplier: 0.5 }
  ];

  const achievements = [
    { id: 'first_sort', name: 'First Sort', emoji: '🎯', description: 'Complete your first sort', requirement: 1, field: 'correctSorts' },
    { id: 'streak_master', name: 'Streak Master', emoji: '🔥', description: 'Get a 10-item streak', requirement: 10, field: 'maxStreak' },
    { id: 'speed_demon', name: 'Speed Demon', emoji: '⚡', description: 'Sort 50 items correctly', requirement: 50, field: 'correctSorts' },
    { id: 'recycling_expert', name: 'Recycling Expert', emoji: '🧙‍♂️', description: 'Reach Wizard Level 5', requirement: 5, field: 'wizardLevel' },
    { id: 'perfect_game', name: 'Perfect Game', emoji: '💎', description: 'Complete a game with 100% accuracy', requirement: 100, field: 'accuracy' },
    { id: 'eco_warrior', name: 'Eco Warrior', emoji: '🌍', description: 'Score 1000 points in one game', requirement: 1000, field: 'score' },
    { id: 'rare_collector', name: 'Rare Collector', emoji: '💎', description: 'Sort 10 rare items', requirement: 10, field: 'rareItems' }
  ];

  const powerUps = [
    { id: 'timeFreeze', name: 'Time Freeze', emoji: '❄️', description: 'Freeze time for 10 seconds', cost: 100 },
    { id: 'doublePoints', name: 'Double Points', emoji: '⭐', description: '2x points for 30 seconds', cost: 150 },
    { id: 'hintMode', name: 'Hint Mode', emoji: '💡', description: 'Show category hints', cost: 75 },
    { id: 'slowMotion', name: 'Slow Motion', emoji: '🐌', description: 'Slow down conveyor belt', cost: 125 }
  ];

  const startGame = () => {
    setGameState({
      score: 0,
      level: 1,
      timeLeft: 60,
      correctSorts: 0,
      wrongSorts: 0,
      streak: 0,
      maxStreak: 0,
      isPlaying: true,
      gameOver: false,
      currentItem: null,
      totalItems: 0,
      wizardXP: 0,
      wizardLevel: 1,
      powerUps: {
        timeFreeze: 1,
        doublePoints: 1,
        hintMode: 1,
        slowMotion: 1
      },
      activePowerUp: null,
      conveyorSpeed: 1,
      combo: 0,
      achievements: [],
      specialEffects: [],
      rareItems: 0
    });
    
    spawnNewItem();
    
    gameTimerRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.activePowerUp === 'timeFreeze') return prev; // Time is frozen
        
        if (prev.timeLeft <= 1) {
          endGame();
          return { ...prev, timeLeft: 0, isPlaying: false, gameOver: true };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  };

  const endGame = () => {
    clearInterval(gameTimerRef.current);
    clearTimeout(itemTimerRef.current);
    setGameState(prev => ({ ...prev, isPlaying: false, gameOver: true }));
  };

  const spawnNewItem = () => {
    // Weighted random selection based on rarity
    const weightedItems = [];
    wasteItems.forEach(item => {
      const weight = item.rarity === 'common' ? 10 : item.rarity === 'uncommon' ? 3 : 1;
      for (let i = 0; i < weight; i++) {
        weightedItems.push(item);
      }
    });
    
    const randomItem = weightedItems[Math.floor(Math.random() * weightedItems.length)];
    setGameState(prev => ({ 
      ...prev, 
      currentItem: randomItem,
      totalItems: prev.totalItems + 1
    }));

    // Add conveyor belt animation timeout
    const conveyorSpeed = gameState.activePowerUp === 'slowMotion' ? 8000 : 5000 / gameState.conveyorSpeed;
    itemTimerRef.current = setTimeout(() => {
      if (gameState.isPlaying && gameState.currentItem) {
        // Item fell off conveyor - count as miss
        setGameState(prev => ({
          ...prev,
          wrongSorts: prev.wrongSorts + 1,
          streak: 0,
          combo: 0,
          currentItem: null
        }));
        setTimeout(() => {
          if (gameState.isPlaying) spawnNewItem();
        }, 500);
      }
    }, conveyorSpeed);
  };

  const usePowerUp = (powerUpId) => {
    if (gameState.powerUps[powerUpId] <= 0) return;

    setGameState(prev => ({
      ...prev,
      powerUps: {
        ...prev.powerUps,
        [powerUpId]: prev.powerUps[powerUpId] - 1
      },
      activePowerUp: powerUpId
    }));

    // Handle different power-ups
    switch (powerUpId) {
      case 'timeFreeze':
        setTimeout(() => {
          setGameState(prev => ({ ...prev, activePowerUp: null }));
        }, 10000);
        break;
      case 'doublePoints':
        setTimeout(() => {
          setGameState(prev => ({ ...prev, activePowerUp: null }));
        }, 30000);
        break;
      case 'hintMode':
        setTimeout(() => {
          setGameState(prev => ({ ...prev, activePowerUp: null }));
        }, 20000);
        break;
      case 'slowMotion':
        setTimeout(() => {
          setGameState(prev => ({ ...prev, activePowerUp: null }));
        }, 15000);
        break;
    }
  };

  const addSpecialEffect = (type, text) => {
    const effect = {
      id: Date.now(),
      type,
      text,
      x: Math.random() * 300,
      y: Math.random() * 200
    };
    
    setGameState(prev => ({
      ...prev,
      specialEffects: [...prev.specialEffects, effect]
    }));

    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        specialEffects: prev.specialEffects.filter(e => e.id !== effect.id)
      }));
    }, 2000);
  };

  const checkAchievements = (newState) => {
    achievements.forEach(achievement => {
      if (!newState.achievements.includes(achievement.id)) {
        let value = newState[achievement.field];
        if (achievement.field === 'accuracy') {
          value = newState.totalItems > 0 ? Math.round((newState.correctSorts / newState.totalItems) * 100) : 0;
        }
        
        if (value >= achievement.requirement) {
          setGameState(prev => ({
            ...prev,
            achievements: [...prev.achievements, achievement.id],
            score: prev.score + 100, // Bonus for achievement
            wizardXP: prev.wizardXP + 50
          }));
          addSpecialEffect('achievement', `🏆 ${achievement.name} Unlocked!`);
        }
      }
    });
  };

  const sortItem = (selectedCategory) => {
    if (!gameState.currentItem) return;

    clearTimeout(itemTimerRef.current);
    const isCorrect = gameState.currentItem.category === selectedCategory;
    const category = categories.find(c => c.id === selectedCategory);
    const rarityBonus = gameState.currentItem.rarity === 'rare' ? 20 : gameState.currentItem.rarity === 'uncommon' ? 10 : 0;
    const streakBonus = isCorrect ? Math.floor(gameState.streak / 5) * 5 : 0;
    const comboBonus = isCorrect ? gameState.combo * 2 : 0;
    const powerUpMultiplier = gameState.activePowerUp === 'doublePoints' ? 2 : 1;
    const categoryMultiplier = category?.multiplier || 1;
    
    let pointsEarned = isCorrect ? 
      Math.floor((gameState.currentItem.points + rarityBonus + streakBonus + comboBonus) * categoryMultiplier * powerUpMultiplier) : 
      -10;

    setGameState(prev => {
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      const newCombo = isCorrect ? prev.combo + 1 : 0;
      const newLevel = Math.floor((prev.correctSorts + (isCorrect ? 1 : 0)) / 10) + 1;
      const wizardXPGain = isCorrect ? 5 + (prev.currentItem.rarity === 'rare' ? 15 : prev.currentItem.rarity === 'uncommon' ? 10 : 0) : 0;
      const newWizardLevel = Math.floor((prev.wizardXP + wizardXPGain) / 100) + 1;
      const newRareItems = prev.rareItems + (isCorrect && prev.currentItem.rarity === 'rare' ? 1 : 0);
      
      const newState = {
        ...prev,
        score: Math.max(0, prev.score + pointsEarned),
        correctSorts: prev.correctSorts + (isCorrect ? 1 : 0),
        wrongSorts: prev.wrongSorts + (isCorrect ? 0 : 1),
        streak: newStreak,
        maxStreak: Math.max(prev.maxStreak, newStreak),
        combo: newCombo,
        level: newLevel,
        wizardXP: prev.wizardXP + wizardXPGain,
        wizardLevel: newWizardLevel,
        conveyorSpeed: Math.min(3, 1 + (newLevel * 0.1)),
        currentItem: null,
        rareItems: newRareItems
      };

      // Check for achievements
      setTimeout(() => checkAchievements(newState), 100);

      return newState;
    });

    // Show feedback effects
    if (isCorrect) {
      if (gameState.currentItem.rarity === 'rare') {
        addSpecialEffect('rare', '💎 RARE ITEM! +' + (pointsEarned));
      } else if (gameState.streak >= 10) {
        addSpecialEffect('streak', '🔥 MEGA STREAK! +' + pointsEarned);
      } else if (pointsEarned > 50) {
        addSpecialEffect('bonus', '⭐ BONUS! +' + pointsEarned);
      } else {
        addSpecialEffect('correct', '✅ +' + pointsEarned);
      }
    } else {
      addSpecialEffect('wrong', '❌ -10');
    }

    // Spawn new item after delay
    setTimeout(() => {
      if (gameState.isPlaying) {
        spawnNewItem();
      }
    }, 500);
  };

  const resetGame = () => {
    clearInterval(gameTimerRef.current);
    clearTimeout(itemTimerRef.current);
    setGameState({
      score: 0,
      level: 1,
      timeLeft: 60,
      correctSorts: 0,
      wrongSorts: 0,
      streak: 0,
      maxStreak: 0,
      isPlaying: false,
      gameOver: false,
      currentItem: null,
      totalItems: 0
    });
  };

  const accuracy = gameState.totalItems > 0 ? Math.round((gameState.correctSorts / gameState.totalItems) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/student/games')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Games
          </Button>
        </div>

        {/* Game Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Recycle className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-purple-800 mb-4">♻️ Recycling Wizard</h1>
          <p className="text-xl text-purple-600 mb-6">
            Sort waste correctly and become a recycling expert!
          </p>

          {/* Game Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-4xl mx-auto mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <div className="text-xl font-bold">{gameState.score}</div>
                <div className="text-sm text-gray-600">Score</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <div className="text-xl font-bold">{gameState.level}</div>
                <div className="text-sm text-gray-600">Level</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Timer className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <div className="text-xl font-bold">{gameState.timeLeft}s</div>
                <div className="text-sm text-gray-600">Time Left</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <div className="text-xl font-bold">{accuracy}%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-blue-600">🔥</div>
                <div className="text-xl font-bold">{gameState.streak}</div>
                <div className="text-sm text-gray-600">Streak</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Award className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <div className="text-xl font-bold">{gameState.maxStreak}</div>
                <div className="text-sm text-gray-600">Best Streak</div>
              </CardContent>
            </Card>
          </div>

          {/* Streak Bonus Indicator */}
          {gameState.streak >= 5 && gameState.isPlaying && (
            <Badge className="mb-4 bg-orange-500 text-white text-lg px-4 py-2">
              🔥 Streak Bonus: +{Math.floor(gameState.streak / 5) * 5} points!
            </Badge>
          )}
        </div>

        {/* Game Area */}
        <Card className="max-w-4xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="text-center">Sorting Station</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Current Item */}
            <div className="text-center mb-8">
              {gameState.currentItem ? (
                <div className="space-y-4">
                  <div className="text-8xl">{gameState.currentItem.emoji}</div>
                  <h3 className="text-2xl font-bold">{gameState.currentItem.name}</h3>
                  <p className="text-gray-600">Where does this item belong?</p>
                  {gameState.streak >= 3 && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-700">💡 Tip: {gameState.currentItem.tip}</p>
                    </div>
                  )}
                </div>
              ) : gameState.isPlaying ? (
                <div className="text-4xl text-gray-400">⏳ Loading next item...</div>
              ) : (
                <div className="space-y-4">
                  <div className="text-6xl">♻️</div>
                  <h3 className="text-2xl font-bold">Ready to Start?</h3>
                  <p className="text-gray-600">Sort waste items into the correct bins!</p>
                  <Button 
                    onClick={startGame}
                    className="bg-purple-500 hover:bg-purple-600 text-white text-xl px-8 py-3"
                  >
                    🧙‍♂️ Start Sorting!
                  </Button>
                </div>
              )}
            </div>

            {/* Game Over Overlay */}
            {gameState.gameOver && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="bg-white p-8 rounded-2xl text-center max-w-md">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                  <h3 className="text-3xl font-bold mb-4">Game Complete!</h3>
                  <div className="space-y-2 mb-6">
                    <p className="text-xl">Final Score: {gameState.score}</p>
                    <p>Correct Sorts: {gameState.correctSorts}</p>
                    <p>Accuracy: {accuracy}%</p>
                    <p>Best Streak: {gameState.maxStreak}</p>
                    <p>Level Reached: {gameState.level}</p>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button 
                      onClick={resetGame}
                      className="bg-purple-500 hover:bg-purple-600 text-white"
                    >
                      🔄 Play Again
                    </Button>
                    <Button 
                      onClick={() => navigate('/student/games')}
                      variant="outline"
                    >
                      🏠 Back to Games
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Recycling Bins */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map(category => (
                <Card 
                  key={category.id}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                    gameState.isPlaying ? 'hover:shadow-lg' : 'opacity-50'
                  }`}
                  onClick={() => gameState.isPlaying && sortItem(category.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <div className="text-2xl">{category.emoji}</div>
                    </div>
                    <h4 className="font-bold text-lg mb-2">{category.name}</h4>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Educational Tips */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">♻️ Recycling Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🧹</div>
                  <div>
                    <h4 className="font-semibold">Clean Before Recycling</h4>
                    <p className="text-sm text-gray-600">Rinse containers to remove food residue and labels.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📦</div>
                  <div>
                    <h4 className="font-semibold">Flatten Cardboard</h4>
                    <p className="text-sm text-gray-600">Break down boxes to save space and improve processing.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🔍</div>
                  <div>
                    <h4 className="font-semibold">Check Local Guidelines</h4>
                    <p className="text-sm text-gray-600">Recycling rules vary by location and facility.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🌱</div>
                  <div>
                    <h4 className="font-semibold">Compost Organic Waste</h4>
                    <p className="text-sm text-gray-600">Food scraps can become nutrient-rich soil.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">♻️</div>
                  <div>
                    <h4 className="font-semibold">Reduce First</h4>
                    <p className="text-sm text-gray-600">The best waste is the waste never created.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🔄</div>
                  <div>
                    <h4 className="font-semibold">Reuse When Possible</h4>
                    <p className="text-sm text-gray-600">Give items a second life before recycling.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecyclingWizard;
