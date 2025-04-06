// src/components/members/MemberList.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../common/Card';
import DataTable from '../common/DataTable';
import Alert from '../common/Alert';
import Modal from '../common/Modal';
import memberService from '../../services/member.service';

const MemberList = () => {
  const { saccoId } = useParams();
  const { currentUser, isAdmin } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [changeRoleModal, setChangeRoleModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const isAdminUser = isAdmin(saccoId);
  
  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const data = await memberService.getSaccoMembers(saccoId);
        setMembers(data);
        
        if (isAdminUser) {
          // Get available roles if admin
          const rolesData = await memberService.getSaccoRoles(saccoId);
          setRoles(rolesData);
        }
      } catch (err) {
        console.error('Failed to fetch members:', err);
        setError('Failed to load members');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMembers();
  }, [saccoId, isAdminUser]);
  
  const handleChangeRole = (member) => {
    setSelectedMember(member);
    setSelectedRole(member.role?.id || '');
    setChangeRoleModal(true);
  };
  
  const handleRoleChange = async () => {
    if (!selectedMember || !selectedRole) return;
    
    setLoading(true);
    try {
      await memberService.changeMemberRole(saccoId, selectedMember.id, selectedRole);
      
      // Update members list
      setMembers(prev => prev.map(member => {
        if (member.id === selectedMember.id) {
          const newRole = roles.find(r => r.id === selectedRole);
          return { ...member, role: newRole, role_name: newRole.name };
        }
        return member;
      }));
      
      setMessage(`Role updated successfully for ${selectedMember.user_details.first_name} ${selectedMember.user_details.last_name}`);
      setChangeRoleModal(false);
    } catch (err) {
      setError('Failed to change role');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const getMembershipStatus = (status) => {
    const statusClasses = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'SUSPENDED': 'bg-red-100 text-red-800',
      'INACTIVE': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };
  
  // Render actions for member rows
  const renderActions = (member) => {
    if (!isAdminUser || member.user_details.id === currentUser.id) return null;
    
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleChangeRole(member);
          }}
          className="text-blue-600 hover:text-blue-900"
        >
          Change Role
        </button>
      </div>
    );
  };
  
  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Members</h2>
        <Link
          to={`/saccos/${saccoId}`}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back to Sacco
        </Link>
      </div>
      
      {message && (
        <div className="mb-4">
          <Alert type="success" message={message} onClose={() => setMessage('')} />
        </div>
      )}
      
      {error && (
        <div className="mb-4">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}
      
      <Card>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        ) : (
          <DataTable
            columns={[
              { header: 'Name', field: 'user_details', render: row => `${row.user_details.first_name} ${row.user_details.last_name}` },
              { header: 'Email', field: 'user_details', render: row => row.user_details.email },
              { header: 'Phone', field: 'user_details', render: row => row.user_details.phone_number || 'N/A' },
              { header: 'Role', field: 'role_name' },
              { header: 'Status', field: 'status', render: row => getMembershipStatus(row.status) },
              { header: 'Joined Date', field: 'joined_date', render: row => new Date(row.joined_date).toLocaleDateString() }
            ]}
            data={members}
            pagination={true}
            pageSize={10}
            onRowClick={(row) => window.location.href = `/saccos/${saccoId}/members/${row.id}`}
            actions={isAdminUser ? renderActions : null}
          />
        )}
      </Card>
      
      {/* Change Role Modal */}
      <Modal
        isOpen={changeRoleModal}
        onClose={() => setChangeRoleModal(false)}
        title="Change Member Role"
      >
        {selectedMember && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Change the role for <span className="font-medium">{selectedMember.user_details.first_name} {selectedMember.user_details.last_name}</span>
            </p>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Select a role</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setChangeRoleModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRoleChange}
                disabled={!selectedRole || loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Role'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MemberList;