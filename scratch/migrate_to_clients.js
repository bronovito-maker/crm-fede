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
const contrattiTableId = 925638;
const clientiTableId = 931646;

async function fetchAllRows(tableId) {
  let rows = [];
  let url = `${baseUrl}/api/database/rows/table/${tableId}/?user_field_names=true&size=200`;
  while (url) {
    const res = await fetch(url, { headers: { Authorization: `Token ${token}` } });
    const data = await res.json();
    rows = rows.concat(data.results);
    url = data.next;
  }
  return rows;
}

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
    console.log('Fetching all contracts...');
    const contracts = await fetchAllRows(contrattiTableId);
    console.log(`Found ${contracts.length} contracts.`);

    // Group by PIVA
    const clientsMap = new Map();
    contracts.forEach(c => {
      const piva = (c.piva || '').trim();
      if (!piva) return;
      
      const existing = clientsMap.get(piva);
      // We take the one with the highest ID (assumed most recent)
      if (!existing || c.id > existing.id) {
        clientsMap.set(piva, {
          'Ragione Sociale': c.ragione_sociale,
          piva: piva,
          email: c.email,
          cellulare: c.cellulare,
          indirizzo_fatturazione: c.indirizzo_fatturazione,
          agente: c.agente && c.agente[0] ? [c.agente[0].id] : [],
          id: c.id // original contract id for tracking
        });
      }
    });

    console.log(`Identified ${clientsMap.size} unique clients.`);

    console.log('Creating clients in Baserow...');
    const pivaToClientId = new Map();
    const uniqueClients = Array.from(clientsMap.values());
    
    // Batch create clients (Baserow supports batches of 200)
    for (let i = 0; i < uniqueClients.length; i += 200) {
      const batch = uniqueClients.slice(i, i + 200).map(c => {
        const { id, ...payload } = c;
        return payload;
      });
      const response = await api('POST', `/api/database/rows/table/${clientiTableId}/batch/?user_field_names=true`, { items: batch });
      response.items.forEach(item => {
        pivaToClientId.set(item.piva, item.id);
      });
      console.log(`Created batch ${i / 200 + 1}`);
    }

    console.log('Updating contracts with links...');
    const contractsToUpdate = contracts.filter(c => {
        const piva = (c.piva || '').trim();
        return piva && pivaToClientId.has(piva);
    });

    for (let i = 0; i < contractsToUpdate.length; i += 200) {
        const batch = contractsToUpdate.slice(i, i + 200).map(c => {
            const piva = (c.piva || '').trim();
            const clientId = pivaToClientId.get(piva);
            return {
                id: c.id,
                cliente: [clientId]
            };
        });
        await api('PATCH', `/api/database/rows/table/${contrattiTableId}/batch/?user_field_names=true`, { items: batch });
        console.log(`Updated contracts batch ${i / 200 + 1}`);
    }

    console.log('\n--- MIGRATION SUCCESSFUL ---');
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

run();
