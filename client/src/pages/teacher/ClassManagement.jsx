import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import {
  Users,
  Plus,
  Search,
  Filter,
  BookOpen,
  Trash2,
  Eye
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ClassManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Get teacher info from localStorage
  const getTeacherInfo = () => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      teacherId: storedUser.teacherId || storedUser.id || storedUser._id,
      teacherName: storedUser.Name || storedUser.name || 'Teacher'
    };
  };

  // Fetch classes from database
  const fetchClasses = async () => {
    try {
      const { teacherId } = getTeacherInfo();
      if (!teacherId) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/class/teacher/${teacherId}`);
      const data = await response.json();

      if (data.success) {
        setClasses(data.data.map(cls => ({
          id: cls._id,
          grade: cls.grade,
          section: cls.section,
          subject: cls.subject,
          teacherName: cls.teacherName,
          totalStudents: cls.totalStudents || 0,
          status: 'active'
        })));
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchClasses();
  }, []);

  const [newClass, setNewClass] = useState({
    className: '',
    subject: ''
  });

  // Parse className format "5th-A" into grade and section
  const parseClassName = (className) => {
    const parts = className.split('-');
    if (parts.length === 2) {
      return { grade: parts[0].trim(), section: parts[1].trim() };
    }
    return { grade: className, section: '' };
  };

  const handleCreateClass = async () => {
    if (!newClass.className || !newClass.subject) {
      alert('Please fill in all fields');
      return;
    }

    const { grade, section } = parseClassName(newClass.className);
    
    if (!grade || !section) {
      alert('Please enter class in format: 5th-A');
      return;
    }

    try {
      const { teacherId, teacherName } = getTeacherInfo();
      
      if (!teacherId) {
        alert('Teacher ID not found. Please log in again.');
        return;
      }
      
      console.log('Creating class with:', { grade, section, subject: newClass.subject, teacherId, teacherName });
      
      const response = await fetch(`${API_BASE_URL}/class/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade,
          section,
          subject: newClass.subject,
          teacherId,
          teacherName
        })
      });

      const data = await response.json();
      console.log('Response:', data);

      if (data.success) {
        // Add the new class to state
        setClasses([...classes, {
          id: data.data._id,
          grade: data.data.grade,
          section: data.data.section,
          subject: data.data.subject,
          teacherName: data.data.teacherName,
          totalStudents: data.data.totalStudents || 0,
          status: 'active'
        }]);
        setShowCreateClass(false);
        setNewClass({ className: '', subject: '' });
      } else {
        alert(data.message || 'Failed to create class');
      }
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Failed to create class');
    }
  };

  const handleDeleteClass = async (classId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this class?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/class/${classId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        setClasses(classes.filter(cls => cls.id !== classId));
      } else {
        alert(data.message || 'Failed to delete class');
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Failed to delete class');
    }
  };

  const filteredClasses = classes.filter(cls =>
    cls.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f0f9ff, #f0fdf4)' }}>
      <Navigation userType="teacher" />
      <div style={{ padding: '1rem', paddingTop: '5rem', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                Class Management
              </h1>
              <p style={{ color: '#6b7280' }}>
                Manage your classes, students, and schedules
              </p>
            </div>
            <button
              onClick={() => setShowCreateClass(true)}
              style={{
                backgroundColor: '#059669',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Plus size={20} />
              Create New Class
            </button>
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
                placeholder="Search classes..."
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
            <button
              style={{
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                backgroundColor: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Filter size={20} />
              Filter
            </button>
          </div>
        </div>

        {/* Classes Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            Loading classes...
          </div>
        ) : filteredClasses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            <p>No classes found.</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Click "Create New Class" to add your first class.</p>
          </div>
        ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {filteredClasses.map((cls) => (
            <div
              key={cls.id}
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
              onClick={() => setSelectedClass(cls)}
            >
              {/* Class Header */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                    Grade {cls.grade} - Section {cls.section}
                  </h3>
                  <button
                    onClick={(e) => handleDeleteClass(cls.id, e)}
                    style={{
                      padding: '0.25rem',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#ef4444'
                    }}
                    title="Delete Class"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#059669',
                    backgroundColor: '#d1fae5',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem'
                  }}>
                    {cls.subject}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <BookOpen size={16} style={{ color: '#6b7280' }} />
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Teacher: {cls.teacherName}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} style={{ color: '#6b7280' }} />
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {cls.totalStudents} Students
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/teacher/student-management?classId=${cls.id}&grade=${cls.grade}&section=${cls.section}`);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Eye size={16} />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>{classes.length}</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Classes</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
              {classes.reduce((total, cls) => total + cls.totalStudents, 0)}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Students</div>
          </div>
        </div>
      </div>

      {/* Create Class Modal */}
      {showCreateClass && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.75rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Create New Class
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Set up a new class for your students.
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem', fontWeight: '500' }}>
                Class
              </label>
              <input
                type="text"
                value={newClass.className}
                onChange={(e) => setNewClass({ ...newClass, className: e.target.value })}
                placeholder="e.g. 5th-A"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Format: Grade-Section (e.g. 5th-A, 10th-B)
              </p>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem', fontWeight: '500' }}>
                Subject
              </label>
              <input
                type="text"
                value={newClass.subject}
                onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })}
                placeholder="e.g. Environmental Science"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCreateClass(false)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateClass}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Create Class
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;