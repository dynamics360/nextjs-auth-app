'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Create context
const AuthContext = createContext(undefined);

// API base URL
const API_URL = 'http://localhost:5000/api';

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resetData, setResetData] = useState(null);
  const router = useRouter();
  const initialCheckDone = useRef(false);

  // Check if user is logged in
  useEffect(() => {
    // Prevent multiple checks
    if (initialCheckDone.current) return;
    
    const checkUserLoggedIn = async () => {
      try {
        // Set axios defaults for credentials
        axios.defaults.withCredentials = true;
        
        // Check if we have a token in localStorage
        const token = localStorage.getItem('token');
        
        // If no token, don't even try to make the request
        if (!token) {
          console.log('No token found in localStorage, user is not logged in');
          setUser(null);
          setLoading(false);
          initialCheckDone.current = true;
          return;
        }
        
        // If we have a token, set it in the headers
        const headers = {
          'Authorization': `Bearer ${token}`
        };
        
        console.log('Checking if user is logged in with token');
        const res = await axios.get(`${API_URL}/auth/me`, { 
          withCredentials: true,
          headers
        });
        
        console.log('User data response:', res.data);
        setUser(res.data.data);
        setLoading(false);
      } catch (error) {
        // 401 errors are expected when not logged in, so don't log them as errors
        if (error.response && error.response.status === 401) {
          console.log('User is not authenticated (401 response)');
        } else {
          console.error('Error checking user logged in:', error);
        }
        
        // Clear any stored token if we get an authentication error
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          localStorage.removeItem('token');
        }
        
        setUser(null);
        setLoading(false);
      } finally {
        initialCheckDone.current = true;
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
      setError(null); // Clear any previous errors
      console.log(`Attempting to login with API URL: ${API_URL}/auth/login`);
      
      // Set axios defaults for credentials
      axios.defaults.withCredentials = true;
      
      const res = await axios.post(
        `${API_URL}/auth/login`,
        { email, password },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      console.log('Login response:', res.data);
      
      // Store the token in localStorage as a fallback
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      
      setUser(res.data.user);
      setLoading(false);
      router.push('/');
    } catch (error) {
      // Handle authentication errors more gracefully
      if (error.response && error.response.status === 401) {
        console.log('Login failed: Invalid credentials');
        setError('The email or password you entered is incorrect. Please try again.');
      } else if (error.message === 'Network Error') {
        console.error('Login error: Network Error');
        setError('Cannot connect to the server. Please check if the server is running.');
      } else if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log('Login error response:', error.response.data);
        setError(error.response.data?.message || `Login failed. Please try again.`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Login error: No response received', error.request);
        setError('No response received from server. Please try again later.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Login error:', error.message);
        setError(error.message || 'An unexpected error occurred during login.');
      }
      
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

  // Check if user exists and prepare for password reset
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      // First, check if the user exists by email
      const response = await axios.post(`${API_URL}/auth/check-user`, { email });
      
      // If user exists, prepare for password reset
      if (response.data.exists) {
        // Generate a timestamp to use as a simple token
        const timestamp = Date.now().toString();
        const token = btoa(email + '-' + timestamp);
        
        // Store the email in the context state
        setResetData({
          email,
          token,
          timestamp
        });
        
        setLoading(false);
        
        // Return the token for redirection
        return { success: true, token, email };
      } else {
        setLoading(false);
        throw new Error('No account found with that email address');
      }
    } catch (error) {
      setLoading(false);
      
      if (error.response && error.response.status === 404) {
        const errorMsg = 'User verification endpoint not found. Please check API configuration.';
        setError(errorMsg);
        throw new Error(errorMsg);
      } else {
        const errorMsg = error.message || error.response?.data?.message || 'User not found';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    }
  };

  // Set reset data from URL parameters
  const setResetDataFromParams = (token, emailParam) => {
    try {
      if (token && emailParam) {
        // Only update if the data is different
        const decodedEmail = atob(emailParam);
        
        // Check if we already have this data
        if (resetData && 
            resetData.token === token && 
            resetData.email === decodedEmail) {
          // Data is already set, no need to update
          return true;
        }
        
        // Update the reset data
        setResetData({
          token,
          email: decodedEmail,
          timestamp: Date.now().toString()
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error in setResetDataFromParams:', error);
      return false;
    }
  };

  // Reset password
  const resetPassword = async (token, password, email) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!email) {
        setLoading(false);
        throw new Error('Missing email for password reset');
      }
      
      console.log('Resetting password for email:', email);
      
      // Use the email to reset the password directly
      const response = await axios.post(`${API_URL}/auth/direct-reset-password`, { 
        email: email,
        password 
      });
      
      console.log('Password reset response:', response.data);
      
      // Clear any reset data
      setResetData(null);
      
      setLoading(false);
      
      return response.data;
    } catch (error) {
      console.error('Error in resetPassword:', error);
      setLoading(false);
      
      if (error.response && error.response.status === 404) {
        const errorMsg = 'Password reset endpoint not found. Please check API configuration.';
        setError(errorMsg);
        throw new Error(errorMsg);
      } else {
        const errorMsg = error.response?.data?.message || error.message || 'Error resetting password';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
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
        resetData,
        register,
        login,
        logout,
        forgotPassword,
        resetPassword,
        setResetDataFromParams,
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