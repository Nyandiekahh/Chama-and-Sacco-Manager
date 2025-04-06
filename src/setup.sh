#!/bin/bash

# Create directory structure
mkdir -p assets/images
mkdir -p components/common
mkdir -p components/dashboard
mkdir -p components/auth
mkdir -p components/saccos
mkdir -p components/members
mkdir -p components/finance
mkdir -p components/layout
mkdir -p contexts
mkdir -p services
mkdir -p utils

# Create common components
touch components/common/Header.jsx
touch components/common/Sidebar.jsx
touch components/common/Footer.jsx
touch components/common/ProtectedRoute.jsx
touch components/common/DataTable.jsx
touch components/common/Modal.jsx
touch components/common/Card.jsx
touch components/common/Alert.jsx

# Create layout components
touch components/layout/MainLayout.jsx

# Create dashboard components
touch components/dashboard/AdminDashboard.jsx
touch components/dashboard/UserDashboard.jsx
touch components/dashboard/StatCard.jsx
touch components/dashboard/FinancialOverview.jsx

# Create auth components
touch components/auth/Login.jsx
touch components/auth/Register.jsx
touch components/auth/ResetPassword.jsx

# Create saccos components
touch components/saccos/SaccoList.jsx
touch components/saccos/SaccoDetail.jsx
touch components/saccos/CreateSacco.jsx

# Create members components
touch components/members/MemberList.jsx
touch components/members/MemberDetail.jsx
touch components/members/JoinRequests.jsx

# Create finance components
touch components/finance/Contributions.jsx
touch components/finance/Loans.jsx
touch components/finance/LoanDetail.jsx
touch components/finance/Debts.jsx
touch components/finance/DebtDetail.jsx
touch components/finance/Dividends.jsx
touch components/finance/Transactions.jsx

# Create contexts
touch contexts/AuthContext.jsx
touch contexts/SaccoContext.jsx

# Create services
touch services/api.js
touch services/auth.service.js
touch services/sacco.service.js
touch services/member.service.js
touch services/contribution.service.js
touch services/loan.service.js
touch services/debt.service.js
touch services/dividend.service.js
touch services/transaction.service.js

# Create utils
touch utils/formatters.js
touch utils/validators.js

# Make sure App.jsx exists
touch App.jsx

echo "All directories and files created successfully!"
