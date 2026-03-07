'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'auth' | 'guest'>('loading');

  useEffect(() => {
    const id = localStorage.getItem('farmer_id');
    if (!id) {
      setStatus('guest');
    } else {
      setStatus('auth');
    }
  }, []);

  if (status === 'loading') return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="spinner" />
    </div>
  );

  if (status === 'guest') return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="glass-card rounded-2xl p-10 text-center max-w-md w-full">
        <div className="floating text-5xl mb-5">🔐</div>
        <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>Sign in to Continue</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Create a free account to access all farming tools and AI features.
        </p>
        <Link href="/register" className="btn-primary w-full justify-center block text-center">
          👨‍🌾 Get Started Free
        </Link>
        <Link href="/" className="block mt-3 text-sm" style={{ color: 'rgba(134,239,172,0.5)' }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );

  return <>{children}</>;
}
