// src/components/saccos/SaccoDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSacco } from '../../contexts/SaccoContext';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../common/Card';
import DataTable from '../common/DataTable';
import Alert from '../common/Alert';
import Modal from '../common/Modal';
import saccoService from '../../services/sacco.service';

const SaccoDetail = () => {
  const { saccoId } = useParams();
  const { currentSacco, selectSacco, updateSacco } = useSacco();
  const { isAdmin } = useAuth();
  const [sacco, setSacco] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [members, setMembers] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    share_capital_amount: 0,
    monthly_contribution_amount: 0
  });
  const navigate = useNavigate();
  
  // Load sacco details
  useEffect(() => {
    const fetchSaccoDetails = async () => {
      setLoading(true);
      try {
        const data = await saccoService.getSaccoById(saccoId);
        setSacco(data);
        selectSacco(saccoId);
        
        // Initialize form data
        setFormData({
          name: data.name,
          description: data.description || '',
          share_capital_amount: data.share_capital_amount,
          monthly_contribution_amount: data.monthly_contribution_amount
        });
        
        // Get members
        const membersData = await saccoService.getSaccoMembers(saccoId);
        setMembers(membersData);
      } catch (err) {
        console.error('Failed to fetch sacco details:', err);
        setError('Failed to load sacco details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSaccoDetails();
  }, [saccoId, selectSacco]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('amount') ? parseFloat(value) : value
    }));
  };
  
  const handleUpdateSacco = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const updatedSacco = await updateSacco(saccoId, formData);
      setSacco(updatedSacco);
      setMessage('Sacco updated successfully');
      setEditModal(false);
    } catch (err) {
      setError('Failed to update sacco');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !sacco) {
    return (
      <div className="py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="py-6">
        <Alert type="error" message={error} />
      </div>
    );
  }
  
  if (!sacco) {
    return (
      <div className="py-6">
        <Alert type="error" message="Sacco not found" />
      </div>
    );
  }
  
  return (
    <div className="py-6">
      {message && (
        <div className="mb-4">
          <Alert type="success" message={message} onClose={() => setMessage('')} />
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{sacco.name}</h2>
        {isAdmin(saccoId) && (
          <button
            onClick={() => setEditModal(true)}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Edit Sacco
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card title="Sacco Details">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Description</h4>
              <p className="mt-1 text-gray-900">{sacco.description || 'No description provided'}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Share Capital</h4>
                <p className="mt-1 text-lg font-semibold text-gray-900">${sacco.share_capital_amount.toLocaleString()}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Monthly Contribution</h4>
                <p className="mt-1 text-lg font-semibold text-gray-900">${sacco.monthly_contribution_amount.toLocaleString()}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Created</h4>
                <p className="mt-1 text-gray-900">{new Date(sacco.created_at).toLocaleDateString()}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Administrator</h4>
                <p className="mt-1 text-gray-900">{sacco.admin_email}</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card title="Quick Links">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to={`/saccos/${saccoId}/members`}
              className="block px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Members
            </Link>
            <Link
              to={`/saccos/${saccoId}/contributions`}
              className="block px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Contributions
            </Link>
            <Link
              to={`/saccos/${saccoId}/loans`}
              className="block px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Loans
            </Link>
            <Link
              to={`/saccos/${saccoId}/debts`}
              className="block px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Debts
            </Link>
            <Link
              to={`/saccos/${saccoId}/dividends`}
              className="block px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Dividends
            </Link>
            <Link
              to={`/saccos/${saccoId}/transactions`}
              className="block px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Transactions
            </Link>
          </div>
        </Card>
      </div>
      
      <Card title="Recent Members">
        <DataTable
          columns={[
            { header: 'Name', field: 'user_details', render: row => `${row.user_details.first_name} ${row.user_details.last_name}` },
            { header: 'Email', field: 'user_details', render: row => row.user_details.email },
            { header: 'Role', field: 'role_name' },
            { header: 'Joined Date', field: 'joined_date', render: row => new Date(row.joined_date).toLocaleDateString() },
            { header: 'Status', field: 'status' }
          ]}
          data={members.slice(0, 5)}
          pagination={false}
          onRowClick={(row) => navigate(`/saccos/${saccoId}/members/${row.id}`)}
        />
        <div className="mt-4 text-right">
          <Link
            to={`/saccos/${saccoId}/members`}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View all members →
          </Link>
        </div>
      </Card>
      
      {/* Edit Sacco Modal */}
      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        title="Edit Sacco"
      >
        <form onSubmit={handleUpdateSacco}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="share_capital_amount" className="block text-sm font-medium text-gray-700">
                Share Capital Amount
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="share_capital_amount"
                  id="share_capital_amount"
                  min="0"
                  step="0.01"
                  required
                  value={formData.share_capital_amount}
                  onChange={handleChange}
                  className="block w-full pl-7 pr-12 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="monthly_contribution_amount" className="block text-sm font-medium text-gray-700">
                Monthly Contribution Amount
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="monthly_contribution_amount"
                  id="monthly_contribution_amount"
                  min="0"
                  step="0.01"
                  required
                  value={formData.monthly_contribution_amount}
                  onChange={handleChange}
                  className="block w-full pl-7 pr-12 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setEditModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SaccoDetail;