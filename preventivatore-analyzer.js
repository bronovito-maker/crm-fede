const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1';

const PUN = {
  '2025-01': 0.143028, '2025-02': 0.15036, '2025-03': 0.120548, '2025-04': 0.099854,
  '2025-05': 0.093576, '2025-06': 0.111782, '2025-07': 0.11313, '2025-08': 0.108789,
  '2025-09': 0.109076, '2025-10': 0.111042, '2025-11': 0.117085, '2025-12': 0.11549,
  '2026-01': 0.13266, '2026-02': 0.11441, '2026-03': 0.1434, '2026-04': 0.11947,
  '2026-05': 0.11935, '2026-06': 0.132505, '2026-07': 0.157038,
};

const PSV = {
  '2024-01': 0.333736, '2024-02': 0.297889, '2024-03': 0.307491, '2024-04': 0.326265,
  '2024-05': 0.352949, '2024-06': 0.386328, '2024-07': 0.378862, '2024-08': 0.43379,
  '2024-09': 0.415249, '2024-10': 0.436849, '2024-11': 0.482922, '2024-12': 0.509233,
  '2025-01': 0.533576, '2025-02': 0.566178, '2025-03': 0.455069, '2025-04': 0.402365,
  '2025-05': 0.40301, '2025-06': 0.418839, '2025-07': 0.392478, '2025-08': 0.380886,
  '2025-09': 0.373358, '2025-10': 0.353669, '2025-11': 0.348704, '2025-12': 0.327985,
  '2026-01': 0.403934, '2026-02': 0.376788, '2026-03': 0.557699, '2026-04': 0.492325,
  '2026-05': 0.501752, '2026-06': 0.504871, '2026-07': 0.606612,
};

const ANALYSIS_SCHEMA = {
  type: 'object',
  required: ['confidence', 'invoice', 'cte'],
  additionalProperties: false,
  properties: {
    confidence: { type: 'number' },
    invoice: { type: 'object', properties: {
      customerName: { type: 'string' }, taxId: { type: 'string' }, vatNumber: { type: 'string' },
      email: { type: 'string' }, phone: { type: 'string' }, address: { type: 'string' }, pod: { type: 'string' }, pdr: { type: 'string' },
      supplier: { type: 'string' }, commodity: { type: 'string' }, meterDestination: { type: 'string' },
      billingPeriod: { type: 'string' }, billingMonths: { type: ['number', 'null'] },
      referenceMonths: { type: 'array', items: { type: 'string' } }, consumption: { type: ['number', 'null'] },
      unitPrice: { type: ['number', 'null'] }, fixedFeeTotal: { type: ['number', 'null'] },
      hasRecalculations: { type: 'boolean' }, comparable: { type: 'boolean' },
    }, required: ['customerName', 'taxId', 'vatNumber', 'email', 'phone', 'address', 'pod', 'pdr', 'supplier', 'commodity', 'meterDestination', 'billingPeriod', 'billingMonths', 'referenceMonths', 'consumption', 'unitPrice', 'fixedFeeTotal', 'hasRecalculations', 'comparable'], additionalProperties: false },
    cte: { type: 'object', properties: {
      supplier: { type: 'string' }, commodity: { type: 'string' }, customerType: { type: 'string' },
      priceType: { type: 'string' }, complexity: { type: 'string' }, fixedUnitPrice: { type: ['number', 'null'] },
      spread: { type: ['number', 'null'] }, referenceIndex: { type: 'string' },
      networkLosses: { type: 'string' }, annualFixedFee: { type: ['number', 'null'] },
      formulaMultiplier: { type: ['number', 'null'] }, formulaAdditive: { type: ['number', 'null'] },
      hasExplicitFormula: { type: 'boolean' },
    }, required: ['supplier', 'commodity', 'customerType', 'priceType', 'complexity', 'fixedUnitPrice', 'spread', 'referenceIndex', 'networkLosses', 'annualFixedFee', 'formulaMultiplier', 'formulaAdditive', 'hasExplicitFormula'], additionalProperties: false },
  },
};

const PROMPT = `Sei un analista di bollette e CTE italiane. Ricevi una CTE/offerta e una fattura.
Estrai solo dati realmente presenti, senza inventare o stimare. Il confronto riguarda esclusivamente
la vendita della materia e la quota fissa del venditore: escludi rete, trasporto, contatore, oneri,
imposte, IVA e altre partite.

Restituisci JSON conforme allo schema. Per invoice commodity usa luce, gas o unknown. Per cte priceType
usa fisso, variabile, ibrido o unknown; complexity usa semplice, fasce, soglie o mista. Determina customerType
da destinazione/tipologia del contatore: altri usi, usi diversi e usi non domestici sono business; domestico
residente/non residente e clienti non domestici sono domestico. Se non è chiaro usa unknown.
Segnala ricalcoli o dati non confrontabili. referenceMonths deve usare YYYY-MM. billingMonths è la durata
del periodo in mesi. Per luce indica networkLosses incluse o escluse; per gas non_applicabile.`;

function outputText(payload) {
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
  const values = isPun ? PUN : PSV;
  const sourceTitle = isPun ? 'PUN Index GME - valori mensili' : 'ARERA - media mensile PSV day-ahead';
  const sourceUrl = isPun
    ? 'https://gme.mercatoelettrico.org/it-it/Home/Risultati/Elettricita/MGP/Risultati/PUN'
    : 'https://www.arera.it/area-operatori/prezzi-e-tariffe/valore-cmemm-vulnerabili';
  const months = [...new Set(data.invoice?.referenceMonths || [])];
  return { ...data, indexValues: months.filter((month) => Number.isFinite(values[month])).map((month) => ({
    month, value: values[month], unit: isPun ? 'EUR/kWh' : 'EUR/Smc', sourceTitle, sourceUrl,
  })) };
}

async function requestModel(apiKey, cteDocument, invoiceDocument) {
  let lastStatus = 502;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MODEL,
        input: [{ role: 'user', content: [
          { type: 'input_text', text: PROMPT },
          { type: 'input_file', filename: 'cte.pdf', file_data: `data:application/pdf;base64,${cteDocument}` , detail: 'high' },
          { type: 'input_file', filename: 'fattura.pdf', file_data: `data:application/pdf;base64,${invoiceDocument}`, detail: 'high' },
        ] }],
        text: { format: { type: 'json_schema', name: 'bill_analysis', strict: true, schema: ANALYSIS_SCHEMA } },
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (response.ok) return JSON.parse(payload.output_text || outputText(payload) || '{}');
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
    invoiceBuffer.toString('base64'),
  );
  return attachIndexValues(result);
}

module.exports = { analyzeDocuments };
