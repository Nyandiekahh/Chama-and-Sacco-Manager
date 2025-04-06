import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../common/Card';
import DataTable from '../common/DataTable';
import Alert from '../common/Alert';
import Modal from '../common/Modal';
import loanService from '../../services/loan.service';

const LoanDetail = () => {
  const { saccoId, loanId } = useParams();
  const { isAdmin, isTreasurer, currentUser } = useAuth();
  const [loan, setLoan] = useState(null);
  const [repayments, setRepayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [repaymentModal, setRepaymentModal] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [disburseModal, setDisburseModal] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    transaction_code: '',
    reference_number: '',
    notes: ''
  });
  
  const isAdminOrTreasurer = isAdmin(saccoId) || isTreasurer(saccoId);
  
  useEffect(() => {
    const fetchLoanDetails = async () => {
      setLoading(true);
      try {
        // Get loan details
        const loanData = await loanService.getLoanById(saccoId, loanId);
        setLoan(loanData);
        
        // Get loan repayments
        const repaymentsData = await loanService.getLoanRepayments(loanId);
        setRepayments(repaymentsData);
        
        // Calculate total paid and remaining balance
        const totalPaid = repaymentsData.reduce((sum, repayment) => sum + repayment.amount, 0);
        
        // Update loan with calculated values
        setLoan(prev => ({
          ...prev,
          totalPaid,
          remainingBalance: prev.amount - totalPaid
        }));
      } catch (err) {
        console.error('Failed to fetch loan details:', err);
        setError('Failed to load loan details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLoanDetails();
  }, [saccoId, loanId]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddRepayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Prepare repayment data
      const repaymentData = {
        ...formData,
        amount: parseFloat(formData.amount),
        loan: loanId
      };
      
      // Add repayment
      await loanService.addRepayment(loanId, repaymentData);
      
      // Reset form
      setFormData({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        transaction_code: '',
        reference_number: '',
        notes: ''
      });
      
      // Refresh data
      const updatedRepayments = await loanService.getLoanRepayments(loanId);
      setRepayments(updatedRepayments);
      
      const totalPaid = updatedRepayments.reduce((sum, repayment) => sum + repayment.amount, 0);
      setLoan(prev => ({
        ...prev,
        totalPaid,
        remainingBalance: prev.amount - totalPaid
      }));
      
      setMessage('Repayment added successfully');
      setRepaymentModal(false);
    } catch (err) {
      setError('Failed to add repayment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleApproveLoan = async () => {
    setLoading(true);
    
    try {
      await loanService.approveLoan(saccoId, loanId);
      
      // Update loan status
      setLoan(prev => ({
        ...prev,
        status: 'APPROVED',
        approval_date: new Date().toISOString()
      }));
      
      setMessage('Loan approved successfully');
      setApproveModal(false);
    } catch (err) {
      setError('Failed to approve loan');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDisburseLoan = async () => {
    setLoading(true);
    
    try {
      await loanService.disburseLoan(saccoId, loanId);
      
      // Update loan status
      setLoan(prev => ({
        ...prev,
        status: 'DISBURSED',
        disbursement_date: new Date().toISOString()
      }));
      
      setMessage('Loan disbursed successfully');
      setDisburseModal(false);
    } catch (err) {
      setError('Failed to disburse loan');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Check if user is allowed to view this loan
  const canViewLoan = () => {
    if (!loan || !currentUser) return false;
    return isAdminOrTreasurer || currentUser.id === loan.member_id;
  };
  
  if (loading && !loan) {
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
  
  if (!loan) {
    return (
      <div className="py-6">
        <Alert type="error" message="Loan not found" />
      </div>
    );
  }
  
  if (!canViewLoan()) {
    return (
      <div className="py-6">
        <Alert type="error" message="You don't have permission to view this loan" />
      </div>
    );
  }
  
  const getStatusBadge = (status) => {
    const statusClasses = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'DISBURSED': 'bg-blue-100 text-blue-800',
      'COMPLETED': 'bg-gray-100 text-gray-800',
      'DEFAULTED': 'bg-red-100 text-red-800',
      'REJECTED': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-sm font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };
  
  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Loan Details {getStatusBadge(loan.status)}
        </h2>
        <div className="flex space-x-2">
          {loan.status === 'DISBURSED' && (
            <button
              onClick={() => setRepaymentModal(true)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Add Repayment
            </button>
          )}
          
          {isAdminOrTreasurer && loan.status === 'PENDING' && (
            <button
              onClick={() => setApproveModal(true)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Approve Loan
            </button>
          )}
          
          {isAdminOrTreasurer && loan.status === 'APPROVED' && (
            <button
              onClick={() => setDisburseModal(true)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Disburse Loan
            </button>
          )}
          
          <Link
            to={`/saccos/${saccoId}/loans`}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Loans
          </Link>
        </div>
      </div>
      
      {message && (
        <div className="mb-4">
          <Alert type="success" message={message} onClose={() => setMessage('')} />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card title="Loan Information">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Borrower</h4>
                <p className="mt-1 text-gray-900">{loan.member_email}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <p className="mt-1">{getStatusBadge(loan.status)}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Loan Amount</h4>
                <p className="mt-1 text-xl font-semibold text-gray-900">${loan.amount.toLocaleString()}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Interest Rate</h4>
                <p className="mt-1 text-gray-900">{loan.interest_rate}% {loan.interest_period.toLowerCase()}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Calculated Interest</h4>
                <p className="mt-1 text-gray-900">${loan.calculated_interest?.toLocaleString() || '0.00'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Total to Repay</h4>
                <p className="mt-1 text-gray-900">${(loan.amount + (loan.calculated_interest || 0)).toLocaleString()}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Application Date</h4>
                <p className="mt-1 text-gray-900">{new Date(loan.application_date).toLocaleDateString()}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Due Date</h4>
                <p className="mt-1 text-gray-900">{new Date(loan.due_date).toLocaleDateString()}</p>
              </div>
              
              {loan.approval_date && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Approved Date</h4>
                  <p className="mt-1 text-gray-900">{new Date(loan.approval_date).toLocaleDateString()}</p>
                </div>
              )}
              
              {loan.disbursement_date && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Disbursement Date</h4>
                  <p className="mt-1 text-gray-900">{new Date(loan.disbursement_date).toLocaleDateString()}</p>
                </div>
              )}
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Purpose</h4>
              <p className="mt-1 text-gray-900">{loan.purpose}</p>
            </div>
          </div>
        </Card>
        
        <Card title="Repayment Status">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Total Paid</h4>
                <p className="mt-1 text-xl font-semibold text-green-600">${loan.totalPaid?.toLocaleString() || '0.00'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Remaining Balance</h4>
                <p className="mt-1 text-xl font-semibold text-red-600">${loan.remainingBalance?.toLocaleString() || loan.amount.toLocaleString()}</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            {loan.status === 'DISBURSED' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Repayment Progress
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {Math.round((loan.totalPaid / loan.amount) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, Math.round((loan.totalPaid / loan.amount) * 100))}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {loan.status === 'DISBURSED' && (
              <div className="pt-4">
                <button
                  onClick={() => setRepaymentModal(true)}
                  className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Add Repayment
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      <Card title="Repayment History">
        {repayments.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900">No repayments yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              {loan.status === 'DISBURSED' ? (
                'Start adding repayments for this loan.'
              ) : (
                'Repayments can be added once the loan is disbursed.'
              )}
            </p>
          </div>
        ) : (
          <DataTable
            columns={[
              { 
                header: 'Payment Date', 
                field: 'payment_date', 
                render: row => new Date(row.payment_date).toLocaleDateString() 
              },
              { 
                header: 'Amount', 
                field: 'amount', 
                render: row => `$${row.amount.toLocaleString()}` 
              },
              { header: 'Transaction Code', field: 'transaction_code' },
              { header: 'Reference Number', field: 'reference_number' },
              { 
                header: 'Recorded Date', 
                field: 'recorded_date', 
                render: row => new Date(row.recorded_date).toLocaleDateString() 
              }
            ]}
            data={repayments}
            pagination={true}
            pageSize={5}
          />
        )}
      </Card>
      
      {/* Add Repayment Modal */}
      <Modal
        isOpen={repaymentModal}
        onClose={() => setRepaymentModal(false)}
        title="Add Loan Repayment"
      >
        <form onSubmit={handleAddRepayment}>
          <div className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Repayment Amount *
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
              {loan.remainingBalance && (
                <p className="mt-1 text-sm text-gray-500">
                  Remaining balance: ${loan.remainingBalance.toLocaleString()}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700">
                Payment Date *
              </label>
              <input
                type="date"
                name="payment_date"
                id="payment_date"
                required
                value={formData.payment_date}
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
              onClick={() => setRepaymentModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Repayment'}
            </button>
          </div>
        </form>
      </Modal>
      
      {/* Approve Loan Modal */}
      <Modal
        isOpen={approveModal}
        onClose={() => setApproveModal(false)}
        title="Approve Loan"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Are you sure you want to approve this loan for ${loan.amount.toLocaleString()}?
          </p>
          
          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setApproveModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApproveLoan}
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Approve Loan'}
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Disburse Loan Modal */}
      <Modal
        isOpen={disburseModal}
        onClose={() => setDisburseModal(false)}
        title="Disburse Loan"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Are you sure you want to disburse this loan for ${loan.amount.toLocaleString()}?
          </p>
          <p className="text-sm text-gray-500">
            This action will mark the loan as disbursed and will create a transaction record.
          </p>
          
          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setDisburseModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDisburseLoan}
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Disburse Loan'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LoanDetail;