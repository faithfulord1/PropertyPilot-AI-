import { useState, useEffect } from 'react';
import { api } from '../api';

function KPICard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 18,
      border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
      display: 'flex', flexDirection: 'column', gap: 6
    }}>
      <div style={{ fontSize: 22, marginBottom: 2 }}>{icon}</div>
      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || 'var(--navy)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard({ user }) {
  const [kpi, setKpi] = useState(null);
  const [recentDeals, setRecentDeals] = useState([]);
  const [recentProps, setRecentProps] = useState([]);

  useEffect(() => {
    api.kpi.get().then(setKpi);
    api.deals.list({ limit: 8 }).then(d => setRecentDeals(d.data || []));
    api.properties.list({ limit: 6 }).then(p => setRecentProps(p.data || []));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Welcome */}
      <div style={{
        background: 'linear-gradient(135deg, var(--navy), var(--navy-light))',
        borderRadius: 'var(--radius-lg)', padding: '24px 28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <div style={{ color: 'var(--gold)', fontSize: 13, marginBottom: 4 }}>Welcome back, {user?.name || 'Investor'}</div>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>PropertyPilot AI™ Dashboard</div>
          <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 13, marginTop: 4 }}>
            AI-powered property intelligence · 100 deals analysed · 50 investors matched
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'var(--gold)', fontSize: 28, fontWeight: 700 }}>£2.38M</div>
          <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 11 }}>Total Profit Pipeline</div>
        </div>
      </div>

      {/* KPI Grid */}
      {kpi && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
          <KPICard icon="🏘" label="Total Leads" value={kpi.totalLeads} sub="100 properties" />
          <KPICard icon="📊" label="Deals Analysed" value={kpi.totalDeals} sub="100% coverage" color="var(--teal)" />
          <KPICard icon="💰" label="Profit Pipeline" value={`£${(kpi.profitPipeline / 1000).toFixed(0)}k`} color="var(--green)" />
          <KPICard icon="📈" label="Avg ROI" value={`${kpi.avgROI}%`} color="var(--gold)" />
          <KPICard icon="🎯" label="Avg Deal Score" value={kpi.avgScore} color="var(--teal)" />
          <KPICard icon="💷" label="Sourcing Fees" value={`£${(kpi.totalFees / 1000).toFixed(0)}k`} color="var(--green)" sub={`${kpi.collectedFees > 0 ? Math.round(kpi.collectedFees / kpi.totalFees * 100) : 0}% collected`} />
          <KPICard icon="👥" label="Active Investors" value={kpi.activeInvestors} sub={`of ${kpi.totalInvestors} total`} />
          <KPICard icon="✅" label="Completed Deals" value={kpi.completedDeals} sub="64% conversion" color="var(--green)" />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Recent Properties */}
        <div style={{
          background: 'var(--surface)', borderRadius: 'var(--radius)',
          border: '1px solid var(--border)', padding: 20
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🏠</span> Recent Property Leads
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ background: 'var(--bg)', color: 'var(--text-muted)', padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Address</th>
                  <th style={{ background: 'var(--bg)', color: 'var(--text-muted)', padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Area</th>
                  <th style={{ background: 'var(--bg)', color: 'var(--text-muted)', padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Price</th>
                  <th style={{ background: 'var(--bg)', color: 'var(--text-muted)', padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Motivation</th>
                </tr>
              </thead>
              <tbody>
                {recentProps.map(p => (
                  <tr key={p.Property_ID} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 500 }}>{p.Address?.split(',')[0]}</td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-mid)' }}>{p.Area}</td>
                    <td style={{ padding: '8px 10px' }}>£{Number(p.Asking_Price || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <span style={{
                        fontSize: 10, padding: '2px 7px', borderRadius: 20,
                        background: p.Vendor_Motivation === 'Divorce' || p.Vendor_Motivation === 'Repossession' ? 'var(--red-pale)' :
                                    p.Vendor_Motivation === 'Probate' ? 'var(--purple-pale)' : 'var(--amber-pale)',
                        color: p.Vendor_Motivation === 'Divorce' || p.Vendor_Motivation === 'Repossession' ? 'var(--red)' :
                               p.Vendor_Motivation === 'Probate' ? 'var(--purple)' : 'var(--amber)'
                      }}>{p.Vendor_Motivation}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Deals */}
        <div style={{
          background: 'var(--surface)', borderRadius: 'var(--radius)',
          border: '1px solid var(--border)', padding: 20
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🏆</span> Top Deals by ROI
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ background: 'var(--bg)', color: 'var(--text-muted)', padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontSize: 10, textTransform: 'uppercase' }}>Deal</th>
                  <th style={{ background: 'var(--bg)', color: 'var(--text-muted)', padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontSize: 10, textTransform: 'uppercase' }}>Area</th>
                  <th style={{ background: 'var(--bg)', color: 'var(--text-muted)', padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontSize: 10, textTransform: 'uppercase' }}>ROI</th>
                  <th style={{ background: 'var(--bg)', color: 'var(--text-muted)', padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontSize: 10, textTransform: 'uppercase' }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {recentDeals.map(d => (
                  <tr key={d.Deal_ID} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 500, fontFamily: 'monospace', fontSize: 11 }}>{d.Deal_ID}</td>
                    <td style={{ padding: '8px 10px', color: 'var(--text-mid)' }}>{d.Property_ID ? '—' : '—'}</td>
                    <td style={{ padding: '8px 10px', fontWeight: 600, color: Number(d.ROI_Percent) >= 18 ? 'var(--green)' : 'var(--amber)' }}>{d.ROI_Percent}%</td>
                    <td style={{ padding: '8px 10px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 28, height: 28, borderRadius: '50%', fontSize: 11, fontWeight: 700,
                        border: `2px solid ${Number(d.Deal_Score) >= 80 ? 'var(--green)' : Number(d.Deal_Score) >= 70 ? 'var(--amber)' : 'var(--red)'}`,
                        color: Number(d.Deal_Score) >= 80 ? 'var(--green)' : Number(d.Deal_Score) >= 70 ? 'var(--amber)' : 'var(--red)',
                        background: Number(d.Deal_Score) >= 80 ? 'var(--green-pale)' : Number(d.Deal_Score) >= 70 ? 'var(--amber-pale)' : 'var(--red-pale)'
                      }}>{d.Deal_Score}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div style={{
        display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 'var(--radius-sm)',
        background: 'var(--teal-pale)', borderLeft: '3px solid var(--teal)'
      }}>
        <span style={{ fontSize: 18 }}>💡</span>
        <div style={{ fontSize: 12, color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>AI Insight:</strong> Your portfolio shows <strong>98% of deals rated Good or above</strong>.
          SA strategy delivers highest ROI (18.6%) though limited to 5 deals. Flip generates highest average profit (£37k) per deal.
          <strong style={{ display: 'block', marginTop: 6 }}>Next action:</strong> Use <strong>Agent 1 (Deal Analyser)</strong> to analyse new deals,
          <strong> Agent 2 (Investor Matcher)</strong> to find the right buyers, and
          <strong> Agent 3 (Summary Generator)</strong> to create professional deal packs.
        </div>
      </div>
    </div>
  );
}
