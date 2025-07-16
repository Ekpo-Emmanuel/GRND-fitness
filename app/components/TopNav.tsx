'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserRound, ChevronDown, LayoutPanelTop, FileText } from 'lucide-react';
import SignOutButton from '../auth/components/SignOutButton';
import Logo from '@/components/logo';
import { useAuth } from '@/app/providers';
import Image from 'next/image';

export default function TopNav() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user } = useAuth();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 py-2 px-4 z-50">
      <div className="max-w-md mx-auto flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center">
          <Logo className="" />
        </Link>
        
        <div className="relative">
          <button 
            onClick={toggleDropdown}
            className="flex items-center space-x-1 p-2 rounded-full hover:bg-gray-100"
          >
            {user?.user_metadata?.avatar_url ? (
              <Image 
                src={user.user_metadata.avatar_url} 
                alt="User avatar" 
                width={20} 
                height={20} 
                className="h-5 w-5 rounded-full object-cover"
              />
            ) : (
              <UserRound className="h-5 w-5 text--black" />
            )}
            <ChevronDown className={`h-4 w-4 transition-transform text--black ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={closeDropdown}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 py-1">
                <Link 
                  href="/analytics" 
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={closeDropdown}
                >
                  <LayoutPanelTop className="h-4 w-4 mr-2" />
                  Analytics
                </Link>
                <Link 
                  href="/templates" 
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={closeDropdown}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Templates
                </Link>
                <div className="border-t border-gray-100 my-1" />
                <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <SignOutButton className="w-full flex items-center justify-start bg-transparent text-gray-700 hover:bg-transparent p-0 m-0" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 