'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

type SoilPoint = { date: string; n: number; p: number; k: number; ph: number };

function getLocalHistory(): SoilPoint[] {
  try {
    const raw = localStorage.getItem('soil_history');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export default function SoilHistoryChart() {
  const [data, setData] = useState<SoilPoint[]>([]);

  useEffect(() => {
    const history = getLocalHistory();
    setData(history);
  }, []);

  if (data.length < 2) {
    return (
      <div className="glass-card text-center py-8">
        <div className="text-3xl mb-2">📊</div>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Complete at least 2 soil tests to see your NPK trend chart
        </p>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {data.length === 1 ? '1 test recorded — need 1 more' : 'No tests recorded yet'}
        </p>
      </div>
    );
  }

  const labels = data.map(d => d.date);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Nitrogen (N)',
        data: data.map(d => d.n),
        borderColor: '#4ade80',
        backgroundColor: 'rgba(74,222,128,0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#4ade80',
        pointRadius: 5,
      },
      {
        label: 'Phosphorus (P)',
        data: data.map(d => d.p),
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96,165,250,0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#60a5fa',
        pointRadius: 5,
      },
      {
        label: 'Potassium (K)',
        data: data.map(d => d.k),
        borderColor: '#fbbf24',
        backgroundColor: 'rgba(251,191,36,0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#fbbf24',
        pointRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: 'rgba(255,255,255,0.7)', font: { size: 11 } } },
      tooltip: {
        backgroundColor: 'rgba(6,26,13,0.95)',
        titleColor: '#4ade80',
        bodyColor: 'rgba(255,255,255,0.8)',
        callbacks: {
          label: (ctx: import('chart.js').TooltipItem<'line'>) => ` ${ctx.dataset.label}: ${ctx.parsed.y} kg/ha`,
        },
      },
    },
    scales: {
      x: { ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
  };

  return (
    <div className="glass-card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm" style={{ color: '#4ade80' }}>📈 NPK History</h3>
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{data.length} tests</span>
      </div>
      <Line data={chartData} options={options} />
      <div className="grid grid-cols-3 gap-2 pt-1">
        {(['n','p','k'] as const).map((key, i) => {
          const latest = data[data.length - 1][key];
          const prev = data[data.length - 2][key];
          const diff = latest - prev;
          const colors = ['#4ade80','#60a5fa','#fbbf24'];
          const labels = ['N','P','K'];
          return (
            <div key={key} className="text-center p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="text-lg font-bold" style={{ color: colors[i] }}>{latest}</div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{labels[i]} kg/ha</div>
              <div className="text-xs mt-0.5" style={{ color: diff >= 0 ? '#4ade80' : '#f87171' }}>
                {diff >= 0 ? '↑' : '↓'} {Math.abs(diff)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
