'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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

export default function ResetPasswordPage() {
  const params = useParams();
  const token = params.token;
  const { resetPassword, error, loading, clearError } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(resetPasswordSchema)
  });

  const onSubmit = async (data) => {
    clearError();
    await resetPassword(token, data.password);
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Reset Your Password</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

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
    </div>
  );
} 