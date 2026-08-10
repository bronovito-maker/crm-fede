'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');

const baseUrl = process.env.BASEROW_BASE_URL || 'https://api.baserow.io';
const token = process.env.BASEROW_TOKEN || '';
const contractsTableId = Number(process.env.BASEROW_TABLE_CONTRATTI_ID || 925638);
const suppliesTableId = Number(process.env.BASEROW_TABLE_FORNITURE_ID || 1117525);
const applyChanges = process.argv.includes('--apply');
const confirmation = process.argv.find((argument) => argument.startsWith('--confirm='));
const confirmedOperations = Number(confirmation?.split('=')[1]);
const reportDirectory = path.join(process.cwd(), 'migration-reports');
const requiredFields = [
  'nome',
  'contratto',
  'cliente',
  'intestatario',
  'tipo_fornitura',
  'stato',
  'metodo_pagamento',
  'pod',
  'pdr',
  'indirizzo_fornitura',
];
const writableSupplyFields = [
  'nome',
  'contratto',
  'cliente',
  'intestatario',
  'tipo_fornitura',
  'stato',
  'metodo_pagamento',
  'pod',
  'pdr',
  'indirizzo_fornitura',
  'metodo_inserimento',
  'potenza_impegnata',
  'potenza_disponibile',
  'consumo_annuo',
];

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

async function listRows(tableId) {
  const rows = [];
  for (let page = 1; ; page += 1) {
    const result = await api(
      'GET',
      `/api/database/rows/table/${tableId}/?user_field_names=true&size=200&page=${page}`
    );
    rows.push(...result.results);
    if (!result.next) return rows;
  }
}

function selectValue(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value.value || ''
    : String(value || '');
}

function linkedId(value) {
  return Array.isArray(value) && value[0] ? Number(value[0].id) : 0;
}

function upper(value) {
  return String(value || '')
    .trim()
    .toUpperCase();
}

function parseLabeled(value, kind) {
  return String(value || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .map((line) => line.match(new RegExp(`^${kind}\\s+(\\d+):\\s*(.+)$`, 'i')))
    .filter(Boolean)
    .map((match) => ({ index: Number(match[1]), code: upper(match[2]) }));
}

function parseAddresses(value) {
  const result = new Map();
  String(value || '')
    .split(/\r?\n/)
    .forEach((line) => {
      const match = line.trim().match(/^(POD|PDR)\s+(\d+):\s*(.+)$/i);
      if (match) result.set(`${match[1].toUpperCase()}:${Number(match[2])}`, upper(match[3]));
    });
  return result;
}

function desiredMultipointRows(contract) {
  const addresses = parseAddresses(contract.indirizzo_fornitura);
  const points = [
    ...parseLabeled(contract.pod, 'POD').map((point) => ({ ...point, type: 'luce', kind: 'POD' })),
    ...parseLabeled(contract.pdr, 'PDR').map((point) => ({ ...point, type: 'gas', kind: 'PDR' })),
  ];
  return points.map((point) => ({
    ...point,
    address: addresses.get(`${point.kind}:${point.index}`) || '',
  }));
}

function supplyKey(type, code) {
  return `${type}:${upper(code)}`;
}

function sourceForType(contract, existingRows, type) {
  const existing = existingRows.find((row) => selectValue(row.tipo_fornitura) === type);
  return {
    stato: selectValue(existing?.stato) || selectValue(contract.stato_contratto) || 'Caricato',
    metodo_pagamento:
      selectValue(existing?.metodo_pagamento) || selectValue(contract.metodo_pagamento) || null,
    metodo_inserimento: selectValue(existing?.metodo_inserimento) || null,
    potenza_impegnata: existing?.potenza_impegnata ?? null,
    potenza_disponibile: existing?.potenza_disponibile ?? null,
    consumo_annuo: existing?.consumo_annuo ?? null,
  };
}

function commonPayload(contract, clientId, type, code, address) {
  return {
    nome: `${contract.ragione_sociale || `CONTRATTO ${contract.id}`} - ${type.toUpperCase()} - ${code}`,
    contratto: [Number(contract.id)],
    cliente: clientId ? [clientId] : [],
    intestatario: upper(contract.ragione_sociale),
    tipo_fornitura: type,
    pod: type === 'luce' ? code : '',
    pdr: type === 'gas' ? code : '',
    indirizzo_fornitura: address,
  };
}

function comparable(value) {
  if (Array.isArray(value)) return value.map((item) => Number(item?.id ?? item)).filter(Boolean);
  if (value && typeof value === 'object') return value.value ?? value.id ?? value;
  return value ?? null;
}

function writableValue(value) {
  if (Array.isArray(value)) return value.map((item) => Number(item?.id ?? item)).filter(Boolean);
  if (value && typeof value === 'object') return value.value ?? value.id ?? null;
  return value ?? null;
}

function rowSnapshot(row, fields = writableSupplyFields) {
  return Object.fromEntries(fields.map((field) => [field, writableValue(row[field])]));
}

function payloadDiffers(row, payload) {
  return Object.entries(payload).some(
    ([field, value]) => JSON.stringify(comparable(row[field])) !== JSON.stringify(comparable(value))
  );
}

function buildPlan(contracts, supplies) {
  const contractById = new Map(contracts.map((row) => [Number(row.id), row]));
  const suppliesByContract = new Map();
  supplies.forEach((row) => {
    const contractId = linkedId(row.contratto);
    if (!suppliesByContract.has(contractId)) suppliesByContract.set(contractId, []);
    suppliesByContract.get(contractId).push(row);
  });
  const operations = [];
  const multipointContracts = [];

  contracts.forEach((contract) => {
    const desired = desiredMultipointRows(contract);
    if (!desired.length) return;
    multipointContracts.push(Number(contract.id));
    const existingRows = suppliesByContract.get(Number(contract.id)) || [];
    const existingByKey = new Map(
      existingRows.map((row) => {
        const type = selectValue(row.tipo_fornitura);
        return [supplyKey(type, type === 'luce' ? row.pod : row.pdr), row];
      })
    );
    const retained = new Set();
    desired.forEach((point) => {
      const existing = existingByKey.get(supplyKey(point.type, point.code));
      const clientId = linkedId(contract.cliente);
      const payload = {
        ...commonPayload(contract, clientId, point.type, point.code, point.address),
        ...sourceForType(contract, existing ? [existing] : existingRows, point.type),
      };
      if (existing) {
        retained.add(Number(existing.id));
        if (payloadDiffers(existing, payload)) {
          operations.push({
            action: 'update',
            id: Number(existing.id),
            contractId: Number(contract.id),
            before: rowSnapshot(existing, Object.keys(payload)),
            payload,
          });
        }
      } else {
        operations.push({ action: 'create', contractId: Number(contract.id), payload });
      }
    });
    existingRows
      .filter((row) => !retained.has(Number(row.id)))
      .forEach((row) =>
        operations.push({
          action: 'delete',
          id: Number(row.id),
          contractId: Number(contract.id),
          before: rowSnapshot(row),
        })
      );
  });

  supplies.forEach((row) => {
    const contractId = linkedId(row.contratto);
    if (!contractId || multipointContracts.includes(contractId)) return;
    const contract = contractById.get(contractId);
    if (!contract) return;
    const type = selectValue(row.tipo_fornitura);
    const code = upper(type === 'luce' ? row.pod : row.pdr);
    const payload = commonPayload(
      contract,
      linkedId(contract.cliente),
      type,
      code,
      upper(row.indirizzo_fornitura || contract.indirizzo_fornitura)
    );
    if (payloadDiffers(row, payload)) {
      operations.push({
        action: 'update',
        id: Number(row.id),
        contractId,
        before: rowSnapshot(row, Object.keys(payload)),
        payload,
      });
    }
  });

  return { operations, multipointContracts };
}

function writeReport(report) {
  fs.mkdirSync(reportDirectory, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const mode = applyChanges ? 'apply' : 'dry-run';
  const file = path.join(reportDirectory, `multipoint-${mode}-${timestamp}.json`);
  fs.writeFileSync(file, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
  return file;
}

function checkpointReport(file, report) {
  fs.writeFileSync(file, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
}

async function run() {
  if (!token) throw new Error('BASEROW_TOKEN non configurato.');
  const [fields, contracts, supplies] = await Promise.all([
    api('GET', `/api/database/fields/table/${suppliesTableId}/`),
    listRows(contractsTableId),
    listRows(suppliesTableId),
  ]);
  const names = new Set(fields.map((field) => field.name));
  const missingFields = requiredFields.filter((field) => !names.has(field));
  const { operations, multipointContracts } = buildPlan(contracts, supplies);
  const totals = {
    multipointContracts: multipointContracts.length,
    operations: operations.length,
    create: operations.filter((operation) => operation.action === 'create').length,
    update: operations.filter((operation) => operation.action === 'update').length,
    delete: operations.filter((operation) => operation.action === 'delete').length,
  };
  const report = {
    generatedAt: new Date().toISOString(),
    mode: applyChanges ? 'apply' : 'dry-run',
    missingFields,
    totals,
    completedOperations: 0,
    results: [],
    operations,
  };
  const reportFile = writeReport(report);
  console.log(JSON.stringify({ missingFields, totals }, null, 2));
  console.log(`Report: ${reportFile}`);
  if (missingFields.length) {
    process.exitCode = 2;
    return;
  }
  if (!applyChanges) {
    console.log(
      `Per applicare: npm run baserow:migrate-multipoint -- --apply --confirm=${operations.length}`
    );
    return;
  }
  if (confirmedOperations !== operations.length) {
    throw new Error(`Conferma non valida: usa --confirm=${operations.length}.`);
  }
  const orderedOperations = [
    ...operations.filter((operation) => operation.action === 'create'),
    ...operations.filter((operation) => operation.action === 'update'),
    ...operations.filter((operation) => operation.action === 'delete'),
  ];
  for (const operation of orderedOperations) {
    const basePath = `/api/database/rows/table/${suppliesTableId}`;
    let result;
    if (operation.action === 'create') {
      result = await api('POST', `${basePath}/?user_field_names=true`, operation.payload);
    }
    if (operation.action === 'update') {
      result = await api(
        'PATCH',
        `${basePath}/${operation.id}/?user_field_names=true`,
        operation.payload
      );
    }
    if (operation.action === 'delete') {
      await api('DELETE', `${basePath}/${operation.id}/?user_field_names=true`);
    }
    report.completedOperations += 1;
    report.results.push({
      action: operation.action,
      sourceId: operation.id || null,
      createdId: operation.action === 'create' ? Number(result.id) : null,
      contractId: operation.contractId,
    });
    checkpointReport(reportFile, report);
  }
  console.log(`Migrazione completata: ${operations.length} operazioni.`);
}

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
