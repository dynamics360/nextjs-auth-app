'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Welcome to NextJS Auth App</h1>
      
      {user ? (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Protected Content</h2>
          <p className="mb-4">
            Hello, <span className="font-bold">{user.name}</span>! You are now logged in and can see this protected content.
          </p>
          <p className="mb-4">
            This is a simple authentication app built with Next.js, Express, and MongoDB.
            It includes features like user registration, login, logout, and password reset.
          </p>
          <div className="bg-gray-100 p-4 rounded-md">
            <p className="text-sm text-gray-700">
              Your account details:
            </p>
            <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
              <li>Name: {user.name}</li>
              <li>Email: {user.email}</li>
              <li>User ID: {user.id}</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Please Login or Register</h2>
          <p className="mb-4">
            You need to be logged in to see the protected content. Please login or create an account.
          </p>
          <div className="flex space-x-4 mt-4">
            <Link href="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Login
            </Link>
            <Link href="/register" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Register
            </Link>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">About This App</h2>
        <p className="mb-4">
          This is a demonstration of a full-stack authentication system using:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>Next.js for the frontend</li>
          <li>Express.js for the backend API</li>
          <li>MongoDB for the database</li>
          <li>JWT for authentication</li>
          <li>Tailwind CSS for styling</li>
        </ul>
        <p>
          The app includes features like user registration, login, logout, and password reset functionality.
        </p>
      </div>
    </div>
  );
} 