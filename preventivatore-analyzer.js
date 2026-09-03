const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1';
const { calculateComparison } = require('./preventivatore-rules');

const PUN = {
  '2025-01': 0.143028,
  '2025-02': 0.15036,
  '2025-03': 0.120548,
  '2025-04': 0.099854,
  '2025-05': 0.093576,
  '2025-06': 0.111782,
  '2025-07': 0.11313,
  '2025-08': 0.108789,
  '2025-09': 0.109076,
  '2025-10': 0.111042,
  '2025-11': 0.117085,
  '2025-12': 0.11549,
  '2026-01': 0.13266,
  '2026-02': 0.11441,
  '2026-03': 0.1434,
  '2026-04': 0.11947,
  '2026-05': 0.11935,
  '2026-06': 0.132505,
  '2026-07': 0.157038,
};

const PSV = {
  '2024-01': 0.333736,
  '2024-02': 0.297889,
  '2024-03': 0.307491,
  '2024-04': 0.326265,
  '2024-05': 0.352949,
  '2024-06': 0.386328,
  '2024-07': 0.378862,
  '2024-08': 0.43379,
  '2024-09': 0.415249,
  '2024-10': 0.436849,
  '2024-11': 0.482922,
  '2024-12': 0.509233,
  '2025-01': 0.533576,
  '2025-02': 0.566178,
  '2025-03': 0.455069,
  '2025-04': 0.402365,
  '2025-05': 0.40301,
  '2025-06': 0.418839,
  '2025-07': 0.392478,
  '2025-08': 0.380886,
  '2025-09': 0.373358,
  '2025-10': 0.353669,
  '2025-11': 0.348704,
  '2025-12': 0.327985,
  '2026-01': 0.403934,
  '2026-02': 0.376788,
  '2026-03': 0.557699,
  '2026-04': 0.492325,
  '2026-05': 0.501752,
  '2026-06': 0.504871,
  '2026-07': 0.606612,
};

function configuredMonthlyValues(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return fallback;
    const values = Object.fromEntries(
      Object.entries(parsed).filter(
        ([month, value]) =>
          /^\d{4}-\d{2}$/.test(month) &&
          typeof value === 'number' &&
          Number.isFinite(value) &&
          value > 0
      )
    );
    return Object.keys(values).length ? values : fallback;
  } catch {
    console.warn(`[preventivatore] ${name} non è JSON valido: uso il dataset disponibile`);
    return fallback;
  }
}

const ANALYSIS_SCHEMA = {
  type: 'object',
  required: ['confidence', 'invoice', 'cte'],
  additionalProperties: false,
  properties: {
    confidence: { type: 'number' },
    invoice: {
      type: 'object',
      properties: {
        customerName: { type: 'string' },
        taxId: { type: 'string' },
        vatNumber: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        address: { type: 'string' },
        pod: { type: 'string' },
        pdr: { type: 'string' },
        supplier: { type: 'string' },
        commodity: { type: 'string' },
        meterDestination: { type: 'string' },
        billingPeriod: { type: 'string' },
        billingMonths: { type: ['number', 'null'] },
        referenceMonths: { type: 'array', items: { type: 'string' } },
        consumption: { type: ['number', 'null'] },
        unitPrice: { type: ['number', 'null'] },
        fixedFeeTotal: { type: ['number', 'null'] },
        hasRecalculations: { type: 'boolean' },
        hasZeroConsumption: { type: 'boolean' },
        hasIncompletePeriod: { type: 'boolean' },
        hasMissingEnergySlip: { type: 'boolean' },
        priceReconstructable: { type: 'boolean' },
        comparable: { type: 'boolean' },
      },
      required: [
        'customerName',
        'taxId',
        'vatNumber',
        'email',
        'phone',
        'address',
        'pod',
        'pdr',
        'supplier',
        'commodity',
        'meterDestination',
        'billingPeriod',
        'billingMonths',
        'referenceMonths',
        'consumption',
        'unitPrice',
        'fixedFeeTotal',
        'hasRecalculations',
        'hasZeroConsumption',
        'hasIncompletePeriod',
        'hasMissingEnergySlip',
        'priceReconstructable',
        'comparable',
      ],
      additionalProperties: false,
    },
    cte: {
      type: 'object',
      properties: {
        supplier: { type: 'string' },
        commodity: { type: 'string' },
        customerType: { type: 'string' },
        priceType: { type: 'string' },
        complexity: { type: 'string' },
        initialFixedMonths: { type: ['number', 'null'] },
        initialFixedUnitPrice: { type: ['number', 'null'] },
        fixedUnitPrice: { type: ['number', 'null'] },
        hasMonorariaOption: { type: 'boolean' },
        monorariaUnitPrice: { type: ['number', 'null'] },
        spread: { type: ['number', 'null'] },
        referenceIndex: { type: 'string' },
        networkLosses: { type: 'string' },
        annualFixedFee: { type: ['number', 'null'] },
        formulaMultiplier: { type: ['number', 'null'] },
        formulaAdditive: { type: ['number', 'null'] },
        hasExplicitFormula: { type: 'boolean' },
      },
      required: [
        'supplier',
        'commodity',
        'customerType',
        'priceType',
        'complexity',
        'initialFixedMonths',
        'initialFixedUnitPrice',
        'fixedUnitPrice',
        'hasMonorariaOption',
        'monorariaUnitPrice',
        'spread',
        'referenceIndex',
        'networkLosses',
        'annualFixedFee',
        'formulaMultiplier',
        'formulaAdditive',
        'hasExplicitFormula',
      ],
      additionalProperties: false,
    },
  },
};

const PROMPT = `Sei un analista di bollette e CTE italiane. Ricevi una CTE/offerta e una fattura.
Estrai solo dati realmente presenti, senza inventare o stimare. Analizza tutte le pagine della fattura:
cerca lo scontrino dell'energia ovunque si trovi e, se è incompleto, cerca anche negli Elementi di dettaglio.
Il confronto riguarda esclusivamente
la vendita della materia e la quota fissa del venditore: escludi rete, trasporto, contatore, oneri,
imposte, IVA e altre partite.

Restituisci JSON conforme allo schema. Per invoice commodity usa luce, gas o unknown. Per cte priceType
usa fisso, variabile, ibrido o unknown; complexity usa semplice, fasce, soglie o mista. Se una CTE prevede un periodo iniziale interamente fisso seguito da un periodo variabile, usa priceType=ibrido e valorizza initialFixedMonths e initialFixedUnitPrice. Se una CTE offre sia fasce sia un'opzione monoraria esplicita, imposta hasMonorariaOption=true e monorariaUnitPrice al valore F0/monorario; non considerarla un'offerta a fasce non accettabile. Non confondere mai annualFixedFee, espresso in €/POD/anno o €/PDR/anno, con fixedUnitPrice, initialFixedUnitPrice o monorariaUnitPrice, espressi in €/kWh o €/Smc. Determina customerType
da destinazione/tipologia del contatore: altri usi, usi diversi e usi non domestici sono business; domestico
residente/non residente e clienti non domestici sono domestico. Se non è chiaro usa unknown.
Segnala ricalcoli, storni, consumo zero, periodi incompleti, scontrino mancante/incompleto e prezzi non
ricostruibili. hasMissingEnergySlip deve essere true se non sono presenti le righe necessarie della vendita.
priceReconstructable deve essere false se il prezzo medio o la quota fissa della sola vendita non sono
determinabili senza fare ipotesi. referenceMonths deve usare YYYY-MM. billingMonths è la durata del periodo
in mesi. Per luce indica networkLosses incluse o escluse; per gas non_applicabile.`;

function outputText(payload) {
  for (const item of payload.output || []) {
    for (const part of item.content || []) {
      if (typeof part?.text === 'string') return part.text;
    }
  }
  for (const candidate of payload.candidates || []) {
    for (const part of candidate.content?.parts || []) {
      if (typeof part?.text === 'string') return part.text;
    }
  }
  return null;
}

function attachIndexValues(data) {
  if (data.cte?.priceType !== 'variabile') return { ...data, indexValues: [] };
  const isPun = data.cte.referenceIndex === 'PUN';
  const isPsv = data.cte.referenceIndex === 'PSV';
  if (!isPun && !isPsv) return { ...data, indexValues: [] };
  const values = isPun
    ? configuredMonthlyValues('PUN_MONTHLY_VALUES_JSON', PUN)
    : configuredMonthlyValues('PSV_MONTHLY_VALUES_JSON', PSV);
  const sourceTitle = isPun
    ? 'PUN Index GME - valori mensili'
    : 'PSV mensile configurato dalla fonte ufficiale';
  const sourceUrl = isPun
    ? 'https://www.mercatoelettrico.org/it-it/Home/Pubblicazioni/Indici-GME/PUNIndexGme'
    : 'https://www.arera.it/area-operatori/prezzi-e-tariffe/valore-cmemm-vulnerabili';
  const months = [...new Set(data.invoice?.referenceMonths || [])];
  return {
    ...data,
    indexValues: months
      .filter((month) => Number.isFinite(values[month]))
      .map((month) => ({
        month,
        value: values[month],
        unit: isPun ? 'EUR/kWh' : 'EUR/Smc',
        sourceTitle,
        sourceUrl,
      })),
  };
}

async function requestModel(apiKey, cteDocument, invoiceDocument) {
  let lastStatus = 502;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MODEL,
        input: [
          {
            role: 'user',
            content: [
              { type: 'input_text', text: PROMPT },
              {
                type: 'input_file',
                filename: 'cte.pdf',
                file_data: `data:application/pdf;base64,${cteDocument}`,
                detail: 'high',
              },
              {
                type: 'input_file',
                filename: 'fattura.pdf',
                file_data: `data:application/pdf;base64,${invoiceDocument}`,
                detail: 'high',
              },
            ],
          },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'bill_analysis',
            strict: true,
            schema: ANALYSIS_SCHEMA,
          },
        },
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (response.ok) return JSON.parse(payload.output_text || outputText(payload) || '{}');
    const apiCode = payload.error?.code || payload.error?.type;
    if (apiCode === 'insufficient_quota' || apiCode === 'credit_balance_exhausted') {
      throw new Error('OPENAI_QUOTA_EXHAUSTED');
    }
    lastStatus = response.status;
    if (![408, 429, 500, 502, 503, 504].includes(response.status)) break;
    if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 900));
  }
  throw new Error(`OPENAI_${lastStatus}`);
}

async function analyzeDocuments(apiKey, cteBuffer, invoiceBuffer) {
  if (!apiKey) throw new Error('OPENAI_NOT_CONFIGURED');
  const result = await requestModel(
    apiKey,
    cteBuffer.toString('base64'),
    invoiceBuffer.toString('base64')
  );
  const enriched = attachIndexValues(result);
  return { ...enriched, comparison: calculateComparison(enriched) };
}

module.exports = { analyzeDocuments };
