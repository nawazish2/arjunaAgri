import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(34,197,94,0.1)', background: 'rgba(3,10,5,0.8)', backdropFilter: 'blur(12px)', marginTop: '4rem' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
                style={{ background: 'linear-gradient(135deg,#16a34a,#166534)', boxShadow: '0 0 12px rgba(34,197,94,0.3)' }}>
                🌾
              </div>
              <div>
                <p className="font-black text-sm gradient-text">Arjuna Agri</p>
                <p className="text-xs" style={{ color: 'rgba(134,239,172,0.4)' }}>AI Precision Farming</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(134,239,172,0.4)' }}>
              Empowering Indian farmers with AI-driven insights, disease detection, and smart farm management.
            </p>
          </div>

          {/* AI Tools */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'rgba(134,239,172,0.5)' }}>AI Tools</p>
            <div className="space-y-2">
              {[
                { href: '/soil',     label: 'Soil Analysis' },
                { href: '/disease',  label: 'Disease Detection' },
                { href: '/voice',    label: 'Voice AI (Arjuna)' },
                { href: '/fertilizer', label: 'Fertilizer Calculator' },
              ].map(l => (
                <Link key={l.href} href={l.href}
                  className="block text-sm transition-colors hover:text-green-400"
                  style={{ color: 'rgba(134,239,172,0.5)' }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Farm Tools */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'rgba(134,239,172,0.5)' }}>Farm Tools</p>
            <div className="space-y-2">
              {[
                { href: '/yield',      label: 'Yield & ROI Predictor' },
                { href: '/irrigation', label: 'Irrigation Scheduler' },
                { href: '/expenses',   label: 'Input Cost Tracker' },
                { href: '/calendar',   label: 'Crop Calendar' },
              ].map(l => (
                <Link key={l.href} href={l.href}
                  className="block text-sm transition-colors hover:text-green-400"
                  style={{ color: 'rgba(134,239,172,0.5)' }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'rgba(134,239,172,0.5)' }}>Info</p>
            <div className="space-y-2">
              {[
                { href: '/market',  label: 'Market Prices & MSP' },
                { href: '/profile', label: 'My Farm Profile' },
                { href: '/support', label: 'Customer Support 🎧' },
              ].map(l => (
                <Link key={l.href} href={l.href}
                  className="block text-sm transition-colors hover:text-green-400"
                  style={{ color: 'rgba(134,239,172,0.5)' }}>
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-xs" style={{ color: 'rgba(134,239,172,0.35)' }}>Powered by</p>
              <div className="flex flex-wrap gap-1.5">
                {['Groq AI', 'Gemini', 'Supabase', 'Next.js'].map(tech => (
                  <span key={tech} className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(34,197,94,0.08)', color: 'rgba(134,239,172,0.5)', border: '1px solid rgba(34,197,94,0.1)' }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 gap-2"
          style={{ borderTop: '1px solid rgba(34,197,94,0.08)' }}>
          <p className="text-xs" style={{ color: 'rgba(134,239,172,0.3)' }}>
            © 2025 Arjuna Agri — Built for Indian Farmers 🇮🇳
          </p>
          <p className="text-xs" style={{ color: 'rgba(134,239,172,0.3)' }}>
            Hackathon Project · AI-Powered Precision Agriculture
          </p>
        </div>
      </div>
    </footer>
  );
}
