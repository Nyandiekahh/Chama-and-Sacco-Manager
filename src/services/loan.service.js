// src/services/loan.service.js
import api from './api';

const loanService = {
  // Get all loans for a sacco
  getSaccoLoans: async (saccoId) => {
    try {
      const response = await api.get(`saccos/${saccoId}/loans/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch loans');
    }
  },
  
  // Get loans for a specific member
  getMemberLoans: async (saccoId, memberId) => {
    try {
      const response = await api.get(`saccos/${saccoId}/loans/?membership=${memberId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch member loans');
    }
  },
  
  // Get loans for the current user
  getUserLoans: async (saccoId, userId) => {
    try {
      const response = await api.get(`saccos/${saccoId}/loans/?user=${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch user loans');
    }
  },
  
  // Get loan by ID
  getLoanById: async (saccoId, loanId) => {
    try {
      const response = await api.get(`saccos/${saccoId}/loans/${loanId}/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch loan details');
    }
  },
  
  // Create a new loan
  createLoan: async (saccoId, loanData) => {
    try {
      const response = await api.post(`saccos/${saccoId}/loans/`, loanData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to create loan');
    }
  },
  
  // Approve a loan
  approveLoan: async (saccoId, loanId) => {
    try {
      const response = await api.post(`saccos/${saccoId}/loans/${loanId}/approve/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to approve loan');
    }
  },
  
  // Disburse a loan
  disburseLoan: async (saccoId, loanId) => {
    try {
      const response = await api.post(`saccos/${saccoId}/loans/${loanId}/disburse/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to disburse loan');
    }
  },
  
  // Get loan repayments
  getLoanRepayments: async (loanId) => {
    try {
      const response = await api.get(`loans/${loanId}/repayments/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch repayments');
    }
  },
  
  // Add a loan repayment
  addRepayment: async (loanId, repaymentData) => {
    try {
      const response = await api.post(`loans/${loanId}/repayments/`, repaymentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to add repayment');
    }
  }
};

export default loanService;