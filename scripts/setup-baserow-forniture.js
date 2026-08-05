'use strict';

require('dotenv').config();

const baseUrl = process.env.BASEROW_BASE_URL || 'https://api.baserow.io';
const jwtToken = process.env.BASEROW_JWT_TOKEN || '';
const suppliesTableId = Number(process.env.BASEROW_TABLE_FORNITURE_ID || 1117525);
const contractsTableId = Number(process.env.BASEROW_TABLE_CONTRATTI_ID || 925638);
const agentsTableId = Number(process.env.BASEROW_TABLE_AGENTI_ID || 925635);

async function api(method, pathname, body) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      Authorization: `JWT ${jwtToken}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${method} ${pathname}: HTTP ${response.status} ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

async function ensureField(fields, spec, tableId = suppliesTableId) {
  const existing = fields.find((field) => field.name === spec.name);
  if (existing) {
    console.log(`${spec.name}: gia presente`);
    return existing;
  }
  const created = await api('POST', `/api/database/fields/table/${tableId}/`, spec);
  fields.push(created);
  console.log(`${spec.name}: creato`);
  return created;
}

async function run() {
  if (!jwtToken) {
    throw new Error('Imposta BASEROW_JWT_TOKEN con un JWT temporaneo Admin/Builder.');
  }

  const contractFields = await api('GET', `/api/database/fields/table/${contractsTableId}/`);
  await ensureField(
    contractFields,
    {
      name: 'codice_crm',
      type: 'formula',
      formula: "concat('CRM-', row_id())",
    },
    contractsTableId
  );

  const fields = await api('GET', `/api/database/fields/table/${suppliesTableId}/`);
  const primary = fields.find((field) => field.primary);
  if (primary && primary.name !== 'nome') {
    await api('PATCH', `/api/database/fields/${primary.id}/`, { name: 'nome' });
    primary.name = 'nome';
    console.log('Campo primario rinominato in nome');
  }

  await ensureField(fields, {
    name: 'contratto',
    type: 'link_row',
    link_row_table_id: contractsTableId,
    has_related_field: true,
  });
  await ensureField(fields, {
    name: 'tipo_fornitura',
    type: 'single_select',
    select_options: [
      { value: 'luce', color: 'light-yellow' },
      { value: 'gas', color: 'light-blue' },
    ],
  });
  await ensureField(fields, {
    name: 'stato',
    type: 'single_select',
    select_options: [
      { value: 'Bozza', color: 'light-gray' },
      { value: 'Caricato', color: 'light-orange' },
      { value: 'Inviato', color: 'light-blue' },
      { value: 'OK', color: 'light-green' },
      { value: 'K.O.', color: 'light-red' },
      { value: 'Switch - Out', color: 'red' },
    ],
  });
  await ensureField(fields, {
    name: 'metodo_pagamento',
    type: 'single_select',
    select_options: [
      { value: 'bollettino', color: 'light-orange' },
      { value: 'rid', color: 'light-green' },
    ],
  });
  await ensureField(fields, { name: 'pod', type: 'text' });
  await ensureField(fields, { name: 'pdr', type: 'text' });
  await ensureField(fields, {
    name: 'metodo_inserimento',
    type: 'single_select',
    select_options: [
      { value: 'AppAround', color: 'light-blue' },
      { value: 'Cartaceo', color: 'light-orange' },
    ],
  });
  await ensureField(fields, {
    name: 'potenza_impegnata',
    type: 'number',
    number_decimal_places: 2,
    number_negative: false,
  });
  await ensureField(fields, {
    name: 'potenza_disponibile',
    type: 'number',
    number_decimal_places: 2,
    number_negative: false,
  });
  await ensureField(fields, {
    name: 'consumo_annuo',
    type: 'number',
    number_decimal_places: 2,
    number_negative: false,
  });

  const agentFields = await api('GET', `/api/database/fields/table/${agentsTableId}/`);
  const roleField = agentFields.find((field) => field.name === 'ruolo');
  if (!roleField) throw new Error('Campo Agenti.ruolo non trovato.');
  if (!roleField.select_options.some((option) => option.value === 'spettatore')) {
    await api('PATCH', `/api/database/fields/${roleField.id}/`, {
      select_options: [
        ...roleField.select_options.map(({ id, value, color }) => ({ id, value, color })),
        { value: 'spettatore', color: 'light-gray' },
      ],
    });
    console.log('Ruolo spettatore aggiunto');
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
