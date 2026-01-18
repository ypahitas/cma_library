#!/usr/bin/env node
// Wrapper script to run merge-i18n-files.ts with ts-node
require('ts-node').register({
  project: './tsconfig.ts-node.json'
});

// Set process.argv to include script arguments
const args = process.argv.slice(2);
process.argv = ['node', './scripts/merge-i18n-files.ts', ...args];

require('./merge-i18n-files.ts');
