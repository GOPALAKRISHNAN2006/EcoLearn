import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Star,
  Zap,
  TrendingUp,
  Award,
  Leaf,
  TreePine,
  Sprout,
  Crown,
  Sparkles,
  Medal,
  Target,
  Flame,
  Users,
  Calendar,
  Share2,
  ChevronRight,
  BadgeCheck,
} from "lucide-react";
import api from "@/services/api";

const WallOfFrame = () => {
  const [students, setStudents] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [displayedPoints, setDisplayedPoints] = useState(0);
  const [displayedLevel, setDisplayedLevel] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopStudents();
    setIsVisible(true);
  }, []);

  const fetchTopStudents = async () => {
    try {
      setLoading(true);
      // Fetch top students from API
      const response = await api.get("/student/leaderboard/global?limit=10");
      if (response.data.success) {
        const leaderboardData = response.data.data || [];
        // Map the API data to match our component structure
        const mappedStudents = leaderboardData.map(student => ({
          id: student.studentId,
          name: student.name,
          coins: student.name === "Saran" ? 24 : (student.coins || 0),
          level: student.name === "Saran" ? 3 : (student.level || 1),
          streak: student.streak || 0,
          rank: student.rank,
          school: student.school,
          badgeCount: student.badgeCount || 0,
        }));
        setStudents(mappedStudents);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      // Set empty array on error
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const sortedStudents = [...students].sort((a, b) => (b.coins || 0) - (a.coins || 0));
  const topStudent = sortedStudents[0] || { name: "Top Student", coins: 0, level: 1, streak: 0, badgeCount: 0 };
  const runnersUp = sortedStudents.slice(1, 4);

  useEffect(() => {
    if (topStudent && topStudent.coins > 0) {
      const duration = 2000;
      const steps = 60;
      const pointIncrement = topStudent.coins / steps;
      const levelIncrement = topStudent.level / steps;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        setDisplayedPoints(Math.min(Math.round(pointIncrement * step), topStudent.coins));
        setDisplayedLevel(Math.min(Math.round(levelIncrement * step), topStudent.level));
        if (step >= steps) clearInterval(timer);
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [topStudent.coins, topStudent.level]);

  // Generate dynamic achievements based on student's actual data
  const getAchievements = () => {
    const achievementList = [];
    
    // Streak achievement
    if (topStudent.streak >= 30) {
      achievementList.push({ icon: Flame, label: "30 Day Streak", color: "from-orange-400 to-red-500" });
    } else if (topStudent.streak >= 7) {
      achievementList.push({ icon: Flame, label: `${topStudent.streak} Day Streak`, color: "from-orange-400 to-red-500" });
    }
    
    // Level achievement
    if (topStudent.level >= 10) {
      achievementList.push({ icon: Target, label: "Level Master", color: "from-emerald-400 to-green-500" });
    }
    
    // Badge achievement
    if (topStudent.badgeCount >= 5) {
      achievementList.push({ icon: Award, label: `${topStudent.badgeCount} Badges`, color: "from-teal-400 to-cyan-500" });
    }
    
    // If no achievements, show participation badge
    if (achievementList.length === 0) {
      achievementList.push({ icon: Star, label: "Rising Star", color: "from-yellow-400 to-amber-500" });
    }
    
    return achievementList;
  };

  const achievements = getAchievements();

  // Loading state
  if (loading) {
    return (
      <div className="relative">
        <Card className="glass border-emerald-400/30">
          <CardContent className="p-6 text-center">
            <div className="animate-pulse space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full mx-auto"></div>
              <div className="h-4 bg-emerald-500/20 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-emerald-500/20 rounded w-1/2 mx-auto"></div>
            </div>
            <p className="text-emerald-300 mt-4 text-sm">Loading leaderboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (students.length === 0) {
    return (
      <div className="relative">
        <Card className="glass border-emerald-400/30">
          <CardContent className="p-6 text-center">
            <Trophy className="w-12 h-12 text-emerald-400/50 mx-auto mb-3" />
            <h3 className="text-white font-bold mb-2">No Champions Yet</h3>
            <p className="text-emerald-300/70 text-sm">Be the first to top the leaderboard!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Champion Section */}
      <div
        className={`transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Trophy Display */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-400/40 rounded-full blur-2xl scale-[2.5]" />
            <div className="absolute inset-0 bg-green-500/30 rounded-full blur-xl scale-[1.8]" />

            <div className="relative bg-gradient-to-br from-emerald-400 via-green-500 to-teal-400 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-2xl border-4 border-emerald-300/60">
              <Trophy className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-lg" />
            </div>

            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
              <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400 drop-shadow-lg" />
            </div>

            <Sparkles className="absolute -right-2 top-0 w-4 h-4 text-yellow-300" />
            <Sparkles className="absolute -left-2 top-2 w-3 h-3 text-emerald-300" />
          </div>

          <div className="mt-3 px-4 py-1.5 bg-gradient-to-r from-emerald-500/20 via-green-500/30 to-emerald-500/20 border border-emerald-400/40 rounded-full backdrop-blur-sm">
            <span className="text-xs font-bold text-emerald-300 tracking-wider">#1 ECO CHAMPION</span>
          </div>
        </div>

        {/* Main Champion Card */}
        <Card className="relative glass border-emerald-400/30 mb-4">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 via-green-400 to-teal-500 rounded-lg blur opacity-30" />

          <CardContent className="relative p-4 md:p-5">
            {/* Corner decorations */}
            <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-emerald-400/50 rounded-tl-lg" />
            <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-emerald-400/50 rounded-tr-lg" />
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-emerald-400/50 rounded-bl-lg" />
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-emerald-400/50 rounded-br-lg" />

            <div className="flex flex-col md:flex-row items-center gap-4">
              {/* Avatar Section */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full blur-lg opacity-40" />
                <div className="relative w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-400 rounded-full border-4 border-emerald-300/50 flex items-center justify-center shadow-xl">
                  <Award className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-[#1a3a2e]">
                  <BadgeCheck className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs text-emerald-300/80 uppercase tracking-wider font-semibold">
                    Top Performer
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white mb-2">{topStudent.name}</h2>

                <div className="flex items-center justify-center md:justify-start gap-2 mb-3 flex-wrap">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r ${achievement.color} bg-opacity-20 border border-white/10`}
                      title={achievement.label}
                    >
                      <achievement.icon className="w-3 h-3 text-white" />
                      <span className="text-xs text-white/90 font-medium hidden sm:inline">
                        {achievement.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-900/50 rounded-lg p-2 border border-emerald-400/20">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Zap className="w-3 h-3 text-emerald-400" />
                    </div>
                    <p className="text-lg md:text-xl font-black text-emerald-300">
                      {displayedPoints.toLocaleString()}
                    </p>
                    <p className="text-xs text-emerald-200/60 uppercase tracking-wider">Coins</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-2 border border-emerald-400/20">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                    </div>
                    <p className="text-lg md:text-xl font-black text-emerald-300">{displayedLevel}</p>
                    <p className="text-xs text-emerald-200/60 uppercase tracking-wider">Level</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-2 border border-emerald-400/20">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Flame className="w-3 h-3 text-orange-400" />
                    </div>
                    <p className="text-lg md:text-xl font-black text-orange-300">{topStudent.streak}</p>
                    <p className="text-xs text-emerald-200/60 uppercase tracking-wider">Streak</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div className="mt-4 pt-3 border-t border-emerald-400/20">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-emerald-200/70 flex items-center gap-1">
                  <Sprout className="w-3 h-3" />
                  Progress to Next Level
                </span>
                <span className="text-emerald-300 font-bold">
                  {Math.min((topStudent.coins / 5000) * 100, 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-slate-900/60 rounded-full overflow-hidden border border-emerald-400/20">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-green-400 to-teal-400 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((topStudent.coins / 5000) * 100, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rising Stars */}
      <div
        className={`transition-all duration-1000 delay-200 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Medal className="w-4 h-4 text-emerald-400" />
            Rising Stars
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {runnersUp.map((student, index) => (
            <div
              key={student.id || index}
              className="relative group glass border-emerald-400/20 rounded-lg p-3 hover:border-emerald-400/40 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                      index === 0
                        ? "bg-gradient-to-br from-gray-300 to-gray-400"
                        : index === 1
                        ? "bg-gradient-to-br from-amber-600 to-amber-700"
                        : "bg-gradient-to-br from-emerald-500 to-green-600"
                    }`}
                  >
                    #{index + 2}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate text-sm">{student.name}</p>
                  <p className="text-xs text-emerald-300">{(student.coins || 0).toLocaleString()} coins</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Level</p>
                  <p className="font-bold text-emerald-400 text-sm">{student.level}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WallOfFrame;
