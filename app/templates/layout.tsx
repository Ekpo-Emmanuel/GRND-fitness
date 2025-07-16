import { Metadata } from 'next';
import BottomNav from '../components/BottomNav';
import TopNav from '../components/TopNav';

export const metadata: Metadata = {
  title: 'GRND - Templates',
  description: 'Track your fitness progress with GRND',
};

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <TopNav />
      <div className="pt-14">
        {children}
      </div>
      <BottomNav />
    </section>
  );
} 