'use client';
import AuthGuard from '@/components/AuthGuard';

import { useState, useRef } from 'react';
import { supabase, isSupabaseEnabled } from '@/lib/supabase';
import { getActiveFarmerId } from '@/lib/farmer-auth';
import type { DiseaseResult } from '@/lib/types';

export default function DiseasePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please upload an image file'); return; }
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setResult(null);
    setError('');
  };

  const analyze = async () => {
    if (!preview) return;
    setLoading(true);
    setError('');
    try {
      const base64 = preview.split(',')[1];
      const mimeType = preview.split(';')[0].split(':')[1];
      const res = await fetch('/api/disease-detect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: base64, mimeType }) });
      if (res.status === 429) throw new Error('⏳ Free API quota exhausted. Try again in 1 minute, or add a second Gemini key in .env.local as GEMINI_API_KEY_2');
      if (!res.ok) throw new Error('AI analysis failed');
      const data: DiseaseResult = await res.json();
      setResult(data);
      const farmerId = await getActiveFarmerId();
      if (isSupabaseEnabled && supabase && farmerId) {
        await supabase.from('disease_reports').insert([{ farmer_id: farmerId, disease_name: data.diseaseName, severity: data.severity, actions: data.immediateActions, treatments: data.treatments }]);
      } else {
        localStorage.setItem('latest_disease', JSON.stringify({ ...data, created_at: new Date().toISOString() }));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally { setLoading(false); }
  };

  const severityStyle = (s: string) => {
    const sl = s.toLowerCase();
    if (sl === 'high') return { bg: 'rgba(239,68,68,0.12)', color: '#f87171', border: 'rgba(239,68,68,0.3)' };
    if (sl === 'medium') return { bg: 'rgba(245,158,11,0.12)', color: '#fcd34d', border: 'rgba(245,158,11,0.3)' };
    return { bg: 'rgba(34,197,94,0.12)', color: '#4ade80', border: 'rgba(34,197,94,0.3)' };
  };

  return (
    <AuthGuard>
    <div className="app-light min-h-screen relative overflow-hidden">
      <div className="orb w-72 h-72 -top-20 -left-20" style={{ background: '#f59e0b' }} />
      <div className="orb w-48 h-48 bottom-24 -right-12" style={{ background: '#22c55e', animationDelay: '3s' }} />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 page-enter">
        <h1 className="text-2xl font-bold gradient-text mb-1">Disease Detection</h1>
        <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Upload a leaf or plant photo for AI diagnosis</p>

        {/* Upload Area */}
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const file = e.dataTransfer.files[0]; if (file) handleFile(file); }}
          className="rounded-2xl mb-4 overflow-hidden cursor-pointer transition-all"
          style={{
            border: `2px dashed ${dragging ? '#22c55e' : 'rgba(34,197,94,0.25)'}`,
            background: dragging ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.78)',
            minHeight: preview ? undefined : 180,
          }}>
          {preview ? (
            <img src={preview} alt="Uploaded" className="w-full max-h-64 object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: 'rgba(34,197,94,0.1)' }}>📷</div>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Tap to upload photo</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>or drag & drop here</p>
              <span className="badge badge-green">JPG / PNG / WebP</span>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

        {preview && !result && (
          <div className="flex gap-3 mb-4">
            <button onClick={() => { setPreview(null); setResult(null); }} className="btn-secondary flex-1">🔄 Change Photo</button>
            <button onClick={analyze} disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Analyzing...</> : '🔬 Analyze Disease'}
            </button>
          </div>
        )}

        {error && <p className="text-sm text-red-400 bg-red-900/20 px-4 py-3 rounded-xl mb-4">{error}</p>}

        {/* Results */}
        {result && (
          <div className="space-y-3 page-enter">
            {/* Disease Summary */}
            <div className="glass-card rounded-2xl p-5 glow-amber">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Detected Condition</p>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{result.diseaseName}</h3>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Severity</p>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{ background: severityStyle(result.severity).bg, color: severityStyle(result.severity).color, border: `1px solid ${severityStyle(result.severity).border}` }}>
                    {result.severity.toLowerCase() === 'high' ? '🔴' : result.severity.toLowerCase() === 'medium' ? '🟡' : '🟢'} {result.severity}
                  </span>
                </div>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{result.preventionTips}</p>
            </div>

            {/* Immediate Actions */}
            <div className="glass-card rounded-2xl p-5">
              <p className="text-sm font-bold mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center text-xs">⚡</span>
                <span style={{ color: '#f87171' }}>Immediate Actions</span>
              </p>
              <ul className="space-y-2">
                {result.immediateActions.map((a, i) => (
                  <li key={i} className="flex gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold mt-0.5"
                      style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171' }}>{i + 1}</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>

            {/* Treatments */}
            <div className="glass-card rounded-2xl p-5">
              <p className="text-sm font-bold mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ background: 'rgba(34,197,94,0.15)' }}>💊</span>
                <span style={{ color: '#4ade80' }}>Treatment Options</span>
                <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>(cheapest first)</span>
              </p>
              <div className="space-y-3">
                {result.treatments.map((t, i) => (
                  <div key={i} className="rounded-xl p-3.5" style={{ background: 'rgba(255,255,255,0.78)', border: '1px solid rgba(21,128,61,0.1)' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{t.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: t.type === 'organic' ? 'rgba(34,197,94,0.12)' : 'rgba(96,165,250,0.12)', color: t.type === 'organic' ? '#4ade80' : '#93c5fd' }}>
                          {t.type === 'organic' ? '🌿' : '🧪'} {t.type}
                        </span>
                        <span className="font-bold text-sm" style={{ color: '#fcd34d' }}>{t.estimatedCost}</span>
                      </div>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.dosage}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  const text = `🌿 *Arjuna Agri — Disease Alert*\n\n*Detected:* ${result.diseaseName}\n*Severity:* ${result.severity}\n\n*Immediate Actions:*\n${result.immediateActions.map((a,i)=>`${i+1}. ${a}`).join('\n')}\n\n*Treatment:* ${result.treatments[0]?.name} — ${result.treatments[0]?.estimatedCost}\n\n*Prevention:* ${result.preventionTips}\n\n_Diagnosed by Arjuna Agri AI_`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold"
                style={{ background: 'rgba(37,211,102,0.1)', color: '#15803d', border: '1px solid rgba(21,128,61,0.18)' }}>
                📲 Share on WhatsApp
              </button>
              <button onClick={() => { setPreview(null); setResult(null); }}
                className="flex-1 btn-secondary">📷 Analyze Another</button>
            </div>
          </div>
        )}
      </div>
    </div>
    </AuthGuard>
  );
}
