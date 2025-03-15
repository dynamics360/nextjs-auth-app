'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          NextJS Auth App
        </Link>
        <div className="flex space-x-4">
          <Link href="/" className="hover:text-gray-300">
            Home
          </Link>
          {user ? (
            <>
              <span className="text-gray-300">Welcome, {user.name}</span>
              <button
                onClick={logout}
                className="hover:text-gray-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-gray-300">
                Login
              </Link>
              <Link href="/register" className="hover:text-gray-300">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 