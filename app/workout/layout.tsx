import { Metadata } from 'next';
import BottomNav from '../components/BottomNav';
import TopNav from '../components/TopNav';

export const metadata: Metadata = {
  title: 'GRND - Workout',
  description: 'Track your workout progress with GRND',
};

export default function WorkoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <TopNav />
      <div className="pt-14 pb-16">
        {children}
      </div>
      <BottomNav />
    </section>
  );
} 