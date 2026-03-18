#!/usr/bin/env node
/**
 * eval_themes.js — Skill evaluation harness for all 11 themes
 *
 * Generates a 6-slide sample deck for EVERY theme in the library,
 * validates output files, and reports PASS/FAIL per theme.
 *
 * Usage:
 *   node scripts/eval_themes.js
 *   node scripts/eval_themes.js --json    # machine-readable output
 *   node scripts/eval_themes.js --help
 *
 * Exit code: 0 if all themes pass, 1 if any fail.
 */

'use strict';

const path    = require('path');
const fs      = require('fs');
const pptxgen = require('pptxgenjs');

const { listThemes, getTheme } = require('../assets/themes/index');
const { buildSampleDeck }      = require('../examples/sample_deck');

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node scripts/eval_themes.js [OPTIONS]

Generate a sample deck for every theme and report PASS/FAIL per theme.

Options:
  --json     Emit a JSON summary object to stdout instead of human-readable output
  --help     Show this message and exit

Exit code: 0 if all themes pass, 1 if any fail.
Output files are written to evals/output/<theme>.pptx
  `);
  process.exit(0);
}

const useJson = args.includes('--json');

// Eval output lives beside evals/evals.json, not inside scripts/
const OUTPUT_DIR = path.join(__dirname, '..', 'evals', 'output');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ─── helpers ──────────────────────────────────────────────────────────────────
const PASS = '\x1b[32mPASS\x1b[0m';
const FAIL = '\x1b[31mFAIL\x1b[0m';
const col  = (s, w) => String(s).padEnd(w);

function formatMs(ms) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

// ─── per-theme eval ───────────────────────────────────────────────────────────
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
    if (size < 10_000) errors.push(`File suspiciously small: ${size} bytes (expected > 10 KB for a 6-slide deck)`);
  }

  const elapsed = Date.now() - start;
  const passed  = errors.length === 0;

  return { key: themeKey, label: theme.label, passed, errors, elapsed, outFile };
}

// ─── main ─────────────────────────────────────────────────────────────────────
async function main() {
  const themes = listThemes();

  if (!useJson) {
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('  PPTX Creator Skill — Theme Evaluation');
    console.log(`  ${themes.length} themes  ·  ${new Date().toLocaleString()}`);
    console.log('══════════════════════════════════════════════════════════════════\n');
    console.log(col('Theme', 24) + col('Label', 26) + col('Status', 8) + col('Time', 8) + 'Output');
    console.log('─'.repeat(80));
  }

  const results = [];
  for (const t of themes) {
    const r = await evalTheme(t.key);
    results.push(r);

    if (!useJson) {
      const status = r.passed ? PASS : FAIL;
      console.log(
        col(r.key, 24) +
        col(r.label, 26) +
        status + '  ' +
        col(formatMs(r.elapsed), 8) +
        (r.passed ? path.relative(process.cwd(), r.outFile) : '')
      );
      if (!r.passed) r.errors.forEach(e => console.log(`       ⚠  ${e}`));
    }
  }

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.length - passedCount;

  if (useJson) {
    console.log(JSON.stringify({
      total: results.length,
      passed: passedCount,
      failed: failedCount,
      pass_rate: passedCount / results.length,
      results: results.map(r => ({
        key: r.key,
        label: r.label,
        passed: r.passed,
        elapsed_ms: r.elapsed,
        errors: r.errors,
      })),
    }));
  } else {
    console.log('\n' + '─'.repeat(80));
    console.log(`  Results: ${passedCount}/${results.length} passed  ${failedCount > 0 ? `· ${failedCount} FAILED` : ''}`);
    console.log(`  Output directory: ${OUTPUT_DIR}`);
    console.log('══════════════════════════════════════════════════════════════════\n');
  }

  if (failedCount > 0) {
    if (!useJson) console.error('Some themes failed. See errors above.\n');
    process.exit(1);
  }
  if (!useJson) console.log('All themes passed ✅\n');
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
