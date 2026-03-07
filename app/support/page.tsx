'use client';

import { useState, useRef, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';

type Tab = 'ai' | 'human';
type Msg = { role: 'user' | 'ai'; text: string; time: string };

const FAQS = [
  { q: 'How do I detect crop disease?', a: 'Go to Disease Detection, upload a photo of the affected plant, and our AI will identify the disease and suggest treatment within seconds.' },
  { q: 'How is the fertilizer dose calculated?', a: 'Select your crop, soil type, and growth stage. Our AI uses soil health data and crop requirements to suggest precise NPK doses in kg/acre.' },
  { q: 'Where does market price data come from?', a: 'We use AGMARKNET and e-NAM API data updated daily, covering 500+ mandis across India with MSP comparison.' },
  { q: 'Is my farm data private?', a: 'Yes, all data is encrypted and stored securely in Supabase. We never share your data with third parties.' },
  { q: 'How do I change my language?', a: 'Click the language button in the top navbar and choose from English, Hindi, Telugu, Tamil, Marathi, or Punjabi.' },
];

function nowTime() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function SupportPage() {
  const [tab, setTab] = useState<Tab>('ai');
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'ai', text: 'Namaste! 🌾 I\'m Arjuna, your farming assistant. How can I help you today? You can ask me about crops, diseases, market prices, or anything related to your farm.', time: nowTime() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [issue, setIssue] = useState('');
  const [category, setCategory] = useState('Crop Disease / Pest Problem');
  const [submitted, setSubmitted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMsgs(prev => [...prev, { role: 'user', text: userMsg, time: nowTime() }]);
    setLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg,
          systemPrompt: 'You are Arjuna, a helpful AI support assistant for Indian farmers on the Arjuna Agri platform. Answer questions about farming, crops, diseases, fertilizers, market prices, and how to use the platform features. Be friendly, concise, and use simple language. Always respond in the same language the user writes in.',
        }),
      });
      const data = await res.json();
      setMsgs(prev => [...prev, { role: 'ai', text: data.result || 'Sorry, I could not process that. Please try again.', time: nowTime() }]);
    } catch {
      setMsgs(prev => [...prev, { role: 'ai', text: 'Sorry, something went wrong. Please try again or contact human support.', time: nowTime() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl glow-green"
              style={{ background: 'linear-gradient(135deg,#16a34a,#166534)' }}>🎧</div>
            <div>
              <h1 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>Customer Support</h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>We&apos;re here to help — choose how you&apos;d like assistance</p>
            </div>
          </div>
        </div>

        {/* Tab selector */}
        <div className="flex gap-3 mb-6">
          {[
            { id: 'ai' as Tab, icon: '🤖', label: 'AI Assistant', sub: 'Instant · 24/7 · Multilingual', color: '#22c55e', bg: 'rgba(34,197,94,0.2)' },
            { id: 'human' as Tab, icon: '👨‍💼', label: 'Human Support', sub: 'Mon–Sat · 9am–6pm IST', color: '#3b82f6', bg: 'rgba(59,130,246,0.2)' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 flex items-center gap-3 py-4 px-5 rounded-2xl font-bold text-sm transition-all text-left"
              style={{
                background: tab === t.id ? `linear-gradient(135deg,${t.bg},transparent)` : 'rgba(6,26,13,0.5)',
                border: `2px solid ${tab === t.id ? t.color : 'rgba(34,197,94,0.15)'}`,
                color: tab === t.id ? t.color : 'var(--text-secondary)',
              }}>
              <span className="text-2xl">{t.icon}</span>
              <div className="flex-1">
                <div>{t.label}</div>
                <div className="text-xs font-normal opacity-70 mt-0.5">{t.sub}</div>
              </div>
              {tab === t.id && (
                <span className="text-xs px-2 py-1 rounded-full flex-shrink-0"
                  style={{ background: `${t.bg}`, color: t.color, border: `1px solid ${t.color}40` }}>
                  ● Active
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main panel */}
          <div className="lg:col-span-2">

            {/* ── AI Chat ── */}
            {tab === 'ai' && (
              <div className="glass-card rounded-2xl overflow-hidden" style={{ height: 500, display: 'flex', flexDirection: 'column' }}>
                {/* Chat header */}
                <div className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(34,197,94,0.1)', background: 'rgba(34,197,94,0.05)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg floating"
                    style={{ background: 'linear-gradient(135deg,#16a34a,#166534)', boxShadow: '0 0 12px rgba(34,197,94,0.4)' }}>🌾</div>
                  <div className="flex-1">
                    <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Arjuna AI Support</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: '0 0 5px #4ade80' }} />
                      <span className="text-xs" style={{ color: '#4ade80' }}>Online — replies instantly</span>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>
                    Powered by Groq AI
                  </span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(34,197,94,0.2) transparent' }}>
                  {msgs.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                      {m.role === 'ai' && (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-1"
                          style={{ background: 'linear-gradient(135deg,#16a34a,#166534)' }}>🌾</div>
                      )}
                      <div style={{ maxWidth: '78%' }}>
                        <div className="px-4 py-2.5 text-sm leading-relaxed"
                          style={{
                            background: m.role === 'user' ? 'linear-gradient(135deg,#16a34a,#166534)' : 'rgba(34,197,94,0.07)',
                            color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
                            borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                            border: m.role === 'ai' ? '1px solid rgba(34,197,94,0.15)' : 'none',
                          }}>
                          {m.text}
                        </div>
                        <p className="text-xs mt-1 px-1" style={{ color: 'var(--text-muted)', textAlign: m.role === 'user' ? 'right' : 'left' }}>{m.time}</p>
                      </div>
                      {m.role === 'user' && (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-1"
                          style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.2)' }}>👤</div>
                      )}
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
                        style={{ background: 'linear-gradient(135deg,#16a34a,#166534)' }}>🌾</div>
                      <div className="px-4 py-3 rounded-2xl" style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)' }}>
                        <div className="flex gap-1.5 items-center h-4">
                          {[0,1,2].map(i => (
                            <span key={i} className="w-2 h-2 rounded-full"
                              style={{ background: '#4ade80', animation: `bounce 1s ${i*0.15}s infinite` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Quick questions */}
                <div className="px-4 py-2 flex gap-2 overflow-x-auto" style={{ borderTop: '1px solid rgba(34,197,94,0.08)' }}>
                  {['How to detect disease?', 'Best fertilizer for wheat?', 'Today\'s mandi prices?'].map(q => (
                    <button key={q} onClick={() => { setInput(q); }}
                      className="text-xs px-3 py-1.5 rounded-full flex-shrink-0 transition-all"
                      style={{ background: 'rgba(34,197,94,0.08)', color: '#86efac', border: '1px solid rgba(34,197,94,0.15)', whiteSpace: 'nowrap' }}>
                      {q}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(34,197,94,0.1)' }}>
                  <div className="flex gap-2">
                    <input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      placeholder="Type your question..."
                      className="flex-1 input-field"
                      style={{ fontSize: 14, borderRadius: 12 }}
                    />
                    <button onClick={sendMessage} disabled={loading || !input.trim()}
                      className="btn-primary"
                      style={{ padding: '10px 16px', opacity: !input.trim() ? 0.5 : 1, borderRadius: 12, fontSize: 16 }}>
                      ➤
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Human Support Form ── */}
            {tab === 'human' && (
              <div className="glass-card rounded-2xl p-6">
                {submitted ? (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto floating"
                      style={{ background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.3)' }}>✅</div>
                    <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Request Submitted!</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Our team will contact you within <strong style={{ color: '#4ade80' }}>4 business hours</strong> on<br/>
                      <strong style={{ color: '#4ade80' }}>+91 {phone}</strong>
                    </p>
                    <div className="inline-block px-4 py-2 rounded-xl text-sm font-mono" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#86efac' }}>
                      Ticket ID: #AA-{Date.now().toString().slice(-6)}
                    </div>
                    <div>
                      <button onClick={() => setSubmitted(false)} className="btn-secondary">Submit Another Request</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>📋 Submit a Callback Request</h3>
                      <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Fill the form and our agriculture experts will call you back within 4 hours</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Your Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ramesh Kumar" className="input-field" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Phone Number</label>
                        <div style={{ display: 'flex', alignItems: 'stretch', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, overflow: 'hidden', background: 'rgba(15,46,24,0.5)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', padding: '0 10px', background: 'rgba(34,197,94,0.06)', color: '#86efac', fontSize: 13, fontWeight: 600, borderRight: '1px solid rgba(34,197,94,0.15)', flexShrink: 0 }}>+91</span>
                          <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))} placeholder="10-digit" maxLength={10} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', padding: '10px 12px', fontSize: 14 }} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Issue Category</label>
                      <select value={category} onChange={e => setCategory(e.target.value)} className="input-field"
                        style={{ appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234ade80' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
                        <option style={{ background: '#061a0d' }}>Crop Disease / Pest Problem</option>
                        <option style={{ background: '#061a0d' }}>Fertilizer Recommendation</option>
                        <option style={{ background: '#061a0d' }}>Market Price Query</option>
                        <option style={{ background: '#061a0d' }}>Technical Issue with App</option>
                        <option style={{ background: '#061a0d' }}>Account / Profile Help</option>
                        <option style={{ background: '#061a0d' }}>Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Describe Your Issue</label>
                      <textarea value={issue} onChange={e => setIssue(e.target.value)} rows={4}
                        placeholder="Please describe your problem in detail — crop name, symptoms, location..." className="input-field resize-none" />
                    </div>

                    <button
                      onClick={() => { if (name && phone.length === 10 && issue) setSubmitted(true); }}
                      disabled={!name || phone.length !== 10 || !issue}
                      className="btn-primary w-full justify-center"
                      style={{ opacity: (!name || phone.length !== 10 || !issue) ? 0.5 : 1 }}>
                      📤 Submit Callback Request
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Contact options */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-bold text-xs mb-4 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Quick Contact</h3>
              <div className="space-y-2.5">
                {[
                  { icon: '📱', label: 'WhatsApp', value: '+91 98765 43210', color: '#22c55e', href: 'https://wa.me/919876543210' },
                  { icon: '📞', label: 'Helpline', value: '1800-XXX-XXXX', color: '#60a5fa', href: 'tel:18001234567' },
                  { icon: '✉️', label: 'Email', value: 'support@arjunaagri.in', color: '#f59e0b', href: 'mailto:support@arjunaagri.in' },
                ].map(c => (
                  <a key={c.label} href={c.href} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl transition-all"
                    style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.1)', textDecoration: 'none' }}>
                    <span className="text-xl">{c.icon}</span>
                    <div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.label}</p>
                      <p className="text-sm font-bold" style={{ color: c.color }}>{c.value}</p>
                    </div>
                  </a>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl text-center" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
                <p className="text-xs font-semibold" style={{ color: '#4ade80' }}>🕐 Support Hours</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Mon–Sat: 9 AM – 6 PM IST</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>AI Chat: 24/7 always on</p>
              </div>
            </div>

            {/* FAQs */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-bold text-xs mb-4 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>FAQs</h3>
              <div className="space-y-2">
                {FAQS.map((faq, i) => (
                  <FaqItem key={i} q={faq.q} a={faq.a} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1px solid rgba(34,197,94,0.12)', borderRadius: 10, overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full text-left flex items-start justify-between gap-2 px-3 py-2.5"
        style={{ background: open ? 'rgba(34,197,94,0.08)' : 'transparent', color: 'var(--text-primary)' }}>
        <span className="text-xs font-semibold leading-snug">{q}</span>
        <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: '#4ade80', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
      </button>
      {open && (
        <div className="px-3 pb-3 pt-2 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)', borderTop: '1px solid rgba(34,197,94,0.08)' }}>
          {a}
        </div>
      )}
    </div>
  );
}
