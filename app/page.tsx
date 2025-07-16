import { getSession, getUserDetails } from '@/lib/supabase/auth';
import Link from 'next/link';

export default async function Home() {
  const session = await getSession();
  const user = session ? await getUserDetails() : null;
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col">
        <h1 className="text-4xl font-bold mb-4">GRND</h1>
        <p className="text-xl mb-8">Track the grind. Build the body.</p>
        
        {user ? (
          <div className="text-center">
            <p className="mb-4">Welcome, {user.email}!</p>
            <div className="flex space-x-4">
              <Link
                href="/auth/profile"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                View Profile
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Go to Dashboard
              </Link>
            </div>
        </div>
        ) : (
          <div className="flex space-x-4">
            <Link
              href="/auth/signin"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Sign Up
            </Link>
          </div>
        )}
    </div>
    </main>
  );
}
