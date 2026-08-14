import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import "@/styles/animations.css";
import { useState, useEffect } from "react";
import {
  getQuizLeaderboard,
  getStudentQuizHistory,
} from "../../services/syllabusService";
import {
  getGlobalLeaderboard,
  getSchoolLeaderboard,
} from "../../services/leaderboardService";
import {
  getStudentAchievements,
} from "../../services/achievementService";
import {
  Trophy,
  Medal,
  Crown,
  Star,
  TrendingUp,
  Users,
  Globe,
  School,
  Award,
  Target,
  Zap,
  Calendar,
  Sparkles,
  Flame,
  BookOpen,
  Loader,
} from "lucide-react";

const Leaderboard = () => {
  const [userData, setUserData] = useState(null);
  const [userStats, setUserStats] = useState({
    globalRank: "-",
    schoolRank: "-",
    totalPoints: 0,
    streak: 0,
  });
  const [quizLeaderboard, setQuizLeaderboard] = useState([]);
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [schoolLeaderboard, setSchoolLeaderboard] = useState([]);
  const [studentQuizHistory, setStudentQuizHistory] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserData(user);
      // In a real app, you'd fetch actual stats from the backend
      setUserStats({
        globalRank: "-",
        schoolRank: "-",
        totalPoints: user.points || 0,
        streak: user.streak || 0,
      });

      // Fetch quiz leaderboard and history - use id from user object
      const studentId = user.id || user._id;
      if (studentId) {
        fetchLeaderboardData(studentId);
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchLeaderboardData = async (studentId) => {
    try {
      setLoading(true);
      console.log("Fetching leaderboard data for student:", studentId);

      // Get user data from localStorage for school info
      const storedUser = localStorage.getItem("user");
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      console.log("Current user:", currentUser);

      // Fetch quiz leaderboard
      try {
        const leaderboardResponse = await getQuizLeaderboard();
        console.log("Quiz leaderboard response:", leaderboardResponse);
        if (leaderboardResponse.success) {
          setQuizLeaderboard(leaderboardResponse.data);

          // Find user's rank in leaderboard
          const userRank =
            leaderboardResponse.data.findIndex(
              (entry) => entry.studentId === studentId
            ) + 1;

          if (userRank > 0) {
            setUserStats((prev) => ({
              ...prev,
              totalPoints:
                leaderboardResponse.data[userRank - 1]?.totalScore ||
                prev.totalPoints,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching quiz leaderboard:", error);
      }

      // Fetch school leaderboard first (primary) - Top 10
      if (currentUser?.school) {
        try {
          const schoolResponse = await getSchoolLeaderboard(currentUser.school, 10);
          console.log("School leaderboard response:", schoolResponse);
          if (schoolResponse.success) {
            setSchoolLeaderboard(schoolResponse.data);
            
            // Find user's school rank
            const schoolRank = schoolResponse.data.findIndex(
              (student) => student.studentId.toString() === studentId.toString()
            ) + 1;
            
            console.log("User school rank:", schoolRank);
            
            if (schoolRank > 0) {
              setUserStats((prev) => ({
                ...prev,
                schoolRank: schoolRank,
              }));
            }
          }
        } catch (error) {
          console.error("Error fetching school leaderboard:", error);
        }
      }

      // Fetch global leaderboard (secondary)
      try {
        const globalResponse = await getGlobalLeaderboard(50);
        console.log("Global leaderboard response:", globalResponse);
        if (globalResponse.success) {
          setGlobalLeaderboard(globalResponse.data);
          
          // Find user's global rank
          const globalRank = globalResponse.data.findIndex(
            (student) => student.studentId.toString() === studentId.toString()
          ) + 1;
          
          console.log("User global rank:", globalRank, "Student ID:", studentId);
          
          if (globalRank > 0) {
            setUserStats((prev) => ({
              ...prev,
              globalRank: globalRank,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching global leaderboard:", error);
      }

      // Fetch student's quiz history
      try {
        const historyResponse = await getStudentQuizHistory(studentId);
        console.log("Quiz history response:", historyResponse);
        if (historyResponse.success) {
          setStudentQuizHistory(historyResponse.data.history || []);
        }
      } catch (error) {
        console.error("Error fetching quiz history:", error);
      }

      // Fetch student's achievements
      try {
        const achievementsResponse = await getStudentAchievements(studentId);
        console.log("Achievements response:", achievementsResponse);
        if (achievementsResponse.success) {
          setAchievements(achievementsResponse.data || []);
        }
      } catch (error) {
        console.error("Error fetching achievements:", error);
      }
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Weekly top performers - would be fetched from backend or calculated
  const weeklyTopPerformers = [];

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-400 to-orange-600';
      case 'epic':
        return 'from-purple-400 to-pink-600';
      case 'rare':
        return 'from-blue-400 to-cyan-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBadgeColor = (rarity) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'epic':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'rare':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-400" />;
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-400">
            {rank}
          </span>
        );
    }
  };

  const getRankStyle = (rank, isCurrentUser = false) => {
    if (isCurrentUser) return "bg-[#237a57]/20 border border-[#237a57]/40";
    switch (rank) {
      case 1:
        return "bg-[#f59e0b]/20 border border-[#f59e0b]/30";
      case 2:
        return "bg-gray-500/20 border border-gray-400/30";
      case 3:
        return "bg-[#3b9b8f]/20 border border-[#3b9b8f]/30";
      default:
        return "glass border-0";
    }
  };

  return (
    <div className="min-h-screen bg-[#1a3a2e]">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#237a57]/10 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-[#f59e0b]/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-[#3b9b8f]/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "4s" }}
        ></div>
        {/* Sparkle particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#f59e0b] rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      <Navigation userType="student" />
      <main className="pt-20 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-[#f59e0b] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#f59e0b]/30 animate-float">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                  Leaderboard
                  <Sparkles className="w-8 h-8 text-[#f59e0b] animate-pulse" />
                </h1>
                <p className="text-gray-400">
                  See how you rank among environmental champions worldwide
                </p>
              </div>
            </div>

            {/* Current User Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
              <Card className="glass border-0 hover-lift overflow-hidden group">
                <div className="absolute inset-0 bg-[#237a57]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-6 text-center relative">
                  <div className="w-14 h-14 rounded-2xl bg-[#237a57] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#237a57]/30">
                    <Globe className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {userStats.globalRank}
                  </div>
                  <p className="text-gray-400">Global Rank</p>
                </CardContent>
              </Card>
              <Card className="glass border-0 hover-lift overflow-hidden group">
                <div className="absolute inset-0 bg-[#3b9b8f]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-6 text-center relative">
                  <div className="w-14 h-14 rounded-2xl bg-[#3b9b8f] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#3b9b8f]/30">
                    <School className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {userStats.schoolRank}
                  </div>
                  <p className="text-gray-400">School Rank</p>
                </CardContent>
              </Card>
              <Card className="glass border-0 hover-lift overflow-hidden group">
                <div className="absolute inset-0 bg-[#f59e0b]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-6 text-center relative">
                  <div className="w-14 h-14 rounded-2xl bg-[#f59e0b] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#f59e0b]/30">
                    <Star className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {userStats.totalPoints.toLocaleString()}
                  </div>
                  <p className="text-gray-400">Total Points</p>
                </CardContent>
              </Card>
              <Card className="glass border-0 hover-lift overflow-hidden group">
                <div className="absolute inset-0 bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-6 text-center relative">
                  <div className="w-14 h-14 rounded-2xl bg-red-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-red-500/30 animate-pulse">
                    <Flame className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {userStats.streak}
                  </div>
                  <p className="text-gray-400">Day Streak</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main Leaderboards */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quiz Leaderboard */}
              <Card className="glass border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    Quiz Leaderboard
                    <Badge className="ml-auto bg-[#237a57]/20 text-[#3b9b8f] border border-[#237a57]/30">
                      <BookOpen className="w-3 h-3 mr-1" /> Quiz Scores
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader className="w-8 h-8 text-[#237a57] animate-spin mr-3" />
                      <span className="text-gray-400">
                        Loading leaderboard...
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {quizLeaderboard.length > 0 ? (
                        quizLeaderboard.map((entry, index) => {
                          const rank = index + 1;
                          const isCurrentUser =
                            entry.studentId === userData?.id;
                          return (
                            <div
                              key={entry.studentId}
                              className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] ${getRankStyle(
                                rank,
                                isCurrentUser
                              )}`}
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-800/50">
                                  {getRankIcon(rank)}
                                </div>
                                <div className="text-3xl">
                                  {rank === 1
                                    ? "🏆"
                                    : rank === 2
                                    ? "🥈"
                                    : rank === 3
                                    ? "🥉"
                                    : "🎓"}
                                </div>
                                <div>
                                  <p
                                    className={`font-semibold ${
                                      isCurrentUser
                                        ? "text-[#237a57]"
                                        : "text-white"
                                    }`}
                                  >
                                    {entry.studentName}{" "}
                                    {isCurrentUser && (
                                      <span className="text-[#237a57]">
                                        (You)
                                      </span>
                                    )}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge className="text-xs bg-[#3b9b8f]/20 text-[#3b9b8f] border border-[#3b9b8f]/30">
                                      {entry.quizzesCompleted} Quizzes
                                    </Badge>
                                    <Badge className="text-xs bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30">
                                      Avg: {entry.averageScore}%
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-xl text-white">
                                  {entry.totalScore.toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-500">
                                  total points
                                </p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-12">
                          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400 text-lg font-medium">
                            No Quiz Scores Yet
                          </p>
                          <p className="text-gray-500 text-sm mt-1">
                            Complete video quizzes to appear on the leaderboard!
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* School Leaderboard - Top 10 */}
              <Card className="glass border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                      <School className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span>{userData?.school || "Your School"} - Top 10</span>
                      <span className="text-sm text-gray-400 font-normal">Highest scoring students</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {schoolLeaderboard.length > 0 ? (
                      schoolLeaderboard.slice(0, 10).map((student, index) => {
                        const currentUserId = userData?.id || userData?._id;
                        const isCurrentUser = student.studentId.toString() === currentUserId?.toString();
                        return (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] ${getRankStyle(
                            index + 1,
                            isCurrentUser
                          )}`}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-800/50">
                              {getRankIcon(index + 1)}
                            </div>
                            <div className="text-3xl">{student.avatar}</div>
                            <div>
                              <p
                                className={`font-semibold ${
                                  isCurrentUser
                                    ? "text-emerald-400"
                                    : "text-white"
                                }`}
                              >
                                {student.name}{" "}
                                {isCurrentUser && (
                                  <span className="text-emerald-400">
                                    (You)
                                  </span>
                                )}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  Lvl {student.level}
                                </Badge>
                                <div className="flex items-center gap-1 text-xs text-orange-400">
                                  <Flame className="w-3 h-3" />
                                  {student.streak || 0} days
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-xl text-white">
                              {student.totalPoints.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">points</p>
                          </div>
                        </div>
                      );
                    })
                    ) : (
                      <div className="text-center py-12">
                        <School className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg font-medium">
                          No School Data Yet
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          Be the first to appear on your school's leaderboard!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Global Leaderboard - Top 5 */}
              <Card className="glass border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span>Global Leaderboard - Top 5</span>
                      <span className="text-sm text-gray-400 font-normal">Top performers across all schools</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {globalLeaderboard.length > 0 ? (
                      globalLeaderboard.slice(0, 5).map((student, index) => {
                        const currentUserId = userData?.id || userData?._id;
                        const isCurrentUser = student.studentId.toString() === currentUserId?.toString();
                        return (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] ${getRankStyle(
                            index + 1,
                            isCurrentUser
                          )}`}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-800/50">
                              {getRankIcon(index + 1)}
                            </div>
                            <div className="text-3xl">{student.avatar}</div>
                            <div>
                              <p
                                className={`font-semibold ${
                                  isCurrentUser
                                    ? "text-emerald-400"
                                    : "text-white"
                                }`}
                              >
                                {student.name}{" "}
                                {isCurrentUser && (
                                  <span className="text-emerald-400">
                                    (You)
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-400">
                                {student.school || "No School"}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  Lvl {student.level}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-xl text-white">
                              {student.totalPoints.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">points</p>
                            <div className="flex items-center gap-1 text-xs text-orange-400 mt-1">
                              <Flame className="w-3 h-3" />
                              {student.streak || 0} days
                            </div>
                          </div>
                        </div>
                      );
                    })
                    ) : (
                      <div className="text-center py-12">
                        <Globe className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg font-medium">
                          No Leaderboard Data Yet
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          Start learning to appear on the leaderboard!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Your Quiz History */}
              <Card className="glass border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    Your Quiz History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader className="w-6 h-6 text-purple-400 animate-spin" />
                    </div>
                  ) : studentQuizHistory.length > 0 ? (
                    <div className="space-y-3">
                      {studentQuizHistory.slice(0, 5).map((quiz, index) => (
                        <div
                          key={quiz._id}
                          className="p-3 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-white text-sm truncate flex-1 mr-2">
                              {quiz.syllabusTitle || "Quiz"}
                            </p>
                            <Badge
                              className={`text-xs ${
                                quiz.score >= 70
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              }`}
                            >
                              {quiz.score}%
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                              {new Date(quiz.completedAt).toLocaleDateString()}
                            </span>
                            <span
                              className={
                                quiz.passed
                                  ? "text-emerald-400"
                                  : "text-amber-400"
                              }
                            >
                              {quiz.passed ? "✓ Passed" : "✗ Not Passed"}
                            </span>
                          </div>
                        </div>
                      ))}
                      {studentQuizHistory.length > 5 && (
                        <p className="text-center text-gray-500 text-sm">
                          +{studentQuizHistory.length - 5} more quizzes
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">
                        No quizzes completed yet
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Watch videos and take quizzes!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Weekly Top Performers */}
              <Card className="glass border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    This Week's Top Teams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {weeklyTopPerformers.length > 0 ? (
                    <div className="space-y-3">
                      {weeklyTopPerformers.map((team, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{team.avatar}</div>
                            <div>
                              <p className="font-semibold text-white">
                                {team.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {team.members} members
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-white">
                              {team.points}
                            </p>
                            <p className="text-xs text-gray-500">pts</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 font-medium">
                        No Team Data Yet
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        Join a team to compete!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card className="glass border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    Achievement Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {achievements.length > 0 ? (
                      achievements.map((achievement, index) => (
                        <div
                          key={achievement.achievementId || index}
                          className={`p-4 rounded-xl transition-all duration-300 ${
                            achievement.completed
                              ? "bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30"
                              : "bg-gray-800/30 border border-gray-700/50"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                                achievement.completed
                                  ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)} shadow-lg`
                                  : "bg-gray-700"
                              }`}
                            >
                              {achievement.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p
                                  className={`font-medium ${
                                    achievement.completed
                                      ? "text-white"
                                      : "text-gray-300"
                                  }`}
                                >
                                  {achievement.title}
                                </p>
                                <Badge className={`text-xs ${getRarityBadgeColor(achievement.rarity)}`}>
                                  {achievement.rarity}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                {achievement.description}
                              </p>
                            </div>
                            {achievement.completed && (
                              <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                +{achievement.points} pts
                              </Badge>
                            )}
                          </div>
                          {/* Progress Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400">
                                {achievement.currentProgress} / {achievement.targetValue} {achievement.targetType}
                              </span>
                              <span className={achievement.completed ? "text-emerald-400 font-medium" : "text-gray-400"}>
                                {achievement.percentage}%
                              </span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  achievement.completed
                                    ? "bg-gradient-to-r from-emerald-400 to-cyan-500"
                                    : "bg-gradient-to-r from-gray-600 to-gray-500"
                                }`}
                                style={{ width: `${achievement.percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No achievements available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Progress to Next Rank */}
              <Card className="glass border-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    Progress to Next Rank
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">
                        {userData?.points || 0} points
                      </div>
                      <p className="text-sm text-gray-400">
                        Start earning points to climb the ranks!
                      </p>
                    </div>
                    <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            (userData?.points || 0) / 10,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400">
                        Complete lessons and quizzes to earn points!
                      </p>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30 transition-all duration-300">
                      <Star className="w-4 h-4 mr-2" />
                      Earn More Points
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Custom Styles */}
      <style>{`
        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Leaderboard;
