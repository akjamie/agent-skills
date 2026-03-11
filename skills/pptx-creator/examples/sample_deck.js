/**
 * sample_deck.js — Reusable 6-slide demo deck builder
 *
 * Usage:
 *   const { buildSampleDeck } = require('./sample_deck');
 *   buildSampleDeck(pres, theme);
 *
 * Renders a consistent 6-slide deck using the supplied theme config.
 * Every slide uses the theme's palette, fonts, and motif so that
 * running this with different themes visually shows the full theme library.
 */

'use strict';

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Return a fresh shadow object (PptxGenJS mutates options in-place) */
function makeShadow() {
  return { type: 'outer', color: '000000', blur: 8, offset: 3, angle: 135, opacity: 0.12 };
}

/** Shorthand for a coloured rectangle */
function rect(slide, x, y, w, h, color, opts) {
  slide.addShape('rect', { x, y, w, h, fill: { color }, line: { color }, ...opts });
}

// ─── Slide 1 — Title slide ────────────────────────────────────────────────────
function addTitleSlide(pres, theme, title, subtitle) {
  const { palette, fonts } = theme;
  const slide = pres.addSlide();
  slide.background = { color: palette.titleBg };

  // Left accent bar
  rect(slide, 0, 0, 0.25, 5.625, theme.motif.accentBarColor);

  // Title
  slide.addText(title, {
    x: 0.55, y: 1.6, w: 9.2, h: 1.2,
    fontSize: 44, fontFace: fonts.header, bold: true,
    color: palette.titleText, align: 'left', margin: 0,
  });

  // Subtitle
  slide.addText(subtitle, {
    x: 0.55, y: 2.9, w: 9.2, h: 0.6,
    fontSize: 18, fontFace: fonts.body,
    color: palette.titleText, align: 'left', margin: 0,
  });

  // Date / metadata line at bottom
  slide.addText(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }), {
    x: 0.55, y: 5.1, w: 4, h: 0.35,
    fontSize: 11, fontFace: fonts.body,
    color: palette.titleText, align: 'left', margin: 0,
  });

  // Decorative circle
  slide.addShape('ellipse', {
    x: 7.8, y: 3.2, w: 2.8, h: 2.8,
    fill: { color: palette.titleText, transparency: 90 },
    line: { color: palette.titleText, transparency: 80, width: 1 },
  });

  return slide;
}

// ─── Slide 2 — Executive Summary (2-column) ───────────────────────────────────
function addExecutiveSummary(pres, theme) {
  const { palette, fonts } = theme;
  const slide = pres.addSlide();
  slide.background = { color: palette.contentBg };

  // Top header bar
  rect(slide, 0, 0, 10, 0.75, palette.primary);
  slide.addText('Executive Summary', {
    x: 0.4, y: 0, w: 9.2, h: 0.75,
    fontSize: 22, fontFace: fonts.header, bold: true,
    color: 'FFFFFF', align: 'left', valign: 'middle', margin: 0,
  });

  // Left column — overview card
  slide.addShape('rect', {
    x: 0.4, y: 1.0, w: 4.3, h: 3.8,
    fill: { color: palette.altBg },
    shadow: makeShadow(),
    line: { color: palette.altBg },
  });
  // Accent left bar on card
  rect(slide, 0.4, 1.0, 0.08, 3.8, palette.primary);

  slide.addText('Overview', {
    x: 0.6, y: 1.15, w: 3.9, h: 0.4,
    fontSize: 14, fontFace: fonts.header, bold: true,
    color: palette.primary, margin: 0,
  });
  slide.addText([
    { text: 'Strategic positioning for long-term growth and value creation.', options: { breakLine: true } },
    { text: 'Leveraging core competencies across all business units.', options: { breakLine: true } },
    { text: 'Focus on operational efficiency, customer centricity, and innovation.', options: { breakLine: true } },
    { text: 'Aligned with global sustainability and ESG commitments.' },
  ], {
    x: 0.6, y: 1.65, w: 3.8, h: 2.9,
    fontSize: 13, fontFace: fonts.body,
    color: palette.bodyText, align: 'left', valign: 'top',
    paraSpaceAfter: 6,
  });

  // Right column — key points card
  slide.addShape('rect', {
    x: 5.3, y: 1.0, w: 4.3, h: 3.8,
    fill: { color: palette.altBg },
    shadow: makeShadow(),
    line: { color: palette.altBg },
  });
  rect(slide, 5.3, 1.0, 0.08, 3.8, palette.accent);

  slide.addText('Key Points', {
    x: 5.5, y: 1.15, w: 3.9, h: 0.4,
    fontSize: 14, fontFace: fonts.header, bold: true,
    color: palette.primary, margin: 0,
  });

  const points = [
    '12% YoY revenue growth across core markets',
    'Expanded into 3 new geographic territories',
    'Customer satisfaction score up to 4.7/5.0',
    '25% reduction in operational costs',
    'New digital platform launched Q3',
  ];
  slide.addText(points.map((p, i) => ([
    { text: String(i + 1), options: { bold: true, color: palette.primary } },
    { text: `  ${p}`, options: { breakLine: i < points.length - 1 } },
  ])).flat(), {
    x: 5.5, y: 1.65, w: 3.8, h: 2.9,
    fontSize: 13, fontFace: fonts.body,
    color: palette.bodyText, align: 'left', valign: 'top',
    paraSpaceAfter: 8,
  });

  return slide;
}

// ─── Slide 3 — Key Metrics (large stat callouts) ──────────────────────────────
function addKeyMetrics(pres, theme) {
  const { palette, fonts } = theme;
  const slide = pres.addSlide();
  slide.background = { color: palette.contentBg };

  // Header
  rect(slide, 0, 0, 10, 0.75, palette.primary);
  slide.addText('Key Metrics', {
    x: 0.4, y: 0, w: 9.2, h: 0.75,
    fontSize: 22, fontFace: fonts.header, bold: true,
    color: 'FFFFFF', align: 'left', valign: 'middle', margin: 0,
  });

  const metrics = [
    { value: '$2.4B', label: 'Total Revenue', sub: '+12% YoY' },
    { value: '98K',   label: 'Active Clients', sub: '+8% YoY' },
    { value: '4.7',   label: 'CSAT Score', sub: 'out of 5.0' },
    { value: '42%',   label: 'Market Share', sub: 'Core markets' },
  ];

  metrics.forEach((m, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.4 + col * 4.65;
    const y = 1.0 + row * 2.15;

    slide.addShape('rect', {
      x, y, w: 4.4, h: 1.9,
      fill: { color: i % 2 === 0 ? palette.altBg : palette.contentBg },
      shadow: makeShadow(),
      line: { color: palette.altBg },
    });
    rect(slide, x, y, 0.08, 1.9, palette.primary);

    slide.addText(m.value, {
      x: x + 0.2, y: y + 0.18, w: 4.0, h: 0.9,
      fontSize: 48, fontFace: fonts.header, bold: true,
      color: palette.primary, align: 'left', margin: 0,
    });
    slide.addText(m.label, {
      x: x + 0.2, y: y + 1.05, w: 2.5, h: 0.35,
      fontSize: 13, fontFace: fonts.header, bold: true,
      color: palette.bodyText, align: 'left', margin: 0,
    });
    slide.addText(m.sub, {
      x: x + 2.8, y: y + 1.05, w: 1.5, h: 0.35,
      fontSize: 11, fontFace: fonts.body,
      color: palette.muted, align: 'right', margin: 0,
    });
  });

  return slide;
}

// ─── Slide 4 — Content Grid (icon-style cards) ────────────────────────────────
function addContentGrid(pres, theme) {
  const { palette, fonts } = theme;
  const slide = pres.addSlide();
  slide.background = { color: palette.contentBg };

  rect(slide, 0, 0, 10, 0.75, palette.primary);
  slide.addText('Strategic Pillars', {
    x: 0.4, y: 0, w: 9.2, h: 0.75,
    fontSize: 22, fontFace: fonts.header, bold: true,
    color: 'FFFFFF', align: 'left', valign: 'middle', margin: 0,
  });

  const pillars = [
    { icon: '⚡', title: 'Innovation', body: 'Invest in digital transformation and emerging tech to drive next-gen solutions.' },
    { icon: '🌐', title: 'Global Reach', body: 'Expand presence across key growth markets with localised strategies.' },
    { icon: '🛡️', title: 'Risk & Compliance', body: 'Maintain robust frameworks that meet evolving regulatory standards.' },
    { icon: '🤝', title: 'Partnerships', body: 'Build strategic alliances to accelerate capability development.' },
    { icon: '📈', title: 'Growth', body: 'Drive double-digit growth through disciplined investment and execution.' },
    { icon: '♻️', title: 'Sustainability', body: 'Embed ESG principles into every aspect of business operations.' },
  ];

  pillars.forEach((p, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.3 + col * 3.22;
    const y = 0.95 + row * 2.2;

    slide.addShape('rect', {
      x, y, w: 3.06, h: 2.0,
      fill: { color: palette.altBg },
      shadow: makeShadow(),
      line: { color: palette.altBg },
    });
    rect(slide, x, y, 3.06, 0.08, palette.primary);

    // Icon circle
    slide.addShape('ellipse', {
      x: x + 0.15, y: y + 0.18, w: 0.5, h: 0.5,
      fill: { color: palette.primary, transparency: 10 },
      line: { color: palette.primary, transparency: 10 },
    });
    slide.addText(p.icon, {
      x: x + 0.13, y: y + 0.18, w: 0.54, h: 0.5,
      fontSize: 16, align: 'center', valign: 'middle', margin: 0,
    });

    slide.addText(p.title, {
      x: x + 0.75, y: y + 0.22, w: 2.2, h: 0.4,
      fontSize: 13, fontFace: fonts.header, bold: true,
      color: palette.primary, align: 'left', margin: 0,
    });
    slide.addText(p.body, {
      x: x + 0.15, y: y + 0.75, w: 2.8, h: 1.1,
      fontSize: 11, fontFace: fonts.body,
      color: palette.bodyText, align: 'left', valign: 'top',
    });
  });

  return slide;
}

// ─── Slide 5 — Bar Chart ──────────────────────────────────────────────────────
function addChartSlide(pres, theme) {
  const { palette, fonts } = theme;
  const slide = pres.addSlide();
  slide.background = { color: palette.contentBg };

  rect(slide, 0, 0, 10, 0.75, palette.primary);
  slide.addText('Performance Overview', {
    x: 0.4, y: 0, w: 9.2, h: 0.75,
    fontSize: 22, fontFace: fonts.header, bold: true,
    color: 'FFFFFF', align: 'left', valign: 'middle', margin: 0,
  });

  const chartData = [{
    name: 'Revenue ($M)',
    labels: ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024', 'Q2 2024'],
    values: [480, 520, 610, 700, 590, 760],
  }];

  slide.addChart('bar', chartData, {
    x: 0.5, y: 0.9, w: 9.0, h: 4.5,
    barDir: 'col',
    chartColors: palette.chartColors.slice(0, 1),
    chartArea: { fill: { color: palette.contentBg }, roundedCorners: true },
    catAxisLabelColor: palette.muted,
    valAxisLabelColor: palette.muted,
    valGridLine: { color: 'E2E8F0', size: 0.5 },
    catGridLine: { style: 'none' },
    showValue: true,
    dataLabelPosition: 'outEnd',
    dataLabelColor: palette.bodyText,
    dataLabelFontSize: 10,
    showLegend: false,
  });

  return slide;
}

// ─── Slide 6 — Thank You / Dark closer ────────────────────────────────────────
function addThankYouSlide(pres, theme, presenter, contact) {
  const { palette, fonts } = theme;
  const slide = pres.addSlide();
  slide.background = { color: theme.motif.darkSlideColor };

  // Accent bar
  rect(slide, 0, 0, 0.25, 5.625, palette.primary);

  // Large "Thank You"
  slide.addText('Thank You', {
    x: 0.55, y: 1.5, w: 9.2, h: 1.3,
    fontSize: 56, fontFace: fonts.header, bold: true,
    color: 'FFFFFF', align: 'left', margin: 0,
  });

  // Presenter
  slide.addText(presenter, {
    x: 0.55, y: 3.0, w: 9.2, h: 0.45,
    fontSize: 16, fontFace: fonts.header, bold: true,
    color: palette.secondary, align: 'left', margin: 0,
  });

  // Contact
  slide.addText(contact, {
    x: 0.55, y: 3.5, w: 9.2, h: 0.35,
    fontSize: 13, fontFace: fonts.body,
    color: 'AAAAAA', align: 'left', margin: 0,
  });

  // Decorative shapes
  slide.addShape('ellipse', {
    x: 7.5, y: 2.8, w: 3.0, h: 3.0,
    fill: { color: palette.primary, transparency: 80 },
    line: { color: palette.primary, transparency: 75 },
  });
  slide.addShape('ellipse', {
    x: 8.2, y: 0.5, w: 1.6, h: 1.6,
    fill: { color: 'FFFFFF', transparency: 90 },
    line: { color: 'FFFFFF', transparency: 88 },
  });

  return slide;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Build a 6-slide demo deck into an existing PptxGenJS presentation object.
 * @param {Object} pres   - PptxGenJS instance (caller owns writeFile)
 * @param {Object} theme  - Theme config from themes/<name>.js
 */
function buildSampleDeck(pres, theme) {
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'PPTX Creator Skill';
  pres.title  = `${theme.label} — Sample Deck`;

  addTitleSlide(pres, theme,
    `${theme.label} Presentation`,
    `Showcasing the ${theme.label} theme • ${theme.feel}`
  );
  addExecutiveSummary(pres, theme);
  addKeyMetrics(pres, theme);
  addContentGrid(pres, theme);
  addChartSlide(pres, theme);
  addThankYouSlide(pres, theme, 'Jane Smith — Head of Strategy', 'jane.smith@example.com');
}

module.exports = { buildSampleDeck };
