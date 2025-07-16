import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GRND - Complete Your Profile',
  description: 'Set up your GRND profile to get personalized workout plans',
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </section>
  );
} 