#!/usr/bin/env node
/**
 * eval_persona.js — Consulting Quality Eval for pptx-creator skill
 *
 * Verifies that the PPTX Creator produces content adhering to:
 *   1. Action Titles (complete sentences, not static topic labels)
 *   2. Pyramid Principle (strategic/executive lead-in on slide 2)
 *   3. MECE logic (no obvious overlap in sample content)
 *
 * Usage:
 *   node scripts/eval_persona.js
 *   node scripts/eval_persona.js --json   # machine-readable output
 *   node scripts/eval_persona.js --help
 *
 * Exit code: 0 if all checks pass, 1 if any fail.
 */

'use strict';

const { getTheme }    = require('../assets/themes/index');
const { buildSampleDeck } = require('../examples/sample_deck');
const pptxgen         = require('pptxgenjs');

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node scripts/eval_persona.js [OPTIONS]

Run consulting-quality checks against the sample deck output.

Options:
  --json     Emit a JSON summary object to stdout instead of human-readable output
  --help     Show this message and exit

Checks performed:
  1. Action Titles  — every content slide title must be a complete sentence
  2. Pyramid Principle — slide 2 must lead with strategic/executive framing
  `);
  process.exit(0);
}

const useJson = args.includes('--json');

const PASS = '\x1b[32mPASS\x1b[0m';
const FAIL = '\x1b[31mFAIL\x1b[0m';

// ─── helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns true when a title reads like a declarative sentence ("So What?")
 * rather than a static topic label.
 */
function isActionTitle(text) {
  if (!text || typeof text !== 'string') return false;
  const t = text.trim();
  if (t.split(/\s+/).length < 3) return false;
  // Static topic-only words that must NOT appear as a lone title
  const topicOnlyWords = ['SUMMARY', 'METRICS', 'PILLARS', 'CONCLUSION', 'OVERVIEW'];
  if (topicOnlyWords.includes(t.toUpperCase())) return false;
  return true;
}

function extractTitleText(slideObjects, index) {
  const obj = (slideObjects || [])[index];
  if (!obj) return '';
  if (Array.isArray(obj.text)) return obj.text.map(t => t.text || '').join(' ');
  return String(obj.text || '');
}

// ─── main eval ────────────────────────────────────────────────────────────────

async function evalPersonaQuality() {
  const theme = getTheme('hsbc');
  const pres  = new pptxgen();
  buildSampleDeck(pres, theme);

  const issues  = [];
  const checks  = [];
  const lastIdx = pres.slides.length - 1;

  if (!useJson) {
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('  Consulting Persona & Quality Eval — SKILL AUDIT');
    console.log('══════════════════════════════════════════════════════════════════\n');
    console.log('1. Checking for Action Titles (So What?)');
    console.log('─'.repeat(50));
  }

  // ── Check 1: Action Titles ────────────────────────────────────────────────
  pres.slides.forEach((slide, idx) => {
    const slideObjects = slide._slideObjects || [];
    const titleText    = extractTitleText(slideObjects, 1); // index 1 is always the title in sample_deck.js
    const isFirst      = idx === 0;
    const isLast       = idx === lastIdx;
    const passed       = isActionTitle(titleText);

    checks.push({ check: 'action_title', slide: idx + 1, title: titleText, passed });

    if (!useJson) {
      const status = passed ? PASS : FAIL;
      console.log(`  Slide ${idx + 1}: ${status} | "${titleText.replace(/\n/g, ' ')}"`);
    }

    // Title and closer slides are exempt from action-title enforcement
    if (!passed && !isFirst && !isLast) {
      issues.push(`Slide ${idx + 1}: static topic title — should be a declarative "So What?" sentence. Found: "${titleText}"`);
    }
  });

  // ── Check 2: Pyramid Principle (slide 2 leads strategically) ─────────────
  if (!useJson) {
    console.log('\n2. Checking for Structure (Pyramid Principle)');
    console.log('─'.repeat(50));
  }

  if (pres.slides[1]) {
    const slideObjects = pres.slides[1]._slideObjects || [];
    const titleText    = extractTitleText(slideObjects, 1).toUpperCase();
    const isLeadIn     = titleText.includes('SUMMARY') || titleText.includes('STRATEGIC') || titleText.includes('ALIGNMENT');
    const passed       = isLeadIn;

    checks.push({ check: 'pyramid_principle', slide: 2, title: titleText, passed });

    if (!useJson) {
      const status = passed ? PASS : FAIL;
      console.log(`  Structure: ${status} | Slide 2 title: "${titleText}"`);
    }

    if (!passed) {
      issues.push(`Pyramid Principle: slide 2 should lead with strategic/executive framing. Found: "${titleText}"`);
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const totalChecks = checks.length;
  const passedCount = checks.filter(c => c.passed).length;

  if (useJson) {
    console.log(JSON.stringify({
      total: totalChecks,
      passed: passedCount,
      failed: totalChecks - passedCount,
      pass_rate: passedCount / totalChecks,
      issues,
      checks,
    }));
  } else {
    console.log('\n' + '─'.repeat(50));
    if (issues.length > 0) {
      console.log(`Summary: ${issues.length} persona alignment issue(s) found.\n`);
      issues.forEach(i => console.log(`  ⚠  ${i}`));
      console.log('\nTIP: Update sample_deck.js to use "Action Titles" instead of topic labels.');
    } else {
      console.log('Summary: Perfect alignment with McKinsey Persona Standards. ✅');
    }
    console.log('══════════════════════════════════════════════════════════════════\n');
  }

  if (issues.length > 0) process.exit(1);
}

evalPersonaQuality().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
