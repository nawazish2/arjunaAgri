'use client';
import { useMemo } from 'react';

interface PestAlert { name: string; crops: string[]; tip: string; icon: string; severity: 'high'|'medium'|'low'; }

// Month-indexed pest calendar for India (0=Jan ... 11=Dec)
const MONTHLY_PESTS: Record<number, PestAlert[]> = {
  0: [ // January
    { name: 'Aphids on Wheat', crops: ['Wheat', 'Mustard'], tip: 'Spray Imidacloprid 17.8 SL @ 100ml/acre if >20 aphids/tiller. Ladybird beetles are natural predators — avoid broad sprays.', icon: '🦗', severity: 'medium' },
    { name: 'Yellow Rust (Wheat)', crops: ['Wheat'], tip: 'Watch for yellow stripes on leaves. Spray Propiconazole 25 EC @ 200ml/acre at first sign. Use resistant variety like PBW-343.', icon: '🌾', severity: 'high' },
    { name: 'Powdery Mildew (Vegetables)', crops: ['Tomato', 'Peas', 'Potato'], tip: 'Dust sulfur @ 20 kg/acre or spray Hexaconazole 5 EC @ 200ml/acre. Improve air circulation between plants.', icon: '🍅', severity: 'low' },
  ],
  1: [ // February
    { name: 'Termites (Rabi crops)', crops: ['Wheat', 'Gram', 'Mustard'], tip: 'Apply Chlorpyriphos 20 EC @ 2.5L/acre in irrigation water. Check for hollow stems and wilting patches.', icon: '🐜', severity: 'medium' },
    { name: 'Aphids (Mustard)', crops: ['Mustard', 'Rapeseed'], tip: 'Economic threshold: 20+ aphids/plant. Spray Dimethoate 30 EC @ 300ml/acre. Avoid spraying during flowering to protect bees.', icon: '🦗', severity: 'high' },
    { name: 'Blight (Potato)', crops: ['Potato'], tip: 'Spray Mancozeb 75 WP @ 600g/acre every 10 days. Remove and destroy infected leaves. Avoid overhead irrigation.', icon: '🥔', severity: 'medium' },
  ],
  2: [ // March
    { name: 'Sucking Pests (Cotton nursery)', crops: ['Cotton'], tip: 'Treat cotton seeds with Imidacloprid 600 FS @ 5ml/kg seed before sowing. Avoid field scouting during dew hours.', icon: '🌿', severity: 'low' },
    { name: 'Brown Plant Hopper (Early Kharif prep)', crops: ['Rice'], tip: 'Use light traps to monitor. Drain water for 7-10 days. Spray BPMC 50 EC @ 400ml/acre if >10 hoppers/hill.', icon: '🌾', severity: 'medium' },
    { name: 'Stem Borer (Sugarcane)', crops: ['Sugarcane'], tip: 'Release Trichogramma @ 50,000 eggs/acre. Remove and destroy egg masses. Apply Carbofuran 3G @ 8 kg/acre in soil.', icon: '🎋', severity: 'high' },
  ],
  3: [ // April
    { name: 'Thrips (Cotton)', crops: ['Cotton', 'Onion'], tip: 'Spray Spinosad 45 SC @ 80ml/acre or Fipronil 5 SC @ 400ml/acre. Sticky yellow traps @ 8/acre for monitoring.', icon: '🦟', severity: 'high' },
    { name: 'Leaf Miner (Vegetables)', crops: ['Tomato', 'Brinjal', 'Capsicum'], tip: 'Apply Cyromazine 75 WP @ 200g/acre. Remove heavily infested leaves. Neem-based sprays (5 ml/L) reduce adult population.', icon: '🍃', severity: 'medium' },
    { name: 'Fruit Borer (Mango)', crops: ['Mango'], tip: 'Spray Quinalphos 25 EC @ 400ml/200L water. Bag fruits individually or use pheromone traps.', icon: '🥭', severity: 'medium' },
  ],
  4: [ // May
    { name: 'Whitefly (Cotton)', crops: ['Cotton', 'Tomato', 'Chilli'], tip: 'Spray Acetamiprid 20 SP @ 100g/acre. Install yellow sticky traps. Avoid Imidacloprid (causes resistance). Intercrop with coriander to repel.', icon: '🦋', severity: 'high' },
    { name: 'Red Spider Mite', crops: ['Cotton', 'Maize', 'Soybean'], tip: 'Spray Dicofol 18.5 EC @ 750ml/acre or Abamectin 1.9 EC @ 200ml/acre. Spray undersides of leaves. Avoid water stress.', icon: '🔴', severity: 'medium' },
    { name: 'Cutworm (Kharif nursery)', crops: ['Rice', 'Maize', 'Groundnut'], tip: 'Mix Chlorpyriphos 20 EC in soil before nursery preparation. Apply light irrigation to bring larvae to surface.', icon: '🪱', severity: 'low' },
  ],
  5: [ // June
    { name: 'Stem Borer (Kharif transplanted rice)', crops: ['Rice'], tip: 'Apply Chlorantraniliprole 18.5 SC @ 150ml/acre at tillering stage. Use pheromone traps for adult monitoring. Remove egg masses manually.', icon: '🌾', severity: 'high' },
    { name: 'Bollworm (Cotton)', crops: ['Cotton'], tip: 'Spray Bt-based insecticide (Dipel WP) at first instar stage. Install pheromone traps @ 5/acre from 30 days of sowing.', icon: '🐛', severity: 'high' },
    { name: 'Downy Mildew (Maize)', crops: ['Maize'], tip: 'Use Metalaxyl-M seed treatment @ 6g/kg seed. Spray Metalaxyl 8 + Mancozeb 64 WP @ 600g/acre at first sign.', icon: '🌽', severity: 'medium' },
  ],
  6: [ // July
    { name: 'Leaf Blast (Rice)', crops: ['Rice'], tip: 'Spray Tricyclazole 75 WP @ 200g/acre at first appearance. Avoid excess nitrogen. Use blast-resistant variety Pusa Basmati 1637.', icon: '🌿', severity: 'high' },
    { name: 'American Bollworm', crops: ['Cotton', 'Soybean', 'Groundnut'], tip: 'Spray Indoxacarb 14.5 SC @ 400ml/acre or Emamectin Benzoate 5 SG @ 100g/acre. Install bird perches.', icon: '🐛', severity: 'high' },
    { name: 'Grasshopper (Kharif)', crops: ['Soybean', 'Groundnut', 'Maize'], tip: 'Spray Malathion 50 EC @ 500ml/acre in early morning. Bait with bran + Malathion mixture in borders.', icon: '🦗', severity: 'medium' },
  ],
  7: [ // August
    { name: 'Neck Blast (Rice)', crops: ['Rice'], tip: 'Critical — spray Tricyclazole 75 WP @ 200g/acre at panicle initiation (10-15 days before heading). Ensure field has water 5cm deep.', icon: '🌾', severity: 'high' },
    { name: 'Pink Bollworm (Cotton)', crops: ['Cotton'], tip: 'Install pheromone traps @ 5/acre. Spray Profenophos 50 EC @ 800ml/acre or Cypermethrin 10 EC @ 300ml/acre. Avoid late irrigation.', icon: '🌸', severity: 'high' },
    { name: 'Soybean Caterpillar', crops: ['Soybean'], tip: 'Spray Chlorpyriphos 20 EC @ 1.5L/acre at ETL (>2 caterpillars/plant). Bird perches reduce pressure naturally.', icon: '🐛', severity: 'medium' },
  ],
  8: [ // September
    { name: 'Brown Plant Hopper (Rice)', crops: ['Rice'], tip: 'Drain water from field. Spray Ethofenprox 10 EC @ 750ml/acre or Buprofezin 25 SC @ 800ml/acre. Avoid blanket spraying — target base of plant.', icon: '🌾', severity: 'high' },
    { name: 'Whitefly (Cotton late season)', crops: ['Cotton'], tip: 'This month whitefly transmits leaf curl virus. Spray Thiamethoxam 25 WG @ 40g/acre. Rogue out virus-infected plants immediately.', icon: '🦋', severity: 'high' },
    { name: 'Pod Borer (Soybean/Groundnut)', crops: ['Soybean', 'Groundnut', 'Pigeon pea'], tip: 'Spray Indoxacarb 15.8 EC @ 333ml/acre at 50% flowering. Conserve predators by avoiding broad-spectrum insecticides.', icon: '🫘', severity: 'medium' },
  ],
  9: [ // October
    { name: 'Termites (Wheat sowing)', crops: ['Wheat', 'Gram', 'Mustard'], tip: 'Treat seed with Chlorpyriphos 20 EC @ 4ml/kg seed. Apply Chlorpyriphos in furrows if last crop had termite damage.', icon: '🐜', severity: 'medium' },
    { name: 'Yellow Mosaic Virus (Mustard)', crops: ['Mustard', 'Soybean', 'Groundnut'], tip: 'No cure once infected. Remove diseased plants. Control whitefly vector with Imidacloprid 17.8 SL @ 100ml/acre.', icon: '🌻', severity: 'high' },
    { name: 'Gram Pod Borer', crops: ['Gram', 'Pigeon pea', 'Lentil'], tip: 'Install pheromone traps @ 5/acre. Spray Bt (Bacillus thuringiensis) @ 1kg/acre at egg-hatching stage. Bird perches help.', icon: '🫘', severity: 'high' },
  ],
  10: [ // November
    { name: 'Aphids (Mustard/Wheat)', crops: ['Mustard', 'Wheat', 'Gram'], tip: 'Economic threshold: 20-25 aphids/tiller. Spray Dimethoate 30 EC @ 400ml/acre. Early morning spray is most effective.', icon: '🦗', severity: 'medium' },
    { name: 'Root Rot (Potato)', crops: ['Potato'], tip: 'Treat seed with Mancozeb 75 WP @ 2.5g/kg tuber. Ensure proper drainage. Avoid waterlogging which promotes Pythium.', icon: '🥔', severity: 'low' },
    { name: 'Leaf Eating Caterpillar (Vegetables)', crops: ['Cabbage', 'Cauliflower', 'Tomato'], tip: 'Spray Bt Kurstaki 3 WP @ 750g/acre. Hand-pick larvae in small fields. Yellow traps for adult monitoring.', icon: '🥦', severity: 'low' },
  ],
  11: [ // December
    { name: 'Yellow Rust (Wheat)', crops: ['Wheat'], tip: 'Watch flag leaf carefully. Spray Propiconazole 25 EC @ 200ml/acre at first yellow pustule. Irrigate if moisture-stressed.', icon: '🌾', severity: 'high' },
    { name: 'Powdery Mildew (Wheat)', crops: ['Wheat'], tip: 'Spray Hexaconazole 5 EC @ 300ml/acre or Tebuconazole 25.9 EC @ 200ml/acre. Avoid excess nitrogen application.', icon: '🌿', severity: 'medium' },
    { name: 'Sucking Pests (Gram)', crops: ['Gram', 'Lentil', 'Peas'], tip: 'Spray Methyl Demeton 25 EC @ 400ml/acre or Dimethoate 30 EC @ 300ml/acre. Intercrop with mustard to attract beneficial insects.', icon: '🫘', severity: 'low' },
  ],
};

export default function PestAlert() {
  const month = new Date().getMonth();
  const monthName = new Date().toLocaleString('en-IN', { month: 'long' });
  const alerts = useMemo(() => MONTHLY_PESTS[month] || [], [month]);

  const severityStyle = (s: string) => ({
    high: { badge: 'rgba(239,68,68,0.15)', text: '#f87171', border: 'rgba(239,68,68,0.3)', dot: '#ef4444' },
    medium: { badge: 'rgba(245,158,11,0.15)', text: '#fcd34d', border: 'rgba(245,158,11,0.3)', dot: '#f59e0b' },
    low: { badge: 'rgba(34,197,94,0.12)', text: '#4ade80', border: 'rgba(34,197,94,0.25)', dot: '#22c55e' },
  }[s] || { badge: '', text: '#4ade80', border: '', dot: '#22c55e' });

  return (
    <div className="glass-card rounded-2xl p-4 mb-4 glow-amber">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span>⚠️</span>
          <div>
            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Pest Alerts</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{monthName} — Watch out for</p>
          </div>
        </div>
        <span className="live-dot" />
      </div>
      <div className="space-y-2.5">
        {alerts.map((alert, i) => {
          const st = severityStyle(alert.severity);
          return (
            <details key={i} className="rounded-xl overflow-hidden" style={{ background: 'rgba(6,26,13,0.6)', border: `1px solid ${st.border}` }}>
              <summary className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer list-none">
                <span>{alert.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{alert.name}</p>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {alert.crops.map(c => (
                      <span key={c} className="text-xs px-1.5 py-0 rounded" style={{ background: 'rgba(34,197,94,0.08)', color: 'rgba(134,239,172,0.6)' }}>{c}</span>
                    ))}
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: st.badge, color: st.text }}>{alert.severity}</span>
              </summary>
              <div className="px-3 pb-3 pt-1 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {alert.tip}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
