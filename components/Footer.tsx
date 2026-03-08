'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const isMarketingHome = pathname === '/';
  const footerText = 'rgba(22,50,34,0.65)';
  const footerMuted = 'rgba(22,50,34,0.42)';

  return (
    <footer
      style={{
        borderTop: '1px solid rgba(21,128,61,0.08)',
        background: 'rgba(247,252,247,0.92)',
        backdropFilter: 'blur(12px)',
        marginTop: isMarketingHome ? 0 : '4rem',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
                style={{
                  background: 'linear-gradient(135deg,#dcfce7,#86efac)',
                  boxShadow: '0 12px 24px rgba(34,197,94,0.16)',
                }}>
                🌾
              </div>
              <div>
                <p className="font-black text-sm" style={{ color: '#10261b' }}>
                  <span>Arjuna Agri</span>
                </p>
                <p className="text-xs" style={{ color: footerMuted }}>{isMarketingHome ? 'Modern AgriTech for field decisions' : 'AI Precision Farming'}</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: footerMuted }}>
              Empowering Indian farmers with AI-driven insights, disease detection, and smart farm management.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: footerText }}>AI Tools</p>
            <div className="space-y-2">
              {[
                { href: '/soil',     label: 'Soil Analysis' },
                { href: '/disease',  label: 'Disease Detection' },
                { href: '/voice',    label: 'Voice AI (Arjuna)' },
                { href: '/fertilizer', label: 'Fertilizer Calculator' },
              ].map(l => (
                <Link key={l.href} href={l.href}
                  className="block text-sm transition-colors hover:text-green-400"
                  style={{ color: footerText }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: footerText }}>Farm Tools</p>
            <div className="space-y-2">
              {[
                { href: '/yield',      label: 'Yield & ROI Predictor' },
                { href: '/irrigation', label: 'Irrigation Scheduler' },
                { href: '/expenses',   label: 'Input Cost Tracker' },
                { href: '/calendar',   label: 'Crop Calendar' },
              ].map(l => (
                <Link key={l.href} href={l.href}
                  className="block text-sm transition-colors hover:text-green-400"
                  style={{ color: footerText }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: footerText }}>Info</p>
            <div className="space-y-2">
              {[
                { href: '/market',  label: 'Market Prices & MSP' },
                { href: '/profile', label: 'My Farm Profile' },
                { href: '/support', label: 'Customer Support 🎧' },
              ].map(l => (
                <Link key={l.href} href={l.href}
                  className="block text-sm transition-colors hover:text-green-400"
                  style={{ color: footerText }}>
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-xs" style={{ color: 'rgba(22,50,34,0.36)' }}>Powered by</p>
              <div className="flex flex-wrap gap-1.5">
                {['Groq AI', 'Gemini', 'Supabase', 'Next.js'].map(tech => (
                  <span key={tech} className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(255,255,255,0.78)',
                      color: footerText,
                      border: '1px solid rgba(21,128,61,0.1)',
                    }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 gap-2"
          style={{ borderTop: '1px solid rgba(21,128,61,0.08)' }}>
          <p className="text-xs" style={{ color: 'rgba(22,50,34,0.32)' }}>
            © 2026 Arjuna Agri — Built for Indian Farmers 🇮🇳
          </p>
          <p className="text-xs" style={{ color: 'rgba(22,50,34,0.32)' }}>
            Hackathon Project · AI-Powered Precision Agriculture
          </p>
        </div>
      </div>
    </footer>
  );
}
