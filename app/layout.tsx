import type { Metadata } from 'next';
import './globals.css';
import TopNav from '@/components/TopNav';
import Footer from '@/components/Footer';
import { LangProvider } from '@/lib/lang';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Arjuna Agri — AI Precision Farming',
  description: 'AI-powered farming guidance for Indian farmers',
  manifest: '/manifest.json',
  themeColor: '#22c55e',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Arjuna Agri' },
  viewport: { width: 'device-width', initialScale: 1, maximumScale: 1 },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LangProvider>
          <TopNav />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </LangProvider>
      </body>
    </html>
  );
}
