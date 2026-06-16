import { useState, useCallback, useEffect } from 'react';
import { api } from '../api';

const AREAS = ['Leeds','Birmingham','Manchester','Sheffield','Nottingham','Liverpool','Bristol','London','Newcastle','Leicester','Hull','York','Derby','Coventry','Wakefield'];
const TYPES = ['Terraced','Semi-Detached','Detached','Flat','HMO','Commercial'];
const MOTIVATIONS = ['Divorce','Probate','Repossession','Financial Difficulty','Relocation','Retirement','Downsizing','Debt','Estate Agent'];
const STRATEGIES = ['BTL','Flip','HMO','BRRR','SA'];

function Badge({ label, bg, color }) {
  return <span style={{ background: bg, color, fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 20, display: 'inline-block' }}>{label}</span>;
}

function ScoreCircle({ score, size = 72 }) {
  const col = score >= 75 ? '#1E8449' : score >= 50 ? '#D4850D' : '#C0392B';
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', border: `3px solid ${col}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: score >= 75 ? 'var(--green-pale)' : score >= 50 ? 'var(--amber-pale)' : 'var(--red-pale)' }}>
      <span style={{ fontSize: size * 0.32, fontWeight: 700, color: col, lineHeight: 1 }}>{score}</span>
      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>/ 100</span>
    </div>
  );
}

export default function Agent1({ onResult }) {
  const [form, setForm] = useState({
    address: '14 Thornton Road, Leeds', area: 'Leeds', type: 'Terraced',
    vendorMotivation: 'Divorce', strategy: 'BTL',
    purchasePrice: 125000, refurbCost: 18000, refurbLevel: 'Light',
    gdv: 165000, legalFees: 2500, stampDuty: 0, financeCosts: 6200,
    monthlyRent: 840
  });
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  const run = useCallback(async () => {
    setRunning(true);
    setError('');
    try {
      const r = await api.ai.analyse(form);
      setResult(r);
      onResult?.({ deal: form, result: r });
    } catch (e) {
      setError(e.message);
      // Fallback to local calculation
      const r = calculateLocal(form);
      setResult(r);
      onResult?.({ deal: form, result: r });
    }
    setRunning(false);
  }, [form, onResult]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: isNaN(v) || v === '' ? v : Number(v) }));

  const inputStyle = { width: '100%', fontSize: 14, boxSizing: 'border-box' };
  const labelStyle = { fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' };
  const col2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };

  const riskBg = (r) => r === 'Low' ? 'var(--green-pale)' : r === 'Medium' ? 'var(--amber-pale)' : 'var(--red-pale)';
  const riskText = (r) => r === 'Low' ? '#27500A' : r === 'Medium' ? '#633806' : '#501313';

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--navy)' }}>Agent 1: AI Deal Analyser</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Enter deal inputs → AI calculates ROI, profit, risk score, and investment rating
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* LEFT: Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--navy)' }}>Property Details</p>
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>Address</label>
              <input value={form.address} onChange={e => set('address', e.target.value)} style={inputStyle} />
            </div>
            <div style={col2}>
              <div><label style={labelStyle}>Area / City</label>
                <select value={form.area} onChange={e => set('area', e.target.value)} style={inputStyle}>
                  {AREAS.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Property Type</label>
                <select value={form.type} onChange={e => set('type', e.target.value)} style={inputStyle}>
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={col2}>
              <div><label style={labelStyle}>Vendor Motivation</label>
                <select value={form.vendorMotivation} onChange={e => set('vendorMotivation', e.target.value)} style={inputStyle}>
                  {MOTIVATIONS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Strategy</label>
                <select value={form.strategy} onChange={e => set('strategy', e.target.value)} style={inputStyle}>
                  {STRATEGIES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={col2}>
              <div><label style={labelStyle}>Refurb Level</label>
                <select value={form.refurbLevel} onChange={e => set('refurbLevel', e.target.value)} style={inputStyle}>
                  {['Cosmetic','Light','Medium','Heavy'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--navy)' }}>Financial Inputs (£)</p>
            <div style={col2}>
              <div><label style={labelStyle}>Purchase Price</label><input type="number" value={form.purchasePrice} onChange={e => set('purchasePrice', e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Refurb Cost</label><input type="number" value={form.refurbCost} onChange={e => set('refurbCost', e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>GDV (After Refurb)</label><input type="number" value={form.gdv} onChange={e => set('gdv', e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Monthly Rent</label><input type="number" value={form.monthlyRent} onChange={e => set('monthlyRent', e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Legal Fees</label><input type="number" value={form.legalFees} onChange={e => set('legalFees', e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Stamp Duty</label><input type="number" value={form.stampDuty} onChange={e => set('stampDuty', e.target.value)} style={inputStyle} /></div>
              <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Finance Costs</label><input type="number" value={form.financeCosts} onChange={e => set('financeCosts', e.target.value)} style={inputStyle} /></div>
            </div>
          </div>

          <button onClick={run} disabled={running} style={{
            background: 'var(--navy)', color: 'var(--gold)', border: 'none',
            padding: '14px 20px', borderRadius: 'var(--radius-md)', fontWeight: 600,
            fontSize: 15, cursor: running ? 'wait' : 'pointer', letterSpacing: 0.5,
            transition: '.15s'
          }}>
            {running ? '⏳ AI Analysing deal...' : '▶ Run AI Analysis'}
          </button>
          {error && <div style={{ color: 'var(--red)', fontSize: 12 }}>{error}</div>}
        </div>

        {/* RIGHT: Results */}
        <div>
          {!result && (
            <div style={{
              background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)', padding: 32, textAlign: 'center',
              color: 'var(--text-muted)', height: '100%', display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12
            }}>
              <div style={{ fontSize: 48 }}>📊</div>
              <p style={{ fontSize: 15, fontWeight: 500 }}>Results appear here</p>
              <p style={{ fontSize: 13 }}>Enter deal details and click Run AI Analysis</p>
            </div>
          )}
          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: 20, display: 'flex',
                alignItems: 'center', gap: 20
              }}>
                <ScoreCircle score={result.score} size={80} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>AI Deal Score</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    <Badge label={result.rating} bg={result.rating === 'Excellent' ? 'var(--green-pale)' : result.rating === 'Strong' ? '#E6F1FB' : result.rating === 'Good' ? 'var(--amber-pale)' : 'var(--red-pale)'}
                      color={result.rating === 'Excellent' ? '#27500A' : result.rating === 'Strong' ? '#0C447C' : result.rating === 'Good' ? '#633806' : '#501313'} />
                    <Badge label={`${result.risk} Risk`} bg={riskBg(result.risk)} color={riskText(result.risk)} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{result.riskReasons?.[0]}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <KPIVal icon="💰" label="Total Investment" value={`£${result.totalInvestment.toLocaleString()}`} />
                <KPIVal icon="📈" label="Net Profit" value={`£${result.profit.toLocaleString()}`} color={result.profit > 0 ? 'var(--green)' : 'var(--red)'} />
                <KPIVal icon="🎯" label="ROI %" value={`${result.roi}%`} color={result.roi >= 20 ? 'var(--green)' : result.roi >= 10 ? 'var(--amber)' : 'var(--red)'} />
                <KPIVal icon="🏠" label="Gross Yield" value={`${result.yieldPct}%`} color={result.yieldPct >= 7 ? 'var(--green)' : result.yieldPct >= 5 ? 'var(--amber)' : 'var(--red)'} />
                <KPIVal icon="💵" label="Monthly Cashflow" value={`£${result.cashflow}`} color={result.cashflow > 0 ? 'var(--green)' : 'var(--red)'} />
                <KPIVal icon="📊" label="GDV" value={`£${form.gdv.toLocaleString()}`} />
              </div>

              {/* Risk Assessment */}
              <div style={{
                background: riskBg(result.risk), borderLeft: `4px solid ${riskText(result.risk)}`,
                borderRadius: '0 var(--radius-md) var(--radius-md) 0', padding: '12px 16px'
              }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: riskText(result.risk), marginBottom: 8 }}>
                  Risk Assessment — {result.risk} Risk
                </p>
                {result.riskReasons?.map((r, i) => (
                  <p key={i} style={{ fontSize: 12, color: riskText(result.risk), margin: '2px 0' }}>• {r}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KPIVal({ icon, label, value, color }) {
  return (
    <div style={{
      background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
      padding: '12px 14px', border: '1px solid var(--border-light)'
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{icon} {label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: color || 'var(--navy)' }}>{value}</div>
    </div>
  );
}

// Local fallback scoring
function calculateLocal(inputs) {
  const { purchasePrice = 0, refurbCost = 0, legalFees = 2500, stampDuty = 0, financeCosts = 5000, gdv = 0, monthlyRent = 0, area = 'London', vendorMotivation = 'Relocation', strategy = 'BTL' } = inputs;
  const totalInvestment = purchasePrice + refurbCost + legalFees + stampDuty + financeCosts;
  const profit = gdv - totalInvestment;
  const roi = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;
  const annualRent = monthlyRent * 12;
  const yieldPct = purchasePrice > 0 ? (annualRent / purchasePrice) * 100 : 0;
  const cashflow = monthlyRent - (financeCosts / 12) - (purchasePrice * 0.001);
  const areaDemand = { Leeds: 18, Birmingham: 16, Manchester: 19, Sheffield: 14, Nottingham: 15, Liverpool: 13, Bristol: 17, London: 20, Newcastle: 12, Leicester: 16, Hull: 11, York: 15 };
  const motivationScore = { Divorce: 15, Probate: 15, Repossession: 15, 'Financial Difficulty': 15, Relocation: 10, Retirement: 8, Downsizing: 7, Debt: 15, 'Estate Agent': 5 };
  let score = 0;
  if (roi >= 30) score += 25; else if (roi >= 20) score += 18; else if (roi >= 10) score += 10; else if (roi >= 5) score += 4;
  if (yieldPct >= 8) score += 20; else if (yieldPct >= 6) score += 14; else if (yieldPct >= 4) score += 7;
  score += areaDemand[area] || 10;
  score += motivationScore[vendorMotivation] || 5;
  if (strategy) score += 10;
  if (gdv > 0) score += 10;
  score = Math.min(Math.max(Math.round(score), 0), 100);
  const rating = roi >= 25 ? 'Excellent' : roi >= 18 ? 'Strong' : roi >= 10 ? 'Good' : roi >= 5 ? 'Moderate' : 'Avoid';
  const risk = score >= 75 ? 'Low' : score >= 50 ? 'Medium' : 'High';
  const riskReasons = [];
  if (roi < 10) riskReasons.push('ROI below 10% — marginal return');
  if (yieldPct < 5) riskReasons.push('Yield below 5% — cashflow concern');
  if (score >= 75) riskReasons.push('Strong deal score — well-positioned');
  if ((motivationScore[vendorMotivation] || 0) >= 15) riskReasons.push('Motivated seller — discount potential');
  if (gdv > purchasePrice * 1.3) riskReasons.push('Strong uplift potential — good GDV margin');
  if (risk === 'Low') riskReasons.push('Low risk profile — suitable for most investors');
  return { totalInvestment: Math.round(totalInvestment), profit: Math.round(profit), roi: Math.round(roi * 100) / 100, yieldPct: Math.round(yieldPct * 100) / 100, cashflow: Math.round(cashflow), score, rating, risk, riskReasons };
}
