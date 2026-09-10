import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { TokenProvider } from '@/contexts/TokenContext';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import TokenMarquee from '@/components/shared/TokenMarquee';

export const metadata: Metadata = {
  title: 'Kisan Mitra — Farmer Procurement Queue & Status System',
  description: 'Register, book slots, and track your procurement queue status. A Government of India initiative for farmers.',
  keywords: 'kisan mitra, farmer procurement, slot booking, government scheme, MSP',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-primary-50 botanical-grid">
        <LanguageProvider>
          <AuthProvider>
            <TokenProvider>
              <Header />
              <TokenMarquee />
              {children}
              <Footer />
            </TokenProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
