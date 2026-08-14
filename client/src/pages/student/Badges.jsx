import React, { useState, useEffect } from 'react';
import { Trophy, Award, Star, Sparkles } from 'lucide-react';
import { getStudentRewards } from '../../services/gameRewardsService';

const Badges = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    level: 1,
    gamePoints: 0,
    totalBadges: 0
  });

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        console.error('No student data found');
        return;
      }

      const student = JSON.parse(userData);
      const studentId = student._id || student.id;
      const response = await getStudentRewards(studentId);

      if (response.success) {
        setBadges(response.data.badges || []);
        setStats({
          level: response.data.level || 1,
          gamePoints: response.data.gamePoints || 0,
          totalBadges: response.data.badges?.length || 0
        });
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeBackground = (rarity) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-[#f59e0b]';
      case 'epic':
        return 'bg-[#237a57]';
      case 'rare':
        return 'bg-[#3b9b8f]';
      default:
        return 'bg-gray-400';
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary':
        return 'from-[#f59e0b] to-[#f59e0b]';
      case 'epic':
        return 'from-[#237a57] to-[#237a57]';
      case 'rare':
        return 'from-[#3b9b8f] to-[#3b9b8f]';
      default:
        return 'from-gray-400 to-gray-400';
    }
  };

  const getRarityBorder = (rarity) => {
    switch (rarity) {
      case 'legendary':
        return 'border-[#f59e0b] shadow-lg shadow-[#f59e0b]/30';
      case 'epic':
        return 'border-[#237a57] shadow-lg shadow-[#237a57]/30';
      case 'rare':
        return 'border-[#3b9b8f] shadow-lg shadow-[#3b9b8f]/30';
      default:
        return 'border-gray-300';
    }
  };

  const getRarityText = (rarity) => {
    switch (rarity) {
      case 'legendary':
        return 'text-yellow-400';
      case 'epic':
        return 'text-[#237a57]';
      case 'rare':
        return 'text-[#f59e0b]';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#237a57] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading badges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-[#237a57] rounded-2xl p-8 mb-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Trophy className="w-10 h-10" />
                My Badges
              </h1>
              <p className="text-amber-50 text-lg">
                Collect badges by leveling up through playing games!
              </p>
            </div>
            <div className="text-right">
              <p className="text-amber-50 text-sm">Current Level</p>
              <p className="text-5xl font-bold">{stats.level}</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur rounded-xl p-4">
              <p className="text-amber-50 text-sm">Total Badges</p>
              <p className="text-3xl font-bold flex items-center gap-2">
                <Award className="w-7 h-7" />
                {stats.totalBadges}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-4">
              <p className="text-amber-50 text-sm">Game Points</p>
              <p className="text-3xl font-bold flex items-center gap-2">
                <Star className="w-7 h-7" />
                {stats.gamePoints}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-4">
              <p className="text-amber-50 text-sm">Rarest Badge</p>
              <p className="text-2xl font-bold">
                {badges.some(b => b.rarity === 'legendary') ? '🌟 Legendary' :
                 badges.some(b => b.rarity === 'epic') ? '💜 Epic' :
                 badges.some(b => b.rarity === 'rare') ? '💙 Rare' :
                 '⚪ Common'}
              </p>
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        {badges.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <Trophy className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Badges Yet</h3>
            <p className="text-gray-600 mb-6">
              Play games and level up to earn your first badge!
            </p>
            <a
              href="/student/games"
              className="inline-block bg-[#237a57] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#f59e0b] transition-colors"
            >
              Play Games
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {badges
              .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
              .map((badge, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-4 ${getRarityBorder(badge.rarity)}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Badge Icon */}
                    <div className={`w-20 h-20 rounded-full ${getBadgeBackground(badge.rarity)} flex items-center justify-center text-4xl shadow-lg flex-shrink-0 relative`}>
                      {badge.icon}
                      {badge.rarity === 'legendary' && (
                        <div className="absolute inset-0 rounded-full animate-ping bg-yellow-400/30"></div>
                      )}
                    </div>

                    {/* Badge Info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {badge.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {badge.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${getRarityText(badge.rarity)} uppercase tracking-wide`}>
                          {badge.rarity}
                        </span>
                        <span className="text-xs text-gray-500">
                          Level {badge.level}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Sparkle effect for legendary badges */}
                  {badge.rarity === 'legendary' && (
                    <div className="absolute top-2 right-2">
                      <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Badge Rarity Legend */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Badge Rarities
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-400"></div>
              <span className="text-gray-600">Common</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#3b9b8f]"></div>
              <span className="text-gray-600">Rare</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#237a57]"></div>
              <span className="text-gray-600">Epic</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#f59e0b] animate-pulse"></div>
              <span className="text-sm text-gray-600">Legendary</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Badges;
