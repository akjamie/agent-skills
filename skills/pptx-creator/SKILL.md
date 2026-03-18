---
name: pptx-creator
description: >
  Use this skill when the user wants to create, build, or generate a PowerPoint
  presentation (.pptx file). Applies even if the user says "make me a slide deck",
  "put together a pitch", "I need some slides", or references a presentation without
  explicitly mentioning PowerPoint. Generates consulting-grade decks using PptxGenJS
  with 11 named themes (HSBC Red, Midnight Executive, Forest & Moss, Coral Energy,
  Warm Terracotta, Ocean Gradient, Charcoal Minimal, Teal Trust, Berry & Cream, Sage
  Calm, Cherry Bold). Applies McKinsey-style structure: Pyramid Principle, MECE, and
  Action Titles. Includes a built-in theme eval harness and structured evals.
license: MIT
compatibility: >
  Requires Node.js >= 18. Run `npm install pptxgenjs --no-save` in the skill root
  before first use. Optional QA extraction requires Python with markitdown[pptx].
metadata:
  version: "2.0"
  author: akjamie
allowed-tools: Bash(node:*) Bash(npm:*) Read Write
---

# PPTX Creator Skill

## Quick Reference

| Task | Command |
|------|---------|
| List all themes | `node scripts/generate_pptx.js --list` |
| Generate with theme | `node scripts/generate_pptx.js --theme <name>` |
| Generate to custom path | `node scripts/generate_pptx.js --theme <name> --output out/my.pptx` |
| JSON output (agentic) | `node scripts/generate_pptx.js --theme <name> --json` |
| Show CLI help | `node scripts/generate_pptx.js --help` |
| Run theme eval | `node scripts/eval_themes.js` |
| Run persona/quality eval | `node scripts/eval_persona.js` |
| Install dependency | `npm install pptxgenjs --no-save` |

---

## Theme Library

All 11 themes are first-class and equal. Each lives in `assets/themes/<name>.js`
and exports `{ name, label, feel, palette, fonts, motif }`.

| Key | Label | Feel |
|-----|-------|------|
| `hsbc` | HSBC Red | Corporate / Banking |
| `midnight-executive` | Midnight Executive | Premium / Finance |
| `forest-moss` | Forest & Moss | Sustainability / Nature |
| `coral-energy` | Coral Energy | Startup / Energy |
| `warm-terracotta` | Warm Terracotta | HR / Culture / People |
| `ocean-gradient` | Ocean Gradient | Tech / Data / Analytics |
| `charcoal-minimal` | Charcoal Minimal | Minimalist / Design |
| `teal-trust` | Teal Trust | Health / Medical / Trust |
| `berry-cream` | Berry & Cream | Luxury / Lifestyle |
| `sage-calm` | Sage Calm | Wellness / Education |
| `cherry-bold` | Cherry Bold | Bold / Marketing / Brand |

### Picking a Theme

- **HSBC or banking** → `hsbc`
- **Finance / investor deck** → `midnight-executive`
- **ESG / sustainability** → `forest-moss`
- **Startup / pitch deck** → `coral-energy`
- **Tech / data** → `ocean-gradient`
- **Minimalist design** → `charcoal-minimal`
- **Healthcare** → `teal-trust`
- **HR / people** → `warm-terracotta`
- **Marketing / brand** → `cherry-bold`
- **Luxury** → `berry-cream`
- **Wellness / education** → `sage-calm`
- **User didn't specify** → default to `midnight-executive` without asking

---

## Creating a Presentation

### Workflow

1. **Determine theme** from user context (use the table above; default `midnight-executive`)
2. **Load theme** via `getTheme(themeName)` from `assets/themes/index.js`
3. **Choose scenario** — see [consulting_guidelines.md](references/consulting_guidelines.md) for the 5 storylines
4. **Build slides** using `buildSampleDeck` or write custom slides
5. **QA** — run evals, then visually inspect

### File Structure

```
skills/pptx-creator/
├── SKILL.md                          ← you are here
├── assets/
│   └── themes/                       ← 11 theme definitions + index.js
├── evals/
│   ├── evals.json                    ← structured test cases (spec format)
│   └── output/                       ← generated .pptx files from eval runs
├── examples/
│   └── sample_deck.js                ← 6-slide reusable deck builder
├── references/
│   ├── pptxgenjs_api.md              ← PptxGenJS syntax reference
│   └── consulting_guidelines.md      ← McKinsey principles, layouts, QA
└── scripts/
    ├── generate_pptx.js              ← CLI entry-point (--help, --json)
    ├── eval_themes.js                ← theme generation eval harness
    └── eval_persona.js              ← consulting quality eval harness
```

### Key Content References

- **PptxGenJS API syntax**: [references/pptxgenjs_api.md](references/pptxgenjs_api.md)
- **Consulting structure & layouts**: [references/consulting_guidelines.md](references/consulting_guidelines.md)
- **Structured eval cases**: [evals/evals.json](evals/evals.json)
- **Eval runner scripts**: [scripts/eval_themes.js](scripts/eval_themes.js) · [scripts/eval_persona.js](scripts/eval_persona.js)

### Adding a Custom Theme

1. Create `assets/themes/my-theme.js` following the same export shape as any existing theme
2. Register it in `assets/themes/index.js`:
   ```javascript
   'my-theme': require('./my-theme'),
   ```
3. Run `node tests/eval_themes.js` — if your theme passes, it is ready to use

---

## Content & Structure (Summary)

Load [consulting_guidelines.md](references/consulting_guidelines.md) for full detail.
Key rules that apply on every deck:

- **Pyramid Principle**: Lead with the answer, then supporting arguments, then evidence
- **MECE**: Grouped points must not overlap and must be collectively exhaustive
- **Action Titles**: Every slide title must be a complete declarative sentence ("So What?"), not a static topic label
- **5 Scenarios**: Executive Briefing · Client Pitch · Team Sync · Project Kickoff · Training
- **6 Layouts**: Title slide · 2-column card · Stat callouts · Icon grid · Half+chart · Dark closer

---

## PptxGenJS Pitfalls (Critical)

> These cause file corruption or broken output. Check every time.

Load [references/pptxgenjs_api.md](references/pptxgenjs_api.md) for full syntax.
Critical rules:

1. **Never use `#` with hex colors** — `"FF0000"` not `"#FF0000"`
2. **Never use 8-char hex for opacity** — use the `opacity` property on shadow:
   ```javascript
   shadow: { type: "outer", color: "000000", opacity: 0.12, blur: 8, offset: 3, angle: 135 }
   ```
3. **Never reuse option objects across shape calls** — use a factory function:
   ```javascript
   const makeShadow = () => ({ type: "outer", color: "000000", opacity: 0.12, blur: 8, offset: 3, angle: 135 });
   ```
4. **Never use unicode bullets** (`•`) — use `{ bullet: true }` in text options
5. **Use `breakLine: true`** between text run items in arrays
6. **Use `RECTANGLE` not `ROUNDED_RECTANGLE`** when pairing with accent bar overlays
7. **Negative shadow offset corrupts the file** — use `angle: 270` for upward shadows
8. **Each presentation needs a fresh `new pptxgen()` instance** — never reuse

---

## QA (Required Before Delivery)

**Assume problems exist. Do not declare success without checking.**

### Workflow

- [ ] Step 1: Run `node scripts/eval_themes.js` — all themes must PASS
- [ ] Step 2: Run `node scripts/eval_persona.js` — persona quality must PASS
- [ ] Step 3: Content check — no empty slides, no placeholder text (`lorem`, `xxxx`, `[title]`)
- [ ] Step 4: Visual check — open in PowerPoint/LibreOffice and verify layout (see [visual checklist](references/consulting_guidelines.md#qa-checklist-visual))
- [ ] Step 5: Fix any issues → Regenerate → Re-inspect → Repeat until clean pass

### Validation Loop

1. Generate → Open in PowerPoint → Inspect
2. List every issue found (if none, look harder)
3. Fix issues → Regenerate → Re-inspect affected slides
4. Repeat until a full pass reveals nothing new

---

## Adding Flowcharts & Architecture Diagrams (Mermaid)

Always render Mermaid charts **locally** — never call `kroki.io` or `mermaid.ink`:

1. Write the `.mmd` string to a temp file (e.g. `chart.mmd`)
2. Render locally:
   ```bash
   npx -y @mermaid-js/mermaid-cli -i chart.mmd -o chart.png
   ```
3. Embed the image:
   ```javascript
   slide.addImage({ path: "chart.png", x: 1, y: 1, w: 6, h: 4 });
   ```

---

## Dependencies

```bash
# Required — install once in the skill root:
npm install pptxgenjs --no-save

# Optional — text extraction for QA:
pip install "markitdown[pptx]"
```

Node.js ≥ 18 required.
