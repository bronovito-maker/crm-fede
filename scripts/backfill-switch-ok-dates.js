'use strict';

require('dotenv').config();

const baseUrl = process.env.BASEROW_BASE_URL || 'https://api.baserow.io';
const token = process.env.BASEROW_TOKEN || '';
const suppliesTableId = process.env.BASEROW_TABLE_FORNITURE_ID || '';
const contractsTableId = process.env.BASEROW_TABLE_CONTRATTI_ID || '';
const dateField = process.env.BASEROW_FIELD_FORNITURE_DATA_SWITCH_OK || 'data_switch_ok';
const apply = process.argv.includes('--apply');
const confirmCount = confirmationCount();

async function run() {
  requireConfig();
  const [supplies, contracts] = await Promise.all([
    fetchAllRows(suppliesTableId),
    fetchAllRows(contractsTableId),
  ]);
  const contractsById = new Map(contracts.map((row) => [Number(row.id), row]));
  const changes = [];
  const warnings = [];

  for (const supply of supplies) {
    const status = selectValue(supply.stato);
    const current = isoDate(supply[dateField]);
    let expected = current;
    if (status === 'OK' && !current) {
      const contractId = linkedId(supply.contratto);
      expected = isoDate(contractsById.get(contractId)?.data_inserimento);
      if (!expected) {
        warnings.push({ supplyId: supply.id, reason: 'data_inserimento non disponibile' });
        continue;
      }
    } else if (status !== 'OK' && current) {
      expected = '';
    }
    if (expected !== current) changes.push({ id: Number(supply.id), from: current, to: expected });
  }

  console.log(`[switch-ok] forniture analizzate: ${supplies.length}`);
  console.log(`[switch-ok] modifiche previste: ${changes.length}`);
  console.log(`[switch-ok] anomalie: ${warnings.length}`);
  changes.slice(0, 20).forEach((change) => console.log(JSON.stringify(change)));
  warnings.slice(0, 20).forEach((warning) => console.warn(JSON.stringify(warning)));

  if (!apply) {
    console.log(
      `[switch-ok] DRY RUN: nessuna riga modificata. Usa --apply --confirm=${changes.length} per confermare.`
    );
    return;
  }
  if (confirmCount !== changes.length) {
    throw new Error(
      `Conferma non valida: previste ${changes.length} modifiche, ricevuto --confirm=${confirmCount}.`
    );
  }
  for (const change of changes) {
    await api(
      'PATCH',
      `/api/database/rows/table/${suppliesTableId}/${change.id}/?user_field_names=true`,
      { [dateField]: change.to || null }
    );
  }
  console.log(`[switch-ok] completato: ${changes.length} righe aggiornate.`);
}

function requireConfig() {
  if (!token || !suppliesTableId || !contractsTableId) {
    throw new Error(
      'Configura BASEROW_TOKEN, BASEROW_TABLE_FORNITURE_ID e BASEROW_TABLE_CONTRATTI_ID.'
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

function selectValue(value) {
  return typeof value === 'object' && value ? value.value || '' : String(value || '');
}

function linkedId(value) {
  const first = Array.isArray(value) ? value[0] : value;
  return Number(first?.id || first || 0);
}

function isoDate(value) {
  return String(value || '').match(/^\d{4}-\d{2}-\d{2}/)?.[0] || '';
}

function confirmationCount() {
  const argument = process.argv.find((value) => value.startsWith('--confirm='));
  return argument ? Number.parseInt(argument.split('=')[1], 10) : null;
}

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
