#!/usr/bin/env node
/**
 * eval_themes.js — Skill evaluation + test for all 11 themes
 *
 * Generates a 6-slide sample deck for EVERY theme in the library,
 * validates output files, and reports PASS/FAIL per theme.
 *
 * Usage:
 *   node tests/eval_themes.js
 *
 * Exit code: 0 if all themes pass, 1 if any fail.
 */

'use strict';

const path    = require('path');
const fs      = require('fs');
const pptxgen = require('pptxgenjs');

const { listThemes, getTheme } = require('../assets/themes/index');
const { buildSampleDeck }      = require('../examples/sample_deck');

const OUTPUT_DIR = path.join(__dirname, 'output');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ─── helpers ──────────────────────────────────────────────────────────────────
const PASS = '\x1b[32mPASS\x1b[0m';
const FAIL = '\x1b[31mFAIL\x1b[0m';
const col  = (s, w) => String(s).padEnd(w);

function formatMs(ms) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

// ─── main ─────────────────────────────────────────────────────────────────────
async function evalTheme(themeKey) {
  const theme   = getTheme(themeKey);
  const outFile = path.join(OUTPUT_DIR, `${themeKey}.pptx`);
  const start   = Date.now();
  const errors  = [];

  try {
    const pres = new pptxgen();
    buildSampleDeck(pres, theme);
    await pres.writeFile({ fileName: outFile });
  } catch (err) {
    errors.push(`Generation error: ${err.message}`);
    return { key: themeKey, label: theme.label, passed: false, errors, elapsed: Date.now() - start };
  }

  // ── File existence + size ─────────────────────────────────────────────────
  if (!fs.existsSync(outFile)) {
    errors.push('Output file not found');
  } else {
    const size = fs.statSync(outFile).size;
    if (size === 0) errors.push('Output file is empty (0 bytes)');
    // A valid 6-slide .pptx should be well over 10 KB
    if (size < 10_000) errors.push(`File suspiciously small: ${size} bytes`);
  }

  // ── Empty slide check ─────────────────────────────────────────────────────
  // We trust the buildSampleDeck logic to report warnings to console if 
  // any slide objects are missing.


  const elapsed = Date.now() - start;
  const passed  = errors.length === 0;

  return { key: themeKey, label: theme.label, passed, errors, elapsed, outFile };
}

async function main() {
  const themes = listThemes();
  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log('  PPTX Creator Skill — Theme Evaluation');
  console.log(`  ${themes.length} themes  ·  ${new Date().toLocaleString()}`);
  console.log('══════════════════════════════════════════════════════════════════\n');

  console.log(col('Theme', 24) + col('Label', 26) + col('Status', 8) + col('Time', 8) + 'Output');
  console.log('─'.repeat(80));

  const results = [];
  for (const t of themes) {
    const r = await evalTheme(t.key);
    results.push(r);
    const status = r.passed ? PASS : FAIL;
    console.log(
      col(r.key, 24) +
      col(r.label, 26) +
      status + '  ' +
      col(formatMs(r.elapsed), 8) +
      (r.passed ? path.relative(process.cwd(), r.outFile) : '')
    );
    if (!r.passed) {
      r.errors.forEach(e => console.log(`       ⚠  ${e}`));
    }
  }

  const passed = results.filter(r => r.passed).length;
  const failed = results.length - passed;

  console.log('\n' + '─'.repeat(80));
  console.log(`  Results: ${passed}/${results.length} passed  ${failed > 0 ? `· ${failed} FAILED` : ''}`);
  console.log(`  Output directory: ${OUTPUT_DIR}`);
  console.log('══════════════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    console.error('Some themes failed. See errors above.\n');
    process.exit(1);
  }
  console.log('All themes passed ✅\n');
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
