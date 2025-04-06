// src/contexts/SaccoContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import saccoService from '../services/sacco.service';
import { useAuth } from './AuthContext';

const SaccoContext = createContext(null);

export const useSacco = () => useContext(SaccoContext);

export const SaccoProvider = ({ children }) => {
  const [saccos, setSaccos] = useState([]);
  const [currentSacco, setCurrentSacco] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Load user's saccos when user changes
  useEffect(() => {
    if (currentUser) {
      loadSaccos();
    } else {
      setSaccos([]);
      setCurrentSacco(null);
    }
  }, [currentUser]);
  
  const loadSaccos = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const data = await saccoService.getUserSaccos();
      setSaccos(data);
      
      // If no current sacco is selected and we have saccos, select the first one
      if (!currentSacco && data.length > 0) {
        setCurrentSacco(data[0]);
      }
    } catch (err) {
      setError(err.message || "Failed to load saccos");
      console.error("Failed to load saccos:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const selectSacco = (saccoId) => {
    const selected = saccos.find(sacco => sacco.id === saccoId);
    if (selected) {
      setCurrentSacco(selected);
      return true;
    }
    return false;
  };
  
  const createSacco = async (saccoData) => {
    setLoading(true);
    try {
      const newSacco = await saccoService.createSacco(saccoData);
      setSaccos(prev => [...prev, newSacco]);
      setCurrentSacco(newSacco);
      return newSacco;
    } catch (err) {
      setError(err.message || "Failed to create sacco");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const updateSacco = async (saccoId, saccoData) => {
    setLoading(true);
    try {
      const updated = await saccoService.updateSacco(saccoId, saccoData);
      setSaccos(prev => prev.map(sacco => 
        sacco.id === saccoId ? updated : sacco
      ));
      
      if (currentSacco && currentSacco.id === saccoId) {
        setCurrentSacco(updated);
      }
      
      return updated;
    } catch (err) {
      setError(err.message || "Failed to update sacco");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const value = {
    saccos,
    currentSacco,
    loading,
    error,
    loadSaccos,
    selectSacco,
    createSacco,
    updateSacco
  };
  
  return (
    <SaccoContext.Provider value={value}>
      {children}
    </SaccoContext.Provider>
  );
};