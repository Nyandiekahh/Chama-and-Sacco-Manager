// src/components/finance/Contributions.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../common/Card';
import DataTable from '../common/DataTable';
import Alert from '../common/Alert';
import Modal from '../common/Modal';
import contributionService from '../../services/contribution.service';
import memberService from '../../services/member.service';

const Contributions = () => {
  const { saccoId } = useParams();
  const { isAdmin, isTreasurer, currentUser } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialType = queryParams.get('type') || '';
  const initialMemberId = queryParams.get('memberId') || '';
  
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [members, setMembers] = useState([]);
  const [filters, setFilters] = useState({
    type: initialType,
    memberId: initialMemberId
  });
  
  const [formData, setFormData] = useState({
    membership: '',
    amount: '',
    contribution_date: new Date().toISOString().split('T')[0],
    contribution_type: 'SHARE_CAPITAL',
    transaction_code: '',
    reference_number: '',
    notes: ''
  });
  
  const isAdminOrTreasurer = isAdmin(saccoId) || isTreasurer(saccoId);
  
  useEffect(() => {
    const fetchContributions = async () => {
      setLoading(true);
      try {
        let data;
        
        // Different fetching strategies based on user role and filters
        if (filters.memberId) {
          // Fetch specific member's contributions
          data = await contributionService.getMemberContributions(saccoId, filters.memberId);
        } else if (isAdminOrTreasurer) {
          // Admins and treasurers can see all contributions
          data = await contributionService.getSaccoContributions(saccoId);
        } else {
          // Regular members can only see their own contributions
          data = await contributionService.getUserContributions(saccoId, currentUser.id);
        }
        
        // Apply type filter if needed
        if (filters.type) {
          data = data.filter(c => c.contribution_type === filters.type);
        }
        
        setContributions(data);
        
        // Fetch members for contribution form if admin/treasurer
        if (isAdminOrTreasurer) {
          const membersData = await memberService.getSaccoMembers(saccoId);
          setMembers(membersData);
        }
      } catch (err) {
        console.error('Failed to fetch contributions:', err);
        setError('Failed to load contributions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchContributions();
  }, [saccoId, isAdminOrTreasurer, currentUser, filters]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddContribution = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Prepare contribution data
      const contributionData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };
      
      // Create contribution
      await contributionService.createContribution(saccoId, contributionData);
      
      // Reset form
      setFormData({
        membership: '',
        amount: '',
        contribution_date: new Date().toISOString().split('T')[0],
        contribution_type: 'SHARE_CAPITAL',
        transaction_code: '',
        reference_number: '',
        notes: ''
      });
      
      // Refresh contributions
      const newContributions = await contributionService.getSaccoContributions(saccoId);
      setContributions(newContributions);
      
      setMessage('Contribution added successfully');
      setAddModal(false);
    } catch (err) {
      setError('Failed to add contribution');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Contributions</h2>
        <div className="flex space-x-2">
          {isAdminOrTreasurer && (
            <button
              onClick={() => setAddModal(true)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Contribution
            </button>
          )}
          <Link
            to={`/saccos/${saccoId}`}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Sacco
          </Link>
        </div>
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
      
      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="w-full sm:w-auto">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Contribution Type
            </label>
            <select
              id="type"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Types</option>
              <option value="SHARE_CAPITAL">Share Capital</option>
              <option value="MONTHLY">Monthly</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          
          {isAdminOrTreasurer && (
            <div className="w-full sm:w-auto">
              <label htmlFor="memberId" className="block text-sm font-medium text-gray-700 mb-1">
                Member
              </label>
              <select
                id="memberId"
                name="memberId"
                value={filters.memberId}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">All Members</option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.user_details.first_name} {member.user_details.last_name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="w-full sm:w-auto flex items-end">
            <button
              onClick={() => setFilters({ type: '', memberId: '' })}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </Card>
      
      <Card>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        ) : contributions.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900">No contributions found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {filters.type || filters.memberId ? (
                'Try clearing your filters to see more results.'
              ) : (
                'Start by adding a new contribution.'
              )}
            </p>
          </div>
        ) : (
          <DataTable
            columns={[
              { 
                header: 'Member', 
                field: 'membership', 
                render: row => row.member_email || 'Unknown' 
              },
              { 
                header: 'Date', 
                field: 'contribution_date', 
                render: row => new Date(row.contribution_date).toLocaleDateString() 
              },
              { 
                header: 'Type', 
                field: 'contribution_type',
                render: row => {
                  const typeLabels = {
                    'SHARE_CAPITAL': 'Share Capital',
                    'MONTHLY': 'Monthly',
                    'OTHER': 'Other'
                  };
                  return typeLabels[row.contribution_type] || row.contribution_type;
                }
              },
              { 
                header: 'Amount', 
                field: 'amount', 
                render: row => `${row.amount.toLocaleString()}` 
              },
              { header: 'Transaction Code', field: 'transaction_code' },
              { header: 'Reference', field: 'reference_number' }
            ]}
            data={contributions}
            pagination={true}
            pageSize={10}
          />
        )}
      </Card>
      
      {/* Add Contribution Modal */}
      <Modal
        isOpen={addModal}
        onClose={() => setAddModal(false)}
        title="Add Contribution"
      >
        <form onSubmit={handleAddContribution}>
          <div className="space-y-4">
            <div>
              <label htmlFor="membership" className="block text-sm font-medium text-gray-700">
                Member *
              </label>
              <select
                id="membership"
                name="membership"
                required
                value={formData.membership}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Select Member</option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.user_details.first_name} {member.user_details.last_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="contribution_type" className="block text-sm font-medium text-gray-700">
                Contribution Type *
              </label>
              <select
                id="contribution_type"
                name="contribution_type"
                required
                value={formData.contribution_type}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="SHARE_CAPITAL">Share Capital</option>
                <option value="MONTHLY">Monthly</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  className="block w-full pl-7 pr-12 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="contribution_date" className="block text-sm font-medium text-gray-700">
                Contribution Date *
              </label>
              <input
                type="date"
                name="contribution_date"
                id="contribution_date"
                required
                value={formData.contribution_date}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="transaction_code" className="block text-sm font-medium text-gray-700">
                Transaction Code
              </label>
              <input
                type="text"
                name="transaction_code"
                id="transaction_code"
                value={formData.transaction_code}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="TRX123456"
              />
            </div>
            
            <div>
              <label htmlFor="reference_number" className="block text-sm font-medium text-gray-700">
                Reference Number
              </label>
              <input
                type="text"
                name="reference_number"
                id="reference_number"
                value={formData.reference_number}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="REF123456"
              />
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Any additional information"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setAddModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Contribution'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Contributions;