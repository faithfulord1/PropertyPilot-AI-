function Badge({ label, bg, color }) {
  return <span style={{ background: bg, color, fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 20, display: 'inline-block' }}>{label}</span>;
}

const ITEMS = [
  { icon: '🏆', title: 'Nebius AI Builders Challenge', desc: '3 live AI agents with Nebius Studio integration, AI governance audit trail, 5-table data model, full-stack build — demonstrates innovation, real-world impact, and technical depth.', tags: ['Innovation', 'Real-World Impact', 'Technical Depth'] },
  { icon: '📊', title: 'Power BI Portfolio Piece', desc: 'Star schema data model, 5 dashboards, 10 DAX measures, executive KPIs, risk & revenue analytics, drill-through pages — showcases data architecture and BI skills.', tags: ['Data Modelling', 'DAX', 'Dashboard Design'] },
  { icon: '💻', title: 'Full-Stack Application', desc: 'React + Vite frontend, Express + SQLite backend, JWT authentication, RESTful API, CSV data ingestion — proves end-to-end development capability.', tags: ['Full-Stack', 'API Design', 'Database'] },
  { icon: '🎙️', title: 'Interview Talking Point', desc: '"I built an AI property platform covering data architecture, AI agents, risk management, compliance, and Power BI — all from one project." Speaks to business analysis and product management.', tags: ['Business Analysis', 'Product Management', 'AI'] },
  { icon: '🛡️', title: 'TPRM / GRC Evidence', desc: 'AML tracking, ICO data compliance, AI audit trail, EU AI Act Art. 12 logging, risk classification engine, due diligence records — demonstrates governance mindset.', tags: ['AML', 'ICO', 'EU AI Act', 'Risk'] },
];

export default function PortfolioGuide() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--navy)' }}>Portfolio & Submission Guide</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          5 ways this one project opens doors across property, data, AI, and GRC careers
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {ITEMS.map(({ icon, title, desc, tags }) => (
          <div key={title} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '16px 18px', display: 'flex', gap: 14
          }}>
            <span style={{ fontSize: 28, lineHeight: 1 }}>{icon}</span>
            <div>
              <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{title}</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.6 }}>{desc}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {tags.map(t => <Badge key={t} label={t} bg="#E6F1FB" color="#0C447C" />)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Judging criteria */}
      <div style={{ background: 'var(--gold-pale)', borderRadius: 'var(--radius-lg)', border: '1px solid #EBD090', padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#8B6A1A', marginBottom: 12 }}>Nebius Judging Criteria Mapping</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            ['Technical Complexity', '3 AI agents, React+Express full-stack, SQLite, JWT auth, REST API'],
            ['Innovation', 'AI scoring engine, investor matching algorithm, automated summary generation'],
            ['Real-World Impact', '100 properties, 50 investors, 25 completed fee transactions'],
            ['Business Viability', 'Subscription tiers (£29–£199/mo), Stripe/PayPal payment integration'],
            ['Presentation', 'Complete dashboard, Power BI guide, portfolio guide, demo scripts'],
            ['AI Integration', 'Nebius-ready API architecture, local fallback scoring, AI audit trail'],
          ].map(([criterion, evidence]) => (
            <div key={criterion} style={{ background: '#fff', borderRadius: 8, padding: '10px 14px', border: '1px solid #EBD090' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 4 }}>{criterion}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{evidence}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
