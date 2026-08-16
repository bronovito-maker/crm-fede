'use strict';

const ELIGIBLE_OPERATIONS = new Set(['switch', 'switch + voltura', 'subentro']);
const PENDING_STATUSES = new Set(['caricato', 'inviato', 'in avanzamento']);

function buildSwitchOpportunities(contracts, supplierConfigs, options = {}) {
  const today = normalizeIsoDate(options.today) || new Date().toISOString().slice(0, 10);
  const clientsById = toNumericMap(options.clientsById);
  const agentsById = toNumericMap(options.agentsById);
  const supplierByKey = new Map(
    (supplierConfigs || []).map((supplier) => [normalizeText(supplier.name), supplier])
  );
  const eventsByUtility = new Map();

  for (const contract of contracts || []) {
    if (!hasEligibleOperation(contract)) continue;
    for (const event of expandContractEvents(contract)) {
      if (!event.code || !event.type) continue;
      const key = `${event.type}:${event.code}`;
      if (!eventsByUtility.has(key)) eventsByUtility.set(key, []);
      eventsByUtility.get(key).push(event);
    }
  }

  const opportunities = [];
  const missingSupplierConfigs = new Set();

  for (const [utilityKey, events] of eventsByUtility) {
    const okEvents = events.filter((event) => canonicalStatus(event.status) === 'OK');
    if (!okEvents.length) continue;
    okEvents.sort(compareOkEvents);
    const lastOk = okEvents.at(-1);
    const supplier = supplierByKey.get(normalizeText(lastOk.supplier));
    const months = toNonNegativeInteger(supplier?.switchDelayMonths);
    if (months === null) {
      missingSupplierConfigs.add(lastOk.supplier || 'Fornitore non indicato');
      continue;
    }

    const referenceDate = normalizeIsoDate(lastOk.okDate || lastOk.insertionDate);
    const availabilityReferenceDate = normalizeIsoDate(lastOk.supplyStartDate) || referenceDate;
    if (!referenceDate || !availabilityReferenceDate) continue;
    const availableDate = availabilityDate(availabilityReferenceDate, months);
    if (!availableDate || availableDate > today) continue;

    const laterAttempts = events
      .filter((event) => compareEvents(event, lastOk) > 0)
      .filter((event) => normalizeIsoDate(event.insertionDate) >= availableDate)
      .sort(compareEvents);
    const pendingAttempts = laterAttempts.filter((event) =>
      PENDING_STATUSES.has(normalizeText(event.status))
    );
    const pending = pendingAttempts.at(-1) || null;
    const clientId = Number(lastOk.clientId) || Number(lastOk.contractClientId) || 0;
    const client = clientsById.get(clientId);
    const ownerAgentId = Number(client?.agenteId) || Number(lastOk.agentId) || 0;
    const ownerAgent = agentsById.get(ownerAgentId);

    opportunities.push({
      utilityKey,
      type: lastOk.type,
      code: lastOk.code,
      clientId,
      clientName: client?.ragioneSociale || lastOk.clientName || lastOk.supplyClientName || '',
      agentId: ownerAgentId,
      agentName: ownerAgent?.nome || lastOk.agentName || '',
      lastOkContractId: lastOk.contractId,
      lastOkSupplyId: lastOk.supplyId,
      lastSupplier: lastOk.supplier,
      lastSupplierId: Number(supplier?.id) || 0,
      lastOkDate: referenceDate,
      supplyStartDate: normalizeIsoDate(lastOk.supplyStartDate),
      availabilityReferenceDate,
      lastOperation: displayOperation(lastOk.operations),
      switchableMonth: availableDate.slice(0, 7),
      availableDate,
      status: pending ? 'CARICATO' : 'DISPONIBILE',
      pendingContractId: pending?.contractId || null,
      pendingSupplyId: pending?.supplyId || null,
      pendingSupplier: pending?.supplier || '',
      pendingAgentId: Number(pending?.agentId) || 0,
      pendingAgentName: pending?.agentName || agentsById.get(Number(pending?.agentId))?.nome || '',
      pendingDate: pending?.insertionDate || '',
      pendingRawStatus: pending?.status || '',
      pendingAttempts: pendingAttempts.length,
    });
  }

  opportunities.sort(
    (left, right) =>
      left.availableDate.localeCompare(right.availableDate) ||
      left.clientName.localeCompare(right.clientName, 'it') ||
      left.code.localeCompare(right.code, 'it')
  );

  return {
    generatedAt: new Date().toISOString(),
    opportunities,
    diagnostics: {
      utilitiesEvaluated: eventsByUtility.size,
      missingSupplierConfigs: [...missingSupplierConfigs].sort((a, b) => a.localeCompare(b, 'it')),
    },
  };
}

function expandContractEvents(contract) {
  const supplies = Array.isArray(contract.forniture) ? contract.forniture : [];
  if (supplies.length) {
    return supplies.map((supply) => eventFromSupply(contract, supply)).filter(Boolean);
  }

  const events = [];
  const type = normalizeText(contract.tipoFornitura);
  if (type === 'luce' || type === 'dual') {
    for (const code of extractCodes(contract.pod, 'POD')) {
      events.push(eventFromLegacy(contract, 'luce', code, contract.statoLuce));
    }
  }
  if (type === 'gas' || type === 'dual') {
    for (const code of extractCodes(contract.pdr, 'PDR')) {
      events.push(eventFromLegacy(contract, 'gas', code, contract.statoGas));
    }
  }
  return events;
}

function eventFromSupply(contract, supply) {
  const type = normalizeText(supply.tipoFornitura);
  if (type !== 'luce' && type !== 'gas') return null;
  const code = normalizeCode(type === 'luce' ? supply.pod : supply.pdr);
  return baseEvent(contract, {
    supplyId: Number(supply.id) || 0,
    clientId: Number(supply.clienteId) || 0,
    supplyClientName: supply.intestatario || '',
    type,
    code,
    status: supply.stato,
    okDate: supply.dataSwitchOk,
  });
}

function eventFromLegacy(contract, type, code, status) {
  return baseEvent(contract, {
    supplyId: 0,
    clientId: Number(contract.clienteId) || 0,
    supplyClientName: contract.ragioneSociale || '',
    type,
    code,
    status: status || contract.statoContratto,
    okDate: contract.dataSwitchOk || contract.dataInserimento,
  });
}

function baseEvent(contract, supply) {
  return {
    contractId: Number(contract.id) || 0,
    contractClientId: Number(contract.clienteId) || 0,
    supplyId: supply.supplyId,
    clientId: supply.clientId,
    clientName: contract.ragioneSociale || '',
    supplyClientName: supply.supplyClientName,
    agentId: Number(contract.agenteId) || 0,
    agentName: contract.agenteNome || '',
    supplier: String(contract.fornitore || '').trim(),
    operations: normalizedOperations(contract.tipoOperazione),
    insertionDate: normalizeIsoDate(contract.dataInserimento),
    supplyStartDate: normalizeIsoDate(contract.dataInizioFornitura),
    okDate: normalizeIsoDate(supply.okDate),
    type: supply.type,
    code: supply.code,
    status: supply.status || contract.statoContratto,
  };
}

function hasEligibleOperation(contract) {
  return normalizedOperations(contract?.tipoOperazione).some((operation) =>
    ELIGIBLE_OPERATIONS.has(operation)
  );
}

function normalizedOperations(value) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values.map(normalizeText).filter(Boolean);
}

function displayOperation(operations) {
  const operation = (operations || []).find((value) => ELIGIBLE_OPERATIONS.has(value)) || '';
  if (operation === 'subentro') return 'Subentro + Switch';
  if (operation === 'switch + voltura') return 'Switch + Voltura';
  return operation === 'switch' ? 'Switch' : operation;
}

function canonicalStatus(value) {
  const status = normalizeText(value);
  if (status === 'ok') return 'OK';
  if (PENDING_STATUSES.has(status)) return 'CARICATO';
  if (status === 'k.o.' || status === 'ko' || status === 'switch - out') return 'KO';
  if (status === 'bozza') return 'BOZZA';
  return status.toUpperCase();
}

function availabilityDate(referenceDate, months) {
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(referenceDate || '');
  if (!match) return '';
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1 + months, 15));
  return date.toISOString().slice(0, 10);
}

function compareOkEvents(left, right) {
  return (
    String(left.okDate || left.insertionDate || '').localeCompare(
      String(right.okDate || right.insertionDate || '')
    ) || compareEvents(left, right)
  );
}

function compareEvents(left, right) {
  return (
    String(left.insertionDate || '').localeCompare(String(right.insertionDate || '')) ||
    Number(left.contractId) - Number(right.contractId) ||
    Number(left.supplyId) - Number(right.supplyId)
  );
}

function extractCodes(value, label) {
  return String(value || '')
    .split(/[\n,;]+/)
    .map((part) => part.replace(new RegExp(`^\\s*${label}\\s*\\d*\\s*:\\s*`, 'i'), ''))
    .map(normalizeCode)
    .filter(Boolean);
}

function normalizeCode(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function normalizeIsoDate(value) {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(String(value || '').trim());
  return match ? match[1] : '';
}

function toNonNegativeInteger(value) {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number : null;
}

function toNumericMap(value) {
  if (value instanceof Map) return value;
  return new Map((value || []).map((row) => [Number(row.id), row]));
}

module.exports = {
  ELIGIBLE_OPERATIONS,
  availabilityDate,
  buildSwitchOpportunities,
  canonicalStatus,
  expandContractEvents,
};
