const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', group: 'Overview' },
  { id: 'agent1', label: 'Deal Analyser', icon: '🔍', group: 'AI Agents', sub: 'Agent 1' },
  { id: 'agent2', label: 'Investor Matcher', icon: '👥', group: 'AI Agents', sub: 'Agent 2' },
  { id: 'agent3', label: 'Summary Generator', icon: '📝', group: 'AI Agents', sub: 'Agent 3' },
  { id: 'powerbi', label: 'Power BI Guide', icon: '📊', group: 'Resources', sub: 'Dashboards' },
  { id: 'portfolio', label: 'Portfolio Guide', icon: '🏆', group: 'Resources', sub: 'Submission' },
  { id: 'subscription', label: 'Subscription', icon: '💳', group: 'Account' },
];

export default function Sidebar({ page, setPage, user, onLogout }) {
  const groups = [...new Set(NAV.map(n => n.group))];

  return (
    <aside style={{
      width: 240, position: 'fixed', top: 0, left: 0, height: '100vh',
      background: 'var(--navy)', display: 'flex', flexDirection: 'column',
      zIndex: 100, overflowY: 'auto'
    }}>
      <div style={{ padding: '22px 18px 16px', borderBottom: '1px solid rgba(201,168,76,.2)' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold)', letterSpacing: 0.3 }}>🏘 PropertyPilot AI™</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', marginTop: 3 }}>Intelligence Dashboard</div>
        <div style={{ fontSize: 10, color: 'rgba(201,168,76,.7)', marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,.07)' }}>
          Created by <strong>Faithfulord</strong><br />Faith Growth Agency · London SE1
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {groups.map(group => (
          <div key={group}>
            <div style={{
              fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,.35)',
              letterSpacing: 1.2, textTransform: 'uppercase', padding: '12px 8px 6px'
            }}>{group}</div>
            {NAV.filter(n => n.group === group).map(item => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px',
                  borderRadius: 6, cursor: 'pointer', transition: '.15s',
                  color: page === item.id ? 'var(--navy)' : 'rgba(255,255,255,.65)',
                  fontSize: 13, marginBottom: 1, border: 'none',
                  width: '100%', textAlign: 'left',
                  background: page === item.id ? 'linear-gradient(135deg,var(--gold),#B8902E)' : 'transparent',
                  fontWeight: page === item.id ? 600 : 400,
                }}
              >
                <span>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.sub && <span style={{ fontSize: 9, opacity: 0.6 }}>{item.sub}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,.07)', fontSize: 10, color: 'rgba(255,255,255,.4)', lineHeight: 1.6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg,var(--navy),var(--teal))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: '#fff'
          }}>
            {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
          </div>
          <span style={{ color: 'rgba(255,255,255,.7)', fontSize: 11 }}>{user?.name || 'User'}</span>
        </div>
        <button onClick={onLogout} style={{
          background: 'rgba(255,255,255,.08)', border: 'none', color: 'rgba(255,255,255,.6)',
          padding: '4px 10px', borderRadius: 4, fontSize: 10, cursor: 'pointer', width: '100%'
        }}>Sign Out</button>
      </div>
    </aside>
  );
}
