#!/usr/bin/env node
require('dotenv').config();

const CONFIG = {
  baserowBaseUrl: process.env.BASEROW_BASE_URL || 'https://api.baserow.io',
  baserowToken: process.env.BASEROW_TOKEN || '',
  contrattiTableId: process.env.BASEROW_TABLE_CONTRATTI_ID || '',
};

const PAGE_SIZE = 200;
const APPLY = process.argv.includes('--apply');

function cleanText(value) {
  return String(value || '').trim();
}

function normalizeCompetenceMonth(value) {
  const text = cleanText(value);
  if (/^\d{4}-\d{2}$/.test(text)) return text;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text.slice(0, 7);
  return '';
}

function monthFromInsertionDate(value) {
  const text = cleanText(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text.slice(0, 7) : '';
}

function quarterFromMonthKey(monthKey) {
  const [yearRaw, monthRaw] = monthKey.split('-').map(Number);
  return `${yearRaw}-Q${Math.floor((monthRaw - 1) / 3) + 1}`;
}

async function baserowFetch(pathname, options = {}) {
  if (!CONFIG.baserowToken || !CONFIG.contrattiTableId) {
    throw new Error('Configurazione Baserow mancante: controlla BASEROW_TOKEN e BASEROW_TABLE_CONTRATTI_ID.');
  }

  const response = await fetch(`${CONFIG.baserowBaseUrl}${pathname}`, {
    ...options,
    headers: {
      Authorization: `Token ${CONFIG.baserowToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Baserow API ${response.status}: ${body}`);
  }

  return response.json();
}

async function fetchAllContracts() {
  const results = [];
  let page = 1;

  while (true) {
    const params = new URLSearchParams({
      user_field_names: 'true',
      size: String(PAGE_SIZE),
      page: String(page),
      order_by: '-data_inserimento',
    });
    const payload = await baserowFetch(
      `/api/database/rows/table/${CONFIG.contrattiTableId}/?${params.toString()}`
    );
    results.push(...(payload.results || []));
    if (!payload.next) break;
    page += 1;
  }

  return results;
}

function getContractsToFix(rows) {
  return rows
    .map((row) => {
      const insertionMonth = monthFromInsertionDate(row.data_inserimento);
      const competenceMonth = normalizeCompetenceMonth(row.mese_riferimento);
      if (!row.id || !insertionMonth || !competenceMonth) return null;
      if (competenceMonth >= insertionMonth) return null;

      return {
        id: Number(row.id),
        customer: cleanText(row.ragione_sociale) || 'Cliente senza nome',
        contractId: cleanText(row.id_contratto),
        insertionDate: cleanText(row.data_inserimento),
        fromMonth: competenceMonth,
        toMonth: insertionMonth,
        toQuarter: quarterFromMonthKey(insertionMonth),
        toYear: insertionMonth.slice(0, 4),
      };
    })
    .filter(Boolean);
}

async function updateContract(contract) {
  return baserowFetch(
    `/api/database/rows/table/${CONFIG.contrattiTableId}/${contract.id}/?user_field_names=true`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        mese_riferimento: contract.toMonth,
        trimestre_riferimento: contract.toQuarter,
        anno_riferimento: contract.toYear,
      }),
    }
  );
}

async function main() {
  const rows = await fetchAllContracts();
  const contractsToFix = getContractsToFix(rows);

  if (!contractsToFix.length) {
    console.log('Nessun contratto da correggere.');
    return;
  }

  console.log(`Contratti da correggere: ${contractsToFix.length}`);
  contractsToFix.forEach((contract) => {
    const contractSuffix = contract.contractId ? ` [${contract.contractId}]` : '';
    console.log(
      `- #${contract.id}${contractSuffix} ${contract.customer}: ${contract.fromMonth} -> ${contract.toMonth} (data inserimento ${contract.insertionDate})`
    );
  });

  if (!APPLY) {
    console.log('\nDry run completato. Esegui con --apply per applicare le correzioni.');
    return;
  }

  for (const contract of contractsToFix) {
    await updateContract(contract);
  }

  console.log(`\nCorrezione completata. Aggiornati ${contractsToFix.length} contratti.`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
