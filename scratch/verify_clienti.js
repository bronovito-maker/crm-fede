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
  const tableId = '931646';
  console.log(`Checking fields for Table ${tableId}...`);
  
  // We can't use /api/database/fields/ because it's management API.
  // We'll use /api/database/rows/table/{tableId}/?size=0&user_field_names=true
  // but wait, if there are no rows, we might not see all fields if we don't know them.
  // Actually, Baserow API rows endpoint returns all fields in the response schema usually.
  
  const res = await fetch(`${baseUrl}/api/database/rows/table/${tableId}/?size=1&user_field_names=true`, {
    headers: { Authorization: `Token ${token}` }
  });
  
  if (!res.ok) {
    console.error('Failed to fetch table info:', await res.text());
    return;
  }
  
  const data = await res.json();
  console.log('Detected field names (via row result keys):');
  // If no rows, results might be empty. Let's try to add a dummy row if needed? No.
  // Let's check results list.
  console.log('Results:', data.results);
  
  // If empty, let's try to get the listing of fields using the MCP or a different endpoint.
  // Actually, Baserow API for rows doesn't show schema if empty.
  
  // Let's try to CREATE a dummy row to see what fields it accepts.
  console.log('\nTrying to create a test row to verify fields...');
  const testPayload = {
      "Ragione Sociale": "Test",
      "piva": "123",
      "email": "test@test.it",
      "cellulare": "123",
      "indirizzo_fatturazione": "Via test"
  };
  
  const res2 = await fetch(`${baseUrl}/api/database/rows/table/${tableId}/?user_field_names=true`, {
      method: 'POST',
      headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
  });
  
  if (res2.ok) {
      const created = await res2.json();
      console.log('Test row created successfully! Accepted fields:', Object.keys(created));
      // Delete it immediately
      await fetch(`${baseUrl}/api/database/rows/table/${tableId}/${created.id}/`, {
          method: 'DELETE',
          headers: { Authorization: `Token ${token}` }
      });
      console.log('Test row deleted.');
  } else {
      console.error('Test row failed. Error:', await res2.text());
  }
}

run();
