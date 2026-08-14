import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Phone,
  Calendar,
  School,
  GraduationCap,
  UserCheck,
  UserX,
  MoreVertical,
  Download,
  Upload,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  LogOut
} from 'lucide-react';

const UserManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateTeacher, setShowCreateTeacher] = useState(false);
  const [selectedView, setSelectedView] = useState('overview');
  const [admins, setAdmins] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentAdmin, setCurrentAdmin] = useState(null);

  // Form state for creating new teacher
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    phone: '',
    teacherId: '',
    password: ''
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // Check if admin is logged in
  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    if (adminData) {
      setCurrentAdmin(JSON.parse(adminData));
    }
  }, []);

  // Fetch all data from API
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch admins, teachers, and students in parallel
      const [adminsRes, teachersRes, studentsRes] = await Promise.all([
        adminService.getAll(),
        adminService.getAllTeachers(),
        adminService.getAllStudents()
      ]);
      
      if (adminsRes.success) setAdmins(adminsRes.data);
      if (teachersRes.success) setTeachers(teachersRes.data);
      if (studentsRes.success) setStudents(studentsRes.data);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Create new teacher
  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!newTeacher.name || !newTeacher.email || !newTeacher.phone || !newTeacher.teacherId || !newTeacher.password) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      const response = await adminService.createTeacher(newTeacher);
      if (response.success) {
        setSuccessMessage('Teacher created successfully!');
        setNewTeacher({ name: '', email: '', phone: '', teacherId: '', password: '' });
        setShowCreateTeacher(false);
        fetchAllData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create teacher');
    } finally {
      setLoading(false);
    }
  };

  // Delete admin
  const handleDeleteAdmin = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;
    
    try {
      setLoading(true);
      const response = await adminService.delete(id);
      if (response.success) {
        setSuccessMessage('Admin deleted successfully!');
        setSelectedUser(null);
        fetchAllData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete admin');
    } finally {
      setLoading(false);
    }
  };

  // Delete teacher
  const handleDeleteTeacher = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    
    try {
      setLoading(true);
      const response = await adminService.deleteTeacher(id);
      if (response.success) {
        setSuccessMessage('Teacher deleted successfully!');
        setSelectedUser(null);
        fetchAllData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete teacher');
    } finally {
      setLoading(false);
    }
  };

  // Delete student
  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    
    try {
      setLoading(true);
      const response = await adminService.deleteStudent(id);
      if (response.success) {
        setSuccessMessage('Student deleted successfully!');
        setSelectedUser(null);
        fetchAllData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete student');
    } finally {
      setLoading(false);
    }
  };

  // Logout admin
  const handleLogout = () => {
    localStorage.removeItem('admin');
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  // Convert fetched admins to the user format
  const adminUsers = admins.map(admin => ({
    id: admin._id,
    name: admin.name,
    email: `${admin.adminId}@ecolearn.admin`,
    type: "admin",
    institution: admin.schoolName,
    status: "active",
    lastLogin: admin.updatedAt || admin.createdAt,
    joinDate: admin.createdAt,
    phone: "N/A",
    department: "Platform Administration",
    verified: true,
    adminId: admin.adminId,
    schoolName: admin.schoolName,
    permissions: ["full_access", "user_management", "system_settings", "content_moderation"]
  }));

  // Convert fetched teachers to the user format
  const teacherUsers = teachers.map(teacher => ({
    id: teacher._id,
    name: teacher.Name,
    email: teacher.email,
    type: "teacher",
    institution: "EcoLearn",
    status: "active",
    lastLogin: teacher.updatedAt || teacher.createdAt,
    joinDate: teacher.createdAt,
    phone: teacher.phone,
    teacherId: teacher.teacherId,
    department: "Education",
    verified: true,
    permissions: ["create_assignments", "manage_students", "view_analytics"]
  }));

  // Convert fetched students to the user format
  const studentUsers = students.map(student => ({
    id: student._id,
    name: student.name,
    email: student.email,
    type: "student",
    institution: student.school || "EcoLearn",
    status: student.credentialsGenerated ? "active" : "pending",
    lastLogin: student.updatedAt || student.createdAt,
    joinDate: student.createdAt || student.joiningDate,
    phone: student.phone,
    rollNumber: student.rollNumber,
    class: student.class,
    teacherId: student.teacherId,
    verified: student.credentialsGenerated,
    permissions: ["access_ar", "submit_assignments", "view_progress"]
  }));

  // Combine all users from database
  const users = [...adminUsers, ...teacherUsers, ...studentUsers];

  const institutions = [
    { id: 1, name: "Green Valley High School", userCount: 156, type: "High School" },
    { id: 2, name: "EcoTech Institute", userCount: 234, type: "University" },
    { id: 3, name: "Nature Academy", userCount: 89, type: "Middle School" },
    { id: 4, name: "Sustainability College", userCount: 312, type: "College" }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.institution.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return { bg: '#dcfce7', text: '#166534', icon: CheckCircle };
      case 'suspended': return { bg: '#fee2e2', text: '#991b1b', icon: AlertTriangle };
      case 'pending': return { bg: '#fef3c7', text: '#92400e', icon: Clock };
      default: return { bg: '#f3f4f6', text: '#374151', icon: Activity };
    }
  };

  const getUserTypeIcon = (type) => {
    switch(type) {
      case 'student': return <GraduationCap size={16} style={{ color: '#3b82f6' }} />;
      case 'teacher': return <Users size={16} style={{ color: '#059669' }} />;
      case 'admin': return <Shield size={16} style={{ color: '#7c3aed' }} />;
      default: return <Users size={16} style={{ color: '#6b7280' }} />;
    }
  };

  const formatLastLogin = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Active now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const formatJoinDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fef3c7' }}>
      <AdminNavbar />
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 2rem' }}>
        {/* Success/Error Messages */}
        {successMessage && (
          <div style={{ 
            padding: '1rem', 
            backgroundColor: '#dcfce7', 
            color: '#166534', 
            borderRadius: '0.5rem', 
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{successMessage}</span>
            <button 
              onClick={() => setSuccessMessage('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}
            >
              ×
            </button>
          </div>
        )}
        
        {error && (
          <div style={{ 
            padding: '1rem', 
            backgroundColor: '#fee2e2', 
            color: '#991b1b', 
            borderRadius: '0.5rem', 
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{error}</span>
            <button 
              onClick={() => setError('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}
            >
              ×
            </button>
          </div>
        )}
        
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                User Management
              </h1>
              <p style={{ color: '#6b7280' }}>
                Manage students, teachers, and administrators across all institutions
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {currentAdmin && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '0.375rem',
                  marginRight: '0.5rem'
                }}>
                  <Shield size={16} style={{ color: '#059669' }} />
                  <span style={{ fontSize: '0.875rem', color: '#059669', fontWeight: '500' }}>
                    {currentAdmin.name}
                  </span>
                </div>
              )}
<button
                onClick={() => setShowCreateTeacher(true)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <UserPlus size={16} />
                Add Teacher
              </button>
              <button
                onClick={handleLogout}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
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
                placeholder="Search users..."
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
              Filters
            </button>
          </div>

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
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>{users.length}</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Users</div>
            </div>
            
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '0.5rem',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏫</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{institutions.length}</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Institutions</div>
            </div>
            
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '0.5rem',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                {users.filter(u => u.status === 'active').length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Active Users</div>
            </div>
            
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '0.5rem',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7c3aed' }}>
                {Math.round(users.filter(u => u.status === 'active').length / users.length * 100)}%
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Active Rate</div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          {loading && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              Loading...
            </div>
          )}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>
                    User
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>
                    Type & Institution
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>
                    Status
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>
                    Last Login
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>
                    Join Date
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>
                    Details
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => {
                  const statusColor = getStatusColor(user.status);
                  const StatusIcon = statusColor.icon;
                  
                  return (
                    <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            backgroundColor: user.type === 'admin' ? '#7c3aed' : user.type === 'teacher' ? '#059669' : '#3b82f6',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.875rem'
                          }}>
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                              {user.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          {getUserTypeIcon(user.type)}
                          <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937', textTransform: 'capitalize' }}>
                            {user.type}
                          </span>
                          {user.verified && (
                            <ShieldCheck size={14} style={{ color: '#10b981' }} />
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          {user.institution}
                        </div>
                      </td>
                      
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          backgroundColor: statusColor.bg,
                          color: statusColor.text
                        }}>
                          <StatusIcon size={12} />
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                          {formatLastLogin(user.lastLogin)}
                        </span>
                      </td>
                      
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {formatJoinDate(user.joinDate)}
                        </span>
                      </td>
                      
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          {user.type === 'teacher' && (
                            <>
                              ID: {user.teacherId}
                              <br />
                              {user.phone}
                            </>
                          )}
                          {user.type === 'student' && (
                            <>
                              Roll: {user.rollNumber}
                              <br />
                              Class: {user.class}
                            </>
                          )}
                          {user.type === 'admin' && (
                            <>
                              {user.permissions.length} permissions
                              <br />
                              {user.schoolName || user.department}
                            </>
                          )}
                        </div>
                      </td>
                      
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                          <button
                            onClick={() => setSelectedUser(user)}
                            style={{
                              padding: '0.25rem',
                              backgroundColor: '#f3f4f6',
                              color: '#374151',
                              border: 'none',
                              borderRadius: '0.25rem',
                              cursor: 'pointer'
                            }}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (user.type === 'admin') handleDeleteAdmin(user.id);
                              else if (user.type === 'teacher') handleDeleteTeacher(user.id);
                              else if (user.type === 'student') handleDeleteStudent(user.id);
                            }}
                            style={{
                              padding: '0.25rem',
                              backgroundColor: '#fee2e2',
                              color: '#991b1b',
                              border: 'none',
                              borderRadius: '0.25rem',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: currentPage === 1 ? '#e5e7eb' : '#f3f4f6',
                  color: currentPage === 1 ? '#9ca3af' : '#374151',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>
              {totalPages > 0 && Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show first page, last page, current page, and pages around current
                  return page === 1 || 
                         page === totalPages || 
                         (page >= currentPage - 1 && page <= currentPage + 1);
                })
                .map((page, index, arr) => (
                  <React.Fragment key={page}>
                    {index > 0 && arr[index - 1] !== page - 1 && (
                      <span style={{ padding: '0.5rem', color: '#6b7280' }}>...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: currentPage === page ? '#059669' : '#f3f4f6',
                        color: currentPage === page ? 'white' : '#374151',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontWeight: currentPage === page ? '500' : '400'
                      }}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages <= 1}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: (currentPage === totalPages || totalPages <= 1) ? '#e5e7eb' : '#f3f4f6',
                  color: (currentPage === totalPages || totalPages <= 1) ? '#9ca3af' : '#374151',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: (currentPage === totalPages || totalPages <= 1) ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
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
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                User Details - {selectedUser.name}
              </h2>
              <button
                onClick={() => setSelectedUser(null)}
                style={{
                  padding: '0.5rem',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '1.5rem'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>
                  Email
                </label>
                <p style={{ fontSize: '0.875rem', color: '#1f2937', marginBottom: '1rem' }}>
                  {selectedUser.email}
                </p>
              </div>
              
              <div>
                <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>
                  Phone
                </label>
                <p style={{ fontSize: '0.875rem', color: '#1f2937', marginBottom: '1rem' }}>
                  {selectedUser.phone}
                </p>
              </div>
              
              <div>
                <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>
                  Institution
                </label>
                <p style={{ fontSize: '0.875rem', color: '#1f2937', marginBottom: '1rem' }}>
                  {selectedUser.institution}
                </p>
              </div>
              
              <div>
                <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>
                  Status
                </label>
                <p style={{ fontSize: '0.875rem', color: '#1f2937', marginBottom: '1rem' }}>
                  {selectedUser.status}
                </p>
              </div>
            </div>
            
            <div style={{ marginTop: '1.5rem' }}>
              <label style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', display: 'block' }}>
                Permissions
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {selectedUser.permissions.map((permission, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem'
                    }}
                  >
                    {permission.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button
                onClick={() => setSelectedUser(null)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Edit User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Teacher Modal */}
      {showCreateTeacher && (
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
              Create New Teacher
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Add a new teacher to the EcoLearn platform.
            </p>
            
            {error && (
              <div style={{ 
                padding: '0.75rem', 
                backgroundColor: '#fee2e2', 
                color: '#991b1b', 
                borderRadius: '0.375rem', 
                marginBottom: '1rem',
                fontSize: '0.875rem'
              }}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleCreateTeacher}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Teacher Name *
                </label>
                <input
                  type="text"
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                  placeholder="Enter teacher name"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                  placeholder="Enter email address"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Phone *
                </label>
                <input
                  type="tel"
                  value={newTeacher.phone}
                  onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                  placeholder="Enter phone number"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Teacher ID *
                </label>
                <input
                  type="text"
                  value={newTeacher.teacherId}
                  onChange={(e) => setNewTeacher({ ...newTeacher, teacherId: e.target.value })}
                  placeholder="Enter unique teacher ID"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Password *
                </label>
                <input
                  type="password"
                  value={newTeacher.password}
                  onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                  placeholder="Enter password"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateTeacher(false);
                    setError('');
                    setNewTeacher({ name: '', email: '', phone: '', teacherId: '', password: '' });
                  }}
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
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Creating...' : 'Create Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;