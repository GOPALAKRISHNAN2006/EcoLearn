import React, { useState, useEffect } from 'react';
import Navigation from '../../components/Navigation';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  Clock,
  Star,
  Award,
  BookOpen,
  Smartphone,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  AlertTriangle,
  CheckCircle,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TeacherAnalytics = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalStudents: 0,
      activeStudents: 0,
      avgEngagement: 0,
      completionRate: 0,
      totalAssignments: 0,
      trends: {
        students: 0,
        engagement: 0,
        completion: 0
      }
    },
    classComparison: [],
    topPerformers: [],
    needsAttention: []
  });

  // Get teacher ID from localStorage
  const getTeacherId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.teacherId || user.id;
  };

  // Fetch all analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const teacherId = getTeacherId();
      if (!teacherId) {
        setLoading(false);
        return;
      }

      // Fetch students
      const studentsRes = await fetch(`${API_BASE_URL}/teacher/students/${teacherId}`);
      const studentsData = await studentsRes.json();
      const students = studentsData.success ? studentsData.data : [];

      // Fetch classes
      const classesRes = await fetch(`${API_BASE_URL}/class/teacher/${teacherId}`);
      const classesData = await classesRes.json();
      const classesArray = classesData.success ? classesData.data : [];
      setClasses(classesArray.map(cls => `${cls.grade}-${cls.section}`));

      // Fetch assignments and submissions per class
      const classComparison = [];
      let totalAssignments = 0;
      let totalSubmissions = 0;

      for (const cls of classesArray) {
        try {
          const assignmentRes = await fetch(`${API_BASE_URL}/assignment/class/${cls._id}`);
          const assignments = await assignmentRes.json();
          const assignmentCount = Array.isArray(assignments) ? assignments.length : 0;
          totalAssignments += assignmentCount;

          // Count students in this class
          const classStudents = students.filter(s => 
            s.class === `${cls.grade}-${cls.section}` || 
            s.studentClass === `${cls.grade}-${cls.section}`
          );

          // Get submissions for this class
          let classSubmissions = 0;
          let totalScore = 0;
          let gradedCount = 0;

          if (Array.isArray(assignments)) {
            for (const assignment of assignments) {
              try {
                const submissionRes = await fetch(`${API_BASE_URL}/submission/assignment/${assignment._id}`);
                const submissions = await submissionRes.json();
                if (Array.isArray(submissions)) {
                  classSubmissions += submissions.length;
                  totalSubmissions += submissions.length;
                  submissions.forEach(sub => {
                    if (sub.grade !== undefined && sub.grade !== null) {
                      totalScore += sub.grade;
                      gradedCount++;
                    }
                  });
                }
              } catch (err) {
                console.error('Error fetching submissions:', err);
              }
            }
          }

          const avgScore = gradedCount > 0 ? Math.round(totalScore / gradedCount) : 0;
          const expectedSubmissions = classStudents.length * assignmentCount;
          const completion = expectedSubmissions > 0 ? Math.round((classSubmissions / expectedSubmissions) * 100) : 0;

          classComparison.push({
            class: `${cls.grade}-${cls.section}`,
            classId: cls._id,
            students: classStudents.length,
            avgScore: avgScore,
            engagement: classStudents.length > 0 ? Math.min(100, Math.round((classSubmissions / Math.max(1, classStudents.length)) * 20)) : 0,
            completion: completion,
            assignments: assignmentCount
          });
        } catch (err) {
          console.error('Error processing class:', err);
        }
      }

      // Calculate overview stats
      const totalStudents = students.length;
      const expectedTotal = totalStudents * totalAssignments;
      const completionRate = expectedTotal > 0 ? Math.round((totalSubmissions / expectedTotal) * 100) : 0;

      // Calculate top performers (students with submissions - for now just show students)
      const topPerformers = students.slice(0, 5).map(student => ({
        name: student.name,
        class: student.class || student.studentClass || 'Unassigned',
        score: 0, // Will be updated when we have grades
        improvement: 0
      }));

      // Students needing attention (those without recent activity)
      const needsAttention = students
        .filter(s => !s.lastActive || new Date(s.lastActive) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .slice(0, 4)
        .map(student => ({
          name: student.name,
          class: student.class || student.studentClass || 'Unassigned',
          issue: 'No recent activity',
          severity: 'medium'
        }));

      setAnalyticsData({
        overview: {
          totalStudents,
          activeStudents: students.length, // All students for now
          avgEngagement: classComparison.length > 0 
            ? Math.round(classComparison.reduce((sum, c) => sum + c.engagement, 0) / classComparison.length)
            : 0,
          completionRate,
          totalAssignments,
          trends: {
            students: 0,
            engagement: 0,
            completion: 0
          }
        },
        classComparison,
        topPerformers,
        needsAttention
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const timeframes = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: 'This Quarter' },
    { id: 'year', label: 'This Year' }
  ];

  const metrics = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
    { id: 'engagement', label: 'Engagement', icon: <Activity size={16} /> },
    { id: 'performance', label: 'Performance', icon: <Target size={16} /> },
    { id: 'classes', label: 'Class Comparison', icon: <Users size={16} /> }
  ];

  const getTrendIcon = (trend) => {
    if (trend > 0) return <ArrowUp size={16} style={{ color: '#10b981' }} />;
    if (trend < 0) return <ArrowDown size={16} style={{ color: '#ef4444' }} />;
    return <Minus size={16} style={{ color: '#6b7280' }} />;
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return '#10b981';
    if (trend < 0) return '#ef4444';
    return '#6b7280';
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return { bg: '#fee2e2', text: '#991b1b' };
      case 'medium': return { bg: '#fef3c7', text: '#92400e' };
      case 'low': return { bg: '#dcfce7', text: '#166534' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const renderChart = (data, color = '#059669') => (
    <div style={{ display: 'flex', alignItems: 'end', gap: '0.25rem', height: '60px' }}>
      {data.map((value, index) => (
        <div
          key={index}
          style={{
            width: '20px',
            height: `${(value / Math.max(...data)) * 100}%`,
            backgroundColor: color,
            borderRadius: '2px',
            opacity: 0.8
          }}
        />
      ))}
    </div>
  );

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
            <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading analytics...</p>
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
                Analytics Dashboard
              </h1>
              <p style={{ color: '#6b7280' }}>
                Comprehensive insights into student engagement, performance, and learning outcomes
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={fetchAnalyticsData}
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
                <RefreshCw size={16} />
                Refresh
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
                <Download size={16} />
                Export Report
              </button>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {timeframes.map(timeframe => (
                <button
                  key={timeframe.id}
                  onClick={() => setSelectedTimeframe(timeframe.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    backgroundColor: selectedTimeframe === timeframe.id ? '#059669' : '#f3f4f6',
                    color: selectedTimeframe === timeframe.id ? 'white' : '#374151',
                    fontSize: '0.875rem'
                  }}
                >
                  {timeframe.label}
                </button>
              ))}
            </div>
            
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                backgroundColor: 'white',
                fontSize: '0.875rem'
              }}
            >
              <option value="all">All Classes</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {metrics.map(metric => (
                <button
                  key={metric.id}
                  onClick={() => setSelectedMetric(metric.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    backgroundColor: selectedMetric === metric.id ? '#3b82f6' : '#f3f4f6',
                    color: selectedMetric === metric.id ? 'white' : '#374151',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {metric.icon}
                  {metric.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Overview Metrics */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Total Students</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                  {analyticsData.overview.totalStudents}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {getTrendIcon(analyticsData.overview.trends.students)}
                <span style={{ 
                  fontSize: '0.875rem', 
                  color: getTrendColor(analyticsData.overview.trends.students),
                  fontWeight: '500'
                }}>
                  {Math.abs(analyticsData.overview.trends.students)}%
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} style={{ color: '#059669' }} />
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {analyticsData.overview.activeStudents} active this week
              </span>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Avg Engagement</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                  {analyticsData.overview.avgEngagement}%
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {getTrendIcon(analyticsData.overview.trends.engagement)}
                <span style={{ 
                  fontSize: '0.875rem', 
                  color: getTrendColor(analyticsData.overview.trends.engagement),
                  fontWeight: '500'
                }}>
                  {Math.abs(analyticsData.overview.trends.engagement)}%
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={16} style={{ color: '#3b82f6' }} />
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Based on activity patterns
              </span>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Completion Rate</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                  {analyticsData.overview.completionRate}%
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {getTrendIcon(analyticsData.overview.trends.completion)}
                <span style={{ 
                  fontSize: '0.875rem', 
                  color: getTrendColor(analyticsData.overview.trends.completion),
                  fontWeight: '500'
                }}>
                  {Math.abs(analyticsData.overview.trends.completion)}%
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={16} style={{ color: '#7c3aed' }} />
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Assignments & AR experiences
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Based on Selected Metric */}
        {selectedMetric === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            {/* Class Stats Summary */}
            <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937' }}>
                  Class Performance Overview
                </h3>
              </div>
              
              {analyticsData.classComparison.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  <BookOpen size={48} style={{ margin: '0 auto 1rem', color: '#d1d5db' }} />
                  <p>No classes found. Create a class to see analytics.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {analyticsData.classComparison.map((cls, index) => (
                    <div key={index} style={{ 
                      padding: '1rem', 
                      backgroundColor: '#f9fafb', 
                      borderRadius: '0.5rem',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>{cls.class}</h4>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{cls.students} students</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        <div>
                          <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Assignments</p>
                          <p style={{ fontSize: '1rem', fontWeight: '600', color: '#3b82f6' }}>{cls.assignments}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Avg Score</p>
                          <p style={{ fontSize: '1rem', fontWeight: '600', color: '#059669' }}>{cls.avgScore}%</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Completion</p>
                          <p style={{ fontSize: '1rem', fontWeight: '600', color: '#7c3aed' }}>{cls.completion}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Performers & Alerts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Top Students */}
              <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Star size={20} style={{ color: '#f59e0b' }} />
                  Students
                </h3>
                <div style={{ space: '0.75rem' }}>
                  {analyticsData.topPerformers.length === 0 ? (
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'center', padding: '1rem' }}>
                      No students found
                    </p>
                  ) : (
                    analyticsData.topPerformers.slice(0, 5).map((student, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                            {student.name}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {student.class}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Students Needing Attention */}
              <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={20} style={{ color: '#f59e0b' }} />
                  Needs Attention
                </h3>
                <div style={{ space: '0.75rem' }}>
                  {analyticsData.needsAttention.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                      <CheckCircle size={24} style={{ color: '#10b981', margin: '0 auto 0.5rem' }} />
                      <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>All students are on track!</p>
                    </div>
                  ) : (
                    analyticsData.needsAttention.map((student, index) => (
                      <div key={index} style={{ marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                            {student.name}
                          </p>
                          <span style={{
                            padding: '0.125rem 0.375rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.625rem',
                            fontWeight: '500',
                            backgroundColor: getSeverityColor(student.severity).bg,
                            color: getSeverityColor(student.severity).text
                          }}>
                            {student.severity}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          {student.issue}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedMetric === 'classes' && (
          <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem' }}>
              Class Performance Comparison
            </h3>
            
            {analyticsData.classComparison.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                <Users size={48} style={{ margin: '0 auto 1rem', color: '#d1d5db' }} />
                <p>No classes found. Create a class to see comparison.</p>
              </div>
            ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>
                      Class Name
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>
                      Students
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>
                      Assignments
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>
                      Avg Score
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>
                      Completion
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.classComparison.map((classData, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '1rem 0.75rem' }}>
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                            {classData.class}
                          </p>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                          {classData.students}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#3b82f6' }}>
                          {classData.assignments}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                        <span style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: '500',
                          color: classData.avgScore >= 85 ? '#10b981' : classData.avgScore >= 75 ? '#f59e0b' : '#ef4444'
                        }}>
                          {classData.avgScore}%
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                          <div style={{ 
                            width: '60px', 
                            height: '6px', 
                            backgroundColor: '#e5e7eb', 
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div
                              style={{
                                width: `${classData.completion}%`,
                                height: '100%',
                                backgroundColor: '#10b981'
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {classData.completion}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
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
                            gap: '0.25rem',
                            margin: '0 auto'
                          }}
                        >
                          <Eye size={12} />
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        )}

        {(selectedMetric === 'engagement' || selectedMetric === 'performance') && (
          <div style={{
            backgroundColor: 'white',
            padding: '3rem',
            borderRadius: '0.75rem',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
              {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Analytics
            </h3>
            <p style={{ color: '#6b7280' }}>
              Detailed {selectedMetric} charts and insights coming soon with advanced visualization features.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAnalytics;