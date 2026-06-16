const PAGE_TITLES = {
  dashboard: 'Executive Dashboard',
  agent1: 'AI Deal Analyser',
  agent2: 'AI Investor Matcher',
  agent3: 'AI Summary Generator',
  powerbi: 'Power BI Dashboard Guide',
  portfolio: 'Portfolio & Submission Guide',
  subscription: 'Subscription Plans',
};

export default function TopBar({ page, user }) {
  return (
    <header style={{
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      padding: '0 24px', height: 58, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 90
    }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--navy)' }}>
          {PAGE_TITLES[page] || 'PropertyPilot AI'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
          PropertyPilot AI™ · Real-time property intelligence
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          fontSize: 11, padding: '4px 10px', borderRadius: 20,
          background: 'var(--gold-pale)', color: '#8B6A1A', fontWeight: 500,
          border: '1px solid #EBD090'
        }}>Nebius AI Challenge 2025</span>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'linear-gradient(135deg,var(--navy),var(--teal))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer'
        }} title={user?.name}>
          {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
