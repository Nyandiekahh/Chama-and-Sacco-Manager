// src/components/saccos/SaccoList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSacco } from '../../contexts/SaccoContext';
import Card from '../common/Card';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import Alert from '../common/Alert';
import saccoService from '../../services/sacco.service';

const SaccoList = () => {
  const { saccos, loadSaccos, selectSacco } = useSacco();
  const [loading, setLoading] = useState(false);
  const [joinSaccoModal, setJoinSaccoModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSacco, setSelectedSacco] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [joinMessage, setJoinMessage] = useState('');
  const navigate = useNavigate();
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const results = await saccoService.searchSaccos(searchQuery);
      setSearchResults(results);
    } catch (err) {
      setError('Failed to search for Saccos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectSacco = (sacco) => {
    setSelectedSacco(sacco);
  };
  
  const handleJoinRequest = async () => {
    if (!selectedSacco) return;
    
    setLoading(true);
    try {
      await saccoService.requestJoin(selectedSacco.id, joinMessage);
      setMessage('Join request sent successfully!');
      setJoinSaccoModal(false);
      setSelectedSacco(null);
      setJoinMessage('');
    } catch (err) {
      setError('Failed to send join request');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRowClick = (sacco) => {
    selectSacco(sacco.id);
    navigate(`/saccos/${sacco.id}`);
  };

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Saccos</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setJoinSaccoModal(true)}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Join Sacco
          </button>
          <Link
            to="/saccos/create"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Create Sacco
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
        <DataTable
          columns={[
            { header: 'Name', field: 'name' },
            { header: 'Description', field: 'description' },
            { header: 'Share Capital', field: 'share_capital_amount', render: row => `${row.share_capital_amount.toLocaleString()}` },
            { header: 'Monthly Contribution', field: 'monthly_contribution_amount', render: row => `${row.monthly_contribution_amount.toLocaleString()}` },
            { header: 'Created At', field: 'created_at', render: row => new Date(row.created_at).toLocaleDateString() }
          ]}
          data={saccos}
          onRowClick={handleRowClick}
          pagination={true}
          pageSize={10}
        />
      </Card>
      
      {/* Join Sacco Modal */}
      <Modal
        isOpen={joinSaccoModal}
        onClose={() => setJoinSaccoModal(false)}
        title="Join a Sacco"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search for a Sacco
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                name="search"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
                placeholder="Enter Sacco name"
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={loading}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Search
              </button>
            </div>
          </div>
          
          {searchResults.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Search Results
              </label>
              <div className="mt-1 border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admin
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {searchResults.map((sacco) => (
                      <tr 
                        key={sacco.id} 
                        className={selectedSacco?.id === sacco.id ? 'bg-blue-50' : 'hover:bg-gray-50'}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {sacco.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sacco.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sacco.admin_email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleSelectSacco(sacco)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {selectedSacco && (
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message (Optional)
              </label>
              <div className="mt-1">
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  value={joinMessage}
                  onChange={(e) => setJoinMessage(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Introduce yourself and explain why you want to join"
                />
              </div>
            </div>
          )}
          
          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setJoinSaccoModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleJoinRequest}
              disabled={!selectedSacco || loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Join Request'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SaccoList;