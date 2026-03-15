---
name: pptx-creator
description: >
  Create modern, professionally designed PowerPoint presentations (.pptx) using
  PptxGenJS. Supports 11 named themes including HSBC Red, Midnight Executive,
  Forest & Moss, Coral Energy, Warm Terracotta, Ocean Gradient, Charcoal
  Minimal, Teal Trust, Berry & Cream, Sage Calm, and Cherry Bold. Every theme
  shares the same code structure — HSBC Red is one theme in the library, not a
  special case. Includes a built-in evaluation harness (eval_themes.js) that
  validates all themes end-to-end.
---

# PPTX Creator Skill

## Quick Reference

| Task | Command |
|------|---------|
| List all themes | `node scripts/generate_pptx.js --list` |
| Generate with theme | `node scripts/generate_pptx.js --theme <name>` |
| Generate to custom path | `node scripts/generate_pptx.js --theme <name> --output out/my.pptx` |
| Run full theme eval | `node tests/eval_themes.js` |
| Run persona/quality eval | `node tests/eval_persona.js` |
| Install dependency | `npm install pptxgenjs --no-save` |

---

## Theme Library

All 11 themes ship as equal first-class entries. Each lives in `assets/themes/<name>.js`
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
- **HSBC or banking presentations** → `hsbc`
- **Finance / investor decks** → `midnight-executive`
- **ESG / sustainability** → `forest-moss`
- **Startup / pitch deck** → `coral-energy`
- **Tech / data engineering** → `ocean-gradient`
- **Minimalist design** → `charcoal-minimal`
- **Healthcare / medical** → `teal-trust`
- **HR / people culture** → `warm-terracotta`
- **Marketing / brand** → `cherry-bold`
- **Luxury / lifestyle** → `berry-cream`
- **Wellness / education** → `sage-calm`
- **User didn't specify** → ask, or default to `midnight-executive`

---

## Creating a Presentation

### Workflow (from scratch)

1. **Determine theme** from user context (see Picking a Theme above)
2. **Load theme** from `assets/themes/index.js` via `getTheme(themeName)`
3. **Build slides** using the `buildSampleDeck` helper or write custom slides
4. **Call** `pres.writeFile({ fileName: 'output.pptx' })`
5. **QA** — run eval, then visually inspect

### File Structure

```
skills/pptx-creator/
├── SKILL.md                    ← you are here
├── assets/
│   ├── themes/                 ← central registry
│   │   ├── index.js
│   │   ├── hsbc.js
│   │   ├── ...
├── examples/
│   └── sample_deck.js          ← 6-slide reusable builder
├── scripts/
│   └── generate_pptx.js        ← CLI entry-point
├── references/
│   └── pptxgenjs_api.md        ← Syntax reference (Shapes, Charts, Text arrays)
└── tests/
    └── eval_themes.js          ← eval + test harness
```

### Adding a Custom Theme

1. Create `assets/themes/my-theme.js` following the same export shape as any existing theme
2. Register it in `assets/themes/index.js`:
   ```javascript
   'my-theme': require('./my-theme'),
   ```
3. Run `node tests/eval_themes.js` — if your theme passes, it is ready to use

---

## McKinsey Content & Structure Guidelines

As a McKinsey-caliber agent, ensure all presentations adhere to the following core principles:

### 1. Pyramid Principle & MECE
- **Pyramid Principle**: Start with the core answer or recommendation first, followed by supporting arguments, and finally the data/evidence (Top-down communication).
- **MECE (Mutually Exclusive, Collectively Exhaustive)**: Ensure that grouped points, pillars, or arguments do not overlap (Mutually Exclusive) and that no major points are left out (Collectively Exhaustive).
- **Action Titles**: Every slide title must be a complete sentence that communicates the "So What?" or main takeaway, rather than just a static topic (e.g., use "Operating costs decreased by 15% due to Q2 automation" instead of "Q2 Cost Analysis").

### 2. Five Typical Scenarios & Storylines

Always tailor the deck to one of these 5 typical scenarios. **Note: All 11 themes are available and suitable for all 5 scenarios.**

| Scenario | Objective / Narrative Arc | Recommended Layout Mix |
|----------|---------------------------|------------------------|
| **1. Executive Briefing (Senior Managers)** | Bottom-line impact, fast decision-making. "Answer first" structure. | High data-to-text density. Heavy use of **Half+chart** and **Stat callouts**. |
| **2. Client Pitch / Proposal** | Persuasive arc: Problem $\rightarrow$ Solution $\rightarrow$ Value $\rightarrow$ Proof. | **Icon grids** for capabilities, **2-column** for case studies. Highly visual. |
| **3. Internal Sharing / Team Sync** | Informative, alignment-focused, actionable updates. | Balanced text/visuals. **2-column cards** for updates, structured next steps. |
| **4. Project Kickoff / Status Update** | Process clarity, timelines, roles, risk tracking (RAG status). | **Icon grid** for roles/pillars, structured tables/timelines. |
| **5. Training / Workshop** | Educational, easy to follow, step-by-step concepts. | Lower density per slide. Large, readable fonts (14pt+). Minimal charts. |

---

## Aesthetic & Layout Rules

These professional layout rules create a polished, "consulting-grade" feel. They apply regardless of which theme or scenario is used. Ensure alignment is mathematically perfect and uncluttered.

### Layout

Every slide uses one of these proven layouts — never plain title + bullets:

| Layout | When to use |
|--------|------------|
| **Title slide** | First slide, dark bg, large text, decorative shapes |
| **2-column card** | Executive summary, before/after, text + illustration |
| **Stat callouts** | Key metrics — big numbers (48pt+) with small labels |
| **Icon grid** | Feature lists, pillars, team intro (2×2 or 2×3) |
| **Half+chart** | Data stories — chart occupies most of the slide |
| **Dark closer** | Thank-you, Q&A, section divider |

### Typography

| Element | Size | Weight |
|---------|------|--------|
| Slide title (header bar) | 22pt | Bold |
| Hero stat | 48–56pt | Bold |
| Section label | 14pt | Bold |
| Body text | 11–13pt | Regular |
| Caption / muted | 10–11pt | Regular |

Each theme specifies `fonts.header` and `fonts.body`. Always use those — do
not hardcode Arial or Calibri unless the theme specifies them.

### Color Usage

- **Primary** → header bars, accent bars, key numbers, borders
- **Secondary** → card backgrounds, chart secondary series, muted text
- **Accent** → chart highlights, icon circles, callout text
- **Muted** → axis labels, captions, secondary text

### Motif

Every content card gets either a left-side (or top) accent bar in `palette.primary`.
This is the skill's single repeating visual motif — carry it on every content slide.

```javascript
// accent bar — left side of a card
slide.addShape('rect', {
  x: cardX, y: cardY, w: 0.08, h: cardH,
  fill: { color: theme.palette.primary },
  line: { color: theme.palette.primary },
});
```

### Sandwich Structure

- **Dark slides** (title, closer): use `palette.titleBg` / `motif.darkSlideColor`
- **Content slides**: use `palette.contentBg` (white or near-white)
- **Alt sections**: use `palette.altBg` for card backgrounds

### Spacing & Margins

- Slide edge margin: **≥ 0.4"**
- Between content blocks: **0.3–0.5"**
- Card internal padding: **0.15–0.2"** left offset after the accent bar
- Never fill every inch — leave breathing room

---

## PptxGenJS Pitfalls (Critical)

> These cause file corruption or broken output. Check every time.

1. **Never use `#` with hex colors** — `"FF0000"` not `"#FF0000"`
2. **Never use 8-char hex for opacity** — use the `opacity` property on shadow:
   ```javascript
   shadow: { type: "outer", color: "000000", opacity: 0.12, blur: 8, offset: 3, angle: 135 }
   ```
3. **Never reuse option objects across shape calls** — PptxGenJS mutates objects in-place.
   Use a factory function:
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

### Step 1 — Run the evals

```bash
# 1. Technical/Theme validation:
node tests/eval_themes.js

# 2. Consulting Persona/Quality validation:
node tests/eval_persona.js
```

Both technical and persona evals must produce `PASS`. If any fail, fix before continuing.

### Step 2 — Content check

- No slides are empty
- All text is correct and complete
- No leftover placeholder text (`lorem`, `xxxx`, `[title]`, etc.)

### Step 3 — Visual check

Open the generated `.pptx` in PowerPoint or LibreOffice and check each slide:

- [ ] No text overflows or is cut off at the edge
- [ ] No elements overlap each other
- [ ] Left accent bar visible on all content cards
- [ ] Chart renders with correct theme colors
- [ ] Dark title/closer slide uses correct background colour
- [ ] All text has sufficient contrast against its background
- [ ] Slide edge margins ≥ 0.4" on all sides
- [ ] No AI tells (accent lines under titles, random blue defaults, uneven spacing)

### Verification Loop

1. Generate → Open in PowerPoint → Inspect
2. List every issue found (if none, look harder)
3. Fix issues → Regenerate → Re-inspect affected slides
4. Repeat until a full pass reveals nothing new

---

## Adding Flowcharts & Architecture Diagrams (Mermaid)

If you need to include a Mermaid chart, **ALWAYS use local tools to render it** instead of making HTTPS calls (e.g., do not use `kroki.io` or `mermaid.ink`). 

1. Write the `.mmd` string to a temporary file (e.g. `chart.mmd`).
2. Run the local Mermaid CLI via `npx`:
   ```bash
   npx -y @mermaid-js/mermaid-cli -i chart.mmd -o chart.png
   ```
3. Add the resulting image into your presentation:
   ```javascript
   slide.addImage({ path: "chart.png", x: 1, y: 1, w: 6, h: 4 });
   ```

---

## Dependencies

```bash
# General requirement for creation (install locally, no package.json footprint):
npm install pptxgenjs --no-save

# Text extraction for QA (optional):
pip install "markitdown[pptx]"
```

Node.js ≥ 18 required.
