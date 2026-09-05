# PropertyPilot AI

PropertyPilot AI is a portfolio-grade property intelligence workspace that turns property leads into explainable deal analysis, investor matching and operational dashboards.

> **Core principle:** AI supports the analysis. People make the investment, compliance and payment decisions.

## What the application does

PropertyPilot brings four jobs into one workflow:

1. **Property lead triage** - review property opportunities and filter the pipeline.
2. **Deal analysis** - calculate transparent investment metrics rather than hiding decisions inside a black box.
3. **Investor matching** - compare an opportunity with synthetic investor preferences and explain why a match is stronger or weaker.
4. **Portfolio operations** - track sourcing fees, pipeline KPIs and deal outcomes from one dashboard.

A typical scenario is a sourcer receiving a two-bedroom property lead at £245,000. PropertyPilot can calculate the estimated discount, yield, cash requirement and risk signals, then show which investor profiles best fit the opportunity. The system prepares the evidence for a decision; it does not purchase property or contact an investor automatically.

## Architecture

```text
React + Vite client
        |
        v
Express API
   |        |
   |        +--> deterministic deal scoring / investor matching
   |
   +--> local SQL.js demo database seeded from synthetic CSV data

Optional integration boundary
   +--> Stripe PaymentIntent when STRIPE_SECRET_KEY is configured

MCP server
   +--> read-only property analysis tools for AI clients
```

## Repository layout

- `client/` - React/Vite interface
- `server/` - Express API, authentication, scoring and demo database
- `data/` - synthetic demonstration data
- `mcp-server/` - governed Model Context Protocol server for read-only property analysis
- `DEMO.md` - demonstration guide
- `DEMO_SCRIPT.md` - presentation script
- `render.yaml` - Render deployment configuration

## Local development

Requirements: Node.js 22+

```bash
npm install
npm run install:client
npm run install:server
npm run dev
```

The client and API run together during development. The server automatically seeds the local demo database when it is empty.

### Environment variables

Create a local `.env` file for server-side values only. Never commit secrets.

```env
JWT_SECRET=replace-with-a-random-secret-at-least-32-characters
PORT=3001
NODE_ENV=development
# Optional, only when testing a real Stripe PaymentIntent:
STRIPE_SECRET_KEY=
# Optional comma-separated origins when API and UI are hosted separately:
CORS_ORIGIN=
```

In production, the application refuses to start without a strong `JWT_SECRET`.

## MCP server

The companion MCP server is intentionally read-only. It gives an AI client useful analysis tools without allowing it to buy property, take payment or contact investors.

```bash
cd mcp-server
npm install
npm run build
npm start
```

Current tools:

- `analyse_property_opportunity`
- `compare_property_scenarios`
- `explain_investment_risk`

This is the right governance boundary for the project: an agent can inspect and explain an opportunity, while consequential actions remain outside the tool surface.

## Quality checks

GitHub Actions validates the client build, server scoring smoke test and MCP build on every push and pull request.

Run the same checks locally:

```bash
npm ci --prefix client
npm run build --prefix client
npm ci --prefix server
node -e "const { calculateDeal } = require('./server/scoring'); console.log(calculateDeal({purchasePrice:200000, marketValue:240000, monthlyRent:1400, refurbishmentCost:10000}))"
npm ci --prefix mcp-server
npm run build --prefix mcp-server
```

## Security and product boundaries

- Demo CSV records are synthetic and must not be treated as live property data.
- JWT secrets are server-side only.
- The MCP interface is read-only by design.
- Payment and subscription flows are not an investment recommendation or financial-advice service.
- Any live payment, investor outreach or property transaction should require explicit human confirmation and production-grade compliance controls.

See `SECURITY.md` for the security model.

## Status

**Production-readiness hardening is active.** The core property analysis application, client build and read-only MCP surface are maintained here as the canonical implementation.

The older `property-pilot-ai` repository is retained as a specification archive so the original product specification is preserved without confusing it with the runnable codebase.

## Author

Built by **Faith Wright** as part of the Palm92 Intelligence portfolio.

## License

MIT License. See `LICENSE`.
