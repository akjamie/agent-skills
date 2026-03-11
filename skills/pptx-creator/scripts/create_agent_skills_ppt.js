const pptxgen = require('pptxgenjs');
const { getTheme } = require('../themes/index');
const path = require('path');

// Using HSBC Red as requested
const theme = getTheme('hsbc');
const { palette, fonts, motif } = theme;

let pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';

// Helpers
function makeShadow() {
  return { type: 'outer', color: '000000', blur: 8, offset: 3, angle: 135, opacity: 0.12 };
}
function rect(slide, x, y, w, h, color, opts) {
  slide.addShape('rect', { x, y, w, h, fill: { color }, line: { color }, ...opts });
}

// ─── Slide 1: Title ───────────────────────────────────────────────────────────
let slide1 = pres.addSlide();
slide1.background = { color: palette.titleBg };
rect(slide1, 0, 0, 0.25, 5.625, motif.accentBarColor);

slide1.addText([
  { text: 'Deep Dive into Agent Skills:\n', options: { fontSize: 36, breakLine: true } },
  { text: 'Modular Capabilities for AI Agents', options: { fontSize: 44, color: motif.accentBarColor } }
], {
  x: 0.55, y: 1.4, w: 9.2, h: 1.8,
  fontFace: fonts.header, bold: true,
  color: palette.titleText, align: 'left', margin: 0
});

slide1.addText('Moving from general-purpose LLMs to professional-grade specialized tools.', {
  x: 0.55, y: 3.4, w: 9.2, h: 0.6,
  fontSize: 18, fontFace: fonts.body,
  color: palette.titleText, align: 'left', margin: 0,
});

slide1.addShape('ellipse', {
  x: 7.8, y: 3.2, w: 2.8, h: 2.8,
  fill: { color: palette.titleText, transparency: 90 },
  line: { color: palette.titleText, transparency: 80, width: 1 },
});

// ─── Slide 2: Layer 1 ─────────────────────────────────────────────────────────
let slide2 = pres.addSlide();
slide2.background = { color: palette.contentBg };
rect(slide2, 0, 0, 10, 0.75, palette.primary);

slide2.addText('What are Agent Skills?', {
  x: 0.4, y: 0, w: 9.2, h: 0.75, fontSize: 22, fontFace: fonts.header, bold: true, color: 'FFFFFF', align: 'left', valign: 'middle', margin: 0
});

slide2.addShape('rect', {
  x: 0.4, y: 1.0, w: 9.2, h: 4.2, fill: { color: palette.altBg }, shadow: makeShadow(), line: { color: palette.altBg }
});
rect(slide2, 0.4, 1.0, 0.08, 4.2, palette.primary);

slide2.addText('Layer 1 – The "Plug-in" Core Concept', {
  x: 0.7, y: 1.2, w: 8.6, h: 0.4, fontSize: 16, fontFace: fonts.header, bold: true, color: palette.primary, margin: 0
});

slide2.addText([
  { text: 'Modular Knowledge', options: { bold: true, color: palette.primary } },
  { text: ': They act like plug-ins or extensions that give an agent on-demand, task-specific abilities.', options: { breakLine: true } },
  { text: 'Domain Expertise', options: { bold: true, color: palette.primary } },
  { text: ': While an LLM provides general reasoning, a skill provides the domain expertise needed for specialized workflows like SQL generation or code review.', options: { breakLine: true } },
  { text: 'Open Standard', options: { bold: true, color: palette.primary } },
  { text: ': Originally by Anthropic, it is now a standardized format for building reusable agent capabilities.', options: {} }
], {
  x: 0.7, y: 1.7, w: 8.6, h: 3.3, fontSize: 13, fontFace: fonts.body, color: palette.bodyText, align: 'left', valign: 'top', paraSpaceAfter: 12, bullet: true
});

// ─── Slide 3: Layer 2 ─────────────────────────────────────────────────────────
let slide3 = pres.addSlide();
slide3.background = { color: palette.contentBg };
rect(slide3, 0, 0, 10, 0.75, palette.primary);

slide3.addText('The Anatomy of a Skill Folder', {
  x: 0.4, y: 0, w: 9.2, h: 0.75, fontSize: 22, fontFace: fonts.header, bold: true, color: 'FFFFFF', align: 'left', valign: 'middle', margin: 0
});

slide3.addText('Layer 2 – The Standardized Anatomy', {
  x: 0.4, y: 0.85, w: 9.2, h: 0.4, fontSize: 16, fontFace: fonts.header, bold: true, color: palette.primary, margin: 0
});

const anatomySteps = [
  { title: 'SKILL.md', icon: '🧠', body: 'The brain of the skill. Contains metadata, instructions, and triggers that tell the agent what it is and how to use it.' },
  { title: 'scripts/', icon: '⚙️', body: 'Executable code (Python, Bash, SQL) that handles deterministic logic the LLM might struggle with.' },
  { title: 'assets/', icon: '📄', body: 'Supporting references, data templates, or documentation required to complete the task.' }
];

anatomySteps.forEach((s, i) => {
  const x = 0.4 + i * 3.1;
  const y = 1.35;
  const w = 2.9;
  const h = 3.8;
  slide3.addShape('rect', { x, y, w, h, fill: { color: palette.altBg }, shadow: makeShadow(), line: { color: palette.altBg } });
  rect(slide3, x, y, w, 0.08, palette.primary); // top accent bar
  
  slide3.addShape('ellipse', { x: x + 0.2, y: y + 0.2, w: 0.6, h: 0.6, fill: { color: palette.primary, transparency: 10 }, line: { color: palette.primary, transparency: 10 } });
  slide3.addText(s.icon, { x: x + 0.15, y: y + 0.2, w: 0.7, h: 0.6, fontSize: 20, align: 'center', valign: 'middle', margin: 0 });
  
  slide3.addText(s.title, { x: x + 1.0, y: y + 0.25, w: 1.8, h: 0.5, fontSize: 16, fontFace: fonts.header, bold: true, color: palette.primary, align: 'left', margin: 0 });
  slide3.addText(s.body, { x: x + 0.2, y: y + 1.0, w: 2.5, h: 2.6, fontSize: 13, fontFace: fonts.body, color: palette.bodyText, align: 'left', valign: 'top' });
});

// ─── Slide 4: Layer 3 ─────────────────────────────────────────────────────────
let slide4 = pres.addSlide();
slide4.background = { color: palette.contentBg };
rect(slide4, 0, 0, 10, 0.75, palette.primary);

slide4.addText('Optimizing the Context Window', {
  x: 0.4, y: 0, w: 9.2, h: 0.75, fontSize: 22, fontFace: fonts.header, bold: true, color: 'FFFFFF', align: 'left', valign: 'middle', margin: 0
});

slide4.addShape('rect', { x: 0.4, y: 1.0, w: 9.2, h: 4.2, fill: { color: palette.altBg }, shadow: makeShadow(), line: { color: palette.altBg } });
rect(slide4, 0.4, 1.0, 0.08, 4.2, palette.primary);

slide4.addText('Layer 3 – Progressive Disclosure & Token Savings', {
  x: 0.7, y: 1.2, w: 8.6, h: 0.4, fontSize: 16, fontFace: fonts.header, bold: true, color: palette.primary, margin: 0
});

slide4.addText([
  { text: 'The Problem: "Prompt Bloat"', options: { bold: true, color: palette.primary } },
  { text: '\nStuffing every possible instruction into a base prompt wastes tokens and causes context dilution, where the model ignores instructions.', options: { breakLine: true } },
  { text: 'Progressive Disclosure', options: { bold: true, color: palette.primary } },
  { text: '\nThe agent is only shown a Skill Registry (names/descriptions) initially.', options: { breakLine: true } },
  { text: 'Token Savings', options: { bold: true, color: palette.primary } },
  { text: '\nFull skill instructions and scripts are dynamically loaded into the context only after the agent decides it needs them. This keeps the context window lean and the reasoning sharp.', options: {} }
], {
  x: 0.7, y: 1.7, w: 8.6, h: 3.3, fontSize: 13, fontFace: fonts.body, color: palette.bodyText, align: 'left', valign: 'top', paraSpaceAfter: 12, bullet: true
});

// ─── Slide 5: Layer 4 ─────────────────────────────────────────────────────────
let slide5 = pres.addSlide();
slide5.background = { color: palette.contentBg };
rect(slide5, 0, 0, 10, 0.75, palette.primary);

slide5.addText('How the Workflow Actually Functions', {
  x: 0.4, y: 0, w: 9.2, h: 0.75, fontSize: 22, fontFace: fonts.header, bold: true, color: 'FFFFFF', align: 'left', valign: 'middle', margin: 0
});
slide5.addText('Layer 4 – The Decision Cycle', {
  x: 0.4, y: 0.85, w: 9.2, h: 0.4, fontSize: 16, fontFace: fonts.header, bold: true, color: palette.primary, margin: 0
});

const cycleSteps = [
  { title: '1. Retrieval', icon: '🔍', body: 'The agent receives a goal and identifies the correct skill from its library.' },
  { title: '2. Reasoning (Planning)', icon: '🤔', body: 'The agent reads the SKILL.md to plan its steps.' },
  { title: '3. Execution', icon: '⚡', body: 'The agent triggers the associated scripts to perform actions (e.g., querying a DB or running a test).' },
  { title: '4. Observation', icon: '👀', body: 'The agent reflects on the script output to determine if the goal was met.' }
];

cycleSteps.forEach((s, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = 0.4 + col * 4.7;
  const y = 1.35 + row * 2.0;
  const w = 4.4;
  const h = 1.8;

  slide5.addShape('rect', { x, y, w, h, fill: { color: palette.altBg }, shadow: makeShadow(), line: { color: palette.altBg } });
  rect(slide5, x, y, 0.08, h, palette.primary);

  slide5.addShape('ellipse', { x: x + 0.2, y: y + 0.2, w: 0.5, h: 0.5, fill: { color: palette.primary, transparency: 10 }, line: { color: palette.primary, transparency: 10 } });
  slide5.addText(s.icon, { x: x + 0.15, y: y + 0.2, w: 0.6, h: 0.5, fontSize: 16, align: 'center', valign: 'middle', margin: 0 });
  slide5.addText(s.title, { x: x + 0.8, y: y + 0.25, w: 3.4, h: 0.4, fontSize: 14, fontFace: fonts.header, bold: true, color: palette.primary, align: 'left', margin: 0 });
  slide5.addText(s.body, { x: x + 0.8, y: y + 0.75, w: 3.4, h: 0.9, fontSize: 13, fontFace: fonts.body, color: palette.bodyText, align: 'left', valign: 'top' });
});

// ─── Slide 6: Layer 5 ─────────────────────────────────────────────────────────
let slide6 = pres.addSlide();
slide6.background = { color: palette.contentBg };
rect(slide6, 0, 0, 10, 0.75, palette.primary);

slide6.addText('Designing Reliable Skills', {
  x: 0.4, y: 0, w: 9.2, h: 0.75, fontSize: 22, fontFace: fonts.header, bold: true, color: 'FFFFFF', align: 'left', valign: 'middle', margin: 0
});
slide6.addText('Layer 5 – Best Practices', {
  x: 0.4, y: 0.85, w: 9.2, h: 0.4, fontSize: 16, fontFace: fonts.header, bold: true, color: palette.primary, margin: 0
});

const bestPractices = [
  { title: 'Atomic Design', icon: '🎯', body: 'Keep each skill focused on one specific workflow to maximize reusability.' },
  { title: 'Code over Prompts', icon: '💻', body: 'Use code for generic algorithms or data transformations; use the LLM for high-level reasoning and decision-making.' },
  { title: 'Standardized Metadata', icon: '📋', body: 'Always include clear descriptions in SKILL.md to help the agent accurately identify when to use the skill.' }
];

bestPractices.forEach((s, i) => {
  const x = 0.4 + i * 3.1;
  const y = 1.35;
  const w = 2.9;
  const h = 3.8;
  slide6.addShape('rect', { x, y, w, h, fill: { color: palette.altBg }, shadow: makeShadow(), line: { color: palette.altBg } });
  rect(slide6, x, y, w, 0.08, palette.primary);
  
  slide6.addShape('ellipse', { x: x + 0.2, y: y + 0.2, w: 0.6, h: 0.6, fill: { color: palette.primary, transparency: 10 }, line: { color: palette.primary, transparency: 10 } });
  slide6.addText(s.icon, { x: x + 0.15, y: y + 0.2, w: 0.7, h: 0.6, fontSize: 20, align: 'center', valign: 'middle', margin: 0 });
  
  slide6.addText(s.title, { x: x + 1.0, y: y + 0.25, w: 1.8, h: 0.5, fontSize: 14, fontFace: fonts.header, bold: true, color: palette.primary, align: 'left', margin: 0 });
  slide6.addText(s.body, { x: x + 0.2, y: y + 1.0, w: 2.5, h: 2.6, fontSize: 13, fontFace: fonts.body, color: palette.bodyText, align: 'left', valign: 'top' });
});

// ─── Slide 7: Layer 6 ─────────────────────────────────────────────────────────
let slide7 = pres.addSlide();
slide7.background = { color: palette.contentBg };
rect(slide7, 0, 0, 10, 0.75, palette.primary);

slide7.addText('LangChain & smolagents Implementation', {
  x: 0.4, y: 0, w: 9.2, h: 0.75, fontSize: 22, fontFace: fonts.header, bold: true, color: 'FFFFFF', align: 'left', valign: 'middle', margin: 0
});

slide7.addText('Layer 6 – Framework Integration', {
  x: 0.4, y: 0.85, w: 9.2, h: 0.4, fontSize: 16, fontFace: fonts.header, bold: true, color: palette.primary, margin: 0
});

slide7.addShape('rect', { x: 0.4, y: 1.35, w: 4.4, h: 3.85, fill: { color: palette.altBg }, shadow: makeShadow(), line: { color: palette.altBg } });
rect(slide7, 0.4, 1.35, 0.08, 3.85, palette.primary);

slide7.addText([
  { text: 'Structured Output', options: { bold: true, color: palette.primary } },
  { text: '\nUse frameworks to parse LLM outputs into valid function calls.', options: { breakLine: true } },
  { text: 'Prompting Frameworks', options: { bold: true, color: palette.primary } },
  { text: '\nTools like LangChain or LlamaIndex define the high-level sequences that route user goals to the appropriate skill library.', options: { breakLine: true } }
], {
  x: 0.7, y: 1.55, w: 3.8, h: 3.45, fontSize: 13, fontFace: fonts.body, color: palette.bodyText, align: 'left', valign: 'top', paraSpaceAfter: 12, bullet: true
});

slide7.addShape('rect', { x: 5.1, y: 1.35, w: 4.5, h: 3.85, fill: { color: '1A1A24' }, shadow: makeShadow() });
const codeSnippet = `Example Logic:

const agent = new Agent({
  skills: [pptxCreator, sqlGen],
  llm: claude3Opus
});

const goal = "Create a PPT outline";
await agent.execute(goal);`;
slide7.addText(codeSnippet, {
  x: 5.3, y: 1.55, w: 4.1, h: 3.45, fontSize: 12, fontFace: 'Courier New', color: 'A6E22E', align: 'left', valign: 'top', margin: 0
});

// ─── Slide 8: Conclusion ──────────────────────────────────────────────────────
let slide8 = pres.addSlide();
slide8.background = { color: palette.titleBg };
rect(slide8, 0, 0, 0.25, 5.625, motif.accentBarColor);

slide8.addText('Scalability & Reliability', {
  x: 0.55, y: 1.5, w: 9.2, h: 1.0, fontSize: 44, fontFace: fonts.header, bold: true, color: palette.titleText, align: 'left', margin: 0
});

slide8.addText('Conclusion', {
  x: 0.55, y: 1.0, w: 9.2, h: 0.4, fontSize: 18, fontFace: fonts.header, bold: true, color: motif.accentBarColor, align: 'left', margin: 0
});

slide8.addText([
  { text: 'Modular skills allow developers to build a capability library that grows over time.', options: { breakLine: true } },
  { text: 'By separating "how-to" logic from the core LLM, agents become more reliable, cost-effective, and easier to debug.', options: { breakLine: true } }
], {
  x: 0.55, y: 2.8, w: 8.5, h: 2.0, fontSize: 18, fontFace: fonts.body, color: palette.titleText, align: 'left', valign: 'top', bullet: true, paraSpaceAfter: 16
});

slide8.addShape('ellipse', { x: 8.2, y: 0.5, w: 1.6, h: 1.6, fill: { color: motif.accentBarColor, transparency: 85 }, line: { color: motif.accentBarColor, transparency: 80 } });

// ─── Output ───────────────────────────────────────────────────────────────────
const outPath = path.resolve(__dirname, '..', '..', 'Agent_Skills_Presentation.pptx');
pres.writeFile({ fileName: outPath })
  .then(fileName => {
    console.log(`✅ Presentation successfully created at: ${fileName}`);
  })
  .catch(err => {
    console.error('❌ Error creating presentation:', err);
  });
