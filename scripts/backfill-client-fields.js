'use strict';

require('dotenv').config();

const baseUrl = process.env.BASEROW_BASE_URL || 'https://api.baserow.io';
const token = process.env.BASEROW_TOKEN || '';
const clientsTableId = process.env.BASEROW_TABLE_CLIENTI_ID || '';
const contractsTableId = process.env.BASEROW_TABLE_CONTRATTI_ID || '';
const apply = process.argv.includes('--apply');
const confirmCount = confirmationCount();

async function run() {
  requireConfig();
  const [clients, contracts] = await Promise.all([
    fetchAllRows(clientsTableId),
    fetchAllRows(contractsTableId),
  ]);
  const contractsByClient = new Map();
  contracts.forEach((contract) => {
    const clientId = linkedId(contract.cliente);
    if (!clientId) return;
    if (!contractsByClient.has(clientId)) contractsByClient.set(clientId, []);
    contractsByClient.get(clientId).push(contract);
  });

  const changes = [];
  for (const client of clients) {
    const history = (contractsByClient.get(Number(client.id)) || []).sort(
      (left, right) =>
        String(right.data_inserimento || '').localeCompare(String(left.data_inserimento || '')) ||
        Number(right.id) - Number(left.id)
    );
    const payload = {};
    for (const field of ['pec', 'metodo_pagamento', 'iban']) {
      if (readValue(client[field])) continue;
      const source = history.find((contract) => readValue(contract[field]));
      if (source) payload[field] = writableValue(source[field]);
    }
    if (Object.keys(payload).length) changes.push({ id: Number(client.id), payload });
  }

  console.log(`[clienti] clienti analizzati: ${clients.length}`);
  console.log(`[clienti] clienti da integrare: ${changes.length}`);
  const fieldCounts = changes.reduce((counts, change) => {
    Object.keys(change.payload).forEach((field) => {
      counts[field] = (counts[field] || 0) + 1;
    });
    return counts;
  }, {});
  console.log(`[clienti] campi previsti: ${JSON.stringify(fieldCounts)}`);
  changes
    .slice(0, 20)
    .forEach((change) =>
      console.log(JSON.stringify({ id: change.id, fields: Object.keys(change.payload) }))
    );
  if (!apply) {
    console.log(
      `[clienti] DRY RUN: nessuna riga modificata. Usa --apply --confirm=${changes.length} per confermare.`
    );
    return;
  }
  if (confirmCount !== changes.length) {
    throw new Error(
      `Conferma non valida: previsti ${changes.length} clienti, ricevuto --confirm=${confirmCount}.`
    );
  }
  for (const change of changes) {
    await api(
      'PATCH',
      `/api/database/rows/table/${clientsTableId}/${change.id}/?user_field_names=true`,
      change.payload
    );
  }
  console.log(`[clienti] completato: ${changes.length} clienti aggiornati senza sovrascritture.`);
}

function requireConfig() {
  if (!token || !clientsTableId || !contractsTableId) {
    throw new Error(
      'Configura BASEROW_TOKEN, BASEROW_TABLE_CLIENTI_ID e BASEROW_TABLE_CONTRATTI_ID.'
    );
  }
}

async function fetchAllRows(tableId) {
  const rows = [];
  let page = 1;
  while (true) {
    const data = await api(
      'GET',
      `/api/database/rows/table/${tableId}/?user_field_names=true&size=200&page=${page}`
    );
    rows.push(...(data.results || []));
    if (!data.next) return rows;
    page += 1;
  }
}

async function api(method, pathname, body) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${method} ${pathname}: HTTP ${response.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

function linkedId(value) {
  const first = Array.isArray(value) ? value[0] : value;
  return Number(first?.id || first || 0);
}

function readValue(value) {
  return typeof value === 'object' && value
    ? String(value.value || '').trim()
    : String(value || '').trim();
}

function writableValue(value) {
  return typeof value === 'object' && value ? value.value || null : value || null;
}

function confirmationCount() {
  const argument = process.argv.find((value) => value.startsWith('--confirm='));
  return argument ? Number.parseInt(argument.split('=')[1], 10) : null;
}

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
