const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'propertypilot.db');

let db;
let SQL;

async function init() {
  if (db) return db;
  SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  initSchema();
  return db;
}

function getDb() {
  if (!db) throw new Error('Database not initialized. Call init() first.');
  return db;
}

function save() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function initSchema() {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    plan TEXT NOT NULL DEFAULT 'free',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'GBP',
    provider TEXT NOT NULL,
    provider_payment_id TEXT,
    status TEXT DEFAULT 'pending',
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS property_leads (
    Property_ID TEXT PRIMARY KEY,
    Address TEXT, Postcode TEXT, Area TEXT, Region TEXT,
    Property_Type TEXT, Bedrooms INTEGER, Bathrooms INTEGER,
    Asking_Price REAL, Estimated_Value REAL,
    Vendor_Motivation TEXT, Lead_Source TEXT,
    Date_Added TEXT, Status TEXT,
    Agent_Name TEXT, Agent_Phone TEXT, Notes TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS deal_analysis (
    Deal_ID TEXT PRIMARY KEY,
    Property_ID TEXT,
    Analysis_Date TEXT, Purchase_Price REAL,
    Asking_Price REAL, Discount_Percent REAL,
    Refurb_Cost REAL, Refurb_Level TEXT,
    Legal_Fees REAL, Stamp_Duty REAL,
    Survey_Fee REAL, Finance_Costs REAL,
    Bridging_Rate REAL, Sourcing_Fee REAL,
    Total_Investment REAL, GDV REAL, ARV REAL,
    Gross_Profit REAL, Net_Profit REAL,
    ROI_Percent REAL, Gross_Yield_Percent REAL,
    Net_Yield_Percent REAL, Monthly_Rent REAL,
    Annual_Rent REAL, Cashflow_Monthly REAL,
    Strategy TEXT, Exit_Strategy TEXT,
    Deal_Score INTEGER, Risk_Level TEXT,
    Investment_Rating TEXT, Status TEXT,
    Analyst_Notes TEXT,
    FOREIGN KEY (Property_ID) REFERENCES property_leads(Property_ID)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS investor_buyers (
    Investor_ID TEXT PRIMARY KEY,
    Investor_Name TEXT, Investor_Type TEXT,
    Email TEXT, Phone TEXT, Company_Name TEXT,
    Preferred_Areas TEXT,
    Budget_Min REAL, Budget_Max REAL,
    Strategy TEXT, Secondary_Strategy TEXT,
    Bedrooms_Min INTEGER, Bedrooms_Max INTEGER,
    Cash_or_Finance TEXT,
    Last_Contact_Date TEXT, Status TEXT,
    Deals_Completed INTEGER, Total_Invested REAL,
    Notes TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS deal_matching (
    Match_ID TEXT PRIMARY KEY,
    Deal_ID TEXT, Property_ID TEXT,
    Investor_ID TEXT, Investor_Name TEXT,
    Match_Score INTEGER, Match_Reason TEXT,
    Sent_Date TEXT, Sent_Via TEXT,
    Investor_Response TEXT, Response_Date TEXT,
    Outcome TEXT, Fee_Agreed REAL, Notes TEXT,
    FOREIGN KEY (Deal_ID) REFERENCES deal_analysis(Deal_ID),
    FOREIGN KEY (Investor_ID) REFERENCES investor_buyers(Investor_ID)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS sourcing_fees (
    Fee_ID TEXT PRIMARY KEY,
    Deal_ID TEXT, Property_ID TEXT,
    Investor_ID TEXT, Investor_Name TEXT,
    Agreed_Fee REAL, VAT_Applicable TEXT,
    VAT_Amount REAL, Total_Fee_Inc_VAT REAL,
    Invoice_Number TEXT, Invoice_Date TEXT,
    Invoice_Status TEXT, Payment_Due_Date TEXT,
    Payment_Date TEXT, Payment_Status TEXT,
    Payment_Method TEXT, Fee_Type TEXT, Notes TEXT,
    FOREIGN KEY (Deal_ID) REFERENCES deal_analysis(Deal_ID),
    FOREIGN KEY (Investor_ID) REFERENCES investor_buyers(Investor_ID)
  )`);
  save();
}

// Helper: run a query and return all rows as objects
function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

// Helper: run a query and return first row
function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// Helper: run INSERT/UPDATE/DELETE
function run(sql, params = []) {
  db.run(sql, params);
  save();
  return { changes: db.getRowsModified() };
}

// Helper: run INSERT and return last insert ID
function insert(sql, params = []) {
  db.run(sql, params);
  const stmt = db.prepare('SELECT last_insert_rowid() as id');
  stmt.step();
  const rowid = stmt.getAsObject().id;
  stmt.free();
  save();
  return { lastInsertRowid: rowid };
}

module.exports = { init, getDb, save, queryAll, queryOne, run, insert };
