import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import React, { useState, useEffect } from "react";
import "@/styles/animations.css";
import {
  getAllSyllabi,
  submitQuiz,
  checkQuizCompletion,
} from "../../services/syllabusService";
import { getVideosByGrade } from "../../services/videoLessonService";
import { completeGame } from "../../services/gameRewardsService";
import api from "../../services/api";
import EcoSnakesLadders from "../../games/SnakeAndLadder";
import {
  BookOpen,
  Play,
  Clock,
  CheckCircle,
  Star,
  Video,
  TreePine,
  Droplets,
  Sun,
  PauseCircle,
  Volume2,
  Maximize,
  Award,
  HelpCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Lock,
  Sparkles,
  Trophy,
  Target,
  Flame,
  GraduationCap,
  Loader,
  Gamepad2,
} from "lucide-react";

const Lessons = () => {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Syllabus videos from backend
  const [syllabusVideos, setSyllabusVideos] = useState([]);
  const [uploadedVideos, setUploadedVideos] = useState([]); // Videos uploaded via admin VideoUpload
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [user, setUser] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoWatched, setVideoWatched] = useState(false); // Track if video was fully watched
  const [pointsEarned, setPointsEarned] = useState(null); // Points earned from video
  const [watchedVideosList, setWatchedVideosList] = useState({}); // Track watched videos from backend

  // Quiz state for video lessons
  const [showVideoQuiz, setShowVideoQuiz] = useState(false);
  const [videoQuizAnswers, setVideoQuizAnswers] = useState({});
  const [videoQuizIndex, setVideoQuizIndex] = useState(0);
  const [videoQuizCompleted, setVideoQuizCompleted] = useState(false);
  const [videoQuizScore, setVideoQuizScore] = useState(0);
  const [videoQuizSubmitting, setVideoQuizSubmitting] = useState(false);
  const [completedQuizzes, setCompletedQuizzes] = useState({}); // Track completed quizzes by syllabusId
  
  // Game state - shows game after video, before quiz
  const [showGame, setShowGame] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  // Lesson completion state - in a real app, this would come from a database or context
  const [lessonCompletionStatus, setLessonCompletionStatus] = useState({
    1: { completed: false, progress: 0, score: 0 },
    2: { completed: false, progress: 0, score: 0 },
    3: { completed: false, progress: 0, score: 0 },
    4: { completed: false, progress: 0, score: 0 },
    5: { completed: false, progress: 0, score: 0 },
    6: { completed: false, progress: 0, score: 0 },
  });

  // Empty lessons array - videos come from backend now
  const lessons = [];

  // Listen for game completion event
  useEffect(() => {
    const handleGameCompleted = (event) => {
      console.log("Game completed!", event.detail);
      
      // Wait a bit for the win animation to play
      setTimeout(() => {
        setShowGame(false);
        setGameCompleted(true);
        
        // Show quiz if available
        if (currentVideo?.quiz?.questions?.length > 0 && !completedQuizzes[currentVideo._id]) {
          setShowVideoQuiz(true);
        } else {
          // Close the modal if no quiz
          setShowVideoPlayer(false);
          setCurrentVideo(null);
        }
      }, 2000); // 2 second delay to let winner message show
    };

    window.addEventListener('ecoGameCompleted', handleGameCompleted);
    
    return () => {
      window.removeEventListener('ecoGameCompleted', handleGameCompleted);
    };
  }, [currentVideo, completedQuizzes]);

  // Fetch user and syllabus videos on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchSyllabusVideos(userData.class);
    } else {
      setLoadingVideos(false);
    }
  }, []);

  // Fetch syllabus videos for student's class ONLY
  const fetchSyllabusVideos = async (studentClass) => {
    try {
      setLoadingVideos(true);

      // Fetch all syllabi and filter on frontend
      const response = await getAllSyllabi({});
      if (response.success) {
        // Filter only completed videos
        let videosWithContent = response.data.filter(
          (s) => s.videoGenerationStatus === "completed" && s.videoUrl
        );

        // Strictly filter videos for student's class/grade only
        if (studentClass) {
          // Handle different class formats: "10", "Grade 10", "10th", "Class 10", etc.
          const classNum = studentClass.toString().replace(/[^0-9]/g, "");

          videosWithContent = videosWithContent.filter((video) => {
            const videoGradeNum = video.grade
              ?.toString()
              .replace(/[^0-9]/g, "");

            // Match if:
            // 1. Exact match (e.g., "Grade 10" === "Grade 10")
            // 2. Grade number matches (e.g., "10" from "Grade 10" matches "10" from "Class 10")
            // 3. Direct class match (e.g., "10" === "10")
            return (
              video.grade === studentClass ||
              video.grade === `Grade ${classNum}` ||
              video.grade === `Class ${classNum}` ||
              videoGradeNum === classNum
            );
          });
        }

        setSyllabusVideos(videosWithContent);

        // Check which quizzes are already completed and fetch watched videos
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          const completionChecks = {};

          // Fetch watched videos list
          try {
            const statsResponse = await api.get(
              `/student/stats/${userData.id}`
            );
            if (
              statsResponse.data.success &&
              statsResponse.data.data.watchedVideos
            ) {
              const watchedMap = {};
              statsResponse.data.data.watchedVideos.forEach((v) => {
                watchedMap[v.syllabusId] = true;
              });
              setWatchedVideosList(watchedMap);
            }
          } catch (err) {
            console.log("Error fetching watched videos:", err);
          }

          for (const video of videosWithContent) {
            if (video.quiz?.questions?.length > 0) {
              try {
                const result = await checkQuizCompletion(
                  video._id,
                  userData.id
                );
                if (result.success && result.data.completed) {
                  completionChecks[video._id] = {
                    completed: true,
                    score: result.data.score,
                  };
                }
              } catch (err) {
                console.log("Error checking quiz completion:", err);
              }
            }
          }
          setCompletedQuizzes(completionChecks);
        }
      }

      // Also fetch uploaded video lessons
      await fetchUploadedVideos(studentClass);
      
    } catch (error) {
      console.error("Error fetching syllabus videos:", error);
    } finally {
      setLoadingVideos(false);
    }
  };

  // Fetch uploaded video lessons from admin
  const fetchUploadedVideos = async (studentClass) => {
    try {
      if (!studentClass) return;
      
      // Format grade for API (e.g., "10" -> "Grade 10")
      const classNum = studentClass.toString().replace(/[^0-9]/g, "");
      const gradeParam = `Grade ${classNum}`;
      
      const response = await getVideosByGrade(gradeParam);
      if (response.success && response.data) {
        // Add a flag to distinguish from syllabus videos
        // Get base URL without /api suffix for static files
        const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
        const videos = response.data.map(v => ({
          ...v,
          isUploadedVideo: true,
          // Map videoUrl to work with server uploads path
          videoUrl: v.videoUrl.startsWith('/uploads') 
            ? `${baseUrl}${v.videoUrl}`
            : v.videoUrl,
        }));
        setUploadedVideos(videos);
      }
    } catch (error) {
      console.error("Error fetching uploaded videos:", error);
    }
  };

  // Handle video quiz answer selection
  const handleVideoQuizAnswer = (questionIndex, answerIndex) => {
    setVideoQuizAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }));
  };

  // Handle video quiz submission
  const handleVideoQuizSubmit = async () => {
    if (!currentVideo || !user) return;

    const quiz = currentVideo.quiz;
    const totalQuestions = quiz.questions.length;

    // Calculate score
    let correctCount = 0;
    const answersArray = quiz.questions.map((q, index) => {
      const selectedAnswer = videoQuizAnswers[index];
      const isCorrect = selectedAnswer === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        questionIndex: index,
        selectedAnswer: selectedAnswer ?? -1,
        isCorrect,
      };
    });

    const score = Math.round((correctCount / totalQuestions) * 100);

    try {
      setVideoQuizSubmitting(true);

      // Submit to backend
      const response = await submitQuiz(currentVideo._id, {
        studentId: user.id,
        answers: answersArray,
        score,
        timeTaken: 0, // Could track actual time if needed
      });

      if (response.success) {
        setVideoQuizScore(score);
        setVideoQuizCompleted(true);

        // Mark quiz as completed locally
        setCompletedQuizzes((prev) => ({
          ...prev,
          [currentVideo._id]: { completed: true, score },
        }));

        console.log('Quiz score:', score);
        console.log('Awarding 10 coins for quiz completion');

        // Award coins for completing quiz (regardless of score to encourage learning)
        await awardQuizPoints(currentVideo._id, currentVideo.title, score);
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      // Still show score even if backend fails
      setVideoQuizScore(score);
      setVideoQuizCompleted(true);
    } finally {
      setVideoQuizSubmitting(false);
    }
  };

  // Reset video quiz state
  const resetVideoQuiz = () => {
    setShowVideoQuiz(false);
    setVideoQuizAnswers({});
    setVideoQuizIndex(0);
    setVideoQuizCompleted(false);
    setVideoQuizScore(0);
    setVideoWatched(false);
    setPointsEarned(null);
    setShowGame(false);
    setGameCompleted(false);
  };

  // Handle game completion
  const handleGameComplete = () => {
    setGameCompleted(true);
    // Award points for game completion if needed
    // After game completion, allow moving to quiz
  };

  // Award points for watching video
  const awardVideoPoints = async (syllabusId, videoTitle) => {
    if (!user?.id) return;

    try {
      const response = await api.post("/student/award-video-points", {
        studentId: user.id,
        syllabusId: syllabusId,
        videoTitle: videoTitle,
      });

      if (response.data.success) {
        const {
          pointsAwarded,
          totalPoints,
          todayPoints,
          currentXP,
          level,
          nextLevelXP,
          dailyChallengeCompleted,
        } = response.data.data;

        if (pointsAwarded > 0) {
          setPointsEarned(pointsAwarded);

          // Update user data in localStorage
          const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
          storedUser.points = totalPoints;
          storedUser.todayPoints = todayPoints;
          storedUser.currentXP = currentXP;
          storedUser.level = level;
          storedUser.nextLevelXP = nextLevelXP;
          localStorage.setItem("user", JSON.stringify(storedUser));

          // Show daily challenge completion message
          if (dailyChallengeCompleted) {
            console.log(
              'Daily challenge "Watch a Video" completed! +50 XP bonus'
            );
          }
        }

        // Mark video as watched locally
        setWatchedVideosList((prev) => ({
          ...prev,
          [syllabusId]: true,
        }));
      }
    } catch (error) {
      console.error("Error awarding video points:", error);
    }
  };

  // Award points for completing quiz
  const awardQuizPoints = async (syllabusId, quizTitle, score) => {
    if (!user?.id) return;

    try {
      const response = await api.post("/student/award-quiz-points", {
        studentId: user.id,
        syllabusId: syllabusId,
        quizTitle: quizTitle,
        score: score,
      });

      if (response.data.success) {
        const {
          pointsAwarded,
          totalPoints,
          todayPoints,
          currentXP,
          level,
          nextLevelXP,
          dailyChallengeCompleted,
        } = response.data.data;

        if (pointsAwarded > 0) {
          // Update user data in localStorage
          const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
          storedUser.points = totalPoints;
          storedUser.todayPoints = todayPoints;
          storedUser.currentXP = currentXP;
          storedUser.level = level;
          storedUser.nextLevelXP = nextLevelXP;
          localStorage.setItem("user", JSON.stringify(storedUser));

          console.log(`Quiz completed! +${pointsAwarded} points awarded`);

          // Award 10 coins for completing quiz
          try {
            const coinResponse = await completeGame({
              studentId: user.id,
              gameId: `quiz-${syllabusId}`,
              gameName: `Quiz: ${quizTitle}`,
              pointsEarned: 0,
              coinsEarned: 10
            });
            
            if (coinResponse.success && coinResponse.data) {
              // Update coins in localStorage
              storedUser.coins = coinResponse.data.coins;
              localStorage.setItem("user", JSON.stringify(storedUser));
              console.log('Quiz completed! +10 coins awarded');
            }
          } catch (coinError) {
            console.error('Error awarding quiz coins:', coinError);
          }

          // Show daily challenge completion message
          if (dailyChallengeCompleted) {
            console.log(
              'Daily challenge "Complete a Quiz" completed! +75 XP bonus'
            );
          }
        }
      }
    } catch (error) {
      console.error("Error awarding quiz points:", error);
    }
  };

  // Check if a lesson is unlocked
  const isLessonUnlocked = (lesson) => {
    if (!lesson.prerequisite) return true; // First lesson is always unlocked
    return lessonCompletionStatus[lesson.prerequisite]?.completed || false;
  };

  // Get lesson status from state
  const getLessonStatus = (lessonId) => {
    return (
      lessonCompletionStatus[lessonId] || {
        completed: false,
        progress: 0,
        score: 0,
      }
    );
  };

  // Mark lesson as completed and unlock next lesson
  const markLessonCompleted = (lessonId, score) => {
    setLessonCompletionStatus((prev) => ({
      ...prev,
      [lessonId]: {
        completed: score >= 70, // Pass requirement is 70%
        progress: 100,
        score: score,
      },
    }));
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-700";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-700";
      case "Advanced":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Stats based on syllabus videos from backend
  const totalLessons = syllabusVideos.length;
  const completedLessons = Object.keys(watchedVideosList).length; // Count of watched videos
  const totalProgress =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const totalPoints = completedLessons * 10; // 10 points per video watched

  const handleWatchLesson = (lesson) => {
    setSelectedLesson(lesson);
    setIsVideoPlaying(false);
    setVideoProgress(0);
    setShowQuiz(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setQuizScore(0);
  };

  const handleVideoComplete = () => {
    setIsVideoPlaying(false);
    setVideoProgress(100);
    setTimeout(() => {
      setShowQuiz(true);
    }, 1000);
  };

  const handleQuizAnswer = (questionIndex, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerIndex,
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < selectedLesson.quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const correctAnswers = selectedLesson.quiz.questions.filter(
        (question, index) => selectedAnswers[index] === question.correctAnswer
      ).length;
      const score = Math.round(
        (correctAnswers / selectedLesson.quiz.questions.length) * 100
      );
      setQuizScore(score);
      setQuizCompleted(true);

      // Mark lesson as completed if passed
      markLessonCompleted(selectedLesson.id, score);
    }
  };

  const handleCloseLesson = () => {
    setSelectedLesson(null);
  };

  const simulateVideoProgress = () => {
    if (isVideoPlaying && videoProgress < 100) {
      setVideoProgress((prev) => Math.min(prev + 2, 100));
      if (videoProgress >= 98) {
        handleVideoComplete();
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(simulateVideoProgress, 200);
    return () => clearInterval(interval);
  }, [isVideoPlaying, videoProgress]);

  return (
    <div className="min-h-screen bg-[#1a3a2e] overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />

        {/* Floating Icons */}
        <div className="absolute top-20 left-10 text-6xl opacity-10 animate-float">
          📚
        </div>
        <div
          className="absolute top-40 right-20 text-5xl opacity-10 animate-float"
          style={{ animationDelay: "1s" }}
        >
          🎓
        </div>
        <div
          className="absolute bottom-40 left-1/4 text-4xl opacity-10 animate-float"
          style={{ animationDelay: "2s" }}
        >
          🌱
        </div>
      </div>

      <Navigation userType="student" />

      {/* Video Player Modal - Same style as Admin Syllabus Page */}
      {showVideoPlayer && currentVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    showVideoQuiz
                      ? "bg-[#237a57]"
                      : "bg-[#3b9b8f]"
                  }`}
                >
                  {showVideoQuiz ? (
                    <HelpCircle className="w-5 h-5 text-white" />
                  ) : (
                    <Video className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {showVideoQuiz
                      ? `Quiz: ${currentVideo.title}`
                      : currentVideo.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30">
                      {currentVideo.subject}
                    </Badge>
                    <Badge className="bg-blue-500/20 text-blue-300 text-xs border border-blue-500/30">
                      {currentVideo.grade}
                    </Badge>
                    {currentVideo.quiz?.questions?.length > 0 && (
                      <Badge className="bg-emerald-500/20 text-emerald-300 text-xs border border-emerald-500/30">
                        📝 Quiz Available
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowVideoPlayer(false);
                  setCurrentVideo(null);
                  resetVideoQuiz();
                }}
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Content: Video Player / Game / Quiz */}
            {showGame ? (
              /* Game View - Fullscreen Responsive */
              <div className="fixed inset-0 z-[100] bg-black flex flex-col">
                {/* Game Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 md:p-4 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2 md:gap-3">
                    <Gamepad2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    <div>
                      <h3 className="text-white font-bold text-sm md:text-base">🎮 Eco Snake & Ladder</h3>
                      <p className="text-purple-200 text-xs md:text-sm hidden sm:block">Learn while having fun!</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        setShowGame(false);
                        setVideoWatched(true);
                      }}
                      variant="ghost"
                      className="text-white hover:bg-white/20 text-xs md:text-sm px-2 md:px-3"
                    >
                      ← Back
                    </Button>
                    <Button
                      onClick={() => {
                        setShowGame(false);
                        setGameCompleted(true);
                        // Move to quiz after game
                        if (currentVideo.quiz?.questions?.length > 0 && !completedQuizzes[currentVideo._id]) {
                          setShowVideoQuiz(true);
                        } else {
                          // Close the video player if no quiz
                          setShowVideoPlayer(false);
                          setCurrentVideo(null);
                        }
                      }}
                      className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white text-xs md:text-sm px-2 md:px-4"
                    >
                      {currentVideo.quiz?.questions?.length > 0 && !completedQuizzes[currentVideo._id] 
                        ? "Complete & Take Quiz →" 
                        : "Complete Game ✓"}
                    </Button>
                  </div>
                </div>
                
                {/* Game Container - Fills remaining space */}
                <div className="flex-1 overflow-auto bg-gradient-to-b from-gray-900 to-black">
                  <div className="w-full h-full flex items-center justify-center p-2 md:p-4">
                    <div className="w-full max-w-5xl mx-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                      <EcoSnakesLadders />
                    </div>
                  </div>
                </div>
                
                {/* Game Footer */}
                <div className="bg-gray-900 p-2 md:p-3 flex items-center justify-between border-t border-gray-700 flex-shrink-0">
                  <p className="text-gray-400 text-xs md:text-sm hidden sm:block">
                    🎯 Play the game to earn points! Complete the game to proceed.
                  </p>
                  <div className="flex gap-2 md:gap-3 ml-auto">
                    {currentVideo.quiz?.questions?.length > 0 && !completedQuizzes[currentVideo._id] && (
                      <Button
                        onClick={() => {
                          setShowGame(false);
                          setGameCompleted(true);
                          setShowVideoQuiz(true);
                        }}
                        className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs md:text-sm"
                      >
                        <HelpCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                        Start Quiz
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : !showVideoQuiz ? (
              <>
                <div className="relative bg-black">
                  <video
                    src={currentVideo.videoUrl}
                    poster={currentVideo.thumbnailUrl}
                    controls
                    autoPlay
                    className="w-full aspect-video"
                    style={{ maxHeight: "60vh" }}
                    onEnded={() => {
                      // Award points for watching video
                      awardVideoPoints(currentVideo._id, currentVideo.title);

                      // When video ends, mark as watched to show the quiz prompt
                      setVideoWatched(true);
                    }}
                  />

                  {/* Quiz Prompt Overlay - Shows after video ends */}
                  {videoWatched && !showGame && (
                    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center">
                      <div className="text-center p-8">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#237a57] flex items-center justify-center">
                          {pointsEarned ? (
                            <Trophy className="w-10 h-10 text-white" />
                          ) : (
                            <HelpCircle className="w-10 h-10 text-white" />
                          )}
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          🎉 Video Completed!
                        </h3>

                        {/* Points earned message */}
                        {pointsEarned && (
                          <div className="mb-4 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg border border-amber-500/30">
                            <p className="text-amber-400 font-semibold">
                              +{pointsEarned} Points Earned! 🌟
                            </p>
                          </div>
                        )}

                        <p className="text-gray-300 mb-6">
                          Great job watching the lesson! Now let's play a fun game to reinforce what you learned!
                        </p>

                        {/* Game & Quiz info */}
                        <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
                          <div className="flex items-center gap-2 text-purple-400">
                            <span className="text-2xl">🎮</span>
                            <span>Play Snake & Ladder</span>
                          </div>
                          {currentVideo.quiz?.questions?.length > 0 &&
                            !completedQuizzes[currentVideo._id] && (
                              <>
                                <span className="text-gray-500">→</span>
                                <div className="flex items-center gap-2 text-amber-400">
                                  <Sparkles className="w-5 h-5" />
                                  <span>
                                    {currentVideo.quiz.questions.length} Quiz Questions
                                  </span>
                                </div>
                              </>
                            )}
                        </div>

                        <div className="flex gap-4 justify-center">
                          <Button
                            variant="outline"
                            onClick={() => setVideoWatched(false)}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            Watch Again
                          </Button>
                          <Button
                            onClick={() => {
                              setVideoWatched(false);
                              setShowGame(true);
                            }}
                            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8"
                          >
                            <span className="mr-2">🎮</span>
                            Play Game
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Details */}
                <div className="p-4 border-t border-gray-700 max-h-[250px] overflow-y-auto">
                  <h3 className="text-white font-medium mb-2">
                    About this lesson
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {currentVideo.description
                      ? currentVideo.description
                      : `Learn about ${currentVideo.title} in this educational video covering ${currentVideo.subject} for ${currentVideo.grade} students.`}
                  </p>

                  {/* Topics - only show if there are topics with actual names */}
                  {currentVideo.topics &&
                  currentVideo.topics.length > 0 &&
                  currentVideo.topics.some((t) => t.topicName) ? (
                    <div>
                      <h4 className="text-white font-medium mb-2 text-sm">
                        Topics Covered
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {currentVideo.topics
                          .filter((t) => t.topicName)
                          .map((topic, i) => (
                            <div
                              key={i}
                              className="flex flex-col gap-1 p-2 bg-gray-800 rounded-lg border border-gray-700"
                            >
                              <span className="text-sm text-white font-medium">
                                {topic.topicName}
                              </span>
                              {topic.description && (
                                <span className="text-xs text-gray-400">
                                  {topic.description}
                                </span>
                              )}
                              {topic.duration && (
                                <span className="text-xs text-purple-400">
                                  Duration: {topic.duration}
                                </span>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <BookOpen className="w-4 h-4" />
                      <span>
                        This video covers key concepts in {currentVideo.subject}
                      </span>
                    </div>
                  )}
                </div>

                {/* Modal Footer with Quiz Button */}
                <div className="flex items-center justify-between gap-3 p-4 border-t border-gray-700 bg-gray-800/50">
                  <div className="flex items-center gap-2">
                    {currentVideo.quiz?.questions?.length > 0 &&
                      (completedQuizzes[currentVideo._id] ? (
                        <div className="flex items-center gap-2 text-emerald-400">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm">
                            Quiz Completed - Score:{" "}
                            {completedQuizzes[currentVideo._id].score}%
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-400">
                          <HelpCircle className="w-5 h-5" />
                          <span className="text-sm">
                            {currentVideo.quiz.questions.length} Questions
                            Available
                          </span>
                        </div>
                      ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowVideoPlayer(false);
                        setCurrentVideo(null);
                        resetVideoQuiz();
                      }}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Close
                    </Button>
                    {currentVideo.quiz?.questions?.length > 0 &&
                      !completedQuizzes[currentVideo._id] && (
                        <Button
                          onClick={() => setShowVideoQuiz(true)}
                          className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white"
                        >
                          <HelpCircle className="w-4 h-4 mr-2" />
                          Take Quiz
                        </Button>
                      )}
                  </div>
                </div>
              </>
            ) : (
              /* Quiz Content */
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {!videoQuizCompleted ? (
                  <div className="space-y-6">
                    {/* Quiz Progress */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">
                        Quiz Time! 🎯
                      </h3>
                      <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Question {videoQuizIndex + 1} of{" "}
                        {currentVideo.quiz.questions.length}
                      </Badge>
                    </div>

                    <Progress
                      value={
                        ((videoQuizIndex + 1) /
                          currentVideo.quiz.questions.length) *
                        100
                      }
                      className="h-2 bg-gray-700"
                    />

                    {/* Current Question */}
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                      <h4 className="text-lg font-semibold text-white mb-6">
                        {currentVideo.quiz.questions[videoQuizIndex].question}
                      </h4>

                      <div className="grid gap-3">
                        {currentVideo.quiz.questions[
                          videoQuizIndex
                        ].options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() =>
                              handleVideoQuizAnswer(videoQuizIndex, index)
                            }
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                              videoQuizAnswers[videoQuizIndex] === index
                                ? "border-emerald-500 bg-emerald-500/20 text-white"
                                : "border-gray-600 hover:border-gray-500 text-gray-300 hover:bg-gray-700/50"
                            }`}
                          >
                            <span
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                videoQuizAnswers[videoQuizIndex] === index
                                  ? "bg-emerald-500 text-white"
                                  : "bg-gray-700 text-gray-300"
                              }`}
                            >
                              {String.fromCharCode(65 + index)}
                            </span>
                            <span>{option}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        disabled={videoQuizIndex === 0}
                        onClick={() => setVideoQuizIndex((prev) => prev - 1)}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>

                      {videoQuizIndex ===
                      currentVideo.quiz.questions.length - 1 ? (
                        <Button
                          disabled={
                            videoQuizAnswers[videoQuizIndex] === undefined ||
                            videoQuizSubmitting
                          }
                          onClick={handleVideoQuizSubmit}
                          className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700"
                        >
                          {videoQuizSubmitting ? (
                            <>
                              <Loader className="w-4 h-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              Submit Quiz
                              <Award className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          disabled={
                            videoQuizAnswers[videoQuizIndex] === undefined
                          }
                          onClick={() => setVideoQuizIndex((prev) => prev + 1)}
                          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                        >
                          Next
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Quiz Results */
                  <div className="text-center space-y-6 py-8">
                    <div
                      className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto ${
                        videoQuizScore >= (currentVideo.quiz.passingScore || 70)
                          ? "bg-gradient-to-br from-emerald-500 to-cyan-600"
                          : "bg-gradient-to-br from-amber-500 to-orange-600"
                      }`}
                    >
                      {videoQuizScore >=
                      (currentVideo.quiz.passingScore || 70) ? (
                        <Trophy className="w-12 h-12 text-white" />
                      ) : (
                        <Target className="w-12 h-12 text-white" />
                      )}
                    </div>

                    <div>
                      <h3 className="text-3xl font-bold text-white mb-2">
                        Quiz Completed!
                      </h3>
                      <div
                        className={`text-6xl font-bold ${
                          videoQuizScore >=
                          (currentVideo.quiz.passingScore || 70)
                            ? "text-emerald-400"
                            : "text-amber-400"
                        }`}
                      >
                        {videoQuizScore}%
                      </div>
                    </div>

                    <p className="text-lg text-gray-400">
                      You scored{" "}
                      {
                        Object.values(videoQuizAnswers).filter(
                          (ans, idx) =>
                            ans ===
                            currentVideo.quiz.questions[idx]?.correctAnswer
                        ).length
                      }{" "}
                      out of {currentVideo.quiz.questions.length} correct!
                    </p>

                    {videoQuizScore >=
                    (currentVideo.quiz.passingScore || 70) ? (
                      <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
                        <p className="text-emerald-300 font-semibold">
                          🎉 Congratulations! You passed the quiz!
                        </p>
                        <p className="text-emerald-400/70 text-sm mt-1">
                          Your score has been added to the leaderboard.
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-500/20 border border-amber-500/30 rounded-xl">
                        <p className="text-amber-300 font-semibold">
                          📚 You need {currentVideo.quiz.passingScore || 70}% to
                          pass.
                        </p>
                        <p className="text-amber-400/70 text-sm mt-1">
                          Review the video and try again!
                        </p>
                      </div>
                    )}

                    <div className="flex justify-center gap-4 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          resetVideoQuiz();
                        }}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        Watch Video Again
                      </Button>
                      <Button
                        onClick={() => {
                          setShowVideoPlayer(false);
                          setCurrentVideo(null);
                          resetVideoQuiz();
                        }}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                      >
                        Continue Learning
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <main className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Video Player Modal */}
        {selectedLesson && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-bold">{selectedLesson.title}</h2>
                <Button variant="ghost" size="icon" onClick={handleCloseLesson}>
                  <X className="w-6 h-6" />
                </Button>
              </div>

              {!showQuiz ? (
                <div className="p-6">
                  <div className="relative bg-black rounded-lg overflow-hidden mb-6">
                    <div className="aspect-video bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                      <div className="text-center text-white">
                        <selectedLesson.icon className="w-16 h-16 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2">
                          {selectedLesson.title}
                        </h3>
                        <p className="text-emerald-100 mb-6">
                          {selectedLesson.description}
                        </p>

                        {!isVideoPlaying && videoProgress === 0 && (
                          <Button
                            size="lg"
                            className="bg-white text-emerald-600 hover:bg-gray-100"
                            onClick={() => setIsVideoPlaying(true)}
                          >
                            <Play className="w-6 h-6 mr-2" />
                            Start Animated Video
                          </Button>
                        )}

                        {isVideoPlaying && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-center space-x-4">
                              <Button
                                variant="secondary"
                                onClick={() => setIsVideoPlaying(false)}
                              >
                                <PauseCircle className="w-6 h-6" />
                              </Button>
                              <Button variant="secondary">
                                <Volume2 className="w-6 h-6" />
                              </Button>
                              <Button variant="secondary">
                                <Maximize className="w-6 h-6" />
                              </Button>
                            </div>
                            <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                              <div
                                className="bg-white h-2 rounded-full transition-all duration-200"
                                style={{ width: `${videoProgress}%` }}
                              ></div>
                            </div>
                            <p className="text-sm">
                              Video Progress: {Math.round(videoProgress)}%
                            </p>
                          </div>
                        )}

                        {videoProgress === 100 && !showQuiz && (
                          <div className="space-y-4">
                            <CheckCircle className="w-16 h-16 mx-auto text-white" />
                            <p className="text-lg">
                              Video completed! Ready for quiz?
                            </p>
                            <Button
                              size="lg"
                              className="bg-white text-emerald-600 hover:bg-gray-100"
                              onClick={() => setShowQuiz(true)}
                            >
                              <HelpCircle className="w-6 h-6 mr-2" />
                              Take Quiz
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <span>{selectedLesson.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span>{selectedLesson.points} points</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={getDifficultyColor(
                          selectedLesson.difficulty
                        )}
                      >
                        {selectedLesson.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  {!quizCompleted ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold">Quiz Time!</h3>
                        <Badge variant="outline">
                          Question {currentQuestionIndex + 1} of{" "}
                          {selectedLesson.quiz.questions.length}
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold">
                          {
                            selectedLesson.quiz.questions[currentQuestionIndex]
                              .question
                          }
                        </h4>

                        <div className="grid gap-3">
                          {selectedLesson.quiz.questions[
                            currentQuestionIndex
                          ].options.map((option, index) => (
                            <Button
                              key={index}
                              variant={
                                selectedAnswers[currentQuestionIndex] === index
                                  ? "default"
                                  : "outline"
                              }
                              className="justify-start text-left h-auto p-4"
                              onClick={() =>
                                handleQuizAnswer(currentQuestionIndex, index)
                              }
                            >
                              <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center mr-3 text-sm font-bold">
                                {String.fromCharCode(65 + index)}
                              </span>
                              {option}
                            </Button>
                          ))}
                        </div>

                        <div className="flex justify-between">
                          <Button
                            variant="outline"
                            disabled={currentQuestionIndex === 0}
                            onClick={() =>
                              setCurrentQuestionIndex(currentQuestionIndex - 1)
                            }
                          >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Previous
                          </Button>

                          <Button
                            disabled={
                              selectedAnswers[currentQuestionIndex] ===
                              undefined
                            }
                            onClick={handleNextQuestion}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            {currentQuestionIndex ===
                            selectedLesson.quiz.questions.length - 1 ? (
                              <>
                                Finish Quiz
                                <Award className="w-4 h-4 ml-2" />
                              </>
                            ) : (
                              <>
                                Next
                                <ChevronRight className="w-4 h-4 ml-2" />
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-6">
                      <div className="space-y-4">
                        <Award className="w-20 h-20 mx-auto text-yellow-500" />
                        <h3 className="text-3xl font-bold">Quiz Completed!</h3>
                        <div className="text-6xl font-bold text-emerald-600">
                          {quizScore}%
                        </div>
                        <p className="text-lg text-gray-600">
                          You scored{" "}
                          {
                            Object.keys(selectedAnswers).filter(
                              (key) =>
                                selectedAnswers[key] ===
                                selectedLesson.quiz.questions[key].correctAnswer
                            ).length
                          }{" "}
                          out of {selectedLesson.quiz.questions.length} correct!
                        </p>

                        {quizScore >= 70 ? (
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-800 font-semibold mb-2">
                              🎉 Congratulations! You passed the quiz and earned{" "}
                              {selectedLesson.points} points!
                            </p>
                            {/* Check if next lesson is unlocked */}
                            {(() => {
                              const nextLesson = lessons.find(
                                (l) => l.prerequisite === selectedLesson.id
                              );
                              if (nextLesson && quizScore >= 70) {
                                return (
                                  <p className="text-green-700 text-sm">
                                    🔓 Level {nextLesson.level} "
                                    {nextLesson.title}" is now unlocked!
                                  </p>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        ) : (
                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-yellow-800 font-semibold">
                              📚 You need 70% to pass. Review the video and try
                              again!
                            </p>
                          </div>
                        )}

                        <div className="flex justify-center space-x-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowQuiz(false);
                              setVideoProgress(0);
                              setCurrentQuestionIndex(0);
                              setSelectedAnswers({});
                              setQuizCompleted(false);
                            }}
                          >
                            Watch Again
                          </Button>
                          <Button
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={handleCloseLesson}
                          >
                            Continue Learning
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Environmental Story Lessons - Featured Section */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
              <TreePine className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Environmental Adventures</h1>
              <p className="text-gray-400">
                Explore Air, Water, and Land Management through animated stories
              </p>
            </div>
          </div>

          {/* Story Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Air Management */}
            <div className="bg-gradient-to-br from-sky-600 to-blue-700 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border-4 border-sky-400/30 cursor-pointer group">
              <div className="text-center">
                <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-5xl mb-4 shadow-lg group-hover:scale-110 transition-transform mx-auto backdrop-blur-sm">
                  💨
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Air Management</h3>
                <p className="text-white/90 text-sm mb-4 leading-relaxed">
                  Learn about air quality, pollution, and protecting our atmosphere
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                    <span className="text-sm font-semibold text-white flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Videos:
                    </span>
                    <span className="text-sm font-bold text-white">5</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                    <span className="text-sm font-semibold text-white flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      Quizzes:
                    </span>
                    <span className="text-sm font-bold text-white">10</span>
                  </div>
                </div>
                <Button
                  onClick={() => window.open('/environmental-stories?category=air-management', '_blank')}
                  className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 backdrop-blur-sm border border-white/30"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Learning
                </Button>
              </div>
            </div>

            {/* Water Management */}
            <div className="bg-gradient-to-br from-blue-600 to-cyan-700 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border-4 border-cyan-400/30 cursor-pointer group">
              <div className="text-center">
                <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-5xl mb-4 shadow-lg group-hover:scale-110 transition-transform mx-auto backdrop-blur-sm">
                  💧
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Water Management</h3>
                <p className="text-white/90 text-sm mb-4 leading-relaxed">
                  Discover water conservation, the water cycle, and preserving resources
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                    <span className="text-sm font-semibold text-white flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Videos:
                    </span>
                    <span className="text-sm font-bold text-white">5</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                    <span className="text-sm font-semibold text-white flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      Quizzes:
                    </span>
                    <span className="text-sm font-bold text-white">10</span>
                  </div>
                </div>
                <Button
                  onClick={() => window.open('/environmental-stories?category=water-management', '_blank')}
                  className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 backdrop-blur-sm border border-white/30"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Learning
                </Button>
              </div>
            </div>

            {/* Land Management */}
            <div className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border-4 border-emerald-400/30 cursor-pointer group">
              <div className="text-center">
                <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-5xl mb-4 shadow-lg group-hover:scale-110 transition-transform mx-auto backdrop-blur-sm">
                  🌍
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Land Management</h3>
                <p className="text-white/90 text-sm mb-4 leading-relaxed">
                  Understand soil health, deforestation, and sustainable practices
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                    <span className="text-sm font-semibold text-white flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Videos:
                    </span>
                    <span className="text-sm font-bold text-white">5</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                    <span className="text-sm font-semibold text-white flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      Quizzes:
                    </span>
                    <span className="text-sm font-bold text-white">10</span>
                  </div>
                </div>
                <Button
                  onClick={() => window.open('/environmental-stories?category=land-management', '_blank')}
                  className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 backdrop-blur-sm border border-white/30"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Learning
                </Button>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-3xl p-6 border-2 border-amber-500/30 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-center text-white mb-4 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-3 text-white font-bold shadow-lg">
                  1
                </div>
                <h3 className="font-bold text-white mb-2">Watch Videos</h3>
                <p className="text-gray-300 text-sm">
                  Watch animated videos with voice narration about environment
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-3 text-white font-bold shadow-lg">
                  2
                </div>
                <h3 className="font-bold text-white mb-2">Take Quiz</h3>
                <p className="text-gray-300 text-sm">
                  Answer 2 questions after each video to test your knowledge
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-3 text-white font-bold shadow-lg">
                  3
                </div>
                <h3 className="font-bold text-white mb-2">Master Topics</h3>
                <p className="text-gray-300 text-sm">
                  Questions repeat until you answer correctly with encouragement!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-12">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700/50"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 text-gray-400 bg-[#1a3a2e]">Teacher Video Lessons</span>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Video Lessons</h1>
              <p className="text-gray-400">
                Watch educational videos created by your teachers{" "}
                {user?.class && `for ${user.class}`}
              </p>
            </div>
          </div>
        </div>

        {/* Class Videos from Admin */}
        <div>
          <Card className="glass border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                Your Video Lessons {user?.class && - `${user.class}`}
                <Badge className="ml-auto bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Sparkles className="w-3 h-3 mr-1" /> AI Generated
                </Badge>
              </CardTitle>
              <p className="text-gray-400">
                Educational videos created by your teachers
              </p>
            </CardHeader>
            <CardContent>
              {loadingVideos ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-8 h-8 text-purple-400 animate-spin mr-3" />
                  <span className="text-gray-400">Loading class videos...</span>
                </div>
              ) : [...syllabusVideos, ...uploadedVideos].length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...syllabusVideos, ...uploadedVideos].map((syllabus, index) => (
                    <div
                      key={syllabus._id}
                      className="group bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Video Preview - Inline like admin page */}
                      <div className="relative aspect-video bg-gradient-to-br from-purple-900/50 to-pink-900/50">
                        {syllabus.videoUrl ? (
                          <video
                            src={syllabus.videoUrl}
                            poster={syllabus.thumbnailUrl}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => {
                              setCurrentVideo(syllabus);
                              setShowVideoPlayer(true);
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="w-16 h-16 text-purple-400/50" />
                          </div>
                        )}
                        {/* Play overlay */}
                        <div
                          className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                          onClick={() => {
                            setCurrentVideo(syllabus);
                            setShowVideoPlayer(true);
                          }}
                        >
                          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                            <Play className="w-8 h-8 text-purple-600 ml-1" />
                          </div>
                        </div>
                        {/* Duration badge */}
                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded-md text-xs text-white">
                          5 min
                        </div>
                      </div>

                      {/* Video Info */}
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge className="bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30">
                            {syllabus.subject}
                          </Badge>
                          <Badge className="bg-blue-500/20 text-blue-300 text-xs border border-blue-500/30">
                            {syllabus.grade}
                          </Badge>
                          {/* Uploaded video badge */}
                          {syllabus.isUploadedVideo && (
                            <Badge className="bg-green-500/20 text-green-300 text-xs border border-green-500/30 flex items-center gap-1">
                              <Video className="w-3 h-3" />
                              Uploaded
                            </Badge>
                          )}
                          {/* Watched badge */}
                          {watchedVideosList[syllabus._id] && (
                            <Badge className="bg-emerald-500/20 text-emerald-300 text-xs border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Watched
                            </Badge>
                          )}
                          {/* Quiz completed badge */}
                          {completedQuizzes[syllabus._id] && (
                            <Badge className="bg-amber-500/20 text-amber-300 text-xs border border-amber-500/30 flex items-center gap-1">
                              <Trophy className="w-3 h-3" />
                              Quiz: {completedQuizzes[syllabus._id].score}%
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                          {syllabus.title}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                          {syllabus.description
                            ? syllabus.description
                            : `Learn about ${syllabus.title} - ${syllabus.subject} for ${syllabus.grade}`}
                        </p>

                        {/* Topics */}
                        {syllabus.topics && syllabus.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {syllabus.topics.slice(0, 3).map((topic, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 bg-gray-700/50 text-gray-300 rounded-full"
                              >
                                {topic.topicName}
                              </span>
                            ))}
                            {syllabus.topics.length > 3 && (
                              <span className="text-xs px-2 py-1 bg-gray-700/50 text-gray-400 rounded-full">
                                +{syllabus.topics.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        <Button
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30"
                          onClick={() => {
                            setCurrentVideo(syllabus);
                            setShowVideoPlayer(true);
                          }}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Watch Video
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium text-lg">
                    No Videos for Your Class Yet
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Your teachers haven't uploaded any videos for{" "}
                    <span className="text-purple-400 font-semibold">
                      {user?.class || "your class"}
                    </span>{" "}
                    yet.
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Check back later for new content!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mt-12">
          <Card className="glass border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                How Video Lessons Work
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-400">
                  Each lesson features an engaging animated video followed by a
                  quiz to reinforce your learning:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-500/20 rounded-xl border border-blue-500/30">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium text-white">
                        Watch Animation
                      </h4>
                      <p className="text-sm text-gray-400">
                        Engaging animated videos with clear explanations
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium text-white">Take Quiz</h4>
                      <p className="text-sm text-gray-400">
                        Multiple choice questions to test understanding
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-amber-500/20 rounded-xl border border-amber-500/30">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium text-white">Earn Rewards</h4>
                      <p className="text-sm text-gray-400">
                        Get points and track your progress
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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

export default Lessons;