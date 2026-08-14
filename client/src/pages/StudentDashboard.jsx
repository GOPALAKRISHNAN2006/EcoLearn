import { useState, useEffect, useRef } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import WallOfFrame from "@/components/WallOfFrame";
import "@/styles/animations.css";
import {
  GraduationCap,
  Trophy,
  Zap,
  BookOpen,
  Gamepad2,
  Users,
  Star,
  TrendingUp,
  Calendar,
  Award,
  FlaskConical,
  Sparkles,
  Target,
  Flame,
  Crown,
  Gift,
  ChevronRight,
  Play,
  Rocket,
  Heart,
  Brain,
  Leaf,
  Globe,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);

  useEffect(() => {
    const start = 0;
    const end = value;
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(start + (end - start) * easeOut));

      if (progress === 1) clearInterval(timer);
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span ref={countRef}>{count.toLocaleString()}</span>;
};

// Floating Particle Component
const FloatingParticle = ({ delay, size, left, duration }) => (
  <div
    className="absolute rounded-full opacity-60"
    style={{
      width: size,
      height: size,
      left: `${left}%`,
      background: `linear-gradient(135deg, ${
        Math.random() > 0.5 ? "#10b981" : "#06b6d4"
      }, ${Math.random() > 0.5 ? "#8b5cf6" : "#f59e0b"})`,
      animationName: "float",
      animationDuration: `${duration}s`,
      animationTimingFunction: "ease-in-out",
      animationIterationCount: "infinite",
      animationDelay: `${delay}s`,
      top: `${Math.random() * 100}%`,
    }}
  />
);

// Progress Ring Component
const ProgressRing = ({ progress, size = 120, strokeWidth = 8, children }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-gray-200"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-emerald-500 transition-all duration-1000 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="url(#gradient)"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Fetch stats from backend - use 'id' or '_id'
      const studentId = parsedUser.id || parsedUser._id;
      if (studentId) {
        fetchStudentStats(studentId);
      }
    }
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const fetchStudentStats = async (studentId) => {
    try {
      const response = await api.get(`/student/stats/${studentId}`);
      if (response.data.success) {
        setStats(response.data.data);
        console.log("Student stats:", response.data.data);
      }
    } catch (error) {
      console.error("Error fetching student stats:", error);
    }
  };

  // Get real user data from stats API or localStorage fallback
  const studentData = {
    name: stats?.name || user?.name || "Student",
    institution: user?.school || "Your School",
    totalPoints: stats?.points || user?.points || 0,
    todayPoints: stats?.todayPoints || user?.todayPoints || 0,
    coursesCompleted: user?.coursesCompleted || 0,
    totalCourses: user?.totalCourses || 0,
    gamesFinished: user?.gamesFinished || 0,
    totalGames: user?.totalGames || 0,
    institutionPosition: user?.institutionPosition || "-",
    globalPosition: user?.globalPosition || "-",
    level: stats?.level || user?.level || 1,
    currentXP: stats?.currentXP || user?.currentXP || 0,
    nextLevelXP: stats?.nextLevelXP || user?.nextLevelXP || 100,
    streak: stats?.streak || user?.streak || 0,
    badges: Array.isArray(stats?.badges) ? stats.badges.length : Array.isArray(user?.badges) ? user.badges.length : 0,
    hoursLearned: stats?.hoursLearned || user?.hoursLearned || 0,
    watchedVideosCount: stats?.watchedVideosCount || 0,
  };

  const xpProgress = (studentData.currentXP / studentData.nextLevelXP) * 100;
  const courseProgress =
    (studentData.coursesCompleted / studentData.totalCourses) * 100;

  const quickStats = [
    {
      label: "Total Points",
      value: studentData.totalPoints,
      icon: Trophy,
      gradient: "from-amber-400 to-orange-500",
      bgGradient: "from-amber-500/20 to-orange-500/20",
    },
    {
      label: "Day Streak",
      value: studentData.streak,
      icon: Flame,
      gradient: "from-red-400 to-pink-500",
      bgGradient: "from-red-500/20 to-pink-500/20",
      suffix: " 🔥",
    },
    {
      label: "Badges Earned",
      value: studentData.badges,
      icon: Award,
      gradient: "bg-[#f59e0b]",
      bgGradient: "bg-[#f59e0b]/20",
    },
  ];

  // Leaderboard data - would be fetched from backend
  const leaderboard = [];

  // Achievements - start with 0 progress
  const achievements = [
    {
      title: "Forest Guardian",
      description: "Plant 100 virtual trees",
      icon: "🌳",
      progress: 0,
      points: 100,
      color: "emerald",
    },
    {
      title: "Ocean Protector",
      description: "Complete marine missions",
      icon: "🌊",
      progress: 0,
      points: 150,
      color: "cyan",
    },
    {
      title: "Energy Master",
      description: "Build 10 solar farms",
      icon: "⚡",
      progress: 0,
      points: 200,
      color: "amber",
    },
  ];

  // Daily challenges - from API or defaults
  const dailyChallenges =
    stats?.dailyChallenges?.length > 0
      ? stats.dailyChallenges.map((challenge) => ({
          title: challenge.title || challenge.type || "Challenge",
          reward: challenge.xpReward || challenge.reward || 50,
          icon:
            challenge.type === "watch-video"
              ? BookOpen
              : challenge.type === "complete-quiz"
              ? Brain
              : Gamepad2,
          completed: challenge.completed || false,
        }))
      : [
          {
            title: "Watch a Video",
            reward: 50,
            icon: BookOpen,
            completed: false,
          },
          {
            title: "Complete a Quiz",
            reward: 75,
            icon: Brain,
            completed: false,
          },
          {
            title: "Play a Game",
            reward: 50,
            icon: Gamepad2,
            completed: false,
          },
        ];

  return (
    <div className="min-h-screen bg-[#1a3a2e] overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <FloatingParticle
            key={i}
            delay={i * 0.5}
            size={Math.random() * 20 + 5}
            left={Math.random() * 100}
            duration={Math.random() * 3 + 4}
          />
        ))}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#237a57]/15 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#3b9b8f]/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-[#3b9b8f]/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <Navigation />

      <main className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div
          className={`mb-8 transition-all duration-700 ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="glass rounded-3xl p-8 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#3b9b8f]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6">
              {/* User Info */}
              <div className="flex items-center gap-3 sm:gap-6 w-full lg:w-auto">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl bg-[#f59e0b] flex items-center justify-center animate-pulse-glow">
                    <span className="text-3xl sm:text-4xl lg:text-5xl">🦸</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#f59e0b] flex items-center justify-center text-white font-bold text-xs sm:text-sm border-2 sm:border-4 border-[#1a3a2e]">
                    {studentData.level}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white truncate">
                      Welcome, {studentData.name}!
                    </h1>
                    <span className="text-2xl sm:text-3xl animate-wave flex-shrink-0">👋</span>
                  </div>
                  <p className="text-emerald-300 text-sm sm:text-base lg:text-lg truncate">
                    {studentData.institution}
                  </p>
                  <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-3 flex-wrap">
                    <Badge className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-0 px-2 sm:px-4 py-1 text-xs sm:text-sm">
                      <Crown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> Level{" "}
                      {studentData.level}
                    </Badge>
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 px-2 sm:px-4 py-1 text-xs sm:text-sm">
                      <Flame className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> {studentData.streak}{" "}
                      Day Streak
                    </Badge>
                  </div>
                </div>
              </div>

              {/* XP Progress */}
              <div className="flex items-center gap-4 sm:gap-6 w-full lg:w-auto justify-center lg:justify-end">
                <ProgressRing progress={xpProgress} size={80} className="sm:w-24 sm:h-24 lg:w-[100px] lg:h-[100px]">
                  <div className="text-center">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                      {Math.round(xpProgress)}%
                    </div>
                    <div className="text-[10px] sm:text-xs text-emerald-300">
                      to Lv.{studentData.level + 1}
                    </div>
                  </div>
                </ProgressRing>
                <div className="flex-1 min-w-0">
                  <p className="text-emerald-300 text-xs sm:text-sm mb-1">
                    Experience Points
                  </p>
                  <p className="text-white text-lg sm:text-xl lg:text-2xl font-bold">
                    <AnimatedCounter value={studentData.currentXP} /> /{" "}
                    {studentData.nextLevelXP}
                  </p>
                  <p className="text-cyan-300 text-xs sm:text-sm mt-1">
                    {studentData.nextLevelXP - studentData.currentXP} XP to next
                    level
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats, Action Buttons, and Wall of Frame */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Left Side - Stats and Action Buttons */}
          <div className="space-y-4">
            {/* Quick Stats - Compact Version */}
            <div
              className={`grid grid-cols-3 gap-3 transition-all duration-700 delay-100 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              {quickStats.map((stat, index) => (
                <Card
                  key={index}
                  className={`glass border-0 hover-lift cursor-pointer group overflow-hidden`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => {
                    if (stat.label === "Badges Earned") {
                      navigate("/student/badges");
                    }
                  }}
                >
                  <CardContent className="p-3 sm:p-4 relative">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    />
                    <div className="relative">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <p className="text-gray-400 text-xs mb-1">{stat.label}</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">
                        <AnimatedCounter
                          value={stat.value}
                          duration={1500 + index * 200}
                        />
                        {stat.suffix}
                      </p>
                      {stat.label === "Badges Earned" && (
                        <p className="text-xs text-[#f59e0b] mt-1">Click to view →</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Action Buttons */}
            <div
              className={`space-y-3 transition-all duration-700 delay-200 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              {/* Continue Learning */}
              <button
                onClick={() => navigate("/student/lessons")}
                className="w-full p-3 sm:p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 transition-all duration-300 hover:scale-[1.02] group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-white text-sm sm:text-base">Continue Learning</h3>
                    <p className="text-emerald-100 text-xs sm:text-sm">Resume your lessons</p>
                  </div>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Play Games */}
              <button
                onClick={() => navigate("/student/games")}
                className="w-full p-3 sm:p-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all duration-300 hover:scale-[1.02] group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-white text-sm sm:text-base">Play Games</h3>
                    <p className="text-amber-100 text-xs sm:text-sm">Learn while having fun</p>
                  </div>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* My Badges */}
              <button
                onClick={() => navigate("/student/achievements")}
                className="w-full p-3 sm:p-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transition-all duration-300 hover:scale-[1.02] group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-white text-sm sm:text-base">My Badges</h3>
                    <p className="text-pink-100 text-xs sm:text-sm">View your achievements</p>
                  </div>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* AI Tutor */}
              <button
                onClick={() => navigate("/student/ai")}
                className="w-full p-3 sm:p-4 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 transition-all duration-300 hover:scale-[1.02] group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-white text-sm sm:text-base">AI Tutor</h3>
                    <p className="text-violet-100 text-xs sm:text-sm">Get personalized help</p>
                  </div>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Eco Labs */}
              <button
                onClick={() => navigate("/student/eco-lab")}
                className="w-full p-3 sm:p-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 transition-all duration-300 hover:scale-[1.02] group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-white text-sm sm:text-base">Eco Labs</h3>
                    <p className="text-cyan-100 text-xs sm:text-sm">Interactive experiments</p>
                  </div>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>

          {/* Wall of Frame - Right Side */}
          <div
            className={`transition-all duration-700 delay-300 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <WallOfFrame />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Left Column - Daily Challenges */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isLoaded
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <Card className="glass border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="w-10 h-10 rounded-xl bg-[#f59e0b] flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  Daily Challenges
                  <Badge className="ml-auto bg-amber-500/20 text-amber-300 border-amber-500/30">
                    <Gift className="w-3 h-3 mr-1" /> +
                    {dailyChallenges
                      .filter((c) => !c.completed)
                      .reduce((sum, c) => sum + c.reward, 0)}{" "}
                    XP Available
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  {dailyChallenges.map((challenge, index) => {
                    // Determine navigation path based on challenge type
                    const getChallengePath = () => {
                      const title = challenge.title || "";
                      if (title.toLowerCase().includes("video"))
                        return "/student/lessons";
                      if (title.toLowerCase().includes("quiz"))
                        return "/student/lessons";
                      if (title.toLowerCase().includes("game")) return "/games";
                      return null;
                    };

                    const challengePath = getChallengePath();

                    return (
                      <div
                        key={index}
                        onClick={() =>
                          !challenge.completed &&
                          challengePath &&
                          navigate(challengePath)
                        }
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                          challenge.completed
                            ? "bg-[#237a57]/20 border border-[#237a57]/30"
                            : "bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            challenge.completed
                              ? "bg-[#237a57]"
                              : "bg-gradient-to-br from-slate-700 to-slate-600"
                          }`}
                        >
                          {challenge.completed ? (
                            <span className="text-2xl">✓</span>
                          ) : (
                            <challenge.icon className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p
                            className={`font-semibold ${
                              challenge.completed
                                ? "text-emerald-300 line-through"
                                : "text-white"
                            }`}
                          >
                            {challenge.title || "Challenge"}
                          </p>
                          {!challenge.completed && challengePath && (
                            <p className="text-xs text-gray-400 mt-1">
                              Click to start →
                            </p>
                          )}
                          {challenge.progress !== undefined &&
                            !challenge.completed && (
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[#3b9b8f] rounded-full transition-all duration-500"
                                    style={{
                                      width: `${
                                        (challenge.progress / challenge.total) *
                                        100
                                      }%`,
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-gray-400">
                                  {challenge.progress}/{challenge.total}
                                </span>
                              </div>
                            )}
                        </div>
                        <Badge
                          className={
                            challenge.completed
                              ? "bg-[#237a57]/30 text-[#3b9b8f]"
                              : "bg-amber-500/20 text-amber-300"
                          }
                        >
                          +{challenge.reward} XP
                        </Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

          {/* Right Column - Achievement Progress */}
          <div
            className={`transition-all duration-700 delay-300 ${
              isLoaded
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
              <Card className="glass border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="w-10 h-10 rounded-xl bg-[#f59e0b] flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    Achievement Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="group">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-white">
                              {achievement.title}
                            </h4>
                            <Badge className="bg-white/10 text-white border-0">
                              +{achievement.points} pts
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-sm">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                      <div className="ml-18 relative">
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${
                              achievement.color === "emerald"
                                ? "from-emerald-400 to-emerald-500"
                                : achievement.color === "cyan"
                                ? "from-cyan-400 to-cyan-500"
                                : "from-amber-400 to-amber-500"
                            }`}
                            style={{
                              width: `${achievement.progress}%`,
                              animationDelay: `${index * 200}ms`,
                            }}
                          />
                        </div>
                        <span className="absolute right-0 -top-6 text-sm text-gray-400">
                          {achievement.progress}%
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
        </div>
      </main>

      {/* CSS for glass effect if not in animations.css */}
      <style>{`
        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes wave {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(14deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-wave {
          animation: wave 2.5s infinite;
          transform-origin: 70% 70%;
          display: inline-block;
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.4); }
          50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.8), 0 0 40px rgba(16, 185, 129, 0.4); }
        }
        .animate-pulse-glow {
          animation: pulseGlow 2s ease-in-out infinite;
        }
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;