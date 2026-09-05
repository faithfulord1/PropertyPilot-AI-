import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({ name: 'propertypilot-ai', version: '1.0.0' });

type DealInput = {
  purchasePrice: number;
  gdv: number;
  monthlyRent?: number;
  refurbCost?: number;
  legalFees?: number;
  stampDuty?: number;
  financeCosts?: number;
};

function analyseDeal(input: DealInput) {
  const refurbCost = input.refurbCost ?? 0;
  const legalFees = input.legalFees ?? 2500;
  const stampDuty = input.stampDuty ?? 0;
  const financeCosts = input.financeCosts ?? 5000;
  const monthlyRent = input.monthlyRent ?? 0;
  const totalInvestment = input.purchasePrice + refurbCost + legalFees + stampDuty + financeCosts;
  const profit = input.gdv - totalInvestment;
  const roi = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;
  const grossYield = input.purchasePrice > 0 ? ((monthlyRent * 12) / input.purchasePrice) * 100 : 0;
  const margin = input.gdv > 0 ? ((input.gdv - input.purchasePrice) / input.gdv) * 100 : 0;
  const concerns: string[] = [];
  if (roi < 10) concerns.push('Projected ROI is below 10%.');
  if (grossYield > 0 && grossYield < 5) concerns.push('Projected gross yield is below 5%.');
  if (input.gdv <= input.purchasePrice) concerns.push('GDV does not exceed the purchase price.');
  if (refurbCost > input.purchasePrice * 0.25) concerns.push('Refurbishment cost exceeds 25% of purchase price.');

  return {
    totalInvestment: Math.round(totalInvestment),
    projectedProfit: Math.round(profit),
    roiPercent: Math.round(roi * 100) / 100,
    grossYieldPercent: Math.round(grossYield * 100) / 100,
    purchaseToGdvMarginPercent: Math.round(margin * 100) / 100,
    concerns,
    governance: 'Analysis only. Independently verify valuation, costs, finance, tax and legal assumptions before acting.',
  };
}

const dealSchema = {
  purchasePrice: z.number().positive(),
  gdv: z.number().nonnegative(),
  monthlyRent: z.number().nonnegative().optional(),
  refurbCost: z.number().nonnegative().optional(),
  legalFees: z.number().nonnegative().optional(),
  stampDuty: z.number().nonnegative().optional(),
  financeCosts: z.number().nonnegative().optional(),
};

server.registerTool(
  'analyse_property_opportunity',
  {
    description: 'Calculate transparent property investment metrics for a supplied scenario. Read-only and advisory only.',
    inputSchema: dealSchema,
  },
  async (input) => ({ content: [{ type: 'text', text: JSON.stringify(analyseDeal(input as DealInput), null, 2) }] }),
);

server.registerTool(
  'compare_property_scenarios',
  {
    description: 'Compare two supplied property scenarios using the same transparent calculations. Does not recommend or execute a purchase.',
    inputSchema: {
      scenarioA: z.object(dealSchema),
      scenarioB: z.object(dealSchema),
    },
  },
  async ({ scenarioA, scenarioB }) => {
    const a = analyseDeal(scenarioA as DealInput);
    const b = analyseDeal(scenarioB as DealInput);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ scenarioA: a, scenarioB: b, comparison: {
          higherProjectedRoi: a.roiPercent === b.roiPercent ? 'equal' : a.roiPercent > b.roiPercent ? 'A' : 'B',
          higherProjectedProfit: a.projectedProfit === b.projectedProfit ? 'equal' : a.projectedProfit > b.projectedProfit ? 'A' : 'B',
          note: 'Higher projected figures do not establish suitability. Human due diligence remains required.',
        } }, null, 2),
      }],
    };
  },
);

server.registerTool(
  'explain_investment_risk',
  {
    description: 'Explain common due-diligence questions for a supplied property scenario. Read-only educational output, not financial or legal advice.',
    inputSchema: dealSchema,
  },
  async (input) => {
    const analysis = analyseDeal(input as DealInput);
    const checks = [
      'Verify sold-price comparables and the valuation methodology behind GDV.',
      'Obtain an independent survey and refurbishment quotes.',
      'Confirm financing terms, stress-tested interest costs and exit assumptions.',
      'Check title, planning, licensing, lease and local authority constraints.',
      'Calculate tax and transaction costs using current professional advice.',
      'Confirm rental demand and achievable rent using evidence rather than asking price alone.',
    ];
    return { content: [{ type: 'text', text: JSON.stringify({ analysis, dueDiligenceChecks: checks }, null, 2) }] };
  },
);

await server.connect(new StdioServerTransport());
