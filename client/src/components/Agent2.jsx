import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

const SAMPLE_LEADS = [
  { id: 'PL001', address: '14 Thornton Road', area: 'Leeds', type: 'Terraced', beds: 3, asking: 145000, motivation: 'Divorce' },
  { id: 'PL002', address: '27 Maple Avenue', area: 'Birmingham', type: 'Semi-Detached', beds: 3, asking: 175000, motivation: 'Relocation' },
  { id: 'PL003', address: '8 Victoria Street', area: 'Manchester', type: 'Terraced', beds: 2, asking: 130000, motivation: 'Debt' },
  { id: 'PL005', address: '19 Beech Close', area: 'Sheffield', type: 'Semi-Detached', beds: 4, asking: 185000, motivation: 'Repossession' },
  { id: 'PL006', address: '3 Crown Street', area: 'Leeds', type: 'Flat', beds: 2, asking: 90000, motivation: 'Divorce' },
  { id: 'PL012', address: '88 Grange Road', area: 'Liverpool', type: 'Terraced', beds: 3, asking: 112000, motivation: 'Divorce' },
  { id: 'PL019', address: '64 Millfield Road', area: 'Hull', type: 'Terraced', beds: 3, asking: 98000, motivation: 'Probate' },
  { id: 'PL027', address: '5 Burnley Road', area: 'Burnley', type: 'Terraced', beds: 3, asking: 78000, motivation: 'Relocation' },
];

function Badge({ label, bg, color }) {
  return <span style={{ background: bg, color, fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 20, display: 'inline-block' }}>{label}</span>;
}

export default function Agent2({ prefill }) {
  const [selected, setSelected] = useState(prefill?.deal || SAMPLE_LEADS[0]);
  const [matches, setMatches] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  const run = useCallback(async () => {
    setRunning(true);
    setError('');
    const deal = {
      ...selected,
      purchasePrice: selected.asking * 0.85,
      refurbCost: 15000, gdv: selected.asking * 1.1,
      legalFees: 2500, stampDuty: 0, financeCosts: 5000,
      monthlyRent: Math.round(selected.asking * 0.005),
      strategy: 'BTL', vendorMotivation: selected.motivation,
      area: selected.area
    };
    try {
      const data = await api.ai.match({ deal });
      setMatches(data.matches);
    } catch (e) {
      setError(e.message);
      // local fallback
      const data = await api.ai.analyse(deal);
      const invs = await api.investors.list().catch(() => ({ data: [] }));
      const local = matchLocal(deal, invs.data, data);
      setMatches(local);
    }
    setRunning(false);
  }, [selected]);

  const scoreColor = s => s >= 75 ? '#1E8449' : s >= 50 ? '#D4850D' : '#C0392B';

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--navy)' }}>Agent 2: AI Investor Matcher</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Select a property → AI matches the top 3 investors by area, budget, strategy, and activity
        </div>
      </div>

      {prefill?.deal && (
        <div style={{
          background: 'var(--gold-pale)', borderRadius: 'var(--radius-md)',
          padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#8B6A1A', border: '1px solid #EBD090'
        }}>
          ✓ Using deal from Agent 1: {prefill.deal.address} — Score {prefill.result?.score}/100
          {prefill.deal && <button onClick={() => { setSelected({ ...prefill.deal, asking: prefill.deal.purchasePrice, motivation: prefill.deal.vendorMotivation }); }} style={{ marginLeft: 12, fontSize: 11, padding: '2px 8px', borderRadius: 4, border: '1px solid #EBD090', background: '#fff', cursor: 'pointer', color: '#633806' }}>Use this deal</button>}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Select property to match:</label>
        <select value={selected.id} onChange={e => setSelected(SAMPLE_LEADS.find(l => l.id === e.target.value))}
          style={{ width: '100%', fontSize: 14, padding: '10px 12px' }}>
          {SAMPLE_LEADS.map(l => <option key={l.id} value={l.id}>{l.address}, {l.area} — {l.motivation}</option>)}
        </select>
      </div>

      <div style={{
        background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
        padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap',
        border: '1px solid var(--border-light)'
      }}>
        <span style={{ fontSize: 13, color: 'var(--text-mid)' }}>📍 {selected.area}</span>
        <span style={{ fontSize: 13, color: 'var(--text-mid)' }}>🏠 {selected.type} · {selected.beds} bed</span>
        <span style={{ fontSize: 13, color: 'var(--text-mid)' }}>💷 £{selected.asking.toLocaleString()}</span>
        <span style={{ fontSize: 13, color: 'var(--text-mid)' }}>⚡ {selected.motivation}</span>
      </div>

      <button onClick={run} disabled={running} style={{
        background: 'var(--navy)', color: 'var(--gold)', border: 'none',
        padding: '12px 24px', borderRadius: 'var(--radius-md)', fontWeight: 600,
        fontSize: 14, cursor: running ? 'wait' : 'pointer', marginBottom: 24
      }}>
        {running ? '⏳ AI Matching investors...' : '▶ Match Investors'}
      </button>
      {error && <div style={{ color: 'var(--red)', fontSize: 12, marginBottom: 12 }}>{error}</div>}

      {matches && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {matches.map((inv, i) => (
            <div key={inv.Investor_ID || i} style={{
              background: 'var(--surface)', border: `0.5px solid ${i === 0 ? 'var(--gold)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-lg)', padding: 16, display: 'flex', gap: 16, alignItems: 'flex-start'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 52 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: i === 0 ? 'var(--gold)' : i === 1 ? '#D0D5DE' : '#F4F6F9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 16, color: i === 0 ? 'var(--navy)' : '#5F5E5A'
                }}>#{i + 1}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>match</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{inv.Investor_Name || inv.name}</span>
                  <Badge label={inv.Strategy || inv.strategy || 'BTL'} bg="#E6F1FB" color="#0C447C" />
                  <Badge label={`${inv.Deals_Completed || inv.deals || 0} deals`} bg="var(--green-pale)" color="#27500A" />
                  {i === 0 && <Badge label="Best Match" bg="var(--gold)" color="var(--navy)" />}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                  {(inv.Investor_Type || inv.type)} · Budget: £{((inv.Budget_Min || inv.budgetMin || 0) / 1000).toFixed(0)}k–£{((inv.Budget_Max || inv.budgetMax || 0) / 1000).toFixed(0)}k · {inv.Preferred_Areas || inv.areas}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Match Score</span>
                    <span style={{ fontWeight: 600, color: scoreColor(inv.matchScore) }}>{inv.matchScore}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${inv.matchScore}%`, background: scoreColor(inv.matchScore), borderRadius: 3, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(inv.reasons || []).map((r, j) => (
                    <span key={j} style={{ fontSize: 11, background: 'var(--bg)', padding: '3px 8px', borderRadius: 20, color: 'var(--text-muted)' }}>✓ {r}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function matchLocal(deal, investors, dealResult) {
  return (investors || []).map(inv => {
    let score = 0;
    const reasons = [];
    const areas = (inv.Preferred_Areas || '').split(',').map(a => a.trim().toLowerCase());
    const dealArea = (deal.area || '').toLowerCase();
    if (areas.some(a => dealArea.includes(a) || a.includes(dealArea))) {
      score += 30;
      reasons.push(`Area match: ${(inv.Preferred_Areas || '').split(',')[0]?.trim()}`);
    }
    if (dealResult.totalInvestment >= (inv.Budget_Min || 0) && dealResult.totalInvestment <= (inv.Budget_Max || 999999)) {
      score += 25;
      reasons.push(`Budget fit: £${((inv.Budget_Min || 0) / 1000).toFixed(0)}k–£${((inv.Budget_Max || 0) / 1000).toFixed(0)}k`);
    }
    score += 15;
    reasons.push(`${inv.Status || 'Active'} investor`);
    score = Math.min(score, 100);
    return { ...inv, matchScore: score, reasons };
  }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
}
