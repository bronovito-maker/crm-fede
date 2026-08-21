'use strict';

require('dotenv').config();

const baseUrl = process.env.BASEROW_BASE_URL || 'https://api.baserow.io';
const jwtToken = process.env.BASEROW_JWT_TOKEN || '';
const databaseId = Number(process.env.BASEROW_DATABASE_ID || 414331);
const agentTableId = Number(process.env.BASEROW_TABLE_AGENTI_ID || 925635);
const clientTableId = Number(process.env.BASEROW_TABLE_CLIENTI_ID || 931646);

async function api(method, pathname, body) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: { Authorization: `JWT ${jwtToken}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${method} ${pathname}: HTTP ${response.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

async function ensureField(fields, tableId, spec) {
  const existing = fields.find((field) => field.name === spec.name);
  if (existing) return existing;
  const created = await api('POST', `/api/database/fields/table/${tableId}/`, spec);
  fields.push(created);
  return created;
}

async function run() {
  if (!jwtToken) throw new Error('Imposta BASEROW_JWT_TOKEN con un JWT temporaneo Admin/Builder.');
  const tables = await api('GET', `/api/database/tables/database/${databaseId}/`);
  let table = tables.find((item) => item.name === 'Analisi bollette');
  if (!table) table = await api('POST', `/api/database/tables/database/${databaseId}/`, { name: 'Analisi bollette' });
  const fields = await api('GET', `/api/database/fields/table/${table.id}/`);
  await ensureField(fields, table.id, { name: 'stato', type: 'single_select', select_options: [
    { value: 'Nuova', color: 'light-blue' }, { value: 'Da ricontattare', color: 'light-orange' },
    { value: 'Contattato', color: 'light-yellow' }, { value: 'Convertita', color: 'light-green' },
    { value: 'Scartata', color: 'light-red' },
  ] });
  await ensureField(fields, table.id, { name: 'agente', type: 'link_row', link_row_table_id: agentTableId, has_related_field: false });
  await ensureField(fields, table.id, { name: 'cliente', type: 'link_row', link_row_table_id: clientTableId, has_related_field: false });
  for (const name of ['file_bolletta', 'file_cte', 'file_bolletta_nome', 'file_cte_nome']) await ensureField(fields, table.id, { name, type: 'text' });
  for (const name of ['dati_estratti', 'confronto', 'note']) await ensureField(fields, table.id, { name, type: 'long_text' });
  await ensureField(fields, table.id, { name: 'prossima_data_ricontatto', type: 'date', date_format: 'EU', date_include_time: false });
  console.log(`BASEROW_TABLE_ANALISI_BOLLETTE_ID=${table.id}`);
}

run().catch((error) => { console.error(error.message); process.exitCode = 1; });
