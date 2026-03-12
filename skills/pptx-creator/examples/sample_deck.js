/**
 * sample_deck.js — Reusable 6-slide demo deck builder
 *
 * Usage:
 *   const { buildSampleDeck } = require('./sample_deck');
 *   buildSampleDeck(pres, theme);
 *
 * Renders a consistent 6-slide deck using the supplied theme config.
 */

'use strict';

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeShadow() {
  return { type: 'outer', color: '000000', blur: 10, offset: 4, angle: 135, opacity: 0.15 };
}

function rect(slide, x, y, w, h, color, opts) {
  slide.addShape('rect', { x, y, w, h, fill: { color }, line: { color }, ...opts });
}

/** 
 * Handle newline characters in strings by converting to PptxGenJS text fragments
 */
function parseText(input) {
  if (typeof input !== 'string') return input;
  if (!input.includes('\n')) return input;
  
  const lines = input.split('\n');
  return lines.map((line, idx) => ({
    text: line,
    options: { breakLine: idx < lines.length - 1 }
  }));
}

// ─── Slide 1 — Title slide ────────────────────────────────────────────────────
function addTitleSlide(pres, theme, title, subtitle) {
  const { palette, fonts } = theme;
  const slide = pres.addSlide();
  slide.background = { color: palette.titleBg };

  rect(slide, 0, 0, 0.4, 5.625, theme.motif.accentBarColor);

  slide.addText(parseText(title), {
    x: 1.0, y: 1.8, w: 8.0, h: 1.4,
    fontSize: 48, fontFace: fonts.header, bold: true,
    color: palette.titleText, align: 'left', margin: 0,
    valign: 'bottom'
  });

  slide.addText(parseText(subtitle), {
    x: 1.0, y: 3.3, w: 8.0, h: 0.8,
    fontSize: 20, fontFace: fonts.body,
    color: palette.titleText, align: 'left', margin: 0,
    valign: 'top'
  });

  slide.addText(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }), {
    x: 1.0, y: 5.0, w: 4, h: 0.35,
    fontSize: 12, fontFace: fonts.body,
    color: palette.titleText, align: 'left', margin: 0
  });

  slide.addShape('ellipse', {
    x: 7.5, y: 3.0, w: 3.5, h: 3.5,
    fill: { color: palette.titleText, transparency: 92 },
    line: { color: palette.titleText, transparency: 85, width: 1.5 }
  });

  return slide;
}

// ─── Slide 2 — Executive Summary ──────────────────────────────────────────────
function addExecutiveSummary(pres, theme) {
  const { palette, fonts } = theme;
  const slide = pres.addSlide();
  slide.background = { color: palette.contentBg };

  rect(slide, 0, 0, 10, 0.85, palette.primary);
  slide.addText(parseText('EXECUTIVE SUMMARY'), {
    x: 0.5, y: 0, w: 9.0, h: 0.85,
    fontSize: 24, fontFace: fonts.header, bold: true,
    color: 'FFFFFF', align: 'left', valign: 'middle', charSpacing: 2
  });

  // Card Column 1
  slide.addShape('rect', {
    x: 0.5, y: 1.2, w: 4.35, h: 4.0,
    fill: { color: palette.altBg },
    shadow: makeShadow(),
    line: { color: palette.altBg }
  });
  rect(slide, 0.5, 1.2, 0.1, 4.0, palette.primary);

  slide.addText(parseText('Strategic Overview'), {
    x: 0.8, y: 1.4, w: 3.8, h: 0.4,
    fontSize: 16, fontFace: fonts.header, bold: true,
    color: palette.primary
  });

  slide.addText([
    { text: 'Driving exceptional value through sustainable growth frameworks.', options: { breakLine: true } },
    { text: 'Leveraging next-gen intelligence for operational agility.', options: { breakLine: true } },
    { text: 'Customer-centric approach centered on trust and innovation.' }
  ], {
    x: 0.8, y: 2.0, w: 3.8, h: 2.8,
    fontSize: 14, fontFace: fonts.body,
    color: palette.bodyText, align: 'left', valign: 'top',
    paraSpaceAfter: 10
  });

  // Card Column 2
  slide.addShape('rect', {
    x: 5.15, y: 1.2, w: 4.35, h: 4.0,
    fill: { color: palette.altBg },
    shadow: makeShadow(),
    line: { color: palette.altBg }
  });
  rect(slide, 5.15, 1.2, 0.1, 4.0, palette.accent);

  slide.addText(parseText('Key Performance Indicators'), {
    x: 5.45, y: 1.4, w: 3.8, h: 0.4,
    fontSize: 16, fontFace: fonts.header, bold: true,
    color: palette.primary
  });

  const points = ['Top-tier market positioning','Global connectivity and scale','Robust risk management protocols','Enhanced digital client experiences'];
  slide.addText(points.map((p, idx) => ({ 
    text: p, 
    options: { bullet: true, breakLine: idx < points.length - 1 } 
  })), {
    x: 5.45, y: 2.0, w: 3.8, h: 2.8,
    fontSize: 14, fontFace: fonts.body,
    color: palette.bodyText, align: 'left', valign: 'top',
    paraSpaceAfter: 12
  });

  return slide;
}

// ─── Slide 3 — Key Metrics ────────────────────────────────────────────────────
function addKeyMetrics(pres, theme) {
  const { palette, fonts } = theme;
  const slide = pres.addSlide();
  slide.background = { color: palette.contentBg };

  rect(slide, 0, 0, 10, 0.85, palette.primary);
  slide.addText(parseText('KEY PERFORMANCE METRICS'), {
    x: 0.5, y: 0, w: 9.0, h: 0.85,
    fontSize: 24, fontFace: fonts.header, bold: true,
    color: 'FFFFFF', align: 'left', valign: 'middle', charSpacing: 2
  });

  const metrics = [
    { value: '$4.8B', label: 'Net Profit', trend: '↑ 14% YoY' },
    { value: '1.2M',  label: 'Active Users', trend: '↑ 22% YoY' },
    { value: '94%',   label: 'Efficacy', trend: 'Target: 90%' },
    { value: '25+',   label: 'Global Hubs', trend: 'Strategic Markets' }
  ];

  metrics.forEach((m, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.5 + col * 4.65;
    const y = 1.2 + row * 2.15;

    slide.addShape('rect', {
      x, y, w: 4.35, h: 1.9,
      fill: { color: palette.altBg },
      shadow: makeShadow(),
      line: { color: palette.altBg }
    });
    rect(slide, x, y, 0.1, 1.9, palette.primary);

    slide.addText(parseText(m.value), {
      x: x + 0.3, y: y + 0.2, w: 3.8, h: 0.8,
      fontSize: 48, fontFace: fonts.header, bold: true,
      color: palette.primary, align: 'left', valign: 'middle'
    });
    slide.addText(parseText(m.label), {
      x: x + 0.3, y: y + 1.1, w: 2.5, h: 0.4,
      fontSize: 14, fontFace: fonts.header, bold: true,
      color: palette.bodyText, valign: 'bottom'
    });
    slide.addText(parseText(m.trend), {
      x: x + 0.3, y: y + 1.45, w: 3.8, h: 0.3,
      fontSize: 12, fontFace: fonts.body,
      color: palette.muted, italic: true
    });
  });

  return slide;
}

// ─── Slide 4 — Content Grid ───────────────────────────────────────────────────
function addContentGrid(pres, theme) {
  const { palette, fonts } = theme;
  const slide = pres.addSlide();
  slide.background = { color: palette.contentBg };

  rect(slide, 0, 0, 10, 0.85, palette.primary);
  slide.addText(parseText('STRATEGIC PILLARS'), {
    x: 0.5, y: 0, w: 9.0, h: 0.85,
    fontSize: 24, fontFace: fonts.header, bold: true,
    color: 'FFFFFF', align: 'left', valign: 'middle', charSpacing: 2
  });

  const pillars = [
    { title: 'Global Connectivity', body: 'Expanding corridors across emerging markets and developed economies alike.' },
    { title: 'Digital Innovation', body: 'Pioneering cloud-native architectures for banking and fintech solutions.' },
    { title: 'Customer Centricity', body: 'Hyper-personalized experiences powered by real-time behavioral data.' },
    { title: 'Sustainable Finance', body: 'Leading the transition to a net-zero global economy by 2030.' }
  ];

  pillars.forEach((p, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.5 + col * 4.65;
    const y = 1.2 + row * 2.15;

    slide.addShape('rect', {
      x, y, w: 4.35, h: 1.9,
      fill: { color: palette.altBg },
      shadow: makeShadow(),
      line: { color: palette.altBg }
    });
    rect(slide, x, y, 0.1, 1.9, palette.accent);

    slide.addText(parseText(p.title), {
      x: x + 0.3, y: y + 0.2, w: 3.8, h: 0.5,
      fontSize: 18, fontFace: fonts.header, bold: true,
      color: palette.primary
    });
    slide.addText(parseText(p.body), {
      x: x + 0.3, y: y + 0.8, w: 3.8, h: 0.9,
      fontSize: 13, fontFace: fonts.body,
      color: palette.bodyText, valign: 'top'
    });
  });

  return slide;
}

// ─── Slide 5 — Conclusion ─────────────────────────────────────────────────────
function addConclusionSlide(pres, theme) {
  const { palette, fonts } = theme;
  const slide = pres.addSlide();
  slide.background = { color: palette.contentBg };

  rect(slide, 0, 0, 10, 0.85, palette.primary);
  slide.addText(parseText('CONCLUSION & NEXT STEPS'), {
    x: 0.5, y: 0, w: 9.0, h: 0.85,
    fontSize: 24, fontFace: fonts.header, bold: true,
    color: 'FFFFFF', align: 'left', valign: 'middle', charSpacing: 2
  });

  slide.addShape('rect', {
    x: 0.5, y: 1.4, w: 9.0, h: 3.5,
    fill: { color: palette.altBg },
    shadow: makeShadow(),
    line: { color: palette.altBg }
  });
  rect(slide, 0.5, 1.4, 0.12, 3.5, palette.primary);

  slide.addText([
    { text: 'Final summary of the key initiatives discussed today.', options: { breakLine: true } },
    { text: 'Clear roadmap for Q3 and Q4 milestones.', options: { breakLine: true } },
    { text: 'Defined accountability across cross-functional teams.' }
  ], {
    x: 1.0, y: 1.8, w: 8.0, h: 2.5,
    fontSize: 16, fontFace: fonts.body,
    color: palette.bodyText, align: 'left', valign: 'top',
    paraSpaceAfter: 15, bullet: true
  });

  return slide;
}

// ─── Slide 6 — Thank You ──────────────────────────────────────────────────────
function addThankYouSlide(pres, theme, presenter, contact) {
  const { palette, fonts, motif } = theme;
  const slide = pres.addSlide();
  slide.background = { color: motif.darkSlideColor };

  rect(slide, 0, 0, 0.5, 5.625, palette.primary);

  slide.addText(parseText('THANK YOU'), {
    x: 1.25, y: 1.8, w: 7.5, h: 1.2,
    fontSize: 64, fontFace: fonts.header, bold: true,
    color: 'FFFFFF', align: 'left', charSpacing: 4
  });

  slide.addText(parseText(presenter), {
    x: 1.25, y: 3.2, w: 7.5, h: 0.5,
    fontSize: 20, fontFace: fonts.header,
    color: palette.accent, align: 'left'
  });

  slide.addText(parseText(contact), {
    x: 1.25, y: 3.8, w: 7.5, h: 0.4,
    fontSize: 14, fontFace: fonts.body,
    color: 'CCCCCC', align: 'left'
  });

  slide.addShape('ellipse', {
    x: 7.0, y: 2.0, w: 4.0, h: 4.0,
    fill: { color: palette.primary, transparency: 85 },
    line: { color: palette.primary, transparency: 75, width: 2 }
  });

  return slide;
}

// ─── Public API ───────────────────────────────────────────────────────────────

function buildSampleDeck(pres, theme) {
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'PPTX Creator Skill';
  pres.title  = `${theme.label} — Sample Deck`;

  addTitleSlide(pres, theme,
    `${theme.label.toUpperCase()}\nPRESENTATION`,
    `Showcasing the ${theme.label} theme aesthetic\nOptimized for professional impact`
  );
  addExecutiveSummary(pres, theme);
  addKeyMetrics(pres, theme);
  addContentGrid(pres, theme);
  addConclusionSlide(pres, theme);
  addThankYouSlide(pres, theme, 'Alexander King', 'alex@example.com');

  // Safety check: ensure no empty slides were added
  pres.slides.forEach((slide, idx) => {
    const hasContent = slide._slideObjects && slide._slideObjects.length > 0;
    if (!hasContent) {
      console.warn(`Warning: Slide ${idx + 1} appears to be empty.`);
    }
  });
}

module.exports = { buildSampleDeck };
