export default function PowerBIGuide() {
  const dax = [
    { label: 'Total Deals', formula: 'COUNTROWS(property_leads)' },
    { label: 'Total Fees', formula: 'SUM(sourcing_fees[Agreed_Fee])' },
    { label: 'Fees Collected', formula: 'CALCULATE([Total Fees], sourcing_fees[Payment_Status]="Paid")' },
    { label: 'Active Investors', formula: 'CALCULATE(COUNTROWS(investor_buyers), investor_buyers[Status]="Active")' },
    { label: 'Avg ROI %', formula: 'AVERAGE(deal_analysis[ROI_Percent])' },
    { label: 'Avg AI Score', formula: 'AVERAGE(deal_analysis[Deal_Score])' },
    { label: 'High Risk Deals', formula: 'CALCULATE(COUNTROWS(deal_analysis), deal_analysis[Risk_Level]="High")' },
    { label: 'Fee Collection %', formula: 'DIVIDE([Fees Collected], [Total Fees], 0)' },
    { label: 'Pipeline Value', formula: 'CALCULATE(SUM(deal_analysis[GDV]), property_leads[Status] IN {"In Progress","Under Offer"})' },
    { label: 'Conversion Rate %', formula: 'DIVIDE(CALCULATE(COUNTROWS(deal_matching), deal_matching[Outcome]="Completed"), COUNTROWS(deal_matching), 0)' },
  ];

  const relationships = [
    ['deal_analysis', 'Property_ID', 'property_leads', 'Property_ID', 'Many:One'],
    ['deal_matching', 'Deal_ID', 'deal_analysis', 'Deal_ID', 'Many:One'],
    ['deal_matching', 'Investor_ID', 'investor_buyers', 'Investor_ID', 'Many:One'],
    ['sourcing_fees', 'Deal_ID', 'deal_analysis', 'Deal_ID', 'Many:One'],
    ['sourcing_fees', 'Investor_ID', 'investor_buyers', 'Investor_ID', 'Many:One'],
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--navy)' }}>Power BI Dashboard Guide</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          5 dashboards built from your real CSV data — with DAX formulas and setup steps
        </div>
      </div>

      {/* Step 1: Import */}
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontWeight: 700, fontSize: 14 }}>1</div>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Import your 5 CSV files into Power BI</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          {['property_leads.csv', 'deal_analysis.csv', 'investor_buyers.csv', 'deal_matching.csv', 'sourcing_fees.csv'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
              <span>📄</span>
              <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text)' }}>{f}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>Get Data → Text/CSV → Select all 5 files → Load</p>
      </div>

      {/* Step 2: Relationships */}
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontWeight: 700, fontSize: 14 }}>2</div>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Set Relationships in Model View</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {relationships.map(([t1, c1, t2, c2, type], i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
              padding: '8px 12px', background: 'var(--bg)', borderRadius: 6,
              fontSize: 12, fontFamily: 'monospace', border: '1px solid var(--border-light)'
            }}>
              <span style={{ color: 'var(--teal)', fontWeight: 500 }}>{t1}</span>
              <span>[{c1}]</span>
              <span style={{ color: 'var(--text-muted)' }}>→</span>
              <span style={{ color: 'var(--teal)', fontWeight: 500 }}>{t2}</span>
              <span>[{c2}]</span>
              <span style={{ marginLeft: 'auto', background: 'var(--teal-pale)', color: 'var(--teal)', padding: '1px 8px', borderRadius: 10, fontSize: 10 }}>{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step 3: DAX */}
      <div style={{ background: 'var(--navy)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--navy)', fontWeight: 700, fontSize: 14 }}>3</div>
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--gold)' }}>DAX Measures — Copy & Paste</span>
        </div>
        {dax.map(({ label, formula }) => (
          <div key={label} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: '#7ECFDF', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#AABBCC', lineHeight: 1.6, background: 'rgba(255,255,255,.05)', padding: '6px 10px', borderRadius: 4 }}>
              {formula}
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard descriptions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { name: 'Executive Dashboard', desc: 'KPI cards, monthly fees bar chart, deals by status donut, revenue trend line', icon: '📊' },
          { name: 'Deal Analysis', desc: 'ROI by area bar chart, strategy comparison column chart, scatter: AI Score vs ROI%', icon: '🏠' },
          { name: 'Investor Dashboard', desc: 'Investors by strategy, match scores, conversion funnel, top investors table', icon: '👥' },
          { name: 'Risk Dashboard', desc: 'Risk distribution donut, AML status, AI score histogram, risk trend line', icon: '⚠️' },
          { name: 'Revenue Dashboard', desc: 'Fee collection rate, monthly revenue, outstanding amounts, avg fee per deal', icon: '💰' },
        ].map(d => (
          <div key={d.name} style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: 16 }}>
            <div style={{ fontSize: 16, marginBottom: 6 }}>{d.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginBottom: 4 }}>{d.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
