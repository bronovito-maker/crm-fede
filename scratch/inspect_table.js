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
  console.log('Fetching fields for Table 928679...');
  const res = await fetch(`${baseUrl}/api/database/rows/table/928679/?size=1&user_field_names=true`, {
    headers: { Authorization: `Token ${token}` }
  });
  if (!res.ok) {
    console.error('Failed to fetch table info:', await res.text());
    return;
  }
  const data = await res.json();
  console.log('Sample row from 928679:', JSON.stringify(data.results[0] || {}, null, 2));
}

run();
