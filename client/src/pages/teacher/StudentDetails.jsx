import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    MapPin,
    School,
    Calendar,
    Clock,
    Trophy,
    Zap,
    Target,
    TrendingUp,
    Award,
    BookOpen,
    Gamepad2,
    Video,
    Activity,
    Star,
    Loader
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentDetails = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [studentData, setStudentData] = useState(null);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchStudentDetails();
    }, [studentId]);

    const fetchStudentDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/teacher/student-details/${studentId}`);
            const data = await response.json();

            if (data.success) {
                setStudentData(data.data);
            } else {
                setError(data.message || 'Failed to load student details');
            }
        } catch (error) {
            console.error('Error fetching student details:', error);
            setError('Error loading student details');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
                <Navigation userRole="teacher" />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-96">
                        <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !studentData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
                <Navigation userRole="teacher" />
                <div className="container mx-auto px-4 py-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-600 font-medium">{error}</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const { student, stats, recentActivity, badges, completedLessons, completedQuizzes, gamesPlayed } = studentData;

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
            <Navigation userRole="teacher" />
            
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-emerald-600 hover:text-emerald-700 font-medium mb-4"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Students
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">Student Details</h1>
                </div>

                {/* Student Profile Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{student.name}</h2>
                                <p className="text-gray-600">Roll No: {student.rollNumber}</p>
                                <p className="text-gray-600">{student.class}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                            <div className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg text-white font-bold">
                                Level {stats.level}
                            </div>
                            <div className="text-sm text-gray-600">
                                {stats.currentXP} / {stats.nextLevelXP} XP
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pt-6 border-t">
                        <div className="flex items-center space-x-3">
                            <Mail className="w-5 h-5 text-emerald-600" />
                            <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="text-sm font-medium text-gray-800">{student.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Phone className="w-5 h-5 text-emerald-600" />
                            <div>
                                <p className="text-xs text-gray-500">Phone</p>
                                <p className="text-sm font-medium text-gray-800">{student.phone}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <School className="w-5 h-5 text-emerald-600" />
                            <div>
                                <p className="text-xs text-gray-500">School</p>
                                <p className="text-sm font-medium text-gray-800">{student.school || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <MapPin className="w-5 h-5 text-emerald-600" />
                            <div>
                                <p className="text-xs text-gray-500">Address</p>
                                <p className="text-sm font-medium text-gray-800">{student.address || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Calendar className="w-5 h-5 text-emerald-600" />
                            <div>
                                <p className="text-xs text-gray-500">Joining Date</p>
                                <p className="text-sm font-medium text-gray-800">{formatDate(student.joiningDate)}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Clock className="w-5 h-5 text-emerald-600" />
                            <div>
                                <p className="text-xs text-gray-500">Last Login</p>
                                <p className="text-sm font-medium text-gray-800">{formatDateTime(student.lastLogin)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                        <Trophy className="w-8 h-8 mb-3 opacity-80" />
                        <p className="text-2xl font-bold">{stats.totalPoints}</p>
                        <p className="text-sm opacity-90">Total Points</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                        <Gamepad2 className="w-8 h-8 mb-3 opacity-80" />
                        <p className="text-2xl font-bold">{stats.gamePoints}</p>
                        <p className="text-sm opacity-90">Game Points</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
                        <BookOpen className="w-8 h-8 mb-3 opacity-80" />
                        <p className="text-2xl font-bold">{stats.lessonPoints}</p>
                        <p className="text-sm opacity-90">Lesson Points</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
                        <Clock className="w-8 h-8 mb-3 opacity-80" />
                        <p className="text-2xl font-bold">{stats.hoursLearned.toFixed(1)}</p>
                        <p className="text-sm opacity-90">Hours Learned</p>
                    </div>
                    <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
                        <Zap className="w-8 h-8 mb-3 opacity-80" />
                        <p className="text-2xl font-bold">{stats.streak}</p>
                        <p className="text-sm opacity-90">Day Streak</p>
                    </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 shadow">
                        <div className="flex items-center justify-between">
                            <Video className="w-6 h-6 text-emerald-600" />
                            <span className="text-2xl font-bold text-gray-800">{stats.completedLessons}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Completed Lessons</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow">
                        <div className="flex items-center justify-between">
                            <Target className="w-6 h-6 text-blue-600" />
                            <span className="text-2xl font-bold text-gray-800">{stats.completedQuizzes}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Completed Quizzes</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow">
                        <div className="flex items-center justify-between">
                            <Gamepad2 className="w-6 h-6 text-purple-600" />
                            <span className="text-2xl font-bold text-gray-800">{stats.gamesPlayed}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Games Played</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow">
                        <div className="flex items-center justify-between">
                            <Award className="w-6 h-6 text-amber-600" />
                            <span className="text-2xl font-bold text-gray-800">{stats.badges}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Badges Earned</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="border-b border-gray-200">
                        <div className="flex overflow-x-auto">
                            {['overview', 'lessons', 'quizzes', 'games', 'badges'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-4 font-medium capitalize whitespace-nowrap ${
                                        activeTab === tab
                                            ? 'border-b-2 border-emerald-600 text-emerald-600'
                                            : 'text-gray-600 hover:text-emerald-600'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                    <Activity className="w-6 h-6 mr-2 text-emerald-600" />
                                    Recent Activity
                                </h3>
                                {recentActivity.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentActivity.map((activity, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                                <div className="flex items-center space-x-4">
                                                    {activity.type === 'quiz' && <Target className="w-5 h-5 text-blue-600" />}
                                                    {activity.type === 'video' && <Video className="w-5 h-5 text-emerald-600" />}
                                                    {activity.type === 'game' && <Gamepad2 className="w-5 h-5 text-purple-600" />}
                                                    <div>
                                                        <p className="font-medium text-gray-800">{activity.title}</p>
                                                        <p className="text-sm text-gray-600">{formatDateTime(activity.date)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    {activity.score !== undefined && (
                                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                            Score: {activity.score}%
                                                        </span>
                                                    )}
                                                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                                                        +{activity.points} pts
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">No recent activity</p>
                                )}
                            </div>
                        )}

                        {/* Lessons Tab */}
                        {activeTab === 'lessons' && (
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Completed Lessons</h3>
                                {completedLessons.length > 0 ? (
                                    <div className="space-y-3">
                                        {completedLessons.map((lesson, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                                                <div className="flex items-center space-x-4">
                                                    <Video className="w-5 h-5 text-emerald-600" />
                                                    <div>
                                                        <p className="font-medium text-gray-800">{lesson.title}</p>
                                                        <p className="text-sm text-gray-600">{lesson.subject} - {lesson.grade}</p>
                                                        <p className="text-xs text-gray-500">{formatDateTime(lesson.watchedAt)}</p>
                                                    </div>
                                                </div>
                                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                                                    +{lesson.pointsEarned} pts
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">No completed lessons yet</p>
                                )}
                            </div>
                        )}

                        {/* Quizzes Tab */}
                        {activeTab === 'quizzes' && (
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Completed Quizzes</h3>
                                {completedQuizzes.length > 0 ? (
                                    <div className="space-y-3">
                                        {completedQuizzes.map((quiz, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                                <div className="flex items-center space-x-4">
                                                    <Target className="w-5 h-5 text-blue-600" />
                                                    <div>
                                                        <p className="font-medium text-gray-800">{quiz.title}</p>
                                                        <p className="text-xs text-gray-500">{formatDateTime(quiz.completedAt)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                        Score: {quiz.score}%
                                                    </span>
                                                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                                                        +{quiz.pointsAwarded} pts
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">No completed quizzes yet</p>
                                )}
                            </div>
                        )}

                        {/* Games Tab */}
                        {activeTab === 'games' && (
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Games Played</h3>
                                {gamesPlayed.length > 0 ? (
                                    <div className="space-y-3">
                                        {gamesPlayed.map((game, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                                                <div className="flex items-center space-x-4">
                                                    <Gamepad2 className="w-5 h-5 text-purple-600" />
                                                    <div>
                                                        <p className="font-medium text-gray-800">{game.gameName}</p>
                                                        <p className="text-xs text-gray-500">{formatDateTime(game.playedAt)}</p>
                                                    </div>
                                                </div>
                                                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                                    +{game.pointsEarned} pts
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">No games played yet</p>
                                )}
                            </div>
                        )}

                        {/* Badges Tab */}
                        {activeTab === 'badges' && (
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Badges Earned</h3>
                                {badges.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {badges.map((badge, index) => (
                                            <div key={index} className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-4 text-center hover:shadow-lg transition">
                                                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                                                    <Award className="w-8 h-8 text-white" />
                                                </div>
                                                <p className="font-bold text-gray-800 mb-1">{badge.name}</p>
                                                <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
                                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                                    badge.rarity === 'legendary' ? 'bg-purple-100 text-purple-700' :
                                                    badge.rarity === 'epic' ? 'bg-pink-100 text-pink-700' :
                                                    badge.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {badge.rarity}
                                                </span>
                                                <p className="text-xs text-gray-500 mt-2">{formatDate(badge.earnedAt)}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">No badges earned yet</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetails;
