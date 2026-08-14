import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStudentAchievements } from "../../services/achievementService";
import "@/styles/animations.css";
import {
  Award,
  Trophy,
  Star,
  Crown,
  Sparkles,
  TrendingUp,
  Lock,
  CheckCircle2,
  Gift,
} from "lucide-react";

const Achievements = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    totalPoints: 0,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserData(user);
      const studentId = user.id || user._id;
      if (studentId) {
        fetchAchievements(studentId);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchAchievements = async (studentId) => {
    try {
      setLoading(true);
      const response = await getStudentAchievements(studentId);
      if (response.success) {
        const achievementsData = response.data;
        setAchievements(achievementsData);

        // Calculate stats
        const completed = achievementsData.filter((a) => a.completed).length;
        const inProgress = achievementsData.filter(
          (a) => !a.completed && a.currentProgress > 0
        ).length;
        const totalPoints = achievementsData
          .filter((a) => a.completed)
          .reduce((sum, a) => sum + a.points, 0);

        setStats({
          total: achievementsData.length,
          completed,
          inProgress,
          totalPoints,
        });
      }
    } catch (error) {
      console.error("Error fetching achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "legendary":
        return {
          gradient: "from-yellow-400 to-orange-600",
          text: "text-yellow-400",
          border: "border-yellow-500/30",
          bg: "bg-yellow-500/20",
        };
      case "epic":
        return {
          gradient: "from-purple-400 to-pink-600",
          text: "text-purple-400",
          border: "border-purple-500/30",
          bg: "bg-purple-500/20",
        };
      case "rare":
        return {
          gradient: "from-blue-400 to-cyan-600",
          text: "text-blue-400",
          border: "border-blue-500/30",
          bg: "bg-blue-500/20",
        };
      default:
        return {
          gradient: "from-gray-400 to-gray-600",
          text: "text-gray-400",
          border: "border-gray-500/30",
          bg: "bg-gray-500/20",
        };
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "environment":
        return "🌍";
      case "learning":
        return "📚";
      case "gaming":
        return "🎮";
      case "social":
        return "👥";
      case "special":
        return "✨";
      default:
        return "🎯";
    }
  };

  const groupedAchievements = achievements.reduce((acc, achievement) => {
    const category = achievement.category || "other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(achievement);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0.05,
            }}
          >
            <Star className="w-8 h-8 text-yellow-400" />
          </div>
        ))}
      </div>

      <Navigation userType="student" />
      <main className="pt-20 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-yellow-500/30 animate-float">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                    Achievements
                    <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
                  </h1>
                  <p className="text-gray-400">
                    Track your progress and unlock rewards
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate("/student/rewards-store")}
                className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-semibold px-6 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <Gift className="w-5 h-5" />
                <span className="hidden sm:inline">Rewards Store</span>
              </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
              <Card className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-6 text-center relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Trophy className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-1">
                    {stats.completed}
                  </div>
                  <p className="text-gray-300 text-sm font-medium">Completed</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-6 text-center relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-1">
                    {stats.inProgress}
                  </div>
                  <p className="text-gray-300 text-sm font-medium">In Progress</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 hover:border-gray-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-gray-500/10 group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-400/5 to-gray-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-6 text-center relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-gray-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Lock className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-1">
                    {stats.total - stats.completed}
                  </div>
                  <p className="text-gray-300 text-sm font-medium">Locked</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/10 group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-6 text-center relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-yellow-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Star className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-1">
                    {stats.totalPoints}
                  </div>
                  <p className="text-gray-300 text-sm font-medium">Points Earned</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Achievements by Category */}
          {Object.entries(groupedAchievements).map(([category, items]) => (
            <div key={category} className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg">
                  <span className="text-2xl">{getCategoryIcon(category)}</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white capitalize">
                    {category} Achievements
                  </h2>
                  <p className="text-sm text-gray-300">
                    {items.filter(a => a.completed).length} of {items.length} completed
                  </p>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 font-semibold">
                  {items.length} total
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {items.map((achievement) => {
                  const colors = getRarityColor(achievement.rarity);
                  return (
                    <Card
                      key={achievement.achievementId}
                      className={`bg-gray-800/70 backdrop-blur-sm border transition-all duration-300 overflow-hidden group hover:shadow-2xl ${
                        achievement.completed
                          ? "border-emerald-500/50 shadow-lg shadow-emerald-500/20 hover:border-emerald-400"
                          : "border-gray-700/50 hover:border-gray-600 hover:shadow-lg"
                      }`}
                    >
                      {achievement.completed && (
                        <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
                          <div className="absolute top-3 right-[-30px] bg-emerald-500 text-white text-xs font-bold py-1 px-8 rotate-45 shadow-lg">
                            ✓
                          </div>
                        </div>
                      )}
                      <CardContent className="p-6 relative">
                        <div className="flex items-start gap-4 mb-4">
                          <div
                            className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl transition-all duration-300 ${
                              achievement.completed
                                ? `bg-gradient-to-br ${colors.gradient} shadow-${achievement.rarity === 'legendary' ? 'yellow' : achievement.rarity === 'epic' ? 'purple' : achievement.rarity === 'rare' ? 'blue' : 'gray'}-500/50 group-hover:scale-110`
                                : "bg-gray-700/50 opacity-70 group-hover:opacity-90"
                            }`}
                          >
                            {achievement.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 mb-2">
                              <h3
                                className={`font-bold text-lg leading-tight ${
                                  achievement.completed
                                    ? "text-white"
                                    : "text-gray-200"
                                }`}
                              >
                                {achievement.title}
                              </h3>
                            </div>
                            <Badge
                              className={`text-xs font-semibold uppercase tracking-wide ${colors.bg} ${colors.text} border ${colors.border}`}
                            >
                              {achievement.rarity}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                          {achievement.description}
                        </p>

                        {/* Progress */}
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-gray-300">
                              {achievement.currentProgress} / {achievement.targetValue} {achievement.targetType}
                            </span>
                            <span
                              className={`font-bold ${
                                achievement.completed
                                  ? "text-emerald-400"
                                  : colors.text
                              }`}
                            >
                              {achievement.percentage}%
                            </span>
                          </div>
                          <div className="h-2.5 bg-gray-900/50 rounded-full overflow-hidden backdrop-blur-sm border border-gray-700/30">
                            <div
                              className={`h-full transition-all duration-500 ease-out ${
                                achievement.completed
                                  ? "bg-gradient-to-r from-emerald-400 to-cyan-500"
                                  : `bg-gradient-to-r ${colors.gradient} opacity-70`
                              }`}
                              style={{ width: `${achievement.percentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Reward */}
                        <div className="pt-4 border-t border-gray-700/50">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                              Reward
                            </span>
                            <Badge
                              className={`text-sm font-bold px-3 py-1 ${
                                achievement.completed
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-lg shadow-emerald-500/20"
                                  : "bg-gray-700/50 text-gray-300 border-gray-600"
                              }`}
                            >
                              {achievement.completed && "✓ "}
                              {achievement.points} pts
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}

          {achievements.length === 0 && !loading && (
            <Card className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50">
              <CardContent className="p-16 text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Trophy className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  No Achievements Yet
                </h3>
                <p className="text-gray-300 text-lg mb-6">
                  Start your learning journey to unlock achievements!
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-4 py-2 font-semibold">
                    📹 Watch Videos
                  </Badge>
                  <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-4 py-2 font-semibold">
                    📝 Complete Quizzes
                  </Badge>
                  <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-4 py-2 font-semibold">
                    🎮 Play Games
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Achievements;
