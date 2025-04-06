// src/services/member.service.js
import api from './api';

const memberService = {
  // Get all members of a sacco
  getSaccoMembers: async (saccoId) => {
    try {
      const response = await api.get(`saccos/${saccoId}/memberships/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch members');
    }
  },
  
  // Get member by ID
  getMemberById: async (saccoId, memberId) => {
    try {
      const response = await api.get(`saccos/${saccoId}/memberships/${memberId}/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch member details');
    }
  },
  
  // Get user's membership in a sacco
  getUserMembership: async (saccoId, userId) => {
    try {
      const response = await api.get(`saccos/${saccoId}/memberships/?user=${userId}`);
      return response.data[0] || null;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch membership');
    }
  },
  
  // Change member role
  changeMemberRole: async (saccoId, membershipId, roleId) => {
    try {
      const response = await api.post(`saccos/${saccoId}/memberships/${membershipId}/change_role/`, {
        role_id: roleId
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to change role');
    }
  },
  
  // Get all roles in a sacco
  getSaccoRoles: async (saccoId) => {
    try {
      const response = await api.get(`saccos/${saccoId}/roles/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch roles');
    }
  },
  
  // Get join requests for a sacco
  getJoinRequests: async (saccoId) => {
    try {
      const response = await api.get(`saccos/${saccoId}/join-requests/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch join requests');
    }
  },
  
  // Approve a join request
  approveJoinRequest: async (saccoId, requestId, responseMessage = '') => {
    try {
      const response = await api.post(`saccos/${saccoId}/join-requests/${requestId}/approve/`, {
        response_message: responseMessage
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to approve request');
    }
  },
  
  // Reject a join request
  rejectJoinRequest: async (saccoId, requestId, responseMessage = '') => {
    try {
      const response = await api.post(`saccos/${saccoId}/join-requests/${requestId}/reject/`, {
        response_message: responseMessage
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to reject request');
    }
  }
};

export default memberService;