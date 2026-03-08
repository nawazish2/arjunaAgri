'use client';
export default function OfflinePage() {
  return (
    <div className="app-light min-h-screen flex flex-col items-center justify-center p-8 text-center"
      style={{ background: 'var(--bg)' }}>
      <div className="floating text-6xl mb-6">🌾</div>
      <h1 className="text-2xl font-bold gradient-text mb-3">You're Offline</h1>
      <p className="text-base mb-2" style={{ color: 'var(--text-secondary)' }}>
        No internet connection detected.
      </p>
      <p className="text-sm mb-8 max-w-xs" style={{ color: 'var(--text-muted)' }}>
        Your previous soil tests, cost logs, and irrigation schedules are available locally. AI features require internet.
      </p>
      <div className="glass-card rounded-2xl p-5 w-full max-w-xs space-y-3 mb-6">
        <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>✅ Available offline:</p>
        {['📊 Yield & ROI Calculator','💸 Input Cost Tracker','💧 Irrigation Schedule','📅 Crop Calendar','🌿 Pest Alert Calendar'].map(f => (
          <div key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{f}</div>
        ))}
      </div>
      <div className="glass-card rounded-2xl p-4 w-full max-w-xs mb-6" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
        <p className="text-sm font-semibold mb-1" style={{ color: '#f87171' }}>❌ Requires internet:</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Disease Detection, AI Voice Assistant, Soil AI Recommendations, Market Prices</p>
      </div>
      <button onClick={() => window.location.reload()}
        className="btn-primary">
        🔄 Try Again
      </button>
    </div>
  );
}
