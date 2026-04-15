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
const databaseId = '414331';
const agentiTableId = 925635;
const contrattiTableId = 925638;

async function api(method, endpoint, body) {
  const options = {
    method,
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json'
    }
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${baseUrl}${endpoint}`, options);
  if (!res.ok) {
    throw new Error(`Baserow API error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function run() {
  try {
    console.log('--- Phase 1: Create Clienti Table ---');
    const table = await api('POST', `/api/database/tables/database/${databaseId}/`, { name: 'Clienti' });
    const tableId = table.id;
    console.log(`Table "Clienti" created with ID: ${tableId}`);

    console.log('\n--- Phase 2: Create Fields in Clienti ---');
    // Note: Baserow creates a default primary field (usually "Name" if not specified).
    // We want the primary field to be "Ragione Sociale".
    // Let's check the default field created.
    const fields = await api('GET', `/api/database/fields/table/${tableId}/`);
    const primaryField = fields[0];
    console.log(`Updating primary field ${primaryField.id} to "Ragione Sociale"...`);
    await api('PATCH', `/api/database/fields/${primaryField.id}/`, { name: 'Ragione Sociale' });

    console.log('Creating piva field...');
    await api('POST', `/api/database/fields/table/${tableId}/`, { name: 'piva', type: 'text' });

    console.log('Creating email field...');
    await api('POST', `/api/database/fields/table/${tableId}/`, { name: 'email', type: 'email' });

    console.log('Creating cellulare field...');
    await api('POST', `/api/database/fields/table/${tableId}/`, { name: 'cellulare', type: 'text' });

    console.log('Creating indirizzo_fatturazione field...');
    await api('POST', `/api/database/fields/table/${tableId}/`, { name: 'indirizzo_fatturazione', type: 'long_text' });

    console.log('Creating agente field (link to Agenti)...');
    await api('POST', `/api/database/fields/table/${tableId}/`, {
      name: 'agente',
      type: 'link_row',
      link_row_table_id: agentiTableId,
      has_related_field: false // We don't necessarily need a backlink field visible in Agenti for now
    });

    console.log('\n--- Phase 3: Add link to Clienti in Contratti Table ---');
    const linkField = await api('POST', `/api/database/fields/table/${contrattiTableId}/`, {
        name: 'Cliente New',
        type: 'link_row',
        link_row_table_id: tableId,
        has_related_field: true
    });
    console.log(`Link field created in Contratti: ${linkField.id}`);

    console.log('\n--- SETUP COMPLETE ---');
    console.log(`Add this to your .env: \nBASEROW_TABLE_CLIENTI_ID=${tableId}`);

  } catch (error) {
    console.error('ERROR during setup:', error);
  }
}

run();
