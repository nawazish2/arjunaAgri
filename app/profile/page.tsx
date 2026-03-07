'use client';
import AuthGuard from '@/components/AuthGuard';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseEnabled } from '@/lib/supabase';

export default function ProfilePage() {
  const router = useRouter();
  const [farmer, setFarmer] = useState({ name: '', phone: '', village: '', state: '', district: '', pincode: '', language: 'en' });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [soilCount, setSoilCount] = useState(0);
  const [diseaseCount, setDiseaseCount] = useState(0);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeMsg, setPincodeMsg] = useState('');

  useEffect(() => {
    const farmerId = localStorage.getItem('farmer_id');
    if (!farmerId) return; // AuthGuard handles redirect
    const name = localStorage.getItem('farmer_name') || '';
    setFarmer(f => ({ ...f, name }));
    const fetchProfile = async () => {
      if (isSupabaseEnabled && supabase) {
        const [fp, sr, dr] = await Promise.all([
          supabase.from('farmers').select('*').eq('id', farmerId).single(),
          supabase.from('soil_reports').select('id', { count: 'exact' }).eq('farmer_id', farmerId),
          supabase.from('disease_reports').select('id', { count: 'exact' }).eq('farmer_id', farmerId),
        ]);
        if (fp.data) setFarmer(fp.data);
        setSoilCount(sr.count || 0);
        setDiseaseCount(dr.count || 0);
      } else {
        const p = localStorage.getItem('farmer_profile');
        if (p) setFarmer(JSON.parse(p));
        // Count from localStorage
        const sh = localStorage.getItem('soil_history');
        if (sh) setSoilCount(JSON.parse(sh).length);
        const dr = localStorage.getItem('latest_disease');
        if (dr) setDiseaseCount(1);
      }
    };
    fetchProfile();
  }, [router]);

  const lookupPincode = async (pin: string) => {
    if (pin.length !== 6) return;
    setPincodeLoading(true);
    setPincodeMsg('');
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data?.[0]?.Status === 'Success') {
        const po = data[0].PostOffice?.[0];
        if (po) {
          setFarmer(f => ({ ...f, district: po.District || f.district, state: po.State || f.state }));
          setPincodeMsg(`✅ ${po.District}, ${po.State}`);
        }
      } else {
        setPincodeMsg('❓ Pincode not found');
      }
    } catch {
      setPincodeMsg('');
    } finally {
      setPincodeLoading(false);
    }
  };

  const save = async () => {
    setLoading(true);
    const farmerId = localStorage.getItem('farmer_id');
    try {
      if (isSupabaseEnabled && supabase && farmerId && !farmerId.startsWith('local_')) {
        await supabase.from('farmers').update({ name: farmer.name, village: farmer.village, state: farmer.state, language: farmer.language }).eq('id', farmerId);
      }
      localStorage.setItem('farmer_name', farmer.name);
      localStorage.setItem('farmer_profile', JSON.stringify(farmer));
      setSaved(true); setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    } finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem('farmer_id');
    localStorage.removeItem('farmer_name');
    localStorage.removeItem('farmer_profile');
    if (isSupabaseEnabled && supabase) supabase.auth.signOut();
    router.push('/register');
  };

  return (
    <AuthGuard>
    <div className="min-h-screen relative overflow-hidden">
      <div className="orb w-64 h-64 -top-16 -right-16" style={{ background: '#22c55e' }} />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 page-enter">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold gradient-text">My Profile</h1>
          <button onClick={() => setEditing(!editing)} className="btn-secondary text-sm py-2 px-4">
            {editing ? '✕ Cancel' : '✏️ Edit'}
          </button>
        </div>

        {/* Avatar + Stats */}
        <div className="glass-card rounded-2xl p-5 mb-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl flex-shrink-0" style={{ background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.3)' }}>
            👨‍🌾
          </div>
          <div className="flex-1">
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{farmer.name}</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>📍 {farmer.village}{farmer.district ? `, ${farmer.district}` : ''}, {farmer.state}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>📱 +91 {farmer.phone}</p>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { icon: '🧪', label: 'Soil Tests', value: soilCount },
            { icon: '🔬', label: 'Disease Scans', value: diseaseCount },
            { icon: '🤖', label: 'AI Powered', value: '24/7' },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-xl p-3 text-center card-hover">
              <span className="text-2xl">{s.icon}</span>
              <p className="text-xl font-black mt-1" style={{ color: '#4ade80' }}>{s.value}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Edit Form */}
        <div className="glass-card rounded-2xl p-5 mb-4 space-y-4">
          <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Account Details</h3>
          {[
            { key: 'name', label: 'Full Name', icon: '👤' },
            { key: 'village', label: 'Village', icon: '🏘️' },
          ].map(({ key, label, icon }) => (
            <div key={key}>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{icon} {label}</label>
              {editing ? (
                <input value={(farmer as Record<string, string>)[key]} onChange={e => setFarmer({ ...farmer, [key]: e.target.value })} className="input-field" />
              ) : (
                <p className="px-3 py-2.5 rounded-xl text-sm" style={{ background: 'rgba(6,26,13,0.6)', color: 'var(--text-primary)' }}>
                  {(farmer as Record<string, string>)[key] || '—'}
                </p>
              )}
            </div>
          ))}

          {/* Pincode with auto-lookup */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>📮 Pincode</label>
            {editing ? (
              <div style={{ position: 'relative' }}>
                <input
                  value={farmer.pincode}
                  maxLength={6}
                  placeholder="6-digit pincode"
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    setFarmer({ ...farmer, pincode: val });
                    setPincodeMsg('');
                    if (val.length === 6) lookupPincode(val);
                  }}
                  className="input-field"
                  style={{ paddingRight: 40 }}
                />
                {pincodeLoading && (
                  <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>⏳</span>
                )}
              </div>
            ) : (
              <p className="px-3 py-2.5 rounded-xl text-sm" style={{ background: 'rgba(6,26,13,0.6)', color: 'var(--text-primary)' }}>
                {farmer.pincode || '—'}
              </p>
            )}
            {pincodeMsg && editing && (
              <p style={{ marginTop: 4, fontSize: 12, color: pincodeMsg.startsWith('✅') ? '#4ade80' : '#fbbf24' }}>{pincodeMsg}</p>
            )}
          </div>

          {/* District */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>🏛️ District</label>
            {editing ? (
              <input value={farmer.district} onChange={e => setFarmer({ ...farmer, district: e.target.value })} className="input-field" placeholder="Auto-filled from pincode" />
            ) : (
              <p className="px-3 py-2.5 rounded-xl text-sm" style={{ background: 'rgba(6,26,13,0.6)', color: 'var(--text-primary)' }}>
                {farmer.district || '—'}
              </p>
            )}
          </div>

          {/* State */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>📍 State</label>
            {editing ? (
              <input value={farmer.state} onChange={e => setFarmer({ ...farmer, state: e.target.value })} className="input-field" placeholder="Auto-filled from pincode" />
            ) : (
              <p className="px-3 py-2.5 rounded-xl text-sm" style={{ background: 'rgba(6,26,13,0.6)', color: 'var(--text-primary)' }}>
                {farmer.state || '—'}
              </p>
            )}
          </div>
          {editing && (
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>🌐 Language</label>
              <div className="flex gap-3">
                {([{ v: 'en', l: '🇬🇧 English' }, { v: 'hi', l: '🇮🇳 हिंदी' }] as const).map(({ v, l }) => (
                  <button key={v} type="button" onClick={() => setFarmer({ ...farmer, language: v })}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: farmer.language === v ? '#22c55e' : 'rgba(6,26,13,0.6)', color: farmer.language === v ? '#061a0d' : 'var(--text-muted)', border: `1px solid ${farmer.language === v ? '#22c55e' : 'rgba(34,197,94,0.15)'}` }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}
          {editing && (
            <button onClick={save} disabled={loading} className="btn-primary w-full justify-center">
              {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving...</> : '💾 Save Changes'}
            </button>
          )}
          {saved && <p className="text-center text-sm" style={{ color: '#4ade80' }}>✅ Profile saved!</p>}
        </div>

        {/* Danger Zone */}
        <div className="glass-card rounded-2xl p-5" style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
          <h3 className="font-bold text-sm mb-3" style={{ color: '#f87171' }}>Account Actions</h3>
          <button onClick={logout} className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}
