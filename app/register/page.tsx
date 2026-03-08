'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseEnabled } from '@/lib/supabase';
import { STATES_AND_UTS, DISTRICTS } from '@/lib/india-locations';
import {
  clearCachedFarmerProfile,
  getActiveFarmerProfile,
  readCachedFarmerProfile,
  isValidIndianPhone,
  normalizeIndianPhone,
  phoneToHiddenEmail,
  writeCachedFarmerProfile,
} from '@/lib/farmer-auth';

type Step = 'welcome' | 'signin' | 'info' | 'language';
type AuthMode = 'signin' | 'signup';
type Language = 'en' | 'hi';
type LocalCredential = {
  phone: string;
  passwordHash: string;
  farmerId: string;
  farmerName: string;
};

type RegisterForm = {
  name: string;
  phone: string;
  village: string;
  state: string;
  district: string;
  language: Language;
};

const INITIAL_FORM: RegisterForm = {
  name: '',
  phone: '',
  village: '',
  state: '',
  district: '',
  language: 'en',
};

function credentialKey(phone: string) {
  const normalized = normalizeIndianPhone(phone);
  return `arjuna_auth_${normalized || phone.replace(/\D/g, '')}`;
}

function getAuthErrorMessage(err: unknown) {
  if (!(err instanceof Error)) return 'Something went wrong. Please try again.';

  const message = err.message.toLowerCase();

  if (message.includes('email rate limit exceeded') || message.includes('over_email_send_rate_limit')) {
    return 'Too many signup attempts were made for this phone number. Please wait a minute and try again, or use Sign In if the account already exists.';
  }

  if (message.includes('user already registered')) {
    return 'This phone number is already registered. Please use Sign In instead.';
  }

  if (message.includes('email not confirmed')) {
    return 'Phone-first auth requires email confirmation to be disabled in Supabase Auth settings.';
  }

  return err.message;
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('signin');
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [form, setForm] = useState<RegisterForm>(INITIAL_FORM);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [existingName, setExistingName] = useState('');
  const districts = form.state ? (DISTRICTS[form.state] || []) : [];

  useEffect(() => {
    const bootstrap = async () => {
      const profile = await getActiveFarmerProfile();
      if (!profile) return;

      setExistingName(profile.name);
      setForm((prev) => ({
        ...prev,
        name: profile.name || '',
        phone: profile.phone || '',
        village: profile.village || '',
        state: profile.state || '',
        district: profile.district || '',
        language: (profile.language as Language) || 'en',
      }));
      setStep('welcome');
    };

    bootstrap();
  }, []);

  const hashPassword = async (value: string) => {
    const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const saveLocalCredential = async (phone: string, rawPassword: string, farmerId: string, farmerName: string) => {
    const passwordHash = await hashPassword(rawPassword);
    const payload: LocalCredential = { phone: normalizeIndianPhone(phone), passwordHash, farmerId, farmerName };
    localStorage.setItem(credentialKey(phone), JSON.stringify(payload));
  };

  const getLocalCredential = (phone: string): LocalCredential | null => {
    const stored = localStorage.getItem(credentialKey(phone));
    if (!stored) return null;
    try {
      return JSON.parse(stored) as LocalCredential;
    } catch {
      return null;
    }
  };

  const saveFarmer = async () => {
    setLoading(true);
    setError('');
    setNotice('');
    setDebugInfo('');
    try {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Password and confirm password do not match.');
        return;
      }

      if (!isValidIndianPhone(form.phone)) {
        setError('Please enter a valid 10-digit Indian mobile number.');
        return;
      }

      const normalizedPhone = normalizeIndianPhone(form.phone);
      const hiddenEmail = phoneToHiddenEmail(form.phone);
      setDebugInfo(`Normalized phone: "${normalizedPhone}"`);
      const farmerName = form.name.trim();
      const baseProfile = {
        name: farmerName,
        phone: normalizedPhone.slice(2),
        village: form.village.trim(),
        state: form.state,
        district: form.district,
        language: form.language,
      };

      let farmerId = '';

      if (isSupabaseEnabled && supabase) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: hiddenEmail,
          password,
          options: {
            data: { name: farmerName },
          },
        });
        if (signUpError) throw signUpError;
        if (!data.user) throw new Error('Failed to create Supabase auth user.');

        farmerId = data.user.id;

        const { error: profileError } = await supabase
          .from('farmers')
          .upsert(
            [{ id: farmerId, name: farmerName, phone: baseProfile.phone, village: baseProfile.village, state: baseProfile.state, language: baseProfile.language }],
            { onConflict: 'id' }
          );
        if (profileError) throw profileError;

        writeCachedFarmerProfile({ id: farmerId, ...baseProfile });

        if (data.session) {
          router.push('/');
          return;
        }

        setNotice('Account created. You can now sign in with your phone number and password.');
        setMode('signin');
        setStep('signin');
        setPassword('');
        setConfirmPassword('');
        return;
      } else {
        farmerId = `local_${Date.now()}`;
        writeCachedFarmerProfile({ id: farmerId, ...baseProfile });
        await saveLocalCredential(normalizedPhone, password, farmerId, farmerName);
      }

      router.push('/');
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    } finally { setLoading(false); }
  };

  const signInFarmer = async () => {
    setLoading(true);
    setError('');
    setNotice('');
    setDebugInfo('');
    try {
      if (!isValidIndianPhone(form.phone)) {
        setError('Please enter your 10-digit mobile number.');
        return;
      }
      if (!password) {
        setError('Please enter your password.');
        return;
      }

      const normalizedPhone = normalizeIndianPhone(form.phone);
      const hiddenEmail = phoneToHiddenEmail(form.phone);
      setDebugInfo(`Normalized phone: "${normalizedPhone}"`);

      if (isSupabaseEnabled && supabase) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: hiddenEmail, password });
        if (signInError) throw signInError;
        if (!data.user) throw new Error('Could not load authenticated user.');

        const cached = readCachedFarmerProfile();
        const safeCached = cached?.id === data.user.id ? cached : null;
        const { data: profile, error: profileError } = await supabase.from('farmers').select('*').eq('id', data.user.id).maybeSingle();
        if (profileError) throw profileError;
        if (!profile) {
          setError('Your auth account exists, but no farmer profile was found. Please complete sign up first.');
          return;
        }

        const normalizedProfile = profile as {
          name: string;
          phone: string;
          village: string;
          state: string;
          language?: string;
        };

        writeCachedFarmerProfile({
          id: data.user.id,
          name: normalizedProfile.name,
          phone: normalizedProfile.phone,
          village: normalizedProfile.village,
          state: normalizedProfile.state,
          language: (normalizedProfile.language as Language) || safeCached?.language || 'en',
          district: safeCached?.district,
          pincode: safeCached?.pincode,
        });
        router.push('/');
        return;
      }

      const credential = getLocalCredential(normalizedPhone);
      if (!credential) {
        setError('No local account found for this phone number. Please sign up first.');
        return;
      }

      const passwordHash = await hashPassword(password);
      if (credential.passwordHash !== passwordHash) {
        setError('Incorrect password. Please try again.');
        return;
      }

      const cached = readCachedFarmerProfile();
      if (cached) {
        writeCachedFarmerProfile({ ...cached, id: cached.id || credential.farmerId, name: cached.name || credential.farmerName });
      }
      router.push('/');
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    } finally { setLoading(false); }
  };

  return (
    <div className="app-light min-h-screen relative overflow-hidden flex items-center justify-center p-4">
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

        {/* Step indicator */}
        {step !== 'welcome' && step !== 'signin' && (
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

        <div className="glass-card rounded-3xl p-6 space-y-4">
          {step !== 'welcome' && (
            <div className="grid grid-cols-2 gap-2 rounded-2xl p-1" style={{ background: 'rgba(220,252,231,0.65)', border: '1px solid rgba(21,128,61,0.08)' }}>
              <button
                type="button"
                onClick={() => { setMode('signin'); setStep('signin'); setError(''); setNotice(''); setDebugInfo(''); setPassword(''); setConfirmPassword(''); }}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
                style={{
                  background: mode === 'signin' ? '#22c55e' : 'transparent',
                  color: mode === 'signin' ? '#062b12' : 'rgba(22,50,34,0.68)',
                  boxShadow: mode === 'signin' ? '0 10px 24px rgba(34,197,94,0.16)' : 'none',
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setStep('info'); setError(''); setNotice(''); setDebugInfo(''); setPassword(''); setConfirmPassword(''); }}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
                style={{
                  background: mode === 'signup' ? '#22c55e' : 'transparent',
                  color: mode === 'signup' ? '#062b12' : 'rgba(22,50,34,0.68)',
                  boxShadow: mode === 'signup' ? '0 10px 24px rgba(34,197,94,0.16)' : 'none',
                }}
              >
                Sign Up
              </button>
            </div>
          )}

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
              <button
                onClick={async () => {
                  clearCachedFarmerProfile();
                  if (isSupabaseEnabled && supabase) await supabase.auth.signOut();
                  setStep('signin');
                  setMode('signin');
                  setExistingName('');
                  setError('');
                  setNotice('');
                  setDebugInfo('');
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="w-full text-sm py-2" style={{ color: 'rgba(22,50,34,0.45)' }}>
                Sign in with different account
              </button>
            </div>
          )}

          {step === 'signin' && (
            <>
              <div>
                <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Sign In</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Sign in with your phone number and password to continue to your dashboard.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Mobile Number</label>
                <div style={{ display: 'flex', alignItems: 'stretch', border: '1px solid rgba(21,128,61,0.14)', borderRadius: '14px', overflow: 'hidden', background: 'rgba(255,255,255,0.9)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 14px', borderRight: '1px solid rgba(21,128,61,0.08)', background: 'rgba(220,252,231,0.7)', color: '#166534', fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="10-digit mobile number"
                    value={form.phone}
                    maxLength={10}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                    style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', padding: '10px 14px', fontSize: '0.95rem' }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                />
              </div>
              {notice && <p className="text-sm px-3 py-2 rounded-lg" style={{ color: '#166534', background: 'rgba(34,197,94,0.1)' }}>{notice}</p>}
              {error && <p className="text-sm text-red-400 bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
              {debugInfo && error && (
                <p className="text-xs px-3 py-2 rounded-lg" style={{ color: 'rgba(22,50,34,0.68)', background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(21,128,61,0.08)' }}>
                  {debugInfo}
                </p>
              )}
              {debugInfo && (error || notice) && (
                <p className="text-xs px-3 py-2 rounded-lg" style={{ color: 'rgba(22,50,34,0.68)', background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(21,128,61,0.08)' }}>
                  {debugInfo}
                </p>
              )}
              <button
                type="button"
                onClick={signInFarmer}
                disabled={loading || !form.phone.trim() || !password}
                className="btn-primary w-full justify-center"
                style={{ opacity: loading || !form.phone.trim() || !password ? 0.7 : 1 }}
              >
                {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing in...</> : 'Continue to Dashboard'}
              </button>
              <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                New here? Switch to <button type="button" onClick={() => { setMode('signup'); setStep('info'); setError(''); setNotice(''); setDebugInfo(''); }} style={{ color: '#166534', fontWeight: 700 }}>Sign Up</button>
              </p>
            </>
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
                <div style={{ display: 'flex', alignItems: 'stretch', border: '1px solid rgba(21,128,61,0.14)', borderRadius: '14px', overflow: 'hidden', background: 'rgba(255,255,255,0.9)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 14px', borderRight: '1px solid rgba(21,128,61,0.08)', background: 'rgba(220,252,231,0.7)', color: '#166534', fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
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
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Password</label>
                  <input
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Use at least 6 characters.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
              {error && <p className="text-sm text-red-400 bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
              <button type="button" onClick={() => {
                if (!form.name || !form.phone || !form.village || !form.state || !form.district) {
                  setError('Please fill all fields including state and district');
                  return;
                }
                if (!isValidIndianPhone(form.phone)) {
                  setError('Please enter a valid 10-digit Indian mobile number.');
                  return;
                }
                if (password.length < 6) {
                  setError('Password must be at least 6 characters long.');
                  return;
                }
                if (password !== confirmPassword) {
                  setError('Password and confirm password do not match.');
                  return;
                }
                setError('');
                setStep('language');
              }}
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
                    style={{ background: form.language === l.val ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.86)', borderColor: form.language === l.val ? '#22c55e' : 'rgba(21,128,61,0.12)', boxShadow: '0 10px 24px rgba(15,23,42,0.04)' }}>
                    <div className="text-3xl mb-2">{l.flag}</div>
                    <p className="font-bold" style={{ color: form.language === l.val ? '#166534' : 'var(--text-primary)' }}>{l.name}</p>
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
