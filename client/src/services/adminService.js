import api from './api';

// Admin API Service
const adminService = {
  // ============ ADMIN OPERATIONS ============
  // Login admin
  login: async (adminId, password) => {
    const response = await api.post('/admin/user/login', { adminId, password });
    return response.data;
  },

  // Create new admin
  create: async (adminData) => {
    const response = await api.post('/admin/user', adminData);
    return response.data;
  },

  // Get all admins
  getAll: async () => {
    const response = await api.get('/admin/user');
    return response.data;
  },

  // Get admin by ID
  getById: async (id) => {
    const response = await api.get(`/admin/user/${id}`);
    return response.data;
  },

  // Update admin
  update: async (id, adminData) => {
    const response = await api.put(`/admin/user/${id}`, adminData);
    return response.data;
  },

  // Delete admin
  delete: async (id) => {
    const response = await api.delete(`/admin/user/${id}`);
    return response.data;
  },

  // ============ TEACHER OPERATIONS ============
  // Create new teacher
  createTeacher: async (teacherData) => {
    const response = await api.post('/admin/teacher', teacherData);
    return response.data;
  },

  // Get all teachers
  getAllTeachers: async () => {
    const response = await api.get('/admin/teacher');
    return response.data;
  },

  // Delete teacher
  deleteTeacher: async (id) => {
    const response = await api.delete(`/admin/teacher/${id}`);
    return response.data;
  },

  // ============ STUDENT OPERATIONS ============
  // Get all students
  getAllStudents: async () => {
    const response = await api.get('/admin/student');
    return response.data;
  },

  // Delete student
  deleteStudent: async (id) => {
    const response = await api.delete(`/admin/student/${id}`);
    return response.data;
  }
};

export default adminService;
