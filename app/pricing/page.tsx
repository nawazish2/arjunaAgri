'use client';

export default function PricingPage() {
  const plans = [
    {
      name: 'Free Plan',
      price: '₹0',
      period: '/month',
      highlight: false,
      badge: null,
      features: [
        '1 soil test',
        'Basic crop advice',
        'Community support',
      ],
      cta: 'Get Started Free',
      ctaVariant: 'outline-green',
    },
    {
      name: 'Farmer Pro',
      price: '₹199',
      period: '/month',
      highlight: true,
      badge: 'Most Popular',
      features: [
        'Unlimited soil tests',
        'AI disease detection',
        'Voice assistant 24/7',
        'Government scheme alerts',
      ],
      cta: 'Start Free Trial',
      ctaVariant: 'solid-green',
    },
    {
      name: 'Agri Business',
      price: '₹999',
      period: '/month',
      highlight: false,
      badge: null,
      features: [
        'Everything in Pro',
        '10 farmer accounts',
        'Direct market access',
        'Priority expert support',
      ],
      cta: 'Contact Sales',
      ctaVariant: 'outline-brown',
    },
  ];

  const ctaStyles: Record<string, React.CSSProperties> = {
    'outline-green': {
      display: 'block', width: '100%', padding: '12px',
      borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: 'pointer',
      background: 'transparent', border: '2px solid #16a34a', color: '#16a34a',
    },
    'solid-green': {
      display: 'block', width: '100%', padding: '12px',
      borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer',
      background: '#16a34a', border: '2px solid #16a34a', color: '#fff',
    },
    'outline-brown': {
      display: 'block', width: '100%', padding: '12px',
      borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: 'pointer',
      background: 'transparent', border: '2px solid #92400e', color: '#92400e',
    },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0fdf4', padding: '60px 16px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <span style={{
          background: '#dcfce7', color: '#15803d', fontSize: 13, fontWeight: 600,
          padding: '4px 14px', borderRadius: 999, letterSpacing: 1,
        }}>
          PRICING
        </span>
        <h1 style={{ marginTop: 16, fontSize: 36, fontWeight: 800, color: '#14532d', lineHeight: 1.2 }}>
          Plans for Every Farmer
        </h1>
        <p style={{ marginTop: 10, color: '#4b7c5e', fontSize: 17, maxWidth: 480, margin: '10px auto 0' }}>
          Start free, upgrade when you need more. No hidden charges.
        </p>
      </div>

      {/* Cards */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 24,
        justifyContent: 'center', maxWidth: 1000, margin: '0 auto',
        alignItems: 'stretch',
      }}>
        {plans.map((plan) => (
          <div
            key={plan.name}
            style={{
              flex: '1 1 280px', maxWidth: 320,
              borderRadius: 16,
              border: plan.highlight ? '2.5px solid #16a34a' : '1.5px solid #d1fae5',
              background: '#fff',
              boxShadow: plan.highlight
                ? '0 8px 40px rgba(22,163,74,0.18)'
                : '0 2px 12px rgba(0,0,0,0.06)',
              padding: '32px 28px 28px',
              position: 'relative',
              display: 'flex', flexDirection: 'column',
              transform: plan.highlight ? 'scale(1.03)' : 'scale(1)',
            }}
          >
            {/* Badge */}
            {plan.badge && (
              <div style={{
                position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                background: '#16a34a', color: '#fff',
                padding: '4px 18px', borderRadius: 999,
                fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
                whiteSpace: 'nowrap',
              }}>
                ⭐ {plan.badge}
              </div>
            )}

            {/* Plan name */}
            <div style={{ fontSize: 18, fontWeight: 700, color: plan.highlight ? '#14532d' : '#374151' }}>
              {plan.name}
            </div>

            {/* Price */}
            <div style={{ marginTop: 12, marginBottom: 4, display: 'flex', alignItems: 'flex-end', gap: 4 }}>
              <span style={{ fontSize: 42, fontWeight: 800, color: plan.highlight ? '#16a34a' : '#111827', lineHeight: 1 }}>
                {plan.price}
              </span>
              <span style={{ fontSize: 15, color: '#6b7280', marginBottom: 6 }}>{plan.period}</span>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '16px 0' }} />

            {/* Features */}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
              {plan.features.map((f) => (
                <li key={f} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 0', fontSize: 15, color: '#374151',
                }}>
                  <span style={{ color: '#16a34a', fontWeight: 700, fontSize: 17 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div style={{ marginTop: 24 }}>
              <button style={ctaStyles[plan.ctaVariant]}>
                {plan.cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Trust line */}
      <p style={{ textAlign: 'center', marginTop: 40, color: '#6b7280', fontSize: 14 }}>
        🔒 Secure payments &nbsp;·&nbsp; Cancel anytime &nbsp;·&nbsp; 7-day free trial on Pro
      </p>
    </div>
  );
}
