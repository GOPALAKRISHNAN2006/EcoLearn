import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  Camera,
  Edit3,
  Save,
  X,
  Award,
  Calendar,
  Mail,
  Phone,
  MapPin,
  School,
  Trophy,
  Target,
  BookOpen,
  Zap,
  Leaf,
  Globe,
  Star,
  Badge as BadgeIcon,
  Upload,
  Sparkles,
  Flame,
  Heart
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import Navigation from '../../components/Navigation';
import "@/styles/animations.css";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    school: "",
    class: "",
    rollNumber: "",
    joinDate: "",
    bio: "Passionate about environmental science and sustainability. Love learning about ecosystems and climate solutions!",
    avatar: "/placeholder.svg"
  });

  const [editData, setEditData] = useState({ ...profileData });

  // Load user data from localStorage (comes from backend on login)
  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const formattedDate = user.joiningDate 
            ? new Date(user.joiningDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : 'N/A';
          
          setProfileData({
            name: user.name || 'Student',
            email: user.email || 'N/A',
            phone: user.phone || 'N/A',
            address: user.address || 'N/A',
            school: user.school || 'N/A',
            class: user.class || 'N/A',
            rollNumber: user.rollNumber || 'N/A',
            joinDate: formattedDate,
            bio: user.bio || "Passionate about environmental science and sustainability. Love learning about ecosystems and climate solutions!",
            avatar: user.avatar || "/placeholder.svg"
          });
          setEditData({
            name: user.name || 'Student',
            email: user.email || 'N/A',
            phone: user.phone || 'N/A',
            address: user.address || 'N/A',
            school: user.school || 'N/A',
            class: user.class || 'N/A',
            rollNumber: user.rollNumber || 'N/A',
            joinDate: formattedDate,
            bio: user.bio || "Passionate about environmental science and sustainability. Love learning about ecosystems and climate solutions!",
            avatar: user.avatar || "/placeholder.svg"
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const achievements = [
    {
      id: 1,
      title: "Eco Warrior",
      description: "Completed 50 environmental lessons",
      icon: Leaf,
      gradient: "#237a57",
      bgGradient: "#237a57",
      earned: false,
      progress: 0
    },
    {
      id: 2,
      title: "Knowledge Seeker",
      description: "Asked 200 questions to AI tutor",
      icon: BookOpen,
      gradient: "#f59e0b",
      bgGradient: "#f59e0b",
      earned: false,
      progress: 0
    },
    {
      id: 3,
      title: "Quiz Master",
      description: "Perfect score on 10 quizzes",
      icon: Trophy,
      gradient: "from-yellow-400 to-amber-600",
      bgGradient: "from-yellow-900/80 to-amber-900/80",
      earned: false,
      progress: 0
    },
    {
      id: 4,
      title: "Learning Streak",
      description: "30 consecutive days of learning",
      icon: Zap,
      gradient: "from-orange-400 to-red-600",
      bgGradient: "from-orange-900/80 to-red-900/80",
      earned: false,
      progress: 0
    },
    {
      id: 5,
      title: "Sustainability Champion",
      description: "Complete all climate change modules",
      icon: Star,
      gradient: "#3b9b8f",
      bgGradient: "#3b9b8f",
      earned: false,
      progress: 0
    }
  ];

  // Get user data from localStorage for stats
  const getUserStats = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        return {
          lessonsCompleted: user.lessonsCompleted || 0,
          quizAverage: user.quizAverage || 0,
          streak: user.streak || 0,
          questionsAsked: user.questionsAsked || 0
        };
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
    return { lessonsCompleted: 0, quizAverage: 0, streak: 0, questionsAsked: 0 };
  };

  const userStats = getUserStats();

  const stats = [
    { label: "Lessons Completed", value: userStats.lessonsCompleted.toString(), icon: BookOpen, gradient: "#3b9b8f" },
    { label: "Quiz Score Average", value: userStats.quizAverage ? `${userStats.quizAverage}%` : "0%", icon: Target, gradient: "#237a57" },
    { label: "Learning Streak", value: `${userStats.streak} days`, icon: Flame, gradient: "from-orange-400 to-red-600" },
    { label: "AI Questions Asked", value: userStats.questionsAsked.toString(), icon: Sparkles, gradient: "#f59e0b" }
  ];

  // Recent activity would be fetched from backend - empty for now
  const recentActivity = [];

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...profileData });
  };

  const handleSave = () => {
    setProfileData({ ...editData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({ ...profileData });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a3a2e]">
        <Navigation userType="student" />
        <main className="pt-20 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#f59e0b] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a3a2e]">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#3b9b8f]/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#f59e0b]/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-[#237a57]/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#f59e0b] rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: 0.5
            }}
          />
        ))}
      </div>

      <Navigation userType="student" />
      
      <main className="pt-20 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-[#237a57] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#237a57]/30 animate-float">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                    My Profile
                    <Sparkles className="w-8 h-8 text-[#f59e0b] animate-pulse" />
                  </h1>
                  <p className="text-gray-400">Manage your account and track your learning progress</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <Card className="glass border-0 overflow-hidden">
                <div className="h-24 bg-[#237a57]"></div>
                <CardContent className="p-6 -mt-12">
                  <div className="text-center mb-6">
                    <div className="relative inline-block">
                      <div className="w-24 h-24 bg-[#237a57] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[#237a57]/30 ring-4 ring-slate-800">
                        <User className="w-12 h-12 text-white" />
                      </div>
                      <Button 
                        size="icon" 
                        className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-[#f59e0b] hover:bg-[#237a57] shadow-lg"
                        title="Upload profile picture"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div>
                      <h2 className="text-2xl font-bold text-white">{profileData.name}</h2>
                      <Badge className="mt-2 bg-[#3b9b8f]/20 text-[#3b9b8f] border border-[#3b9b8f]/30">
                        {profileData.class}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { icon: Mail, label: profileData.email },
                      { icon: Phone, label: profileData.phone },
                      { icon: MapPin, label: profileData.address },
                      { icon: School, label: profileData.school },
                      { icon: BookOpen, label: `Class: ${profileData.class}` },
                      { icon: BadgeIcon, label: `Roll No: ${profileData.rollNumber}` },
                      { icon: Calendar, label: `Joined ${profileData.joinDate}` }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/30 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-gray-800/50 flex items-center justify-center">
                          <item.icon className="w-4 h-4 text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-300">{item.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-pink-400" />
                      <span className="text-sm font-medium text-white">About Me</span>
                    </div>
                    <p className="text-sm text-gray-400">{profileData.bio}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card className="glass border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="w-10 h-10 rounded-xl bg-[#f59e0b] flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    Learning Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.map((stat, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: stat.gradient }}>
                            <stat.icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-300">{stat.label}</span>
                        </div>
                        <span className="text-xl font-bold text-white">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Activity & Achievements */}
            <div className="lg:col-span-2 space-y-6">
              {/* Achievements */}
              <Card className="glass border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {achievements.map((achievement, index) => (
                      <div
                        key={achievement.id}
                        className={`group relative p-4 rounded-xl transition-all duration-500 hover:scale-[1.02] ${
                          achievement.earned
                            ? `bg-gradient-to-br ${achievement.bgGradient} border border-emerald-500/30`
                            : 'bg-gray-800/30 border border-gray-700/50 opacity-75'
                        }`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 ${
                            achievement.earned 
                              ? `bg-gradient-to-br ${achievement.gradient}` 
                              : 'bg-gray-700'
                          }`}>
                            <achievement.icon className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-semibold ${achievement.earned ? 'text-white' : 'text-gray-300'}`}>
                              {achievement.title}
                            </h3>
                            <p className={`text-sm ${achievement.earned ? 'text-gray-300' : 'text-gray-400'} mb-2`}>
                              {achievement.description}
                            </p>
                            {achievement.earned ? (
                              <Badge className="bg-emerald-500/30 text-emerald-300 border border-emerald-500/50">
                                ✓ Earned {achievement.date}
                              </Badge>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs text-gray-400">
                                  <span>Progress</span>
                                  <span>{achievement.progress}/10</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div
                                    className={`bg-gradient-to-r ${achievement.gradient} h-2 rounded-full transition-all duration-500`}
                                    style={{ width: `${(achievement.progress / 10) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        {achievement.earned && (
                          <div className="absolute top-3 right-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                              <Trophy className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="glass border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div 
                          key={activity.id} 
                          className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300 hover:scale-[1.01]"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activity.gradient} flex items-center justify-center shadow-lg`}>
                            <activity.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">
                              {activity.action} <span className="text-emerald-400">{activity.subject}</span>
                            </p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 font-medium">No Activity Yet</p>
                      <p className="text-gray-500 text-sm mt-1">Start learning to see your activity here!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Custom Styles */}
      <style>{`
        .glass {
          background: rgba(15, 23, 42, 0.8);
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

export default Profile;