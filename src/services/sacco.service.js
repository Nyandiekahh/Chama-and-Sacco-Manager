// src/services/sacco.service.js
import api from './api';

const saccoService = {
  // Get all saccos for current user
  getUserSaccos: async () => {
    try {
      const response = await api.get('saccos/');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch saccos');
    }
  },
  
  // Get sacco by ID
  getSaccoById: async (saccoId) => {
    try {
      const response = await api.get(`saccos/${saccoId}/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch sacco details');
    }
  },
  
  // Create a new sacco
  createSacco: async (saccoData) => {
    try {
      const response = await api.post('saccos/', saccoData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to create sacco');
    }
  },
  
  // Update a sacco
  updateSacco: async (saccoId, saccoData) => {
    try {
      const response = await api.put(`saccos/${saccoId}/`, saccoData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to update sacco');
    }
  },
  
  // Search saccos
  searchSaccos: async (query) => {
    try {
      const response = await api.get(`saccos/search/?q=${query}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to search saccos');
    }
  },
  
  // Request to join a sacco
  requestJoin: async (saccoId, message = '') => {
    try {
      const response = await api.post(`saccos/${saccoId}/join-requests/`, {
        sacco: saccoId,
        message
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to request join');
    }
  },
  
  // Get sacco members
  getSaccoMembers: async (saccoId) => {
    try {
      const response = await api.get(`saccos/${saccoId}/members/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch members');
    }
  },
  
  // Get sacco statistics
  getSaccoStatistics: async (saccoId) => {
    try {
      const response = await api.get(`saccos/${saccoId}/statistics/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch statistics');
    }
  }
};

export default saccoService;