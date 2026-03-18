#!/usr/bin/env node
'use strict';
const path = require('path');
const fs = require('fs');
const pptxgen = require('pptxgenjs');

// HSBC Theme Mock (Self-contained for reliability)
const theme = {
  palette: {
    titleBg: 'DB0011', primary: 'DB0011', secondary: '1A1A1A', 
    contentBg: 'FFFFFF', altBg: 'F5F5F5', bodyText: '1A1A1A'
  },
  fonts: { header: 'Arial Black', body: 'Arial' }
};

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';

const parseText = (t) => t.includes('\n') ? t.split('\n').map((l, i, a) => ({ text: l, options: { breakLine: i < a.length - 1 } })) : t;
const rect = (s, x, y, w, h, c) => s.addShape('rect', { x, y, w, h, fill: { color: c }, line: { color: c } });

// 1. Title
let s = pres.addSlide();
s.background = { color: theme.palette.titleBg };
rect(s, 0, 0, 0.4, 5.625, 'FFFFFF');
s.addText('AGENT SKILLS:\nA PORTABLE FORMAT', { x: 1, y: 1.8, w: 8, h: 1.4, fontSize: 44, color: 'FFFFFF', fontFace: theme.fonts.header, bold: true });
s.addText('Open-standard instructions for scaling expert AI agent capabilities.', { x: 1, y: 3.3, w: 8, h: 0.8, fontSize: 18, color: 'FFFFFF', fontFace: theme.fonts.body });

// 2. Summary
s = pres.addSlide();
rect(s, 0, 0, 10, 0.8, theme.palette.primary);
s.addText('Agent Skills provide a standardized framework for scaling expert expertise.', { x: 0.5, y: 0, w: 9, h: 0.8, fontSize: 20, bold: true, color: 'FFFFFF', fontFace: theme.fonts.header });
s.addText([{ text: 'Portable Instructions', options: { bullet: true } }, { text: 'Context Efficiency', options: { bullet: true } }, { text: 'Interoperable Standards', options: { bullet: true } }], { x: 0.8, y: 1.5, w: 8, h: 3, fontSize: 16, color: theme.palette.bodyText });

// 3. Lifecycle
s = pres.addSlide();
rect(s, 0, 0, 10, 0.8, theme.palette.primary);
s.addText('Skills are expert instruction units that activate based on user intent.', { x: 0.5, y: 0, w: 9, h: 0.8, fontSize: 20, bold: true, color: 'FFFFFF', fontFace: theme.fonts.header });
const pillar = (s, x, t, b) => {
  s.addShape('rect', { x, y: 1.2, w: 2.8, h: 4, fill: { color: theme.palette.altBg } });
  rect(s, x, 1.2, 0.1, 4, theme.palette.primary);
  s.addText(t, { x: x + 0.2, y: 1.4, fontSize: 16, bold: true, color: theme.palette.primary });
  s.addText(b, { x: x + 0.2, y: 2.0, w: 2.4, fontSize: 13 });
};
pillar(s, 0.5, 'Discovery', 'Agents scan metadata at startup to minimize noise.');
pillar(s, 3.6, 'Activation', 'Full instructions load only when a task matches.');
pillar(s, 6.7, 'Execution', 'Procedural steps drive local scripts and assets.');

// 4. Specification
s = pres.addSlide();
rect(s, 0, 0, 10, 0.8, theme.palette.primary);
s.addText('A strict directory protocol ensures portability and progressive disclosure.', { x: 0.5, y: 0, w: 9, h: 0.8, fontSize: 20, bold: true, color: 'FFFFFF', fontFace: theme.fonts.header });
s.addTable([['Component', 'Purpose'], ['SKILL.md', 'Core instructions & metadata'], ['scripts/', 'Executable specialized logic'], ['references/', 'High-density documentation'], ['assets/', 'Templates and data markers']], { x: 1, y: 1.5, w: 8, border: { type: 'solid', color: 'DB0011', pt: 1 }, fill: { color: 'F5F5F5' }, color: '1A1A1A', fontSize: 14 });

// 5. Best Practices
s = pres.addSlide();
rect(s, 0, 0, 10, 0.8, theme.palette.primary);
s.addText('Efficient skills prioritize procedural clarity and data offloading.', { x: 0.5, y: 0, w: 9, h: 0.8, fontSize: 20, bold: true, color: 'FFFFFF', fontFace: theme.fonts.header });
s.addText([{ text: 'Imperative phrasing: "Do X" vs "I can X"', options: { bullet: true } }, { text: 'Progressive disclosure: Offload heavy text to references/', options: { bullet: true } }, { text: 'Explicit defaults: Avoid decision menus for agents', options: { bullet: true } }], { x: 1, y: 1.5, w: 8, fontSize: 16, paraSpaceAfter: 15 });

// 6. Quality
s = pres.addSlide();
rect(s, 0, 0, 10, 0.8, theme.palette.primary);
s.addText('Performance consistency is built through structured evaluation cycles.', { x: 0.5, y: 0, w: 9, h: 0.8, fontSize: 20, bold: true, color: 'FFFFFF', fontFace: theme.fonts.header });
s.addText([{ text: 'evals.json standard test cases', options: { bullet: true } }, { text: 'Realistic prompts with distinct assertions', options: { bullet: true } }, { text: 'Refinement loop: Iterative instruction audits', options: { bullet: true } }], { x: 1, y: 1.5, w: 8, fontSize: 16, paraSpaceAfter: 15 });

// 7. Final
s = pres.addSlide();
s.background = { color: '1A1A1A' };
rect(s, 0, 0, 0.4, 5.625, theme.palette.primary);
s.addText('THANK YOU', { x: 1, y: 2, w: 8, fontSize: 60, bold: true, color: 'FFFFFF', align: 'center' });
s.addText('Scalable. Portable. Auditable.', { x: 1, y: 3.5, w: 8, fontSize: 20, color: theme.palette.primary, align: 'center' });

const outFile = path.join(__dirname, '..', 'out', 'agent_skills_hsbc.pptx');
pres.writeFile({ fileName: outFile }).then(() => console.log('File created: ' + outFile));
