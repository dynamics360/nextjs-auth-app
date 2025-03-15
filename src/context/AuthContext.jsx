'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Create context
const AuthContext = createContext(undefined);

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Check if user is logged in
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const res = await axios.get(`${API_URL}/auth/me`, { withCredentials: true });
        setUser(res.data.data);
        setLoading(false);
      } catch (error) {
        setUser(null);
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Register user
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/auth/register`,
        { name, email, password },
        { withCredentials: true }
      );
      setUser(res.data.user);
      setLoading(false);
      router.push('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Something went wrong');
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      setUser(res.data.user);
      setLoading(false);
      router.push('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid credentials');
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.get(`${API_URL}/auth/logout`, { withCredentials: true });
      setUser(null);
      router.push('/login');
    } catch (error) {
      setError(error.response?.data?.message || 'Error logging out');
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      await axios.post(`${API_URL}/auth/forgotpassword`, { email });
      setLoading(false);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Error processing request');
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (token, password) => {
    try {
      setLoading(true);
      await axios.put(`${API_URL}/auth/resetpassword/${token}`, { password });
      setLoading(false);
      router.push('/login');
    } catch (error) {
      setError(error.response?.data?.message || 'Error resetting password');
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        forgotPassword,
        resetPassword,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 