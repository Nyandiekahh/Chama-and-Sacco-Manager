// src/services/auth.service.js
import api from './api';

const authService = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post('auth/login/', {
        email,
        password
      });
      
      const { access, refresh, user } = response.data;
      
      // Store tokens
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  },
  
  // Register user
  register: async (userData) => {
    try {
      const response = await api.post('auth/register/', userData);
      
      const { access, refresh, user } = response.data;
      
      // Store tokens
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  },
  
  // Logout user
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
  },
  
  // Get current user
  getCurrentUser: async () => {
    try {
      // Try to get from localStorage first
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        // If we have a user, fetch fresh data from API
        const response = await api.get('users/me/');
        
        // Update stored user
        localStorage.setItem('currentUser', JSON.stringify(response.data));
        
        return response.data;
      }
      
      // If no user in localStorage, fetch from API
      const response = await api.get('users/me/');
      
      // Store user
      localStorage.setItem('currentUser', JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      // Clear storage if error (e.g., token invalid)
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
      
      throw new Error('Failed to get current user');
    }
  },
  
  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post('users/change_password/', {
        current_password: currentPassword,
        new_password: newPassword
      });
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to change password');
    }
  },
  
  // Reset password request
  requestPasswordReset: async (email) => {
    try {
      const response = await api.post('auth/reset-password/', {
        email
      });
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to request password reset');
    }
  },
  
  // Confirm password reset
  confirmPasswordReset: async (token, password) => {
    try {
      const response = await api.post('auth/reset-password-confirm/', {
        token,
        password
      });
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to confirm password reset');
    }
  }
};

export default authService;