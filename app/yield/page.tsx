'use client';
import AuthGuard from '@/components/AuthGuard';
import { useState } from 'react';

interface CropROI {
  crop: string;
  icon: string;
  acreage: number;
  expectedYield: number;
  msp: number;
  inputCost: number;
  grossIncome: number;
  netProfit: number;
  roi: number;
  breakeven: number;
}

const CROP_DATA: Record<string, { icon: string; msp: number; minYield: number; maxYield: number; seedCost: number; fertCost: number; pestCost: number; labourCost: number }> = {
  'Wheat':         { icon:'🌾', msp:2275, minYield:12, maxYield:22, seedCost:1800, fertCost:4500, pestCost:800,  labourCost:3500 },
  'Rice (Paddy)':  { icon:'🍚', msp:2300, minYield:14, maxYield:25, seedCost:1200, fertCost:4000, pestCost:1200, labourCost:4500 },
  'Maize':         { icon:'🌽', msp:2090, minYield:16, maxYield:28, seedCost:1500, fertCost:3500, pestCost:900,  labourCost:3000 },
  'Cotton':        { icon:'🫧', msp:7121, minYield:5,  maxYield:10, seedCost:2500, fertCost:6000, pestCost:3500, labourCost:6000 },
  'Soybean':       { icon:'🫘', msp:4892, minYield:6,  maxYield:14, seedCost:2200, fertCost:3000, pestCost:1500, labourCost:3000 },
  'Groundnut':     { icon:'🥜', msp:6783, minYield:8,  maxYield:18, seedCost:3500, fertCost:2500, pestCost:1200, labourCost:4000 },
  'Gram/Chana':    { icon:'🫘', msp:5440, minYield:5,  maxYield:12, seedCost:2800, fertCost:2000, pestCost:800,  labourCost:2500 },
  'Mustard':       { icon:'🌻', msp:5950, minYield:5,  maxYield:12, seedCost:600,  fertCost:3000, pestCost:700,  labourCost:2500 },
  'Sunflower':     { icon:'🌼', msp:7280, minYield:5,  maxYield:10, seedCost:1500, fertCost:3000, pestCost:900,  labourCost:2800 },
  'Sugarcane':     { icon:'🎋', msp:340,  minYield:250,maxYield:400,seedCost:8000, fertCost:8000, pestCost:2000, labourCost:8000 },
};

const CROPS = Object.keys(CROP_DATA);

function calcROI(cropName: string, acres: number, soilQuality: number): CropROI {
  const d = CROP_DATA[cropName];
  const yieldFraction = (soilQuality - 1) / 4;
  const yieldPerAcre = d.minYield + (d.maxYield - d.minYield) * yieldFraction;
  const inputCostPerAcre = d.seedCost + d.fertCost + d.pestCost + d.labourCost;
  const grossIncome = yieldPerAcre * d.msp * acres;
  const totalInputCost = inputCostPerAcre * acres;
  const netProfit = grossIncome - totalInputCost;
  const roi = (netProfit / totalInputCost) * 100;
  const breakeven = totalInputCost / (yieldPerAcre * acres);
  return {
    crop: cropName, icon: d.icon, acreage: acres,
    expectedYield: Math.round(yieldPerAcre * 10) / 10,
    msp: d.msp, inputCost: inputCostPerAcre,
    grossIncome: Math.round(grossIncome),
    netProfit: Math.round(netProfit),
    roi: Math.round(roi), breakeven: Math.round(breakeven),
  };
}

export default function YieldPage() {
  const [acres, setAcres] = useState(2);
  const [soilQuality, setSoilQuality] = useState(3);
  const [selected, setSelected] = useState<string[]>(['Wheat', 'Rice (Paddy)', 'Maize']);
  const [results, setResults] = useState<CropROI[]>([]);
  const [calculated, setCalculated] = useState(false);

  const toggleCrop = (crop: string) => {
    setSelected(prev => prev.includes(crop)
      ? prev.filter(c => c !== crop)
      : prev.length < 4 ? [...prev, crop] : prev);
  };

  const calculate = () => {
    const res = selected.map(c => calcROI(c, acres, soilQuality)).sort((a, b) => b.netProfit - a.netProfit);
    setResults(res);
    setCalculated(true);
  };

  const fmt = (n: number) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(1)}K` : `₹${n}`;
  const soilLabels = ['', 'Poor', 'Below Avg', 'Average', 'Good', 'Excellent'];

  return (
    <AuthGuard>
      <div className="min-h-screen relative overflow-hidden">
        <div className="orb w-72 h-72 -top-20 -right-20" style={{ background: '#f59e0b' }} />
        <div className="orb w-56 h-56 bottom-32 -left-16" style={{ background: '#22c55e', animationDelay: '2s' }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 page-enter">
          <h1 className="text-2xl font-bold gradient-text mb-1">Yield Predictor & ROI</h1>
          <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Compare profitability across crops before sowing</p>

          <div className="glass-card rounded-2xl p-5 mb-4 space-y-5">
            {/* Acres */}
            <div>
              <label className="section-title block mb-2">Farm Size (Acres)</label>
              <div className="flex items-center gap-4">
                <input type="range" min={0.5} max={20} step={0.5} value={acres}
                  onChange={e => setAcres(Number(e.target.value))}
                  className="flex-1" style={{ accentColor: '#22c55e' }} />
                <div className="text-center w-20 py-2 rounded-xl font-black text-lg"
                  style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}>
                  {acres} ac
                </div>
              </div>
            </div>

            {/* Soil quality */}
            <div>
              <label className="section-title block mb-2">Soil Quality (affects yield estimate)</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(q => (
                  <button key={q} onClick={() => setSoilQuality(q)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: soilQuality === q ? '#22c55e' : 'rgba(6,26,13,0.6)',
                      color: soilQuality === q ? '#061a0d' : 'rgba(134,239,172,0.5)',
                      border: `1px solid ${soilQuality === q ? '#22c55e' : 'rgba(34,197,94,0.1)'}`,
                    }}>{q}</button>
                ))}
              </div>
              <p className="text-xs mt-1.5 text-center" style={{ color: 'var(--text-muted)' }}>
                Selected: <strong style={{ color: '#4ade80' }}>{soilLabels[soilQuality]}</strong>
              </p>
            </div>

            {/* Crop picker */}
            <div>
              <label className="section-title block mb-2">Select Crops to Compare (max 4)</label>
              <div className="flex flex-wrap gap-2">
                {CROPS.map(crop => {
                  const d = CROP_DATA[crop];
                  const sel = selected.includes(crop);
                  return (
                    <button key={crop} onClick={() => toggleCrop(crop)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                      style={{
                        background: sel ? 'rgba(34,197,94,0.2)' : 'rgba(6,26,13,0.6)',
                        color: sel ? '#4ade80' : 'rgba(134,239,172,0.4)',
                        border: `1px solid ${sel ? 'rgba(34,197,94,0.4)' : 'rgba(34,197,94,0.1)'}`,
                      }}>
                      {d.icon} {crop}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs mt-2" style={{ color: 'rgba(134,239,172,0.35)' }}>{selected.length}/4 selected</p>
            </div>

            <button onClick={calculate} disabled={selected.length < 1}
              className="btn-primary w-full justify-center"
              style={{ opacity: selected.length < 1 ? 0.5 : 1 }}>
              📊 Calculate Profitability
            </button>
          </div>

          {/* Results */}
          {calculated && results.length > 0 && (
            <div className="space-y-3 success-flash">
              <p className="section-title">{acres} acres · {soilLabels[soilQuality]} soil · MSP 2024-25</p>

              {results.map((r, i) => (
                <div key={r.crop} className={`glass-card rounded-2xl p-5 card-hover ${i === 0 ? 'glow-green' : ''}`}
                  style={{ border: i === 0 ? '1px solid rgba(34,197,94,0.4)' : undefined }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ background: i === 0 ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.1)' }}>
                        {r.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{r.crop}</p>
                          {i === 0 && <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ background: 'rgba(34,197,94,0.2)', color: '#4ade80' }}>🏆 Best ROI</span>}
                        </div>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>MSP ₹{r.msp}/q · {r.expectedYield} q/ac yield</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black" style={{ color: r.netProfit >= 0 ? '#4ade80' : '#f87171' }}>
                        {r.netProfit >= 0 ? '+' : ''}{fmt(r.netProfit)}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>net profit</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                      { label: 'Gross Income', value: fmt(r.grossIncome), icon: '💰' },
                      { label: 'Total Cost', value: fmt(r.inputCost * r.acreage), icon: '💸' },
                      { label: 'ROI', value: `${r.roi}%`, icon: r.roi >= 50 ? '🚀' : r.roi >= 0 ? '📈' : '📉' },
                      { label: 'Break-even', value: `₹${r.breakeven}/q`, icon: '⚖️' },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl p-2.5" style={{ background: 'rgba(6,26,13,0.6)' }}>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.icon} {s.label}</p>
                        <p className="font-bold text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(Math.max(r.roi, 0), 120)}%`,
                          background: r.roi >= 50 ? 'linear-gradient(90deg,#22c55e,#4ade80)' : r.roi >= 20 ? '#f59e0b' : '#ef4444',
                        }} />
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'rgba(134,239,172,0.35)' }}>
                      Cost/acre: {fmt(r.inputCost)} (seed + fertilizer + pesticide + labour)
                    </p>
                  </div>
                </div>
              ))}

              <div className="glass-card rounded-xl px-4 py-3">
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(134,239,172,0.45)' }}>
                  ⚠️ Estimates based on MSP 2024-25 and average Indian farm conditions. Actual yield varies ±20% with irrigation, variety, and weather. Costs are indicative per acre.
                </p>
              </div>

              <button onClick={() => setCalculated(false)} className="btn-secondary w-full">← Recalculate</button>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
