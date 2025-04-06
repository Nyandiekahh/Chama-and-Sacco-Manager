import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../common/Card';
import DataTable from '../common/DataTable';
import Alert from '../common/Alert';
import Modal from '../common/Modal';
import debtService from '../../services/debt.service';

const DebtDetail = () => {
  const { saccoId, debtId } = useParams();
  const { isAdmin, isTreasurer, currentUser } = useAuth();
  const [debt, setDebt] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [paymentModal, setPaymentModal] = useState(false);
  const [writeOffModal, setWriteOffModal] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    transaction_code: '',
    reference_number: '',
    notes: ''
  });
  
  const isAdminOrTreasurer = isAdmin(saccoId) || isTreasurer(saccoId);
  
  useEffect(() => {
    const fetchDebtDetails = async () => {
      setLoading(true);
      try {
        // Get debt details
        const debtData = await debtService.getDebtById(saccoId, debtId);
        setDebt(debtData);
        
        // Get debt payments
        const paymentsData = await debtService.getDebtPayments(debtId);
        setPayments(paymentsData);
        
        // Calculate total paid and remaining balance
        const totalPaid = paymentsData.reduce((sum, payment) => sum + payment.amount, 0);
        
        // Update debt with calculated values
        setDebt(prev => ({
          ...prev,
          totalPaid,
          remainingBalance: prev.amount - totalPaid
        }));
      } catch (err) {
        console.error('Failed to fetch debt details:', err);
        setError('Failed to load debt details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDebtDetails();
  }, [saccoId, debtId]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Prepare payment data
      const paymentData = {
        ...formData,
        amount: parseFloat(formData.amount),
        debt: debtId
      };
      
      // Add payment
      await debtService.addPayment(debtId, paymentData);
      
      // Reset form
      setFormData({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        transaction_code: '',
        reference_number: '',
        notes: ''
      });
      
      // Refresh data
      const updatedPayments = await debtService.getDebtPayments(debtId);
      setPayments(updatedPayments);
      
      const totalPaid = updatedPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      // Check if debt is fully paid
      const newStatus = totalPaid >= debt.amount ? 'PAID' : totalPaid > 0 ? 'PARTIALLY_PAID' : 'PENDING';
      
      // Update debt status if needed
      if (newStatus !== debt.status) {
        await debtService.updateDebtStatus(saccoId, debtId, newStatus);
      }
      
      setDebt(prev => ({
        ...prev,
        status: newStatus,
        totalPaid,
        remainingBalance: prev.amount - totalPaid
      }));
      
      setMessage('Payment added successfully');
      setPaymentModal(false);
    } catch (err) {
      setError('Failed to add payment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleWriteOff = async () => {
    setLoading(true);
    
    try {
      await debtService.updateDebtStatus(saccoId, debtId, 'WRITTEN_OFF');
      
      // Update debt status
      setDebt(prev => ({
        ...prev,
        status: 'WRITTEN_OFF'
      }));
      
      setMessage('Debt written off successfully');
      setWriteOffModal(false);
    } catch (err) {
      setError('Failed to write off debt');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Check if user is allowed to view this debt
  const canViewDebt = () => {
    if (!debt || !currentUser) return false;
    return isAdminOrTreasurer || currentUser.id === debt.member_id;
  };
  
  if (loading && !debt) {
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
  
  if (!debt) {
    return (
      <div className="py-6">
        <Alert type="error" message="Debt not found" />
      </div>
    );
  }
  
  if (!canViewDebt()) {
    return (
      <div className="py-6">
        <Alert type="error" message="You don't have permission to view this debt" />
      </div>
    );
  }
  
  const getStatusBadge = (status) => {
    const statusClasses = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PARTIALLY_PAID': 'bg-blue-100 text-blue-800',
      'PAID': 'bg-green-100 text-green-800',
      'WRITTEN_OFF': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-sm font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };
  
  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Debt Details {getStatusBadge(debt.status)}
        </h2>
        <div className="flex space-x-2">
          {debt.status !== 'PAID' && debt.status !== 'WRITTEN_OFF' && (
            <button
              onClick={() => setPaymentModal(true)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Add Payment
            </button>
          )}
          
          {isAdminOrTreasurer && debt.status !== 'PAID' && debt.status !== 'WRITTEN_OFF' && (
            <button
              onClick={() => setWriteOffModal(true)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Write Off Debt
            </button>
          )}
          
          <Link
            to={`/saccos/${saccoId}/debts`}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Debts
          </Link>
        </div>
      </div>
      
      {message && (
        <div className="mb-4">
          <Alert type="success" message={message} onClose={() => setMessage('')} />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card title="Debt Information">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Member</h4>
                <p className="mt-1 text-gray-900">{debt.member_email}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <p className="mt-1">{getStatusBadge(debt.status)}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Debt Amount</h4>
                <p className="mt-1 text-xl font-semibold text-gray-900">${debt.amount.toLocaleString()}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Created Date</h4>
                <p className="mt-1 text-gray-900">{new Date(debt.created_date).toLocaleDateString()}</p>
              </div>
              
              {debt.due_date && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Due Date</h4>
                  <p className="mt-1 text-gray-900">{new Date(debt.due_date).toLocaleDateString()}</p>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Recorded By</h4>
                <p className="mt-1 text-gray-900">{debt.recorded_by_email || 'Unknown'}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Description</h4>
              <p className="mt-1 text-gray-900">{debt.description}</p>
            </div>
          </div>
        </Card>
        
        <Card title="Payment Status">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Total Paid</h4>
                <p className="mt-1 text-xl font-semibold text-green-600">${debt.totalPaid?.toLocaleString() || '0.00'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Remaining Balance</h4>
                <p className="mt-1 text-xl font-semibold text-red-600">${debt.remainingBalance?.toLocaleString() || debt.amount.toLocaleString()}</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            {debt.status !== 'WRITTEN_OFF' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Payment Progress
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {Math.round((debt.totalPaid / debt.amount) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, Math.round((debt.totalPaid / debt.amount) * 100))}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {debt.status !== 'PAID' && debt.status !== 'WRITTEN_OFF' && (
              <div className="pt-4">
                <button
                  onClick={() => setPaymentModal(true)}
                  className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Add Payment
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      <Card title="Payment History">
        {payments.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900">No payments yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              {debt.status === 'WRITTEN_OFF' ? (
                'This debt has been written off.'
              ) : (
                'Start adding payments for this debt.'
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
            data={payments}
            pagination={true}
            pageSize={5}
          />
        )}
      </Card>
      
      {/* Add Payment Modal */}
      <Modal
        isOpen={paymentModal}
        onClose={() => setPaymentModal(false)}
        title="Add Debt Payment"
      >
        <form onSubmit={handleAddPayment}>
          <div className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Payment Amount *
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
              {debt.remainingBalance && (
                <p className="mt-1 text-sm text-gray-500">
                  Remaining balance: ${debt.remainingBalance.toLocaleString()}
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
              onClick={() => setPaymentModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Payment'}
            </button>
          </div>
        </form>
      </Modal>
      
      {/* Write Off Modal */}
      <Modal
        isOpen={writeOffModal}
        onClose={() => setWriteOffModal(false)}
        title="Write Off Debt"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Are you sure you want to write off this debt of ${debt.amount.toLocaleString()}?
          </p>
          <p className="text-sm text-gray-500">
            This action cannot be undone and the debt will be marked as written off.
          </p>
          
          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setWriteOffModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleWriteOff}
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Write Off Debt'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DebtDetail;