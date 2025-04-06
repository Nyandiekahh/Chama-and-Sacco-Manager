// src/services/debt.service.js
import api from './api';

const debtService = {
  // Get all debts for a sacco
  getSaccoDebts: async (saccoId) => {
    try {
      const response = await api.get(`saccos/${saccoId}/debts/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch debts');
    }
  },
  
  // Get debts for a specific member
  getMemberDebts: async (saccoId, memberId) => {
    try {
      const response = await api.get(`saccos/${saccoId}/debts/?membership=${memberId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch member debts');
    }
  },
  
  // Get debts for the current user
  getUserDebts: async (saccoId, userId) => {
    try {
      const response = await api.get(`saccos/${saccoId}/debts/?user=${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch user debts');
    }
  },
  
  // Get debt by ID
  getDebtById: async (saccoId, debtId) => {
    try {
      const response = await api.get(`saccos/${saccoId}/debts/${debtId}/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch debt details');
    }
  },
  
  // Create a new debt
  createDebt: async (saccoId, debtData) => {
    try {
      const response = await api.post(`saccos/${saccoId}/debts/`, debtData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to create debt');
    }
  },
  
  // Update debt status
  updateDebtStatus: async (saccoId, debtId, status) => {
    try {
      const response = await api.patch(`saccos/${saccoId}/debts/${debtId}/`, {
        status
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to update debt status');
    }
  },
  
  // Get debt payments
  getDebtPayments: async (debtId) => {
    try {
      const response = await api.get(`debts/${debtId}/payments/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch payments');
    }
  },
  
  // Add a debt payment
  addPayment: async (debtId, paymentData) => {
    try {
      const response = await api.post(`debts/${debtId}/payments/`, paymentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to add payment');
    }
  }
};

export default debtService;
