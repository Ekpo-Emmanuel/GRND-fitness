'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Clock9, Plus, LayoutPanelTop, UserRound, User } from 'lucide-react';


const navItems = [
  {
    label: 'Home',
    icon: Home,
    href: '/dashboard',
  },
  {
    label: 'Progress',
    icon: Clock9,
    href: '/progress',
  },
  {
    label: 'Workout',
    icon: Plus,
    href: '/workout/setup',
  },
  {
    label: 'Templates',
    icon: LayoutPanelTop,
    href: '/templates',
  },
  {
    label: 'Profile',
    icon: UserRound,
    href: '/profile',
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  
  // Determine which nav item is active
  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true;
    if (path === '/progress' && pathname === '/progress') return true;
    if (path === '/analytics' && pathname === '/analytics') return true;
    if (path === '/workout/setup' && pathname.includes('/workout')) return true;
    if (path === '/templates' && pathname === '/templates') return true;
    if (path === '/profile' && pathname === '/profile') return true;
    return false;
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 z-10">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="flex flex-col items-center p-2">
              {item.label === 'Workout' ? (
                <div className="bg-blue-500 rounded-full p-3 -mt-8 border-4 border-white">
                  <item.icon className="h-6 w-6 text-white" />
                </div>
              ) : (
                <item.icon 
                  className={`h-5 w-5 ${isActive(item.href) ? 'text-blue-500' : 'text-gray-500'}`}
                />
              )}
              <span className={`text-xs mt-1 ${isActive(item.href) ? 'text-blue-500' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 