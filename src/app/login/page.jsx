'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import FormInput from '@/components/FormInput';
import Button from '@/components/Button';
import axios from 'axios';

// Define validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export default function LoginPage() {
  const router = useRouter();
  const { login, error, loading, clearError, forgotPassword: authForgotPassword } = useAuth();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState(null);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const loginAttempted = useRef(false);
  const forgotPasswordAttempted = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    // Prevent multiple submission attempts
    if (loginAttempted.current) return;
    loginAttempted.current = true;
    
    try {
      clearError();
      console.log('Submitting login form with data:', { email: data.email, passwordLength: data.password.length });
      await login(data.email, data.password);
    } catch (err) {
      console.error('Error in login form submission:', err);
      // The error is already handled in the login function in AuthContext
    } finally {
      // Allow another login attempt after a short delay
      setTimeout(() => {
        loginAttempted.current = false;
      }, 1000);
    }
  };

  const handleForgotPassword = async () => {
    // Prevent multiple submission attempts
    if (forgotPasswordAttempted.current) return;
    forgotPasswordAttempted.current = true;
    
    try {
      if (!forgotPasswordEmail) {
        setForgotPasswordError('Please enter your email address');
        forgotPasswordAttempted.current = false;
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotPasswordEmail)) {
        setForgotPasswordError('Please enter a valid email address');
        forgotPasswordAttempted.current = false;
        return;
      }

      setForgotPasswordError(null);
      setForgotPasswordLoading(true);
      clearError();
      
      console.log('Checking user with email:', forgotPasswordEmail);
      
      // Check if user exists
      const response = await axios.post('http://localhost:5000/api/auth/check-user', { 
        email: forgotPasswordEmail 
      });
      
      console.log('User check response:', response.data);
      
      if (response.data.exists) {
        // Generate a simple token
        const timestamp = Date.now().toString();
        const token = btoa(forgotPasswordEmail + '-' + timestamp);
        
        // Redirect to reset password page with the token and email
        const encodedEmail = btoa(forgotPasswordEmail);
        console.log('Redirecting to reset password page with token:', token);
        router.push(`/reset-password/${token}?email=${encodedEmail}`);
      } else {
        // Show success message even if user doesn't exist (for security)
        setForgotPasswordSuccess(true);
      }
      
      setForgotPasswordLoading(false);
    } catch (error) {
      console.error('Error checking user:', error);
      
      // Show generic error message
      setForgotPasswordError('An error occurred. Please try again later.');
      setForgotPasswordLoading(false);
    } finally {
      forgotPasswordAttempted.current = false;
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Login to Your Account</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-medium">{error}</p>
          {error.includes('incorrect') && (
            <p className="text-sm mt-1">
              Make sure you're using the correct email and password. If you've forgotten your password, 
              use the "Forgot Password?" link below.
            </p>
          )}
        </div>
      )}

      {!showForgotPassword ? (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormInput
              label="Email"
              type="email"
              id="email"
              placeholder="Enter your email"
              error={errors.email?.message}
              {...register('email')}
            />

            <FormInput
              label="Password"
              type="password"
              id="password"
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                className="text-sm text-blue-500 hover:text-blue-700"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot Password?
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <Button type="submit" isLoading={loading} fullWidth>
                Login
              </Button>

              <p className="text-center text-gray-600 text-sm">
                Don't have an account?{' '}
                <Link href="/register" className="text-blue-500 hover:text-blue-700">
                  Register
                </Link>
              </p>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-xl font-semibold mb-4">Reset Your Password</h2>

          {forgotPasswordSuccess ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p>If an account with that email exists, you will be redirected to reset your password.</p>
              <p className="mt-2">
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordSuccess(false);
                  }}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Return to login
                </button>
              </p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-gray-600">
                Enter your email address to reset your password. If your account exists, you'll be redirected to the password reset page.
              </p>

              {forgotPasswordError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <p>{forgotPasswordError}</p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reset-email">
                  Email
                </label>
                <input
                  className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="reset-email"
                  type="email"
                  placeholder="Enter your email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-4">
                <Button
                  type="button"
                  onClick={handleForgotPassword}
                  isLoading={forgotPasswordLoading}
                  fullWidth
                >
                  Verify & Reset Password
                </Button>

                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-center text-gray-600 text-sm hover:text-gray-800"
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
} 