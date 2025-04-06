// src/components/common/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSacco } from '../../contexts/SaccoContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { currentUser, isAdmin, isTreasurer } = useAuth();
  const { currentSacco } = useSacco();
  
  const navLinkClass = ({ isActive }) => 
    `flex items-center px-4 py-2 mt-2 text-gray-600 transition-colors duration-200 transform rounded-md ${
      isActive ? 'bg-blue-500 text-white' : 'hover:bg-blue-100'
    }`;
  
  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-md transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0 transition duration-300 ease-in-out`}>
        <div className="flex items-center justify-center mt-8">
          <div className="flex items-center">
            <span className="text-xl font-semibold text-gray-800">Sacco Manager</span>
          </div>
        </div>
        
        <nav className="mt-10 px-4">
          {/* Dashboard */}
          <NavLink 
            to="/dashboard" 
            className={navLinkClass}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="mx-4">Dashboard</span>
          </NavLink>
          
          {/* Saccos */}
          <NavLink 
            to="/saccos" 
            className={navLinkClass}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8C17 10.7614 14.7614 13 12 13C9.23858 13 7 10.7614 7 8ZM12 11C13.6569 11 15 9.65685 15 8C15 6.34315 13.6569 5 12 5C10.3431 5 9 6.34315 9 8C9 9.65685 10.3431 11 12 11Z" fill="currentColor" />
              <path d="M6.34315 16.3431C4.84285 17.8434 4 19.8783 4 22H6C6 20.4087 6.63214 18.8826 7.75736 17.7574C8.88258 16.6321 10.4087 16 12 16C13.5913 16 15.1174 16.6321 16.2426 17.7574C17.3679 18.8826 18 20.4087 18 22H20C20 19.8783 19.1571 17.8434 17.6569 16.3431C16.1566 14.8429 14.1217 14 12 14C9.87827 14 7.84344 14.8429 6.34315 16.3431Z" fill="currentColor" />
            </svg>
            <span className="mx-4">My Saccos</span>
          </NavLink>
          
          {currentSacco && (
            <>
              {/* Members */}
              <NavLink 
                to={`/saccos/${currentSacco.id}/members`} 
                className={navLinkClass}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4.354C12 4.354 7 4.354 7 9.354C7 12.18 8.5 13.5 10 14.354C11.5 15.208 12 16.854 12 16.854M12 4.354C12 4.354 17 4.354 17 9.354C17 12.18 15.5 13.5 14 14.354C12.5 15.208 12 16.854 12 16.854M12 16.854V20.354" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 20.354C17 18.14 14.761 16.354 12 16.354C9.239 16.354 7 18.14 7 20.354" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="mx-4">Members</span>
              </NavLink>
              
              {(isAdmin(currentSacco.id) || isTreasurer(currentSacco.id)) && (
                <NavLink 
                  to={`/saccos/${currentSacco.id}/join-requests`} 
                  className={navLinkClass}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 3V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="mx-4">Join Requests</span>
                </NavLink>
              )}
              
              {/* Contributions */}
              <NavLink 
                to={`/saccos/${currentSacco.id}/contributions`} 
                className={navLinkClass}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 6V12M12 12V18M12 12H18M12 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="mx-4">Contributions</span>
              </NavLink>
              
              {/* Loans */}
              <NavLink 
                to={`/saccos/${currentSacco.id}/loans`} 
                className={navLinkClass}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8C12 8 12 5 17 5C22 5 22 8 22 8V16C22 16 22 19 17 19C12 19 12 16 12 16M12 8C12 8 12 5 7 5C2 5 2 8 2 8V16C2 16 2 19 7 19C12 19 12 16 12 16M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="mx-4">Loans</span>
              </NavLink>
              
              {/* Debts */}
              <NavLink 
                to={`/saccos/${currentSacco.id}/debts`} 
                className={navLinkClass}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 9V7C17 5.89543 16.1046 5 15 5H5C3.89543 5 3 5.89543 3 7V13C3 14.1046 3.89543 15 5 15H7M9 19H19C20.1046 19 21 18.1046 21 17V11C21 9.89543 20.1046 9 19 9H9C7.89543 9 7 9.89543 7 11V17C7 18.1046 7.89543 19 9 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="mx-4">Debts</span>
              </NavLink>
              
              {/* Dividends (only for admins and treasurers) */}
              {(isAdmin(currentSacco.id) || isTreasurer(currentSacco.id)) && (
                <NavLink 
                  to={`/saccos/${currentSacco.id}/dividends`} 
                  className={navLinkClass}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.68387 8.68394L15.316 15.3161M8.68387 15.3161L15.316 8.68394M2.00024 12C2.00024 6.47715 6.47716 2 12 2C17.5229 2 22.0002 6.47715 22.0002 12C22.0002 17.5228 17.5229 22 12 22C6.47716 22 2.00024 17.5228 2.00024 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="mx-4">Dividends</span>
                </NavLink>
              )}
              
              {/* Transactions */}
              <NavLink 
                to={`/saccos/${currentSacco.id}/transactions`} 
                className={navLinkClass}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5H7C4.79086 5 3 6.79086 3 9V15C3 17.2091 4.79086 19 7 19H17C19.2091 19 21 17.2091 21 15V9C21 6.79086 19.2091 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span className="mx-4">Transactions</span>
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;