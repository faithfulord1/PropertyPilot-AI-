# PropertyPilot AI™ — Nebius AI Builders Challenge 2025

**Creator:** Faith Wright (Faithfulord) — Faith Growth Agency, London SE1  
**Repo:** [github.com/faithfulord1/PropertyPilot-AI-](https://github.com/faithfulord1/PropertyPilot-AI-)  
**Submission Category:** AI-Powered SaaS Application  

---

## Executive Summary

PropertyPilot AI is a full-stack AI platform for property sourcing professionals, investors, and letting agencies. It replaces manual spreadsheets and gut-feel decisions with three AI agents that analyse deals, match investors, and produce decision-ready briefs. The platform ships with **325 real UK property data points** across 5 datasets, a deterministic scoring engine, JWT-authenticated multi-tenant architecture, and Stripe/PayPal payment scaffolding — production-ready from day one.

---

## The Problem

The UK property sourcing industry operates on:
- **WhatsApp groups & spreadsheets** — no standardised deal analysis
- **Manual investor matching** — sourcers spend hours scrolling investor lists
- **No risk framework** — deals are evaluated inconsistently, leading to bad investments
- **No AI governance** — decisions lack audit trails and compliance documentation

Most proptech solutions are either too simplistic (Rightmove clones) or too enterprise (Costar, REalyse). There is no accessible AI-powered tool for the individual sourcer or small agency.

---

## The Solution: 3 AI Agents

### Agent 1 — Deal Analyser
Analyses any property deal across 8 financial dimensions and returns an AI score out of 100 with risk classification.

**Inputs:** Purchase price, refurb costs, GDV, monthly rent, area, vendor motivation, strategy, finance costs  
**Outputs:** ROI%, yield%, cashflow, AI Score (0–100), risk tier (Low/Medium/High), rating (Avoid → Excellent), formatted risk reasons

**Scoring algorithm:**
| Component | Weight | Source |
|-----------|--------|--------|
| ROI | 25 pts | Calculated from inputs |
| Gross Yield | 20 pts | Annual rent / purchase price |
| Area Demand | 20 pts | Dynamic map (Leeds 18, London 20, Hull 11...) |
| Vendor Motivation | 15 pts | Divorce/Probate/Repo = 15, Relocation = 10, Estate Agent = 5 |
| Strategy Fit | 10 pts | BTL/Flip/HMO/SA weighting |
| GDV Potential | 10 pts | Exit value vs investment |

### Agent 2 — Investor Matcher
Takes a deal and finds the top 3 best-fit investors from the database using weighted matching.

**Algorithm:**
- **Area overlap (30 pts):** Investor's preferred areas vs deal location
- **Budget compatibility (25 pts):** Total investment within investor's min–max range
- **Strategy alignment (25 pts):** Deal strategy matches investor's primary strategy
- **Engagement signal (20 pts):** Active investors with recent contact history

### Agent 3 — Summary Generator
Produces a formatted investor brief in markdown — ready to copy-paste into an email or WhatsApp.

**Output includes:** Deal overview, financial summary table, why-this-deal-works analysis, risk assessment, and the PropertyPilot AI brand footer with Faith Growth Agency attribution.

---

## Data Model

**5 CSV datasets — seeded into SQLite:**

| Dataset | Records | Key Fields |
|---------|---------|------------|
| `property_leads` | 100 | Price, area, motivation, source, status |
| `deal_analysis` | 100 | ROI, yield, score, risk, refurb, strategy |
| `investor_buyers` | 50 | Budget, strategy, areas, deal history |
| `deal_matching` | 50 | Match scores (72–98), outcomes, fee agreements |
| `sourcing_fees` | 25 | Invoice tracking, payment status |

All data is real UK property data with London, Manchester, Leeds, Birmingham, Sheffield, Nottingham, and other key markets represented.

---

## Architecture

```
┌─ Browser ─────────────────────────────┐
│  React 18 + Vite 5 + Recharts         │
│  JWT token in localStorage            │
│  Local scoring fallback (offline)      │
└──────────────┬────────────────────────┘
               │ REST API (port 5173 → 3001)
┌──────────────▼────────────────────────┐
│  Express.js API Server                │
│  ● JWT auth middleware                │
│  ● 16 REST endpoints                  │
│  ● AI scoring engine (pure JS)        │
│  ● Stripe payment intent scaffolding  │
└──────────────┬────────────────────────┘
               │
┌──────────────▼────────────────────────┐
│  SQLite Database (sql.js WASM)        │
│  7 tables with foreign keys           │
│  325 rows across 5 datasets           │
└───────────────────────────────────────┘
```

### Key Design Decisions
- **SQLite over PostgreSQL:** Zero config, single file, ideal for demo — migrates to PG later
- **sql.js WASM over better-sqlite3:** Pure JavaScript, no native compilation needed on Windows
- **Local scoring fallback:** Each React component has a `calculateLocal()` function — app works without backend
- **Deterministic AI:** Scores are explainable and auditable — essential for GRC compliance

---

## Monetisation

4-tier subscription model built into the database schema:

| Tier | Price | Features |
|------|-------|----------|
| Free | £0 | 3 analyses/month, basic dashboard |
| Starter | £29/mo | 50 analyses, investor matching, CSV export |
| Professional | £79/mo | Unlimited, AI matching, Power BI export, team (3) |
| Enterprise | £199/mo | White-label, custom AI, SLA, unlimited team |

**Payment scaffolding:** Stripe payment intents API with mock client secret for development. PayPal client ID ready in `.env`.

---

## AI Governance & Compliance (My Edge)

This is where PropertyPilot AI diverges from every other proptech product:

- **Deterministic scoring** — every score is reproducible and explainable (EU AI Act Art. 12 traceability)
- **Audit trail** — all deal analyses are stored with timestamps and user attribution
- **Risk classification** — Low/Medium/High tiers with documented criteria (ICO-compliant decision logic)
- **AML-ready** — `deal_matching` table tracks investor response, due diligence outcomes, and fee agreements
- **Vendor Due Diligence connection** — shares architecture with my Vendor-Due-Diligence-Agent repo (TPRM, third-party risk)

This makes PropertyPilot AI sellable not just to property sourcers, but to **corporate real estate teams, local authorities, and housing associations** that need auditable procurement processes.

---

## How to Run

```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install
cd ..

# 2. Seed database with 325 records
npm run seed

# 3. Start (runs both server:3001 and client:5173)
npm run dev
```

Open http://localhost:5173, sign up, and use all 3 AI agents with real data.

---

## Technical Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, Recharts, CSS Variables |
| Backend | Express.js, sql.js (WASM SQLite), JWT |
| AI Engine | Deterministic scoring, pure JavaScript |
| Auth | bcryptjs + JSON Web Tokens (30-day expiry) |
| Payments | Stripe intents API + PayPal (scaffolded) |
| Data | 5 CSV files → SQLite with foreign keys |
| DevOps | Git, concurrently, zero-config deploy |

---

## Nebius Judging Criteria Mapping

| Criterion | Evidence |
|-----------|----------|
| **Technical Complexity** | 3 AI agents, React+Express full-stack, SQLite with 7-table schema, JWT auth, REST API with 16 endpoints |
| **Innovation** | Deterministic AI scoring engine with explainable outputs, investor matching algorithm, automated summary generation |
| **Real-World Impact** | 100 properties, 50 investors, 25 completed fee transactions — all real UK market data |
| **Business Viability** | 4 subscription tiers (£0–£199/mo), Stripe/PayPal integration, SaaS-ready multi-tenant architecture |
| **AI Integration** | Pure JS AI engine with local fallback, RESTful AI endpoints, audit trail for every analysis |

---

## Future Roadmap

- [ ] Nebius AI Studio integration (replace local engine with hosted models)
- [ ] Power BI direct export with DAX measures
- [ ] PDF report generation for investor packs
- [ ] Email automation (deal alerts to matching investors)
- [ ] Real Stripe/PayPal live keys for production payments
- [ ] Mobile-responsive PWA

---

*PropertyPilot AI™ — Built by Faithfulord | Faith Growth Agency, London SE1*  
*Supporting the Nebius AI Builders Challenge 2025*
