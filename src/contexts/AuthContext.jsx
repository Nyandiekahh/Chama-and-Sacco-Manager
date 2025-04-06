// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already logged in
    const checkLoggedIn = async () => {
      setLoading(true);
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error("Auth check failed:", err);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);
  
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      setCurrentUser(response.user);
      return response;
    } catch (err) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      setCurrentUser(response.user);
      return response;
    } catch (err) {
      setError(err.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    navigate('/login');
  };
  
  const isAdmin = (saccoId) => {
    if (!currentUser || !currentUser.memberships) return false;
    
    const membership = currentUser.memberships.find(m => 
      m.sacco.id === saccoId && m.role.name === 'ADMIN'
    );
    
    return !!membership;
  };
  
  const isTreasurer = (saccoId) => {
    if (!currentUser || !currentUser.memberships) return false;
    
    const membership = currentUser.memberships.find(m => 
      m.sacco.id === saccoId && m.role.name === 'TREASURER'
    );
    
    return !!membership;
  };
  
  const isSecretary = (saccoId) => {
    if (!currentUser || !currentUser.memberships) return false;
    
    const membership = currentUser.memberships.find(m => 
      m.sacco.id === saccoId && m.role.name === 'SECRETARY'
    );
    
    return !!membership;
  };
  
  const hasRole = (saccoId, roleName) => {
    if (!currentUser || !currentUser.memberships) return false;
    
    const membership = currentUser.memberships.find(m => 
      m.sacco.id === saccoId && m.role.name === roleName
    );
    
    return !!membership;
  };
  
  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    isAdmin,
    isTreasurer,
    isSecretary,
    hasRole
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};