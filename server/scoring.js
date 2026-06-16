// AI Scoring Engine — Deal Analysis, Risk Assessment, Investor Matching
// Used by PropertyPilot AI — Faithfulord / Faith Growth Agency

const AREA_DEMAND = {
  Leeds: 18, Birmingham: 16, Manchester: 19, Sheffield: 14,
  Nottingham: 15, Liverpool: 13, Bristol: 17, London: 20,
  Newcastle: 12, Leicester: 16, Hull: 11, York: 15,
  Derby: 12, Coventry: 13, Wakefield: 11, Rotherham: 10,
  Burnley: 9, Beeston: 12, Hucknall: 10, Droylsden: 10,
  Denton: 10, Stockport: 13, Doncaster: 10
};

const MOTIVATION_SCORE = {
  Divorce: 15, Probate: 15, Repossession: 15,
  'Financial Difficulty': 15, Relocation: 10,
  Retirement: 8, Downsizing: 7, Debt: 15,
  'Estate Agent': 5
};

const REFURB_MULTIPLIER = {
  Cosmetic: 1.0, Light: 1.15, Medium: 1.25, Heavy: 1.4
};

function calculateDeal(inputs) {
  const {
    purchasePrice = 0, refurbCost = 0, refurbLevel = 'Light',
    legalFees = 2500, stampDuty = 0, financeCosts = 5000,
    gdv = 0, monthlyRent = 0, area = 'London',
    vendorMotivation = 'Relocation', strategy = 'BTL'
  } = inputs;

  const totalInvestment = purchasePrice + refurbCost + legalFees + stampDuty + financeCosts;
  const profit = gdv - totalInvestment;
  const roi = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;
  const annualRent = monthlyRent * 12;
  const yieldPct = purchasePrice > 0 ? (annualRent / purchasePrice) * 100 : 0;
  const cashflow = monthlyRent - (financeCosts / 12) - (purchasePrice * 0.001);

  let score = 0;
  if (roi >= 30) score += 25; else if (roi >= 20) score += 18; else if (roi >= 10) score += 10; else if (roi >= 5) score += 4;
  if (yieldPct >= 8) score += 20; else if (yieldPct >= 6) score += 14; else if (yieldPct >= 4) score += 7;
  score += AREA_DEMAND[area] || 10;
  score += MOTIVATION_SCORE[vendorMotivation] || 5;
  if (strategy) score += 10;
  if (gdv > 0) score += 10;
  score = Math.min(Math.max(Math.round(score), 0), 100);

  const rating = roi >= 25 ? 'Excellent' : roi >= 18 ? 'Strong' : roi >= 10 ? 'Good' : roi >= 5 ? 'Moderate' : 'Avoid';
  const risk = score >= 75 ? 'Low' : score >= 50 ? 'Medium' : 'High';

  const riskReasons = [];
  if (roi < 10) riskReasons.push('ROI below 10% — marginal return');
  if (yieldPct < 5) riskReasons.push('Yield below 5% — cashflow concern');
  if (score >= 75) riskReasons.push('Strong deal score — well-positioned');
  if ((MOTIVATION_SCORE[vendorMotivation] || 0) >= 15) riskReasons.push('Motivated seller — discount potential');
  if (gdv > purchasePrice * 1.3) riskReasons.push('Strong uplift potential — good GDV margin');
  if (risk === 'Low') riskReasons.push('Low risk profile — suitable for most investors');

  return {
    totalInvestment: Math.round(totalInvestment),
    profit: Math.round(profit),
    roi: Math.round(roi * 100) / 100,
    yieldPct: Math.round(yieldPct * 100) / 100,
    cashflow: Math.round(cashflow),
    score,
    rating,
    risk,
    riskReasons
  };
}

function matchInvestors(deal, investors, dealResult) {
  return investors.map(inv => {
    let score = 0;
    const reasons = [];
    const areas = (inv.Preferred_Areas || '').split(',').map(a => a.trim().toLowerCase());
    const dealArea = (deal.area || deal.Area || '').toLowerCase();

    if (areas.some(a => dealArea.includes(a) || a.includes(dealArea))) {
      score += 30;
      reasons.push(`Area match: ${inv.Preferred_Areas.split(',')[0].trim()}`);
    }

    if (dealResult.totalInvestment >= inv.Budget_Min && dealResult.totalInvestment <= inv.Budget_Max) {
      score += 25;
      reasons.push(`Budget fit: £${(inv.Budget_Min / 1000).toFixed(0)}k–£${(inv.Budget_Max / 1000).toFixed(0)}k`);
    } else if (dealResult.totalInvestment <= inv.Budget_Max) {
      score += 12;
      reasons.push('Within max budget');
    }

    const dealStrategy = deal.strategy || 'BTL';
    if (dealStrategy === inv.Strategy) {
      score += 25;
      reasons.push(`Strategy match: ${inv.Strategy}`);
    }

    score += 15;
    reasons.push(`${inv.Status || 'Active'} investor — recently engaged`);

    score = Math.min(score, 100);
    return { ...inv, matchScore: score, reasons };
  }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
}

function generateSummary(deal, result) {
  const strategyMap = { BTL: 'buy-to-let', Flip: 'flip and sell', HMO: 'HMO conversion', BRRR: 'BRRR strategy', SA: 'serviced accommodation' };
  const strat = strategyMap[deal.strategy] || deal.strategy;
  const profitStr = result.profit >= 0 ? `£${result.profit.toLocaleString()} profit` : 'negative return';

  return `**${deal.area || deal.Area} ${deal.type || deal.Property_Type} | AI Deal Score: ${result.score}/100 | ${result.rating}**

${deal.address || deal.Address} is presented as a ${strat} opportunity. The vendor is motivated by ${(deal.vendorMotivation || deal.Vendor_Motivation || 'personal circumstances').toLowerCase()}, creating a negotiation window below market value.

**Financial Summary:** Purchase price £${(deal.purchasePrice || deal.Purchase_Price || 0).toLocaleString()} with £${(deal.refurbCost || deal.Refurb_Cost || 0).toLocaleString()} refurbishment produces a total investment of £${result.totalInvestment.toLocaleString()} against a GDV of £${(deal.gdv || deal.GDV || 0).toLocaleString()}, delivering ${profitStr} and a ${result.roi}% ROI.${deal.monthlyRent || deal.Monthly_Rent ? ` Projected rental income generates a ${result.yieldPct}% gross yield with £${result.cashflow}/month cashflow.` : ''}

**Why This Deal Works:** ${result.rating === 'Excellent' || result.rating === 'Strong' ? `Strong fundamentals — above-average ROI in a high-demand market.` : `Moderate fundamentals — suitable for the right investor profile. Due diligence recommended.`}

**Risk Assessment:** ${result.risk} Risk. ${result.riskReasons.join('. ')}.

*Generated by PropertyPilot AI™ — Faithfulord / Faith Growth Agency. All figures should be independently verified.*`;
}

module.exports = { calculateDeal, matchInvestors, generateSummary };
