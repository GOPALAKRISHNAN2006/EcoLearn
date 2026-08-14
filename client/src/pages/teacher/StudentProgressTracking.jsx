import React, { useState, useEffect } from 'react';
import Navigation from '../../components/Navigation';
import { 
  Users, 
  Trophy, 
  Target, 
  BookOpen, 
  Clock,
  TrendingUp,
  TrendingDown,
  Star,
  Award,
  Search,
  Filter,
  Download,
  Eye,
  MessageSquare,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentProgressTracking = () => {
  const [selectedView, setSelectedView] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsTab, setDetailsTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classAssignments, setClassAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [totalAssignments, setTotalAssignments] = useState(0);

  // Get teacher ID from localStorage
  const getTeacherId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.teacherId || user.id;
  };

  // Fetch students from database
  const fetchStudents = async () => {
    try {
      const teacherId = getTeacherId();
      if (!teacherId) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/teacher/students/${teacherId}`);
      const data = await response.json();

      if (data.success && data.data) {
        // Transform students with initial values
        const transformedStudents = data.data.map(student => ({
          id: student._id,
          name: student.name,
          email: student.email || '',
          class: student.class || student.studentClass || 'Unassigned',
          rollNumber: student.rollNumber,
          level: 1, // Initial level
          totalPoints: 0, // Initial points
          weeklyPoints: 0,
          completedAssignments: 0,
          totalAssignments: 0,
          avgScore: 0,
          lastActive: student.updatedAt || student.createdAt || new Date().toISOString(),
          status: 'new',
          achievements: [],
          weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
          strengths: [],
          needsImprovement: [],
          recentActivities: []
        }));
        setStudents(transformedStudents);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch classes from database
  const fetchClasses = async () => {
    try {
      const teacherId = getTeacherId();
      if (!teacherId) return;

      const response = await fetch(`${API_BASE_URL}/class/teacher/${teacherId}`);
      const data = await response.json();

      if (data.success && data.data) {
        const classNames = data.data.map(cls => `${cls.grade}-${cls.section}`);
        setClasses(classNames);
        
        // Calculate assignments per class and total
        let total = 0;
        const assignmentsByClass = {};
        
        for (const cls of data.data) {
          try {
            const assignmentRes = await fetch(`${API_BASE_URL}/assignment/class/${cls._id}`);
            const assignmentData = await assignmentRes.json();
            const count = Array.isArray(assignmentData) ? assignmentData.length : 0;
            assignmentsByClass[`${cls.grade}-${cls.section}`] = count;
            total += count;
          } catch (err) {
            console.error('Error fetching assignments for class:', err);
            assignmentsByClass[`${cls.grade}-${cls.section}`] = 0;
          }
        }
        setClassAssignments(assignmentsByClass);
        setTotalAssignments(total);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  // Fetch detailed student data
  const fetchStudentDetails = async (studentId) => {
    setLoadingDetails(true);
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/student-details/${studentId}`);
      const data = await response.json();
      
      if (data.success) {
        setStudentDetails(data.data);
      } else {
        console.error('Failed to fetch student details:', data.message);
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  // Fetch details when student is selected
  useEffect(() => {
    if (selectedStudent) {
      fetchStudentDetails(selectedStudent.id);
      setDetailsTab('overview'); // Reset to overview tab
    } else {
      setStudentDetails(null);
    }
  }, [selectedStudent]);

  // Add class assignment counts to students
  const studentsWithAssignments = students.map(student => ({
    ...student,
    totalAssignments: classAssignments[student.class] || 0
  }));

  const filteredStudents = studentsWithAssignments.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  // Helper function to calculate percentage safely
  const getProgressPercentage = (completed, total) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'excellent': return { bg: '#dcfce7', text: '#166534' };
      case 'good': return { bg: '#dbeafe', text: '#1e40af' };
      case 'needs-attention': return { bg: '#fee2e2', text: '#991b1b' };
      case 'new': return { bg: '#fef3c7', text: '#92400e' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const getPerformanceIcon = (status) => {
    switch(status) {
      case 'excellent': return <TrendingUp size={16} style={{ color: '#059669' }} />;
      case 'good': return <Target size={16} style={{ color: '#2563eb' }} />;
      case 'needs-attention': return <AlertCircle size={16} style={{ color: '#dc2626' }} />;
      case 'new': return <Star size={16} style={{ color: '#d97706' }} />;
      default: return <Activity size={16} style={{ color: '#6b7280' }} />;
    }
  };

  const formatLastActive = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Active now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f0f9ff, #f0fdf4)' }}>
        <Navigation userType="teacher" />
        <div style={{ padding: '1rem', paddingTop: '5rem', maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '50vh' 
          }}>
            <div style={{ 
              width: '3rem', 
              height: '3rem', 
              border: '4px solid #e5e7eb', 
              borderTop: '4px solid #059669', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite' 
            }} />
            <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading students...</p>
          </div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f0f9ff, #f0fdf4)' }}>
      <Navigation userType="teacher" />
      <div style={{ padding: '1rem', paddingTop: '5rem', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                Student Progress Tracking
              </h1>
              <p style={{ color: '#6b7280' }}>
                Monitor student performance, engagement, and learning outcomes
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Download size={16} />
                Export Report
              </button>
              <button
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <BarChart3 size={16} />
                View Analytics
              </button>
            </div>
          </div>

          {/* View Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {[
              { id: 'overview', label: 'Overview', icon: <Users size={16} /> },
              { id: 'individual', label: 'Individual Progress', icon: <Target size={16} /> },
              { id: 'assignments', label: 'Assignment Tracking', icon: <BookOpen size={16} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id)}
                style={{
                  padding: '0.75rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: selectedView === tab.id ? '#059669' : '#f3f4f6',
                  color: selectedView === tab.id ? 'white' : '#374151',
                  fontWeight: selectedView === tab.id ? '500' : 'normal'
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search and Filter Bar */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: '0.75rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#6b7280' 
                }} 
              />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
            </div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              style={{
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                backgroundColor: 'white',
                minWidth: '200px'
              }}
            >
              <option value="all">All Classes</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Overview View */}
        {selectedView === 'overview' && (
          <>
            {/* Quick Stats */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '1.5rem', 
                borderRadius: '0.5rem',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>{filteredStudents.length}</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Students</div>
              </div>
              
              <div style={{ 
                backgroundColor: 'white', 
                padding: '1.5rem', 
                borderRadius: '0.5rem',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⭐</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
                  {filteredStudents.length > 0 ? Math.round(filteredStudents.reduce((sum, s) => sum + s.avgScore, 0) / filteredStudents.length) : 0}%
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Average Score</div>
              </div>
              
              <div style={{ 
                backgroundColor: 'white', 
                padding: '1.5rem', 
                borderRadius: '0.5rem',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ea580c' }}>
                  {filteredStudents.filter(s => s.status === 'excellent' || s.status === 'good').length}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>On Track</div>
              </div>

              <div style={{ 
                backgroundColor: 'white', 
                padding: '1.5rem', 
                borderRadius: '0.5rem',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7c3aed' }}>
                  {totalAssignments}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Assignments</div>
              </div>
            </div>

            {/* Student List */}
            {filteredStudents.length === 0 ? (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                padding: '3rem',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <Users size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.5rem' }}>
                  No students found
                </h3>
                <p style={{ color: '#6b7280' }}>
                  {searchTerm || selectedClass !== 'all' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'Students will appear here once they are added to your classes'}
                </p>
              </div>
            ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
              gap: '1.5rem'
            }}>
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }}
                  onClick={() => setSelectedStudent(student)}
                >
                  {/* Student Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '3rem',
                        height: '3rem',
                        backgroundColor: '#6366f1',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.25rem' }}>
                          {student.name}
                        </h3>
                        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                          {student.class}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getPerformanceIcon(student.status)}
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: getStatusColor(student.status).bg,
                        color: getStatusColor(student.status).text
                      }}>
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1).replace('-', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Progress Metrics */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <Trophy size={14} style={{ color: '#f59e0b' }} />
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Level & Points</span>
                      </div>
                      <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>
                        Level {student.level} • {student.totalPoints.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <BookOpen size={14} style={{ color: '#3b82f6' }} />
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Assignments</span>
                      </div>
                      <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>
                        {student.completedAssignments}/{student.totalAssignments} ({getProgressPercentage(student.completedAssignments, student.totalAssignments)}%)
                      </p>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <Target size={14} style={{ color: '#059669' }} />
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Average Score</span>
                      </div>
                      <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>
                        {student.avgScore}%
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Overall Progress</span>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {getProgressPercentage(student.completedAssignments, student.totalAssignments)}%
                      </span>
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '0.5rem', 
                      backgroundColor: '#e5e7eb', 
                      borderRadius: '0.25rem',
                      overflow: 'hidden'
                    }}>
                      <div
                        style={{
                          width: `${getProgressPercentage(student.completedAssignments, student.totalAssignments)}%`,
                          height: '100%',
                          backgroundColor: student.status === 'excellent' ? '#10b981' : student.status === 'good' ? '#3b82f6' : '#f59e0b',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                  </div>

                  {/* Achievements */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Award size={14} style={{ color: '#f59e0b' }} />
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Achievements</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {student.achievements.slice(0, 3).map((achievement, index) => (
                        <span
                          key={index}
                          style={{
                            padding: '0.125rem 0.375rem',
                            backgroundColor: '#fef3c7',
                            color: '#92400e',
                            borderRadius: '0.25rem',
                            fontSize: '0.625rem',
                            fontWeight: '500'
                          }}
                        >
                          {achievement}
                        </span>
                      ))}
                      {student.achievements.length > 3 && (
                        <span style={{ fontSize: '0.625rem', color: '#6b7280' }}>
                          +{student.achievements.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Last Active */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={14} style={{ color: '#6b7280' }} />
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        Last active: {formatLastActive(student.lastActive)}
                      </span>
                    </div>
                    <button
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <Eye size={12} />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
            )}
          </>
        )}

        {/* Individual Progress View */}
        {selectedView === 'individual' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {filteredStudents.map(student => (
              <div
                key={student.id}
                style={{
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
                onClick={() => setSelectedStudent(student)}
              >
                {/* Student Header */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '0.75rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.125rem',
                    flexShrink: 0
                  }}>
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontWeight: '600', color: '#1f2937', fontSize: '1rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {student.name}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>{student.class}</p>
                  </div>
                </div>

                {/* Level & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.375rem 0.75rem',
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    borderRadius: '9999px',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    <Star size={12} />
                    Level {student.level}
                  </div>
                  <div style={{
                    padding: '0.375rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    backgroundColor: getStatusColor(student.status).bg,
                    color: getStatusColor(student.status).text,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    {getPerformanceIcon(student.status)}
                    {student.status.replace('-', ' ')}
                  </div>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                    <Trophy size={20} style={{ color: '#f59e0b', margin: '0 auto 0.25rem' }} />
                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>{student.totalPoints}</p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Total Points</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                    <Target size={20} style={{ color: '#3b82f6', margin: '0 auto 0.25rem' }} />
                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>{student.avgScore}%</p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Avg Score</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                    <CheckCircle size={20} style={{ color: '#10b981', margin: '0 auto 0.25rem' }} />
                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                      {student.completedAssignments}/{student.totalAssignments}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Assignments</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                    <Clock size={20} style={{ color: '#8b5cf6', margin: '0 auto 0.25rem' }} />
                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>{formatLastActive(student.lastActive)}</p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Last Active</p>
                  </div>
                </div>

                {/* Weekly Points */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Weekly Activity</p>
                    <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#10b981', margin: 0 }}>+{student.weeklyPoints || 0} pts</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem', height: '40px', alignItems: 'flex-end' }}>
                    {student.weeklyActivity && student.weeklyActivity.length > 0 ? (
                      student.weeklyActivity.map((points, i) => {
                        const maxPoints = Math.max(...student.weeklyActivity, 1);
                        const heightPercent = Math.max((points / maxPoints) * 100, 10);
                        const opacityValue = 0.3 + (points / maxPoints) * 0.7;
                        return (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              height: `${heightPercent}%`,
                              backgroundColor: '#10b981',
                              borderRadius: '0.25rem',
                              opacity: opacityValue
                            }}
                            title={`Day ${i + 1}: ${points} points`}
                          />
                        );
                      })
                    ) : (
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0, textAlign: 'center', width: '100%' }}>No activity data</p>
                    )}
                  </div>
                </div>

                {/* View Details Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStudent(student);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                >
                  <Eye size={16} />
                  View Full Details
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Assignment Tracking View */}
        {selectedView === 'assignments' && (
          <div style={{
            backgroundColor: 'white',
            padding: '3rem',
            borderRadius: '0.75rem',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
              Assignment Tracking View
            </h3>
            <p style={{ color: '#6b7280' }}>
              This view is under development. Coming soon with detailed assignment tracking features.
            </p>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setSelectedStudent(null)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#059669',
                    fontWeight: 'bold',
                    fontSize: '1.5rem'
                  }}>
                    {selectedStudent.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                      {selectedStudent.name}
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '0.875rem' }}>
                      {selectedStudent.email} • {selectedStudent.class}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb'
            }}>
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'lessons', label: 'Lessons', icon: BookOpen },
                { id: 'quizzes', label: 'Quizzes', icon: CheckCircle },
                { id: 'games', label: 'Games', icon: Trophy }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDetailsTab(tab.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderRadius: '0.5rem',
                    backgroundColor: detailsTab === tab.id ? '#059669' : 'transparent',
                    color: detailsTab === tab.id ? 'white' : '#6b7280',
                    cursor: 'pointer',
                    fontWeight: detailsTab === tab.id ? '600' : '400',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: '1.5rem'
            }}>
              {loadingDetails ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    border: '4px solid #e5e7eb',
                    borderTop: '4px solid #059669',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                </div>
              ) : studentDetails ? (
                <>
                  {/* Overview Tab */}
                  {detailsTab === 'overview' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {/* Stats Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div style={{
                          padding: '1.5rem',
                          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                          borderRadius: '0.75rem',
                          color: 'white'
                        }}>
                          <Trophy size={32} style={{ marginBottom: '0.5rem' }} />
                          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
                            {studentDetails.stats.totalPoints}
                          </p>
                          <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0 }}>Total Points</p>
                        </div>
                        <div style={{
                          padding: '1.5rem',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          borderRadius: '0.75rem',
                          color: 'white'
                        }}>
                          <BookOpen size={32} style={{ marginBottom: '0.5rem' }} />
                          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
                            {studentDetails.stats.completedLessons}
                          </p>
                          <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0 }}>Lessons Completed</p>
                        </div>
                        <div style={{
                          padding: '1.5rem',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          borderRadius: '0.75rem',
                          color: 'white'
                        }}>
                          <CheckCircle size={32} style={{ marginBottom: '0.5rem' }} />
                          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
                            {studentDetails.stats.completedQuizzes}
                          </p>
                          <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0 }}>Quizzes Passed</p>
                        </div>
                        <div style={{
                          padding: '1.5rem',
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                          borderRadius: '0.75rem',
                          color: 'white'
                        }}>
                          <Clock size={32} style={{ marginBottom: '0.5rem' }} />
                          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
                            {studentDetails.stats.hoursLearned}h
                          </p>
                          <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0 }}>Hours Learned</p>
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <div style={{
                        backgroundColor: '#f9fafb',
                        padding: '1.5rem',
                        borderRadius: '0.75rem'
                      }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Activity size={20} color="#059669" />
                          Recent Activity
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {studentDetails.recentActivity && studentDetails.recentActivity.length > 0 ? (
                            studentDetails.recentActivity.map((activity, index) => (
                              <div key={index} style={{
                                padding: '1rem',
                                backgroundColor: 'white',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <div>
                                  <p style={{ fontWeight: '500', color: '#1f2937', margin: 0 }}>{activity.title}</p>
                                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                                    {activity.type} • {new Date(activity.date).toLocaleDateString()}
                                  </p>
                                </div>
                                {activity.points && (
                                  <div style={{
                                    padding: '0.25rem 0.75rem',
                                    backgroundColor: '#dcfce7',
                                    color: '#166534',
                                    borderRadius: '9999px',
                                    fontSize: '0.875rem',
                                    fontWeight: '600'
                                  }}>
                                    +{activity.points} pts
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <p style={{ textAlign: 'center', color: '#6b7280', padding: '1rem' }}>No recent activity</p>
                          )}
                        </div>
                      </div>

                      {/* Badges */}
                      {studentDetails.badges && studentDetails.badges.length > 0 && (
                        <div>
                          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Award size={20} color="#059669" />
                            Earned Badges
                          </h3>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
                            {studentDetails.badges.map((badge, index) => (
                              <div key={index} style={{
                                padding: '1rem',
                                backgroundColor: '#f9fafb',
                                borderRadius: '0.5rem',
                                textAlign: 'center',
                                border: '2px solid #e5e7eb'
                              }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{badge.icon || '🏆'}</div>
                                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                                  {badge.name}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Lessons Tab */}
                  {detailsTab === 'lessons' && (
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BookOpen size={20} color="#059669" />
                        Completed Lessons ({studentDetails.completedLessons?.length || 0})
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {studentDetails.completedLessons && studentDetails.completedLessons.length > 0 ? (
                          studentDetails.completedLessons.map((lesson, index) => (
                            <div key={index} style={{
                              padding: '1rem',
                              backgroundColor: '#f9fafb',
                              borderRadius: '0.5rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: '500', color: '#1f2937', margin: 0 }}>{lesson.title || 'Lesson'}</p>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                                  {lesson.topic} • Completed {new Date(lesson.completedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <CheckCircle size={20} color="#10b981" />
                            </div>
                          ))
                        ) : (
                          <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>No completed lessons yet</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Quizzes Tab */}
                  {detailsTab === 'quizzes' && (
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={20} color="#059669" />
                        Quiz Results ({studentDetails.completedQuizzes?.length || 0})
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {studentDetails.completedQuizzes && studentDetails.completedQuizzes.length > 0 ? (
                          studentDetails.completedQuizzes.map((quiz, index) => (
                            <div key={index} style={{
                              padding: '1rem',
                              backgroundColor: '#f9fafb',
                              borderRadius: '0.5rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: '500', color: '#1f2937', margin: 0 }}>{quiz.title || 'Quiz'}</p>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                                  {quiz.topic} • Completed {new Date(quiz.completedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: quiz.score >= 70 ? '#dcfce7' : '#fee2e2',
                                color: quiz.score >= 70 ? '#166534' : '#991b1b',
                                borderRadius: '0.5rem',
                                fontWeight: '600'
                              }}>
                                {quiz.score}%
                              </div>
                            </div>
                          ))
                        ) : (
                          <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>No completed quizzes yet</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Games Tab */}
                  {detailsTab === 'games' && (
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Trophy size={20} color="#059669" />
                        Games Played ({studentDetails.completedGames?.length || 0})
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                        {studentDetails.completedGames && studentDetails.completedGames.length > 0 ? (
                          studentDetails.completedGames.map((game, index) => (
                            <div key={index} style={{
                              padding: '1.5rem',
                              backgroundColor: '#f9fafb',
                              borderRadius: '0.75rem',
                              border: '2px solid #e5e7eb'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '0.5rem',
                                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '1.5rem'
                                }}>
                                  🎮
                                </div>
                                <div>
                                  <p style={{ fontWeight: '600', color: '#1f2937', margin: 0, fontSize: '0.875rem' }}>
                                    {game.name || 'Game'}
                                  </p>
                                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                                    {new Date(game.playedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Score</p>
                                  <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                                    {game.score || 0}
                                  </p>
                                </div>
                                <div style={{
                                  padding: '0.5rem 0.75rem',
                                  backgroundColor: '#dcfce7',
                                  color: '#166534',
                                  borderRadius: '0.5rem',
                                  fontSize: '0.875rem',
                                  fontWeight: '600'
                                }}>
                                  +{game.points || 0} pts
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem', gridColumn: '1 / -1' }}>
                            No games played yet
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                  Failed to load student details
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '0.75rem'
            }}>
              <button
                onClick={() => setSelectedStudent(null)}
                style={{
                  padding: '0.625rem 1.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                Close
              </button>
              <button
                style={{
                  padding: '0.625rem 1.5rem',
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              >
                <MessageSquare size={16} />
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProgressTracking;