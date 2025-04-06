import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SaccoProvider } from './contexts/SaccoContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Layout Components
import MainLayout from './components/layout/MainLayout';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ResetPassword from './components/auth/ResetPassword';

// Dashboard Components
import AdminDashboard from './components/dashboard/AdminDashboard';
import UserDashboard from './components/dashboard/UserDashboard';

// Sacco Components
import SaccoList from './components/saccos/SaccoList';
import SaccoDetail from './components/saccos/SaccoDetail';
import CreateSacco from './components/saccos/CreateSacco';

// Member Components
import MemberList from './components/members/MemberList';
import MemberDetail from './components/members/MemberDetail';
import JoinRequests from './components/members/JoinRequests';

// Finance Components
import Contributions from './components/finance/Contributions';
import Loans from './components/finance/Loans';
import LoanDetail from './components/finance/LoanDetail';
import Debts from './components/finance/Debts';
import DebtDetail from './components/finance/DebtDetail';
import Dividends from './components/finance/Dividends';
import Transactions from './components/finance/Transactions';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <AuthProvider>
        <SaccoProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected Routes with MainLayout */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              {/* Dashboard Routes */}
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="user-dashboard" element={<UserDashboard />} />
              
              {/* Sacco Routes */}
              <Route path="saccos" element={<SaccoList />} />
              <Route path="saccos/create" element={<CreateSacco />} />
              <Route path="saccos/:saccoId" element={<SaccoDetail />} />
              
              {/* Member Routes */}
              <Route path="saccos/:saccoId/members" element={<MemberList />} />
              <Route path="saccos/:saccoId/members/:memberId" element={<MemberDetail />} />
              <Route path="saccos/:saccoId/join-requests" element={<JoinRequests />} />
              
              {/* Finance Routes */}
              <Route path="saccos/:saccoId/contributions" element={<Contributions />} />
              <Route path="saccos/:saccoId/loans" element={<Loans />} />
              <Route path="saccos/:saccoId/loans/:loanId" element={<LoanDetail />} />
              <Route path="saccos/:saccoId/debts" element={<Debts />} />
              <Route path="saccos/:saccoId/debts/:debtId" element={<DebtDetail />} />
              <Route path="saccos/:saccoId/dividends" element={<Dividends />} />
              <Route path="saccos/:saccoId/transactions" element={<Transactions />} />
            </Route>
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </SaccoProvider>
      </AuthProvider>
    </div>
  );
}

export default App;