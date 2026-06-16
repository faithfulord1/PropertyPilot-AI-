import { useState, useCallback } from 'react';
import { api } from '../api';

const SAMPLE_LEADS = [
  { id: 'PL001', address: '14 Thornton Road', area: 'Leeds', type: 'Terraced', beds: 3, asking: 145000, motivation: 'Divorce' },
  { id: 'PL002', address: '27 Maple Avenue', area: 'Birmingham', type: 'Semi-Detached', beds: 3, asking: 175000, motivation: 'Relocation' },
  { id: 'PL003', address: '8 Victoria Street', area: 'Manchester', type: 'Terraced', beds: 2, asking: 130000, motivation: 'Debt' },
  { id: 'PL005', address: '19 Beech Close', area: 'Sheffield', type: 'Semi-Detached', beds: 4, asking: 185000, motivation: 'Repossession' },
  { id: 'PL006', address: '3 Crown Street', area: 'Leeds', type: 'Flat', beds: 2, asking: 90000, motivation: 'Divorce' },
  { id: 'PL019', address: '64 Millfield Road', area: 'Hull', type: 'Terraced', beds: 3, asking: 98000, motivation: 'Probate' },
  { id: 'PL027', address: '5 Burnley Road', area: 'Burnley', type: 'Terraced', beds: 3, asking: 78000, motivation: 'Relocation' },
  { id: 'PL083', address: '27 Lime Street', area: 'Liverpool', type: 'Flat', beds: 2, asking: 98000, motivation: 'Probate' },
];

export default function Agent3({ prefill }) {
  const [selected, setSelected] = useState(SAMPLE_LEADS[0]);
  const [summary, setSummary] = useState(null);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const activeDeal = prefill?.deal || selected;

  const run = useCallback(async () => {
    setRunning(true);
    setError('');
    const deal = {
      ...activeDeal,
      purchasePrice: activeDeal.purchasePrice || activeDeal.asking * 0.86,
      refurbCost: activeDeal.refurbCost || 16000,
      gdv: activeDeal.gdv || activeDeal.asking * 1.12,
      legalFees: 2500, stampDuty: 0, financeCosts: 5500,
      monthlyRent: Math.round((activeDeal.asking || activeDeal.purchasePrice || 100000) * 0.0055),
      strategy: 'BTL', vendorMotivation: activeDeal.motivation || activeDeal.vendorMotivation || 'Relocation',
      area: activeDeal.area, type: activeDeal.type,
      address: activeDeal.address
    };
    try {
      const data = await api.ai.summarise({ deal });
      setSummary(data.summary);
    } catch (e) {
      setError(e.message);
      const r = calculateLocal(deal);
      setSummary(generateSummaryLocal(deal, r));
    }
    setRunning(false);
  }, [activeDeal]);

  const copy = () => {
    navigator.clipboard?.writeText(summary.replace(/\*\*/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderMd = txt => txt.split('\n').map((line, i) => {
    const bold = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong>${m}</strong>`);
    return <p key={i} style={{ margin: '0 0 6px', fontSize: 14, lineHeight: 1.7, color: 'var(--text)' }} dangerouslySetInnerHTML={{ __html: bold || '&nbsp;' }} />;
  });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--navy)' }}>Agent 3: AI Summary Generator</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Generates a professional investor-ready deal pack in seconds — powered by AI
        </div>
      </div>

      {prefill?.deal && (
        <div style={{
          background: 'var(--gold-pale)', borderRadius: 'var(--radius-md)',
          padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#8B6A1A',
          border: '1px solid #EBD090'
        }}>
          ✓ Using deal from Agent 1: {prefill.deal.address} — Score {prefill.result?.score}/100
        </div>
      )}

      {!prefill?.deal && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Select property:</label>
          <select value={selected.id} onChange={e => setSelected(SAMPLE_LEADS.find(l => l.id === e.target.value))}
            style={{ width: '100%', fontSize: 14, padding: '10px 12px' }}>
            {SAMPLE_LEADS.map(l => <option key={l.id} value={l.id}>{l.address}, {l.area}</option>)}
          </select>
        </div>
      )}

      <button onClick={run} disabled={running} style={{
        background: 'var(--navy)', color: 'var(--gold)', border: 'none',
        padding: '12px 24px', borderRadius: 'var(--radius-md)', fontWeight: 600,
        fontSize: 14, cursor: running ? 'wait' : 'pointer', marginBottom: 20
      }}>
        {running ? '⏳ AI Generating deal pack...' : '▶ Generate AI Deal Pack'}
      </button>
      {error && <div style={{ color: 'var(--red)', fontSize: 12, marginBottom: 12 }}>{error}</div>}

      {summary && (
        <div>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 10
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--border-light)'
            }}>
              <div>
                <span style={{
                  fontSize: 12, fontWeight: 600, background: 'var(--navy)',
                  color: 'var(--gold)', padding: '3px 10px', borderRadius: 20
                }}>INVESTOR BRIEF</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 10 }}>
                  PropertyPilot AI™ · {new Date().toLocaleDateString('en-GB')}
                </span>
              </div>
              <button onClick={copy} style={{
                fontSize: 12, padding: '6px 12px', borderRadius: 'var(--radius-md)',
                cursor: 'pointer', border: '1px solid var(--border)',
                background: copied ? 'var(--green-pale)' : 'var(--surface)',
                color: copied ? 'var(--green)' : 'var(--text-mid)'
              }}>
                {copied ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
            <div>{renderMd(summary)}</div>
          </div>
          <div style={{
            background: '#E6F1FB', borderRadius: 'var(--radius-md)',
            padding: '10px 14px', fontSize: 12, color: '#0C447C', border: '1px solid #B8D4E8'
          }}>
            ℹ This summary was generated by PropertyPilot AI™ by Faithfulord. All figures should be independently verified before investor communication. Compliant with ICO AI transparency guidance.
          </div>
        </div>
      )}
    </div>
  );
}

function calculateLocal(inputs) {
  const { purchasePrice = 0, refurbCost = 0, legalFees = 2500, stampDuty = 0, financeCosts = 5000, gdv = 0, monthlyRent = 0, area = 'London', vendorMotivation = 'Relocation', strategy = 'BTL' } = inputs;
  const totalInvestment = purchasePrice + refurbCost + legalFees + stampDuty + financeCosts;
  const profit = gdv - totalInvestment;
  const roi = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;
  const annualRent = monthlyRent * 12;
  const yieldPct = purchasePrice > 0 ? (annualRent / purchasePrice) * 100 : 0;
  const cashflow = monthlyRent - (financeCosts / 12) - (purchasePrice * 0.001);
  const areaDemand = { Leeds: 18, Birmingham: 16, Manchester: 19, Sheffield: 14, Nottingham: 15, Liverpool: 13, Bristol: 17, London: 20 };
  const motivationScore = { Divorce: 15, Probate: 15, Repossession: 15, 'Financial Difficulty': 15, Relocation: 10, Retirement: 8, Downsizing: 7, Debt: 15, 'Estate Agent': 5 };
  let score = 0;
  if (roi >= 30) score += 25; else if (roi >= 20) score += 18; else if (roi >= 10) score += 10;
  if (yieldPct >= 8) score += 20; else if (yieldPct >= 6) score += 14; else if (yieldPct >= 4) score += 7;
  score += areaDemand[area] || 10;
  score += motivationScore[vendorMotivation] || 5;
  if (strategy) score += 10;
  if (gdv > 0) score += 10;
  score = Math.min(Math.max(Math.round(score), 0), 100);
  const rating = roi >= 25 ? 'Excellent' : roi >= 18 ? 'Strong' : roi >= 10 ? 'Good' : 'Moderate';
  const risk = score >= 75 ? 'Low' : score >= 50 ? 'Medium' : 'High';
  const riskReasons = [];
  if (roi < 10) riskReasons.push('ROI below 10% — marginal return');
  if (score >= 75) riskReasons.push('Strong deal score — well-positioned');
  if ((motivationScore[vendorMotivation] || 0) >= 15) riskReasons.push('Motivated seller — discount potential');
  return { totalInvestment: Math.round(totalInvestment), profit: Math.round(profit), roi: Math.round(roi * 100) / 100, yieldPct: Math.round(yieldPct * 100) / 100, cashflow: Math.round(cashflow), score, rating, risk, riskReasons };
}

function generateSummaryLocal(deal, result) {
  const strategyMap = { BTL: 'buy-to-let', Flip: 'flip and sell', HMO: 'HMO conversion', BRRR: 'BRRR strategy', SA: 'serviced accommodation' };
  const strat = strategyMap[deal.strategy] || deal.strategy;
  const profitStr = result.profit >= 0 ? `£${result.profit.toLocaleString()} profit` : 'negative return';
  return `**${deal.area} ${deal.type} | AI Deal Score: ${result.score}/100 | ${result.rating}**

${deal.address} is presented as a ${strat} opportunity in ${deal.area}. The vendor is motivated by ${(deal.vendorMotivation || 'personal circumstances').toLowerCase()}, creating a negotiation window below market value.

**Financial Summary:** Purchase price £${(deal.purchasePrice || 0).toLocaleString()} with £${(deal.refurbCost || 0).toLocaleString()} refurbishment produces a total investment of £${result.totalInvestment.toLocaleString()} against a GDV of £${(deal.gdv || 0).toLocaleString()}, delivering ${profitStr} and a ${result.roi}% ROI.

**Why This Deal Works:** ${result.rating === 'Excellent' || result.rating === 'Strong' ? 'Strong fundamentals — above-average ROI in a high-demand market.' : 'Moderate fundamentals — suitable for the right investor profile.'}

**Risk Assessment:** ${result.risk} Risk. ${result.riskReasons.join('. ')}.

*Generated by PropertyPilot AI™ — Faithfulord / Faith Growth Agency. All figures should be independently verified.*`;
}
