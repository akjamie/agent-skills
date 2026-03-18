#!/usr/bin/env node
/**
 * generate_pptx.js — CLI entry-point for the pptx-creator skill
 *
 * Usage:
 *   node scripts/generate_pptx.js [OPTIONS]
 *
 * Options:
 *   --theme, -t  <name>   Theme key to use (default: midnight-executive)
 *   --output, -o <path>   Output file path (default: out/<theme>.pptx)
 *   --list, -l            List all available themes and exit
 *   --json                Emit a JSON result line to stdout for agentic parsing
 *   --help, -h            Show this help message and exit
 *
 * Examples:
 *   node scripts/generate_pptx.js --theme hsbc
 *   node scripts/generate_pptx.js --theme ocean-gradient --output ~/Desktop/demo.pptx
 *   node scripts/generate_pptx.js --list
 *   node scripts/generate_pptx.js --theme midnight-executive --json
 *
 * Requires:  npm install pptxgenjs --no-save  (run once in the skill root)
 */

'use strict';

const path    = require('path');
const fs      = require('fs');
const pptxgen = require('pptxgenjs');

const { getTheme, listThemes } = require('../assets/themes/index');
const { buildSampleDeck }      = require('../examples/sample_deck');

// ─── CLI arg parsing ──────────────────────────────────────────────────────────
const args = process.argv.slice(2);

const HELP = `
Usage: node scripts/generate_pptx.js [OPTIONS]

Generate a professionally-themed PowerPoint presentation (.pptx).

Options:
  --theme,  -t <name>   Theme key to apply (default: midnight-executive)
  --output, -o <path>   Destination file path (default: out/<theme>.pptx)
  --list,   -l          Print all available themes and exit
  --json                Emit a single JSON result line for agentic parsing
  --help,   -h          Show this help message and exit

Available theme keys:
  hsbc                  Corporate / Banking
  midnight-executive    Premium / Finance   (default)
  forest-moss           Sustainability / Nature
  coral-energy          Startup / Energy
  warm-terracotta       HR / Culture / People
  ocean-gradient        Tech / Data / Analytics
  charcoal-minimal      Minimalist / Design
  teal-trust            Health / Medical / Trust
  berry-cream           Luxury / Lifestyle
  sage-calm             Wellness / Education
  cherry-bold           Bold / Marketing / Brand

Examples:
  node scripts/generate_pptx.js --theme hsbc
  node scripts/generate_pptx.js --theme ocean-gradient --output ~/Desktop/demo.pptx
  node scripts/generate_pptx.js --theme midnight-executive --json
  node scripts/generate_pptx.js --list
`;

if (args.includes('--help') || args.includes('-h')) {
  console.log(HELP);
  process.exit(0);
}

if (args.includes('--list') || args.includes('-l')) {
  console.log('\nAvailable themes:\n');
  const col = (s, w) => String(s).padEnd(w);
  console.log(col('Key', 24) + col('Label', 26) + 'Feel');
  console.log('─'.repeat(72));
  listThemes().forEach(t => {
    console.log(col(t.key, 24) + col(t.label, 26) + t.feel);
  });
  console.log('');
  process.exit(0);
}

const useJson  = args.includes('--json');
const themeIdx = args.indexOf('--theme') !== -1 ? args.indexOf('--theme') : args.indexOf('-t');
const outIdx   = args.indexOf('--output') !== -1 ? args.indexOf('--output') : args.indexOf('-o');
const themeArg = themeIdx !== -1 ? args[themeIdx + 1] : 'midnight-executive';
const outputArg = outIdx !== -1 ? args[outIdx + 1] : null;

if (!themeArg) {
  console.error('Error: --theme requires a value. Run --list to see available themes.');
  process.exit(1);
}

// ─── Resolve theme ────────────────────────────────────────────────────────────
let theme;
try {
  theme = getTheme(themeArg);
} catch (e) {
  console.error(`Error: ${e.message}`);
  console.error('Run --list to see all available theme keys.');
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
if (!useJson) console.log(`\n🎨  Generating "${theme.label}" presentation…`);

const pres = new pptxgen();
buildSampleDeck(pres, theme);

const startMs = Date.now();
pres.writeFile({ fileName: outFile })
  .then(() => {
    const sizeKb  = (fs.statSync(outFile).size / 1024).toFixed(1);
    const elapsed = Date.now() - startMs;
    if (useJson) {
      // Structured output for agentic pipelines
      console.log(JSON.stringify({
        status:  'ok',
        theme:   themeArg,
        label:   theme.label,
        file:    outFile,
        size_kb: parseFloat(sizeKb),
        elapsed_ms: elapsed,
      }));
    } else {
      console.log(`✅  Saved: ${outFile}  (${sizeKb} KB)\n`);
    }
  })
  .catch(err => {
    if (useJson) {
      console.log(JSON.stringify({ status: 'error', message: err.message }));
    } else {
      console.error(`Error writing file: ${err.message}`);
    }
    process.exit(1);
  });

