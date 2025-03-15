'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import FormInput from '@/components/FormInput';
import Button from '@/components/Button';

// Define validation schema
const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

// Helper function to safely decode base64
const safeAtob = (str) => {
  try {
    return atob(str);
  } catch (e) {
    console.error('Error decoding base64:', e);
    return null;
  }
};

export default function ResetPasswordPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = params.token;
  const emailParam = searchParams.get('email');
  
  const { resetPassword, error, loading, clearError } = useAuth();
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenCheckLoading, setTokenCheckLoading] = useState(true);
  const [localError, setLocalError] = useState(null);
  const [email, setEmail] = useState('');
  
  // Use refs to prevent infinite loops
  const setupComplete = useRef(false);
  const resetAttempted = useRef(false);
  
  // Verify token and decode email - simplified to avoid state updates that cause re-renders
  useEffect(() => {
    if (setupComplete.current) return;
    
    const verifyToken = () => {
      try {
        console.log('Verifying token and email param');
        
        if (!token) {
          console.error('No token provided');
          setTokenValid(false);
          setLocalError('Invalid reset token. Please request a new password reset.');
          setTokenCheckLoading(false);
          return;
        }
        
        if (!emailParam) {
          console.error('No email parameter provided');
          setTokenValid(false);
          setLocalError('Missing email parameter. Please request a new password reset.');
          setTokenCheckLoading(false);
          return;
        }
        
        // Try to decode the email parameter
        const decodedEmail = safeAtob(emailParam);
        if (!decodedEmail) {
          console.error('Failed to decode email parameter');
          setTokenValid(false);
          setLocalError('Invalid email format. Please request a new password reset.');
          setTokenCheckLoading(false);
          return;
        }
        
        console.log('Decoded email:', decodedEmail);
        
        // Store the email locally without using context state
        setEmail(decodedEmail);
        setTokenValid(true);
        setTokenCheckLoading(false);
        
        // Mark setup as complete
        setupComplete.current = true;
      } catch (error) {
        console.error('Error verifying token:', error);
        setTokenValid(false);
        setLocalError('Error verifying reset token. Please request a new password reset.');
        setTokenCheckLoading(false);
      }
    };
    
    verifyToken();
  }, [token, emailParam]);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(resetPasswordSchema)
  });

  const onSubmit = async (data) => {
    // Prevent multiple submission attempts
    if (resetAttempted.current) return;
    resetAttempted.current = true;
    
    try {
      setLocalError(null);
      clearError();
      
      // Make sure we have the email
      if (!email) {
        setLocalError('Missing email for password reset. Please request a new password reset.');
        resetAttempted.current = false;
        return;
      }
      
      console.log('Submitting password reset with email:', email);
      
      // Reset the password using the token, password, and email
      await resetPassword(token, data.password, email);
      setResetSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      console.error('Error resetting password:', err);
      resetAttempted.current = false;
      
      if (err.message && err.message.includes('not found')) {
        setLocalError('The password reset service is currently unavailable. Please try again later.');
      } else if (err.message && err.message.includes('Invalid or expired')) {
        setLocalError('Invalid or expired reset token. Please request a new password reset.');
      } else if (err.message && err.message.includes('Missing email')) {
        setLocalError('Missing email for password reset. Please request a new password reset.');
      } else {
        setLocalError(err.message || err.response?.data?.message || 'Error resetting password. Please try again.');
      }
    }
  };

  if (tokenCheckLoading) {
    return (
      <div className="max-w-md mx-auto">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-3">Verifying reset token...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{localError || 'Invalid or expired password reset token. Please request a new password reset.'}</p>
        </div>
        <div className="text-center mt-4">
          <Link href="/login" className="text-blue-500 hover:text-blue-700">
            Return to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Reset Your Password</h1>

      {(error || localError) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{localError || error}</p>
        </div>
      )}

      {resetSuccess ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>Your password has been reset successfully! You will be redirected to the login page.</p>
          <p className="mt-2">
            <Link href="/login" className="text-blue-500 hover:text-blue-700">
              Go to Login
            </Link>
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormInput
              label="New Password"
              type="password"
              id="password"
              placeholder="Enter your new password"
              error={errors.password?.message}
              {...register('password')}
            />

            <FormInput
              label="Confirm New Password"
              type="password"
              id="confirmPassword"
              placeholder="Confirm your new password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <div className="flex flex-col gap-4 mt-6">
              <Button type="submit" isLoading={loading} fullWidth>
                Reset Password
              </Button>

              <p className="text-center text-gray-600 text-sm">
                Remember your password?{' '}
                <Link href="/login" className="text-blue-500 hover:text-blue-700">
                  Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 