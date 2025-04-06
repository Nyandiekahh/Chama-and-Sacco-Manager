// src/components/dashboard/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSacco } from '../../contexts/SaccoContext';
import Card from '../common/Card';
import StatCard from './StatCard';
import FinancialOverview from './FinancialOverview';
import saccoService from '../../services/sacco.service';

const AdminDashboard = () => {
  const { currentUser, isAdmin } = useAuth();
  const { currentSacco, saccos } = useSacco();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchStats = async () => {
      if (!currentSacco) return;
      
      setLoading(true);
      try {
        const data = await saccoService.getSaccoStatistics(currentSacco.id);
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch statistics:', err);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [currentSacco]);
  
  // Redirect regular members to user dashboard
  useEffect(() => {
    if (currentSacco && currentUser && !isAdmin(currentSacco.id)) {
      navigate('/user-dashboard');
    }
  }, [currentSacco, currentUser, isAdmin, navigate]);
  
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
                  </Link>
                </>
              ) : (
                <>
                  Please select a Sacco from the dropdown in the header to view its dashboard.
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
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-5">Dashboard</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <Card>
            <div className="text-red-500">{error}</div>
          </Card>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Members"
              value={stats.total_members}
              icon={
                <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              linkTo={`/saccos/${currentSacco.id}/members`}
            />
            <StatCard
              title="Share Capital"
              value={`${stats.total_share_capital.toLocaleString()}`}
              icon={
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              linkTo={`/saccos/${currentSacco.id}/contributions?type=SHARE_CAPITAL`}
            />
            <StatCard
              title="Monthly Contributions"
              value={`${stats.total_monthly_contributions.toLocaleString()}`}
              icon={
                <svg className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              }
              linkTo={`/saccos/${currentSacco.id}/contributions?type=MONTHLY`}
            />
            <StatCard
              title="Active Loans"
              value={stats.total_active_loans}
              icon={
                <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              linkTo={`/saccos/${currentSacco.id}/loans`}
            />
          </div>
        ) : null}
      </div>
      
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Loans Overview">
            <div className="h-64">
              <FinancialOverview
                data={[
                  { name: 'Total Loans', value: stats.total_loan_amount },
                  { name: 'Repayments', value: stats.total_repayments },
                  { name: 'Outstanding', value: stats.outstanding_loans }
                ]}
              />
            </div>
          </Card>
          
          <Card title="Quick Actions">
            <div className="space-y-4">
              <Link
                to={`/saccos/${currentSacco.id}/members`}
                className="block w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Manage Members
              </Link>
              <Link
                to={`/saccos/${currentSacco.id}/contributions`}
                className="block w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Record Contributions
              </Link>
              <Link
                to={`/saccos/${currentSacco.id}/loans`}
                className="block w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Manage Loans
              </Link>
              <Link
                to={`/saccos/${currentSacco.id}/transactions`}
                className="block w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Transactions
              </Link>
              <Link
                to={`/saccos/${currentSacco.id}/join-requests`}
                className="block w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Pending Join Requests
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;