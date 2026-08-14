import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import {
    ArrowLeft,
    FileText,
    Users,
    CheckCircle,
    Clock,
    XCircle,
    Download,
    Search,
    Filter,
    Eye,
    Star,
    Award,
    Sparkles,
    TrendingUp,
    AlertTriangle,
    MessageSquare,
    ChevronDown,
    ChevronUp,
    Bot,
    User,
    Calendar,
    BarChart3,
    X,
    Save,
    Edit3
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AssignmentSubmissions = () => {
    const navigate = useNavigate();
    const { assignmentId } = useParams();
    const [searchParams] = useSearchParams();
    const [assignment, setAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [expandedSubmission, setExpandedSubmission] = useState(null);
    
    // Grade editing state
    const [editingSubmission, setEditingSubmission] = useState(null);
    const [editGrade, setEditGrade] = useState('');
    const [editScore, setEditScore] = useState('');
    const [editFeedback, setEditFeedback] = useState('');
    const [saving, setSaving] = useState(false);

    const classFilter = {
        classId: searchParams.get('classId'),
        grade: searchParams.get('grade'),
        section: searchParams.get('section')
    };

    // Fetch assignment details
    const fetchAssignment = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/assignment/${assignmentId}`);
            const data = await response.json();
            if (data._id) {
                setAssignment(data);
            }
        } catch (error) {
            console.error('Error fetching assignment:', error);
        }
    };

    // Fetch actual submissions for this assignment
    const fetchSubmissions = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/submission/assignment/${assignmentId}`);
            const data = await response.json();
            
            if (Array.isArray(data)) {
                setSubmissions(data);
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignment();
        fetchSubmissions();
    }, [assignmentId]);

    // Open grade edit modal
    const openGradeModal = (submission) => {
        setEditingSubmission(submission);
        setEditGrade(submission.grade || '');
        setEditScore(submission.score?.toString() || '');
        setEditFeedback(submission.feedback || submission.aiGrading?.feedback || '');
    };

    // Close grade edit modal
    const closeGradeModal = () => {
        setEditingSubmission(null);
        setEditGrade('');
        setEditScore('');
        setEditFeedback('');
    };

    // Save grade
    const handleSaveGrade = async () => {
        if (!editingSubmission) return;
        
        setSaving(true);
        try {
            const teacherData = JSON.parse(localStorage.getItem('teacherUser') || '{}');
            
            const response = await fetch(`${API_BASE_URL}/submission/grade/${editingSubmission._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    grade: editGrade,
                    score: parseFloat(editScore) || 0,
                    feedback: editFeedback,
                    gradedBy: teacherData.name || 'Teacher'
                })
            });

            if (response.ok) {
                const data = await response.json();
                // Update local state
                setSubmissions(prev => prev.map(sub => 
                    sub._id === editingSubmission._id 
                        ? { ...sub, grade: editGrade, score: parseFloat(editScore) || 0, feedback: editFeedback, status: 'graded' }
                        : sub
                ));
                closeGradeModal();
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to save grade');
            }
        } catch (error) {
            console.error('Error saving grade:', error);
            alert('Error saving grade. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Calculate grade from score
    const calculateGradeFromScore = (score) => {
        const maxPoints = assignment?.maxPoints || 100;
        const percentage = (score / maxPoints) * 100;
        
        if (percentage >= 90) return 'A+';
        if (percentage >= 85) return 'A';
        if (percentage >= 80) return 'A-';
        if (percentage >= 75) return 'B+';
        if (percentage >= 70) return 'B';
        if (percentage >= 65) return 'B-';
        if (percentage >= 60) return 'C+';
        if (percentage >= 55) return 'C';
        if (percentage >= 50) return 'C-';
        if (percentage >= 45) return 'D+';
        if (percentage >= 40) return 'D';
        return 'F';
    };

    // Auto-calculate grade when score changes
    const handleScoreChange = (value) => {
        setEditScore(value);
        if (value && !isNaN(parseFloat(value))) {
            setEditGrade(calculateGradeFromScore(parseFloat(value)));
        }
    };

    // Filter submissions
    const filteredSubmissions = submissions.filter(submission => {
        const matchesSearch = 
            submission.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            submission.studentRollNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filterStatus === 'all') return matchesSearch;
        if (filterStatus === 'ai-graded') return matchesSearch && submission.status === 'ai-graded';
        if (filterStatus === 'graded') return matchesSearch && (submission.status === 'graded' || submission.status === 'ai-graded');
        if (filterStatus === 'pending') return matchesSearch && submission.status === 'submitted';
        if (filterStatus === 'late') return matchesSearch && submission.status === 'late';
        
        return matchesSearch;
    });

    // Stats calculation
    const totalSubmissions = submissions.length;
    const gradedCount = submissions.filter(s => s.status === 'graded' || s.status === 'ai-graded').length;
    const aiGradedCount = submissions.filter(s => s.status === 'ai-graded').length;
    const avgScore = gradedCount > 0 
        ? Math.round(submissions.filter(s => s.score).reduce((acc, s) => acc + s.score, 0) / gradedCount)
        : 0;

    const getGradeColor = (grade) => {
        if (!grade) return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };
        if (grade.startsWith('A')) return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' };
        if (grade.startsWith('B')) return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' };
        if (grade.startsWith('C')) return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' };
        if (grade.startsWith('D')) return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' };
        return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' };
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'ai-graded':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                        <Bot size={12} />
                        AI Graded
                    </span>
                );
            case 'graded':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                        <CheckCircle size={12} />
                        Graded
                    </span>
                );
            case 'late':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                        <AlertTriangle size={12} />
                        Late
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                        <Clock size={12} />
                        Pending Review
                    </span>
                );
        }
    };

    const typeLabels = {
        'traditional': 'Traditional Assignment',
        'project-based': 'Project-Based',
        'quiz-assessment': 'Quiz & Assessment',
        'multimedia': 'Multimedia Project'
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Navigation userType="teacher" />
            <div className="p-4 pt-20 max-w-7xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => {
                        if (classFilter.classId) {
                            navigate(`/teacher/student-management?classId=${classFilter.classId}&grade=${classFilter.grade}&section=${classFilter.section}`);
                        } else {
                            navigate('/teacher/classes');
                        }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors mb-4 text-gray-700 shadow-sm"
                >
                    <ArrowLeft size={18} />
                    Back to Class
                </button>

                {/* Assignment Header Card */}
                {assignment && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
                        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <FileText size={24} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">{assignment.title}</h1>
                                    <p className="text-violet-200 text-sm">{assignment.subject} • {typeLabels[assignment.type]}</p>
                                </div>
                                <div className="ml-auto">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        new Date(assignment.dueDate) >= new Date() 
                                            ? 'bg-green-400/20 text-green-100' 
                                            : 'bg-red-400/20 text-red-100'
                                    }`}>
                                        {new Date(assignment.dueDate) >= new Date() ? '● Active' : '● Past Due'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
                            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                                <div className="flex justify-center mb-2">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <p className="text-3xl font-black text-blue-700">{totalSubmissions}</p>
                                <p className="text-xs font-medium text-blue-600">Total Submissions</p>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                                <div className="flex justify-center mb-2">
                                    <Bot className="w-6 h-6 text-purple-600" />
                                </div>
                                <p className="text-3xl font-black text-purple-700">{aiGradedCount}</p>
                                <p className="text-xs font-medium text-purple-600">AI Graded</p>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                                <div className="flex justify-center mb-2">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <p className="text-3xl font-black text-green-700">{gradedCount}</p>
                                <p className="text-xs font-medium text-green-600">Total Graded</p>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                                <div className="flex justify-center mb-2">
                                    <BarChart3 className="w-6 h-6 text-amber-600" />
                                </div>
                                <p className="text-3xl font-black text-amber-700">{avgScore}%</p>
                                <p className="text-xs font-medium text-amber-600">Avg Score</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap gap-4 items-center">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by student name or roll number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm"
                        />
                    </div>
                    
                    {/* Status Filter Pills */}
                    <div className="flex gap-2 flex-wrap">
                        {[
                            { id: 'all', label: 'All', icon: Users },
                            { id: 'ai-graded', label: 'AI Graded', icon: Bot },
                            { id: 'graded', label: 'Graded', icon: CheckCircle },
                            { id: 'pending', label: 'Pending', icon: Clock },
                            { id: 'late', label: 'Late', icon: AlertTriangle }
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setFilterStatus(id)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    filterStatus === id
                                        ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <Icon size={14} />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Submissions List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="bg-white rounded-xl p-12 text-center">
                            <div className="animate-spin w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading submissions...</p>
                        </div>
                    ) : filteredSubmissions.length > 0 ? (
                        filteredSubmissions.map((submission, index) => {
                            const gradeColors = getGradeColor(submission.grade);
                            const isExpanded = expandedSubmission === submission._id;
                            
                            return (
                                <div 
                                    key={submission._id || index}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    {/* Main Row */}
                                    <div className="p-4 flex items-center gap-4 flex-wrap">
                                        {/* Student Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                                            {submission.studentName?.charAt(0).toUpperCase() || 'S'}
                                        </div>
                                        
                                        {/* Student Info */}
                                        <div className="flex-1 min-w-[150px]">
                                            <h3 className="font-semibold text-gray-800 truncate">{submission.studentName}</h3>
                                            <p className="text-sm text-gray-500">Roll: {submission.studentRollNumber}</p>
                                        </div>
                                        
                                        {/* Status Badge */}
                                        <div className="flex-shrink-0">
                                            {getStatusBadge(submission.status)}
                                        </div>
                                        
                                        {/* Submission Date */}
                                        <div className="text-center px-4 flex-shrink-0">
                                            <p className="text-xs text-gray-400">Submitted</p>
                                            <p className="text-sm font-medium text-gray-700">
                                                {submission.submittedAt 
                                                    ? new Date(submission.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                    : '-'
                                                }
                                            </p>
                                        </div>
                                        
                                        {/* Grade Display */}
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            {submission.grade ? (
                                                <div className={`px-4 py-2 rounded-xl ${gradeColors.bg} ${gradeColors.border} border-2`}>
                                                    <span className={`text-2xl font-black ${gradeColors.text}`}>
                                                        {submission.grade}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="px-4 py-2 rounded-xl bg-gray-100 border-2 border-gray-200">
                                                    <span className="text-2xl font-black text-gray-400">-</span>
                                                </div>
                                            )}
                                            
                                            <div className="text-center">
                                                <p className="text-2xl font-black text-gray-800">
                                                    {submission.score ?? '-'}
                                                </p>
                                                <p className="text-xs text-gray-400">/ {assignment?.maxPoints || 100}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Expand Button */}
                                        <button
                                            onClick={() => setExpandedSubmission(isExpanded ? null : submission._id)}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                                        >
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                    </div>
                                    
                                    {/* Expanded Content */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-100 bg-gray-50 p-6">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                {/* AI Grading Details */}
                                                {submission.aiGrading && (
                                                    <div className="bg-white rounded-xl p-4 border border-purple-200">
                                                        <h4 className="font-semibold text-purple-700 mb-4 flex items-center gap-2">
                                                            <Sparkles className="w-5 h-5" />
                                                            AI Grading Analysis
                                                        </h4>
                                                        
                                                        {submission.aiGrading.scores && (
                                                            <div className="space-y-3">
                                                                {/* Content Accuracy */}
                                                                <div>
                                                                    <div className="flex justify-between text-sm mb-1">
                                                                        <span className="text-gray-600">Content Accuracy</span>
                                                                        <span className="font-semibold text-blue-600">{submission.aiGrading.scores.contentAccuracy}%</span>
                                                                    </div>
                                                                    <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-blue-500 rounded-full" style={{width: `${submission.aiGrading.scores.contentAccuracy}%`}}></div>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Uniqueness */}
                                                                <div>
                                                                    <div className="flex justify-between text-sm mb-1">
                                                                        <span className="text-gray-600">Originality</span>
                                                                        <span className="font-semibold text-purple-600">{submission.aiGrading.scores.uniqueness}%</span>
                                                                    </div>
                                                                    <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-purple-500 rounded-full" style={{width: `${submission.aiGrading.scores.uniqueness}%`}}></div>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Relevance */}
                                                                <div>
                                                                    <div className="flex justify-between text-sm mb-1">
                                                                        <span className="text-gray-600">Topic Relevance</span>
                                                                        <span className="font-semibold text-green-600">{submission.aiGrading.scores.relevance}%</span>
                                                                    </div>
                                                                    <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-green-500 rounded-full" style={{width: `${submission.aiGrading.scores.relevance}%`}}></div>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Quality */}
                                                                <div>
                                                                    <div className="flex justify-between text-sm mb-1">
                                                                        <span className="text-gray-600">Writing Quality</span>
                                                                        <span className="font-semibold text-orange-600">{submission.aiGrading.scores.quality}%</span>
                                                                    </div>
                                                                    <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-orange-500 rounded-full" style={{width: `${submission.aiGrading.scores.quality}%`}}></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Flags */}
                                                        {submission.aiGrading.flags && submission.aiGrading.flags.length > 0 && (
                                                            <div className="mt-4 pt-4 border-t border-purple-100">
                                                                <p className="text-sm font-medium text-purple-700 mb-2">⚠ Flags</p>
                                                                <div className="space-y-1">
                                                                    {submission.aiGrading.flags.map((flag, i) => (
                                                                        <div key={i} className={`text-xs p-2 rounded ${
                                                                            flag.severity === 'high' ? 'bg-red-50 text-red-700' :
                                                                            flag.severity === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                                                                            'bg-blue-50 text-blue-700'
                                                                        }`}>
                                                                            {flag.message}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {/* Student's Submission Content */}
                                                <div className="bg-white rounded-xl p-4 border border-gray-200">
                                                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                        <FileText className="w-5 h-5" />
                                                        Student's Answer
                                                    </h4>
                                                    <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto">
                                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                                            {submission.content || 'No text content submitted'}
                                                        </p>
                                                    </div>
                                                    
                                                    {/* Submitted Files */}
                                                    {submission.files && submission.files.length > 0 && (
                                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                                            <h5 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                                                                <FileText className="w-4 h-4" />
                                                                Submitted Files ({submission.files.length})
                                                            </h5>
                                                            <div className="space-y-2">
                                                                {submission.files.map((file, idx) => {
                                                                    const isVideo = file.fileType?.startsWith('video/') || file.fileName?.match(/\.(mp4|mov|avi|mkv|webm)$/i);
                                                                    const isImage = file.fileType?.startsWith('image/');
                                                                    // Ensure the fileUrl starts with a forward slash
                                                                    const cleanFileUrl = file.fileUrl?.startsWith('/') ? file.fileUrl : `/${file.fileUrl}`;
                                                                    const fileUrl = `http://localhost:5000${cleanFileUrl}`;
                                                                    
                                                                    return (
                                                                        <div key={idx} className="bg-blue-50 rounded-lg p-3">
                                                                            <div className="flex items-center justify-between mb-2">
                                                                                <div className="flex items-center gap-2">
                                                                                    <FileText className="w-4 h-4 text-blue-600" />
                                                                                    <span className="text-sm font-medium text-gray-700">{file.fileName}</span>
                                                                                    <span className="text-xs text-gray-500">({(file.fileSize / (1024 * 1024)).toFixed(2)} MB)</span>
                                                                                </div>
                                                                                <div className="flex gap-2">
                                                                                    <a
                                                                                        href={fileUrl}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="px-3 py-1 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                                                                    >
                                                                                        View
                                                                                    </a>
                                                                                    <a
                                                                                        href={fileUrl}
                                                                                        download={file.fileName}
                                                                                        className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                                                                    >
                                                                                        Download
                                                                                    </a>
                                                                                </div>
                                                                            </div>
                                                                            {isVideo && (
                                                                                <video 
                                                                                    controls 
                                                                                    className="w-full rounded-lg mt-2"
                                                                                    style={{ maxHeight: '300px' }}
                                                                                >
                                                                                    <source src={fileUrl} type={file.fileType} />
                                                                                    Your browser does not support video playback.
                                                                                </video>
                                                                            )}
                                                                            {isImage && (
                                                                                <img 
                                                                                    src={fileUrl} 
                                                                                    alt={file.fileName}
                                                                                    className="w-full rounded-lg mt-2"
                                                                                    style={{ maxHeight: '300px', objectFit: 'contain' }}
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Feedback */}
                                                    {submission.feedback && (
                                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                                            <h5 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                                                                <MessageSquare className="w-4 h-4" />
                                                                AI Feedback
                                                            </h5>
                                                            <p className="text-sm text-gray-600 bg-green-50 rounded-lg p-3 whitespace-pre-wrap max-h-32 overflow-y-auto">
                                                                {submission.feedback}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Action Buttons */}
                                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
                                                <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2">
                                                    <Eye className="w-4 h-4" />
                                                    View Full Submission
                                                </button>
                                                <button 
                                                    onClick={() => openGradeModal(submission)}
                                                    className="px-4 py-2 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors shadow-sm flex items-center gap-2"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                    Edit Grade
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="bg-white rounded-xl p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Submissions Found</h3>
                            <p className="text-gray-500 text-sm">
                                {searchTerm || filterStatus !== 'all' 
                                    ? 'No submissions match your search criteria.'
                                    : 'No students have submitted this assignment yet.'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Grade Edit Modal */}
            {editingSubmission && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Edit3 className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Edit Grade</h2>
                                        <p className="text-violet-200 text-sm">{editingSubmission.studentName}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={closeGradeModal}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5">
                            {/* Current AI Grade Info (if exists) */}
                            {editingSubmission.status === 'ai-graded' && editingSubmission.aiGrading && (
                                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-purple-700 text-sm font-medium mb-2">
                                        <Bot className="w-4 h-4" />
                                        AI Suggested Grade
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-3xl font-black text-purple-600">{editingSubmission.grade}</span>
                                        <span className="text-2xl font-bold text-purple-500">{editingSubmission.score}/{assignment?.maxPoints || 100}</span>
                                    </div>
                                </div>
                            )}

                            {/* Score Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Score (out of {assignment?.maxPoints || 100})
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max={assignment?.maxPoints || 100}
                                    value={editScore}
                                    onChange={(e) => handleScoreChange(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-lg font-semibold"
                                    placeholder="Enter score..."
                                />
                            </div>

                            {/* Grade Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Grade
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'].map(grade => (
                                        <button
                                            key={grade}
                                            type="button"
                                            onClick={() => setEditGrade(grade)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                                editGrade === grade
                                                    ? grade.startsWith('A') ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' :
                                                      grade.startsWith('B') ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' :
                                                      grade.startsWith('C') ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-200' :
                                                      grade.startsWith('D') ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' :
                                                      'bg-red-500 text-white shadow-lg shadow-red-200'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {grade}
                                        </button>
                                    ))}
                                </div>
                            </div>


                            {/* Feedback Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Feedback for Student
                                </label>
                                <textarea
                                    value={editFeedback}
                                    onChange={(e) => setEditFeedback(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm resize-none"
                                    placeholder="Enter feedback for the student..."
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
                            <button
                                onClick={closeGradeModal}
                                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveGrade}
                                disabled={saving || !editScore || !editGrade}
                                className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Grade
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignmentSubmissions;