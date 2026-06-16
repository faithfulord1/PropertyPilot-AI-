const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { init, getDb, run } = require('./db');

const DATA_DIR = path.join(__dirname, '..', 'data');

const CSV_FILES = {
  property_leads: 'property_leads.csv',
  deal_analysis: 'deal_analysis.csv',
  investor_buyers: 'investor_buyers.csv',
  deal_matching: 'deal_matching.csv',
  sourcing_fees: 'sourcing_fees.csv',
};

function loadCsv(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`  [SKIP] ${filename} — not found`);
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return parse(content, { columns: true, skip_empty_lines: true, relax_column_count: true });
}

async function seed() {
  console.log('=== PropertyPilot AI — Database Seed ===');
  await init();
  const db = getDb();

  run('DELETE FROM sourcing_fees');
  run('DELETE FROM deal_matching');
  run('DELETE FROM deal_analysis');
  run('DELETE FROM investor_buyers');
  run('DELETE FROM property_leads');

  const COL_MAP = {
    property_leads: ['Property_ID','Address','Postcode','Area','Region','Property_Type','Bedrooms','Bathrooms','Asking_Price','Estimated_Value','Vendor_Motivation','Lead_Source','Date_Added','Status','Agent_Name','Agent_Phone','Notes'],
    deal_analysis: ['Deal_ID','Property_ID','Analysis_Date','Purchase_Price','Asking_Price','Discount_Percent','Refurb_Cost','Refurb_Level','Legal_Fees','Stamp_Duty','Survey_Fee','Finance_Costs','Bridging_Rate','Sourcing_Fee','Total_Investment','GDV','ARV','Gross_Profit','Net_Profit','ROI_Percent','Gross_Yield_Percent','Net_Yield_Percent','Monthly_Rent','Annual_Rent','Cashflow_Monthly','Strategy','Exit_Strategy','Deal_Score','Risk_Level','Investment_Rating','Status','Analyst_Notes'],
    investor_buyers: ['Investor_ID','Investor_Name','Investor_Type','Email','Phone','Company_Name','Preferred_Areas','Budget_Min','Budget_Max','Strategy','Secondary_Strategy','Bedrooms_Min','Bedrooms_Max','Cash_or_Finance','Last_Contact_Date','Status','Deals_Completed','Total_Invested','Notes'],
    deal_matching: ['Match_ID','Deal_ID','Property_ID','Investor_ID','Investor_Name','Match_Score','Match_Reason','Sent_Date','Sent_Via','Investor_Response','Response_Date','Outcome','Fee_Agreed','Notes'],
    sourcing_fees: ['Fee_ID','Deal_ID','Property_ID','Investor_ID','Investor_Name','Agreed_Fee','VAT_Applicable','VAT_Amount','Total_Fee_Inc_VAT','Invoice_Number','Invoice_Date','Invoice_Status','Payment_Due_Date','Payment_Date','Payment_Status','Payment_Method','Fee_Type','Notes'],
  };

  for (const [table, filename] of Object.entries(CSV_FILES)) {
    const rows = loadCsv(filename);
    if (rows.length === 0) continue;
    const cols = COL_MAP[table];
    const placeholders = cols.map(() => '?').join(',');
    const sql = `INSERT OR IGNORE INTO ${table} VALUES (${placeholders})`;
    let count = 0;
    for (const row of rows) {
      const vals = cols.map(c => row[c] !== undefined ? row[c] : null);
      run(sql, vals);
      count++;
    }
    console.log(`  Loaded ${count} ${table}`);
  }

  console.log('=== Seed complete ===');
}

if (require.main === module) {
  seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
}

module.exports = { seed };
