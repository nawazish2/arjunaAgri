'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseEnabled } from '@/lib/supabase';
import { STATES_AND_UTS, DISTRICTS } from '@/lib/india-locations';

type Step = 'welcome' | 'info' | 'language';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', village: '', state: '', district: '', language: 'en' as 'en' | 'hi' });
  const [existingName, setExistingName] = useState('');
  const districts = form.state ? (DISTRICTS[form.state] || []) : [];

  useEffect(() => {
    const farmerId = localStorage.getItem('farmer_id');
    const farmerName = localStorage.getItem('farmer_name');
    if (farmerId && farmerName) {
      setExistingName(farmerName);
      setStep('welcome');
    }
  }, []);

  /** Check if phone already registered → restore session */
  const checkExistingPhone = async (phone: string): Promise<string | null> => {
    if (!isSupabaseEnabled || !supabase) return null;
    const { data } = await supabase.from('farmers').select('id,name').eq('phone', phone).maybeSingle();
    return data ? data.id : null;
  };

  /** Save farmer to Supabase (or localStorage fallback) and navigate home */
  const saveFarmer = async () => {
    setLoading(true); setError('');
    try {
      if (isSupabaseEnabled && supabase) {
        // Check if phone already exists
        const { data: existing } = await supabase.from('farmers').select('id,name').eq('phone', form.phone).maybeSingle();
        if (existing) {
          // Returning farmer — just restore session
          localStorage.setItem('farmer_id', existing.id);
          localStorage.setItem('farmer_name', existing.name);
          router.push('/');
          return;
        }
        // New farmer — insert into Supabase
        const { data: inserted, error: insertErr } = await supabase
          .from('farmers')
          .insert([{ name: form.name, phone: form.phone, village: form.village, state: form.state, language: form.language }])
          .select('id')
          .single();
        if (insertErr) throw insertErr;
        localStorage.setItem('farmer_id', inserted.id);
        localStorage.setItem('farmer_name', form.name);
      } else {
        // Offline fallback
        const id = `local_${Date.now()}`;
        localStorage.setItem('farmer_id', id);
        localStorage.setItem('farmer_name', form.name);
        localStorage.setItem('farmer_profile', JSON.stringify({ ...form, id }));
      }
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <div className="orb w-80 h-80 -top-20 -left-20" style={{ background: '#22c55e' }} />
      <div className="orb w-64 h-64 bottom-10 -right-20" style={{ background: '#f59e0b', animationDelay: '2s' }} />

      <div className="relative w-full max-w-sm page-enter">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 glow-green"
            style={{ background: 'linear-gradient(135deg,#16a34a,#166534)' }}>
            <span className="text-4xl">🌾</span>
          </div>
          <h1 className="text-3xl font-bold gradient-text">Arjuna Agri</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>AI-Powered Precision Farming</p>
        </div>

        {/* Step indicator — only for info/language */}
        {step !== 'welcome' && (
          <div className="flex items-center gap-1 mb-6 px-2">
            {(['info', 'language'] as Step[]).map((s, i) => {
              const steps: Step[] = ['info', 'language'];
              const currIdx = steps.indexOf(step);
              const thisIdx = steps.indexOf(s);
              return (
                <div key={s} className="flex items-center gap-1 flex-1">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all"
                    style={{ background: step === s ? '#22c55e' : (thisIdx < currIdx ? '#166534' : 'rgba(34,197,94,0.1)'), color: step === s ? '#061a0d' : '#4ade80' }}>
                    {thisIdx < currIdx ? '✓' : i + 1}
                  </div>
                  {i < 1 && <div className="flex-1 h-px" style={{ background: 'rgba(34,197,94,0.15)' }} />}
                </div>
              );
            })}
          </div>
        )}

        <div className="glass-card rounded-2xl p-6 space-y-4">
          {/* Welcome back step */}
          {step === 'welcome' && (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto floating"
                style={{ background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.3)' }}>👨‍🌾</div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome back!</h2>
                <p className="gradient-text text-2xl font-black mt-1">{existingName}</p>
              </div>
              <button onClick={() => router.push('/')} className="btn-primary w-full justify-center">
                Continue to Dashboard →
              </button>
              <button onClick={() => { localStorage.clear(); setStep('info'); setExistingName(''); }}
                className="w-full text-sm py-2" style={{ color: 'rgba(134,239,172,0.4)' }}>
                Sign in with different account
              </button>
            </div>
          )}

          {/* STEP 1: Personal Info */}
          {step === 'info' && (
            <>
              <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Your Details</h2>
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Full Name</label>
                <input type="text" required placeholder="e.g. Ramesh Kumar" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>📱 Mobile Number</label>
                <div style={{ display: 'flex', alignItems: 'stretch', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '10px', overflow: 'hidden', background: 'rgba(15,46,24,0.5)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 14px', borderRight: '1px solid rgba(34,197,94,0.15)', background: 'rgba(34,197,94,0.06)', color: '#86efac', fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="10-digit mobile number"
                    value={form.phone}
                    maxLength={10}
                    onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                    style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', padding: '10px 14px', fontSize: '0.95rem' }}
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Used to identify your account</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>State / UT</label>
                  <select value={form.state}
                    onChange={e => setForm({ ...form, state: e.target.value, district: '' })}
                    className="input-field"
                    style={{ appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234ade80' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
                    <option value="" style={{ background: '#061a0d' }}>Select State</option>
                    {STATES_AND_UTS.map(s => (
                      <option key={s} value={s} style={{ background: '#061a0d' }}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>District</label>
                  <select value={form.district}
                    onChange={e => setForm({ ...form, district: e.target.value })}
                    className="input-field"
                    disabled={!form.state}
                    style={{ appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234ade80' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', opacity: !form.state ? 0.4 : 1 }}>
                    <option value="" style={{ background: '#061a0d' }}>{form.state ? 'Select District' : 'Select state first'}</option>
                    {districts.map(d => (
                      <option key={d} value={d} style={{ background: '#061a0d' }}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Village / Town</label>
                <input type="text" required placeholder="e.g. Rampur" value={form.village}
                  onChange={e => setForm({ ...form, village: e.target.value })} className="input-field" />
              </div>
              {error && <p className="text-sm text-red-400 bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
              <button type="button" onClick={() => { if (form.name && form.phone && form.village && form.state && form.district) { setError(''); setStep('language'); } else setError('Please fill all fields including state and district'); }}
                className="btn-primary w-full justify-center">Continue →</button>
            </>
          )}

          {/* STEP 2: Language */}
          {step === 'language' && (
            <>
              <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Preferred Language</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>AI voice assistant will respond in this language</p>
              <div className="grid grid-cols-2 gap-3">
                {([{ val: 'en', flag: '🇬🇧', name: 'English', sub: 'English' }, { val: 'hi', flag: '🇮🇳', name: 'हिंदी', sub: 'Hindi' }] as const).map(l => (
                  <button key={l.val} type="button" onClick={() => setForm({ ...form, language: l.val })}
                    className="rounded-xl p-4 border-2 text-center transition-all"
                    style={{ background: form.language === l.val ? 'rgba(34,197,94,0.12)' : 'rgba(6,26,13,0.6)', borderColor: form.language === l.val ? '#22c55e' : 'rgba(34,197,94,0.15)' }}>
                    <div className="text-3xl mb-2">{l.flag}</div>
                    <p className="font-bold" style={{ color: form.language === l.val ? '#4ade80' : 'var(--text-primary)' }}>{l.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{l.sub}</p>
                  </button>
                ))}
              </div>
              {error && <p className="text-sm text-red-400 bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep('info')} className="btn-secondary flex-1">← Back</button>
                <button type="button" onClick={saveFarmer} disabled={loading} className="btn-primary flex-1 justify-center">
                  {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving...</> : '🌾 Start Farming'}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
          🔒 Your data is private and stored securely
        </p>
      </div>
    </div>
  );
}
