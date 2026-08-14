import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  XCircle, 
  SkipForward, 
  SkipBack,
  Sparkles 
} from 'lucide-react';
import { storiesData } from '../../lib/class-stories-data';

// Animated Video Component
function AnimatedVideo({ video, isPlaying, currentSceneIndex, elapsedTime, onDoubleTap, skipIndicator }) {
  const currentScene = video.scenes[currentSceneIndex] || video.scenes[0];
  const videoRef = useRef(null);

  // Find the current subtitle based on elapsed time
  const currentSubtitle = video.subtitles?.find(
    (subtitle) => elapsedTime >= subtitle.startTime && elapsedTime < subtitle.endTime
  );

  const handleVideoTap = (e) => {
    if (!videoRef.current) return;

    const rect = videoRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftSide = x < rect.width / 2;

    onDoubleTap(isLeftSide ? "backward" : "forward");
  };

  return (
    <div
      ref={videoRef}
      className="w-full h-full relative overflow-hidden bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 select-none"
      onDoubleClick={handleVideoTap}
    >
      <img
        key={currentSceneIndex}
        src={currentScene.image || "/placeholder.svg"}
        alt={video.title}
        className={`w-full h-full object-cover transition-all duration-1000 ${
          isPlaying ? "scale-105 animate-pulse" : "scale-100"
        }`}
        style={{
          animation: isPlaying ? "fadeIn 1s ease-in" : "none",
        }}
        onError={(e) => {
          e.target.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
          e.target.style.display = "flex";
          e.target.style.alignItems = "center";
          e.target.style.justifyContent = "center";
          e.target.alt = "🌍";
        }}
      />

      {/* Animated overlay effects */}
      <div className={`absolute inset-0 ${isPlaying ? "animate-[shimmer_3s_ease-in-out_infinite]" : ""}`}>
        <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-300/20 rounded-full blur-3xl animate-float-delayed" />
      </div>

      {skipIndicator && (
        <div
          key={skipIndicator.timestamp}
          className={`absolute top-1/2 -translate-y-1/2 ${
            skipIndicator.direction === "forward" ? "right-8" : "left-8"
          } animate-fade-in`}
        >
          <div className="bg-black/80 backdrop-blur-sm rounded-full p-6 shadow-2xl">
            {skipIndicator.direction === "forward" ? (
              <SkipForward className="w-12 h-12 text-white" />
            ) : (
              <SkipBack className="w-12 h-12 text-white" />
            )}
          </div>
          <p className="text-white text-sm font-bold text-center mt-2 bg-black/80 rounded-full px-3 py-1">
            {skipIndicator.direction === "forward" ? "+10s" : "-10s"}
          </p>
        </div>
      )}

      {currentSubtitle && isPlaying && (
        <div className="absolute bottom-8 left-0 right-0 px-4 flex justify-center pointer-events-none">
          <div
            key={currentSubtitle.startTime}
            className="bg-black/75 backdrop-blur-sm px-6 py-3 rounded-lg max-w-4xl animate-fade-in"
          >
            <p className="text-white text-lg md:text-xl font-semibold text-center leading-relaxed">
              {currentSubtitle.text}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EnvironmentalStories() {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category') || 'air-management';
  
  const [storyData, setStoryData] = useState(null);
  const [phase, setPhase] = useState("selection"); // selection, video, quiz
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [completedVideos, setCompletedVideos] = useState([]);
  const [allVideosCompleted, setAllVideosCompleted] = useState(false);
  const [skipIndicator, setSkipIndicator] = useState(null);

  const sceneTimerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const VIDEO_DURATION = 60000; // 60 seconds
  const startTimeRef = useRef(null);
  const lastSpokenSubtitleRef = useRef(null);

  useEffect(() => {
    setStoryData(storiesData[categoryFromUrl]);
  }, [categoryFromUrl]);

  const speakNarration = (text) => {
    if (isMuted) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1.2;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      window.speechSynthesis.cancel();
    }
  };

  useEffect(() => {
    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (phase === "video" && isPlaying && storyData && selectedVideoIndex !== null) {
      const currentVideo = storyData.videos[selectedVideoIndex];

      if (progress === 0 && elapsedTime === 0) {
        lastSpokenSubtitleRef.current = null;
        speakNarration(currentVideo.narration);
        startTimeRef.current = Date.now();
      }

      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const progressPercent = Math.min((elapsed / VIDEO_DURATION) * 100, 100);
        setProgress(progressPercent);
        setElapsedTime(elapsed);

        speakCurrentSubtitle(currentVideo, elapsed);

        if (elapsed >= VIDEO_DURATION) {
          clearInterval(progressIntervalRef.current);
          window.speechSynthesis.cancel();
          setIsPlaying(false);
          setProgress(100);
          setTimeout(() => {
            setPhase("quiz");
            setCurrentQuestion(0);
          }, 1000);
        }
      }, 50);
    }

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [phase, isPlaying, selectedVideoIndex, storyData, isMuted]);

  // Scene transition
  useEffect(() => {
    if (phase === "video" && isPlaying && storyData && selectedVideoIndex !== null) {
      const currentVideo = storyData.videos[selectedVideoIndex];
      const currentScene = currentVideo.scenes[currentSceneIndex];

      if (currentSceneIndex < currentVideo.scenes.length - 1) {
        sceneTimerRef.current = setTimeout(() => {
          setCurrentSceneIndex((prev) => prev + 1);
        }, currentScene.duration);
      }
    }

    return () => {
      if (sceneTimerRef.current) clearTimeout(sceneTimerRef.current);
    };
  }, [phase, isPlaying, selectedVideoIndex, currentSceneIndex, storyData]);

  const togglePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      if (sceneTimerRef.current) clearTimeout(sceneTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }
    setIsPlaying(!isPlaying);
  };

  const playVideo = (index) => {
    setSelectedVideoIndex(index);
    setPhase("video");
    setProgress(0);
    setCurrentSceneIndex(0);
    setElapsedTime(0);
    setIsPlaying(true);
  };

  const skipVideo = () => {
    window.speechSynthesis.cancel();
    if (sceneTimerRef.current) clearTimeout(sceneTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setPhase("quiz");
    setCurrentQuestion(0);
    setProgress(0);
    setElapsedTime(0);
  };

  const backToSelection = () => {
    window.speechSynthesis.cancel();
    if (sceneTimerRef.current) clearTimeout(sceneTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setPhase("selection");
    setSelectedVideoIndex(null);
    setIsPlaying(false);
    setProgress(0);
    setCurrentSceneIndex(0);
    setElapsedTime(0);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  const handleAnswerSelect = (answerIndex) => {
    if (!storyData || selectedVideoIndex === null) return;

    setSelectedAnswer(answerIndex);
    setShowFeedback(true);

    const currentVideo = storyData.videos[selectedVideoIndex];
    const question = currentVideo.quiz[currentQuestion];

    const isCorrect = answerIndex === question.correctAnswer;

    if (isCorrect) {
      setTimeout(() => {
        if (currentQuestion === currentVideo.quiz.length - 1) {
          const newCompletedVideos = [...completedVideos, selectedVideoIndex];
          setCompletedVideos(newCompletedVideos);

          if (newCompletedVideos.length === storyData.videos.length) {
            setAllVideosCompleted(true);
          }

          setTimeout(() => {
            backToSelection();
          }, 2000);
        } else {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedAnswer(null);
          setShowFeedback(false);
        }
      }, 2000);
    } else {
      setTimeout(() => {
        setSelectedAnswer(null);
        setShowFeedback(false);
      }, 2000);
    }
  };

  const speakCurrentSubtitle = (currentVideo, currentElapsed) => {
    if (isMuted) return;

    const currentSubtitle = currentVideo.subtitles?.find(
      (subtitle) => currentElapsed >= subtitle.startTime && currentElapsed < subtitle.endTime
    );

    if (currentSubtitle && lastSpokenSubtitleRef.current !== currentSubtitle.startTime) {
      window.speechSynthesis.cancel();
      speakNarration(currentSubtitle.text);
      lastSpokenSubtitleRef.current = currentSubtitle.startTime;
    }
  };

  const handleDoubleTapSkip = (direction) => {
    if (!isPlaying || !startTimeRef.current) return;

    const skipAmount = 10000; // 10 seconds
    const currentElapsed = Date.now() - startTimeRef.current;

    let newElapsed;
    if (direction === "forward") {
      newElapsed = Math.min(currentElapsed + skipAmount, VIDEO_DURATION);
    } else {
      newElapsed = Math.max(currentElapsed - skipAmount, 0);
    }

    startTimeRef.current = Date.now() - newElapsed;
    setElapsedTime(newElapsed);
    setProgress((newElapsed / VIDEO_DURATION) * 100);

    setSkipIndicator({ direction, timestamp: Date.now() });
    setTimeout(() => setSkipIndicator(null), 1000);
  };

  if (!storyData) {
    return (
      <div className="min-h-screen bg-[#1a3a2e] flex items-center justify-center">
        <Navigation userType="student" />
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <Navigation userType="student" />
      
      <div className="pt-20 px-4 py-8 md:px-8 max-w-6xl mx-auto">
        {/* Back Button */}
        <Link to="/lessons">
          <Button variant="ghost" size="lg" className="rounded-full text-lg gap-2 mb-6">
            <ArrowLeft className="w-5 h-5" />
            Back to Lessons
          </Button>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-24 h-24 mx-auto mb-4 bg-gradient-to-br ${storyData.color} rounded-3xl flex items-center justify-center text-6xl shadow-2xl`}>
            {storyData.emoji}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-2">{storyData.title}</h1>
          <p className="text-lg md:text-xl text-gray-600">
            {storyData.grade} • {storyData.videos.length} Videos • Interactive Quizzes
          </p>
        </div>

        {/* Video Selection Phase */}
        {phase === "selection" && (
          <div>
            {allVideosCompleted && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-3xl p-8 mb-8 text-center shadow-2xl">
                <Sparkles className="w-16 h-16 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">Congratulations! 🎉</h2>
                <p className="text-lg">You've completed all videos in {storyData.grade}!</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {storyData.videos.map((video, index) => (
                <div
                  key={index}
                  className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border-4 border-gray-100 cursor-pointer group"
                  onClick={() => playVideo(index)}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${storyData.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                      {completedVideos.includes(index) ? "✅" : index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{video.title}</h3>
                      {completedVideos.includes(index) && (
                        <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <span className="text-sm font-semibold text-gray-700">Duration:</span>
                      <span className="text-sm font-bold text-gray-900">1 minute</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <span className="text-sm font-semibold text-gray-700">Quiz Questions:</span>
                      <span className="text-sm font-bold text-gray-900">{video.quiz.length}</span>
                    </div>
                  </div>

                  <Button className={`w-full mt-4 bg-gradient-to-r ${storyData.color} hover:opacity-90 text-white font-bold py-6 text-lg rounded-2xl shadow-lg`}>
                    <Play className="w-5 h-5 mr-2" />
                    {completedVideos.includes(index) ? "Watch Again" : "Watch Video"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video Playing Phase */}
        {phase === "video" && selectedVideoIndex !== null && (
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-100">
            <div className="aspect-video bg-black relative">
              <AnimatedVideo
                video={storyData.videos[selectedVideoIndex]}
                isPlaying={isPlaying}
                currentSceneIndex={currentSceneIndex}
                elapsedTime={elapsedTime}
                onDoubleTap={handleDoubleTapSkip}
                skipIndicator={skipIndicator}
              />

              {/* Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                  >
                    {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-1" />}
                  </Button>
                  
                  <div className="flex-1">
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className={`bg-gradient-to-r ${storyData.color} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={toggleMute}
                    className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                  >
                    {isMuted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
                  </Button>

                  <Button
                    onClick={skipVideo}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white"
                  >
                    Skip to Quiz
                  </Button>

                  <Button
                    onClick={backToSelection}
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    <XCircle className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quiz Phase */}
        {phase === "quiz" && selectedVideoIndex !== null && (
          <div className="bg-white rounded-3xl p-8 shadow-2xl border-4 border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Time! 📝</h2>
              <p className="text-gray-600">
                Question {currentQuestion + 1} of {storyData.videos[selectedVideoIndex].quiz.length}
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                {storyData.videos[selectedVideoIndex].quiz[currentQuestion].question}
              </h3>

              <div className="space-y-4">
                {storyData.videos[selectedVideoIndex].quiz[currentQuestion].options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === storyData.videos[selectedVideoIndex].quiz[currentQuestion].correctAnswer;
                  const showResult = showFeedback && isSelected;

                  return (
                    <button
                      key={index}
                      onClick={() => !showFeedback && handleAnswerSelect(index)}
                      disabled={showFeedback}
                      className={`w-full text-left p-6 rounded-2xl border-4 transition-all font-semibold text-lg ${
                        showResult
                          ? isCorrect
                            ? "bg-green-100 border-green-500 text-green-800"
                            : "bg-red-100 border-red-500 text-red-800"
                          : "bg-gray-50 border-gray-200 hover:border-gray-400 text-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center text-sm font-bold ${
                          showResult && isCorrect
                            ? "bg-green-500 text-white border-green-600"
                            : showResult && !isCorrect
                            ? "bg-red-500 text-white border-red-600"
                            : "bg-white border-gray-300"
                        }`}>
                          {showResult && isCorrect ? "✓" : showResult && !isCorrect ? "✗" : String.fromCharCode(65 + index)}
                        </div>
                        <span>{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {showFeedback && selectedAnswer === storyData.videos[selectedVideoIndex].quiz[currentQuestion].correctAnswer && (
                <div className="mt-6 p-6 bg-green-100 border-4 border-green-500 rounded-2xl">
                  <p className="text-green-800 font-semibold text-lg">
                    {storyData.videos[selectedVideoIndex].quiz[currentQuestion].explanation}
                  </p>
                </div>
              )}

              {showFeedback && selectedAnswer !== storyData.videos[selectedVideoIndex].quiz[currentQuestion].correctAnswer && (
                <div className="mt-6 p-6 bg-yellow-100 border-4 border-yellow-500 rounded-2xl">
                  <p className="text-yellow-800 font-semibold text-lg">
                    Not quite! Try again. Think carefully about the answer! 💪
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}