require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { init, getDb, queryAll, queryOne, run, insert } = require('./db');
const { calculateDeal, matchInvestors, generateSummary } = require('./scoring');
const { seed } = require('./seed');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'ppai-faithfulord-2025';

const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
}

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.split(' ')[1], JWT_SECRET);
    } catch (_) {}
  }
  next();
}

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Email, password, and name required' });
    const existing = queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const result = insert('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [email, hashed, name]);
    run('INSERT INTO subscriptions (user_id, plan, status) VALUES (?, ?, ?)', [result.lastInsertRowid, 'free', 'active']);
    const token = jwt.sign({ id: result.lastInsertRowid, email, name }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: result.lastInsertRowid, email, name, role: 'user' } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = queryOne('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = queryOne('SELECT id, email, name, role, created_at FROM users WHERE id = ?', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const sub = queryOne('SELECT * FROM subscriptions WHERE user_id = ?', [user.id]);
  res.json({ user, subscription: sub || { plan: 'free', status: 'active' } });
});

app.get('/api/properties', optionalAuth, (req, res) => {
  const { limit = 100, offset = 0, area, status, motivation } = req.query;
  let sql = 'SELECT * FROM property_leads WHERE 1=1';
  const params = [];
  if (area) { sql += ' AND LOWER(Area) = ?'; params.push(area.toLowerCase()); }
  if (status) { sql += ' AND Status = ?'; params.push(status); }
  if (motivation) { sql += ' AND Vendor_Motivation = ?'; params.push(motivation); }
  sql += ' ORDER BY Date_Added DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
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
  const { limit = 100, offset = 0 } = req.query;
  const rows = queryAll('SELECT * FROM deal_analysis ORDER BY ROI_Percent DESC LIMIT ? OFFSET ?', [parseInt(limit), parseInt(offset)]);
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
  try {
    const result = calculateDeal(req.body);
    res.json(result);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/investors', (req, res) => {
  const { limit = 50, offset = 0 } = req.query;
  const rows = queryAll('SELECT * FROM investor_buyers ORDER BY Deals_Completed DESC LIMIT ? OFFSET ?', [parseInt(limit), parseInt(offset)]);
  const total = queryOne('SELECT COUNT(*) as count FROM investor_buyers');
  res.json({ data: rows, total: total.count });
});

app.post('/api/ai/match', (req, res) => {
  try {
    const { deal } = req.body;
    if (!deal) return res.status(400).json({ error: 'Deal information required' });
    const dealResult = calculateDeal(deal);
    const investors = queryAll("SELECT * FROM investor_buyers WHERE Status = ?", ['Active']);
    const matches = matchInvestors(deal, investors, dealResult);
    res.json({ matches, dealResult });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/ai/summarise', (req, res) => {
  try {
    const { deal } = req.body;
    if (!deal) return res.status(400).json({ error: 'Deal information required' });
    const result = calculateDeal(deal);
    const summary = generateSummary(deal, result);
    res.json({ summary, result });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/matches', (req, res) => {
  const { limit = 50, offset = 0 } = req.query;
  const rows = queryAll('SELECT * FROM deal_matching ORDER BY Match_Score DESC LIMIT ? OFFSET ?', [parseInt(limit), parseInt(offset)]);
  const total = queryOne('SELECT COUNT(*) as count FROM deal_matching');
  res.json({ data: rows, total: total.count });
});

app.get('/api/fees', (req, res) => {
  const rows = queryAll('SELECT * FROM sourcing_fees ORDER BY Invoice_Date DESC');
  res.json({ data: rows, total: rows.length });
});

app.get('/api/kpi', (req, res) => {
  const totalLeads = queryOne('SELECT COUNT(*) as c FROM property_leads').c;
  const totalDeals = queryOne('SELECT COUNT(*) as c FROM deal_analysis').c;
  const profitPipeline = queryOne('SELECT SUM(Net_Profit) as s FROM deal_analysis').s || 0;
  const avgROI = queryOne('SELECT AVG(ROI_Percent) as a FROM deal_analysis').a || 0;
  const avgScore = queryOne('SELECT AVG(Deal_Score) as a FROM deal_analysis').a || 0;
  const totalFees = queryOne('SELECT SUM(Agreed_Fee) as s FROM sourcing_fees').s || 0;
  const collectedFees = queryOne("SELECT SUM(Agreed_Fee) as s FROM sourcing_fees WHERE Payment_Status = 'Paid'").s || 0;
  const activeInvestors = queryOne("SELECT COUNT(*) as c FROM investor_buyers WHERE Status = 'Active'").c;
  const totalInvestors = queryOne('SELECT COUNT(*) as c FROM investor_buyers').c;
  const completedDeals = queryOne("SELECT COUNT(*) as c FROM deal_matching WHERE Outcome = 'Completed'").c;
  const lowRisk = queryOne("SELECT COUNT(*) as c FROM deal_analysis WHERE Risk_Level = 'Low'").c;
  const highRisk = queryOne("SELECT COUNT(*) as c FROM deal_analysis WHERE Risk_Level = 'High'").c;
  const matchesCount = queryOne('SELECT COUNT(*) as c FROM deal_matching').c;

  res.json({
    totalLeads, totalDeals, profitPipeline: Math.round(profitPipeline),
    avgROI: Math.round(avgROI * 10) / 10, avgScore: Math.round(avgScore * 10) / 10,
    totalFees: Math.round(totalFees), collectedFees: Math.round(collectedFees),
    activeInvestors, totalInvestors, completedDeals, lowRisk, highRisk, matchesCount
  });
});

app.post('/api/payments/create-intent', authMiddleware, async (req, res) => {
  try {
    const { amount, currency = 'GBP', description } = req.body;
    if (!amount || amount < 1) return res.status(400).json({ error: 'Valid amount required' });
    const result = insert(
      'INSERT INTO payments (user_id, amount, currency, provider, status, description) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, amount, currency, 'stripe', 'pending', description || 'PropertyPilot AI Payment']
    );
    res.json({
      paymentId: result.lastInsertRowid,
      amount, currency,
      clientSecret: `pi_mock_${result.lastInsertRowid}_secret_placeholder`,
      message: 'Payment intent created. Set STRIPE_SECRET_KEY in .env for live payments.'
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/payments', authMiddleware, (req, res) => {
  const payments = queryAll('SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
  res.json(payments);
});

app.get('/api/subscription/plans', (req, res) => {
  res.json({
    plans: [
      { id: 'free', name: 'Free', price: 0, features: ['3 deal analyses/month', 'Basic dashboard', 'Email support'] },
      { id: 'starter', name: 'Starter', price: 29, features: ['50 deal analyses/month', 'Investor matching', 'Full dashboard', 'Email support', 'CSV export'] },
      { id: 'professional', name: 'Professional', price: 79, features: ['Unlimited deal analyses', 'AI investor matching', 'Full dashboard + Power BI export', 'Priority support', 'API access', 'Team accounts (3)'] },
      { id: 'enterprise', name: 'Enterprise', price: 199, features: ['Everything in Professional', 'White-label reports', 'Custom AI model training', 'Dedicated account manager', 'SLA guarantee', 'Unlimited team accounts'] }
    ]
  });
});

app.post('/api/subscription/upgrade', authMiddleware, (req, res) => {
  const { plan } = req.body;
  const validPlans = ['free', 'starter', 'professional', 'enterprise'];
  if (!validPlans.includes(plan)) return res.status(400).json({ error: 'Invalid plan' });
  run('UPDATE subscriptions SET plan = ?, status = ? WHERE user_id = ?', [plan, 'active', req.user.id]);
  res.json({ message: `Upgraded to ${plan}`, plan });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'PropertyPilot AI', version: '2.0.0', creator: 'Faithfulord', agency: 'Faith Growth Agency' });
});

// SPA catch-all — serve index.html for any non-API route
if (fs.existsSync(clientDist)) {
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientDist, 'index.html'));
    }
  });
}

async function start() {
  await init();
  const count = queryOne('SELECT COUNT(*) as c FROM property_leads');
  if (!count || count.c === 0) {
    console.log('Database empty — running seed...');
    await seed();
  }
  app.listen(PORT, () => {
    console.log(`PropertyPilot AI Server running on http://localhost:${PORT}`);
    console.log(`Creator: Faithfulord — Faith Growth Agency`);
    console.log(`Nebius AI Builders Challenge 2025`);
  });
}

start().catch(err => { console.error('Failed to start:', err); process.exit(1); });
