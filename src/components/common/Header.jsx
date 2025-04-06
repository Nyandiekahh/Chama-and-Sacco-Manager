// src/components/common/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSacco } from '../../contexts/SaccoContext';

const Header = ({ toggleSidebar }) => {
  const { currentUser, logout } = useAuth();
  const { saccos, currentSacco, selectSacco } = useSacco();
  
  const handleSaccoChange = (e) => {
    selectSacco(e.target.value);
  };
  
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <button
            className="text-gray-600 focus:outline-none lg:hidden"
            onClick={toggleSidebar}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
              <path
                fillRule="evenodd"
                d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
              ></path>
            </svg>
          </button>
          
          <Link to="/" className="ml-2 lg:ml-0 text-xl font-bold text-gray-800">
            Sacco Management
          </Link>
        </div>
        
        {saccos.length > 0 && (
          <div className="ml-4 hidden md:block">
            <select
              className="form-select rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              value={currentSacco?.id || ''}
              onChange={handleSaccoChange}
            >
              {saccos.map(sacco => (
                <option key={sacco.id} value={sacco.id}>
                  {sacco.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="flex items-center">
          <div className="relative">
            <button className="flex items-center text-gray-700 focus:outline-none">
              <span className="hidden md:inline-block mr-2">
                {currentUser?.first_name} {currentUser?.last_name}
              </span>
              <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                {currentUser?.first_name?.[0]}{currentUser?.last_name?.[0]}
              </div>
            </button>
            
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 hidden">
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Profile
              </Link>
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="ml-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;