#!/usr/bin/env node
/**
 * generate_pptx.js — CLI entry-point for the pptx-creator skill
 *
 * Usage:
 *   node scripts/generate_pptx.js --theme hsbc --output out/demo.pptx
 *   node scripts/generate_pptx.js --theme midnight-executive
 *   node scripts/generate_pptx.js --list           # show all available themes
 *
 * Requires:  npm install pptxgenjs  (in skill root)
 */

'use strict';

const path = require('path');
const fs   = require('fs');
const pptxgen = require('pptxgenjs');

const { getTheme, listThemes } = require('../assets/themes/index');
const { buildSampleDeck }      = require('../examples/sample_deck');

// ─── CLI arg parsing ──────────────────────────────────────────────────────────
const args = process.argv.slice(2);

if (args.includes('--list') || args.includes('-l')) {
  console.log('\nAvailable themes:\n');
  const col = (s, w) => s.padEnd(w);
  console.log(col('Key', 24) + col('Label', 26) + 'Feel');
  console.log('─'.repeat(72));
  listThemes().forEach(t => {
    console.log(col(t.key, 24) + col(t.label, 26) + t.feel);
  });
  console.log('');
  process.exit(0);
}

const themeArg = args[args.indexOf('--theme') + 1] || args[args.indexOf('-t') + 1] || 'hsbc';
const outputArg = args[args.indexOf('--output') + 1] || args[args.indexOf('-o') + 1];

// ─── Resolve theme ────────────────────────────────────────────────────────────
let theme;
try {
  theme = getTheme(themeArg);
} catch (e) {
  console.error(`\n❌  ${e.message}\n`);
  process.exit(1);
}

// ─── Resolve output path ──────────────────────────────────────────────────────
const outDir  = path.join(__dirname, '..', 'out');
const outFile = outputArg
  ? path.resolve(outputArg)
  : path.join(outDir, `${themeArg}.pptx`);

if (!fs.existsSync(path.dirname(outFile))) {
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
}

// ─── Generate ─────────────────────────────────────────────────────────────────
console.log(`\n🎨  Generating "${theme.label}" presentation…`);
const pres = new pptxgen();
buildSampleDeck(pres, theme);

pres.writeFile({ fileName: outFile })
  .then(() => {
    const size = (fs.statSync(outFile).size / 1024).toFixed(1);
    console.log(`✅  Saved: ${outFile}  (${size} KB)\n`);
  })
  .catch(err => {
    console.error('❌  Error writing file:', err.message);
    process.exit(1);
  });
