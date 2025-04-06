import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSacco } from '../../contexts/SaccoContext';
import Card from '../common/Card';
import DataTable from '../common/DataTable';
import contributionService from '../../services/contribution.service';
import loanService from '../../services/loan.service';
import memberService from '../../services/member.service';

const UserDashboard = () => {
  const { currentUser } = useAuth();
  const { currentSacco, saccos } = useSacco();
  const [userContributions, setUserContributions] = useState([]);
  const [userLoans, setUserLoans] = useState([]);
  const [membershipDetails, setMembershipDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentSacco || !currentUser) return;
      
      setLoading(true);
      try {
        // Get user's membership in this Sacco
        const membership = await memberService.getUserMembership(currentSacco.id, currentUser.id);
        setMembershipDetails(membership);
        
        // Get user's contributions
        const contributions = await contributionService.getUserContributions(currentSacco.id, currentUser.id);
        setUserContributions(contributions);
        
        // Get user's loans
        const loans = await loanService.getUserLoans(currentSacco.id, currentUser.id);
        setUserLoans(loans);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentSacco, currentUser]);
  
  if (!currentSacco) {
    return (
      <div className="py-6">
        <Card>
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900">Welcome to the Sacco Management System</h3>
            <p className="mt-2 text-sm text-gray-500">
              {saccos.length === 0 ? (
                <>
                  You don't have any Saccos yet. 
                  <Link to="/saccos/create" className="ml-1 text-blue-600 hover:text-blue-500">
                    Create your first Sacco
                  </Link> or join an existing one.
                </>
              ) : (
                <>
                  Please select a Sacco from the dropdown in the header to view your details.
                </>
              )}
            </p>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Dashboard</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Membership Details */}
        <Card title="Membership Details">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            </div>
          ) : membershipDetails ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Member Since</p>
                  <p className="mt-1 text-lg text-gray-900">
                    {new Date(membershipDetails.joined_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <p className="mt-1 text-lg text-gray-900">
                    {membershipDetails.role_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="mt-1 text-lg text-gray-900">
                    {membershipDetails.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Share Capital Timeline</p>
                  <p className="mt-1 text-lg text-gray-900">
                    {membershipDetails.share_capital_timeline_months} months
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No membership details found.</p>
          )}
        </Card>
        
        {/* Recent Contributions */}
        <Card title="Your Contributions">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          ) : (
            <DataTable
              columns={[
                { header: 'Date', field: 'contribution_date', render: row => new Date(row.contribution_date).toLocaleDateString() },
                { header: 'Type', field: 'contribution_type' },
                { header: 'Amount', field: 'amount', render: row => `$${row.amount.toLocaleString()}` },
                { header: 'Transaction Code', field: 'transaction_code' }
              ]}
              data={userContributions}
              pagination={true}
              pageSize={5}
            />
          )}
          <div className="mt-4 text-right">
            <Link
              to={`/saccos/${currentSacco.id}/contributions`}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all contributions →
            </Link>
          </div>
        </Card>
        
        {/* Loans */}
        <Card title="Your Loans">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          ) : (
            <DataTable
              columns={[
                { header: 'Application Date', field: 'application_date', render: row => new Date(row.application_date).toLocaleDateString() },
                { header: 'Amount', field: 'amount', render: row => `$${row.amount.toLocaleString()}` },
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
              data={userLoans}
              pagination={true}
              pageSize={5}
              onRowClick={row => window.location.href = `/saccos/${currentSacco.id}/loans/${row.id}`}
            />
          )}
          <div className="mt-4 text-right">
            <Link
              to={`/saccos/${currentSacco.id}/loans`}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all loans →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;