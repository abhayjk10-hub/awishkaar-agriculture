import type { Metadata } from 'next';
import HomePageContent from '@/components/home/HomePageContent';

export const metadata: Metadata = {
  title: 'Kisan Mitra — The farmer service desk',
  description: 'Register, book a mandi slot, and track your procurement journey with Kisan Mitra.',
};

export default function HomePage() {
  return <HomePageContent />;
}
