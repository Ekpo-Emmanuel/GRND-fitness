'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SignOutButtonProps {
  className?: string;
}

export default function SignOutButton({ className = '' }: SignOutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signOut } = useAuth();
  
  const handleSignOut = async () => {
    setLoading(true);
    
    try {
      await signOut();
      router.push('/auth/signin');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button
      onClick={handleSignOut}
      disabled={loading}
      className={`flex items-center ${className}`}
    >
      <LogOut className="h-4 w-4 mr-2" />
      {loading ? 'Signing out...' : 'Log out'}
    </Button>
  );
} 