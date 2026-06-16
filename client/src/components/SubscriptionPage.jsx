import { useState, useEffect } from 'react';
import { api } from '../api';

const PLAN_COLORS = {
  free: { bg: '#F4F6F9', border: '#DDE1EC', accent: '#7A87A8', btn: '#7A87A8' },
  starter: { bg: '#E6F1FB', border: '#B8D4E8', accent: '#1A7F8E', btn: '#1A7F8E' },
  professional: { bg: 'var(--gold-pale)', border: '#EBD090', accent: 'var(--gold)', btn: 'var(--navy)' },
  enterprise: { bg: '#F0EAFA', border: '#D4C5E8', accent: '#6B3FA0', btn: '#6B3FA0' },
};

export default function SubscriptionPage({ user }) {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [loading, setLoading] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.subscription.plans().then(d => setPlans(d.plans || []));
    api.auth.me().then(d => {
      if (d.subscription?.plan) setCurrentPlan(d.subscription.plan);
    }).catch(() => {});
  }, []);

  const upgrade = async (planId) => {
    setLoading(planId);
    setMessage('');
    try {
      await api.subscription.upgrade(planId);
      setCurrentPlan(planId);
      setMessage(`✓ Upgraded to ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan`);
    } catch (e) {
      setMessage(`Error: ${e.message}`);
    }
    setLoading('');
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--navy)' }}>Subscription Plans</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Choose the plan that fits your needs. Upgrade anytime to unlock more features.
        </div>
      </div>

      {message && (
        <div style={{
          padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: 16,
          background: message.startsWith('✓') ? 'var(--green-pale)' : 'var(--red-pale)',
          color: message.startsWith('✓') ? 'var(--green)' : 'var(--red)',
          fontSize: 13
        }}>{message}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {plans.map(plan => {
          const colors = PLAN_COLORS[plan.id] || PLAN_COLORS.free;
          const isCurrent = currentPlan === plan.id;
          return (
            <div key={plan.id} style={{
              background: colors.bg, borderRadius: 'var(--radius-lg)',
              border: `1px solid ${isCurrent ? colors.accent : colors.border}`,
              padding: 24, display: 'flex', flexDirection: 'column',
              position: 'relative',
              boxShadow: isCurrent ? '0 4px 16px rgba(0,0,0,.08)' : 'none'
            }}>
              {isCurrent && (
                <div style={{
                  position: 'absolute', top: -8, right: 16,
                  background: colors.accent, color: '#fff',
                  fontSize: 10, fontWeight: 600, padding: '2px 10px',
                  borderRadius: 20
                }}>CURRENT</div>
              )}

              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)', marginBottom: 4 }}>{plan.name}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--navy)', marginBottom: 16 }}>
                £{plan.price}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}>/mo</span>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {(plan.features || []).map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--text-mid)' }}>
                    <span style={{ color: 'var(--green)' }}>✓</span> {f}
                  </div>
                ))}
              </div>

              <button
                onClick={() => upgrade(plan.id)}
                disabled={isCurrent || loading === plan.id}
                style={{
                  background: isCurrent ? '#fff' : colors.btn,
                  color: isCurrent ? colors.accent : '#fff',
                  border: isCurrent ? `1px solid ${colors.accent}` : 'none',
                  padding: '10px 0', borderRadius: 8, fontWeight: 600, fontSize: 14,
                  cursor: isCurrent ? 'default' : 'pointer', transition: '.15s'
                }}
              >
                {loading === plan.id ? '⏳...' : isCurrent ? 'Current Plan' : 'Upgrade'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment Info */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: 20, marginTop: 24
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)', marginBottom: 12 }}>
          💳 Payment Methods
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          PropertyPilot AI accepts <strong>Credit/Debit Cards</strong> (via Stripe) and <strong>PayPal</strong>.
          To enable live payments, add your Stripe secret key to the server <code>.env</code> file and PayPal client ID.
          All transactions are processed securely. Your subscription supports ongoing AI model improvements and platform development.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <span style={{ fontSize: 24 }}>💳</span>
          <span style={{ fontSize: 24 }}>📱</span>
          <span style={{ fontSize: 24 }}>🏦</span>
        </div>
      </div>
    </div>
  );
}
