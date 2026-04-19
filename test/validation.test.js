'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeContractInput, sanitizeAgentInput } = require('../server');

// ─── Fixture contratto valido ───────────────────────────────────────────────
const validContract = {
  ragioneSociale: 'Rossi Impianti SRL',
  cellulare: '+39 333 1234567',
  tipoCliente: 'Business',
  categoriaCliente: 'Prospect',
  fornitore: 'Enel Energia',
  nomeOfferta: 'Flex Business Luce',
  tipoOperazione: ['switch'],
  tipoFornitura: 'luce',
  pod: 'IT001E12345678',
  pdr: '',
  metodoPagamento: 'rid',
  iban: 'IT60X0542811101000000123456',
  piva: '03849270121',
  email: 'info@rossi.it',
  indirizzoFatturazione: '',
  indirizzoFornitura: '',
  descrizione: '',
  dataInizioFornitura: '',
};

// ─── Fixture agente valido ───────────────────────────────────────────────────
const validAgent = {
  nome: 'Marco Bianchi',
  email: 'marco@example.it',
  password: 'password123',
  cbUnitaria: '85',
  targetMensile: '28',
  targetTrimestrale: '84',
  targetAnnuale: '320',
  ruolo: 'agente',
  attivo: true,
};

// ─── Helper: verifica il codice errore ───────────────────────────────────────
function throwsWithCode(fn, expectedCode) {
  assert.throws(fn, (err) => {
    assert.equal(
      err.code,
      expectedCode,
      `Atteso codice errore: ${expectedCode}, ricevuto: ${err.code}`
    );
    return true;
  });
}

// ────────────────────────────────────────────────────────────────────────────
describe('sanitizeContractInput', () => {
  describe('contratto valido', () => {
    it('accetta un contratto completo e corretto', () => {
      const result = sanitizeContractInput(validContract);
      assert.equal(result.ragioneSociale, 'ROSSI IMPIANTI SRL');
      assert.equal(result.tipoCliente, 'Business');
      assert.equal(result.categoriaCliente, 'Prospect');
      assert.equal(result.tipoFornitura, 'luce');
    });

    it('normalizza email a minuscolo', () => {
      const result = sanitizeContractInput({ ...validContract, email: 'INFO@ROSSI.IT' });
      assert.equal(result.email, 'info@rossi.it');
    });

    it('normalizza IBAN rimuovendo spazi e portando a maiuscolo', () => {
      const result = sanitizeContractInput({
        ...validContract,
        iban: 'it60 x054 2811 1010 0000 0123 456',
      });
      assert.equal(result.iban, 'IT60X0542811101000000123456');
    });

    it('normalizza POD a maiuscolo', () => {
      const result = sanitizeContractInput({ ...validContract, pod: 'it001e12345678' });
      assert.equal(result.pod, 'IT001E12345678');
    });

    it('accetta tipoOperazione come stringa singola', () => {
      const result = sanitizeContractInput({ ...validContract, tipoOperazione: 'switch' });
      assert.deepEqual(result.tipoOperazione, ['switch']);
    });

    it('accetta bollettino senza IBAN', () => {
      const result = sanitizeContractInput({
        ...validContract,
        metodoPagamento: 'bollettino',
        iban: '',
      });
      assert.equal(result.metodoPagamento, 'bollettino');
    });

    it('accetta gas con PDR, senza POD', () => {
      const result = sanitizeContractInput({
        ...validContract,
        tipoFornitura: 'gas',
        pod: '',
        pdr: '04000000001',
        metodoPagamento: 'bollettino',
        iban: '',
      });
      assert.equal(result.tipoFornitura, 'gas');
    });

    it('accetta dual con POD e PDR', () => {
      const result = sanitizeContractInput({
        ...validContract,
        tipoFornitura: 'dual',
        pod: 'IT001E12345678',
        pdr: '04000000001',
      });
      assert.equal(result.tipoFornitura, 'dual');
    });

    it('accetta una bozza con dati parziali se allowDraft=true', () => {
      const result = sanitizeContractInput(
        {
          ragioneSociale: 'Rossi SRL',
          cellulare: '',
          tipoCliente: '',
          categoriaCliente: '',
          fornitore: '',
          nomeOfferta: '',
          tipoOperazione: [],
          tipoFornitura: '',
          pod: '',
          pdr: '',
          metodoPagamento: '',
          iban: '',
          piva: '',
          email: '',
          indirizzoFatturazione: '',
          indirizzoFornitura: '',
          descrizione: '',
          dataInizioFornitura: '',
        },
        { allowDraft: true }
      );
      assert.equal(result.ragioneSociale, 'ROSSI SRL');
    });
  });

  describe('campi obbligatori', () => {
    it('lancia DRAFT_TOO_EMPTY se una bozza e completamente vuota', () => {
      throwsWithCode(
        () =>
          sanitizeContractInput(
            {
              ragioneSociale: '',
              cellulare: '',
              tipoCliente: '',
              categoriaCliente: '',
              fornitore: '',
              nomeOfferta: '',
              tipoOperazione: [],
              tipoFornitura: '',
              pod: '',
              pdr: '',
              metodoPagamento: '',
              iban: '',
              piva: '',
              email: '',
              indirizzoFatturazione: '',
              indirizzoFornitura: '',
              descrizione: '',
              dataInizioFornitura: '',
            },
            { allowDraft: true }
          ),
        'DRAFT_TOO_EMPTY'
      );
    });

    it('lancia CUSTOMER_REQUIRED se ragione sociale vuota', () => {
      throwsWithCode(
        () => sanitizeContractInput({ ...validContract, ragioneSociale: '  ' }),
        'CUSTOMER_REQUIRED'
      );
    });

    it('lancia PHONE_REQUIRED se cellulare vuoto', () => {
      throwsWithCode(
        () => sanitizeContractInput({ ...validContract, cellulare: '' }),
        'PHONE_REQUIRED'
      );
    });

    it('lancia SUPPLIER_REQUIRED se fornitore vuoto', () => {
      throwsWithCode(
        () => sanitizeContractInput({ ...validContract, fornitore: '' }),
        'SUPPLIER_REQUIRED'
      );
    });

    it('lancia OFFER_REQUIRED se nome offerta vuoto', () => {
      throwsWithCode(
        () => sanitizeContractInput({ ...validContract, nomeOfferta: '' }),
        'OFFER_REQUIRED'
      );
    });
  });

  describe('valori con whitelist', () => {
    it('lancia CLIENT_TYPE_INVALID per tipo cliente non previsto', () => {
      throwsWithCode(
        () => sanitizeContractInput({ ...validContract, tipoCliente: 'Azienda' }),
        'CLIENT_TYPE_INVALID'
      );
    });

    it('lancia CUSTOMER_CATEGORY_INVALID per categoria non prevista', () => {
      throwsWithCode(
        () => sanitizeContractInput({ ...validContract, categoriaCliente: 'vip' }),
        'CUSTOMER_CATEGORY_INVALID'
      );
    });

    it('lancia OPERATION_INVALID per tipo operazione non previsto', () => {
      throwsWithCode(
        () => sanitizeContractInput({ ...validContract, tipoOperazione: ['hackeraggio'] }),
        'OPERATION_INVALID'
      );
    });

    it('lancia OPERATION_INVALID se tipoOperazione è array vuoto', () => {
      throwsWithCode(
        () => sanitizeContractInput({ ...validContract, tipoOperazione: [] }),
        'OPERATION_INVALID'
      );
    });

    it('lancia SUPPLY_TYPE_INVALID per tipo fornitura non previsto', () => {
      throwsWithCode(
        () => sanitizeContractInput({ ...validContract, tipoFornitura: 'acqua' }),
        'SUPPLY_TYPE_INVALID'
      );
    });

    it('lancia PAYMENT_METHOD_INVALID per metodo pagamento non previsto', () => {
      throwsWithCode(
        () => sanitizeContractInput({ ...validContract, metodoPagamento: 'cripto' }),
        'PAYMENT_METHOD_INVALID'
      );
    });
  });

  describe('validazione condizionale fornitura', () => {
    it('lancia POD_REQUIRED se tipo fornitura è luce e POD mancante', () => {
      throwsWithCode(
        () => sanitizeContractInput({ ...validContract, tipoFornitura: 'luce', pod: '' }),
        'POD_REQUIRED'
      );
    });

    it('lancia POD_REQUIRED se tipo fornitura è dual e POD mancante', () => {
      throwsWithCode(
        () =>
          sanitizeContractInput({
            ...validContract,
            tipoFornitura: 'dual',
            pod: '',
            pdr: '04000000001',
          }),
        'POD_REQUIRED'
      );
    });

    it('lancia PDR_REQUIRED se tipo fornitura è gas e PDR mancante', () => {
      throwsWithCode(
        () =>
          sanitizeContractInput({
            ...validContract,
            tipoFornitura: 'gas',
            pod: '',
            pdr: '',
            metodoPagamento: 'bollettino',
            iban: '',
          }),
        'PDR_REQUIRED'
      );
    });

    it('lancia PDR_REQUIRED se tipo fornitura è dual e PDR mancante', () => {
      throwsWithCode(
        () =>
          sanitizeContractInput({
            ...validContract,
            tipoFornitura: 'dual',
            pod: 'IT001E12345678',
            pdr: '',
          }),
        'PDR_REQUIRED'
      );
    });
  });

  describe('validazione condizionale pagamento', () => {
    it('lancia IBAN_REQUIRED se metodo è RID e IBAN mancante', () => {
      throwsWithCode(
        () => sanitizeContractInput({ ...validContract, metodoPagamento: 'rid', iban: '' }),
        'IBAN_REQUIRED'
      );
    });

    it('lancia IBAN_INVALID per IBAN malformato', () => {
      throwsWithCode(
        () => sanitizeContractInput({ ...validContract, iban: 'NOTANIBAN' }),
        'IBAN_INVALID'
      );
    });
  });

  describe('validazione formato', () => {
    it('lancia EMAIL_INVALID per email malformata', () => {
      throwsWithCode(
        () => sanitizeContractInput({ ...validContract, email: 'non-una-email' }),
        'EMAIL_INVALID'
      );
    });

    it('non lancia errore se email è vuota (campo opzionale)', () => {
      assert.doesNotThrow(() => sanitizeContractInput({ ...validContract, email: '' }));
    });

    it('lancia PIVA_INVALID se P.IVA non ha 11 cifre', () => {
      throwsWithCode(
        () => sanitizeContractInput({ ...validContract, piva: '123' }),
        'PIVA_INVALID'
      );
    });

    it('lancia PIVA_INVALID se P.IVA contiene lettere', () => {
      throwsWithCode(
        () => sanitizeContractInput({ ...validContract, piva: 'ABCDE123456' }),
        'PIVA_INVALID'
      );
    });

    it('non lancia errore se P.IVA è vuota (campo opzionale)', () => {
      assert.doesNotThrow(() => sanitizeContractInput({ ...validContract, piva: '' }));
    });
  });
});

// ────────────────────────────────────────────────────────────────────────────
describe('sanitizeAgentInput', () => {
  describe('agente valido', () => {
    it('accetta un agente completo e corretto', () => {
      const result = sanitizeAgentInput(validAgent, { requirePassword: true });
      assert.equal(result.nome, 'MARCO BIANCHI');
      assert.equal(result.ruolo, 'agente');
      assert.equal(result.cbUnitaria, 85);
      assert.equal(result.targetMensile, 28);
    });

    it('normalizza email a minuscolo', () => {
      const result = sanitizeAgentInput(
        { ...validAgent, email: 'MARCO@EXAMPLE.IT' },
        { requirePassword: true }
      );
      assert.equal(result.email, 'marco@example.it');
    });

    it('normalizza ruolo a minuscolo', () => {
      const result = sanitizeAgentInput(
        { ...validAgent, ruolo: 'ADMIN' },
        { requirePassword: true }
      );
      assert.equal(result.ruolo, 'admin');
    });

    it('accetta ruolo admin', () => {
      const result = sanitizeAgentInput(
        { ...validAgent, ruolo: 'admin' },
        { requirePassword: true }
      );
      assert.equal(result.ruolo, 'admin');
    });

    it('non richiede password se requirePassword=false e campo vuoto', () => {
      const result = sanitizeAgentInput(
        { ...validAgent, password: '' },
        { requirePassword: false }
      );
      assert.equal(result.nome, 'MARCO BIANCHI');
    });

    it('lascia cbUnitaria a null se il campo non viene inviato', () => {
      const result = sanitizeAgentInput(
        { ...validAgent, cbUnitaria: '', password: '' },
        { requirePassword: false }
      );
      assert.equal(result.cbUnitaria, null);
    });
  });

  describe('campi obbligatori', () => {
    it('lancia AGENT_NAME_REQUIRED se nome vuoto', () => {
      throwsWithCode(
        () => sanitizeAgentInput({ ...validAgent, nome: '  ' }, { requirePassword: true }),
        'AGENT_NAME_REQUIRED'
      );
    });

    it('lancia AGENT_EMAIL_INVALID se email malformata', () => {
      throwsWithCode(
        () => sanitizeAgentInput({ ...validAgent, email: 'nonvalida' }, { requirePassword: true }),
        'AGENT_EMAIL_INVALID'
      );
    });

    it('lancia AGENT_ROLE_INVALID per ruolo non previsto', () => {
      throwsWithCode(
        () => sanitizeAgentInput({ ...validAgent, ruolo: 'superadmin' }, { requirePassword: true }),
        'AGENT_ROLE_INVALID'
      );
    });
  });

  describe('validazione password', () => {
    it('lancia AGENT_PASSWORD_REQUIRED se password troppo corta (requirePassword=true)', () => {
      throwsWithCode(
        () => sanitizeAgentInput({ ...validAgent, password: 'short' }, { requirePassword: true }),
        'AGENT_PASSWORD_REQUIRED'
      );
    });

    it('lancia AGENT_PASSWORD_REQUIRED se password mancante (requirePassword=true)', () => {
      throwsWithCode(
        () => sanitizeAgentInput({ ...validAgent, password: '' }, { requirePassword: true }),
        'AGENT_PASSWORD_REQUIRED'
      );
    });

    it('lancia AGENT_PASSWORD_INVALID se nuova password troppo corta (requirePassword=false)', () => {
      throwsWithCode(
        () => sanitizeAgentInput({ ...validAgent, password: 'abc' }, { requirePassword: false }),
        'AGENT_PASSWORD_INVALID'
      );
    });

    it('accetta password di 8+ caratteri', () => {
      assert.doesNotThrow(() =>
        sanitizeAgentInput({ ...validAgent, password: '12345678' }, { requirePassword: true })
      );
    });
  });
});
