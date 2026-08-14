import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeGame } from '../services/gameRewardsService';
import { Trophy, Star, Coins, Gift, Sparkles, ArrowRight } from 'lucide-react';

const GameCompletionModal = ({ show, onClose, rewards }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-[#237a57] rounded-2xl p-8 max-w-md w-full shadow-2xl border-4 border-[#f59e0b] relative overflow-hidden">
        {/* Sparkle effects */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: '3s'
              }}
            >
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            </div>
          ))}
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-400 rounded-full mb-4 animate-bounce">
              <Trophy className="w-12 h-12 text-green-900" />
            </div>
            <h2 className="text-4xl font-bold text-yellow-400 mb-2">
              Game Complete!
            </h2>
            <p className="text-green-100 text-lg">
              Amazing work! Here are your rewards:
            </p>
          </div>

          {/* Points Earned */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 mb-4 border-2 border-yellow-400/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Star className="w-7 h-7 text-green-900 fill-green-900" />
                </div>
                <div>
                  <p className="text-green-200 text-sm">Points Earned</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    +{rewards.pointsEarned}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-green-300">Game Points</p>
                <p className="text-xl font-bold text-green-400">{rewards.gamePoints || rewards.totalPoints}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-green-300">Coins</p>
                <p className="text-xl font-bold text-yellow-400 flex items-center gap-1">
                  <Coins className="w-5 h-5" />
                  {rewards.coins}
                </p>
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4 border-2 border-purple-400/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-purple-200 font-semibold">Level {rewards.currentLevel}</p>
              <p className="text-purple-300 text-sm">
                {rewards.currentXP} / {rewards.nextLevelXP} XP
              </p>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="bg-[#3b9b8f] h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${(rewards.currentXP / rewards.nextLevelXP) * 100}%`
                }}
              />
            </div>
            {rewards.currentLevel === 1 && (
              <p className="text-center text-sm text-[#3b9b8f] mt-2">
                🏆 Reach Level 2 to earn your first badge!
              </p>
            )}
          </div>

          {/* Level Up Rewards */}
          {rewards.leveledUp && rewards.levelUpRewards?.length > 0 && (
            <div className="bg-[#f59e0b]/20 backdrop-blur rounded-xl p-4 mb-4 border-2 border-[#f59e0b] animate-pulse">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-bold text-yellow-400">
                  Level Up Rewards!
                </h3>
              </div>
              <div className="space-y-2">
                {rewards.levelUpRewards.map((reward, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-white/10 rounded-lg p-3"
                  >
                    {reward.type === 'coins' && (
                      <>
                        <Coins className="w-8 h-8 text-yellow-400" />
                        <div>
                          <p className="font-semibold text-white">
                            +{reward.amount} Coins
                          </p>
                          <p className="text-sm text-green-200">
                            Level {reward.level} Reward
                          </p>
                        </div>
                      </>
                    )}
                    {reward.type === 'badge' && (
                      <>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                          reward.badge.rarity === 'legendary' ? 'bg-[#f59e0b] shadow-lg shadow-[#f59e0b]/50' :
                          reward.badge.rarity === 'epic' ? 'bg-[#237a57] shadow-lg shadow-[#237a57]/50' :
                          reward.badge.rarity === 'rare' ? 'bg-[#3b9b8f] shadow-lg shadow-[#3b9b8f]/50' :
                          'bg-gray-400 shadow-lg'
                        }`}>
                          {reward.badge.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-white text-lg">
                            {reward.badge.name}
                          </p>
                          <p className="text-sm text-green-200">
                            {reward.badge.description}
                          </p>
                          <p className={`text-xs font-bold mt-1 ${
                            reward.badge.rarity === 'legendary' ? 'text-yellow-400' :
                            reward.badge.rarity === 'epic' ? 'text-[#237a57]' :
                            reward.badge.rarity === 'rare' ? 'text-blue-400' :
                            'text-gray-300'
                          }`}>
                            {reward.badge.rarity.toUpperCase()} BADGE
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={onClose}
            className="w-full bg-[#f59e0b] hover:bg-[#237a57] text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const withGameCompletion = (GameComponent, gameId, gameName, basePoints) => {
  return function GameWithCompletion(props) {
    const navigate = useNavigate();
    const [showRewards, setShowRewards] = useState(false);
    const [rewards, setRewards] = useState(null);

    useEffect(() => {
      // Listen for game completion event
      const handleGameComplete = async (event) => {
        const { finalScore } = event.detail;
        
        // Calculate points based on score
        const pointsEarned = Math.min(basePoints + Math.floor(finalScore / 10), basePoints * 3);

        // Get student data
        const userData = localStorage.getItem('user');
        if (!userData) {
          console.error('No student data found');
          return;
        }

        const student = JSON.parse(userData);
        const studentId = student._id || student.id;

        try {
          // Submit game completion to backend
          const response = await completeGame({
            studentId: studentId,
            gameId: gameId,
            gameName: gameName,
            pointsEarned: pointsEarned
          });

          if (response.success) {
            console.log('Game completion response:', response.data);
            setRewards(response.data);
            setShowRewards(true);
          }
        } catch (error) {
          console.error('Error completing game:', error);
          // Still show some rewards based on the score
          setRewards({
            pointsEarned,
            totalPoints: pointsEarned,
            currentLevel: 1,
            currentXP: 0,
            nextLevelXP: 100,
            coins: 0,
            leveledUp: false,
            levelUpRewards: []
          });
          setShowRewards(true);
        }
      };

      window.addEventListener('gameComplete', handleGameComplete);

      return () => {
        window.removeEventListener('gameComplete', handleGameComplete);
      };
    }, []);

    const handleCloseRewards = () => {
      setShowRewards(false);
      navigate('/student/games');
    };

    return (
      <>
        <GameComponent {...props} />
        <GameCompletionModal
          show={showRewards}
          onClose={handleCloseRewards}
          rewards={rewards}
        />
      </>
    );
  };
};

export default GameCompletionModal;
