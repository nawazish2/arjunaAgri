'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import LangToggle from './LangToggle';
import { useLang } from '@/lib/lang';
import { subscribeToFarmerAuth } from '@/lib/farmer-auth';

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { t } = useLang();

  const NAV_LINKS = [
    { href: '/', label: t('nav_dashboard'), icon: '🏠' },
    { href: '/soil', label: t('dash_soil'), icon: '🌱' },
    { href: '/disease', label: t('nav_disease'), icon: '🔬' },
    { href: '/fertilizer', label: t('nav_fertilizer'), icon: '🧪' },
    { href: '/calendar', label: t('nav_calendar'), icon: '📅' },
    { href: '/market', label: t('nav_market'), icon: '📈' },
    { href: '/voice', label: t('nav_voice'), icon: '🎤' },
  ];

  const MORE_LINKS = [
    { href: '/yield', label: t('nav_yield'), icon: '📊' },
    { href: '/irrigation', label: t('nav_irrigation'), icon: '💧' },
    { href: '/expenses', label: t('nav_expenses'), icon: '💸' },
    { href: '/support', label: 'Support', icon: '🎧' },
    { href: '/pricing', label: 'Pricing', icon: '💳' },
  ];

  useEffect(() => {
    const unsubscribe = subscribeToFarmerAuth(setIsLoggedIn);
    return () => unsubscribe();
  }, [pathname]);

  const allLinks = [...NAV_LINKS, ...MORE_LINKS];
  const isMoreActive = MORE_LINKS.some((l) => pathname === l.href);
  const isMarketingHome = pathname === '/' && !isLoggedIn;
  const useLightShell = true;
  const primaryLinks = isMarketingHome
    ? [
        { href: '/soil', label: 'Soil AI' },
        { href: '/disease', label: 'Disease Scan' },
        { href: '/voice', label: 'Voice Assistant' },
        { href: '/pricing', label: 'Pricing' },
      ]
    : NAV_LINKS.map(({ href, label }) => ({ href, label }));

  const linkColor = useLightShell ? 'rgba(22,50,34,0.72)' : 'rgba(134,239,172,0.6)';
  const linkActive = useLightShell ? '#166534' : '#4ade80';

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: useLightShell ? 'rgba(248,255,251,0.88)' : 'rgba(6,26,13,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: useLightShell ? '1px solid rgba(21,128,61,0.08)' : '1px solid rgba(34,197,94,0.15)',
          boxShadow: useLightShell ? '0 10px 35px rgba(15,23,42,0.05)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ display: 'flex', alignItems: 'center', height: 72, gap: 8 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, textDecoration: 'none' }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  background: useLightShell ? 'linear-gradient(135deg,#dcfce7,#86efac)' : 'linear-gradient(135deg,#16a34a,#166534)',
                  boxShadow: useLightShell ? '0 12px 30px rgba(34,197,94,0.16)' : '0 0 16px rgba(34,197,94,0.35)',
                  flexShrink: 0,
                }}
              >
                🌾
              </div>
              <div className="hidden sm:block">
                <p className="font-black text-sm leading-tight" style={{ color: useLightShell ? '#10261b' : undefined }}>
                  <span className={useLightShell ? '' : 'gradient-text'}>Arjuna Agri</span>
                </p>
                <p className="text-xs leading-tight" style={{ color: useLightShell ? 'rgba(22,50,34,0.52)' : 'rgba(134,239,172,0.5)' }}>
                  {useLightShell ? 'Modern AgriTech for farm decisions' : 'AI Precision Farming'}
                </p>
              </div>
            </Link>

            <div className="hidden lg:flex" style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 4 }}>
              {primaryLinks.map(({ href, label }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    style={{
                      position: 'relative',
                      padding: useLightShell ? '8px 14px' : '6px 12px',
                      borderRadius: 999,
                      fontSize: 13,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      textDecoration: 'none',
                      color: active ? linkActive : linkColor,
                      background: active
                        ? useLightShell
                          ? 'rgba(34,197,94,0.1)'
                          : 'rgba(34,197,94,0.12)'
                        : 'transparent',
                      transition: 'all 0.15s',
                    }}
                  >
                    {active && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: useLightShell ? 5 : 0,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 16,
                          height: 2,
                          borderRadius: 2,
                          background: linkActive,
                          boxShadow: useLightShell ? 'none' : '0 0 6px #4ade80',
                        }}
                      />
                    )}
                    {label}
                  </Link>
                );
              })}

              {!isMarketingHome && (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setMoreOpen((v) => !v)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '6px 12px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: 'transparent',
                      border: 'none',
                      color: (isMoreActive || moreOpen) ? '#4ade80' : 'rgba(134,239,172,0.6)',
                      transition: 'all 0.15s',
                    }}
                  >
                    More
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                      style={{ transform: moreOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {moreOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 'calc(100% + 8px)',
                        minWidth: 176,
                        borderRadius: 12,
                        padding: '6px 0',
                        background: 'rgba(6,18,10,0.98)',
                        border: '1px solid rgba(34,197,94,0.2)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        zIndex: 100,
                      }}
                      onMouseLeave={() => setMoreOpen(false)}
                    >
                      {MORE_LINKS.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          onClick={() => setMoreOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 16px',
                            fontSize: 13,
                            fontWeight: 600,
                            textDecoration: 'none',
                            transition: 'all 0.15s',
                            color: pathname === l.href ? '#4ade80' : 'rgba(134,239,172,0.7)',
                            background: pathname === l.href ? 'rgba(34,197,94,0.1)' : 'transparent',
                          }}
                        >
                          <span>{l.icon}</span>{l.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 'auto' }}>
              <LangToggle variant={useLightShell ? 'light' : 'dark'} />

              {isLoggedIn ? (
                <Link
                  href="/profile"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'rgba(34,197,94,0.1)',
                    border: '1px solid rgba(34,197,94,0.2)',
                    textDecoration: 'none',
                    fontSize: 18,
                  }}
                  className="hidden sm:flex"
                >
                  👨‍🌾
                </Link>
              ) : isMarketingHome ? (
                <>
                  <Link href="/register" className="hidden md:inline-flex btn-soft" style={{ textDecoration: 'none', padding: '0.72rem 1.1rem', fontSize: 13 }}>
                    Sign In
                  </Link>
                  <button
                    onClick={() => router.push('/register')}
                    className="hidden sm:inline-flex btn-primary"
                    style={{ padding: '0.78rem 1.25rem', borderRadius: 999, fontSize: 13, boxShadow: '0 14px 32px rgba(34,197,94,0.2)' }}
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <Link href="/register" className="hidden sm:flex btn-primary" style={{ padding: '7px 16px', fontSize: 13, whiteSpace: 'nowrap', lineHeight: 1.4 }}>
                  {t('nav_signin')}
                </Link>
              )}

              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 5,
                  padding: 8,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: useLightShell ? '#2f4f3d' : 'rgba(134,239,172,0.8)',
                }}
              >
                <span style={{ display: 'block', width: 20, height: 2, borderRadius: 2, background: 'currentColor', transform: mobileOpen ? 'rotate(45deg) translateY(7px)' : 'none', transition: 'all 0.2s' }} />
                <span style={{ display: 'block', width: 20, height: 2, borderRadius: 2, background: 'currentColor', opacity: mobileOpen ? 0 : 1, transition: 'all 0.2s' }} />
                <span style={{ display: 'block', width: 20, height: 2, borderRadius: 2, background: 'currentColor', transform: mobileOpen ? 'rotate(-45deg) translateY(-7px)' : 'none', transition: 'all 0.2s' }} />
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div
            style={{
              borderTop: useLightShell ? '1px solid rgba(21,128,61,0.08)' : '1px solid rgba(34,197,94,0.1)',
              background: useLightShell ? 'rgba(252,255,252,0.96)' : 'rgba(6,18,10,0.98)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 gap-1">
              {allLinks.map(({ href, label, icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 12,
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'all 0.15s',
                      background: active
                        ? useLightShell
                          ? 'rgba(34,197,94,0.08)'
                          : 'rgba(34,197,94,0.12)'
                        : 'transparent',
                      color: active
                        ? useLightShell
                          ? '#166534'
                          : '#4ade80'
                        : useLightShell
                          ? 'rgba(22,50,34,0.72)'
                          : 'rgba(134,239,172,0.6)',
                    }}
                  >
                    <span>{icon}</span>{label}
                  </Link>
                );
              })}
              {isLoggedIn ? (
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 600,
                    color: useLightShell ? 'rgba(22,50,34,0.72)' : 'rgba(134,239,172,0.6)',
                    textDecoration: 'none',
                  }}
                >
                  <span>👨‍🌾</span>Profile
                </Link>
              ) : isMarketingHome ? (
                <>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 12,
                      fontSize: 13,
                      fontWeight: 600,
                      color: useLightShell ? 'rgba(22,50,34,0.72)' : 'rgba(134,239,172,0.6)',
                      textDecoration: 'none',
                    }}
                  >
                    <span>🔐</span>Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 12,
                      fontSize: 13,
                      fontWeight: 600,
                      color: useLightShell ? '#166534' : '#4ade80',
                      textDecoration: 'none',
                    }}
                  >
                    <span>→</span>Sign Up
                  </Link>
                </>
              ) : (
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 600,
                    color: useLightShell ? '#166534' : '#4ade80',
                    textDecoration: 'none',
                  }}
                >
                  <span>🔐</span>{t('nav_signin')}
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <div style={{ height: 72 }} />
    </>
  );
}

