'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateComparison } = require('../preventivatore-rules');

function base(overrides = {}) {
  return {
    confidence: 0.95,
    invoice: {
      commodity: 'luce',
      meterDestination: 'Domestico residente',
      referenceMonths: ['2026-03'],
      billingMonths: 1,
      consumption: 281,
      unitPrice: 0.194804,
      fixedFeeTotal: 8.36,
      hasRecalculations: false,
      hasZeroConsumption: false,
      hasIncompletePeriod: false,
      hasMissingEnergySlip: false,
      priceReconstructable: true,
      comparable: true,
      ...overrides.invoice,
    },
    cte: {
      commodity: 'luce',
      customerType: 'domestico',
      priceType: 'fisso',
      complexity: 'semplice',
      initialFixedMonths: null,
      initialFixedUnitPrice: null,
      fixedUnitPrice: 0.103,
      hasMonorariaOption: false,
      monorariaUnitPrice: null,
      annualFixedFee: 100.32,
      networkLosses: 'incluse',
      ...overrides.cte,
    },
    indexValues: overrides.indexValues || [],
  };
}

test('blocca CTE luce e fattura gas', () => {
  const result = calculateComparison(base({ invoice: { commodity: 'gas' } }));
  assert.equal(result.code, 'COMMODITY_MISMATCH');
});

test('blocca offerta ibrida', () => {
  const result = calculateComparison(base({ cte: { priceType: 'ibrido', complexity: 'soglie' } }));
  assert.equal(result.code, 'HYBRID_OFFER');
});

test('calcola una CTE fissa nei primi mesi di una formula ibrida', () => {
  const result = calculateComparison(
    base({
      cte: {
        priceType: 'ibrido',
        complexity: 'semplice',
        initialFixedMonths: 24,
        initialFixedUnitPrice: 0.699,
        annualFixedFee: 144,
      },
    })
  );
  assert.equal(result.ok, true);
  assert.equal(result.offerPrice, 0.699);
  assert.equal(result.offerFixed, 12);
});

test('calcola il confronto sulla sola fattura', () => {
  const result = calculateComparison(base());
  assert.equal(result.ok, true);
  assert.ok(Math.abs(result.currentTotal - 63.1) < 0.001);
  assert.equal(result.offerFixed, 8.36);
  assert.equal(result.saving > 0, true);
});

test('calcola PUN medio semplice per due mesi', () => {
  const result = calculateComparison(
    base({
      invoice: { referenceMonths: ['2026-03', '2026-04'], billingMonths: 2 },
      cte: { priceType: 'variabile', spread: 0.01, referenceIndex: 'PUN', annualFixedFee: 120 },
      indexValues: [
        { month: '2026-03', value: 0.1434 },
        { month: '2026-04', value: 0.11947 },
      ],
    })
  );
  assert.equal(result.ok, true);
  assert.equal(result.indexAverage, (0.1434 + 0.11947) / 2);
});
