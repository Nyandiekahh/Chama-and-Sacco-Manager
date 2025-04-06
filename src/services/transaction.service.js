// src/services/transaction.service.js
import api from './api';

const transactionService = {
  // Get all transactions for a sacco
  getSaccoTransactions: async (saccoId) => {
    try {
      const response = await api.get(`saccos/${saccoId}/transactions/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch transactions');
    }
  },
  
  // Get transactions for the current user
  getUserTransactions: async (saccoId, userId) => {
    try {
      const response = await api.get(`saccos/${saccoId}/transactions/?user=${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch user transactions');
    }
  },
  
  // Create a new transaction
  createTransaction: async (saccoId, transactionData) => {
    try {
      const response = await api.post(`saccos/${saccoId}/transactions/`, transactionData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to create transaction');
    }
  }
};

export default transactionService;