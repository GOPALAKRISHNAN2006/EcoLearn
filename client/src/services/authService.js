import api from './api';
import { setAccessToken } from './tokenStore';

// Student Authentication
export const studentLogin = async (rollNumber, password) => {
  try {
    const response = await api.post('/student/login', {
      rollNumber,
      password,
    });
    
    if (response.data.success) {
      setAccessToken(response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Login failed' };
  }
};

// Student Change Password (First Login)
export const studentChangePassword = async (rollNumber, oldPassword, newPassword) => {
  try {
    const response = await api.post('/student/change-password', {
      rollNumber,
      oldPassword,
      newPassword,
    });
    
    if (response.data.success) {
      setAccessToken(response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Password change failed' };
  }
};

// Teacher Authentication
export const teacherLogin = async (teacherId, password) => {
  try {
    const response = await api.post('/teacher/login', {
      teacherId,
      password,
    });
    
    if (response.data.success) {
      setAccessToken(response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Login failed' };
  }
};

// Teacher Registration
export const teacherRegister = async (Name, email, phone, teacherId, password) => {
  try {
    const response = await api.post('/teacher/register', {
      Name,
      email,
      phone,
      teacherId,
      password,
    });
    
    if (response.data.success) {
      setAccessToken(response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Registration failed' };
  }
};

// Refresh Access Token
export const refreshAccessToken = async () => {
  try {
    const response = await api.post('/auth/refresh');
    if (response.data.success) {
      setAccessToken(response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      if (response.data.user.role === 'admin') {
        localStorage.setItem('admin', JSON.stringify(response.data.user));
      }
      return response.data.accessToken;
    }
    return null;
  } catch (error) {
    setAccessToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    return null;
  }
};

// Logout
export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (e) {
    // Ignore error during logout API call
  }
  setAccessToken(null);
  localStorage.removeItem('user');
  localStorage.removeItem('admin');
  localStorage.removeItem('adminToken');
};
