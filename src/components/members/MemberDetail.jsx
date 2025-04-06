// src/components/members/MemberDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../common/Card';
import DataTable from '../common/DataTable';
import Alert from '../common/Alert';
import memberService from '../../services/member.service';
import contributionService from '../../services/contribution.service';
import loanService from '../../services/loan.service';

const MemberDetail = () => {
  const { saccoId, memberId } = useParams();
  const { currentUser, isAdmin } = useAuth();
  const [member, setMember] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalContributions, setTotalContributions] = useState({
    shareCapital: 0,
    monthly: 0
  });
  
  useEffect(() => {
    const fetchMemberDetails = async () => {
      setLoading(true);
      try {
        // Get member details
        const memberData = await memberService.getMemberById(saccoId, memberId);
        setMember(memberData);
        
        // Get member's contributions
        const contributionsData = await contributionService.getMemberContributions(saccoId, memberId);
        setContributions(contributionsData);
        
        // Calculate total contributions
        const shareCapitalTotal = contributionsData
          .filter(c => c.contribution_type === 'SHARE_CAPITAL')
          .reduce((sum, c) => sum + c.amount, 0);
          
        const monthlyTotal = contributionsData
          .filter(c => c.contribution_type === 'MONTHLY')
          .reduce((sum, c) => sum + c.amount, 0);
          
        setTotalContributions({
          shareCapital: shareCapitalTotal,
          monthly: monthlyTotal
        });
        
        // Get member's loans
        const loansData = await loanService.getMemberLoans(saccoId, memberId);
        setLoans(loansData);
      } catch (err) {
        console.error('Failed to fetch member details:', err);
        setError('Failed to load member details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMemberDetails();
  }, [saccoId, memberId]);
  
  if (loading) {
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
  
  if (!member) {
    return (
      <div className="py-6">
        <Alert type="error" message="Member not found" />
      </div>
    );
  }
  
  // Check if current user can view this member's details
  const canViewDetails = isAdmin(saccoId) || currentUser.id === member.user_details.id;
  
  if (!canViewDetails) {
    return (
      <div className="py-6">
        <Alert type="error" message="You don't have permission to view this member's details" />
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {member.user_details.first_name} {member.user_details.last_name}
        </h2>
        <Link
          to={`/saccos/${saccoId}/members`}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back to Members
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card title="Member Details">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Email</h4>
                <p className="mt-1 text-gray-900">{member.user_details.email}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                <p className="mt-1 text-gray-900">{member.user_details.phone_number || 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Role</h4>
                <p className="mt-1 text-gray-900">{member.role_name}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <p className="mt-1 text-gray-900">{member.status}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Joined Date</h4>
                <p className="mt-1 text-gray-900">{new Date(member.joined_date).toLocaleDateString()}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Share Capital Timeline</h4>
                <p className="mt-1 text-gray-900">{member.share_capital_timeline_months} months</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card title="Contribution Summary">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Total Share Capital</h4>
                <p className="mt-1 text-2xl font-semibold text-gray-900">${totalContributions.shareCapital.toLocaleString()}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Total Monthly Contributions</h4>
                <p className="mt-1 text-2xl font-semibold text-gray-900">${totalContributions.monthly.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="pt-2">
              <Link
                to={`/saccos/${saccoId}/contributions?memberId=${memberId}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View all contributions →
              </Link>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="space-y-6">
        <Card title="Recent Contributions">
          <DataTable
            columns={[
              { header: 'Date', field: 'contribution_date', render: row => new Date(row.contribution_date).toLocaleDateString() },
              { header: 'Type', field: 'contribution_type' },
              { header: 'Amount', field: 'amount', render: row => `${row.amount.toLocaleString()}` },
              { header: 'Transaction Code', field: 'transaction_code' },
              { header: 'Reference Number', field: 'reference_number' }
            ]}
            data={contributions.slice(0, 5)}
            pagination={false}
          />
        </Card>
        
        <Card title="Loans">
          <DataTable
            columns={[
              { header: 'Application Date', field: 'application_date', render: row => new Date(row.application_date).toLocaleDateString() },
              { header: 'Amount', field: 'amount', render: row => `${row.amount.toLocaleString()}` },
              { header: 'Interest Rate', field: 'interest_rate', render: row => `${row.interest_rate}%` },
              { header: 'Status', field: 'status', render: row => (
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                  row.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  row.status === 'DISBURSED' ? 'bg-blue-100 text-blue-800' :
                  row.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                  row.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {row.status}
                </span>
              )},
              { header: 'Due Date', field: 'due_date', render: row => new Date(row.due_date).toLocaleDateString() }
            ]}
            data={loans}
            pagination={true}
            pageSize={5}
            onRowClick={(row) => window.location.href = `/saccos/${saccoId}/loans/${row.id}`}
          />
        </Card>
      </div>
    </div>
  );
};

export default MemberDetail;