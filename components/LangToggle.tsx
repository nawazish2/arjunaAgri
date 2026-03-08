'use client';
import { useState, useRef, useEffect } from 'react';
import { useLang, LANGUAGES } from '@/lib/lang';

export default function LangToggle({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
  const isLight = variant === 'light';

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
        style={{
          background: isLight ? 'rgba(255,255,255,0.86)' : 'rgba(74,222,128,0.12)',
          color: isLight ? '#166534' : '#4ade80',
          border: isLight ? '1px solid rgba(21,128,61,0.14)' : '1px solid rgba(74,222,128,0.25)',
          boxShadow: isLight ? '0 10px 24px rgba(21,128,61,0.08)' : 'none',
        }}
      >
        <span>{current.flag}</span>
        <span>{current.nativeName}</span>
        <span style={{ fontSize: 8, opacity: 0.6 }}>▼</span>
      </button>

      {open && (
        <div
          className={`${isLight ? 'landing-surface-strong' : 'glass-card'} rounded-xl overflow-hidden`}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: 160,
            zIndex: 200,
            border: isLight ? '1px solid rgba(21,128,61,0.14)' : '1px solid rgba(34,197,94,0.2)',
            boxShadow: isLight ? '0 18px 38px rgba(15,23,42,0.12)' : '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => { setLang(l.code); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all text-left"
              style={{
                background: lang === l.code ? (isLight ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.15)') : 'transparent',
                color: lang === l.code ? (isLight ? '#166534' : '#4ade80') : (isLight ? 'rgba(22,50,34,0.8)' : 'var(--text-secondary)'),
              }}>
              <span style={{ fontSize: 16 }}>{l.flag}</span>
              <div>
                <div style={{ fontWeight: lang === l.code ? 700 : 400 }}>{l.nativeName}</div>
                <div style={{ fontSize: 10, opacity: isLight ? 0.55 : 0.5 }}>{l.name}</div>
              </div>
              {lang === l.code && <span style={{ marginLeft: 'auto', fontSize: 12 }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

