'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import FormInput from '@/components/FormInput';
import Button from '@/components/Button';

// Define validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export default function LoginPage() {
  const { login, error, loading, clearError } = useAuth();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    clearError();
    await login(data.email, data.password);
  };

  const handleForgotPassword = async () => {
    try {
      clearError();
      await fetch('http://localhost:5000/api/auth/forgotpassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: forgotPasswordEmail })
      });
      setForgotPasswordSuccess(true);
    } catch (error) {
      console.error('Error sending reset email:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Login to Your Account</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
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
              <p>If an account with that email exists, we've sent password reset instructions.</p>
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
                Enter your email address and we'll send you instructions to reset your password.
              </p>

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
                  isLoading={loading}
                  fullWidth
                >
                  Send Reset Instructions
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