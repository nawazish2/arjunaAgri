'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, isSupabaseEnabled } from '@/lib/supabase';
import WeatherWidget from '@/components/WeatherWidget';
import { useLang } from '@/lib/lang';
import dynamic from 'next/dynamic';
const PestAlert = dynamic(() => import('@/components/PestAlert'), { ssr: false });

interface SoilReport { n: number; p: number; k: number; ph: number; moisture: number; location: string; created_at: string; recommendations?: { topCrops?: { name: string }[] }; }
interface DiseaseReport { disease_name: string; severity: string; created_at: string; }

// Landing page shown to guests
function LandingPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="orb w-96 h-96 -top-20 right-0" style={{ background: '#22c55e' }} />
      <div className="orb w-72 h-72 bottom-0 left-0" style={{ background: '#f59e0b', animationDelay: '2.5s' }} />
      <div className="orb w-64 h-64 top-1/3 left-1/3" style={{ background: '#60a5fa', animationDelay: '1.5s' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 page-enter">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="floating text-6xl mb-6">🌾</div>
          <h1 className="text-5xl lg:text-7xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
            <span className="gradient-text">Arjuna Agri</span>
          </h1>
          <p className="text-xl lg:text-2xl font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
            AI-Powered Precision Farming for Indian Farmers
          </p>
          <p className="text-base max-w-2xl mx-auto mb-10" style={{ color: 'rgba(134,239,172,0.6)' }}>
            Get AI crop recommendations, detect plant diseases, calculate fertilizer doses, plan irrigation, and predict yield — all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => router.push('/register')}
              className="btn-primary text-lg px-10 py-4">
              🚀 Get Started Free
            </button>
            <button onClick={() => router.push('/register')}
              className="btn-secondary text-lg px-10 py-4">
              👨‍🌾 I Already Have an Account
            </button>
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { icon: '🌱', title: 'Smart Soil Analysis', desc: 'Enter NPK values and get AI-powered crop recommendations tailored to your soil and location.', color: '#22c55e' },
            { icon: '🔬', title: 'AI Disease Detection', desc: 'Upload a photo of your plant and get instant diagnosis with organic-first treatment recommendations.', color: '#f59e0b' },
            { icon: '🧮', title: 'Fertilizer Calculator', desc: 'Calculate exact NPK doses with Indian product names, costs in ₹, and application schedule.', color: '#60a5fa' },
            { icon: '🎤', title: 'Voice AI (Arjuna)', desc: 'Talk to your personal AI farming advisor in Hindi or English — ask anything about your crops.', color: '#a78bfa' },
            { icon: '📊', title: 'Yield & ROI Predictor', desc: 'Compare profitability of 10 crops using MSP 2024-25 before you sow. Find the best crop for your land.', color: '#f59e0b' },
            { icon: '💧', title: 'Irrigation Scheduler', desc: 'Get stage-wise irrigation schedule with exact water requirements and critical alerts for your crop.', color: '#38bdf8' },
            { icon: '💸', title: 'Input Cost Tracker', desc: 'Log seeds, fertilizer, labour costs and track budget vs actual spending per season.', color: '#a78bfa' },
            { icon: '📈', title: 'Market Prices & MSP', desc: 'Live MSP rates and government schemes for 40+ crops with mandi price trends.', color: '#4ade80' },
          ].map(f => (
            <div key={f.title} className="glass-card rounded-2xl p-5 card-hover">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                style={{ background: `${f.color}18` }}>
                {f.icon}
              </div>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="glass-card rounded-2xl p-8 mb-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { value: '10+', label: 'Crops Supported' },
              { value: 'Groq + Gemini', label: 'AI Engines' },
              { value: '100%', label: 'Free to Use' },
              { value: 'Hindi + English', label: 'Languages' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-3xl font-black gradient-text mb-1">{s.value}</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center rounded-2xl p-10" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <h2 className="text-3xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
            Ready to grow smarter? 🚀
          </h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            Join thousands of Indian farmers using AI to increase yield and reduce costs.
          </p>
          <button onClick={() => router.push('/register')} className="btn-primary text-lg px-12 py-4">
            Start for Free →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { t: tKey, tRaw: t, lang } = useLang();
  const [farmerName, setFarmerName] = useState('Farmer');
  const [soilReport, setSoilReport] = useState<SoilReport | null>(null);
  const [diseaseAlerts, setDiseaseAlerts] = useState<DiseaseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem('farmer_name');
    const farmerId = localStorage.getItem('farmer_id');
    if (!farmerId) {
      setIsGuest(true);
      setLoading(false);
      return;
    }
    setFarmerName(name || 'Farmer');
    const fetchData = async () => {
      try {
        if (isSupabaseEnabled && supabase) {
          const [soilRes, diseaseRes] = await Promise.all([
            supabase.from('soil_reports').select('*').eq('farmer_id', farmerId).order('created_at', { ascending: false }).limit(1).single(),
            supabase.from('disease_reports').select('*').eq('farmer_id', farmerId).order('created_at', { ascending: false }).limit(3),
          ]);
          if (soilRes.data) setSoilReport(soilRes.data);
          if (diseaseRes.data) setDiseaseAlerts(diseaseRes.data);
        } else {
          const sr = localStorage.getItem('latest_soil_report');
          const dr = localStorage.getItem('latest_disease');
          if (sr) setSoilReport(JSON.parse(sr));
          if (dr) setDiseaseAlerts([JSON.parse(dr)]);
        }
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const hour = new Date().getHours();
  const greetMap: Record<string, [string, string, string]> = {
    en: ['Good Morning', 'Good Afternoon', 'Good Evening'],
    hi: ['शुभ प्रभात', 'नमस्ते', 'शुभ संध्या'],
    te: ['శుభోదయం', 'శుభ మధ్యాహ్నం', 'శుభ సాయంత్రం'],
    ta: ['காலை வணக்கம்', 'மதிய வணக்கம்', 'மாலை வணக்கம்'],
    mr: ['शुभ सकाळ', 'शुभ दुपार', 'शुभ संध्याकाळ'],
    pa: ['ਸ਼ੁਭ ਸਵੇਰ', 'ਸ਼ੁਭ ਦੁਪਹਿਰ', 'ਸ਼ੁਭ ਸ਼ਾਮ'],
  };
  const gArr = greetMap[lang] ?? greetMap.en;
  const greeting = hour < 12 ? gArr[0] : hour < 17 ? gArr[1] : gArr[2];
  const greetEmoji = hour < 12 ? '🌅' : hour < 17 ? '☀️' : '🌙';

  const npk = soilReport ? [
    { label: 'N', value: soilReport.n, max: 140, color: '#22c55e' },
    { label: 'P', value: soilReport.p, max: 140, color: '#f59e0b' },
    { label: 'K', value: soilReport.k, max: 140, color: '#60a5fa' },
  ] : [];

  const severityColor = (s: string) => s === 'High' ? '#f87171' : s === 'Medium' ? '#fcd34d' : '#4ade80';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="spinner mx-auto mb-4" />
        <p style={{ color: 'var(--text-muted)' }}>Loading your farm data...</p>
      </div>
    </div>
  );

  // Show landing page for guests
  if (isGuest) return <LandingPage />;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="orb w-96 h-96 -top-20 right-0" style={{ background: '#22c55e' }} />
      <div className="orb w-72 h-72 bottom-0 left-0" style={{ background: '#f59e0b', animationDelay: '2.5s' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">

        {/* Hero */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: 'rgba(134,239,172,0.6)' }}>
              {greetEmoji} {greeting}
            </p>
            <h1 className="text-4xl lg:text-5xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
              {tKey('dash_welcome')}, <span className="gradient-text">{farmerName}</span> 👋
            </h1>
            <p className="text-base max-w-xl" style={{ color: 'rgba(134,239,172,0.6)' }}>
              {tKey('dash_hero_sub')}
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            {[
              { icon: '🌡️', label: t('Season','मौसम'), value: t('Rabi','रबी') },
              { icon: '📅', label: t('Month','महीना'), value: new Date().toLocaleString('en-IN', { month: 'short' }) },
              { icon: '🤖', label: 'AI Engine', value: 'Groq + Gemini' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl px-4 py-3 text-center" style={{ background: 'rgba(6,26,13,0.6)', border: '1px solid rgba(34,197,94,0.12)' }}>
                <span className="text-xl">{s.icon}</span>
                <p className="text-sm font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Weather */}
        <div className="mb-6">
          <WeatherWidget />
        </div>

        {/* 2-col layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div>
              <h2 className="section-title mb-4">{tKey('dash_quick_actions')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: '🌾', label: t('Soil Analysis','मृदा विश्लेषण'), sub: t('AI crop recs','AI फसल सुझाव'), path: '/soil', color: '#22c55e' },
                  { icon: '🔬', label: tKey('nav_disease'), sub: tKey('disease_upload'), path: '/disease', color: '#f59e0b' },
                  { icon: '🧮', label: tKey('nav_fertilizer'), sub: tKey('fert_get_advice'), path: '/fertilizer', color: '#60a5fa' },
                  { icon: '🎤', label: tKey('nav_voice'), sub: t('Talk to Arjuna','अर्जुन से बात'), path: '/voice', color: '#a78bfa' },
                ].map((item) => (
                  <Link key={item.path} href={item.path}
                    className="glass-card rounded-2xl p-5 text-left card-hover group block">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform group-hover:scale-110"
                      style={{ background: `${item.color}18` }}>
                      {item.icon}
                    </div>
                    <p className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.sub}</p>
                    <div className="mt-3 text-xs font-bold flex items-center gap-1" style={{ color: item.color }}>
                      Open <span>→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Soil Report */}
            {soilReport ? (
              <div>
                <h2 className="section-title mb-4">Latest Soil Report</h2>
                <div className="glass-card rounded-2xl p-6 glow-green">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'rgba(34,197,94,0.12)' }}>🌱</div>
                      <div>
                        <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Soil Health Summary</h3>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>📍 {soilReport.location}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="badge badge-green">pH {soilReport.ph}</span>
                      <span className="badge badge-amber">💧 {soilReport.moisture}%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-5">
                    {npk.map(({ label, value, max, color }) => (
                      <div key={label} className="rounded-xl p-4 text-center" style={{ background: 'rgba(6,26,13,0.6)' }}>
                        <p className="text-2xl font-black" style={{ color }}>{value}</p>
                        <p className="text-xs font-semibold mt-1" style={{ color }}>kg/ha</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label === 'N' ? 'Nitrogen' : label === 'P' ? 'Phosphorus' : 'Potassium'}</p>
                        <div className="h-1.5 rounded-full overflow-hidden mt-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-full rounded-full" style={{ width: `${Math.min((value/max)*100,100)}%`, background: color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {soilReport.recommendations?.topCrops?.length && (
                    <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>🏆 Recommended Crops</p>
                      <div className="flex flex-wrap gap-2">
                        {soilReport.recommendations.topCrops.map((c, i) => (
                          <span key={i} className={i === 0 ? 'badge badge-green' : 'badge badge-amber'}>{c.name}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h2 className="section-title mb-4">Soil Analysis</h2>
                <Link href="/soil"
                  className="glass-card rounded-2xl p-8 w-full text-left hover:opacity-90 transition-opacity block"
                  style={{ border: '2px dashed rgba(34,197,94,0.2)' }}>
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl" style={{ background: 'rgba(34,197,94,0.1)' }}>🌱</div>
                    <div>
                      <p className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>Add Your First Soil Test</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Get AI crop recommendations tailored to your exact soil composition</p>
                      <span className="badge badge-green mt-3 inline-block">Start Now →</span>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Farm Tools */}
            <div>
              <h2 className="section-title mb-4">Farm Tools</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: '📊', label: 'Yield & ROI', sub: 'Compare crop profitability using MSP 2024-25', path: '/yield', color: '#f59e0b' },
                  { icon: '💧', label: 'Irrigation Scheduler', sub: 'Stage-wise water management', path: '/irrigation', color: '#60a5fa' },
                  { icon: '💸', label: 'Cost Tracker', sub: 'Log and track farm expenses', path: '/expenses', color: '#a78bfa' },
                ].map(item => (
                  <Link key={item.path} href={item.path}
                    className="flex items-start gap-4 rounded-2xl p-4 card-hover text-left block"
                    style={{ background: 'rgba(6,26,13,0.5)', border: '1px solid rgba(34,197,94,0.1)' }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 mt-0.5"
                      style={{ background: `${item.color}18` }}>{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.sub}</p>
                    </div>
                    <span className="text-xs mt-1 flex-shrink-0" style={{ color: 'rgba(74,222,128,0.4)' }}>→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-6">
            {diseaseAlerts.length > 0 && (
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">⚠️</span>
                  <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Disease Alerts</h3>
                </div>
                <div className="space-y-2">
                  {diseaseAlerts.map((d, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl px-3 py-3"
                      style={{ background: 'rgba(6,26,13,0.6)', border: '1px solid rgba(34,197,94,0.08)' }}>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: severityColor(d.severity) }} />
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{d.disease_name}</p>
                      </div>
                      <span className="text-xs font-semibold" style={{ color: severityColor(d.severity) }}>{d.severity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <PestAlert />

            <Link href="/market" className="glass-card rounded-2xl p-5 w-full text-left card-hover block">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">📈</span>
                <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Market Prices</h3>
              </div>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                Live MSP rates, government schemes & mandi prices for 40+ crops
              </p>
              <div className="text-sm font-bold flex items-center gap-1" style={{ color: '#4ade80' }}>
                View Prices <span>→</span>
              </div>
            </Link>

            <Link href="/calendar" className="glass-card rounded-2xl p-5 w-full text-left card-hover block">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">📅</span>
                <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Crop Calendar</h3>
              </div>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                Sowing, growing and harvest schedule for {new Date().toLocaleString('en-IN', { month: 'long' })}
              </p>
              <div className="text-sm font-bold flex items-center gap-1" style={{ color: '#4ade80' }}>
                View Calendar <span>→</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
