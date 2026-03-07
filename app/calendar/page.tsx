'use client';
import AuthGuard from '@/components/AuthGuard';
import { useState } from 'react';

const CALENDARS: Record<string, {
  icon: string; season: string; duration: number;
  stages: { name: string; daysFrom: number; daysTo: number; icon: string; color: string; tasks: string[] }[];
}> = {
  wheat: { icon:'🌾', season:'Rabi (Oct–Apr)', duration: 150,
    stages:[
      {name:'Land Prep',daysFrom:0,daysTo:7,icon:'🚜',color:'#f59e0b',tasks:['Deep plough 2–3 times','Apply 5 tonnes FYM/acre','Level field for uniform irrigation']},
      {name:'Sowing',daysFrom:7,daysTo:14,icon:'🌱',color:'#22c55e',tasks:['Sow at 100 kg seed/acre','Row spacing: 20–22 cm','Seed depth: 4–5 cm','Apply basal DAP + MOP']},
      {name:'First Irrigation',daysFrom:21,daysTo:25,icon:'💧',color:'#60a5fa',tasks:['Crown root initiation stage','Critical — do not skip','Apply ⅓ Urea after irrigation']},
      {name:'Tillering',daysFrom:25,daysTo:60,icon:'🌿',color:'#4ade80',tasks:['Second irrigation at 40–45 days','Apply second ⅓ Urea','Watch for yellow rust disease','Spray weedicide if needed']},
      {name:'Jointing & Heading',daysFrom:60,daysTo:100,icon:'📏',color:'#c084fc',tasks:['Third irrigation at 65 days','Apply remaining Urea','Spray for aphids if seen','Avoid waterlogging']},
      {name:'Grain Filling',daysFrom:100,daysTo:130,icon:'🌻',color:'#fcd34d',tasks:['Fourth irrigation at 90 days','Last irrigation at 105 days','Watch for terminal heat stress','Do NOT apply nitrogen now']},
      {name:'Harvest',daysFrom:130,daysTo:150,icon:'🏆',color:'#22c55e',tasks:['Harvest at 85–90% moisture','Use combine or manual harvesting','Thresh and dry immediately','Store at <12% moisture']},
    ]
  },
  rice: { icon:'🌾', season:'Kharif (Jun–Nov)', duration: 150,
    stages:[
      {name:'Nursery',daysFrom:0,daysTo:25,icon:'🌱',color:'#22c55e',tasks:['Prepare nursery bed','Sow pre-germinated seed','Apply nursery fertilizer','Maintain 2–3 cm water depth']},
      {name:'Transplanting',daysFrom:25,daysTo:35,icon:'🚜',color:'#f59e0b',tasks:['Transplant 20–25 day old seedlings','2–3 seedlings per hill','Row spacing: 20×15 cm','Apply basal fertilizer']},
      {name:'Tillering',daysFrom:35,daysTo:65,icon:'🌿',color:'#4ade80',tasks:['Maintain 5 cm water depth','Apply first split Urea at 20 DAT','Apply second split at 40 DAT','Remove weeds early']},
      {name:'Panicle Initiation',daysFrom:65,daysTo:90,icon:'📏',color:'#c084fc',tasks:['Maintain water level','Apply potash if not applied','Watch for blast disease','Avoid drought stress']},
      {name:'Flowering',daysFrom:90,daysTo:110,icon:'🌸',color:'#f9a8d4',tasks:['Critical water period','Spray for brown plant hopper','Do NOT drain field','Avoid pesticides during flowering']},
      {name:'Grain Filling',daysFrom:110,daysTo:140,icon:'🌻',color:'#fcd34d',tasks:['Drain field 10 days before harvest','Watch for grain discoloration','Manage stem borer if present']},
      {name:'Harvest',daysFrom:140,daysTo:150,icon:'🏆',color:'#22c55e',tasks:['Harvest at 20–25% grain moisture','Dry to 14% for storage','Clean thresher thoroughly']},
    ]
  },
  cotton: { icon:'🌿', season:'Kharif (Apr–Dec)', duration: 200,
    stages:[
      {name:'Land Prep',daysFrom:0,daysTo:10,icon:'🚜',color:'#f59e0b',tasks:['Deep plough in April','Apply FYM 5 tonnes/acre','Prepare ridges and furrows']},
      {name:'Sowing',daysFrom:10,daysTo:20,icon:'🌱',color:'#22c55e',tasks:['Sow at 2 kg Bt cotton seed/acre','Spacing: 90×60 cm','Depth: 3–4 cm','Apply basal DAP + MOP']},
      {name:'Seedling',daysFrom:20,daysTo:40,icon:'🌿',color:'#4ade80',tasks:['Gap filling within 7 days','First irrigation at 3 weeks','Apply first Urea split','Manual weeding']},
      {name:'Square Formation',daysFrom:40,daysTo:80,icon:'📏',color:'#c084fc',tasks:['Apply second Urea split','Monitor for bollworm','Spray neem oil as preventive','Irrigate every 10–12 days']},
      {name:'Flowering & Boll',daysFrom:80,daysTo:140,icon:'🌸',color:'#f9a8d4',tasks:['Critical pest monitoring period','Apply third Urea split','Trap bollworm with pheromone traps','Irrigate at flowering']},
      {name:'Boll Development',daysFrom:140,daysTo:180,icon:'☁️',color:'#93c5fd',tasks:['Reduce irrigation frequency','Apply potash if bolls are poor','Watch for leaf curl virus']},
      {name:'Harvest',daysFrom:180,daysTo:200,icon:'🏆',color:'#22c55e',tasks:['Pick when 60% bolls open','3–4 pickings usually needed','Dry in shade before storage']},
    ]
  },
  maize: { icon:'🌽', season:'Kharif (Jun–Sep)', duration: 110,
    stages:[
      {name:'Land Prep',daysFrom:0,daysTo:7,icon:'🚜',color:'#f59e0b',tasks:['Plough to 20–25 cm depth','Apply FYM','Make ridges and furrows']},
      {name:'Sowing',daysFrom:7,daysTo:14,icon:'🌱',color:'#22c55e',tasks:['Sow 8–10 kg seed/acre','Spacing: 60×25 cm','Apply basal NPK at sowing']},
      {name:'Seedling',daysFrom:14,daysTo:30,icon:'🌿',color:'#4ade80',tasks:['Thin to 1 plant/hill at 10 days','First irrigation if no rain','Apply ⅓ Urea at 15 days','Spray atrazine for weeds']},
      {name:'Vegetative',daysFrom:30,daysTo:60,icon:'📏',color:'#c084fc',tasks:['Apply second ⅓ Urea at 30 DAS','Irrigate every 7–10 days','Monitor for fall armyworm','Earth up at 30 days']},
      {name:'Tasseling & Silking',daysFrom:60,daysTo:80,icon:'🌸',color:'#f9a8d4',tasks:['Critical water stage — do not stress','Apply remaining Urea','Control cob borer if seen']},
      {name:'Grain Filling',daysFrom:80,daysTo:100,icon:'🌻',color:'#fcd34d',tasks:['Last irrigation','Check for storage pests early','Do not apply any chemical now']},
      {name:'Harvest',daysFrom:100,daysTo:110,icon:'🏆',color:'#22c55e',tasks:['Harvest at husk turning brown','Dry to 14% moisture','Shell and store in dry place']},
    ]
  },
};

function addDays(base: Date, n: number) {
  const d = new Date(base); d.setDate(d.getDate() + n); return d;
}
function fmt(d: Date) { return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); }

export default function CalendarPage() {
  const [crop, setCrop] = useState('wheat');
  const [sowDate, setSowDate] = useState(() => new Date().toISOString().split('T')[0]);

  const cal = CALENDARS[crop];
  const base = new Date(sowDate);
  const today = new Date();

  const activeStage = cal.stages.findIndex(s => {
    const from = addDays(base, s.daysFrom);
    const to = addDays(base, s.daysTo);
    return today >= from && today <= to;
  });

  return (
    <AuthGuard>
    <div className="app-light min-h-screen relative overflow-hidden">
      <div className="orb w-64 h-64 -top-16 -right-16" style={{ background: '#22c55e' }} />
      <div className="orb w-48 h-48 bottom-24 -left-12" style={{ background: '#c084fc', animationDelay: '2s' }} />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 page-enter">
        <h1 className="text-2xl font-bold gradient-text mb-1">Crop Calendar</h1>
        <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Stage-by-stage farming schedule for your crop</p>

        {/* Crop selector */}
        <div className="glass-card rounded-2xl p-5 mb-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {Object.entries(CALENDARS).map(([key, c]) => (
              <button key={key} onClick={() => setCrop(key)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: crop === key ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.86)', border: `1px solid ${crop === key ? '#22c55e' : 'rgba(21,128,61,0.1)'}`, color: crop === key ? '#166534' : 'var(--text-secondary)' }}>
                <span>{c.icon}</span> {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>📅 Sowing / Start Date</label>
            <input type="date" value={sowDate} onChange={e => setSowDate(e.target.value)} className="input-field" />
          </div>
        </div>

        {/* Season badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="badge badge-green">{cal.icon} {crop.charAt(0).toUpperCase() + crop.slice(1)}</span>
          <span className="badge badge-amber">🗓️ {cal.season}</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Harvest: {fmt(addDays(base, cal.duration))}</span>
        </div>

        {/* Stages */}
        <div className="space-y-3">
          {cal.stages.map((s, i) => {
            const from = addDays(base, s.daysFrom);
            const to = addDays(base, s.daysTo);
            const isActive = i === activeStage;
            const isPast = today > to;
            return (
              <div key={i} className="glass-card rounded-2xl p-4"
                style={{ border: isActive ? `1px solid ${s.color}60` : undefined, opacity: isPast ? 0.6 : 1 }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: s.color + '20' }}>
                      {s.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm" style={{ color: isActive ? s.color : 'var(--text-primary)' }}>{s.name}</p>
                        {isActive && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: s.color + '25', color: s.color }}>NOW</span>}
                        {isPast && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>✓ Done</span>}
                      </div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{fmt(from)} → {fmt(to)} (Day {s.daysFrom}–{s.daysTo})</p>
                    </div>
                  </div>
                </div>
                {(isActive || !isPast) && (
                  <ul className="space-y-1 mt-2">
                    {s.tasks.map((t, ti) => (
                      <li key={ti} className="flex gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <span className="flex-shrink-0 mt-0.5" style={{ color: s.color }}>→</span>{t}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}
