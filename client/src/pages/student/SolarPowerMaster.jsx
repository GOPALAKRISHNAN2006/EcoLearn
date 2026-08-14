import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Sun,
  Star,
  Trophy,
  Zap,
  Battery,
  Home,
  Coins,
  MapPin,
  Clock,
  Target,
} from "lucide-react";

const SolarPowerMaster = () => {
  const navigate = useNavigate();
  const gameAreaRef = useRef(null);
  const [gameState, setGameState] = useState({
    money: 1000,
    energy: 0,
    totalEnergyGenerated: 0,
    carbonReduced: 0,
    level: 1,
    experience: 0,
    achievements: [],
    currentMission: 0,
    gameTime: 0,
    isPlaying: false,
    selectedTool: "solar_panel",
    inventory: {
      solar_panels: 5,
      batteries: 2,
      power_lines: 10,
    },
    grid: Array(64).fill(null), // 8x8 grid
    connectedHouses: 0,
    powerDemand: 100,
    powerSupply: 0,
    weatherCondition: "sunny",
    weatherTimer: 0,
    disasters: [],
  });

  const [selectedCell, setSelectedCell] = useState(null);
  const [missionDialog, setMissionDialog] = useState(true);

  const tools = [
    {
      id: "solar_panel",
      name: "Solar Panel",
      emoji: "☀️",
      cost: 100,
      energyOutput: 20,
      description: "Generate clean energy from sunlight",
    },
    {
      id: "wind_turbine",
      name: "Wind Turbine",
      emoji: "💨",
      cost: 200,
      energyOutput: 30,
      description: "Harness wind power for energy",
    },
    {
      id: "battery",
      name: "Battery",
      emoji: "🔋",
      cost: 150,
      capacity: 50,
      description: "Store energy for later use",
    },
    {
      id: "power_line",
      name: "Power Line",
      emoji: "⚡",
      cost: 50,
      description: "Connect energy sources to houses",
    },
    {
      id: "house",
      name: "House",
      emoji: "🏠",
      cost: 300,
      demand: 25,
      description: "Residential building that needs power",
    },
    {
      id: "factory",
      name: "Factory",
      emoji: "🏭",
      cost: 500,
      demand: 75,
      description: "Industrial building with high energy needs",
    },
  ];

  const missions = [
    {
      id: 0,
      title: "🌱 Green Beginner",
      description: "Build your first solar panel and connect it to a house",
      objectives: [
        "Place 1 Solar Panel",
        "Connect 1 House",
        "Generate 100 energy units",
      ],
      reward: 500,
      timeLimit: 120,
    },
    {
      id: 1,
      title: "⚡ Power Grid Builder",
      description: "Expand your renewable energy network",
      objectives: [
        "Build 3 Solar Panels",
        "Connect 3 Houses",
        "Maintain 80% efficiency",
      ],
      reward: 1000,
      timeLimit: 180,
    },
    {
      id: 2,
      title: "🌪️ Weather Challenge",
      description: "Survive changing weather conditions",
      objectives: [
        "Build Wind Turbines",
        "Store 200 energy in batteries",
        "Power 5 buildings",
      ],
      reward: 1500,
      timeLimit: 240,
    },
    {
      id: 3,
      title: "� Industrial Revolution",
      description: "Power an entire industrial district",
      objectives: [
        "Connect 2 Factories",
        "Generate 500+ energy/min",
        "Reduce 100 tons CO2",
      ],
      reward: 2000,
      timeLimit: 300,
    },
  ];

  const weatherConditions = [
    {
      type: "sunny",
      emoji: "☀️",
      solarMultiplier: 1.0,
      windMultiplier: 0.7,
      name: "Sunny",
    },
    {
      type: "cloudy",
      emoji: "☁️",
      solarMultiplier: 0.6,
      windMultiplier: 0.9,
      name: "Cloudy",
    },
    {
      type: "windy",
      emoji: "💨",
      solarMultiplier: 0.8,
      windMultiplier: 1.3,
      name: "Windy",
    },
    {
      type: "stormy",
      emoji: "⛈️",
      solarMultiplier: 0.3,
      windMultiplier: 1.5,
      name: "Stormy",
    },
  ];

  const disasters = [
    {
      type: "blackout",
      emoji: "⚡",
      effect: "Power demand increases by 50%",
      duration: 30,
    },
    {
      type: "equipment_failure",
      emoji: "🔧",
      effect: "Random equipment stops working",
      duration: 45,
    },
    {
      type: "energy_crisis",
      emoji: "🚨",
      effect: "Must generate 200% more energy",
      duration: 60,
    },
  ];

  const achievements = [
    {
      id: "first_panel",
      emoji: "☀️",
      name: "First Light",
      description: "Place your first solar panel",
      field: "totalEnergyGenerated",
      requirement: 1,
    },
    {
      id: "energy_100",
      emoji: "⚡",
      name: "Power Up",
      description: "Generate 100 energy units",
      field: "totalEnergyGenerated",
      requirement: 100,
    },
    {
      id: "energy_500",
      emoji: "🔋",
      name: "Energy Master",
      description: "Generate 500 energy units",
      field: "totalEnergyGenerated",
      requirement: 500,
    },
    {
      id: "carbon_50",
      emoji: "🌱",
      name: "Eco Warrior",
      description: "Reduce 50 tons of CO2",
      field: "carbonReduced",
      requirement: 50,
    },
    {
      id: "carbon_200",
      emoji: "🌍",
      name: "Planet Saver",
      description: "Reduce 200 tons of CO2",
      field: "carbonReduced",
      requirement: 200,
    },
    {
      id: "level_5",
      emoji: "🏆",
      name: "Rising Star",
      description: "Reach level 5",
      field: "level",
      requirement: 5,
    },
  ];

  // Game Logic Functions
  const placeTool = (cellIndex, toolType) => {
    const tool = tools.find((t) => t.id === toolType);
    if (!tool || gameState.money < tool.cost) return;

    if (gameState.grid[cellIndex] !== null) return; // Cell occupied

    const newGrid = [...gameState.grid];
    newGrid[cellIndex] = {
      type: toolType,
      ...tool,
      id: Date.now(),
      efficiency: 1.0,
      connected: false,
    };

    setGameState((prev) => ({
      ...prev,
      grid: newGrid,
      money: prev.money - tool.cost,
      experience: prev.experience + 10,
    }));

    calculateConnections(newGrid);
  };

  const calculateConnections = (grid) => {
    // Simplified connection logic - check for adjacent power lines
    const newGrid = grid.map((cell, index) => {
      if (!cell) return cell;

      const row = Math.floor(index / 8);
      const col = index % 8;
      const adjacent = [
        grid[index - 8], // up
        grid[index + 8], // down
        col > 0 ? grid[index - 1] : null, // left
        col < 7 ? grid[index + 1] : null, // right
      ].filter(Boolean);

      const hasConnection = adjacent.some(
        (adj) =>
          adj.type === "power_line" ||
          adj.type === "solar_panel" ||
          adj.type === "wind_turbine" ||
          adj.connected
      );

      return {
        ...cell,
        connected: hasConnection || cell.type === "power_line",
      };
    });

    setGameState((prev) => ({ ...prev, grid: newGrid }));
  };

  const generateEnergy = () => {
    const currentWeather = weatherConditions.find(
      (w) => w.type === gameState.weatherCondition
    );
    let totalGeneration = 0;
    let totalDemand = 0;

    gameState.grid.forEach((cell) => {
      if (!cell || !cell.connected) return;

      if (cell.type === "solar_panel") {
        totalGeneration +=
          cell.energyOutput * currentWeather.solarMultiplier * cell.efficiency;
      } else if (cell.type === "wind_turbine") {
        totalGeneration +=
          cell.energyOutput * currentWeather.windMultiplier * cell.efficiency;
      } else if (cell.type === "house" || cell.type === "factory") {
        totalDemand += cell.demand;
      }
    });

    const energyBalance = totalGeneration - totalDemand;
    const carbonReduction = Math.max(0, totalGeneration * 0.1);

    setGameState((prev) => ({
      ...prev,
      powerSupply: totalGeneration,
      powerDemand: totalDemand,
      energy: Math.max(0, prev.energy + energyBalance),
      totalEnergyGenerated:
        prev.totalEnergyGenerated + Math.max(0, totalGeneration),
      carbonReduced: prev.carbonReduced + carbonReduction,
      money: prev.money + Math.max(0, energyBalance * 0.5),
    }));
  };

  const changeWeather = () => {
    const newWeather =
      weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    setGameState((prev) => ({
      ...prev,
      weatherCondition: newWeather.type,
      weatherTimer: 0,
    }));
  };

  const triggerDisaster = () => {
    if (Math.random() < 0.1 && gameState.disasters.length === 0) {
      // 10% chance, no active disasters
      const disaster = disasters[Math.floor(Math.random() * disasters.length)];
      setGameState((prev) => ({
        ...prev,
        disasters: [
          {
            ...disaster,
            id: Date.now(),
            timeRemaining: disaster.duration,
          },
        ],
      }));
    }
  };

  const startGame = () => {
    setGameState((prev) => ({ ...prev, isPlaying: true, gameTime: 0 }));
    setMissionDialog(false);
  };

  const checkMissionComplete = () => {
    const mission = missions[gameState.currentMission];
    if (!mission) return;

    // Check objectives based on current mission
    let objectivesComplete = 0;

    if (gameState.currentMission === 0) {
      if (gameState.grid.some((cell) => cell?.type === "solar_panel"))
        objectivesComplete++;
      if (
        gameState.grid.some((cell) => cell?.type === "house" && cell.connected)
      )
        objectivesComplete++;
      if (gameState.totalEnergyGenerated >= 100) objectivesComplete++;
    }

    if (objectivesComplete >= mission.objectives.length) {
      setGameState((prev) => ({
        ...prev,
        currentMission: prev.currentMission + 1,
        money: prev.money + mission.reward,
        experience: prev.experience + 100,
      }));
      setMissionDialog(true);
    }
  };

  // Game Loop
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const gameLoop = setInterval(() => {
      setGameState((prev) => ({
        ...prev,
        gameTime: prev.gameTime + 1,
        weatherTimer: prev.weatherTimer + 1,
      }));

      generateEnergy();

      // Weather changes every 30 seconds
      if (gameState.weatherTimer >= 30) {
        changeWeather();
      }

      // Random disasters
      triggerDisaster();

      // Check mission completion
      checkMissionComplete();
    }, 1000);

    return () => clearInterval(gameLoop);
  }, [gameState.isPlaying, gameState.grid, gameState.weatherCondition]);

  const currentWeather = weatherConditions.find(
    (w) => w.type === gameState.weatherCondition
  );
  const currentMission = missions[gameState.currentMission];
  const efficiency =
    gameState.powerDemand > 0
      ? Math.min((gameState.powerSupply / gameState.powerDemand) * 100, 100)
      : 0;

  return (
    <div className="min-h-screen bg-amber-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Sun rays */}
        <div className="absolute top-10 left-20 w-1 h-32 bg-gradient-to-b from-yellow-300/50 to-transparent animate-sunray-1"></div>
        <div className="absolute top-16 right-32 w-1 h-40 bg-gradient-to-b from-orange-300/40 to-transparent animate-sunray-2"></div>
        <div className="absolute top-8 left-1/2 w-1 h-36 bg-gradient-to-b from-yellow-400/45 to-transparent animate-sunray-3"></div>

        {/* Floating energy particles */}
        <div className="absolute top-32 left-1/4 w-3 h-3 bg-yellow-400 rounded-full opacity-60 animate-energy-float-1"></div>
        <div className="absolute top-1/2 right-20 w-4 h-4 bg-orange-400 rounded-full opacity-50 animate-energy-float-2"></div>
        <div className="absolute bottom-1/4 left-20 w-2 h-2 bg-red-400 rounded-full opacity-70 animate-energy-float-3"></div>

        {/* Animated Icons */}
        <div className="absolute top-20 right-10 text-4xl opacity-20 animate-spin-slow">
          ⚡
        </div>
        <div className="absolute bottom-20 left-10 text-5xl opacity-15 animate-bounce-slow">
          ☀️
        </div>
        <div className="absolute top-1/3 left-10 text-3xl opacity-25 animate-pulse-slow">
          🔋
        </div>
      </div>

      {/* Advanced CSS Animations */}
      <style>{`
        @keyframes sunray-1 {
          0%, 100% { opacity: 0.5; transform: rotate(2deg) scaleY(1); }
          50% { opacity: 0.8; transform: rotate(-2deg) scaleY(1.2); }
        }
        @keyframes sunray-2 {
          0%, 100% { opacity: 0.4; transform: rotate(-1deg) scaleY(1); }
          50% { opacity: 0.7; transform: rotate(3deg) scaleY(1.1); }
        }
        @keyframes sunray-3 {
          0%, 100% { opacity: 0.45; transform: rotate(1deg) scaleY(1); }
          50% { opacity: 0.75; transform: rotate(-1deg) scaleY(1.3); }
        }
        @keyframes energy-float-1 {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          25% { transform: translateY(-30px) translateX(20px) scale(1.2); }
          50% { transform: translateY(-60px) translateX(-10px) scale(0.8); }
          75% { transform: translateY(-40px) translateX(30px) scale(1.1); }
        }
        @keyframes energy-float-2 {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          50% { transform: translateY(-80px) translateX(-25px) scale(1.3); }
        }
        @keyframes energy-float-3 {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          33% { transform: translateY(-50px) translateX(15px) scale(1.1); }
          66% { transform: translateY(-70px) translateX(-20px) scale(0.9); }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        .animate-sunray-1 { animation: sunray-1 6s ease-in-out infinite; }
        .animate-sunray-2 { animation: sunray-2 5s ease-in-out infinite 2s; }
        .animate-sunray-3 { animation: sunray-3 7s ease-in-out infinite 1s; }
        .animate-energy-float-1 { animation: energy-float-1 8s ease-in-out infinite; }
        .animate-energy-float-2 { animation: energy-float-2 6s ease-in-out infinite 1s; }
        .animate-energy-float-3 { animation: energy-float-3 10s ease-in-out infinite 2s; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
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

        {/* Mission Dialog */}
        {missionDialog && currentMission && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
            <Card className="max-w-2xl mx-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-center text-3xl font-bold text-orange-800">
                  🎯 {currentMission.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-center text-lg text-orange-700 font-medium">
                  {currentMission.description}
                </p>

                <div className="bg-white/60 rounded-xl p-4">
                  <h4 className="font-bold text-orange-800 mb-3">
                    📋 Mission Objectives:
                  </h4>
                  <ul className="space-y-2">
                    {currentMission.objectives.map((objective, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-orange-700"
                      >
                        <span className="text-xl">⭐</span>
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between bg-green-100 rounded-xl p-4">
                  <div>
                    <span className="text-green-800 font-bold">
                      💰 Reward: ${currentMission.reward}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-800 font-bold">
                      ⏱️ Time Limit: {Math.floor(currentMission.timeLimit / 60)}
                      :
                      {(currentMission.timeLimit % 60)
                        .toString()
                        .padStart(2, "0")}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={startGame}
                    className="bg-[#237a57] hover:bg-[#f59e0b] text-white font-bold px-8 py-3 text-lg shadow-lg"
                  >
                    🚀 Start Mission
                  </Button>
                  <Button
                    onClick={() => navigate("/student/games")}
                    variant="outline"
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    🏠 Back to Games
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Game Header */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-energy-pulse">
            <Sun className="w-16 h-16 text-white animate-spin-gentle" />
          </div>

          <h1 className="text-5xl font-bold text-[#f59e0b] mb-4 tracking-wide">
            ⚡ Solar Power Master Adventure
          </h1>
          <p className="text-2xl text-orange-700 mb-6 font-medium">
            🌞 Build renewable energy systems and power the future! 🏭
          </p>

          {/* Enhanced CSS Animations */}
          <style>{`
            @keyframes energy-pulse {
              0%, 100% { 
                transform: scale(1); 
                box-shadow: 0 20px 40px rgba(251, 146, 60, 0.3), 0 0 0 0 rgba(251, 146, 60, 0.7);
              }
              50% { 
                transform: scale(1.05); 
                box-shadow: 0 25px 50px rgba(251, 146, 60, 0.4), 0 0 0 20px rgba(251, 146, 60, 0);
              }
            }
            @keyframes spin-gentle {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .animate-energy-pulse { animation: energy-pulse 3s ease-in-out infinite; }
            .animate-spin-gentle { animation: spin-gentle 10s linear infinite; }
          `}</style>

          {/* Game Stats - Enhanced */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="p-4 text-center">
                <Coins className="w-8 h-8 text-yellow-500 mx-auto mb-2 group-hover:animate-bounce" />
                <div className="text-2xl font-bold text-yellow-700">
                  ${gameState.money}
                </div>
                <div className="text-sm text-yellow-600 font-semibold">
                  Money
                </div>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white border-[#3b9b8f]">
              <CardContent className="p-4 text-center">
                <Zap className="w-8 h-8 text-blue-500 mx-auto mb-2 group-hover:animate-pulse" />
                <div className="text-2xl font-bold text-blue-700">
                  {Math.round(gameState.energy)}
                </div>
                <div className="text-sm text-blue-600 font-semibold">
                  Energy Stored
                </div>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white border-[#237a57]">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2 group-hover:animate-bounce">
                  🌍
                </div>
                <div className="text-2xl font-bold text-green-700">
                  {Math.round(gameState.carbonReduced)}
                </div>
                <div className="text-sm text-green-600 font-semibold">
                  CO2 Reduced
                </div>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white border-[#3b9b8f]">
              <CardContent className="p-4 text-center">
                <Trophy className="w-8 h-8 text-purple-500 mx-auto mb-2 group-hover:animate-spin" />
                <div className="text-2xl font-bold text-purple-700">
                  {gameState.level}
                </div>
                <div className="text-sm text-purple-600 font-semibold">
                  Level
                </div>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2 group-hover:animate-pulse" />
                <div className="text-2xl font-bold text-orange-700">
                  {Math.floor(gameState.gameTime / 60)}:
                  {(gameState.gameTime % 60).toString().padStart(2, "0")}
                </div>
                <div className="text-sm text-orange-600 font-semibold">
                  Mission Time
                </div>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 text-emerald-500 mx-auto mb-2 group-hover:animate-bounce" />
                <div className="text-2xl font-bold text-emerald-700">
                  {Math.round(efficiency)}%
                </div>
                <div className="text-sm text-emerald-600 font-semibold">
                  Efficiency
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weather and Disaster Alerts */}
          <div className="flex gap-4 justify-center mb-6">
            <Card className="bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-200">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">
                  {currentWeather?.emoji || "☀️"}
                </div>
                <div className="font-semibold text-blue-700">
                  {currentWeather?.name || "Sunny"} Weather
                </div>
                <div className="text-sm text-blue-600">
                  Solar:{" "}
                  {Math.round((currentWeather?.solarMultiplier || 1) * 100)}% |
                  Wind:{" "}
                  {Math.round((currentWeather?.windMultiplier || 0.7) * 100)}%
                </div>
              </CardContent>
            </Card>

            {gameState.disasters.map((disaster) => (
              <Card
                key={disaster.id}
                className="bg-gradient-to-r from-red-100 to-pink-100 border-red-200"
              >
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2 animate-pulse">
                    {disaster.emoji}
                  </div>
                  <div className="font-semibold text-red-700">
                    {disaster.type.replace("_", " ").toUpperCase()}
                  </div>
                  <div className="text-sm text-red-600">
                    {disaster.timeRemaining}s left
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Coins className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-xl font-bold">${gameState.money}</div>
              <div className="text-sm text-gray-600">Money</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Sun className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <div className="text-xl font-bold">{gameState.solarPanels}</div>
              <div className="text-sm text-gray-600">Solar Panels</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-xl font-bold">
                {Math.round(gameState.powerGenerated)}
              </div>
              <div className="text-sm text-gray-600">Power Generated</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Home className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <div className="text-xl font-bold">
                {gameState.housesConnected}
              </div>
              <div className="text-sm text-gray-600">Houses Powered</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-lg font-bold text-green-600">🌍</div>
              <div className="text-xl font-bold">{gameState.carbonReduced}</div>
              <div className="text-sm text-gray-600">CO2 Reduced (tons)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <div className="text-xl font-bold">{gameState.level}</div>
              <div className="text-sm text-gray-600">Level</div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Tool Selection */}
          <Card className="lg:col-span-1 shadow-xl border-2 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold text-orange-800">
                🔧 Energy Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      gameState.selectedTool === tool.id
                        ? "border-orange-400 bg-orange-50 shadow-lg scale-105"
                        : "border-gray-200 hover:border-orange-300 hover:bg-orange-25"
                    }`}
                    onClick={() =>
                      setGameState((prev) => ({
                        ...prev,
                        selectedTool: tool.id,
                      }))
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{tool.emoji}</div>
                        <div>
                          <div className="font-bold text-gray-800">
                            {tool.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {tool.description}
                          </div>
                          {tool.energyOutput && (
                            <div className="text-sm text-green-600">
                              ⚡ {tool.energyOutput} energy/min
                            </div>
                          )}
                          {tool.demand && (
                            <div className="text-sm text-red-600">
                              🔌 {tool.demand} demand
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-yellow-700">
                          ${tool.cost}
                        </div>
                        {gameState.money < tool.cost && (
                          <div className="text-xs text-red-500">
                            Insufficient funds
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interactive Grid */}
          <Card className="lg:col-span-2 shadow-xl border-2 border-orange-200">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold text-orange-800">
                🌍 Energy Grid Builder
              </CardTitle>
              <div className="text-center text-sm text-orange-600">
                Click on empty cells to place selected tool
              </div>
            </CardHeader>
            <CardContent>
              <div
                ref={gameAreaRef}
                className="grid grid-cols-8 gap-2 bg-gradient-to-br from-green-100 to-blue-100 p-4 rounded-xl border-4 border-green-300"
                style={{ aspectRatio: "1" }}
              >
                {gameState.grid.map((cell, index) => (
                  <div
                    key={index}
                    className={`
                      aspect-square border-2 rounded-lg flex items-center justify-center text-2xl cursor-pointer transition-all duration-300
                      ${
                        cell
                          ? cell.connected
                            ? "bg-green-200 border-green-400 shadow-lg hover:scale-110"
                            : "bg-red-200 border-red-400 hover:scale-105"
                          : "bg-white/60 border-gray-300 hover:bg-yellow-100 hover:border-yellow-400 hover:scale-105"
                      }
                      ${selectedCell === index ? "ring-4 ring-blue-400" : ""}
                    `}
                    onClick={() => {
                      if (!cell && gameState.selectedTool) {
                        placeTool(index, gameState.selectedTool);
                      }
                      setSelectedCell(index);
                    }}
                  >
                    {cell ? (
                      <div className="relative">
                        <span
                          className={
                            cell.connected ? "animate-bounce" : "opacity-50"
                          }
                        >
                          {cell.emoji}
                        </span>
                        {cell.connected && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-lg">+</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Grid Legend */}
              <div className="mt-4 flex gap-4 justify-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-200 border-2 border-green-400 rounded"></div>
                  <span>Connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-200 border-2 border-red-400 rounded"></div>
                  <span>Disconnected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white/60 border-2 border-gray-300 rounded"></div>
                  <span>Empty</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Power Flow Visualization */}
        <Card className="max-w-4xl mx-auto mb-8 shadow-xl border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-blue-800">
              ⚡ Power Grid Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold text-green-700">
                      🔋 Energy Supply
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {Math.round(gameState.powerSupply)} MW
                    </span>
                  </div>
                  <Progress
                    value={Math.min((gameState.powerSupply / 200) * 100, 100)}
                    className="h-4 bg-gray-200"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold text-red-700">
                      🏠 Energy Demand
                    </span>
                    <span className="text-lg font-bold text-red-600">
                      {Math.round(gameState.powerDemand)} MW
                    </span>
                  </div>
                  <Progress
                    value={Math.min((gameState.powerDemand / 200) * 100, 100)}
                    className="h-4 bg-gray-200"
                  />
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 border-2 border-blue-200">
                <div className="text-center">
                  <div
                    className={`text-4xl mb-3 ${
                      efficiency >= 80
                        ? "animate-bounce"
                        : efficiency >= 50
                        ? "animate-pulse"
                        : "animate-pulse"
                    }`}
                  >
                    {efficiency >= 80 ? "🌟" : efficiency >= 50 ? "⚡" : "⚠️"}
                  </div>
                  <div className="text-2xl font-bold text-blue-700">
                    {Math.round(efficiency)}%
                  </div>
                  <div className="text-sm text-blue-600 font-semibold">
                    Grid Efficiency
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    {efficiency >= 80
                      ? "Excellent Performance!"
                      : efficiency >= 50
                      ? "Good Performance"
                      : "Needs Improvement"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mission Progress & Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Current Mission Progress */}
          <Card className="shadow-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold text-green-800">
                🎯 Current Mission Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentMission && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-green-700">
                      {currentMission.title}
                    </h3>
                    <p className="text-green-600">
                      {currentMission.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {currentMission.objectives.map((objective, index) => {
                      let progress = 0;
                      let completed = false;

                      // Calculate progress based on objective
                      if (objective.includes("Solar Panel")) {
                        const solarPanels = gameState.grid.filter(
                          (cell) => cell?.type === "solar_panel"
                        ).length;
                        progress = Math.min(
                          (solarPanels /
                            parseInt(objective.match(/\d+/)?.[0] || 1)) *
                            100,
                          100
                        );
                        completed = progress >= 100;
                      } else if (objective.includes("House")) {
                        const houses = gameState.grid.filter(
                          (cell) => cell?.type === "house" && cell?.connected
                        ).length;
                        progress = Math.min(
                          (houses /
                            parseInt(objective.match(/\d+/)?.[0] || 1)) *
                            100,
                          100
                        );
                        completed = progress >= 100;
                      } else if (objective.includes("energy")) {
                        progress = Math.min(
                          (gameState.totalEnergyGenerated / 100) * 100,
                          100
                        );
                        completed = progress >= 100;
                      }

                      return (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border-2 ${
                            completed
                              ? "bg-green-100 border-green-300"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`font-medium ${
                                completed ? "text-green-700" : "text-gray-700"
                              }`}
                            >
                              {completed ? "✅" : "⭐"} {objective}
                            </span>
                            <span
                              className={`text-sm font-bold ${
                                completed ? "text-green-600" : "text-gray-600"
                              }`}
                            >
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-center mt-4">
                    <div className="text-sm text-gray-600">
                      ⏱️ Time Remaining:{" "}
                      {Math.max(
                        0,
                        currentMission.timeLimit - gameState.gameTime
                      )}
                      s
                    </div>
                    <div className="text-sm text-green-600 font-semibold">
                      💰 Reward: ${currentMission.reward}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Real-time Statistics */}
          <Card className="shadow-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold text-blue-800">
                📊 Live Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg border-2 border-yellow-200">
                    <div className="text-2xl">☀️</div>
                    <div className="text-lg font-bold text-yellow-700">
                      {
                        gameState.grid.filter(
                          (cell) => cell?.type === "solar_panel"
                        ).length
                      }
                    </div>
                    <div className="text-sm text-yellow-600">Solar Panels</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border-2 border-cyan-200">
                    <div className="text-2xl">💨</div>
                    <div className="text-lg font-bold text-cyan-700">
                      {
                        gameState.grid.filter(
                          (cell) => cell?.type === "wind_turbine"
                        ).length
                      }
                    </div>
                    <div className="text-sm text-cyan-600">Wind Turbines</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border-2 border-green-200">
                    <div className="text-2xl">🏠</div>
                    <div className="text-lg font-bold text-green-700">
                      {
                        gameState.grid.filter((cell) => cell?.type === "house")
                          .length
                      }
                    </div>
                    <div className="text-sm text-green-600">Houses</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border-2 border-purple-200">
                    <div className="text-2xl">🏭</div>
                    <div className="text-lg font-bold text-purple-700">
                      {
                        gameState.grid.filter(
                          (cell) => cell?.type === "factory"
                        ).length
                      }
                    </div>
                    <div className="text-sm text-purple-600">Factories</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border-2 border-emerald-200 p-4">
                  <h4 className="font-bold text-emerald-700 mb-3 text-center">
                    🌍 Environmental Impact
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        CO2 Reduced:
                      </span>
                      <span className="text-sm font-bold text-green-600">
                        {Math.round(gameState.carbonReduced)} tons
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Clean Energy:
                      </span>
                      <span className="text-sm font-bold text-blue-600">
                        {Math.round(gameState.totalEnergyGenerated)} MWh
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Efficiency Rate:
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          efficiency >= 80
                            ? "text-green-600"
                            : efficiency >= 50
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {Math.round(efficiency)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Tool Selection & Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-8">
          {/* Tool Selection Panel */}
          <Card className="xl:col-span-1 shadow-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="text-center text-xl font-bold text-purple-800">
                🛠️ Build Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    id: "solar_panel",
                    name: "Solar Panel",
                    emoji: "☀️",
                    cost: 50,
                    description: "Clean energy source",
                  },
                  {
                    id: "wind_turbine",
                    name: "Wind Turbine",
                    emoji: "💨",
                    cost: 80,
                    description: "Wind-powered generator",
                  },
                  {
                    id: "power_line",
                    name: "Power Line",
                    emoji: "⚡",
                    cost: 10,
                    description: "Connect structures",
                  },
                  {
                    id: "house",
                    name: "House",
                    emoji: "🏠",
                    cost: 30,
                    description: "Energy consumer",
                  },
                  {
                    id: "factory",
                    name: "Factory",
                    emoji: "🏭",
                    cost: 100,
                    description: "High energy demand",
                  },
                  {
                    id: "tree",
                    name: "Tree",
                    emoji: "🌳",
                    cost: 5,
                    description: "Environmental bonus",
                  },
                  {
                    id: "delete",
                    name: "Delete",
                    emoji: "🗑️",
                    cost: 0,
                    description: "Remove structures",
                  },
                ].map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() =>
                      setGameState((prev) => ({
                        ...prev,
                        selectedTool: tool.id,
                      }))
                    }
                    className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                      gameState.selectedTool === tool.id
                        ? "bg-purple-100 border-purple-400 shadow-lg scale-105"
                        : "bg-white border-gray-200 hover:border-purple-300 hover:shadow-md"
                    } ${
                      gameState.money < tool.cost && tool.cost > 0
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                    disabled={gameState.money < tool.cost && tool.cost > 0}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{tool.emoji}</span>
                      <div className="text-left flex-1">
                        <div className="font-bold text-sm">{tool.name}</div>
                        <div className="text-xs text-gray-600">
                          {tool.description}
                        </div>
                        {tool.cost > 0 && (
                          <div className="text-xs font-bold text-green-600">
                            ${tool.cost}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-4 p-3 bg-white rounded-lg border-2 border-blue-200">
                <div className="text-center">
                  <div className="text-sm text-blue-600 font-semibold">
                    Selected Tool:
                  </div>
                  <div className="text-lg font-bold text-blue-800">
                    {gameState.selectedTool
                      ? gameState.selectedTool.replace("_", " ").toUpperCase()
                      : "NONE"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Grid */}
          <Card className="xl:col-span-3 shadow-xl border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold text-gray-800">
                🌍 Solar Power Grid - Click to Build!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Weather Effect Overlay */}
                {gameState.weather !== "sunny" && (
                  <div className="absolute inset-0 z-10 pointer-events-none">
                    {gameState.weather === "cloudy" && (
                      <div className="w-full h-full bg-gray-200 opacity-30 rounded-lg"></div>
                    )}
                    {gameState.weather === "stormy" && (
                      <div className="w-full h-full bg-blue-900 opacity-20 rounded-lg animate-pulse"></div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-8 gap-1 bg-green-100 p-4 rounded-lg border-4 border-green-300">
                  {gameState.grid.map((cell, index) => {
                    const row = Math.floor(index / 8);
                    const col = index % 8;
                    const isConnected = cell?.connected || false;

                    return (
                      <div
                        key={index}
                        onClick={() => handleGridClick(row, col)}
                        className={`
                          aspect-square border-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg
                          ${
                            cell
                              ? isConnected
                                ? "border-green-400 bg-green-50"
                                : "border-gray-400 bg-gray-50"
                              : "border-gray-300 bg-white hover:bg-blue-50 hover:border-blue-300"
                          }
                          ${
                            cell?.type === "power_line" && isConnected
                              ? "animate-pulse"
                              : ""
                          }
                        `}
                      >
                        {cell && (
                          <div className="w-full h-full flex items-center justify-center relative">
                            <span
                              className={`text-xs sm:text-sm md:text-lg ${
                                isConnected ? "animate-bounce" : ""
                              }`}
                            >
                              {cell.type === "solar_panel" && "☀️"}
                              {cell.type === "wind_turbine" && "💨"}
                              {cell.type === "power_line" && "⚡"}
                              {cell.type === "house" && "🏠"}
                              {cell.type === "factory" && "🏭"}
                              {cell.type === "tree" && "🌳"}
                            </span>
                            {cell.energy > 0 && (
                              <div className="absolute -top-1 -right-1 bg-yellow-400 text-white rounded-full text-xs px-1 animate-pulse">
                                {cell.energy}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Power Flow Visualization */}
                <div className="mt-4 flex justify-center">
                  <div
                    className="bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400 h-2 rounded-full animate-pulse"
                    style={{
                      width: `${Math.min(efficiency, 100)}%`,
                      minWidth: "20px",
                      maxWidth: "300px",
                    }}
                  ></div>
                </div>
                <div className="text-center mt-2 text-sm text-gray-600">
                  Power Flow: {Math.round(efficiency)}% Efficiency
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Achievements */}
        <Card className="max-w-4xl mx-auto shadow-xl border-2 border-gold-200 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-orange-800">
              🏆 Adventure Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => {
                const isUnlocked = gameState.achievements.includes(
                  achievement.id
                );
                const currentValue = gameState[achievement.field] || 0;
                const progress = Math.min(
                  (currentValue / achievement.requirement) * 100,
                  100
                );

                return (
                  <div
                    key={achievement.id}
                    className={`p-4 border-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                      isUnlocked
                        ? "bg-gradient-to-br from-green-100 to-emerald-100 border-green-300 shadow-lg"
                        : "bg-white border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`text-2xl ${
                          isUnlocked ? "animate-bounce" : ""
                        }`}
                      >
                        {achievement.emoji}
                      </div>
                      <div>
                        <div
                          className={`font-semibold ${
                            isUnlocked ? "text-green-700" : "text-gray-600"
                          }`}
                        >
                          {achievement.name}
                        </div>
                        {isUnlocked && (
                          <Badge className="bg-green-500 animate-pulse">
                            🌟 Unlocked!
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {achievement.description}
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>
                          {currentValue}/{achievement.requirement}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SolarPowerMaster;
