require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Stripe = require('stripe');
const { init, queryAll, queryOne, run, insert } = require('./db');
const { calculateDeal, matchInvestors, generateSummary } = require('./scoring');
const { seed } = require('./seed');

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET || (NODE_ENV === 'production' ? '' : 'development-only-change-me');

if (!JWT_SECRET || (NODE_ENV === 'production' && JWT_SECRET.length < 32)) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters in production.');
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) app.use(express.static(clientDist));

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS policy'));
  },
  credentials: false,
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(header.split(' ')[1], JWT_SECRET);
    next();
  } catch (_) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try { req.user = jwt.verify(header.split(' ')[1], JWT_SECRET); } catch (_) {}
  }
  next();
}

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Email, password, and name required' });
    if (String(password).length < 10) return res.status(400).json({ error: 'Password must be at least 10 characters' });
    const existing = queryOne('SELECT id FROM users WHERE email = ?', [String(email).toLowerCase()]);
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 12);
    const normalizedEmail = String(email).trim().toLowerCase();
    const result = insert('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [normalizedEmail, hashed, String(name).trim()]);
    run('INSERT INTO subscriptions (user_id, plan, status) VALUES (?, ?, ?)', [result.lastInsertRowid, 'free', 'active']);
    const token = jwt.sign({ id: result.lastInsertRowid, email: normalizedEmail, name: String(name).trim() }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: result.lastInsertRowid, email: normalizedEmail, name: String(name).trim(), role: 'user' } });
  } catch (err) { res.status(500).json({ error: 'Unable to create account' }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = queryOne('SELECT * FROM users WHERE email = ?', [String(email).trim().toLowerCase()]);
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (_) { res.status(500).json({ error: 'Unable to sign in' }); }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = queryOne('SELECT id, email, name, role, created_at FROM users WHERE id = ?', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const sub = queryOne('SELECT * FROM subscriptions WHERE user_id = ?', [user.id]);
  res.json({ user, subscription: sub || { plan: 'free', status: 'active' } });
});

app.get('/api/properties', optionalAuth, (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit || '100', 10) || 100, 1), 250);
  const offset = Math.max(parseInt(req.query.offset || '0', 10) || 0, 0);
  const { area, status, motivation } = req.query;
  let sql = 'SELECT * FROM property_leads WHERE 1=1';
  const params = [];
  if (area) { sql += ' AND LOWER(Area) = ?'; params.push(String(area).toLowerCase()); }
  if (status) { sql += ' AND Status = ?'; params.push(status); }
  if (motivation) { sql += ' AND Vendor_Motivation = ?'; params.push(motivation); }
  sql += ' ORDER BY Date_Added DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  const rows = queryAll(sql, params);
  const total = queryOne('SELECT COUNT(*) as count FROM property_leads');
  res.json({ data: rows, total: total.count });
});

app.get('/api/properties/:id', (req, res) => {
  const row = queryOne('SELECT * FROM property_leads WHERE Property_ID = ?', [req.params.id]);
  if (!row) return res.status(404).json({ error: 'Property not found' });
  res.json(row);
});

app.get('/api/deals', (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit || '100', 10) || 100, 1), 250);
  const offset = Math.max(parseInt(req.query.offset || '0', 10) || 0, 0);
  const rows = queryAll('SELECT * FROM deal_analysis ORDER BY ROI_Percent DESC LIMIT ? OFFSET ?', [limit, offset]);
  const total = queryOne('SELECT COUNT(*) as count FROM deal_analysis');
  res.json({ data: rows, total: total.count });
});

app.get('/api/deals/:id', (req, res) => {
  const row = queryOne('SELECT * FROM deal_analysis WHERE Deal_ID = ?', [req.params.id]);
  if (!row) return res.status(404).json({ error: 'Deal not found' });
  const property = queryOne('SELECT * FROM property_leads WHERE Property_ID = ?', [row.Property_ID]);
  res.json({ ...row, property });
});

app.post('/api/ai/analyse', (req, res) => {
  try { res.json(calculateDeal(req.body)); } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/investors', (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit || '50', 10) || 50, 1), 250);
  const offset = Math.max(parseInt(req.query.offset || '0', 10) || 0, 0);
  const rows = queryAll('SELECT * FROM investor_buyers ORDER BY Deals_Completed DESC LIMIT ? OFFSET ?', [limit, offset]);
  const total = queryOne('SELECT COUNT(*) as count FROM investor_buyers');
  res.json({ data: rows, total: total.count });
});

app.post('/api/ai/match', (req, res) => {
  try {
    const { deal } = req.body;
    if (!deal) return res.status(400).json({ error: 'Deal information required' });
    const dealResult = calculateDeal(deal);
    const investors = queryAll("SELECT * FROM investor_buyers WHERE Status = ?", ['Active']);
    res.json({ matches: matchInvestors(deal, investors, dealResult), dealResult });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/ai/summarise', (req, res) => {
  try {
    const { deal } = req.body;
    if (!deal) return res.status(400).json({ error: 'Deal information required' });
    const result = calculateDeal(deal);
    res.json({ summary: generateSummary(deal, result), result });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/matches', (req, res) => {
  const rows = queryAll('SELECT * FROM deal_matching ORDER BY Match_Score DESC LIMIT 100');
  const total = queryOne('SELECT COUNT(*) as count FROM deal_matching');
  res.json({ data: rows, total: total.count });
});

app.get('/api/fees', (req, res) => {
  const rows = queryAll('SELECT * FROM sourcing_fees ORDER BY Invoice_Date DESC');
  res.json({ data: rows, total: rows.length });
});

app.get('/api/kpi', (req, res) => {
  const q = (sql) => queryOne(sql);
  res.json({
    totalLeads: q('SELECT COUNT(*) as c FROM property_leads').c,
    totalDeals: q('SELECT COUNT(*) as c FROM deal_analysis').c,
    profitPipeline: Math.round(q('SELECT SUM(Net_Profit) as s FROM deal_analysis').s || 0),
    avgROI: Math.round((q('SELECT AVG(ROI_Percent) as a FROM deal_analysis').a || 0) * 10) / 10,
    avgScore: Math.round((q('SELECT AVG(Deal_Score) as a FROM deal_analysis').a || 0) * 10) / 10,
    totalFees: Math.round(q('SELECT SUM(Agreed_Fee) as s FROM sourcing_fees').s || 0),
    collectedFees: Math.round(q("SELECT SUM(Agreed_Fee) as s FROM sourcing_fees WHERE Payment_Status = 'Paid'").s || 0),
    activeInvestors: q("SELECT COUNT(*) as c FROM investor_buyers WHERE Status = 'Active'").c,
    totalInvestors: q('SELECT COUNT(*) as c FROM investor_buyers').c,
    completedDeals: q("SELECT COUNT(*) as c FROM deal_matching WHERE Outcome = 'Completed'").c,
    lowRisk: q("SELECT COUNT(*) as c FROM deal_analysis WHERE Risk_Level = 'Low'").c,
    highRisk: q("SELECT COUNT(*) as c FROM deal_analysis WHERE Risk_Level = 'High'").c,
    matchesCount: q('SELECT COUNT(*) as c FROM deal_matching').c,
  });
});

app.post('/api/payments/create-intent', authMiddleware, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const currency = String(req.body.currency || 'GBP').toLowerCase();
    const description = String(req.body.description || 'PropertyPilot AI Payment');
    if (!Number.isFinite(amount) || amount < 1) return res.status(400).json({ error: 'Valid amount required' });
    if (!stripe) return res.status(503).json({ error: 'Live payments are not configured on this deployment.' });

    const amountMinor = Math.round(amount * 100);
    const paymentIntent = await stripe.paymentIntents.create({ amount: amountMinor, currency, description, metadata: { userId: String(req.user.id) } });
    const result = insert(
      'INSERT INTO payments (user_id, amount, currency, provider, status, description) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, amount, currency.toUpperCase(), 'stripe', paymentIntent.status, description],
    );
    res.json({ paymentId: result.lastInsertRowid, providerPaymentId: paymentIntent.id, clientSecret: paymentIntent.client_secret, amount, currency: currency.toUpperCase() });
  } catch (_) { res.status(502).json({ error: 'Payment provider request failed.' }); }
});

app.get('/api/payments', authMiddleware, (req, res) => {
  res.json(queryAll('SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]));
});

app.get('/api/subscription/plans', (req, res) => {
  res.json({ plans: [
    { id: 'free', name: 'Free', price: 0, features: ['3 deal analyses/month', 'Basic dashboard', 'Email support'] },
    { id: 'starter', name: 'Starter', price: 29, features: ['50 deal analyses/month', 'Investor matching', 'Full dashboard', 'CSV export'] },
    { id: 'professional', name: 'Professional', price: 79, features: ['Unlimited deal analyses', 'AI investor matching', 'Full dashboard + Power BI export', 'API access'] },
    { id: 'enterprise', name: 'Enterprise', price: 199, features: ['Everything in Professional', 'White-label reports', 'Custom integrations', 'Team controls'] },
  ] });
});

app.post('/api/subscription/upgrade', authMiddleware, (req, res) => {
  const validPlans = ['free', 'starter', 'professional', 'enterprise'];
  const { plan } = req.body;
  if (!validPlans.includes(plan)) return res.status(400).json({ error: 'Invalid plan' });
  if (plan !== 'free' && !stripe) return res.status(503).json({ error: 'Paid subscription upgrades require a configured payment provider.' });
  run('UPDATE subscriptions SET plan = ?, status = ? WHERE user_id = ?', [plan, 'active', req.user.id]);
  res.json({ message: `Subscription set to ${plan}`, plan, note: 'Production billing entitlement should be confirmed by a payment webhook before granting paid access.' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'PropertyPilot AI', version: '2.1.0', creator: 'Faith Wright', paymentsConfigured: Boolean(stripe) });
});

if (fs.existsSync(clientDist)) {
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) res.sendFile(path.join(clientDist, 'index.html'));
  });
}

async function start() {
  await init();
  const count = queryOne('SELECT COUNT(*) as c FROM property_leads');
  if (!count || count.c === 0) await seed();
  app.listen(PORT, () => console.log(`PropertyPilot AI listening on port ${PORT}`));
}

start().catch((err) => { console.error('Failed to start:', err); process.exit(1); });
