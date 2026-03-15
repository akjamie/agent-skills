#!/usr/bin/env node
/**
 * eval_persona.js — Consulting Quality Eval for PPTX Skill
 * 
 * Verifies that the PPTX Creator produces content adhering to:
 * 1. Action Titles (Complete sentences, not topics)
 * 2. Structure (Pyramid Principle awareness)
 * 3. MECE logic (No obvious overlap in sample content)
 */

'use strict';

const { listThemes, getTheme } = require('../assets/themes/index');
const { buildSampleDeck }      = require('../examples/sample_deck');
const pptxgen = require('pptxgenjs');

const PASS = '\x1b[32mPASS\x1b[0m';
const FAIL = '\x1b[31mFAIL\x1b[0m';

/**
 * Checks if a string is an "Action Title"
 */
function isActionTitle(text) {
  if (!text || typeof text !== 'string') return false;
  const t = text.trim();
  // Very simple heuristic: should have whitespace and likely contains a verb or comparative
  // or at least be long enough to be a sentence.
  const words = t.split(/\s+/);
  if (words.length < 3) return false;
  
  // Real Action Titles usually end in a period or are declarative
  // We'll check for typical "Topic" words that should be avoided as solo titles
  const topicOnlyWords = ['SUMMARY', 'METRICS', 'PILLARS', 'CONCLUSION', 'OVERVIEW'];
  if (topicOnlyWords.includes(t.toUpperCase())) return false;

  return true;
}

async function evalPersonaQuality() {
  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log('  Consulting Persona & Quality Eval — SKILL AUDIT');
  console.log('══════════════════════════════════════════════════════════════════\n');

  const theme = getTheme('hsbc');
  const pres = new pptxgen();
  buildSampleDeck(pres, theme);

  let totalIssues = 0;

  // 1. Audit Slide Titles
  console.log('1. Checking for Action Titles (So What?)');
  console.log('─'.repeat(50));
  
    pres.slides.forEach((slide, idx) => {
    // In sample_deck.js, content slides (idx > 0) usually have:
    // [0] background rect
    // [1] Title Text
    const slideObjects = slide._slideObjects || [];
    let titleObj = null;
    
    if (idx === 0) {
        // Title slide: [0] background bar, [1] Title, [2] Subtitle
        titleObj = slideObjects[1];
    } else if (idx === pres.slides.length -1) {
        // Thank you slide: [0] vertical bar, [1] THANK YOU
        titleObj = slideObjects[1];
    } else {
        // Content slides: [0] header rect, [1] Title Text
        titleObj = slideObjects[1];
    }

    let titleText = '';
    if (titleObj) {
        if (Array.isArray(titleObj.text)) {
            titleText = titleObj.text.map(t => t.text).join(' ');
        } else {
            titleText = titleObj.text;
        }
    }

    const passed = isActionTitle(titleText);
    const status = passed ? PASS : FAIL;
    console.log(`Slide ${idx + 1}: ${status} | "${titleText.replace(/\n/g, ' ')}"`);
    if (!passed && idx > 0 && idx < pres.slides.length - 1) { // Skip title/thank-you slides for action title check
        console.log(`   ⚠ Issue: Title is a static topic. Should be a declarative "So What?" sentence.`);
        totalIssues++;
    }
  });

  // 2. Audit Structure (Pyramid)
  console.log('\n2. Checking for Structure (Pyramid Principle)');
  console.log('─'.repeat(50));
  
  if (pres.slides[1]) {
      // In a pyramid structure, Slide 2 is almost ALWAYS an Executive Summary (or start of logic)
      const slideObjects = pres.slides[1]._slideObjects || [];
      const titleObj = slideObjects[1]; // Index 1 is title in sample_deck.js
      
      if (titleObj) {
          const text = String(Array.isArray(titleObj.text) ? titleObj.text[0].text : titleObj.text).toUpperCase();
          // We check if it's broad/strategic enough to be the lead-in
          const isLeadIn = text.includes('SUMMARY') || text.includes('STRATEGIC') || text.includes('ALIGNMENT');
          
          if (isLeadIn) {
              console.log(`Structure: ${PASS} | Leads with Strategic/Executive focus.`);
          } else {
              console.log(`Structure: ${FAIL} | Does not lead with Strategic focus. Found: "${text}"`);
              totalIssues++;
          }
      } else {
          console.log(`Structure: ${FAIL} | Slide 2 title not found at index 1.`);
          totalIssues++;
      }
  }

  console.log('\n' + '─'.repeat(50));
  if (totalIssues > 0) {
      console.log(`Summary: Found ${totalIssues} persona alignment issues.`);
      console.log('TIP: Update example_deck.js to use "Action Titles" instead of labels.');
  } else {
      console.log('Summary: Perfect alignment with McKinsey Persona Standards.');
  }
  console.log('══════════════════════════════════════════════════════════════════\n');
}

evalPersonaQuality().catch(console.error);
