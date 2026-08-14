import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/admin/AdminNavbar';
import adminService from '../../services/adminService';
import { 
  Users, 
  GraduationCap, 
  UserCog, 
  Video, 
  TrendingUp,
  BookOpen,
  Activity,
  Clock
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalTeachers: 0,
    totalStudents: 0
  });
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
      navigate('/admin/login');
      return;
    }
    setAdmin(JSON.parse(adminData));
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [adminsRes, teachersRes, studentsRes] = await Promise.all([
        adminService.getAll(),
        adminService.getAllTeachers(),
        adminService.getAllStudents()
      ]);

      setStats({
        totalAdmins: adminsRes.data?.length || 0,
        totalTeachers: teachersRes.data?.length || 0,
        totalStudents: studentsRes.data?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: 'Total Admins', 
      value: stats.totalAdmins, 
      icon: Users, 
      color: '#3b82f6',
      bgColor: '#dbeafe',
      path: '/admin/users'
    },
    { 
      title: 'Total Teachers', 
      value: stats.totalTeachers, 
      icon: UserCog, 
      color: '#22c55e',
      bgColor: '#dcfce7',
      path: '/admin/teachers'
    },
    { 
      title: 'Total Students', 
      value: stats.totalStudents, 
      icon: GraduationCap, 
      color: '#8b5cf6',
      bgColor: '#ede9fe',
      path: '/admin/students'
    },
    { 
      title: 'AI Videos', 
      value: '12', 
      icon: Video, 
      color: '#f59e0b',
      bgColor: '#fef3c7',
      path: '/admin/ai-videos'
    },
  ];

  const quickActions = [
    { label: 'Add Teacher', icon: UserCog, color: '#22c55e', path: '/admin/teachers' },
    { label: 'View Students', icon: GraduationCap, color: '#8b5cf6', path: '/admin/students' },
    { label: 'Manage Users', icon: Users, color: '#3b82f6', path: '/admin/users' },
    { label: 'AI Videos', icon: Video, color: '#f59e0b', path: '/admin/ai-videos' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <AdminNavbar />
      
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem', paddingTop: '5rem' }}>
        {/* Welcome Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: 'clamp(1.25rem, 5vw, 1.875rem)', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
            Welcome back, {admin?.name || 'Admin'}! 👋
          </h1>
          <p style={{ color: '#6b7280', fontSize: 'clamp(0.875rem, 3vw, 1rem)' }}>Here's an overview of your EcoLearn platform.</p>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))', 
          gap: 'clamp(0.75rem, 2vw, 1.5rem)',
          marginBottom: 'clamp(1rem, 3vw, 2rem)'
        }}>
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                onClick={() => navigate(card.path)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      {card.title}
                    </p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                      {loading ? '...' : card.value}
                    </p>
                  </div>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: card.bgColor,
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={24} color={card.color} />
                  </div>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.25rem', 
                  marginTop: '1rem',
                  color: '#22c55e'
                }}>
                  <TrendingUp size={16} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>View Details →</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions & Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: 'clamp(1rem, 2vw, 1.5rem)' }}>
          {/* Quick Actions */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
              Quick Actions
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => navigate(action.path)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '1.5rem',
                      backgroundColor: '#f9fafb',
                      border: '2px dashed #e5e7eb',
                      borderRadius: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.borderColor = action.color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <Icon size={28} color={action.color} />
                    <span style={{ color: '#4b5563', fontSize: '0.875rem', fontWeight: '500' }}>
                      {action.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Platform Info */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
              Platform Overview
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                backgroundColor: '#f0f9ff',
                borderRadius: '0.5rem'
              }}>
                <Clock size={24} color="#3b82f6" />
                <div>
                  <p style={{ fontWeight: '500', color: '#1f2937' }}>Last Login</p>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                backgroundColor: '#fefce8',
                borderRadius: '0.5rem'
              }}>
                <BookOpen size={24} color="#f59e0b" />
                <div>
                  <p style={{ fontWeight: '500', color: '#1f2937' }}>School</p>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{admin?.schoolName || 'EcoLearn Academy'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
