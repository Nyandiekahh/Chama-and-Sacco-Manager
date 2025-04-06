// src/services/dividend.service.js
import api from './api';

const dividendService = {
  // Get all dividends for a sacco
  getSaccoDividends: async (saccoId) => {
    try {
      const response = await api.get(`saccos/${saccoId}/dividends/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch dividends');
    }
  },
  
  // Get dividend by ID
  getDividendById: async (saccoId, dividendId) => {
    try {
      const response = await api.get(`saccos/${saccoId}/dividends/${dividendId}/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch dividend details');
    }
  },
  
  // Declare a new dividend
  declareDividend: async (saccoId, dividendData) => {
    try {
      const response = await api.post(`saccos/${saccoId}/dividends/`, dividendData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to declare dividend');
    }
  },
  
  // Distribute a dividend
  distributeDividend: async (saccoId, dividendId) => {
    try {
      const response = await api.post(`saccos/${saccoId}/dividends/${dividendId}/distribute/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to distribute dividend');
    }
  },
  
  // Get member dividends for a dividend
  getMemberDividends: async (dividendId) => {
    try {
      const response = await api.get(`dividends/${dividendId}/member-dividends/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch member dividends');
    }
  },
  
  // Mark a member dividend as paid
  markDividendPaid: async (dividendId, memberDividendId, transactionCode = '') => {
    try {
      const response = await api.post(`dividends/${dividendId}/member-dividends/${memberDividendId}/mark_paid/`, {
        transaction_code: transactionCode
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to mark dividend as paid');
    }
  }
};

export default dividendService;