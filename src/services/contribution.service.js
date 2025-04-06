// src/services/contribution.service.js
import api from './api';

const contributionService = {
  // Get all contributions for a sacco
  getSaccoContributions: async (saccoId) => {
    try {
      const response = await api.get(`saccos/${saccoId}/contributions/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch contributions');
    }
  },
  
  // Get contributions for a specific member
  getMemberContributions: async (saccoId, memberId) => {
    try {
      const response = await api.get(`saccos/${saccoId}/contributions/?membership=${memberId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch member contributions');
    }
  },
  
  // Get contributions for the current user
  getUserContributions: async (saccoId, userId) => {
    try {
      const response = await api.get(`saccos/${saccoId}/contributions/?user=${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch user contributions');
    }
  },
  
  // Create a new contribution
  createContribution: async (saccoId, contributionData) => {
    try {
      const response = await api.post(`saccos/${saccoId}/contributions/`, contributionData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to create contribution');
    }
  }
};

export default contributionService;
