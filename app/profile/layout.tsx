import { Metadata } from 'next';
import BottomNav from '../components/BottomNav';

export const metadata: Metadata = {
  title: 'GRND - Profile',
  description: 'Manage your GRND profile',
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="pb-16">
      {children}
      <BottomNav />
    </section>
  );
} 