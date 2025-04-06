// src/components/finance/Dividends.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../common/Card';
import DataTable from '../common/DataTable';
import Alert from '../common/Alert';
import Modal from '../common/Modal';
import dividendService from '../../services/dividend.service';

const Dividends = () => {
  const { saccoId } = useParams();
  const { isAdmin, isTreasurer } = useAuth();
  const navigate = useNavigate();
  
  const [dividends, setDividends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [declareDividendModal, setDeclareDividendModal] = useState(false);
  
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    total_amount: '',
    declaration_date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const isAdminOrTreasurer = isAdmin(saccoId) || isTreasurer(saccoId);
  
  useEffect(() => {
    const fetchDividends = async () => {
      setLoading(true);
      try {
        const data = await dividendService.getSaccoDividends(saccoId);
        setDividends(data);
      } catch (err) {
        console.error('Failed to fetch dividends:', err);
        setError('Failed to load dividends');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDividends();
  }, [saccoId]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleDeclareSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Prepare dividend data
      const dividendData = {
        ...formData,
        year: parseInt(formData.year),
        total_amount: parseFloat(formData.total_amount),
        sacco: saccoId
      };
      
      // Create dividend
      const newDividend = await dividendService.declareDividend(saccoId, dividendData);
      
      // Reset form
      setFormData({
        year: new Date().getFullYear(),
        total_amount: '',
        declaration_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      
      // Refresh dividends
      const updatedDividends = await dividendService.getSaccoDividends(saccoId);
      setDividends(updatedDividends);
      
      setMessage('Dividend declared successfully');
      setDeclareDividendModal(false);
    } catch (err) {
      setError('Failed to declare dividend');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDistributeDividend = async (dividendId) => {
    setLoading(true);
    
    try {
      await dividendService.distributeDividend(saccoId, dividendId);
      
      // Refresh dividends
      const updatedDividends = await dividendService.getSaccoDividends(saccoId);
      setDividends(updatedDividends);
      
      setMessage('Dividend distributed successfully');
    } catch (err) {
      setError('Failed to distribute dividend');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Check if user has permission to view dividends
  if (!isAdminOrTreasurer) {
    return (
      <div className="py-6">
        <Alert type="error" message="You don't have permission to view this page" />
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dividends</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setDeclareDividendModal(true)}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Declare Dividend
          </button>
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
      
      <Card>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        ) : dividends.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900">No dividends declared yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Start by declaring a new dividend.
            </p>
          </div>
        ) : (
          <DataTable
            columns={[
              { 
                header: 'Year', 
                field: 'year'
              },
              { 
                header: 'Total Amount', 
                field: 'total_amount', 
                render: row => `${row.total_amount.toLocaleString()}` 
              },
              { 
                header: 'Declaration Date', 
                field: 'declaration_date',
                render: row => new Date(row.declaration_date).toLocaleDateString()
              },
              { 
                header: 'Payment Date', 
                field: 'payment_date',
                render: row => row.payment_date ? new Date(row.payment_date).toLocaleDateString() : 'Not paid'
              },
              { 
                header: 'Status', 
                field: 'member_dividends',
                render: row => {
                  if (row.member_dividends && row.member_dividends.length > 0) {
                    return (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Distributed
                      </span>
                    );
                  } else {
                    return (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        Not Distributed
                      </span>
                    );
                  }
                }
              }
            ]}
            data={dividends}
            pagination={true}
            pageSize={10}
            actions={row => {
              // Show distribute button only for dividends that haven't been distributed
              if (!row.member_dividends || row.member_dividends.length === 0) {
                return (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDistributeDividend(row.id);
                    }}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium hover:bg-green-200"
                  >
                    Distribute
                  </button>
                );
              }
              
              return (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/saccos/${saccoId}/dividends/${row.id}/member-dividends`);
                  }}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium hover:bg-blue-200"
                >
                  View Distributions
                </button>
              );
            }}
            onRowClick={row => navigate(`/saccos/${saccoId}/dividends/${row.id}/member-dividends`)}
          />
        )}
      </Card>
      
      {/* Declare Dividend Modal */}
      <Modal
        isOpen={declareDividendModal}
        onClose={() => setDeclareDividendModal(false)}
        title="Declare Dividend"
      >
        <form onSubmit={handleDeclareSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                Year *
              </label>
              <input
                type="number"
                name="year"
                id="year"
                required
                min={2000}
                max={2100}
                value={formData.year}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="total_amount" className="block text-sm font-medium text-gray-700">
                Total Dividend Amount *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="total_amount"
                  id="total_amount"
                  required
                  min="0"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={handleChange}
                  className="block w-full pl-7 pr-12 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="declaration_date" className="block text-sm font-medium text-gray-700">
                Declaration Date *
              </label>
              <input
                type="date"
                name="declaration_date"
                id="declaration_date"
                required
                value={formData.declaration_date}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                placeholder="Additional information about this dividend declaration"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setDeclareDividendModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Declaring...' : 'Declare Dividend'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dividends;