'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import FormInput from '@/components/FormInput';
import Button from '@/components/Button';

// Define validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

export default function RegisterPage() {
  const { register: registerUser, error, loading, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data) => {
    clearError();
    await registerUser(data.name, data.email, data.password);
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Create an Account</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormInput
            label="Name"
            type="text"
            id="name"
            placeholder="Enter your name"
            error={errors.name?.message}
            {...register('name')}
          />

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

          <FormInput
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            placeholder="Confirm your password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <div className="flex flex-col gap-4 mt-6">
            <Button type="submit" isLoading={loading} fullWidth>
              Register
            </Button>

            <p className="text-center text-gray-600 text-sm">
              Already have an account?{' '}
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