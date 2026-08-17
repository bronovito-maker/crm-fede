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

  it('crea una riga distinta per ogni punto multipunto', async () => {
    const payloads = [];
    global.fetch = async (_url, options = {}) => {
      const payload = JSON.parse(options.body);
      payloads.push(payload);
      return response({ id: 800 + payloads.length, ...payload });
    };

    const created = await createContractSupplies(
      {
        ragioneSociale: 'TEST MULTIPUNTO',
        tipoFornitura: 'dual',
        puntiFornitura: [
          {
            tipoFornitura: 'luce',
            codice: 'IT001',
            indirizzoFornitura: 'VIA UNO',
            potenzaImpegnata: 3,
            consumoAnnuo: 3100,
          },
          {
            tipoFornitura: 'luce',
            codice: 'IT002',
            indirizzoFornitura: 'VIA DUE',
            potenzaImpegnata: 6,
            consumoAnnuo: 5200,
          },
          {
            tipoFornitura: 'gas',
            codice: '000123',
            indirizzoFornitura: 'VIA TRE',
            consumoAnnuo: 850,
          },
        ],
        metodoPagamento: 'rid',
        consumoAnnuoLuce: 4200,
        consumoAnnuoGas: 900,
        statoLuce: 'OK',
        statoGas: 'Caricato',
      },
      42,
      'Caricato',
      91
    );

    assert.equal(created.length, 3);
    assert.deepEqual(
      payloads.map((payload) => payload.pod || payload.pdr),
      ['IT001', 'IT002', '000123']
    );
    assert.deepEqual(
      payloads.map((payload) => payload.cliente),
      [[91], [91], [91]]
    );
    assert.equal(payloads[0].potenza_disponibile, 3.3);
    assert.equal(payloads[1].potenza_disponibile, 6.6);
    assert.deepEqual(
      payloads.map((payload) => payload.consumo_annuo),
      [3100, 5200, 850]
    );
    assert.deepEqual(
      payloads.map((payload) => payload.metodo_pagamento),
      ['rid', 'rid', 'rid']
    );
  });

  it('in modifica unifica il pagamento senza alterare gli stati delle forniture', async () => {
    const patches = [];
    const rows = [
      supplyRow(701, 'luce', 'OK', 'bollettino'),
      supplyRow(702, 'gas', 'K.O.', 'bollettino'),
    ];

    global.fetch = async (_url, options = {}) => {
      const method = options.method || 'GET';
      if (method === 'GET') return response({ count: 2, next: null, results: rows });
      if (method === 'PATCH') {
        const payload = JSON.parse(options.body);
        patches.push(payload);
        return response({ id: 700 + patches.length, ...payload });
      }
      return response({ detail: 'not found' }, 404);
    };

    await syncContractSupplies(
      {
        ragioneSociale: 'TEST DUAL',
        tipoFornitura: 'dual',
        puntiFornitura: [
          { id: 701, tipoFornitura: 'luce', codice: 'IT001', indirizzoFornitura: 'VIA UNO' },
          { id: 702, tipoFornitura: 'gas', codice: '123', indirizzoFornitura: 'VIA DUE' },
        ],
        metodoPagamento: 'rid',
        hasExplicitSupplyStatuses: false,
      },
      42,
      'Caricato'
    );

    assert.deepEqual(
      patches.map((payload) => payload.stato),
      ['OK', 'K.O.']
    );
    assert.deepEqual(
      patches.map((payload) => payload.metodo_pagamento),
      ['rid', 'rid']
    );
  });

  it('porta le forniture da Bozza a Caricato al primo invio', async () => {
    const patches = [];
    const rows = [supplyRow(701, 'luce', 'Bozza', 'bollettino')];

    global.fetch = async (_url, options = {}) => {
      const method = options.method || 'GET';
      if (method === 'GET') return response({ count: 1, next: null, results: rows });
      if (method === 'PATCH') {
        const payload = JSON.parse(options.body);
        patches.push(payload);
        return response({ id: 701, ...payload });
      }
      return response({ detail: 'not found' }, 404);
    };

    await syncContractSupplies(
      {
        ragioneSociale: 'TEST LUCE',
        tipoFornitura: 'luce',
        puntiFornitura: [
          { id: 701, tipoFornitura: 'luce', codice: 'IT001', indirizzoFornitura: 'VIA UNO' },
        ],
        metodoPagamento: 'bollettino',
        hasExplicitSupplyStatuses: false,
      },
      42,
      'Caricato'
    );

    assert.equal(patches[0].stato, 'Caricato');
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
          hasExplicitSupplyStatuses: true,
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
