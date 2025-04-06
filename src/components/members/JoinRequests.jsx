import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../common/Card';
import DataTable from '../common/DataTable';
import Alert from '../common/Alert';
import Modal from '../common/Modal';
import memberService from '../../services/member.service';

const JoinRequests = () => {
  const { saccoId } = useParams();
  const { isAdmin } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [responseModal, setResponseModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  
  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin(saccoId)) {
      window.location.href = `/saccos/${saccoId}`;
      return;
    }
    
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const data = await memberService.getJoinRequests(saccoId);
        setRequests(data);
      } catch (err) {
        console.error('Failed to fetch join requests:', err);
        setError('Failed to load join requests');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, [saccoId, isAdmin]);
  
  const handleResponseClick = (request, approve) => {
    setSelectedRequest(request);
    setIsApproving(approve);
    setResponseMessage(approve ? 'Welcome to our Sacco!' : 'Sorry, your request has been declined.');
    setResponseModal(true);
  };
  
  const handleResponse = async () => {
    if (!selectedRequest) return;
    
    setLoading(true);
    try {
      if (isApproving) {
        await memberService.approveJoinRequest(saccoId, selectedRequest.id, responseMessage);
        setMessage(`Request from ${selectedRequest.user_email} has been approved.`);
      } else {
        await memberService.rejectJoinRequest(saccoId, selectedRequest.id, responseMessage);
        setMessage(`Request from ${selectedRequest.user_email} has been rejected.`);
      }
      
      // Update requests list
      setRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
      setResponseModal(false);
    } catch (err) {
      setError(`Failed to ${isApproving ? 'approve' : 'reject'} request`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Render status badge
  const renderStatus = (status) => {
    const statusClasses = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };
  
  // Render actions for request rows
  const renderActions = (request) => {
    if (request.status !== 'PENDING') return null;
    
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleResponseClick(request, true);
          }}
          className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium hover:bg-green-200"
        >
          Approve
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleResponseClick(request, false);
          }}
          className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-xs font-medium hover:bg-red-200"
        >
          Reject
        </button>
      </div>
    );
  };
  
  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Join Requests</h2>
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
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900">No pending join requests</h3>
            <p className="mt-2 text-sm text-gray-500">
              When someone requests to join your Sacco, they will appear here.
            </p>
          </div>
        ) : (
          <DataTable
            columns={[
              { header: 'User', field: 'user_email' },
              { header: 'Status', field: 'status', render: row => renderStatus(row.status) },
              { header: 'Request Date', field: 'request_date', render: row => new Date(row.request_date).toLocaleDateString() },
              { header: 'Message', field: 'message', render: row => row.message || 'No message provided' }
            ]}
            data={requests}
            pagination={true}
            pageSize={10}
            actions={renderActions}
          />
        )}
      </Card>
      
      {/* Response Modal */}
      <Modal
        isOpen={responseModal}
        onClose={() => setResponseModal(false)}
        title={isApproving ? 'Approve Join Request' : 'Reject Join Request'}
      >
        {selectedRequest && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              {isApproving ? 'Approve' : 'Reject'} request from <span className="font-medium">{selectedRequest.user_email}</span>
            </p>
            
            <div>
              <label htmlFor="response" className="block text-sm font-medium text-gray-700">
                Response Message
              </label>
              <textarea
                id="response"
                name="response"
                rows={3}
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Add a message to the user"
              />
            </div>
            
            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setResponseModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResponse}
                disabled={loading}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isApproving ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isApproving ? 'focus:ring-green-500' : 'focus:ring-red-500'
                } disabled:opacity-50`}
              >
                {loading ? (
                  'Processing...'
                ) : (
                  isApproving ? 'Approve Request' : 'Reject Request'
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default JoinRequests;