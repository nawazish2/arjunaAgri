'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, isSupabaseEnabled } from '@/lib/supabase';
import { getActiveFarmerId, getActiveFarmerProfile } from '@/lib/farmer-auth';
import WeatherWidget from '@/components/WeatherWidget';
import { useLang } from '@/lib/lang';
import dynamic from 'next/dynamic';
const PestAlert = dynamic(() => import('@/components/PestAlert'), { ssr: false });

interface SoilReport { n?: number; p?: number; k?: number; nitrogen?: number; phosphorus?: number; potassium?: number; ph: number; moisture: number; location: string; created_at: string; recommendations?: { topCrops?: { name: string }[] }; }
interface DiseaseReport { disease_name: string; severity: string; created_at: string; }

// Landing page shown to guests
function LandingPage() {
  const router = useRouter();
  const featureCards = [
    {
      icon: '🌱',
      title: 'Soil intelligence',
      desc: 'Enter NPK values or upload a soil report to get crop suggestions, soil correction tips, and clearer next steps.',
      accent: '#16a34a',
    },
    {
      icon: '🔬',
      title: 'Disease diagnosis',
      desc: 'Upload a plant photo and get severity, immediate actions, and treatment options tailored for practical field use.',
      accent: '#ea580c',
    },
    {
      icon: '🧮',
      title: 'Input planning',
      desc: 'Use fertilizer, irrigation, and ROI tools to estimate costs, field requirements, and profitability before you sow.',
      accent: '#2563eb',
    },
    {
      icon: '🎤',
      title: 'Voice-first assistance',
      desc: 'Ask farming questions in natural language and get short, actionable answers designed for quick understanding.',
      accent: '#7c3aed',
    },
  ];

  const valuePoints = [
    'Reduce avoidable crop loss with early disease detection',
    'Plan better with soil, irrigation, fertilizer, and market tools',
    'Make the product accessible through multilingual and voice-first flows',
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Register your farm profile',
      desc: 'Create a farmer profile with village, state, phone, and preferred language so the app can personalize the experience.',
    },
    {
      step: '02',
      title: 'Analyze your farm conditions',
      desc: 'Add soil values, upload reports, scan disease photos, and compare crop and profitability options before taking action.',
    },
    {
      step: '03',
      title: 'Act with confidence',
      desc: 'Use the platform to plan fertilizer, irrigation, expenses, and market decisions with a clearer day-to-day workflow.',
    },
  ];

  return (
    <div className="landing-shell overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 page-enter">
        <section className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-12 items-center pt-10 md:pt-16">
          <div className="max-w-3xl">
            <span className="eyebrow mb-6">
              <span>AgriTech Hackathon Project</span>
            </span>
            <h1 className="landing-title mb-6">
              Better crop decisions,
              <br />
              faster farm action.
            </h1>
            <p className="landing-copy max-w-2xl mb-8">
              Arjuna Agri brings soil analysis, disease detection, fertilizer planning,
              irrigation support, yield estimation, and farmer-friendly AI guidance into one
              modern workflow for Indian agriculture.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                onClick={() => router.push('/register')}
                className="btn-primary justify-center text-base px-8 py-4"
                style={{ borderRadius: 999, boxShadow: '0 18px 40px rgba(34,197,94,0.2)' }}
              >
                Start free
              </button>
              <button
                onClick={() => router.push('/register')}
                className="btn-soft text-base px-8 py-4"
              >
                Sign in to dashboard
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {[
                { value: '6', label: 'Languages' },
                { value: '12+', label: 'Farmer tools' },
                { value: 'AI', label: 'Crop + disease support' },
              ].map((item) => (
                <div key={item.label} className="metric-pill">
                  <span className="metric-value">{item.value}</span>
                  <span className="metric-label">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="landing-surface landing-shadow-lg rounded-[2rem] p-6 md:p-7">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="section-kicker mb-2">Today in Arjuna Agri</p>
                  <h2 className="text-2xl md:text-3xl font-black" style={{ color: '#10261b' }}>
                    One platform for field decisions
                  </h2>
                </div>
                <div className="hidden md:flex items-center justify-center w-14 h-14 rounded-2xl"
                  style={{ background: 'rgba(34,197,94,0.1)', color: '#166534', fontSize: 26 }}>
                  🌾
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div className="landing-grid-card rounded-2xl p-4">
                  <p className="text-sm font-semibold mb-1" style={{ color: '#166534' }}>Soil workflow</p>
                  <p className="text-sm leading-6 landing-muted">
                    Enter NPK values or upload a PDF report and get crop recommendations plus soil correction guidance.
                  </p>
                </div>
                <div className="landing-grid-card rounded-2xl p-4">
                  <p className="text-sm font-semibold mb-1" style={{ color: '#166534' }}>Disease workflow</p>
                  <p className="text-sm leading-6 landing-muted">
                    Upload a plant image to understand severity, immediate actions, and treatment choices.
                  </p>
                </div>
              </div>

              <div className="landing-surface-strong rounded-2xl p-4 md:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] mb-2" style={{ color: 'rgba(22,50,34,0.48)' }}>
                      What the app helps with
                    </p>
                    <div className="space-y-2">
                      {valuePoints.map((point) => (
                        <div key={point} className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(34,197,94,0.12)', color: '#15803d', fontSize: 12 }}>
                            ✓
                          </span>
                          <p className="text-sm leading-6" style={{ color: '#214031' }}>{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:w-48">
                    {[
                      { value: 'Soil', label: 'analysis' },
                      { value: 'Scan', label: 'diseases' },
                      { value: 'Plan', label: 'inputs' },
                      { value: 'Ask', label: 'voice AI' },
                    ].map((item) => (
                      <div key={item.value} className="rounded-2xl p-3 text-center"
                        style={{ background: 'rgba(248,255,251,0.8)', border: '1px solid rgba(21,128,61,0.08)' }}>
                        <p className="font-black text-lg" style={{ color: '#10261b' }}>{item.value}</p>
                        <p className="text-xs landing-subtle">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-24">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <p className="section-kicker mb-3">Core product areas</p>
              <h2 className="text-3xl md:text-4xl font-black" style={{ color: '#10261b' }}>
                Built around real farming workflows
              </h2>
            </div>
            <p className="landing-muted max-w-xl">
              The app combines AI-assisted diagnostics with practical calculators and planning screens so farmers can move from data to action without switching tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {featureCards.map((card) => (
              <div key={card.title} className="landing-grid-card rounded-3xl p-6 card-hover">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5"
                  style={{ background: `${card.accent}14` }}>
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ color: '#10261b' }}>{card.title}</h3>
                <p className="text-sm leading-7 landing-muted">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24">
          <div className="landing-surface rounded-[2rem] p-6 md:p-8 lg:p-10">
            <div className="max-w-2xl mb-8">
              <p className="section-kicker mb-3">How it works</p>
              <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: '#10261b' }}>
                A simple farm workflow from profile to action
              </h2>
              <p className="landing-muted">
                The first version is designed for fast onboarding and practical value. Farmers can register once, then use the dashboard and tools as a repeatable seasonal workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {workflowSteps.map((step) => (
                <div key={step.step} className="landing-surface-strong rounded-3xl p-6">
                  <p className="text-sm font-black mb-4" style={{ color: '#16a34a' }}>{step.step}</p>
                  <h3 className="text-xl font-bold mb-3" style={{ color: '#10261b' }}>{step.title}</h3>
                  <p className="text-sm leading-7 landing-muted">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-24 mb-10">
          <div className="landing-surface-strong rounded-[2rem] p-8 md:p-10 text-center">
            <p className="section-kicker mb-3">Get started</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: '#10261b' }}>
              Start using the farming workspace locally
            </h2>
            <p className="landing-muted max-w-2xl mx-auto mb-8">
              Register a farmer profile, run a soil recommendation, test disease scanning,
              and explore irrigation, fertilizer, ROI, and support flows from one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/register')}
                className="btn-primary justify-center text-base px-8 py-4"
                style={{ borderRadius: 999, boxShadow: '0 18px 40px rgba(34,197,94,0.2)' }}
              >
                Create farmer profile
              </button>
              <button
                onClick={() => router.push('/register')}
                className="btn-soft text-base px-8 py-4 justify-center"
              >
                Open sign-in flow
              </button>
            </div>
          </div>
        </section>
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
    const fetchData = async () => {
      try {
        const farmerId = await getActiveFarmerId();
        if (!farmerId) {
          setIsGuest(true);
          return;
        }

        const profile = await getActiveFarmerProfile();
        setFarmerName(profile?.name || 'Farmer');
        setIsGuest(false);

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
    { label: 'N', value: soilReport.n ?? soilReport.nitrogen ?? 0, max: 140, color: '#22c55e' },
    { label: 'P', value: soilReport.p ?? soilReport.phosphorus ?? 0, max: 140, color: '#f59e0b' },
    { label: 'K', value: soilReport.k ?? soilReport.potassium ?? 0, max: 140, color: '#60a5fa' },
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
    <div className="app-light min-h-screen relative overflow-hidden">
      <div className="orb w-96 h-96 -top-20 right-0" style={{ background: '#22c55e' }} />
      <div className="orb w-72 h-72 bottom-0 left-0" style={{ background: '#f59e0b', animationDelay: '2.5s' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">

        {/* Hero */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: 'rgba(22,50,34,0.55)' }}>
              {greetEmoji} {greeting}
            </p>
            <h1 className="text-4xl lg:text-5xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
              {tKey('dash_welcome')}, <span className="gradient-text">{farmerName}</span> 👋
            </h1>
            <p className="text-base max-w-xl" style={{ color: 'rgba(22,50,34,0.72)' }}>
              {tKey('dash_hero_sub')}
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            {[
              { icon: '🌡️', label: t('Season','मौसम'), value: t('Rabi','रबी') },
              { icon: '📅', label: t('Month','महीना'), value: new Date().toLocaleString('en-IN', { month: 'short' }) },
              { icon: '🤖', label: 'AI Engine', value: 'Groq + Gemini' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl px-4 py-3 text-center" style={{ background: 'rgba(255,255,255,0.82)', border: '1px solid rgba(21,128,61,0.1)', boxShadow: '0 12px 28px rgba(15,23,42,0.05)' }}>
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
                      <div key={label} className="rounded-xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(21,128,61,0.08)' }}>
                        <p className="text-2xl font-black" style={{ color }}>{value}</p>
                        <p className="text-xs font-semibold mt-1" style={{ color }}>kg/ha</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label === 'N' ? 'Nitrogen' : label === 'P' ? 'Phosphorus' : 'Potassium'}</p>
                        <div className="h-1.5 rounded-full overflow-hidden mt-2" style={{ background: 'rgba(21,128,61,0.08)' }}>
                          <div className="h-full rounded-full" style={{ width: `${Math.min((value/max)*100,100)}%`, background: color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {soilReport.recommendations?.topCrops?.length && (
                    <div className="pt-4" style={{ borderTop: '1px solid rgba(21,128,61,0.08)' }}>
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
                    style={{ background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(21,128,61,0.1)', boxShadow: '0 12px 28px rgba(15,23,42,0.04)' }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 mt-0.5"
                      style={{ background: `${item.color}18` }}>{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.sub}</p>
                    </div>
                    <span className="text-xs mt-1 flex-shrink-0" style={{ color: 'rgba(22,50,34,0.38)' }}>→</span>
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
                      style={{ background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(21,128,61,0.08)' }}>
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
              <div className="text-sm font-bold flex items-center gap-1" style={{ color: '#166534' }}>
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
              <div className="text-sm font-bold flex items-center gap-1" style={{ color: '#166534' }}>
                View Calendar <span>→</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
