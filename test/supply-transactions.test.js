'use strict';

process.env.BASEROW_TABLE_FORNITURE_ID = '999001';

const { describe, it, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { createContractSupplies, syncContractSupplies, writableBaserowValue } = require('../server');

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

describe('persistenza transazionale forniture', () => {
  it('normalizza select e link per i payload di compensazione', () => {
    assert.equal(writableBaserowValue({ value: 'OK' }), 'OK');
    assert.deepEqual(writableBaserowValue([{ id: 42, value: 'CRM-42' }]), [42]);
  });

  it('elimina la prima fornitura se la seconda creazione Dual fallisce', async () => {
    const calls = [];
    global.fetch = async (url, options = {}) => {
      const method = options.method || 'GET';
      calls.push({ method, body: options.body ? JSON.parse(options.body) : null });
      if (method === 'POST' && calls.filter((call) => call.method === 'POST').length === 1) {
        return response({ id: 501 });
      }
      if (method === 'POST') return response({ detail: 'gas failed' }, 500);
      if (method === 'DELETE') return response(null, 204);
      return response({ detail: 'not found' }, 404);
    };

    await assert.rejects(
      createContractSupplies(
        {
          ragioneSociale: 'TEST DUAL',
          tipoFornitura: 'dual',
          pod: 'IT001',
          pdr: '123',
          metodoPagamentoLuce: 'rid',
          metodoPagamentoGas: 'bollettino',
          statoLuce: 'OK',
          statoGas: 'Caricato',
        },
        42,
        'Caricato'
      )
    );

    assert.deepEqual(
      calls.map((call) => call.method),
      ['POST', 'POST', 'DELETE']
    );
  });

  it('ripristina la fornitura Luce se l aggiornamento Gas fallisce', async () => {
    const patches = [];
    const rows = [
      supplyRow(701, 'luce', 'OK', 'rid'),
      supplyRow(702, 'gas', 'Caricato', 'bollettino'),
    ];

    global.fetch = async (_url, options = {}) => {
      const method = options.method || 'GET';
      if (method === 'GET') return response({ count: 2, next: null, results: rows });
      if (method === 'PATCH') {
        const payload = JSON.parse(options.body);
        patches.push(payload);
        if (patches.length === 2) return response({ detail: 'gas failed' }, 500);
        return response({ id: 701, ...payload });
      }
      return response({ detail: 'not found' }, 404);
    };

    await assert.rejects(
      syncContractSupplies(
        {
          ragioneSociale: 'TEST DUAL',
          tipoFornitura: 'dual',
          pod: 'IT002',
          pdr: '456',
          metodoPagamentoLuce: 'bollettino',
          metodoPagamentoGas: 'rid',
          statoLuce: 'Inviato',
          statoGas: 'OK',
        },
        42,
        'Caricato'
      )
    );

    assert.equal(patches.length, 3);
    assert.equal(patches[0].stato, 'Inviato');
    assert.equal(patches[2].stato, 'OK');
    assert.equal(patches[2].metodo_pagamento, 'rid');
    assert.deepEqual(patches[2].contratto, [42]);
  });
});

function supplyRow(id, type, status, payment) {
  return {
    id,
    nome: `TEST - ${type.toUpperCase()}`,
    contratto: [{ id: 42, value: 'CRM-42' }],
    tipo_fornitura: { value: type },
    stato: { value: status },
    metodo_pagamento: { value: payment },
    pod: type === 'luce' ? 'IT001' : '',
    pdr: type === 'gas' ? '123' : '',
    metodo_inserimento: null,
    potenza_impegnata: null,
    potenza_disponibile: null,
    consumo_annuo: null,
  };
}

function response(body, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return body;
    },
    async text() {
      return body === null ? '' : JSON.stringify(body);
    },
  });
}
