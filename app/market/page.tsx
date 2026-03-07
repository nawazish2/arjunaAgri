'use client';
import AuthGuard from '@/components/AuthGuard';
import { useState } from 'react';

const MSP_2024 = [
  {crop:'Wheat (गेहूं)',msp:2275,unit:'quintal',icon:'🌾',season:'Rabi',trend:'up',change:'+150'},
  {crop:'Rice/Paddy (धान)',msp:2300,unit:'quintal',icon:'🌾',season:'Kharif',trend:'up',change:'+117'},
  {crop:'Maize (मक्का)',msp:2090,unit:'quintal',icon:'🌽',season:'Kharif',trend:'up',change:'+128'},
  {crop:'Soybean (सोयाबीन)',msp:4892,unit:'quintal',icon:'🫘',season:'Kharif',trend:'up',change:'+292'},
  {crop:'Cotton (कपास) Long',msp:7521,unit:'quintal',icon:'🌿',season:'Kharif',trend:'up',change:'+501'},
  {crop:'Mustard (सरसों)',msp:5950,unit:'quintal',icon:'🌻',season:'Rabi',trend:'up',change:'+200'},
  {crop:'Gram/Chana (चना)',msp:5440,unit:'quintal',icon:'🫘',season:'Rabi',trend:'up',change:'+105'},
  {crop:'Sunflower (सूरजमुखी)',msp:7280,unit:'quintal',icon:'🌻',season:'Kharif',trend:'up',change:'+325'},
  {crop:'Groundnut (मूंगफली)',msp:6783,unit:'quintal',icon:'🥜',season:'Kharif',trend:'up',change:'+406'},
  {crop:'Sugarcane (गन्ना)',msp:340,unit:'quintal',icon:'🎋',season:'Annual',trend:'up',change:'+25'},
];

const SCHEMES = [
  {
    name:'PM-KISAN Samman Nidhi',icon:'💰',color:'#22c55e',
    benefit:'₹6,000/year in 3 installments of ₹2,000 directly to bank account',
    who:'All landholding farmer families',
    how:'Register at pmkisan.gov.in or nearest CSC/Patwari office',
    link:'https://pmkisan.gov.in',
  },
  {
    name:'Pradhan Mantri Fasal Bima Yojana',icon:'🛡️',color:'#60a5fa',
    benefit:'Crop insurance at 2% premium (Kharif), 1.5% (Rabi). Govt pays rest',
    who:'All farmers growing notified crops',
    how:'Apply through bank/cooperative at time of crop loan',
    link:'https://pmfby.gov.in',
  },
  {
    name:'Kisan Credit Card (KCC)',icon:'💳',color:'#fcd34d',
    benefit:'Crop loans up to ₹3 lakh at 4% interest (after 3% interest subvention)',
    who:'All farmers, sharecroppers, tenant farmers',
    how:'Apply at any bank/cooperative/PACS with land documents',
    link:'https://nabard.org',
  },
  {
    name:'Soil Health Card Scheme',icon:'🌱',color:'#4ade80',
    benefit:'Free soil testing + personalized fertilizer recommendations printed card',
    who:'All farmers — free of cost',
    how:'Contact local Agriculture Dept / Kisan Seva Kendra',
    link:'https://soilhealth.dac.gov.in',
  },
  {
    name:'PM Krishi Sinchai Yojana',icon:'💧',color:'#93c5fd',
    benefit:'55–75% subsidy on drip/sprinkler irrigation equipment',
    who:'All farmers. SC/ST get extra 10% subsidy',
    how:'Apply at State Agriculture Dept / horticulture office',
    link:'https://pmksy.gov.in',
  },
  {
    name:'eNAM — National Market',icon:'🏪',color:'#c084fc',
    benefit:'Sell crops at best price across India via online mandi platform',
    who:'Any farmer with land documents + bank account',
    how:'Register at enam.gov.in or nearest APMC mandi',
    link:'https://enam.gov.in',
  },
];

export default function MarketPage(){
  const [tab,setTab]=useState<'msp'|'schemes'>('msp');
  const [season,setSeason]=useState<'All'|'Kharif'|'Rabi'>('All');

  const filtered=season==='All'?MSP_2024:MSP_2024.filter(m=>m.season===season||m.season==='Annual');

  return (
    <AuthGuard>
    <div className="app-light min-h-screen relative overflow-hidden">
      <div className="orb w-72 h-72 -top-16 -left-16" style={{background:'#22c55e'}}/>
      <div className="orb w-48 h-48 bottom-24 -right-12" style={{background:'#f59e0b',animationDelay:'2s'}}/>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 page-enter">
        <h1 className="text-2xl font-bold gradient-text mb-1">Market & Schemes</h1>
        <p className="text-sm mb-5" style={{color:'var(--text-secondary)'}}>MSP 2024-25 rates & government schemes for farmers</p>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 p-1 rounded-2xl" style={{background:'rgba(255,255,255,0.82)',border:'1px solid rgba(21,128,61,0.12)', boxShadow:'0 10px 28px rgba(15,23,42,0.05)'}}>
          {[{k:'msp',l:'📈 MSP Prices'},{k:'schemes',l:'🏛️ Gov Schemes'}].map(({k,l})=>(
            <button key={k} onClick={()=>setTab(k as 'msp'|'schemes')}
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all"
              style={{background:tab===k?'#22c55e':'transparent',color:tab===k?'#061a0d':'var(--text-muted)'}}>
              {l}
            </button>
          ))}
        </div>

        {/* MSP Tab */}
        {tab==='msp'&&(
          <div>
            <div className="glass-card-amber rounded-2xl p-3 mb-4 flex items-start gap-2">
              <span className="text-lg mt-0.5">ℹ️</span>
              <p className="text-xs" style={{color:'var(--text-secondary)'}}>Minimum Support Price (MSP) announced by Government of India for 2024-25 crop year. These are minimum guaranteed prices.</p>
            </div>
            {/* Season filter */}
            <div className="flex gap-2 mb-4">
              {(['All','Kharif','Rabi'] as const).map(s=>(
                <button key={s} onClick={()=>setSeason(s)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={{background:season===s?'#22c55e':'rgba(6,26,13,0.7)',color:season===s?'#061a0d':'var(--text-muted)',border:`1px solid ${season===s?'#22c55e':'rgba(34,197,94,0.15)'}`}}>
                  {s==='All'?'All Seasons':s}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {filtered.map((m,i)=>(
                <div key={i} className="glass-card rounded-xl px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{m.icon}</span>
                    <div>
                      <p className="font-semibold text-sm" style={{color:'var(--text-primary)'}}>{m.crop}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs px-1.5 py-0.5 rounded-full"
                          style={{background:m.season==='Kharif'?'rgba(34,197,94,0.1)':'rgba(96,165,250,0.1)',color:m.season==='Kharif'?'#4ade80':'#93c5fd'}}>
                          {m.season}
                        </span>
                        <span className="text-xs" style={{color:'#4ade80'}}>▲ {m.change} vs last year</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg" style={{color:'#fcd34d'}}>₹{m.msp.toLocaleString('en-IN')}</p>
                    <p className="text-xs" style={{color:'var(--text-muted)'}}>per {m.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schemes Tab */}
        {tab==='schemes'&&(
          <div className="space-y-3">
            {SCHEMES.map((s,i)=>(
              <div key={i} className="glass-card rounded-2xl p-4" style={{border:`1px solid ${s.color}20`}}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{background:s.color+'15'}}>
                    {s.icon}
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{color:'var(--text-primary)'}}>{s.name}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="rounded-lg px-3 py-2" style={{background:'rgba(6,26,13,0.7)'}}>
                    <p className="text-xs font-semibold mb-0.5" style={{color:s.color}}>💰 Benefit</p>
                    <p className="text-xs" style={{color:'var(--text-secondary)'}}>{s.benefit}</p>
                  </div>
                  <div className="rounded-lg px-3 py-2" style={{background:'rgba(6,26,13,0.7)'}}>
                    <p className="text-xs font-semibold mb-0.5" style={{color:'var(--text-muted)'}}>👤 Who can apply</p>
                    <p className="text-xs" style={{color:'var(--text-secondary)'}}>{s.who}</p>
                  </div>
                  <div className="rounded-lg px-3 py-2" style={{background:'rgba(6,26,13,0.7)'}}>
                    <p className="text-xs font-semibold mb-0.5" style={{color:'var(--text-muted)'}}>📋 How to apply</p>
                    <p className="text-xs" style={{color:'var(--text-secondary)'}}>{s.how}</p>
                  </div>
                </div>
                <a href={s.link} target="_blank" rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold w-full"
                  style={{background:s.color+'15',color:s.color,border:`1px solid ${s.color}30`}}>
                  🔗 Visit Official Website
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </AuthGuard>
  );
}
