'use strict';

function text(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function finitePositive(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function finiteNonNegative(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function customerTypeFromDestination(value) {
  const destination = text(value).replace(/\s+/g, ' ');
  if (/altri usi|usi diversi/.test(destination)) return 'business';
  if (/domestico residente|domestico non residente|clienti non domestici/.test(destination)) {
    return 'domestico';
  }
  return 'unknown';
}

function block(code, title, message) {
  return { ok: false, code, title, message };
}

function calculateComparison(data) {
  const invoice = data?.invoice || {};
  const cte = data?.cte || {};
  const commodity = text(invoice.commodity);
  const cteCommodity = text(cte.commodity);
  if (!Number.isFinite(Number(data?.confidence)) || Number(data.confidence) < 0.72) {
    return block(
      'ANALYSIS_CONFIDENCE_LOW',
      'Analisi non sufficientemente affidabile',
      'Il contenuto dei documenti non è stato riconosciuto con sufficiente sicurezza. Verifica i PDF e riprova.'
    );
  }
  if (!['luce', 'gas'].includes(commodity) || !['luce', 'gas'].includes(cteCommodity)) {
    return block(
      'COMMODITY_UNKNOWN',
      'Tipo di fornitura non riconosciuto',
      'Non è possibile stabilire con sicurezza se i documenti riguardano luce o gas.'
    );
  }
  if (commodity !== cteCommodity) {
    return block(
      'COMMODITY_MISMATCH',
      'I documenti non corrispondono',
      `La CTE riguarda ${cteCommodity}, mentre la fattura riguarda ${commodity}.`
    );
  }

  const customer = customerTypeFromDestination(invoice.meterDestination);
  const cteCustomer = text(cte.customerType);
  if (customer === 'unknown') {
    return block(
      'CUSTOMER_TYPE_UNKNOWN',
      'Conferma il tipo di utenza',
      'La destinazione del contatore non è riconoscibile. Seleziona Domestico o Business prima di procedere.'
    );
  }
  if (!['domestico', 'business'].includes(cteCustomer)) {
    return block(
      'CTE_CUSTOMER_TYPE_UNKNOWN',
      'Destinazione CTE non chiara',
      'Non è possibile stabilire se la CTE è destinata a clienti domestici o business.'
    );
  }
  if (customer !== cteCustomer) {
    return block(
      'CUSTOMER_TYPE_MISMATCH',
      'CTE non adatta al cliente',
      `La fattura risulta ${customer}, mentre la CTE è per clienti ${cteCustomer}.`
    );
  }

  if (cte.priceType === 'ibrido' || ['soglie', 'mista'].includes(text(cte.complexity))) {
    return block(
      'HYBRID_OFFER',
      'Offerta ibrida non supportata',
      'La CTE applica prezzi fissi e variabili in base a soglie o scaglioni.'
    );
  }
  if (!['fisso', 'variabile'].includes(text(cte.priceType))) {
    return block(
      'PRICE_TYPE_UNKNOWN',
      'Tipo di prezzo non riconosciuto',
      'La CTE non indica un prezzo soltanto fisso o soltanto variabile.'
    );
  }

  const months = Array.isArray(invoice.referenceMonths)
    ? [...new Set(invoice.referenceMonths.filter((month) => /^\d{4}-\d{2}$/.test(month)))]
    : [];
  const billingMonths = Number(invoice.billingMonths);
  if (!finitePositive(invoice.consumption)) {
    return block(
      'CONSUMPTION_INVALID',
      'Consumo non confrontabile',
      'La fattura non contiene un consumo positivo ricostruibile con sicurezza.'
    );
  }
  if (
    !finitePositive(invoice.unitPrice) ||
    !finiteNonNegative(invoice.fixedFeeTotal) ||
    !finitePositive(billingMonths)
  ) {
    return block(
      'INVOICE_VALUES_MISSING',
      'Dati economici insufficienti',
      'Non sono disponibili con sicurezza prezzo di vendita, quota fissa del venditore o durata della fattura.'
    );
  }
  if (!months.length || months.length !== Math.max(1, Math.round(billingMonths))) {
    return block(
      'BILLING_PERIOD_INVALID',
      'Periodo della fattura non affidabile',
      'Il periodo di competenza o il numero di mesi fatturati non è ricostruibile con sicurezza.'
    );
  }
  if (
    invoice.hasRecalculations ||
    invoice.comparable === false ||
    invoice.hasZeroConsumption ||
    invoice.hasIncompletePeriod ||
    invoice.hasMissingEnergySlip ||
    invoice.priceReconstructable === false
  ) {
    return block(
      'INVOICE_NOT_COMPARABLE',
      'Fattura non confrontabile',
      'Sono presenti ricalcoli, storni, consumi anomali, periodo incompleto o righe di vendita non ricostruibili.'
    );
  }
  if (!finiteNonNegative(cte.annualFixedFee)) {
    return block(
      'CTE_FIXED_FEE_MISSING',
      'Costo fisso CTE non trovato',
      'Non è disponibile con sicurezza il costo fisso annuo del venditore.'
    );
  }

  let offerPrice;
  let indexAverage = null;
  let indexValues = [];
  const fixedUnitPrice =
    cte.hasMonorariaOption && finitePositive(cte.monorariaUnitPrice)
      ? cte.monorariaUnitPrice
      : cte.fixedUnitPrice;

  if (cte.priceType === 'fisso') {
    if (!finitePositive(fixedUnitPrice))
      return block(
        'CTE_PRICE_MISSING',
        'Prezzo CTE non trovato',
        'Il prezzo fisso non è leggibile con sicurezza.'
      );
    offerPrice = fixedUnitPrice;
  } else {
    const expectedIndex = commodity === 'luce' ? 'PUN' : 'PSV';
    if (text(cte.referenceIndex) !== expectedIndex.toLowerCase()) {
      return block(
        'INDEX_UNKNOWN',
        'Indice non riconosciuto',
        `Per questa offerta è necessario il riferimento ${expectedIndex}.`
      );
    }
    indexValues = (data.indexValues || []).filter(
      (item) => months.includes(item.month) && finitePositive(item.value)
    );
    if (indexValues.length !== months.length) {
      return block(
        'INDEX_UNAVAILABLE',
        `${expectedIndex} del periodo non disponibile`,
        `Non sono disponibili tutti i valori mensili ufficiali di ${expectedIndex} per il periodo della fattura.`
      );
    }
    indexAverage = indexValues.reduce((sum, item) => sum + item.value, 0) / indexValues.length;
    if (!finitePositive(cte.spread))
      return block(
        'SPREAD_MISSING',
        'Spread non trovato',
        'Lo spread della CTE non è leggibile con sicurezza.'
      );
    if (
      cte.hasExplicitFormula &&
      finitePositive(cte.formulaMultiplier) &&
      cte.formulaMultiplier !== 1
    ) {
      return block(
        'FORMULA_NOT_SUPPORTED',
        'Formula CTE non supportata',
        'La CTE usa una formula diversa da indice mensile più spread.'
      );
    }
    if (
      cte.hasExplicitFormula &&
      finiteNonNegative(cte.formulaAdditive) &&
      Math.abs(cte.formulaAdditive - cte.spread) > 0.000001
    ) {
      return block(
        'FORMULA_NOT_SUPPORTED',
        'Formula CTE non supportata',
        'La formula della CTE non corrisponde a indice mensile più spread.'
      );
    }
    offerPrice = indexAverage + cte.spread;
  }

  if (commodity === 'luce' && text(cte.networkLosses) !== 'incluse') offerPrice *= 1.1;
  const offerFixed = (cte.annualFixedFee / 12) * billingMonths;
  const currentEnergy = invoice.consumption * invoice.unitPrice;
  const offerEnergy = invoice.consumption * offerPrice;
  const currentTotal = currentEnergy + invoice.fixedFeeTotal;
  const offerTotal = offerEnergy + offerFixed;
  const saving = currentTotal - offerTotal;
  return {
    ok: true,
    commodity,
    customer,
    months,
    billingMonths,
    indexValues,
    indexAverage,
    offerPrice,
    offerFixed,
    currentEnergy,
    offerEnergy,
    currentTotal,
    offerTotal,
    saving,
    percentage: currentTotal > 0 ? (saving / currentTotal) * 100 : null,
  };
}

module.exports = { calculateComparison, customerTypeFromDestination };
