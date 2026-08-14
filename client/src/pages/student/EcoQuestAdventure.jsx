import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Leaf,
  Star,
  Trophy,
  Eye,
  Heart,
  MapPin,
  Award,
} from "lucide-react";

const EcoQuestAdventure = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState({
    currentBiome: 0,
    discoveredSpecies: [],
    score: 0,
    level: 1,
    explorationProgress: 0,
    gameCompleted: false,
  });

  const biomes = [
    {
      id: 0,
      name: "Tropical Rainforest",
      emoji: "🌴",
      description: "Explore the world's most biodiverse ecosystem",
      color: "bg-[#237a57]",
      species: [
        {
          name: "Toucan",
          emoji: "🦜",
          fact: "Toucans have enormous beaks to help them reach fruit on branches too small to support their weight.",
          points: 10,
        },
        {
          name: "Jaguar",
          emoji: "🐆",
          fact: "Jaguars have the strongest bite force of any big cat and can crush turtle shells.",
          points: 15,
        },
        {
          name: "Tree Frog",
          emoji: "🐸",
          fact: "Some tree frogs can change color to blend with their surroundings.",
          points: 10,
        },
        {
          name: "Sloth",
          emoji: "🦥",
          fact: "Sloths move so slowly that algae grows on their fur, helping them camouflage.",
          points: 12,
        },
      ],
    },
    {
      id: 1,
      name: "Ocean Deep",
      emoji: "🌊",
      description: "Dive into the mysterious depths of the ocean",
      color: "bg-[#3b9b8f]",
      species: [
        {
          name: "Dolphin",
          emoji: "🐬",
          fact: "Dolphins have names for each other and call each other by unique whistles.",
          points: 12,
        },
        {
          name: "Sea Turtle",
          emoji: "🐢",
          fact: "Sea turtles use Earth's magnetic field to navigate across thousands of miles.",
          points: 15,
        },
        {
          name: "Whale",
          emoji: "🐋",
          fact: "Blue whales are the largest animals ever known to have lived on Earth.",
          points: 20,
        },
        {
          name: "Jellyfish",
          emoji: "🪼",
          fact: "Some jellyfish are immortal and can reverse their aging process.",
          points: 10,
        },
      ],
    },
    {
      id: 2,
      name: "African Savanna",
      emoji: "🦁",
      description: "Journey through the grasslands where giants roam",
      color: "bg-[#f59e0b]",
      species: [
        {
          name: "Elephant",
          emoji: "🐘",
          fact: "Elephants can recognize themselves in mirrors and mourn their dead.",
          points: 18,
        },
        {
          name: "Lion",
          emoji: "🦁",
          fact: "A lion's roar can be heard from 5 miles away.",
          points: 16,
        },
        {
          name: "Giraffe",
          emoji: "🦒",
          fact: "Giraffes only need 5-30 minutes of sleep per day.",
          points: 14,
        },
        {
          name: "Zebra",
          emoji: "🦓",
          fact: "No two zebras have the same stripe pattern - they're like fingerprints.",
          points: 12,
        },
      ],
    },
  ];

  const currentBiome = biomes[gameState.currentBiome];

  const exploreSpecies = (species) => {
    if (!gameState.discoveredSpecies.find((s) => s.name === species.name)) {
      const newScore = gameState.score + species.points;
      const newDiscovered = [...gameState.discoveredSpecies, species];
      const newProgress = (newDiscovered.length / (biomes.length * 4)) * 100;

      setGameState((prev) => ({
        ...prev,
        discoveredSpecies: newDiscovered,
        score: newScore,
        explorationProgress: newProgress,
        level: Math.floor(newScore / 50) + 1,
        gameCompleted: newDiscovered.length === biomes.length * 4,
      }));
    }
  };

  const nextBiome = () => {
    if (gameState.currentBiome < biomes.length - 1) {
      setGameState((prev) => ({
        ...prev,
        currentBiome: prev.currentBiome + 1,
      }));
    }
  };

  const prevBiome = () => {
    if (gameState.currentBiome > 0) {
      setGameState((prev) => ({
        ...prev,
        currentBiome: prev.currentBiome - 1,
      }));
    }
  };

  const resetGame = () => {
    setGameState({
      currentBiome: 0,
      discoveredSpecies: [],
      score: 0,
      level: 1,
      explorationProgress: 0,
      gameCompleted: false,
    });
  };

  return (
    <div className="min-h-screen bg-amber-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Nature-themed floating elements */}
        <div className="absolute top-20 left-10 text-4xl opacity-30 animate-float-1">
          🌿
        </div>
        <div className="absolute top-40 right-20 text-5xl opacity-25 animate-float-2">
          🦋
        </div>
        <div className="absolute top-60 left-1/4 text-3xl opacity-35 animate-float-3">
          🌸
        </div>
        <div className="absolute bottom-40 right-1/4 text-4xl opacity-30 animate-float-1">
          🍃
        </div>
        <div className="absolute bottom-60 left-20 text-5xl opacity-25 animate-float-2">
          🌺
        </div>
        <div className="absolute top-1/3 right-10 text-4xl opacity-20 animate-float-3">
          🦜
        </div>
        <div className="absolute bottom-1/3 left-1/3 text-3xl opacity-30 animate-float-1">
          🐛
        </div>

        {/* Floating particles */}
        <div className="absolute top-32 left-1/2 w-3 h-3 bg-[#3b9b8f] rounded-full opacity-60 animate-particle-1"></div>
        <div className="absolute top-1/2 right-20 w-4 h-4 bg-[#237a57] rounded-full opacity-50 animate-particle-2"></div>
        <div className="absolute bottom-20 left-1/4 w-2 h-2 bg-[#f59e0b] rounded-full opacity-70 animate-particle-1"></div>
        <div className="absolute top-3/4 right-1/3 w-3 h-3 bg-[#3b9b8f] rounded-full opacity-40 animate-particle-1"></div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(-20px) translateX(10px) rotate(5deg); }
          50% { transform: translateY(-15px) translateX(-5px) rotate(-3deg); }
          75% { transform: translateY(-25px) translateX(15px) rotate(8deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          33% { transform: translateY(-25px) translateX(-12px) scale(1.1); }
          66% { transform: translateY(-18px) translateX(8px) scale(0.9); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          50% { transform: translateY(-30px) translateX(-15px) rotate(10deg); }
        }
        @keyframes particle-1 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.6; }
          25% { transform: translateY(-40px) translateX(20px); opacity: 0.8; }
          50% { transform: translateY(-60px) translateX(-10px); opacity: 0.4; }
          75% { transform: translateY(-30px) translateX(25px); opacity: 0.7; }
        }
        @keyframes particle-2 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.5; }
          50% { transform: translateY(-50px) translateX(-20px); opacity: 0.8; }
        }
        @keyframes particle-3 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.7; }
          33% { transform: translateY(-35px) translateX(15px); opacity: 0.3; }
          66% { transform: translateY(-25px) translateX(-8px); opacity: 0.9; }
        }
        .animate-float-1 { animation: float-1 8s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 6s ease-in-out infinite; }
        .animate-float-3 { animation: float-3 7s ease-in-out infinite; }
        .animate-particle-1 { animation: particle-1 10s ease-in-out infinite; }
        .animate-particle-2 { animation: particle-2 8s ease-in-out infinite; }
        .animate-particle-3 { animation: particle-3 12s ease-in-out infinite; }
      `}</style>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/student/games")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Games
          </Button>
        </div>

        {/* Game Header */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 bg-[#237a57] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse-slow">
            <Leaf className="w-16 h-16 text-white animate-bounce-gentle" />
          </div>

          <h1 className="text-5xl font-bold text-[#237a57] mb-4 tracking-wide">
            🌿 EcoQuest Adventure
          </h1>
          <p className="text-2xl text-[#237a57] mb-6 font-medium">
            🦋 Explore ecosystems and discover amazing species! 🌺
          </p>

          {/* CSS for additional animations */}
          <style>{`
            @keyframes pulse-slow {
              0%, 100% { transform: scale(1); box-shadow: 0 20px 40px rgba(52, 211, 153, 0.3); }
              50% { transform: scale(1.05); box-shadow: 0 25px 50px rgba(52, 211, 153, 0.4); }
            }
            @keyframes bounce-gentle {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-8px); }
            }
            .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
            .animate-bounce-gentle { animation: bounce-gentle 2s ease-in-out infinite; }
          `}</style>

          {/* Game Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 bg-amber-50 border-[#f59e0b]">
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3 group-hover:animate-spin" />
                <div className="text-3xl font-bold text-yellow-700">
                  {gameState.score}
                </div>
                <div className="text-sm text-yellow-600 font-semibold">
                  Score
                </div>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 bg-orange-50 border-orange-400">
              <CardContent className="p-6 text-center">
                <Trophy className="w-8 h-8 text-orange-500 mx-auto mb-3 group-hover:animate-bounce" />
                <div className="text-3xl font-bold text-orange-700">
                  {gameState.level}
                </div>
                <div className="text-sm text-orange-600 font-semibold">
                  Level
                </div>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <Eye className="w-8 h-8 text-blue-500 mx-auto mb-3 group-hover:animate-pulse" />
                <div className="text-3xl font-bold text-blue-700">
                  {gameState.discoveredSpecies.length}
                </div>
                <div className="text-sm text-blue-600 font-semibold">
                  Discovered
                </div>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 bg-teal-50 border-[#3b9b8f]">
              <CardContent className="p-6 text-center">
                <MapPin className="w-8 h-8 text-purple-500 mx-auto mb-3 group-hover:animate-pulse" />
                <div className="text-3xl font-bold text-purple-700">
                  {gameState.currentBiome + 1}/3
                </div>
                <div className="text-sm text-purple-600 font-semibold">
                  Biomes
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-bold text-emerald-700">
                🌍 Exploration Progress
              </span>
              <span className="text-lg text-emerald-600 font-semibold">
                {Math.round(gameState.explorationProgress)}%
              </span>
            </div>
            <div className="relative">
              <Progress
                value={gameState.explorationProgress}
                className="h-4 bg-gray-200"
              />
              <div className="absolute inset-0 bg-[#237a57] rounded-full opacity-20 animate-pulse"></div>
            </div>
            <div className="text-center mt-2 text-sm text-emerald-600">
              {gameState.discoveredSpecies.length} of {biomes.length * 4}{" "}
              species discovered
            </div>
          </div>
        </div>

        {/* Current Biome */}
        <Card className="max-w-6xl mx-auto mb-8 shadow-2xl border-2 hover:border-emerald-300 transition-all duration-500">
          <CardHeader>
            <div
              className={`w-full h-48 ${currentBiome.color} rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden shadow-inner`}
            >
              <div className="text-8xl animate-bounce-gentle">
                {currentBiome.emoji}
              </div>
              {/* Biome-specific floating elements */}
              {currentBiome.id === 0 && (
                <>
                  <div className="absolute top-4 left-8 text-3xl opacity-60 animate-float-1">
                    🌴
                  </div>
                  <div className="absolute bottom-6 right-10 text-4xl opacity-50 animate-float-2">
                    🦜
                  </div>
                  <div className="absolute top-8 right-1/4 text-2xl opacity-70 animate-float-3">
                    🐸
                  </div>
                </>
              )}
              {currentBiome.id === 1 && (
                <>
                  <div className="absolute top-6 left-12 text-3xl opacity-60 animate-float-1">
                    🐠
                  </div>
                  <div className="absolute bottom-8 right-8 text-4xl opacity-50 animate-float-2">
                    🐙
                  </div>
                  <div className="absolute top-1/3 right-1/4 text-2xl opacity-70 animate-float-3">
                    🐡
                  </div>
                </>
              )}
              {currentBiome.id === 2 && (
                <>
                  <div className="absolute top-4 left-10 text-3xl opacity-60 animate-float-1">
                    🦁
                  </div>
                  <div className="absolute bottom-6 right-12 text-4xl opacity-50 animate-float-2">
                    🐘
                  </div>
                  <div className="absolute top-8 right-1/3 text-2xl opacity-70 animate-float-3">
                    🦒
                  </div>
                </>
              )}
            </div>
            <CardTitle className="text-4xl text-center font-bold text-[#237a57]">
              {currentBiome.name}
            </CardTitle>
            <p className="text-center text-gray-700 text-lg font-medium">
              {currentBiome.description}
            </p>
          </CardHeader>
          <CardContent>
            {/* Biome Navigation */}
            <div className="flex justify-between items-center mb-8">
              <Button
                variant="outline"
                onClick={prevBiome}
                disabled={gameState.currentBiome === 0}
                className="bg-gradient-to-r from-emerald-100 to-green-100 border-emerald-300 hover:from-emerald-200 hover:to-green-200 text-emerald-700 font-semibold text-lg px-6 py-3 shadow-lg"
              >
                🌿 ← Previous Biome
              </Button>
              <Badge
                variant="secondary"
                className="text-xl px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-300 font-bold"
              >
                🌍 Biome {gameState.currentBiome + 1} of {biomes.length}
              </Badge>
              <Button
                variant="outline"
                onClick={nextBiome}
                disabled={gameState.currentBiome === biomes.length - 1}
                className="bg-gradient-to-r from-emerald-100 to-green-100 border-emerald-300 hover:from-emerald-200 hover:to-green-200 text-emerald-700 font-semibold text-lg px-6 py-3 shadow-lg"
              >
                Next Biome → 🌺
              </Button>
            </div>

            {/* Species Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {currentBiome.species.map((species, index) => {
                const isDiscovered = gameState.discoveredSpecies.find(
                  (s) => s.name === species.name
                );
                return (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all duration-500 hover:shadow-2xl group relative overflow-hidden ${
                      isDiscovered
                        ? "bg-amber-50 border-2 border-[#f59e0b] shadow-lg"
                        : "hover:bg-gradient-to-br hover:from-gray-50 hover:to-emerald-50 border-2 border-gray-200 hover:border-emerald-300"
                    }`}
                    onClick={() => exploreSpecies(species)}
                  >
                    {/* Card Background Effect */}
                    <div
                      className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                        isDiscovered
                          ? "bg-gradient-to-br from-green-100/50 to-emerald-100/50"
                          : "bg-gradient-to-br from-emerald-100/30 to-cyan-100/30"
                      }`}
                    ></div>

                    <CardContent className="p-8 relative z-10">
                      <div className="text-center">
                        <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                          {species.emoji}
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-emerald-700 transition-colors duration-300">
                          {species.name}
                        </h3>
                        {isDiscovered ? (
                          <div className="space-y-4">
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 text-base shadow-lg">
                              <Award className="w-4 h-4 mr-2" />
                              Discovered! +{species.points} pts ✨
                            </Badge>
                            <div className="bg-amber-50 border border-[#f59e0b] rounded-lg p-4">
                              <p className="text-sm text-[#237a57] italic leading-relaxed font-medium">
                                "💡 {species.fact}"
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Badge
                              variant="outline"
                              className="bg-gradient-to-r from-emerald-50 to-cyan-50 border-emerald-300 text-emerald-700 px-4 py-2 text-base font-semibold"
                            >
                              🔍 Click to Explore
                            </Badge>
                            <p className="text-gray-600 font-medium">
                              🌟 Mystery species waiting to be discovered
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Game Completion */}
        {gameState.gameCompleted && (
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 text-white shadow-2xl border-0">
            <CardContent className="p-12 text-center relative overflow-hidden">
              {/* Celebratory background elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-4 left-8 text-4xl opacity-60 animate-bounce">
                  🎉
                </div>
                <div className="absolute top-8 right-12 text-3xl opacity-50 animate-pulse">
                  ✨
                </div>
                <div className="absolute bottom-6 left-12 text-5xl opacity-40 animate-spin-slow">
                  🏆
                </div>
                <div className="absolute bottom-4 right-8 text-4xl opacity-60 animate-bounce">
                  🎊
                </div>
              </div>

              <div className="relative z-10">
                <Trophy className="w-24 h-24 mx-auto mb-6 animate-bounce" />
                <h2 className="text-5xl font-bold mb-6">
                  🎉 Quest Complete! 🎉
                </h2>
                <p className="text-2xl mb-6 font-medium">
                  Congratulations! You've discovered all{" "}
                  {gameState.discoveredSpecies.length} species!
                </p>
                <div className="bg-white/20 rounded-2xl p-6 mb-8 backdrop-blur-sm">
                  <p className="text-xl mb-2">
                    🌟 Final Score:{" "}
                    <span className="font-bold text-yellow-200">
                      {gameState.score} points
                    </span>
                  </p>
                  <p className="text-xl">
                    🏅 Final Level:{" "}
                    <span className="font-bold text-yellow-200">
                      {gameState.level}
                    </span>
                  </p>
                </div>
                <div className="flex gap-6 justify-center">
                  <Button
                    onClick={resetGame}
                    className="bg-white/20 hover:bg-white/30 border-2 border-white text-white font-bold text-lg px-8 py-4 backdrop-blur-sm"
                  >
                    🔄 Play Again
                  </Button>
                  <Button
                    onClick={() => navigate("/student/games")}
                    className="bg-white/20 hover:bg-white/30 border-2 border-white text-white font-bold text-lg px-8 py-4 backdrop-blur-sm"
                  >
                    🎮 Back to Games
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game Controls */}
        {!gameState.gameCompleted && (
          <div className="text-center">
            <Button
              onClick={resetGame}
              variant="outline"
              className="bg-gradient-to-r from-red-50 to-pink-50 border-red-300 hover:from-red-100 hover:to-pink-100 text-red-700 font-semibold px-8 py-3 text-lg shadow-lg"
            >
              🔄 Reset Adventure
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EcoQuestAdventure;
