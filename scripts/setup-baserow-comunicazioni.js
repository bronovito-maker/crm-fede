'use strict';

require('dotenv').config();

const baseUrl = process.env.BASEROW_BASE_URL || 'https://api.baserow.io';
const jwtToken = process.env.BASEROW_JWT_TOKEN || '';
const databaseId = Number(process.env.BASEROW_DATABASE_ID || 414331);
const agentTableId = Number(process.env.BASEROW_TABLE_AGENTI_ID || 925635);

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

async function ensureTable(tables, name) {
  let table = tables.find((item) => item.name === name);
  if (!table) table = await api('POST', `/api/database/tables/database/${databaseId}/`, { name });
  return table;
}

async function run() {
  if (!jwtToken) throw new Error('Imposta BASEROW_JWT_TOKEN con un JWT temporaneo Admin/Builder.');
  const tables = await api('GET', `/api/database/tables/database/${databaseId}/`);

  const notifications = await ensureTable(tables, 'Notifiche');
  const notificationFields = await api('GET', `/api/database/fields/table/${notifications.id}/`);
  await ensureField(notificationFields, notifications.id, {
    name: 'destinatario', type: 'link_row', link_row_table_id: agentTableId, has_related_field: false,
  });
  await ensureField(notificationFields, notifications.id, { name: 'tipo', type: 'text' });
  await ensureField(notificationFields, notifications.id, { name: 'titolo', type: 'text' });
  await ensureField(notificationFields, notifications.id, { name: 'testo', type: 'long_text' });
  await ensureField(notificationFields, notifications.id, { name: 'letta', type: 'boolean' });
  await ensureField(notificationFields, notifications.id, { name: 'link', type: 'text' });

  const messages = await ensureTable(tables, 'Messaggi');
  const messageFields = await api('GET', `/api/database/fields/table/${messages.id}/`);
  await ensureField(messageFields, messages.id, { name: 'conversazione', type: 'text' });
  await ensureField(messageFields, messages.id, {
    name: 'mittente', type: 'link_row', link_row_table_id: agentTableId, has_related_field: false,
  });
  await ensureField(messageFields, messages.id, {
    name: 'destinatario', type: 'link_row', link_row_table_id: agentTableId, has_related_field: false,
  });
  await ensureField(messageFields, messages.id, { name: 'testo', type: 'long_text' });
  await ensureField(messageFields, messages.id, { name: 'letta', type: 'boolean' });

  console.log(`BASEROW_TABLE_NOTIFICHE_ID=${notifications.id}`);
  console.log(`BASEROW_TABLE_MESSAGGI_ID=${messages.id}`);
}

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
