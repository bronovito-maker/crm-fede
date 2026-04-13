'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { Duplex } = require('node:stream');

const {
  app,
  agentToBaserowPayload,
  SqliteSessionStore,
  buildAdminStats,
  contractCommissionValue,
  contractCompetenceMonth,
  contractUnitCount,
  createSession,
  fileValue,
  fetchAllRows,
  getCachedWithStore,
  handleApiError,
  integerValue,
  invalidateAdminStatsCache,
  invalidateContractsCache,
  isCurrentAgentContract,
  isAllowedContractFile,
  isValidVatOrFiscalCode,
  linkedAgentId,
  multiSelectValue,
  normalizeAgent,
  normalizeCompetenceMonth,
  normalizeContract,
  normalizeStatus,
  numberValue,
  selectValue,
  publicAgent,
  todayIsoDate,
} = require('../server');

describe('contractUnitCount', () => {
  it('conta 2 per dual + prospect', () => {
    assert.equal(contractUnitCount({ tipoFornitura: 'dual', categoriaCliente: 'prospect' }), 2);
  });

  it('conta 1 per dual + switch ricorrente', () => {
    assert.equal(
      contractUnitCount({ tipoFornitura: 'dual', categoriaCliente: 'switch ricorrente' }),
      1
    );
  });

  it('conta 1 per luce + prospect', () => {
    assert.equal(contractUnitCount({ tipoFornitura: 'luce', categoriaCliente: 'prospect' }), 1);
  });

  it('usa unitCount pre-calcolato se presente', () => {
    assert.equal(
      contractUnitCount({
        unitCount: 2,
        tipoFornitura: 'luce',
        categoriaCliente: 'switch ricorrente',
      }),
      2
    );
  });
});

describe('contractCommissionValue', () => {
  it('raddoppia la provvigione per dual + prospect', () => {
    assert.equal(
      contractCommissionValue({
        cbMaturata: 85,
        tipoFornitura: 'dual',
        categoriaCliente: 'prospect',
      }),
      170
    );
  });

  it('usa commissionValue pre-calcolato se presente', () => {
    assert.equal(
      contractCommissionValue({
        commissionValue: 170,
        cbMaturata: 85,
        tipoFornitura: 'luce',
        categoriaCliente: 'switch ricorrente',
      }),
      170
    );
  });
});

describe('buildAdminStats', () => {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = `${year}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const quarter = `${year}-Q${Math.floor(now.getMonth() / 3) + 1}`;

  const agents = [
    {
      id: 1,
      nome: 'Mario Rossi',
      email: 'mario@example.it',
      ruolo: 'agente',
      attivo: true,
      targetMensile: 5,
      targetTrimestrale: 12,
      targetAnnuale: 48,
    },
  ];

  it('calcola conteggi ponderati e CB corretti', () => {
    const contracts = [
      {
        agenteId: 1,
        dataInserimento: `${month}-02`,
        trimestreRiferimento: quarter,
        annoRiferimento: year,
        statoContratto: 'OK',
        tipoFornitura: 'dual',
        categoriaCliente: 'prospect',
        cbMaturata: 85,
      },
      {
        agenteId: 1,
        dataInserimento: `${month}-05`,
        trimestreRiferimento: quarter,
        annoRiferimento: year,
        statoContratto: 'Caricato',
        tipoFornitura: 'luce',
        categoriaCliente: 'prospect',
        cbMaturata: 85,
      },
      {
        agenteId: 1,
        dataInserimento: `${month}-06`,
        trimestreRiferimento: quarter,
        annoRiferimento: year,
        statoContratto: 'K.O.',
        tipoFornitura: 'gas',
        categoriaCliente: 'switch ricorrente',
        cbMaturata: 0,
      },
    ];

    const result = buildAdminStats(agents, contracts);

    assert.equal(result.totals.contracts, 4);
    assert.equal(result.totals.ok, 2);
    assert.equal(result.totals.caricati, 1);
    assert.equal(result.totals.ko, 1);
    assert.equal(result.totals.cbValidata, 170);
    assert.equal(result.totals.cbPotenziale, 255);

    assert.equal(result.agents[0].contratti, 4);
    assert.equal(result.agents[0].ok, 2);
    assert.equal(result.agents[0].caricati, 1);
    assert.equal(result.agents[0].cbValidata, 170);
    assert.equal(result.agents[0].cbPotenziale, 255);
    assert.equal(result.agents[0].percentualeTargetMensile, 40);
  });

  it('separa correttamente mese trimestre e anno nei target admin', () => {
    const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 10);
    const previousMonth = `${previousMonthDate.getFullYear()}-${String(previousMonthDate.getMonth() + 1).padStart(2, '0')}`;
    const previousQuarter = `${year}-Q${Math.max(1, Math.floor((now.getMonth() - 3) / 3) + 1)}`;

    const agentsWithSecondRow = [
      ...agents,
      {
        id: 2,
        nome: 'Laura Verdi',
        email: 'laura@example.it',
        ruolo: 'agente',
        attivo: true,
        targetMensile: 4,
        targetTrimestrale: 9,
        targetAnnuale: 36,
      },
    ];

    const contracts = [
      {
        agenteId: 1,
        dataInserimento: `${month}-03`,
        trimestreRiferimento: quarter,
        annoRiferimento: year,
        statoContratto: 'OK',
        tipoFornitura: 'luce',
        categoriaCliente: 'prospect',
        cbMaturata: 85,
      },
      {
        agenteId: 1,
        dataInserimento: `${previousMonth}-11`,
        trimestreRiferimento: quarter,
        annoRiferimento: year,
        statoContratto: 'OK',
        tipoFornitura: 'dual',
        categoriaCliente: 'prospect',
        cbMaturata: 85,
      },
      {
        agenteId: 1,
        dataInserimento: `${year}-01-08`,
        trimestreRiferimento: previousQuarter,
        annoRiferimento: year,
        statoContratto: 'OK',
        tipoFornitura: 'gas',
        categoriaCliente: 'switch ricorrente',
        cbMaturata: 85,
      },
      {
        agenteId: 1,
        dataInserimento: `${month}-12`,
        trimestreRiferimento: quarter,
        annoRiferimento: year,
        statoContratto: 'Switch - Out',
        tipoFornitura: 'luce',
        categoriaCliente: 'switch ricorrente',
        cbMaturata: 0,
      },
    ];

    const result = buildAdminStats(agentsWithSecondRow, contracts);
    const mario = result.agents.find((agent) => agent.id === 1);
    const laura = result.agents.find((agent) => agent.id === 2);

    assert.equal(result.totals.contracts, 2);
    assert.equal(result.totals.ok, 1);
    assert.equal(result.totals.switchOut, 1);
    assert.equal(mario.ok, 1);
    assert.equal(mario.okTrimestre, 3);
    assert.equal(mario.okAnno, 4);
    assert.equal(mario.percentualeTargetMensile, 20);
    assert.equal(mario.percentualeTargetTrimestrale, 25);
    assert.equal(mario.percentualeTargetAnnuale, 8);
    assert.equal(laura.contratti, 0);
    assert.equal(laura.percentualeTargetMensile, 0);
  });

  it('ignora le bozze nei conteggi e nelle statistiche admin', () => {
    const contracts = [
      {
        agenteId: 1,
        dataInserimento: `${month}-02`,
        trimestreRiferimento: quarter,
        annoRiferimento: year,
        statoContratto: 'Bozza',
        tipoFornitura: 'dual',
        categoriaCliente: 'prospect',
        cbMaturata: 85,
      },
      {
        agenteId: 1,
        dataInserimento: `${month}-03`,
        trimestreRiferimento: quarter,
        annoRiferimento: year,
        statoContratto: 'Caricato',
        tipoFornitura: 'luce',
        categoriaCliente: 'prospect',
        cbMaturata: 85,
      },
    ];

    const result = buildAdminStats(agents, contracts);

    assert.equal(result.totals.practices, 1);
    assert.equal(result.totals.contracts, 1);
    assert.equal(result.totals.caricati, 1);
    assert.equal(result.totals.cbPotenziale, 85);
    assert.equal(result.agents[0].pratiche, 1);
    assert.equal(result.agents[0].contratti, 1);
  });

  it('usa mese_riferimento quando presente anche se data_inserimento e nel mese precedente', () => {
    const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 28);
    const previousMonth = `${previousMonthDate.getFullYear()}-${String(previousMonthDate.getMonth() + 1).padStart(2, '0')}`;
    const contracts = [
      {
        agenteId: 1,
        dataInserimento: `${previousMonth}-27`,
        meseRiferimento: month,
        trimestreRiferimento: quarter,
        annoRiferimento: year,
        statoContratto: 'OK',
        tipoFornitura: 'luce',
        categoriaCliente: 'prospect',
        cbMaturata: 85,
      },
    ];

    const result = buildAdminStats(agents, contracts, {
      monthKey: month,
      quarterKey: quarter,
      yearKey: year,
    });

    assert.equal(result.totals.ok, 1);
    assert.equal(result.agents[0].ok, 1);
  });
});

describe('contractCompetenceMonth', () => {
  it('usa mese_riferimento se presente', () => {
    assert.equal(
      contractCompetenceMonth({ meseRiferimento: '2026-05', dataInserimento: '2026-04-30' }),
      '2026-05'
    );
  });

  it('fa fallback su data_inserimento se mese_riferimento manca', () => {
    assert.equal(contractCompetenceMonth({ dataInserimento: '2026-04-30' }), '2026-04');
  });

  it('normalizza mese competenza anche da data completa', () => {
    assert.equal(normalizeCompetenceMonth('2026-04-01'), '2026-04');
  });
});

describe('SqliteSessionStore', () => {
  let dbDir;
  let store;

  beforeEach(() => {
    dbDir = fs.mkdtempSync(path.join(os.tmpdir(), 'volt-crm-sessions-'));
    store = new SqliteSessionStore(path.join(dbDir, 'sessions.db'));
  });

  afterEach(() => {
    if (store && store._db) {
      store._db.close();
    }
    fs.rmSync(dbDir, { recursive: true, force: true });
  });

  it('salva e legge una sessione', () => {
    store.set('token-1', { agentId: 7, email: 'a@example.it', expiresAt: Date.now() + 60_000 });
    assert.deepEqual(store.get('token-1'), {
      agentId: 7,
      email: 'a@example.it',
      expiresAt: store.get('token-1').expiresAt,
    });
  });

  it('touch aggiorna la scadenza', () => {
    const expiresAt = Date.now() + 10_000;
    const nextExpiry = Date.now() + 20_000;
    store.set('token-2', { agentId: 8, email: 'b@example.it', expiresAt });
    store.touch('token-2', nextExpiry);
    assert.equal(store.get('token-2').expiresAt, nextExpiry);
  });

  it('delete rimuove la sessione', () => {
    store.set('token-3', { agentId: 9, email: 'c@example.it', expiresAt: Date.now() + 60_000 });
    store.delete('token-3');
    assert.equal(store.get('token-3'), undefined);
  });

  it('cleanup rimuove le sessioni scadute', () => {
    store.set('token-old', { agentId: 1, email: 'old@example.it', expiresAt: Date.now() - 1_000 });
    store.set('token-new', { agentId: 2, email: 'new@example.it', expiresAt: Date.now() + 60_000 });
    const removed = store.cleanup();
    assert.equal(removed, 1);
    assert.equal(store.get('token-old'), undefined);
    assert.ok(store.get('token-new'));
  });
});

describe('isCurrentAgentContract', () => {
  it('riconosce link row come array di oggetti', () => {
    assert.equal(isCurrentAgentContract({ agente: [{ id: 3 }, { id: 4 }] }, 4), true);
  });

  it('riconosce id semplice numerico o stringa', () => {
    assert.equal(isCurrentAgentContract({ agente: 5 }, 5), true);
    assert.equal(isCurrentAgentContract({ agente: '6' }, 6), true);
  });

  it("nega accesso quando l'agente non corrisponde", () => {
    assert.equal(isCurrentAgentContract({ agente: [{ id: 3 }] }, 9), false);
  });
});

describe('getCachedWithStore', () => {
  it('usa il valore in cache entro il TTL', async () => {
    const store = new Map();
    let calls = 0;

    const first = await getCachedWithStore(
      store,
      'contracts:1',
      async () => {
        calls += 1;
        return ['a'];
      },
      15_000,
      1_000
    );

    const second = await getCachedWithStore(
      store,
      'contracts:1',
      async () => {
        calls += 1;
        return ['b'];
      },
      15_000,
      2_000
    );

    assert.deepEqual(first, ['a']);
    assert.deepEqual(second, ['a']);
    assert.equal(calls, 1);
  });

  it('ricarica il valore dopo la scadenza', async () => {
    const store = new Map();
    let calls = 0;

    await getCachedWithStore(
      store,
      'admin:stats',
      async () => {
        calls += 1;
        return { version: 1 };
      },
      1_000,
      10_000
    );

    const refreshed = await getCachedWithStore(
      store,
      'admin:stats',
      async () => {
        calls += 1;
        return { version: 2 };
      },
      1_000,
      11_500
    );

    assert.deepEqual(refreshed, { version: 2 });
    assert.equal(calls, 2);
  });
});

describe('fetchAllRows', () => {
  it('concatena piu pagine fino a next nullo', async () => {
    const calls = [];
    const rows = await fetchAllRows(
      async (params, page, pageSize) => {
        calls.push({
          page,
          pageSize,
          pageParam: params.get('page'),
          sizeParam: params.get('size'),
        });
        params.set('page', String(page));
        params.set('size', String(pageSize));
        if (page === 1) {
          return {
            count: 3,
            next: '/page/2',
            results: [{ id: 1 }, { id: 2 }],
          };
        }
        return {
          count: 3,
          next: null,
          results: [{ id: 3 }],
        };
      },
      new URLSearchParams({ user_field_names: 'true' }),
      'test rows',
      200,
      100
    );

    assert.deepEqual(rows, [{ id: 1 }, { id: 2 }, { id: 3 }]);
    assert.equal(calls.length, 2);
    assert.equal(calls[0].page, 1);
    assert.equal(calls[1].page, 2);
  });

  it('si ferma se una pagina torna results vuoto', async () => {
    let calls = 0;
    const rows = await fetchAllRows(
      async () => {
        calls += 1;
        return {
          count: 0,
          next: null,
          results: [],
        };
      },
      new URLSearchParams(),
      'empty rows',
      200,
      100
    );

    assert.deepEqual(rows, []);
    assert.equal(calls, 1);
  });
});

describe('helper coverage', () => {
  it('normalizeAgent e publicAgent normalizzano il record agente', () => {
    const normalized = normalizeAgent({
      id: 5,
      nome: '',
      email: '',
      cb_unitaria: '90.5',
      target_mensile: '10',
      target_trimestrale: '30',
      target_annuale: '120',
      ruolo: { value: 'admin' },
      attivo: 0,
      password_hash: 'hash',
    });

    assert.deepEqual(normalized, {
      id: 5,
      nome: 'Agente sconosciuto',
      email: '',
      cbUnitaria: 90.5,
      targetMensile: 10,
      targetTrimestrale: 30,
      targetAnnuale: 120,
      ruolo: 'admin',
      attivo: false,
      passwordHash: 'hash',
    });

    assert.deepEqual(publicAgent(normalized), {
      id: 5,
      nome: 'Agente sconosciuto',
      email: '',
      cbUnitaria: 90.5,
      targetMensile: 10,
      targetTrimestrale: 30,
      targetAnnuale: 120,
      ruolo: 'admin',
      attivo: false,
    });
  });

  it('agentToBaserowPayload aggiunge password_hash solo se presente la password', () => {
    const noPassword = agentToBaserowPayload({
      nome: 'Mario',
      email: 'mario@example.it',
      cbUnitaria: 85,
      targetMensile: 10,
      targetTrimestrale: 30,
      targetAnnuale: 120,
      ruolo: 'agente',
      attivo: true,
      password: '',
    });

    const withPassword = agentToBaserowPayload({
      nome: 'Mario',
      email: 'mario@example.it',
      cbUnitaria: 85,
      targetMensile: 10,
      targetTrimestrale: 30,
      targetAnnuale: 120,
      ruolo: 'agente',
      attivo: true,
      password: 'password123',
    });

    assert.equal('password_hash' in noPassword, false);
    assert.equal(typeof withPassword.password_hash, 'string');
    assert.ok(withPassword.password_hash.length > 20);
  });

  it('agentToBaserowPayload non invia cb_unitaria se il valore non e presente', () => {
    const payload = agentToBaserowPayload({
      nome: 'Mario',
      email: 'mario@example.it',
      cbUnitaria: null,
      targetMensile: 10,
      targetTrimestrale: 30,
      targetAnnuale: 120,
      ruolo: 'agente',
      attivo: true,
      password: '',
    });

    assert.equal('cb_unitaria' in payload, false);
  });

  it('normalizeContract normalizza un record Baserow completo', () => {
    const normalized = normalizeContract({
      id: 7,
      agente: [{ id: 3 }],
      data_inserimento: '2026-04-10',
      id_contratto: '277543',
      ragione_sociale: 'Rossi SRL',
      cellulare: '333',
      tipo_cliente: { value: 'Business' },
      categoria_cliente: { value: 'prospect' },
      fornitore: 'Enel',
      nome_offerta: 'Dual Test',
      tipo_operazione: [{ value: 'switch' }],
      tipo_fornitura: { value: 'dual' },
      pod: 'IT001E123',
      pdr: '123456',
      metodo_pagamento: { value: 'rid' },
      iban: 'IT60X',
      file_contratto: [
        {
          name: 'doc.pdf',
          visible_name: 'Doc.pdf',
          url: 'https://example.com/doc.pdf',
          mime_type: 'application/pdf',
          size: '1024',
        },
      ],
      piva: '03849270121',
      email: 'info@example.it',
      indirizzo_fatturazione: 'Via Milano',
      indirizzo_fornitura: 'Via Torino',
      descrizione: 'Note',
      stato_contratto: { value: 'OK' },
      cb_unitaria_snapshot: '85',
      data_inizio_fornitura: '2026-06-01',
      mese_riferimento: '2026-04',
      trimestre_riferimento: '2026-Q2',
      anno_riferimento: '2026',
    });

    assert.equal(normalized.agenteId, 3);
    assert.equal(normalized.statoContratto, 'OK');
    assert.equal(normalized.unitCount, 2);
    assert.equal(normalized.commissionValue, 170);
    assert.deepEqual(normalized.tipoOperazione, ['switch']);
    assert.equal(normalized.fileContratto[0].visibleName, 'Doc.pdf');
  });

  it('normalizeContract azzera cb maturata implicita per K.O.', () => {
    const normalized = normalizeContract({
      id: 8,
      agente: { id: 4 },
      stato_contratto: { value: 'Inviato' },
      cb_unitaria_snapshot: '85',
      tipo_fornitura: { value: 'gas' },
      categoria_cliente: { value: 'switch ricorrente' },
    });

    assert.equal(normalized.statoContratto, 'Inviato');
    assert.equal(normalized.cbMaturata, 85);
    assert.equal(normalized.commissionValue, 85);
  });

  it('isAllowedContractFile accetta pdf e immagini note', () => {
    assert.equal(
      isAllowedContractFile({ originalname: 'contratto.pdf', mimetype: 'application/pdf' }),
      true
    );
    assert.equal(
      isAllowedContractFile({ originalname: 'foto.heic', mimetype: 'image/heic' }),
      true
    );
    assert.equal(
      isAllowedContractFile({ originalname: 'script.js', mimetype: 'application/javascript' }),
      false
    );
  });

  it('isValidVatOrFiscalCode accetta partita iva o codice fiscale', () => {
    assert.equal(isValidVatOrFiscalCode('03849270121'), true);
    assert.equal(isValidVatOrFiscalCode('RSSMRA85M01H501Z'), true);
    assert.equal(isValidVatOrFiscalCode('123'), false);
  });

  it('linkedAgentId estrae l id nei diversi formati', () => {
    assert.equal(linkedAgentId([{ id: 11 }]), 11);
    assert.equal(linkedAgentId({ id: 12 }), 12);
    assert.equal(linkedAgentId('13'), '13');
    assert.equal(linkedAgentId(null), null);
  });

  it('isCurrentAgentContract copre anche il ramo object singolo', () => {
    assert.equal(isCurrentAgentContract({ agente: { id: 21 } }, 21), true);
  });

  it('selectValue e multiSelectValue normalizzano select e multiselect', () => {
    assert.equal(selectValue({ value: 'OK' }), 'OK');
    assert.equal(selectValue('Caricato'), 'Caricato');
    assert.deepEqual(multiSelectValue([{ value: 'switch' }, { value: 'subentro' }]), [
      'switch',
      'subentro',
    ]);
    assert.deepEqual(multiSelectValue('switch'), ['switch']);
    assert.deepEqual(multiSelectValue(null), []);
  });

  it('fileValue normalizza i metadati file', () => {
    assert.deepEqual(fileValue(null), []);
    assert.deepEqual(
      fileValue([
        {
          name: 'a.pdf',
          visible_name: 'A.pdf',
          url: 'https://x',
          mime_type: 'application/pdf',
          size: '12',
        },
      ]),
      [
        {
          name: 'a.pdf',
          visibleName: 'A.pdf',
          url: 'https://x',
          mimeType: 'application/pdf',
          size: 12,
        },
      ]
    );
  });

  it('numberValue e integerValue fanno fallback a 0', () => {
    assert.equal(numberValue('12.5'), 12.5);
    assert.equal(numberValue('abc'), 0);
    assert.equal(integerValue('12'), 12);
    assert.equal(integerValue('abc'), 0);
  });

  it('normalizeStatus mappa i vecchi stati e defaulta a Caricato', () => {
    assert.equal(normalizeStatus('Bozza'), 'Bozza');
    assert.equal(normalizeStatus('OK'), 'OK');
    assert.equal(normalizeStatus('Inviato'), 'Inviato');
    assert.equal(normalizeStatus('bozza'), 'Bozza');
    assert.equal(normalizeStatus('validato'), 'OK');
    assert.equal(normalizeStatus('inviato'), 'Inviato');
    assert.equal(normalizeStatus('in attesa'), 'Caricato');
    assert.equal(normalizeStatus('scartato'), 'K.O.');
    assert.equal(normalizeStatus('qualcosa'), 'Caricato');
  });

  it('todayIsoDate restituisce una data ISO yyyy-mm-dd', () => {
    assert.match(todayIsoDate(), /^\d{4}-\d{2}-\d{2}$/);
  });

  it('handleApiError gestisce i limiti file', () => {
    const responses = [];
    const res = {
      status(code) {
        responses.push({ code });
        return this;
      },
      json(payload) {
        responses[responses.length - 1].payload = payload;
        return this;
      },
    };

    handleApiError(res, { code: 'LIMIT_FILE_SIZE' }, 'X', 'Y');
    handleApiError(res, { code: 'LIMIT_FILE_COUNT' }, 'X', 'Y');

    assert.deepEqual(responses[0], {
      code: 400,
      payload: { error: 'FILE_TOO_LARGE', message: 'Ogni documento non deve superare 15 MB.' },
    });
    assert.deepEqual(responses[1], {
      code: 400,
      payload: { error: 'TOO_MANY_FILES', message: 'Puoi caricare al massimo 10 documenti.' },
    });
  });

  it('handleApiError usa publicMessage o fallback', () => {
    const responses = [];
    const res = {
      status(code) {
        responses.push({ code });
        return this;
      },
      json(payload) {
        responses[responses.length - 1].payload = payload;
        return this;
      },
    };

    handleApiError(
      res,
      { status: 422, code: 'IBAN_INVALID', publicMessage: 'IBAN non valido.' },
      'GENERIC',
      'Fallback'
    );
    handleApiError(res, { message: 'boom' }, 'GENERIC', 'Fallback');

    assert.deepEqual(responses[0], {
      code: 422,
      payload: { error: 'IBAN_INVALID', message: 'IBAN non valido.' },
    });
    assert.deepEqual(responses[1], {
      code: 500,
      payload: { error: 'GENERIC', message: 'Fallback' },
    });
  });
});

describe('HTTP routes', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(async () => {
    global.fetch = originalFetch;
    invalidateContractsCache(1);
    invalidateContractsCache(7);
    invalidateAdminStatsCache();
  });

  it('GET /api/contracts restituisce solo i contratti dell agente loggato', async () => {
    const agentId = 7;
    const { token } = createSession(agentId, 'agente@example.it');
    const contractTableId = process.env.BASEROW_TABLE_CONTRATTI_ID;

    global.fetch = async (url) => {
      const parsed = new URL(url);
      assert.equal(parsed.pathname, `/api/database/rows/table/${contractTableId}/`);
      assert.match(parsed.searchParams.get('filters') || '', /"value":"7"/);
      return mockJsonResponse({
        count: 2,
        next: null,
        results: [
          {
            id: 10,
            agente: [{ id: 7 }],
            data_inserimento: '2026-04-10',
            ragione_sociale: 'Cliente Uno',
            stato_contratto: { value: 'OK' },
            tipo_fornitura: { value: 'dual' },
            categoria_cliente: { value: 'prospect' },
            cb_unitaria_snapshot: '85',
            cb_maturata: '85',
          },
          {
            id: 11,
            agente: [{ id: 99 }],
            data_inserimento: '2026-04-10',
            ragione_sociale: 'Altro Agente',
            stato_contratto: { value: 'OK' },
            tipo_fornitura: { value: 'luce' },
            categoria_cliente: { value: 'prospect' },
            cb_unitaria_snapshot: '85',
            cb_maturata: '85',
          },
        ],
      });
    };

    const response = await requestJson(app, 'GET', '/api/contracts', {
      headers: {
        Cookie: `crm_session=${token}`,
      },
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.length, 1);
    assert.equal(response.body[0].id, 10);
    assert.equal(response.body[0].unitCount, 2);
    assert.equal(response.body[0].commissionValue, 170);
  });

  it('GET /api/admin/stats calcola statistiche aggregate con fetch Baserow mockato', async () => {
    const adminId = 1;
    const { token } = createSession(adminId, 'admin@example.it');
    const agentTableId = process.env.BASEROW_TABLE_AGENTI_ID;
    const contractTableId = process.env.BASEROW_TABLE_CONTRATTI_ID;
    const now = new Date();
    const year = String(now.getFullYear());
    const month = `${year}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const quarter = `${year}-Q${Math.floor(now.getMonth() / 3) + 1}`;

    global.fetch = async (url) => {
      const parsed = new URL(url);

      if (parsed.pathname === `/api/database/rows/table/${agentTableId}/${adminId}/`) {
        return mockJsonResponse({
          id: 1,
          nome: 'Admin Uno',
          email: 'admin@example.it',
          ruolo: { value: 'admin' },
          attivo: true,
          cb_unitaria: '90',
          target_mensile: '5',
          target_trimestrale: '12',
          target_annuale: '48',
        });
      }

      if (parsed.pathname === `/api/database/rows/table/${agentTableId}/`) {
        return mockJsonResponse({
          count: 2,
          next: null,
          results: [
            {
              id: 1,
              nome: 'Admin Uno',
              email: 'admin@example.it',
              ruolo: { value: 'admin' },
              attivo: true,
              cb_unitaria: '90',
              target_mensile: '5',
              target_trimestrale: '12',
              target_annuale: '48',
            },
            {
              id: 2,
              nome: 'Agente Due',
              email: 'agente2@example.it',
              ruolo: { value: 'agente' },
              attivo: true,
              cb_unitaria: '85',
              target_mensile: '6',
              target_trimestrale: '15',
              target_annuale: '60',
            },
          ],
        });
      }

      if (parsed.pathname === `/api/database/rows/table/${contractTableId}/`) {
        return mockJsonResponse({
          count: 3,
          next: null,
          results: [
            {
              id: 101,
              agente: [{ id: 1 }],
              data_inserimento: `${month}-02`,
              trimestre_riferimento: quarter,
              anno_riferimento: year,
              stato_contratto: { value: 'OK' },
              tipo_fornitura: { value: 'dual' },
              categoria_cliente: { value: 'prospect' },
              cb_unitaria_snapshot: '90',
              cb_maturata: '90',
            },
            {
              id: 102,
              agente: [{ id: 2 }],
              data_inserimento: `${month}-03`,
              trimestre_riferimento: quarter,
              anno_riferimento: year,
              stato_contratto: { value: 'Caricato' },
              tipo_fornitura: { value: 'luce' },
              categoria_cliente: { value: 'prospect' },
              cb_unitaria_snapshot: '85',
              cb_maturata: '85',
            },
            {
              id: 103,
              agente: [{ id: 2 }],
              data_inserimento: `${month}-04`,
              trimestre_riferimento: quarter,
              anno_riferimento: year,
              stato_contratto: { value: 'K.O.' },
              tipo_fornitura: { value: 'gas' },
              categoria_cliente: { value: 'switch ricorrente' },
              cb_unitaria_snapshot: '85',
              cb_maturata: '0',
            },
          ],
        });
      }

      return mockJsonResponse({ detail: 'not found' }, { status: 404 });
    };

    const response = await requestJson(app, 'GET', '/api/admin/stats', {
      headers: {
        Cookie: `crm_session=${token}`,
      },
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.totals.practices, 3);
    assert.equal(response.body.totals.contracts, 4);
    assert.equal(response.body.totals.ok, 2);
    assert.equal(response.body.totals.caricati, 1);
    assert.equal(response.body.totals.ko, 1);
    assert.equal(response.body.totals.cbValidata, 180);
    assert.equal(response.body.totals.cbPotenziale, 265);
    assert.equal(response.body.agents.length, 2);
    assert.equal(response.body.agents[0].ok, 2);
    assert.equal(response.body.agents[1].caricati, 1);
  });

  it('POST /api/contracts crea un contratto con payload normalizzato', async () => {
    const agentId = 7;
    const agentTableId = process.env.BASEROW_TABLE_AGENTI_ID;
    const contractTableId = process.env.BASEROW_TABLE_CONTRATTI_ID;
    const calls = [];

    global.fetch = async (url, options = {}) => {
      const parsed = new URL(url);
      calls.push({
        pathname: parsed.pathname,
        method: options.method || 'GET',
        body: options.body,
      });

      if (parsed.pathname === `/api/database/rows/table/${agentTableId}/${agentId}/`) {
        return mockJsonResponse({
          id: agentId,
          nome: 'Agente Test',
          email: 'agente@example.it',
          ruolo: { value: 'agente' },
          attivo: true,
          cb_unitaria: '85',
          target_mensile: '5',
          target_trimestrale: '12',
          target_annuale: '48',
        });
      }

      if (parsed.pathname === `/api/database/rows/table/${contractTableId}/`) {
        assert.equal(options.method, 'POST');
        const payload = JSON.parse(options.body);
        assert.deepEqual(payload.agente, [agentId]);
        assert.equal(payload.ragione_sociale, 'Rossi SRL');
        assert.equal(payload.id_contratto, 'VT-001');
        assert.equal(payload.categoria_cliente, 'prospect');
        assert.deepEqual(payload.tipo_operazione, ['switch', 'subentro']);
        assert.equal(payload.metodo_pagamento, 'rid');
        assert.equal(payload.iban, 'IT60X0542811101000000123456');
        assert.equal(payload.stato_contratto, 'Caricato');
        assert.equal(payload.cb_unitaria_snapshot, 85);

        return mockJsonResponse({
          id: 501,
          agente: [{ id: agentId }],
          data_inserimento: '2026-04-10',
          id_contratto: 'VT-001',
          ragione_sociale: 'Rossi SRL',
          cellulare: '3331234567',
          tipo_cliente: { value: 'Business' },
          categoria_cliente: { value: 'prospect' },
          fornitore: 'Enel Energia',
          nome_offerta: 'Dual Fix',
          tipo_operazione: [{ value: 'switch' }, { value: 'subentro' }],
          tipo_fornitura: { value: 'dual' },
          pod: 'IT001E12345678',
          pdr: '12345678901234',
          metodo_pagamento: { value: 'rid' },
          iban: 'IT60X0542811101000000123456',
          piva: '03849270121',
          email: 'info@rossi.it',
          indirizzo_fatturazione: 'Via Roma 1',
          indirizzo_fornitura: 'Via Milano 2',
          descrizione: 'Nuovo inserimento',
          stato_contratto: { value: 'Caricato' },
          cb_unitaria_snapshot: '85',
          cb_maturata: '85',
        });
      }

      return mockJsonResponse({ detail: 'not found' }, { status: 404 });
    };

    const response = await invokeRouteJson(app, '/api/contracts', 'post', {
      session: { agentId },
      body: {
        idContratto: 'VT-001',
        ragioneSociale: 'Rossi SRL',
        cellulare: '3331234567',
        tipoCliente: 'Business',
        categoriaCliente: 'prospect',
        fornitore: 'Enel Energia',
        nomeOfferta: 'Dual Fix',
        tipoOperazione: ['switch', 'subentro'],
        tipoFornitura: 'dual',
        pod: 'it001e12345678',
        pdr: '12345678901234',
        metodoPagamento: 'rid',
        iban: 'it60x0542811101000000123456',
        piva: '03849270121',
        email: 'INFO@ROSSI.IT',
        indirizzoFatturazione: 'Via Roma 1',
        indirizzoFornitura: 'Via Milano 2',
        descrizione: 'Nuovo inserimento',
      },
      files: [],
    });

    assert.equal(response.status, 201);
    assert.equal(response.body.id, 501);
    assert.equal(response.body.unitCount, 2);
    assert.equal(response.body.commissionValue, 170);
    assert.ok(calls.length >= 3);
  });

  it('POST /api/contracts salva una bozza con validazione morbida', async () => {
    const agentId = 7;
    const agentTableId = process.env.BASEROW_TABLE_AGENTI_ID;
    const contractTableId = process.env.BASEROW_TABLE_CONTRATTI_ID;

    global.fetch = async (url, options = {}) => {
      const parsed = new URL(url);

      if (parsed.pathname === `/api/database/rows/table/${agentTableId}/${agentId}/`) {
        return mockJsonResponse({
          id: agentId,
          nome: 'Agente Test',
          email: 'agente@example.it',
          ruolo: { value: 'agente' },
          attivo: true,
          cb_unitaria: '85',
          target_mensile: '5',
          target_trimestrale: '12',
          target_annuale: '48',
        });
      }

      if (parsed.pathname === `/api/database/rows/table/${contractTableId}/`) {
        assert.equal(options.method, 'POST');
        const payload = JSON.parse(options.body);
        assert.equal(payload.ragione_sociale, 'Rossi SRL');
        assert.equal(payload.stato_contratto, 'Bozza');
        assert.equal(payload.tipo_cliente, null);
        assert.equal(payload.categoria_cliente, null);
        assert.equal(payload.tipo_fornitura, null);
        assert.equal(payload.metodo_pagamento, null);
        assert.equal(payload.cellulare, '');
        assert.equal(payload.nome_offerta, '');

        return mockJsonResponse({
          id: 777,
          agente: [{ id: agentId }],
          data_inserimento: '2026-04-12',
          ragione_sociale: 'Rossi SRL',
          stato_contratto: { value: 'Bozza' },
          tipo_fornitura: null,
          categoria_cliente: null,
          cb_unitaria_snapshot: '85',
          cb_maturata: '0',
        });
      }

      return mockJsonResponse({ detail: 'not found' }, { status: 404 });
    };

    const response = await invokeRouteJson(app, '/api/contracts', 'post', {
      session: { agentId },
      body: {
        saveMode: 'draft',
        ragioneSociale: 'Rossi SRL',
      },
      files: [],
    });

    assert.equal(response.status, 201);
    assert.equal(response.body.statoContratto, 'Bozza');
    assert.equal(response.body.cbMaturata, 0);
  });

  it('PATCH /api/contracts/:id/status aggiorna lo stato solo se il contratto appartiene all agente', async () => {
    const agentId = 7;
    const contractTableId = process.env.BASEROW_TABLE_CONTRATTI_ID;
    let patchSeen = false;

    global.fetch = async (url, options = {}) => {
      const parsed = new URL(url);

      if (parsed.pathname === `/api/database/rows/table/${contractTableId}/900/`) {
        if ((options.method || 'GET') === 'PATCH') {
          patchSeen = true;
          assert.equal(JSON.parse(options.body).stato_contratto, 'OK');
          return mockJsonResponse({
            id: 900,
            agente: [{ id: agentId }],
            stato_contratto: { value: 'OK' },
            tipo_fornitura: { value: 'luce' },
            categoria_cliente: { value: 'prospect' },
            cb_unitaria_snapshot: '85',
            cb_maturata: '85',
          });
        }

        return mockJsonResponse({
          id: 900,
          agente: [{ id: agentId }],
          stato_contratto: { value: 'Caricato' },
          tipo_fornitura: { value: 'luce' },
          categoria_cliente: { value: 'prospect' },
          cb_unitaria_snapshot: '85',
          cb_maturata: '85',
        });
      }

      if (parsed.pathname === `/api/database/rows/table/${contractTableId}/901/`) {
        return mockJsonResponse({
          id: 901,
          agente: [{ id: 99 }],
          stato_contratto: { value: 'Caricato' },
          tipo_fornitura: { value: 'luce' },
          categoria_cliente: { value: 'prospect' },
          cb_unitaria_snapshot: '85',
          cb_maturata: '85',
        });
      }

      return mockJsonResponse({ detail: 'not found' }, { status: 404 });
    };

    const okResponse = await invokeRouteJson(app, '/api/contracts/:id/status', 'patch', {
      session: { agentId },
      params: { id: '900' },
      body: {
        status: 'OK',
      },
    });

    const forbiddenResponse = await invokeRouteJson(app, '/api/contracts/:id/status', 'patch', {
      session: { agentId },
      params: { id: '901' },
      body: {
        status: 'OK',
      },
    });

    assert.equal(okResponse.status, 200);
    assert.equal(okResponse.body.statoContratto, 'OK');
    assert.equal(patchSeen, true);
    assert.equal(forbiddenResponse.status, 403);
    assert.equal(forbiddenResponse.body.error, 'CONTRACT_FORBIDDEN');
  });

  it('PATCH /api/contracts/:id aggiorna anagrafica e mantiene lo stato operativo', async () => {
    const agentId = 7;
    const agentTableId = process.env.BASEROW_TABLE_AGENTI_ID;
    const contractTableId = process.env.BASEROW_TABLE_CONTRATTI_ID;

    global.fetch = async (url, options = {}) => {
      const parsed = new URL(url);

      if (parsed.pathname === `/api/database/rows/table/${agentTableId}/${agentId}/`) {
        return mockJsonResponse({
          id: agentId,
          nome: 'Agente Test',
          email: 'agente@example.it',
          ruolo: { value: 'agente' },
          attivo: true,
          cb_unitaria: '85',
          target_mensile: '5',
          target_trimestrale: '12',
          target_annuale: '48',
        });
      }

      if (parsed.pathname === `/api/database/rows/table/${contractTableId}/910/`) {
        if ((options.method || 'GET') === 'PATCH') {
          const payload = JSON.parse(options.body);
          assert.equal(payload.ragione_sociale, 'Rossi SRL Aggiornata');
          assert.equal(payload.indirizzo_fornitura, 'Via Nuova 44');
          assert.equal(payload.stato_contratto, 'OK');
          assert.deepEqual(payload.file_contratto, [
            { name: 'doc-esistente.pdf', visible_name: 'Doc esistente.pdf' },
          ]);

          return mockJsonResponse({
            id: 910,
            agente: [{ id: agentId }],
            data_inserimento: '2026-04-10',
            ragione_sociale: 'Rossi SRL Aggiornata',
            stato_contratto: { value: 'OK' },
            tipo_fornitura: { value: 'luce' },
            categoria_cliente: { value: 'prospect' },
            cb_unitaria_snapshot: '85',
            cb_maturata: '85',
            file_contratto: [
              {
                name: 'doc-esistente.pdf',
                visible_name: 'Doc esistente.pdf',
                url: 'https://example.com/doc-esistente.pdf',
                mime_type: 'application/pdf',
                size: '1024',
              },
            ],
          });
        }

        return mockJsonResponse({
          id: 910,
          agente: [{ id: agentId }],
          data_inserimento: '2026-04-10',
          ragione_sociale: 'Rossi SRL',
          cellulare: '3331234567',
          tipo_cliente: { value: 'Business' },
          categoria_cliente: { value: 'prospect' },
          fornitore: 'Enel Energia',
          nome_offerta: 'Dual Fix',
          tipo_operazione: [{ value: 'switch' }],
          tipo_fornitura: { value: 'luce' },
          pod: 'IT001E12345678',
          pdr: '',
          metodo_pagamento: { value: 'bollettino' },
          iban: '',
          piva: '03849270121',
          email: 'info@rossi.it',
          indirizzo_fatturazione: 'Via Roma 1',
          indirizzo_fornitura: 'Via Milano 2',
          descrizione: 'Note',
          stato_contratto: { value: 'OK' },
          cb_unitaria_snapshot: '85',
          cb_maturata: '85',
          file_contratto: [
            {
              name: 'doc-esistente.pdf',
              visible_name: 'Doc esistente.pdf',
              url: 'https://example.com/doc-esistente.pdf',
              mime_type: 'application/pdf',
              size: '1024',
            },
          ],
        });
      }

      return mockJsonResponse({ detail: 'not found' }, { status: 404 });
    };

    const response = await invokeRouteJson(app, '/api/contracts/:id', 'patch', {
      session: { agentId },
      params: { id: '910' },
      body: {
        ragioneSociale: 'Rossi SRL Aggiornata',
        cellulare: '3331234567',
        tipoCliente: 'Business',
        categoriaCliente: 'prospect',
        fornitore: 'Enel Energia',
        nomeOfferta: 'Dual Fix',
        tipoOperazione: ['switch'],
        tipoFornitura: 'luce',
        pod: 'IT001E12345678',
        pdr: '',
        metodoPagamento: 'bollettino',
        iban: '',
        piva: '03849270121',
        email: 'info@rossi.it',
        indirizzoFatturazione: 'Via Roma 1',
        indirizzoFornitura: 'Via Nuova 44',
        descrizione: 'Note aggiornate',
        retainedFileName: ['doc-esistente.pdf'],
      },
      files: [],
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.ragioneSociale, 'Rossi SRL Aggiornata');
    assert.equal(response.body.statoContratto, 'OK');
  });

  it('PATCH /api/admin/agents/:id aggiorna target e dati agente con permessi admin', async () => {
    const adminId = 1;
    const agentTableId = process.env.BASEROW_TABLE_AGENTI_ID;
    const payloads = [];

    global.fetch = async (url, options = {}) => {
      const parsed = new URL(url);

      if (parsed.pathname === `/api/database/rows/table/${agentTableId}/${adminId}/`) {
        return mockJsonResponse({
          id: adminId,
          nome: 'Admin Uno',
          email: 'admin@example.it',
          ruolo: { value: 'admin' },
          attivo: true,
          cb_unitaria: '90',
          target_mensile: '5',
          target_trimestrale: '12',
          target_annuale: '48',
        });
      }

      if (parsed.pathname === `/api/database/rows/table/${agentTableId}/2/`) {
        assert.equal(options.method, 'PATCH');
        const payload = JSON.parse(options.body);
        payloads.push(payload);
        assert.equal(payload.nome, 'Laura Verdi');
        assert.equal(payload.email, 'laura@example.it');
        assert.equal(payload.target_mensile, 8);
        assert.equal(payload.target_trimestrale, 24);
        assert.equal(payload.target_annuale, 96);
        assert.equal(payload.ruolo, 'agente');
        assert.equal(payload.attivo, true);
        assert.equal('cb_unitaria' in payload, false);
        assert.equal('password_hash' in payload, false);

        return mockJsonResponse({
          id: 2,
          nome: 'Laura Verdi',
          email: 'laura@example.it',
          ruolo: { value: 'agente' },
          attivo: true,
          cb_unitaria: '95',
          target_mensile: '8',
          target_trimestrale: '24',
          target_annuale: '96',
        });
      }

      return mockJsonResponse({ detail: 'not found' }, { status: 404 });
    };

    const response = await invokeRouteJson(app, '/api/admin/agents/:id', 'patch', {
      session: { agentId: adminId },
      params: { id: '2' },
      body: {
        nome: 'Laura Verdi',
        email: 'LAURA@EXAMPLE.IT',
        password: '',
        targetMensile: 8,
        targetTrimestrale: 24,
        targetAnnuale: 96,
        ruolo: 'agente',
        attivo: true,
      },
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.nome, 'Laura Verdi');
    assert.equal(response.body.targetMensile, 8);
    assert.equal(payloads.length, 1);
  });

  it('PATCH /api/admin/contracts/:id/sent aggiorna lo stato a Inviato', async () => {
    const adminId = 1;
    const agentTableId = process.env.BASEROW_TABLE_AGENTI_ID;
    const contractTableId = process.env.BASEROW_TABLE_CONTRATTI_ID;

    global.fetch = async (url, options = {}) => {
      const parsed = new URL(url);

      if (parsed.pathname === `/api/database/rows/table/${agentTableId}/${adminId}/`) {
        return mockJsonResponse({
          id: adminId,
          nome: 'Admin Uno',
          email: 'admin@example.it',
          ruolo: { value: 'admin' },
          attivo: true,
          cb_unitaria: '90',
          target_mensile: '5',
          target_trimestrale: '12',
          target_annuale: '48',
        });
      }

      if (parsed.pathname === `/api/database/rows/table/${contractTableId}/15/`) {
        assert.equal(options.method, 'PATCH');
        const payload = JSON.parse(options.body);
        assert.equal(payload.stato_contratto, 'Inviato');

        return mockJsonResponse({
          id: 15,
          agente: [{ id: 7 }],
          ragione_sociale: 'Cliente Test',
          stato_contratto: { value: 'Inviato' },
          tipo_fornitura: { value: 'luce' },
          categoria_cliente: { value: 'prospect' },
          cb_unitaria_snapshot: '85',
          cb_maturata: '85',
        });
      }

      return mockJsonResponse({ detail: 'not found' }, { status: 404 });
    };

    const response = await invokeRouteJson(app, '/api/admin/contracts/:id/sent', 'patch', {
      session: { agentId: adminId },
      params: { id: '15' },
      body: { sent: true },
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.statoContratto, 'Inviato');
  });

  it('PATCH /api/admin/contracts/:id/sent riporta lo stato a Caricato quando annulli', async () => {
    const adminId = 1;
    const agentTableId = process.env.BASEROW_TABLE_AGENTI_ID;
    const contractTableId = process.env.BASEROW_TABLE_CONTRATTI_ID;

    global.fetch = async (url, options = {}) => {
      const parsed = new URL(url);

      if (parsed.pathname === `/api/database/rows/table/${agentTableId}/${adminId}/`) {
        return mockJsonResponse({
          id: adminId,
          nome: 'Admin Uno',
          email: 'admin@example.it',
          ruolo: { value: 'admin' },
          attivo: true,
          cb_unitaria: '90',
          target_mensile: '5',
          target_trimestrale: '12',
          target_annuale: '48',
        });
      }

      if (parsed.pathname === `/api/database/rows/table/${contractTableId}/16/`) {
        assert.equal(options.method, 'PATCH');
        const payload = JSON.parse(options.body);
        assert.equal(payload.stato_contratto, 'Caricato');

        return mockJsonResponse({
          id: 16,
          agente: [{ id: 7 }],
          ragione_sociale: 'Cliente Test 2',
          stato_contratto: { value: 'Caricato' },
          tipo_fornitura: { value: 'luce' },
          categoria_cliente: { value: 'prospect' },
          cb_unitaria_snapshot: '85',
          cb_maturata: '85',
        });
      }

      return mockJsonResponse({ detail: 'not found' }, { status: 404 });
    };

    const response = await invokeRouteJson(app, '/api/admin/contracts/:id/sent', 'patch', {
      session: { agentId: adminId },
      params: { id: '16' },
      body: { sent: false },
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.statoContratto, 'Caricato');
  });

  it('DELETE /api/contracts/:id elimina il contratto se accessibile', async () => {
    const agentId = 7;
    const agentTableId = process.env.BASEROW_TABLE_AGENTI_ID;
    const contractTableId = process.env.BASEROW_TABLE_CONTRATTI_ID;
    let deleteSeen = false;

    global.fetch = async (url, options = {}) => {
      const parsed = new URL(url);

      if (parsed.pathname === `/api/database/rows/table/${agentTableId}/${agentId}/`) {
        return mockJsonResponse({
          id: agentId,
          nome: 'Agente Test',
          email: 'agente@example.it',
          ruolo: { value: 'agente' },
          attivo: true,
          cb_unitaria: '85',
          target_mensile: '5',
          target_trimestrale: '12',
          target_annuale: '48',
        });
      }

      if (parsed.pathname === `/api/database/rows/table/${contractTableId}/930/`) {
        if ((options.method || 'GET') === 'DELETE') {
          deleteSeen = true;
          return {
            ok: true,
            status: 204,
            text: async () => '',
          };
        }

        return mockJsonResponse({
          id: 930,
          agente: [{ id: agentId }],
          stato_contratto: { value: 'Caricato' },
          tipo_fornitura: { value: 'luce' },
          categoria_cliente: { value: 'prospect' },
          cb_unitaria_snapshot: '85',
          cb_maturata: '85',
        });
      }

      return mockJsonResponse({ detail: 'not found' }, { status: 404 });
    };

    const response = await invokeRouteJson(app, '/api/contracts/:id', 'delete', {
      session: { agentId },
      params: { id: '930' },
      body: {},
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.ok, true);
    assert.equal(deleteSeen, true);
  });
});

function requestJson(expressApp, method, pathname, options = {}) {
  const { headers = {}, body } = options;
  const payload = body ? JSON.stringify(body) : null;

  return new Promise((resolve, reject) => {
    const socket = new MockSocket();
    const req = new http.IncomingMessage(socket);
    req.method = method;
    req.url = pathname;
    req.headers = Object.fromEntries(
      Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])
    );
    req.socket = socket;
    req.connection = socket;
    req.httpVersion = '1.1';
    req.httpVersionMajor = 1;
    req.httpVersionMinor = 1;

    if (payload) {
      req.headers['content-type'] = 'application/json';
      req.headers['content-length'] = Buffer.byteLength(payload);
    }

    const res = new http.ServerResponse(req);
    const chunks = [];
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);

    res.assignSocket(socket);
    res.write = (chunk, encoding, callback) => {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      return originalWrite(chunk, encoding, callback);
    };
    res.end = (chunk, encoding, callback) => {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      return originalEnd(chunk, encoding, callback);
    };
    res.on('finish', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve({
          status: res.statusCode,
          body: raw ? JSON.parse(raw) : null,
        });
      } catch (error) {
        reject(error);
      }
    });
    res.on('error', reject);

    expressApp.handle(req, res, reject);

    if (payload) req.push(payload);
    req.push(null);
  });
}

async function invokeRouteJson(expressApp, routePath, method, reqOverrides = {}) {
  const handler = findRouteHandler(expressApp, routePath, method);
  const req = {
    body: reqOverrides.body || {},
    params: reqOverrides.params || {},
    query: reqOverrides.query || {},
    headers: reqOverrides.headers || {},
    session: reqOverrides.session || null,
    files: reqOverrides.files || [],
  };

  const response = await createMockJsonResponse();
  await handler(req, response.res);
  return response.result;
}

function findRouteHandler(expressApp, routePath, method) {
  const routes = (expressApp.router && expressApp.router.stack) || [];
  const routeLayer = routes.find(
    (layer) =>
      layer.route &&
      layer.route.path === routePath &&
      Boolean(layer.route.methods[method.toLowerCase()])
  );

  if (!routeLayer) {
    throw new Error(`Route not found: ${method.toUpperCase()} ${routePath}`);
  }

  return routeLayer.route.stack[routeLayer.route.stack.length - 1].handle;
}

function createMockJsonResponse() {
  const result = {
    status: 200,
    body: null,
  };

  const res = {
    status(code) {
      result.status = code;
      return this;
    },
    json(payload) {
      result.body = payload;
      return this;
    },
  };

  return { res, result };
}

function mockJsonResponse(body, options = {}) {
  const status = options.status || 200;
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return body;
    },
    async text() {
      return typeof body === 'string' ? body : JSON.stringify(body);
    },
  });
}

class MockSocket extends Duplex {
  constructor() {
    super();
    this.remoteAddress = '127.0.0.1';
    this.writable = true;
    this.readable = true;
    this.destroyed = false;
    this._chunks = [];
    this.server = new EventEmitter();
  }

  _read() {}

  _write(chunk, _encoding, callback) {
    this._chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    callback();
  }

  setTimeout() {}

  setNoDelay() {}

  setKeepAlive() {}

  destroy(error) {
    this.destroyed = true;
    if (error) this.emit('error', error);
    this.emit('close');
    return this;
  }
}
