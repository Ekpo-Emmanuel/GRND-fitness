'use client';

import { useAuth } from '@/app/providers';
import SignOutButton from './SignOutButton';

export default function UserProfile() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-600 mb-4">You are not signed in.</p>
        <a
          href="/auth/signin"
          className="inline-block bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Sign In
        </a>
      </div>
    );
  }
  
  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Your Profile</h2>
      
      <div className="mb-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Email</p>
          <p className="font-medium">{user.email}</p>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">User ID</p>
          <p className="font-medium text-sm truncate">{user.id}</p>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Email Verified</p>
          <p className="font-medium">{user.email_confirmed_at ? 'Yes' : 'No'}</p>
        </div>
      </div>
      
      <div className="flex justify-between">
        <a
          href="/auth/reset-password"
          className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Change Password
        </a>
        
        <SignOutButton />
      </div>
    </div>
  );
} 