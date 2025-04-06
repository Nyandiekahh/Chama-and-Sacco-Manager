// src/components/finance/Debts.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../common/Card';
import DataTable from '../common/DataTable';
import Alert from '../common/Alert';
import Modal from '../common/Modal';
import debtService from '../../services/debt.service';
import memberService from '../../services/member.service';

const Debts = () => {
  const { saccoId } = useParams();
  const { isAdmin, isTreasurer, currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialStatus = queryParams.get('status') || '';
  const initialMemberId = queryParams.get('memberId') || '';
  
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [members, setMembers] = useState([]);
  const [filters, setFilters] = useState({
    status: initialStatus,
    memberId: initialMemberId
  });
  
  const [formData, setFormData] = useState({
    membership: '',
    amount: '',
    description: '',
    due_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
  });
  
  const isAdminOrTreasurer = isAdmin(saccoId) || isTreasurer(saccoId);
  
  useEffect(() => {
    const fetchDebts = async () => {
      setLoading(true);
      try {
        let data;
        
        // Different fetching strategies based on user role and filters
        if (filters.memberId) {
          // Fetch specific member's debts
          data = await debtService.getMemberDebts(saccoId, filters.memberId);
        } else if (isAdminOrTreasurer) {
          // Admins and treasurers can see all debts
          data = await debtService.getSaccoDebts(saccoId);
        } else {
          // Regular members can only see their own debts
          data = await debtService.getUserDebts(saccoId, currentUser.id);
        }
        
        // Apply status filter if needed
        if (filters.status) {
          data = data.filter(debt => debt.status === filters.status);
        }
        
        setDebts(data);
        
        // Fetch members for debt form if admin/treasurer
        if (isAdminOrTreasurer) {
          const membersData = await memberService.getSaccoMembers(saccoId);
          setMembers(membersData);
        }
      } catch (err) {
        console.error('Failed to fetch debts:', err);
        setError('Failed to load debts');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDebts();
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
  
  const handleAddDebt = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Prepare debt data
      const debtData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };
      
      // Create debt
      await debtService.createDebt(saccoId, debtData);
      
      // Reset form
      setFormData({
        membership: '',
        amount: '',
        description: '',
        due_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
      });
      
      // Refresh debts
      const newDebts = await debtService.getSaccoDebts(saccoId);
      setDebts(newDebts);
      
      setMessage('Debt added successfully');
      setAddModal(false);
    } catch (err) {
      setError('Failed to add debt');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusBadge = (status) => {
    const statusClasses = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PARTIALLY_PAID': 'bg-blue-100 text-blue-800',
      'PAID': 'bg-green-100 text-green-800',
      'WRITTEN_OFF': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };
  
  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Debts</h2>
        <div className="flex space-x-2">
          {isAdminOrTreasurer && (
            <button
              onClick={() => setAddModal(true)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Debt
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
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Debt Status
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PAID">Paid</option>
              <option value="WRITTEN_OFF">Written Off</option>
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
              onClick={() => setFilters({ status: '', memberId: '' })}
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
        ) : debts.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900">No debts found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {filters.status || filters.memberId ? (
                'Try clearing your filters to see more results.'
              ) : (
                isAdminOrTreasurer ? 'Start by adding a new debt.' : 'You have no debts at this time.'
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
                header: 'Amount', 
                field: 'amount', 
                render: row => `${row.amount.toLocaleString()}` 
              },
              { 
                header: 'Description', 
                field: 'description',
                render: row => (
                  <div className="max-w-xs truncate" title={row.description}>
                    {row.description}
                  </div>
                )
              },
              { 
                header: 'Status', 
                field: 'status',
                render: row => getStatusBadge(row.status)
              },
              { 
                header: 'Created Date', 
                field: 'created_date', 
                render: row => new Date(row.created_date).toLocaleDateString() 
              },
              { 
                header: 'Due Date', 
                field: 'due_date', 
                render: row => row.due_date ? new Date(row.due_date).toLocaleDateString() : 'N/A' 
              }
            ]}
            data={debts}
            pagination={true}
            pageSize={10}
            onRowClick={(row) => navigate(`/saccos/${saccoId}/debts/${row.id}`)}
          />
        )}
      </Card>
      
      {/* Add Debt Modal */}
      <Modal
        isOpen={addModal}
        onClose={() => setAddModal(false)}
        title="Add Debt"
      >
        <form onSubmit={handleAddDebt}>
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
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Debt Amount *
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
              <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                name="due_date"
                id="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-sm text-gray-500">
                Leave blank if there is no specific due date.
              </p>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                required
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Describe the reason for this debt"
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
              {loading ? 'Adding...' : 'Add Debt'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Debts;