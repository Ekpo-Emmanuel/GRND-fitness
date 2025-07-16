import UserProfile from '../components/UserProfile';

export const metadata = {
  title: 'Your Profile | GRND',
  description: 'Manage your GRND account profile',
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900">GRND</h1>
          <p className="mt-2 text-sm text-gray-600">Track the grind. Build the body.</p>
        </div>
        
        <UserProfile />
      </div>
    </div>
  );
} 