const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
  const [key, value] = line.split('=');
  if (key && value) acc[key.trim()] = value.trim();
  return acc;
}, {});

const token = env.BASEROW_TOKEN;
const baseUrl = env.BASEROW_BASE_URL || 'https://api.baserow.io';

async function run() {
  console.log('Testing token with Table 925638 (Contratti)...');
  const res = await fetch(`${baseUrl}/api/database/rows/table/925638/?size=1`, {
    headers: { Authorization: `Token ${token}` }
  });
  if (!res.ok) {
    console.error('Failed to fetch rows:', await res.text());
    return;
  }
  const data = await res.json();
  console.log('Token works! Sample row fetched.');

  console.log('Fetching table schema to find fields...');
  // Note: There isn't a direct "get schema" for token-based auth without knowing the DB ID or using a different token.
  // BUT we can use the fields returned in the row if we use user_field_names=true.
  const res2 = await fetch(`${baseUrl}/api/database/rows/table/925638/?size=1&user_field_names=true`, {
    headers: { Authorization: `Token ${token}` }
  });
  const data2 = await res2.json();
  console.log('Fields in table:', Object.keys(data2.results[0] || {}));
}

run();
