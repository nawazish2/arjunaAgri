'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Lang, T, TKey, LANGUAGES } from './translations';

export type { Lang };
export { LANGUAGES };

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey) => string;
  tRaw: (en: string, hi: string) => string; // legacy helper
}

const LangContext = createContext<LangContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => T[key].en,
  tRaw: (en) => en,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const saved = localStorage.getItem('ui_lang') as Lang;
    if (saved && LANGUAGES.some(l => l.code === saved)) setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('ui_lang', l);
  };

  const t = (key: TKey): string => {
    const entry = T[key] as Record<string, string>;
    return entry[lang] ?? entry['en'];
  };

  // Legacy: used in pages that pass raw strings directly
  const tRaw = (en: string, hi: string) => lang === 'hi' ? hi : en;

  return (
    <LangContext.Provider value={{ lang, setLang, t, tRaw }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
