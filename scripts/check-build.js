#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');

const filesToCheck = [
  'server.js',
  'switch-opportunities.js',
  'public/app.js',
  'public/config.js',
  'public/baserowClient.js',
  'public/motivationQuotes.js',
  'scripts/hash-password.js',
  'scripts/fix-competence-month.js',
  'scripts/setup-baserow-forniture.js',
  'scripts/migrate-contract-supplies.js',
  'scripts/migrate-multipoint-supplies.js',
  'scripts/backfill-switch-ok-dates.js',
  'scripts/backfill-client-fields.js',
];

let hasErrors = false;

filesToCheck.forEach((relativePath) => {
  const filePath = path.resolve(__dirname, '..', relativePath);
  const result = spawnSync(process.execPath, ['--check', filePath], {
    encoding: 'utf8',
  });

  if (result.status === 0) {
    console.log(`OK ${relativePath}`);
    return;
  }

  hasErrors = true;
  console.error(`ERRORE ${relativePath}`);
  if (result.stderr) console.error(result.stderr.trim());
  if (result.stdout) console.error(result.stdout.trim());
});

if (hasErrors) {
  process.exitCode = 1;
} else {
  console.log(`Controllo build completato: ${filesToCheck.length} file verificati.`);
}
