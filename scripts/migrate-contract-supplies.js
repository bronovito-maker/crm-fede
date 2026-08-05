'use strict';

require('dotenv').config();

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.BASEROW_BASE_URL || 'https://api.baserow.io';
const token = process.env.BASEROW_TOKEN || '';
const contractsTableId = Number(process.env.BASEROW_TABLE_CONTRATTI_ID || 925638);
const suppliesTableId = Number(process.env.BASEROW_TABLE_FORNITURE_ID || 1117525);
const applyChanges = process.argv.includes('--apply');
const confirmation = process.argv.find((argument) => argument.startsWith('--confirm='));
const confirmedContractCount = Number(confirmation?.split('=')[1]);
const reportDirectory = path.join(process.cwd(), 'migration-reports');
const requiredSupplyFields = new Set([
  'nome',
  'contratto',
  'tipo_fornitura',
  'stato',
  'metodo_pagamento',
  'pod',
  'pdr',
  'metodo_inserimento',
  'potenza_impegnata',
  'potenza_disponibile',
  'consumo_annuo',
]);

async function api(method, pathname, body) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${method} ${pathname}: HTTP ${response.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

async function listRows(tableId) {
  const rows = [];
  let page = 1;
  while (true) {
    const result = await api(
      'GET',
      `/api/database/rows/table/${tableId}/?user_field_names=true&size=200&page=${page}`
    );
    rows.push(...result.results);
    if (!result.next) return rows;
    page += 1;
  }
}

function selectValue(value) {
  return value && typeof value === 'object' ? value.value || '' : String(value || '');
}

function linkedId(value) {
  return Array.isArray(value) && value.length ? Number(value[0].id) : 0;
}

function normalizeStatus(value) {
  const status = selectValue(value).trim() || 'Caricato';
  return status === 'Switch-Out' ? 'Switch - Out' : status;
}

function sourceSnapshot(contract) {
  return {
    id: Number(contract.id),
    tipoFornitura: selectValue(contract.tipo_fornitura).toLowerCase(),
    stato: normalizeStatus(contract.stato_contratto),
    metodoPagamento: selectValue(contract.metodo_pagamento),
    pod: String(contract.pod || '').trim(),
    pdr: String(contract.pdr || '').trim(),
  };
}

function sourceFingerprint(contract) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(sourceSnapshot(contract)))
    .digest('hex');
}

function supplyPayload(contract, type) {
  const source = sourceSnapshot(contract);
  return {
    nome: `CONTRATTO ${source.id} - ${type.toUpperCase()}`,
    contratto: [source.id],
    tipo_fornitura: type,
    stato: source.stato,
    metodo_pagamento: source.metodoPagamento,
    pod: type === 'luce' ? source.pod : '',
    pdr: type === 'gas' ? source.pdr : '',
    metodo_inserimento: null,
    potenza_impegnata: null,
    potenza_disponibile: null,
    consumo_annuo: null,
  };
}

function writeReport(report) {
  fs.mkdirSync(reportDirectory, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const mode = applyChanges ? 'apply' : 'dry-run';
  const filePath = path.join(reportDirectory, `dual-supplies-${mode}-${timestamp}.json`);
  fs.writeFileSync(filePath, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
  return filePath;
}

async function createSupply(payload) {
  return api('POST', `/api/database/rows/table/${suppliesTableId}/?user_field_names=true`, payload);
}

async function deleteSupply(supplyId) {
  await api(
    'DELETE',
    `/api/database/rows/table/${suppliesTableId}/${supplyId}/?user_field_names=true`
  );
}

async function verifySourceUnchanged(planItem) {
  const current = await api(
    'GET',
    `/api/database/rows/table/${contractsTableId}/${planItem.contractId}/?user_field_names=true`
  );
  if (sourceFingerprint(current) !== planItem.sourceFingerprint) {
    throw new Error(`Contratto ${planItem.contractId} modificato dopo il dry-run.`);
  }
  return current;
}

function buildPlan(contracts, supplies) {
  const dualContracts = contracts.filter(
    (contract) => selectValue(contract.tipo_fornitura).toLowerCase() === 'dual'
  );
  const suppliesByContract = new Map();
  supplies.forEach((supply) => {
    const contractId = linkedId(supply.contratto);
    if (!contractId) return;
    if (!suppliesByContract.has(contractId)) suppliesByContract.set(contractId, []);
    suppliesByContract.get(contractId).push(supply);
  });

  const anomalies = [];
  const plan = [];
  let alreadyComplete = 0;

  dualContracts.forEach((contract) => {
    const source = sourceSnapshot(contract);
    const existing = suppliesByContract.get(source.id) || [];
    const existingTypes = existing.map((row) => selectValue(row.tipo_fornitura).toLowerCase());
    const duplicateTypes = existingTypes.filter(
      (type, index) => type && existingTypes.indexOf(type) !== index
    );
    const unexpectedTypes = existingTypes.filter((type) => !['luce', 'gas'].includes(type));

    if (!source.pod || !source.pdr || !source.metodoPagamento || !source.stato) {
      anomalies.push({ contractId: source.id, code: 'INCOMPLETE_SOURCE' });
      return;
    }
    if (duplicateTypes.length || unexpectedTypes.length) {
      anomalies.push({
        contractId: source.id,
        code: 'INVALID_EXISTING_SUPPLIES',
        existingTypes,
      });
      return;
    }

    const missingTypes = ['luce', 'gas'].filter((type) => !existingTypes.includes(type));
    if (!missingTypes.length) {
      alreadyComplete += 1;
      return;
    }
    plan.push({
      contractId: source.id,
      sourceFingerprint: sourceFingerprint(contract),
      existingSupplyIds: existing.map((row) => Number(row.id)),
      missingTypes,
    });
  });

  return { dualContracts, plan, anomalies, alreadyComplete };
}

async function run() {
  if (!token) throw new Error('BASEROW_TOKEN non configurato.');

  const [fields, contracts, supplies] = await Promise.all([
    api('GET', `/api/database/fields/table/${suppliesTableId}/`),
    listRows(contractsTableId),
    listRows(suppliesTableId),
  ]);
  const fieldNames = new Set(fields.map((field) => field.name));
  const missingSchemaFields = [...requiredSupplyFields].filter((name) => !fieldNames.has(name));
  const { dualContracts, plan, anomalies, alreadyComplete } = buildPlan(contracts, supplies);
  const report = {
    generatedAt: new Date().toISOString(),
    mode: applyChanges ? 'apply' : 'dry-run',
    contractsTableId,
    suppliesTableId,
    totals: {
      contracts: contracts.length,
      dualContracts: dualContracts.length,
      alreadyComplete,
      contractsToMigrate: plan.length,
      supplyRowsToCreate: plan.reduce((sum, item) => sum + item.missingTypes.length, 0),
      unlinkedSupplyRows: supplies.filter((row) => !linkedId(row.contratto)).length,
    },
    missingSchemaFields,
    anomalies,
    plan,
    created: [],
    verification: null,
  };

  if (missingSchemaFields.length || anomalies.length) {
    const reportPath = writeReport(report);
    console.log(JSON.stringify(report.totals, null, 2));
    console.log(`Blocco di sicurezza. Report: ${reportPath}`);
    if (missingSchemaFields.length) {
      console.log(`Campi schema mancanti: ${missingSchemaFields.join(', ')}`);
    }
    if (anomalies.length) console.log(`Anomalie dati: ${anomalies.length}`);
    process.exitCode = 2;
    return;
  }

  if (!applyChanges) {
    const reportPath = writeReport(report);
    console.log(JSON.stringify(report.totals, null, 2));
    console.log(`Dry-run completato. Report: ${reportPath}`);
    console.log(
      `Per applicare: npm run baserow:migrate-forniture -- --apply --confirm=${plan.length}`
    );
    return;
  }

  if (confirmedContractCount !== plan.length) {
    throw new Error(
      `Conferma non valida: atteso --confirm=${plan.length}, ricevuto ${confirmation || 'nessuna'}.`
    );
  }

  for (const item of plan) {
    const currentContract = await verifySourceUnchanged(item);
    const createdForContract = [];
    try {
      for (const type of item.missingTypes) {
        const created = await createSupply(supplyPayload(currentContract, type));
        createdForContract.push({ id: Number(created.id), type });
      }
      report.created.push({ contractId: item.contractId, supplies: createdForContract });
    } catch (error) {
      await Promise.allSettled(createdForContract.map((row) => deleteSupply(row.id)));
      report.failure = { contractId: item.contractId, message: error.message };
      const reportPath = writeReport(report);
      throw new Error(
        `Migrazione interrotta al contratto ${item.contractId}. Report: ${reportPath}`
      );
    }
  }

  const verifiedSupplies = await listRows(suppliesTableId);
  const verification = buildPlan(contracts, verifiedSupplies);
  report.verification = {
    remainingContracts: verification.plan.length,
    anomalies: verification.anomalies,
    completeContracts: verification.alreadyComplete,
  };
  const reportPath = writeReport(report);
  if (
    verification.plan.length ||
    verification.anomalies.length ||
    verification.alreadyComplete !== dualContracts.length
  ) {
    throw new Error(`Verifica post-migrazione fallita. Report: ${reportPath}`);
  }
  console.log(`Migrazione completata e verificata: ${dualContracts.length} Dual.`);
  console.log(`Report: ${reportPath}`);
}

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
