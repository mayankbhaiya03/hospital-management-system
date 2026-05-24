import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

/**
 * Maps the generic `entityId` from the backend AuthResponse to
 * role-specific properties (doctorId / patientId) so dashboard
 * components can reference them directly.
 */
const normalizeUser = (userData) => {
  if (!userData) return userData;
  const normalized = { ...userData };
  if (userData.entityId != null) {
    if (userData.role === 'DOCTOR') {
      normalized.doctorId = userData.entityId;
    } else if (userData.role === 'PATIENT') {
      normalized.patientId = userData.entityId;
    }
  }
  return normalized;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('hms_user');
    if (storedUser) {
      try {
        setUser(normalizeUser(JSON.parse(storedUser)));
      } catch (e) {
        localStorage.removeItem('hms_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await authAPI.login(username, password);
      const userData = normalizeUser(response.data);
      setUser(userData);
      localStorage.setItem('hms_user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      throw error.response?.data || error.message || 'Login failed';
    } finally {
      setLoading(false);
    }
  };

  const registerPatient = async (patientData) => {
    setLoading(true);
    try {
      const response = await authAPI.register(patientData);
      const userData = normalizeUser(response.data);
      setUser(userData);
      localStorage.setItem('hms_user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      throw error.response?.data || error.message || 'Registration failed';
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hms_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, registerPatient, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
