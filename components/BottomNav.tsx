'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV = [
  { href:'/', label:'Home', icon:(a:boolean)=>(
    <svg width="20" height="20" viewBox="0 0 24 24" fill={a?'currentColor':'none'} stroke="currentColor" strokeWidth={2}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  )},
  { href:'/soil', label:'Soil', icon:(a:boolean)=>(
    <svg width="20" height="20" viewBox="0 0 24 24" fill={a?'currentColor':'none'} stroke="currentColor" strokeWidth={2}><path d="M12 22V12m0 0C12 7 8 4 3 4c0 5 3 8 9 8zm0 0c0-5 4-8 9-8 0 5-3 8-9 8z"/></svg>
  )},
  { href:'/disease', label:'Disease', icon:(a:boolean)=>(
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>{a&&<circle cx="11" cy="11" r="4" fill="currentColor" opacity={0.4}/>}</svg>
  )},
  { href:'/fertilizer', label:'Fertilizer', icon:(a:boolean)=>(
    <svg width="20" height="20" viewBox="0 0 24 24" fill={a?'currentColor':'none'} stroke="currentColor" strokeWidth={2}><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>
  )},
  { href:'/voice', label:'Voice', icon:(a:boolean)=>(
    <svg width="20" height="20" viewBox="0 0 24 24" fill={a?'currentColor':'none'} stroke="currentColor" strokeWidth={2}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
  )},
  { href:'/market', label:'Market', icon:(a:boolean)=>(
    <svg width="20" height="20" viewBox="0 0 24 24" fill={a?'currentColor':'none'} stroke="currentColor" strokeWidth={2}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  )},
  { href:'/profile', label:'Profile', icon:(a:boolean)=>(
    <svg width="20" height="20" viewBox="0 0 24 24" fill={a?'currentColor':'none'} stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  )},
];

const MORE_LINKS = [
  { href: '/yield',      label: 'Yield & ROI',       icon: '📊' },
  { href: '/irrigation', label: 'Irrigation',         icon: '💧' },
  { href: '/expenses',   label: 'Cost Tracker',       icon: '💸' },
  { href: '/calendar',   label: 'Crop Calendar',      icon: '📅' },
];

export default function BottomNav(){
  const pathname=usePathname();
  const [showMore, setShowMore] = useState(false);
  const moreActive = MORE_LINKS.some(l => pathname === l.href);

  return(
    <>
      {/* More drawer */}
      {showMore && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMore(false)}
          style={{ background: 'rgba(0,0,0,0.5)' }}
        >
          <div
            className="absolute bottom-16 right-2 rounded-2xl p-2 shadow-2xl min-w-44"
            style={{ background: 'rgba(6,18,10,0.97)', border: '1px solid rgba(34,197,94,0.2)', backdropFilter: 'blur(24px)' }}
            onClick={e => e.stopPropagation()}
          >
            {MORE_LINKS.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setShowMore(false)}>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                  style={{
                    background: pathname === l.href ? 'rgba(34,197,94,0.12)' : 'transparent',
                    color: pathname === l.href ? '#4ade80' : 'rgba(134,239,172,0.7)',
                  }}>
                  <span>{l.icon}</span>
                  <span className="text-sm font-semibold">{l.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <nav style={{position:'fixed',bottom:0,left:0,right:0,zIndex:50,background:'rgba(3,10,5,0.97)',backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',borderTop:'1px solid rgba(34,197,94,0.12)'}}>
        <div className="flex items-center justify-around max-w-lg mx-auto" style={{paddingBottom:'max(0.25rem,env(safe-area-inset-bottom))'}}>
          {NAV.map(({href,icon,label})=>{
            const active=pathname===href;
            return(
              <Link key={href} href={href} style={{flex:1}}>
                <div className="flex flex-col items-center gap-0.5 py-2 relative transition-all">
                  {active && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full nav-active-dot" />}
                  <div style={{color:active?'#4ade80':'rgba(74,222,128,0.3)',transition:'color 0.2s',transform:active?'scale(1.1)':'scale(1)'}}>
                    {icon(active)}
                  </div>
                  <span style={{fontSize:'0.58rem',fontWeight:600,color:active?'#4ade80':'rgba(74,222,128,0.3)',transition:'color 0.2s'}}>{label}</span>
                </div>
              </Link>
            );
          })}

          {/* More button */}
          <button onClick={() => setShowMore(v => !v)} style={{flex:1}}>
            <div className="flex flex-col items-center gap-0.5 py-2 relative transition-all">
              {(showMore || moreActive) && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full nav-active-dot" />}
              <div style={{color:(showMore||moreActive)?'#4ade80':'rgba(74,222,128,0.3)',transition:'color 0.2s',transform:(showMore||moreActive)?'scale(1.1)':'scale(1)'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                </svg>
              </div>
              <span style={{fontSize:'0.58rem',fontWeight:600,color:(showMore||moreActive)?'#4ade80':'rgba(74,222,128,0.3)',transition:'color 0.2s'}}>More</span>
            </div>
          </button>
        </div>
      </nav>
    </>
  );
}
