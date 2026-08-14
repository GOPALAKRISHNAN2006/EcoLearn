import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Droplets, Star, Trophy, Heart, Trash, Fish } from "lucide-react";

const OceanCleanupHero = () => {
  const navigate = useNavigate();
  const gameAreaRef = useRef(null);
  const [gameState, setGameState] = useState({
    score: 0,
    trashCollected: 0,
    animalsRescued: 0,
    gameTime: 60,
    isPlaying: false,
    gameOver: false,
    level: 1,
    comboMultiplier: 1
  });
  
  const [gameObjects, setGameObjects] = useState([]);
  const gameTimerRef = useRef(null);
  const spawnTimerRef = useRef(null);

  const trashTypes = [
    { type: 'plastic', emoji: '🥤', points: 10, color: 'bg-red-500' },
    { type: 'bottle', emoji: '🍼', points: 15, color: 'bg-blue-500' },
    { type: 'bag', emoji: '🛍️', points: 8, color: 'bg-gray-500' },
    { type: 'can', emoji: '🥫', points: 12, color: 'bg-yellow-500' }
  ];

  const marineLife = [
    { type: 'turtle', emoji: '🐢', points: 25, color: 'bg-green-500' },
    { type: 'dolphin', emoji: '🐬', points: 30, color: 'bg-blue-400' },
    { type: 'fish', emoji: '🐠', points: 20, color: 'bg-orange-500' },
    { type: 'whale', emoji: '🐋', points: 50, color: 'bg-purple-500' }
  ];

  const startGame = () => {
    setGameState({
      score: 0,
      trashCollected: 0,
      animalsRescued: 0,
      gameTime: 60,
      isPlaying: true,
      gameOver: false,
      level: 1,
      comboMultiplier: 1
    });
    setGameObjects([]);
    
    // Start game timer
    gameTimerRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.gameTime <= 1) {
          endGame();
          return { ...prev, gameTime: 0, isPlaying: false, gameOver: true };
        }
        return { ...prev, gameTime: prev.gameTime - 1 };
      });
    }, 1000);

    // Start spawning objects
    spawnObjects();
  };

  const endGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: false, gameOver: true }));
    clearInterval(gameTimerRef.current);
    clearInterval(spawnTimerRef.current);
  };

  const spawnObjects = () => {
    spawnTimerRef.current = setInterval(() => {
      const isTrash = Math.random() < 0.7; // 70% chance for trash
      const objectType = isTrash ? 
        trashTypes[Math.floor(Math.random() * trashTypes.length)] :
        marineLife[Math.floor(Math.random() * marineLife.length)];
      
      const newObject = {
        id: Date.now() + Math.random(),
        ...objectType,
        x: Math.random() * 80, // percentage
        y: -10, // start above visible area
        isTrash,
        speed: 0.5 + Math.random() * 1.5
      };

      setGameObjects(prev => [...prev, newObject]);
    }, 1500);
  };

  const moveObjects = () => {
    setGameObjects(prev => 
      prev.map(obj => ({ ...obj, y: obj.y + obj.speed }))
        .filter(obj => obj.y < 110) // remove objects that have fallen off screen
    );
  };

  const collectObject = (objectId) => {
    const object = gameObjects.find(obj => obj.id === objectId);
    if (!object) return;

    setGameObjects(prev => prev.filter(obj => obj.id !== objectId));
    
    setGameState(prev => {
      const newScore = prev.score + (object.points * prev.comboMultiplier);
      const newLevel = Math.floor(newScore / 200) + 1;
      
      if (object.isTrash) {
        return {
          ...prev,
          score: newScore,
          trashCollected: prev.trashCollected + 1,
          level: newLevel,
          comboMultiplier: Math.min(prev.comboMultiplier + 0.1, 3)
        };
      } else {
        return {
          ...prev,
          score: newScore,
          animalsRescued: prev.animalsRescued + 1,
          level: newLevel,
          comboMultiplier: Math.min(prev.comboMultiplier + 0.2, 3)
        };
      }
    });
  };

  // Game loop for moving objects
  useEffect(() => {
    if (gameState.isPlaying) {
      const gameLoop = setInterval(moveObjects, 50);
      return () => clearInterval(gameLoop);
    }
  }, [gameState.isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(gameTimerRef.current);
      clearInterval(spawnTimerRef.current);
    };
  }, []);

  const resetGame = () => {
    setGameState({
      score: 0,
      trashCollected: 0,
      animalsRescued: 0,
      gameTime: 60,
      isPlaying: false,
      gameOver: false,
      level: 1,
      comboMultiplier: 1
    });
    setGameObjects([]);
    clearInterval(gameTimerRef.current);
    clearInterval(spawnTimerRef.current);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 relative overflow-hidden">
      {/* Underwater Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Bubbles */}
        <div className="absolute bottom-10 left-10 w-4 h-4 bg-white/40 rounded-full animate-bubble-1"></div>
        <div className="absolute bottom-20 right-20 w-6 h-6 bg-white/30 rounded-full animate-bubble-2"></div>
        <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-white/50 rounded-full animate-bubble-3"></div>
        <div className="absolute bottom-16 right-1/4 w-5 h-5 bg-white/35 rounded-full animate-bubble-1"></div>
        <div className="absolute bottom-28 left-1/3 w-4 h-4 bg-white/45 rounded-full animate-bubble-2"></div>
        <div className="absolute bottom-40 right-1/3 w-3 h-3 bg-white/40 rounded-full animate-bubble-3"></div>
        
        {/* Swimming Fish */}
        <div className="absolute top-32 left-10 text-4xl opacity-30 animate-swim-1">🐠</div>
        <div className="absolute top-1/2 right-10 text-5xl opacity-25 animate-swim-2">🐟</div>
        <div className="absolute bottom-1/3 left-1/4 text-3xl opacity-35 animate-swim-3">🐡</div>
        <div className="absolute top-2/3 right-1/4 text-4xl opacity-30 animate-swim-1">🦈</div>
        <div className="absolute top-1/4 left-1/2 text-3xl opacity-25 animate-swim-2">🐙</div>
        
        {/* Floating Debris */}
        <div className="absolute top-40 right-32 text-2xl opacity-20 animate-drift-1">🗑️</div>
        <div className="absolute bottom-1/4 left-32 text-3xl opacity-15 animate-drift-2">🥤</div>
        <div className="absolute top-1/3 left-1/5 text-2xl opacity-25 animate-drift-3">🛍️</div>
        
        {/* Seaweed */}
        <div className="absolute bottom-0 left-16 text-6xl opacity-20 animate-sway-1">🌿</div>
        <div className="absolute bottom-0 right-20 text-5xl opacity-25 animate-sway-2">🌱</div>
        <div className="absolute bottom-0 left-1/3 text-7xl opacity-15 animate-sway-1">🌿</div>
        <div className="absolute bottom-0 right-1/4 text-4xl opacity-30 animate-sway-2">🌱</div>
      </div>

      {/* Advanced CSS Animations */}
      <style jsx>{`
        @keyframes bubble-1 {
          0% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
          25% { transform: translateY(-100px) translateX(20px); opacity: 0.6; }
          50% { transform: translateY(-200px) translateX(-10px); opacity: 0.3; }
          75% { transform: translateY(-350px) translateX(30px); opacity: 0.7; }
          100% { transform: translateY(-500px) translateX(0px); opacity: 0; }
        }
        @keyframes bubble-2 {
          0% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          33% { transform: translateY(-150px) translateX(-25px); opacity: 0.5; }
          66% { transform: translateY(-300px) translateX(15px); opacity: 0.4; }
          100% { transform: translateY(-450px) translateX(-10px); opacity: 0; }
        }
        @keyframes bubble-3 {
          0% { transform: translateY(0px) translateX(0px); opacity: 0.5; }
          50% { transform: translateY(-250px) translateX(-30px); opacity: 0.2; }
          100% { transform: translateY(-500px) translateX(0px); opacity: 0; }
        }
        @keyframes swim-1 {
          0%, 100% { transform: translateX(0px) translateY(0px) scaleX(1); }
          25% { transform: translateX(100px) translateY(-20px) scaleX(1); }
          50% { transform: translateX(200px) translateY(10px) scaleX(-1); }
          75% { transform: translateX(100px) translateY(-10px) scaleX(-1); }
        }
        @keyframes swim-2 {
          0%, 100% { transform: translateX(0px) translateY(0px) scaleX(-1); }
          33% { transform: translateX(-150px) translateY(30px) scaleX(-1); }
          66% { transform: translateX(-300px) translateY(-20px) scaleX(1); }
        }
        @keyframes swim-3 {
          0%, 100% { transform: translateX(0px) translateY(0px) rotate(0deg); }
          50% { transform: translateX(150px) translateY(-40px) rotate(10deg); }
        }
        @keyframes drift-1 {
          0%, 100% { transform: translateX(0px) translateY(0px) rotate(0deg); }
          25% { transform: translateX(-50px) translateY(20px) rotate(5deg); }
          50% { transform: translateX(-80px) translateY(-10px) rotate(-3deg); }
          75% { transform: translateX(-30px) translateY(15px) rotate(8deg); }
        }
        @keyframes drift-2 {
          0%, 100% { transform: translateX(0px) translateY(0px) rotate(0deg); }
          50% { transform: translateX(60px) translateY(-30px) rotate(-10deg); }
        }
        @keyframes drift-3 {
          0%, 100% { transform: translateX(0px) translateY(0px) rotate(0deg); }
          33% { transform: translateX(40px) translateY(25px) rotate(5deg); }
          66% { transform: translateX(-20px) translateY(-15px) rotate(-7deg); }
        }
        @keyframes sway-1 {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes sway-2 {
          0%, 100% { transform: rotate(3deg); }
          50% { transform: rotate(-7deg); }
        }
        .animate-bubble-1 { animation: bubble-1 8s ease-in-out infinite; }
        .animate-bubble-2 { animation: bubble-2 10s ease-in-out infinite; }
        .animate-bubble-3 { animation: bubble-3 6s ease-in-out infinite; }
        .animate-swim-1 { animation: swim-1 15s ease-in-out infinite; }
        .animate-swim-2 { animation: swim-2 12s ease-in-out infinite; }
        .animate-swim-3 { animation: swim-3 10s ease-in-out infinite; }
        .animate-drift-1 { animation: drift-1 20s ease-in-out infinite; }
        .animate-drift-2 { animation: drift-2 25s ease-in-out infinite; }
        .animate-drift-3 { animation: drift-3 18s ease-in-out infinite; }
        .animate-sway-1 { animation: sway-1 4s ease-in-out infinite; }
        .animate-sway-2 { animation: sway-2 3s ease-in-out infinite; }
      `}</style>

      <div className="container mx-auto px-4 py-8 relative z-10">
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
          <div className="w-32 h-32 bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-ocean-pulse">
            <Droplets className="w-16 h-16 text-white animate-droplet-bounce" />
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent mb-4 tracking-wide">
            🌊 Ocean Cleanup Hero
          </h1>
          <p className="text-2xl text-blue-700 mb-6 font-medium">
            🐠 Clean up the ocean and rescue marine life! 🐢
          </p>

          {/* Enhanced CSS Animations */}
          <style jsx>{`
            @keyframes ocean-pulse {
              0%, 100% { 
                transform: scale(1); 
                box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3), 0 0 0 0 rgba(59, 130, 246, 0.7);
              }
              50% { 
                transform: scale(1.05); 
                box-shadow: 0 25px 50px rgba(59, 130, 246, 0.4), 0 0 0 20px rgba(59, 130, 246, 0);
              }
            }
            @keyframes droplet-bounce {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              25% { transform: translateY(-8px) rotate(-5deg); }
              50% { transform: translateY(-4px) rotate(5deg); }
              75% { transform: translateY(-12px) rotate(-3deg); }
            }
            .animate-ocean-pulse { animation: ocean-pulse 3s ease-in-out infinite; }
            .animate-droplet-bounce { animation: droplet-bounce 2s ease-in-out infinite; }
          `}</style>

          {/* Game Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto mb-8">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3 group-hover:animate-spin" />
                <div className="text-3xl font-bold text-yellow-700">{gameState.score}</div>
                <div className="text-sm text-yellow-600 font-semibold">Score</div>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
              <CardContent className="p-6 text-center">
                <Trash className="w-8 h-8 text-red-500 mx-auto mb-3 group-hover:animate-bounce" />
                <div className="text-3xl font-bold text-red-700">{gameState.trashCollected}</div>
                <div className="text-sm text-red-600 font-semibold">Trash</div>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
              <CardContent className="p-6 text-center">
                <Heart className="w-8 h-8 text-pink-500 mx-auto mb-3 group-hover:animate-pulse" />
                <div className="text-3xl font-bold text-pink-700">{gameState.animalsRescued}</div>
                <div className="text-sm text-pink-600 font-semibold">Rescued</div>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
              <CardContent className="p-6 text-center">
                <Trophy className="w-8 h-8 text-orange-500 mx-auto mb-3 group-hover:animate-bounce" />
                <div className="text-3xl font-bold text-orange-700">{gameState.level}</div>
                <div className="text-sm text-orange-600 font-semibold">Level</div>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-3 group-hover:animate-pulse">⏱️</div>
                <div className="text-3xl font-bold text-purple-700">{gameState.gameTime}s</div>
                <div className="text-sm text-purple-600 font-semibold">Time</div>
              </CardContent>
            </Card>
          </div>

          {/* Combo Multiplier */}
          {gameState.comboMultiplier > 1 && (
            <div className="mb-6">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl px-6 py-3 shadow-lg animate-pulse">
                🔥 {gameState.comboMultiplier.toFixed(1)}x Combo Streak! ⚡
              </Badge>
            </div>
          )}
        </div>

        {/* Game Area */}
        <Card className="max-w-6xl mx-auto mb-8 shadow-2xl border-4 border-cyan-200 hover:border-cyan-300 transition-all duration-500">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              🌊 Ocean Cleanup Zone 🌊
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={gameAreaRef}
              className="relative w-full h-[500px] bg-gradient-to-b from-blue-200 via-blue-300 to-blue-500 rounded-2xl overflow-hidden border-4 border-blue-400 shadow-inner"
              style={{ 
                backgroundImage: `
                  radial-gradient(circle at 20% 80%, rgba(255,255,255,0.2) 0%, transparent 50%), 
                  radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%),
                  radial-gradient(circle at 40% 40%, rgba(255,255,255,0.1) 0%, transparent 30%)
                `
              }}
            >
              {/* Enhanced Ocean Effects */}
              <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-blue-600 to-transparent opacity-60 animate-wave"></div>
              <div className="absolute bottom-0 w-full h-8 bg-gradient-to-t from-blue-700 to-transparent opacity-40 animate-wave-delayed"></div>
              
              {/* Sunlight Rays */}
              <div className="absolute top-0 left-1/4 w-1 h-32 bg-gradient-to-b from-yellow-300/50 to-transparent animate-sunray-1"></div>
              <div className="absolute top-0 left-1/2 w-1 h-40 bg-gradient-to-b from-yellow-200/40 to-transparent animate-sunray-2"></div>
              <div className="absolute top-0 right-1/3 w-1 h-28 bg-gradient-to-b from-yellow-300/45 to-transparent animate-sunray-3"></div>
              
              {/* Game objects with enhanced effects */}
              {gameObjects.map(obj => (
                <div
                  key={obj.id}
                  className={`absolute cursor-pointer transition-all duration-300 hover:scale-125 ${obj.color} rounded-full w-16 h-16 flex items-center justify-center text-3xl shadow-lg hover:shadow-xl animate-float-object border-2 border-white/30`}
                  style={{
                    left: `${obj.x}%`,
                    top: `${obj.y}%`,
                    transform: 'translate(-50%, -50%)',
                    boxShadow: obj.isTrash 
                      ? '0 4px 16px rgba(239, 68, 68, 0.4), inset 0 2px 4px rgba(255,255,255,0.3)' 
                      : '0 4px 16px rgba(34, 197, 94, 0.4), inset 0 2px 4px rgba(255,255,255,0.3)'
                  }}
                  onClick={() => collectObject(obj.id)}
                >
                  {obj.emoji}
                  {/* Glow effect for marine life */}
                  {!obj.isTrash && (
                    <div className="absolute inset-0 rounded-full bg-green-400/20 animate-pulse"></div>
                  )}
                </div>
              ))}

              {/* Enhanced CSS for ocean effects */}
              <style jsx>{`
                @keyframes wave {
                  0%, 100% { transform: translateX(0px) scaleY(1); }
                  50% { transform: translateX(-20px) scaleY(1.1); }
                }
                @keyframes wave-delayed {
                  0%, 100% { transform: translateX(0px) scaleY(1); }
                  50% { transform: translateX(15px) scaleY(0.9); }
                }
                @keyframes sunray-1 {
                  0%, 100% { opacity: 0.5; transform: rotate(2deg); }
                  50% { opacity: 0.8; transform: rotate(-2deg); }
                }
                @keyframes sunray-2 {
                  0%, 100% { opacity: 0.4; transform: rotate(-1deg); }
                  50% { opacity: 0.7; transform: rotate(3deg); }
                }
                @keyframes sunray-3 {
                  0%, 100% { opacity: 0.45; transform: rotate(1deg); }
                  50% { opacity: 0.75; transform: rotate(-1deg); }
                }
                @keyframes float-object {
                  0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
                  50% { transform: translate(-50%, -50%) translateY(-8px); }
                }
                .animate-wave { animation: wave 4s ease-in-out infinite; }
                .animate-wave-delayed { animation: wave-delayed 3s ease-in-out infinite 1s; }
                .animate-sunray-1 { animation: sunray-1 6s ease-in-out infinite; }
                .animate-sunray-2 { animation: sunray-2 5s ease-in-out infinite 2s; }
                .animate-sunray-3 { animation: sunray-3 7s ease-in-out infinite 1s; }
                .animate-float-object { animation: float-object 3s ease-in-out infinite; }
              `}</style>

              {/* Game instructions overlay */}
              {!gameState.isPlaying && !gameState.gameOver && (
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-blue-900/70 flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center text-white bg-white/10 rounded-3xl p-8 backdrop-blur-md border border-white/20 shadow-2xl">
                    <h3 className="text-4xl font-bold mb-6 text-cyan-200">🎯 Ocean Mission Briefing</h3>
                    <div className="space-y-4 text-xl">
                      <p className="flex items-center justify-center gap-3">
                        <span className="text-3xl">🗑️</span>
                        <span>Click trash to clean the ocean</span>
                      </p>
                      <p className="flex items-center justify-center gap-3">
                        <span className="text-3xl">🐠</span>
                        <span>Click marine life to rescue them</span>
                      </p>
                      <p className="flex items-center justify-center gap-3">
                        <span className="text-3xl">⚡</span>
                        <span>Build combos for higher scores!</span>
                      </p>
                    </div>
                    <Button 
                      onClick={startGame}
                      className="mt-8 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-2xl px-12 py-6 shadow-xl border-2 border-cyan-300 hover:scale-105 transition-all duration-300"
                    >
                      🌊 Begin Ocean Rescue Mission! 🚀
                    </Button>
                  </div>
                </div>
              )}

              {/* Game over overlay */}
              {gameState.gameOver && (
                <div className="absolute inset-0 bg-gradient-to-br from-black/70 to-emerald-900/80 flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center text-white bg-white/10 rounded-3xl p-10 backdrop-blur-md border border-white/20 shadow-2xl max-w-lg">
                    <div className="relative">
                      {/* Celebration effects */}
                      <div className="absolute -top-4 -left-4 text-3xl animate-bounce">🎉</div>
                      <div className="absolute -top-2 -right-4 text-2xl animate-pulse">✨</div>
                      <div className="absolute -bottom-2 -left-2 text-3xl animate-spin-slow">🏆</div>
                      <div className="absolute -bottom-4 -right-2 text-2xl animate-bounce">🎊</div>
                      
                      <Trophy className="w-20 h-20 mx-auto mb-6 text-yellow-400 animate-bounce" />
                      <h3 className="text-4xl font-bold mb-6 text-cyan-200">🎉 Mission Accomplished! 🎉</h3>
                      
                      <div className="bg-white/10 rounded-2xl p-6 mb-8 space-y-3 backdrop-blur-sm">
                        <p className="text-2xl text-yellow-200">🌟 Final Score: {gameState.score}</p>
                        <p className="text-xl text-blue-200">🗑️ Trash Collected: {gameState.trashCollected} pieces</p>
                        <p className="text-xl text-green-200">🐠 Animals Rescued: {gameState.animalsRescued} creatures</p>
                        <p className="text-xl text-purple-200">🏅 Level Reached: {gameState.level}</p>
                      </div>
                      
                      <div className="flex gap-4 justify-center">
                        <Button 
                          onClick={resetGame}
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold px-8 py-4 text-lg hover:scale-105 transition-all duration-300 shadow-lg"
                        >
                          🔄 New Mission
                        </Button>
                        <Button 
                          onClick={() => navigate('/student/games')}
                          className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold px-8 py-4 text-lg hover:scale-105 transition-all duration-300 shadow-lg"
                        >
                          🏠 Mission Control
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Educational Info */}
        <Card className="max-w-6xl mx-auto shadow-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              🌊 Ocean Conservation Facts & Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-white/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="text-4xl animate-bounce-slow">🗑️</div>
                  <div>
                    <h4 className="font-bold text-lg text-red-700 mb-2">Plastic Pollution Crisis</h4>
                    <p className="text-red-600 font-medium leading-relaxed">Over 8 million tons of plastic enter our oceans every year, equivalent to dumping a garbage truck of plastic every minute!</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="text-4xl animate-sway">🐢</div>
                  <div>
                    <h4 className="font-bold text-lg text-green-700 mb-2">Marine Life in Danger</h4>
                    <p className="text-green-600 font-medium leading-relaxed">Plastic pollution affects over 700 marine species worldwide, with many mistaking plastic for food.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-white/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="text-4xl animate-spin-slow">♻️</div>
                  <div>
                    <h4 className="font-bold text-lg text-blue-700 mb-2">Solution: Reduce & Recycle</h4>
                    <p className="text-blue-600 font-medium leading-relaxed">Proper waste management and recycling can prevent 80% of ocean plastic pollution from reaching our seas.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="text-4xl animate-pulse">🌍</div>
                  <div>
                    <h4 className="font-bold text-lg text-purple-700 mb-2">Take Action Today</h4>
                    <p className="text-purple-600 font-medium leading-relaxed">Every small action helps! Use reusable bags, bottles, and support ocean cleanup initiatives in your community.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Call to Action */}
            <div className="mt-8 text-center bg-gradient-to-r from-cyan-100 to-blue-100 rounded-2xl p-6 border-2 border-cyan-200">
              <h5 className="text-xl font-bold text-cyan-800 mb-3">🌟 Be an Ocean Hero in Real Life! 🌟</h5>
              <p className="text-cyan-700 font-medium">
                Start by reducing plastic use, participating in beach cleanups, and spreading awareness about ocean conservation!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OceanCleanupHero;
