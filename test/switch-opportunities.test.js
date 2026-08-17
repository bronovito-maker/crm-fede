'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  availabilityDate,
  buildSwitchOpportunities,
  canonicalStatus,
} = require('../switch-opportunities');

const suppliers = [
  { id: 1, name: 'Estra', switchDelayMonths: 4 },
  { id: 2, name: 'Enel', switchDelayMonths: 3 },
  { id: 3, name: 'Eni', switchDelayMonths: 5 },
  { id: 4, name: 'Hera', switchDelayMonths: 0 },
];

describe('switch disponibili', () => {
  it('calcola sempre il giorno 15 del mese risultante', () => {
    assert.equal(availabilityDate('2026-04-02', 4), '2026-08-15');
    assert.equal(availabilityDate('2026-04-30', 4), '2026-08-15');
  });

  it('calcola lo storno dall ingresso in fornitura e non dalla data OK', () => {
    const row = contract(1, '2026-04-10', 'Estra', 'OK', {
      okDate: '2026-04-20',
      supplyStartDate: '2026-06-01',
    });
    const result = calculate([row], '2026-10-15');
    assert.equal(result.opportunities[0].lastOkDate, '2026-04-20');
    assert.equal(result.opportunities[0].availabilityReferenceDate, '2026-06-01');
    assert.equal(result.opportunities[0].availableDate, '2026-10-15');
  });

  it('non conta due volte i due mesi di ingresso in fornitura Hera', () => {
    const row = contract(1, '2026-05-10', 'Hera', 'OK', {
      okDate: '2026-07-01',
      supplyStartDate: '2026-07-01',
    });
    const result = calculate([row], '2026-07-15');
    assert.equal(result.opportunities[0].availabilityReferenceDate, '2026-07-01');
    assert.equal(result.opportunities[0].availableDate, '2026-07-15');
  });

  it('normalizza gli stati pendenti storici', () => {
    assert.equal(canonicalStatus('Caricato'), 'CARICATO');
    assert.equal(canonicalStatus('Inviato'), 'CARICATO');
    assert.equal(canonicalStatus('In avanzamento'), 'CARICATO');
    assert.equal(canonicalStatus('K.O.'), 'KO');
  });

  it('mantiene il vecchio OK quando un tentativo successivo va in KO', () => {
    const result = calculate([
      contract(1, '2026-04-10', 'Estra', 'OK'),
      contract(2, '2026-08-20', 'Enel', 'K.O.'),
    ]);
    assert.equal(result.opportunities.length, 1);
    assert.equal(result.opportunities[0].lastOkContractId, 1);
    assert.equal(result.opportunities[0].availableDate, '2026-08-15');
    assert.equal(result.opportunities[0].status, 'DISPONIBILE');
  });

  it('mostra CARICATO finche un nuovo tentativo e pendente', () => {
    const result = calculate([
      contract(1, '2026-04-10', 'Estra', 'OK'),
      contract(2, '2026-08-20', 'Enel', 'Inviato'),
    ]);
    assert.equal(result.opportunities[0].status, 'CARICATO');
    assert.equal(result.opportunities[0].pendingContractId, 2);
  });

  it('un nuovo OK fa ripartire il ciclo e nasconde la vecchia disponibilita', () => {
    const result = calculate([
      contract(1, '2026-04-10', 'Estra', 'OK'),
      contract(2, '2026-08-25', 'Eni', 'OK', { okDate: '2026-08-30' }),
    ]);
    assert.equal(result.opportunities.length, 0);
  });

  it('ignora completamente i cambi listino', () => {
    const result = calculate([
      contract(1, '2026-04-10', 'Estra', 'OK'),
      contract(2, '2026-09-01', 'Enel', 'OK', { operation: 'cambio listino' }),
    ]);
    assert.equal(result.opportunities[0].lastOkContractId, 1);
  });

  it('supporta subentro come Subentro + Switch', () => {
    const result = calculate([contract(1, '2026-04-10', 'Estra', 'OK', { operation: 'subentro' })]);
    assert.equal(result.opportunities[0].lastOperation, 'Subentro + Switch');
  });

  it('genera una sola riga per ogni POD e PDR multipunto', () => {
    const multi = contract(1, '2026-04-10', 'Estra', 'OK');
    multi.tipoFornitura = 'dual';
    multi.forniture = [
      supply(11, 'luce', 'IT001', 'OK', '2026-04-10'),
      supply(12, 'luce', 'IT002', 'OK', '2026-04-10'),
      supply(13, 'luce', 'IT003', 'OK', '2026-04-10'),
      supply(14, 'luce', 'IT004', 'OK', '2026-04-10'),
      supply(15, 'luce', 'IT005', 'OK', '2026-04-10'),
      supply(16, 'gas', '012345', 'OK', '2026-04-10'),
    ];
    const result = calculate([multi]);
    assert.equal(result.opportunities.length, 6);
    assert.equal(new Set(result.opportunities.map((row) => row.utilityKey)).size, 6);
  });

  it('usa il fallback del padre per i contratti storici senza forniture', () => {
    const legacy = contract(1, '2026-04-10', 'Estra', 'OK');
    legacy.forniture = [];
    legacy.pod = 'POD 1: it001\nPOD 2: it002';
    const result = calculate([legacy]);
    assert.deepEqual(
      result.opportunities.map((row) => row.code),
      ['IT001', 'IT002']
    );
  });

  it('non espone utenze prima del 15 e le mantiene nei mesi successivi', () => {
    const rows = [contract(1, '2026-04-10', 'Estra', 'OK')];
    assert.equal(calculate(rows, '2026-08-14').opportunities.length, 0);
    assert.equal(calculate(rows, '2026-08-15').opportunities.length, 1);
    assert.equal(calculate(rows, '2026-11-20').opportunities.length, 1);
  });

  it('segnala e non pubblica fornitori privi di configurazione', () => {
    const result = calculate([contract(1, '2026-04-10', 'Sconosciuto', 'OK')]);
    assert.equal(result.opportunities.length, 0);
    assert.deepEqual(result.diagnostics.missingSupplierConfigs, ['Sconosciuto']);
  });
});

function calculate(contracts, today = '2026-11-20') {
  return buildSwitchOpportunities(contracts, suppliers, {
    today,
    clientsById: [{ id: 91, ragioneSociale: 'Mario Rossi', agenteId: 7 }],
    agentsById: [{ id: 7, nome: 'Luca Bianchi' }],
  });
}

function contract(id, date, supplier, status, options = {}) {
  return {
    id,
    agenteId: 7,
    agenteNome: 'Luca Bianchi',
    clienteId: 91,
    ragioneSociale: 'Mario Rossi',
    dataInserimento: date,
    dataInizioFornitura: options.supplyStartDate || date,
    fornitore: supplier,
    tipoOperazione: [options.operation || 'switch'],
    tipoFornitura: 'luce',
    pod: 'IT001',
    statoContratto: status,
    statoLuce: status,
    forniture: [supply(id * 10, 'luce', 'IT001', status, options.okDate)],
  };
}

function supply(id, type, code, status, okDate = '') {
  return {
    id,
    clienteId: 91,
    intestatario: 'Mario Rossi',
    tipoFornitura: type,
    pod: type === 'luce' ? code : '',
    pdr: type === 'gas' ? code : '',
    stato: status,
    dataSwitchOk: okDate || (status === 'OK' ? '2026-04-10' : ''),
  };
}
