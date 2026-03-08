'use client';
import AuthGuard from '@/components/AuthGuard';
import { useState } from 'react';

interface IrrigationStage {
  name: string;
  dayStart: number;
  dayEnd: number;
  waterMm: number; // mm per irrigation
  frequency: string;
  icon: string;
  critical: boolean;
  notes: string;
}

const IRRIGATION_DATA: Record<string, { icon: string; totalDays: number; stages: IrrigationStage[] }> = {
  Wheat: {
    icon: '🌾', totalDays: 150,
    stages: [
      { name: 'Crown Root Initiation', dayStart: 20, dayEnd: 25, waterMm: 60, frequency: 'Once', icon: '💧', critical: true, notes: 'Most critical irrigation — do not skip. Apply when soil begins to crack at surface.' },
      { name: 'Tillering', dayStart: 40, dayEnd: 45, waterMm: 50, frequency: 'Once', icon: '🌱', critical: false, notes: 'Apply Urea (⅓ dose) after irrigation. Light irrigation preferred.' },
      { name: 'Jointing', dayStart: 65, dayEnd: 70, waterMm: 55, frequency: 'Once', icon: '📏', critical: true, notes: 'Apply ⅓ Urea after this irrigation. Watch for yellow rust disease.' },
      { name: 'Booting/Heading', dayStart: 85, dayEnd: 90, waterMm: 55, frequency: 'Once', icon: '🌿', critical: true, notes: 'Apply remaining Urea. High moisture need — do not skip.' },
      { name: 'Milking Stage', dayStart: 105, dayEnd: 110, waterMm: 50, frequency: 'Once', icon: '🌻', critical: false, notes: 'Last irrigation. Stop 2 weeks before harvest to enable ripening.' },
    ],
  },
  'Rice (Paddy)': {
    icon: '🍚', totalDays: 130,
    stages: [
      { name: 'Transplanting', dayStart: 0, dayEnd: 7, waterMm: 80, frequency: 'Continuous 5cm', icon: '🌱', critical: true, notes: 'Maintain 5 cm standing water for 1 week after transplanting. Promotes rooting.' },
      { name: 'Active Tillering', dayStart: 15, dayEnd: 40, waterMm: 50, frequency: 'Saturated soil', icon: '🌿', critical: false, notes: 'Alternate wetting and drying saves 30% water. Drain for 3 days then re-flood.' },
      { name: 'Panicle Initiation', dayStart: 55, dayEnd: 65, waterMm: 70, frequency: 'Maintain 5cm', icon: '🌾', critical: true, notes: 'Most critical — any water stress causes spikelet sterility. Maintain 5 cm water.' },
      { name: 'Heading & Flowering', dayStart: 75, dayEnd: 85, waterMm: 65, frequency: 'Maintain 3cm', icon: '🌸', critical: true, notes: 'Maintain 3 cm water. Drain at night to reduce neck blast risk.' },
      { name: 'Grain Filling', dayStart: 90, dayEnd: 110, waterMm: 50, frequency: 'Saturated soil', icon: '🌻', critical: false, notes: 'Reduce water. Drain 10 days before harvest.' },
    ],
  },
  Maize: {
    icon: '🌽', totalDays: 110,
    stages: [
      { name: 'Germination', dayStart: 0, dayEnd: 8, waterMm: 40, frequency: 'Once', icon: '🌱', critical: true, notes: 'Light irrigation for uniform germination. Avoid waterlogging.' },
      { name: 'Knee-high Stage', dayStart: 25, dayEnd: 30, waterMm: 55, frequency: 'Once', icon: '📏', critical: false, notes: 'Apply first split Urea after this irrigation.' },
      { name: 'Tasseling (V-T)', dayStart: 45, dayEnd: 55, waterMm: 65, frequency: 'Every 10-12 days', icon: '🌽', critical: true, notes: 'Most critical — water stress during tasseling reduces yield 40-50%. No compromise.' },
      { name: 'Silking & Pollination', dayStart: 55, dayEnd: 65, waterMm: 65, frequency: 'Every 7-10 days', icon: '🌾', critical: true, notes: 'Maintain soil moisture for proper grain set. Spray water during heat wave.' },
      { name: 'Grain Fill (Dough)', dayStart: 75, dayEnd: 90, waterMm: 50, frequency: 'Once', icon: '🌻', critical: false, notes: 'Reduce irrigation. Avoid waterlogging.' },
    ],
  },
  Cotton: {
    icon: '🫧', totalDays: 180,
    stages: [
      { name: 'Germination', dayStart: 0, dayEnd: 7, waterMm: 40, frequency: 'Once', icon: '🌱', critical: true, notes: 'Critical for uniform emergence. Avoid waterlogging — use light irrigation.' },
      { name: 'Squaring (Bud formation)', dayStart: 40, dayEnd: 55, waterMm: 60, frequency: 'Every 15 days', icon: '🌿', critical: false, notes: 'Moderate irrigation. Excess water promotes vegetative growth over fruiting.' },
      { name: 'Flowering', dayStart: 60, dayEnd: 90, waterMm: 70, frequency: 'Every 10-12 days', icon: '🌸', critical: true, notes: 'Peak water demand. Any stress causes square/boll shedding. Do not skip.' },
      { name: 'Boll Development', dayStart: 90, dayEnd: 130, waterMm: 65, frequency: 'Every 15 days', icon: '💮', critical: true, notes: 'Maintain soil moisture for boll filling. Reduce at maturity to promote opening.' },
      { name: 'Boll Opening', dayStart: 130, dayEnd: 160, waterMm: 40, frequency: 'Once or twice', icon: '🫧', critical: false, notes: 'Reduce irrigation. Stop 3 weeks before final picking.' },
    ],
  },
  Soybean: {
    icon: '🫘', totalDays: 95,
    stages: [
      { name: 'Germination', dayStart: 0, dayEnd: 7, waterMm: 35, frequency: 'Once', icon: '🌱', critical: true, notes: 'Soybean is largely rain-fed in Kharif. Supplement only if dry spell >10 days.' },
      { name: 'Vegetative (V4)', dayStart: 20, dayEnd: 30, waterMm: 45, frequency: 'Once', icon: '🌿', critical: false, notes: 'Apply if rainfall < 50mm in 2 weeks. Spray weedicide at 20-25 DAS.' },
      { name: 'Flowering (R1-R2)', dayStart: 35, dayEnd: 50, waterMm: 55, frequency: 'Once', icon: '🌸', critical: true, notes: 'Critical — water stress during flowering causes 30-40% yield loss. Irrigate if dry.' },
      { name: 'Pod Fill (R5-R6)', dayStart: 55, dayEnd: 75, waterMm: 55, frequency: 'Once', icon: '🫘', critical: true, notes: 'Most critical stage for seed size. One good irrigation here improves yield significantly.' },
    ],
  },
  Mustard: {
    icon: '🌻', totalDays: 130,
    stages: [
      { name: 'Pre-sowing', dayStart: 0, dayEnd: 3, waterMm: 50, frequency: 'Once', icon: '💧', critical: true, notes: 'Apply before sowing for good seed germination. Critical for even crop stand.' },
      { name: 'Branching', dayStart: 30, dayEnd: 35, waterMm: 50, frequency: 'Once', icon: '🌿', critical: false, notes: 'Second irrigation. Apply Urea (top-dressing) after this irrigation.' },
      { name: 'Flowering', dayStart: 55, dayEnd: 65, waterMm: 55, frequency: 'Once', icon: '🌻', critical: true, notes: 'Most critical irrigation for pod set. Do not use sprinkler — damages pollen and affects bee pollination.' },
      { name: 'Pod Fill', dayStart: 80, dayEnd: 90, waterMm: 45, frequency: 'Once', icon: '🫘', critical: false, notes: 'Last irrigation. Stop 3 weeks before harvest to improve oil content.' },
    ],
  },
};

const CROPS = Object.keys(IRRIGATION_DATA);

export default function IrrigationPage() {
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [sowDate, setSowDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });

  const cropData = IRRIGATION_DATA[selectedCrop];
  const today = new Date();
  const sow = new Date(sowDate);
  const daysSinceSowing = Math.floor((today.getTime() - sow.getTime()) / (1000 * 60 * 60 * 24));

  const getStatus = (stage: IrrigationStage) => {
    if (daysSinceSowing >= stage.dayEnd + 5) return 'done';
    if (daysSinceSowing >= stage.dayStart - 3 && daysSinceSowing <= stage.dayEnd + 5) return 'upcoming';
    if (daysSinceSowing > stage.dayStart - 10 && daysSinceSowing < stage.dayStart) return 'soon';
    return 'future';
  };

  const nextIrrigation = cropData.stages.find(s => {
    const status = getStatus(s);
    return status === 'upcoming' || status === 'soon';
  });

  const daysUntil = nextIrrigation ? nextIrrigation.dayStart - daysSinceSowing : null;

  return (
    <AuthGuard>
      <div className="app-light min-h-screen relative overflow-hidden">
        <div className="orb w-64 h-64 -top-16 -left-16" style={{ background: '#60a5fa' }} />
        <div className="orb w-56 h-56 bottom-32 -right-12" style={{ background: '#22c55e', animationDelay: '3s' }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 page-enter">
          <h1 className="text-2xl font-bold gradient-text mb-1">Irrigation Scheduler</h1>
          <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Stage-wise water management for your crop</p>

          {/* Controls */}
          <div className="glass-card rounded-2xl p-5 mb-4 space-y-4">
            <div>
              <label className="section-title block mb-2">Select Crop</label>
              <div className="flex flex-wrap gap-2">
                {CROPS.map(crop => (
                  <button key={crop} onClick={() => setSelectedCrop(crop)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={{
                      background: selectedCrop === crop ? 'rgba(96,165,250,0.2)' : 'rgba(6,26,13,0.6)',
                      color: selectedCrop === crop ? '#93c5fd' : 'rgba(134,239,172,0.4)',
                      border: `1px solid ${selectedCrop === crop ? 'rgba(96,165,250,0.4)' : 'rgba(34,197,94,0.1)'}`,
                    }}>
                    {IRRIGATION_DATA[crop].icon} {crop}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="section-title block mb-2">Sowing Date</label>
              <input type="date" value={sowDate} onChange={e => setSowDate(e.target.value)}
                className="input-field" max={new Date().toISOString().split('T')[0]} />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Day {Math.max(0, daysSinceSowing)} since sowing · {cropData.totalDays} days total crop duration
              </p>
            </div>
          </div>

          {/* Next irrigation alert */}
          {nextIrrigation && daysUntil !== null && (
            <div className="rounded-2xl p-4 mb-4 success-flash"
              style={{ background: daysUntil <= 3 ? 'rgba(239,68,68,0.12)' : daysUntil <= 7 ? 'rgba(245,158,11,0.12)' : 'rgba(96,165,250,0.1)',
                border: `1px solid ${daysUntil <= 3 ? 'rgba(239,68,68,0.3)' : daysUntil <= 7 ? 'rgba(245,158,11,0.3)' : 'rgba(96,165,250,0.25)'}` }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">💧</span>
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {daysUntil <= 0 ? '⚡ Irrigate Today!' : daysUntil === 1 ? '⏰ Irrigate Tomorrow' : `Next: ${nextIrrigation.name}`}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {daysUntil > 0 ? `In ${daysUntil} days` : 'Overdue!'} · Apply {nextIrrigation.waterMm} mm water/acre
                  </p>
                </div>
                {nextIrrigation.critical && (
                  <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>CRITICAL</span>
                )}
              </div>
            </div>
          )}

          {daysSinceSowing > cropData.totalDays && (
            <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
              <p className="text-sm font-semibold" style={{ color: '#4ade80' }}>
                ✅ Crop harvest period — all irrigations complete!
              </p>
            </div>
          )}

          {/* Timeline */}
          <p className="section-title mb-3">{selectedCrop} Irrigation Schedule</p>
          <div className="space-y-3">
            {cropData.stages.map((stage, i) => {
              const status = getStatus(stage);
              const colors = {
                done:     { bg: 'rgba(6,26,13,0.4)',    border: 'rgba(34,197,94,0.1)',  text: 'rgba(134,239,172,0.4)', icon: '✅' },
                upcoming: { bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.4)', text: '#93c5fd',               icon: '💧' },
                soon:     { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#fcd34d',               icon: '⏰' },
                future:   { bg: 'rgba(6,26,13,0.5)',    border: 'rgba(34,197,94,0.08)', text: 'rgba(134,239,172,0.5)', icon: stage.icon },
              }[status];

              return (
                <details key={i} className="rounded-2xl overflow-hidden card-hover"
                  style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                  open={status === 'upcoming'}>
                  <summary className="flex items-center gap-3 px-4 py-3.5 cursor-pointer list-none">
                    <span className="text-lg">{colors.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm" style={{ color: colors.text }}>{stage.name}</p>
                        {stage.critical && status !== 'done' && (
                          <span className="text-xs px-1.5 py-0 rounded font-bold"
                            style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>critical</span>
                        )}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(134,239,172,0.35)' }}>
                        Day {stage.dayStart}–{stage.dayEnd} · {stage.waterMm} mm · {stage.frequency}
                      </p>
                    </div>
                    <div className="text-right">
                      {status === 'done' && <span className="text-xs" style={{ color: 'rgba(134,239,172,0.4)' }}>Done</span>}
                      {status === 'upcoming' && <span className="text-xs font-bold" style={{ color: '#93c5fd' }}>Now</span>}
                      {status === 'soon' && <span className="text-xs" style={{ color: '#fcd34d' }}>Soon</span>}
                      {status === 'future' && <span className="text-xs" style={{ color: 'rgba(134,239,172,0.35)' }}>Day {stage.dayStart}</span>}
                    </div>
                  </summary>
                  <div className="px-4 pb-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                    {stage.notes}
                    <p className="mt-2 text-xs" style={{ color: 'rgba(134,239,172,0.4)' }}>
                      Water required: <strong>{stage.waterMm} mm</strong> per acre ≈ {Math.round(stage.waterMm * 40.5 * 0.001 * 1000)} litres/acre
                    </p>
                  </div>
                </details>
              );
            })}
          </div>

          <div className="glass-card rounded-xl px-4 py-3 mt-4">
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(134,239,172,0.4)' }}>
              💡 1 mm of water = 1 litre per m² = 1000 litres per 10 marla = ~40,500 litres per acre. Drip/sprinkler saves 30-40% water vs flood irrigation.
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
