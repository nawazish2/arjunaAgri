'use client';
import { useState, useRef, useEffect } from 'react';
import { useLang, LANGUAGES } from '@/lib/lang';

export default function LangToggle() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Change language"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
        style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)' }}
      >
        <span>{current.flag}</span>
        <span>{current.nativeName}</span>
        <span style={{ fontSize: 8, opacity: 0.6 }}>▼</span>
      </button>

      {open && (
        <div className="glass-card rounded-xl overflow-hidden"
          style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 160, zIndex: 200, border: '1px solid rgba(34,197,94,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => { setLang(l.code); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all text-left"
              style={{ background: lang === l.code ? 'rgba(34,197,94,0.15)' : 'transparent', color: lang === l.code ? '#4ade80' : 'var(--text-secondary)' }}>
              <span style={{ fontSize: 16 }}>{l.flag}</span>
              <div>
                <div style={{ fontWeight: lang === l.code ? 700 : 400 }}>{l.nativeName}</div>
                <div style={{ fontSize: 10, opacity: 0.5 }}>{l.name}</div>
              </div>
              {lang === l.code && <span style={{ marginLeft: 'auto', fontSize: 12 }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

