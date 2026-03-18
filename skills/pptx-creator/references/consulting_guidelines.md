# Consulting Content & Structure Guidelines

This reference covers the consulting principles, scenario definitions, layout rules,
and aesthetic standards used by the pptx-creator skill. Load it when you need to
design slide structure or verify content quality beyond what SKILL.md summarises.

---

## McKinsey Principles

### Pyramid Principle & MECE
- **Pyramid Principle**: Lead with the core answer/recommendation first; follow with
  supporting arguments; close with data and evidence (top-down communication).
- **MECE (Mutually Exclusive, Collectively Exhaustive)**: Points, pillars, and
  grouped arguments must not overlap and must together cover the full topic.
- **Action Titles**: Every slide title must be a complete sentence communicating
  the "So What?" — the main takeaway — rather than a static topic label.
  - ✅ "Operating costs decreased 15% due to Q2 automation"
  - ❌ "Q2 Cost Analysis"

---

## Five Scenario Storylines

Always tailor the deck to one of these 5 scenarios. All 11 themes apply equally.

| Scenario | Objective / Narrative Arc | Recommended Layout Mix |
|----------|---------------------------|------------------------|
| **1. Executive Briefing** | Bottom-line impact, fast decision-making. "Answer first" structure. | Heavy use of **Half+chart** and **Stat callouts**. High data-to-text density. |
| **2. Client Pitch / Proposal** | Persuasive arc: Problem → Solution → Value → Proof. | **Icon grids** for capabilities, **2-column** for case studies. Highly visual. |
| **3. Internal Sharing / Team Sync** | Informative, alignment-focused, actionable updates. | Balanced text/visuals. **2-column cards** for updates, structured next steps. |
| **4. Project Kickoff / Status Update** | Process clarity, timelines, roles, risk tracking (RAG status). | **Icon grid** for roles/pillars, structured tables/timelines. |
| **5. Training / Workshop** | Educational, step-by-step concepts, easy to follow. | Lower density per slide. Large readable fonts (14pt+). Minimal charts. |

---

## Slide Layout Catalogue

Every slide uses one proven layout — never plain title + bullets:

| Layout | When to use |
|--------|------------|
| **Title slide** | First slide, dark bg, large text, decorative shapes |
| **2-column card** | Executive summary, before/after, text + illustration |
| **Stat callouts** | Key metrics — big numbers (48pt+) with small labels |
| **Icon grid** | Feature lists, pillars, team intro (2×2 or 2×3) |
| **Half+chart** | Data stories — chart occupies most of the slide |
| **Dark closer** | Thank-you, Q&A, section divider |

---

## Typography Scale

| Element | Size | Weight |
|---------|------|--------|
| Slide title (header bar) | 22pt | Bold |
| Hero stat | 48–56pt | Bold |
| Section label | 14pt | Bold |
| Body text | 11–13pt | Regular |
| Caption / muted | 10–11pt | Regular |

Always use `theme.fonts.header` and `theme.fonts.body` — never hard-code Arial or Calibri.

---

## Color Roles

| Role | Usage |
|------|-------|
| **Primary** | Header bars, accent bars, key numbers, borders |
| **Secondary** | Card backgrounds, chart secondary series, muted text |
| **Accent** | Chart highlights, icon circles, callout text |
| **Muted** | Axis labels, captions, secondary text |

---

## Repeating Visual Motif

Every content card must have a left-side accent bar in `palette.primary`:

```javascript
// accent bar — left side of a card
slide.addShape('rect', {
  x: cardX, y: cardY, w: 0.08, h: cardH,
  fill: { color: theme.palette.primary },
  line: { color: theme.palette.primary },
});
```

---

## Sandwich Structure

- **Dark slides** (title, closer): use `palette.titleBg` / `motif.darkSlideColor`
- **Content slides**: use `palette.contentBg` (white or near-white)
- **Alt sections**: use `palette.altBg` for card backgrounds

---

## Spacing & Margins

- Slide edge margin: **≥ 0.4"**
- Between content blocks: **0.3–0.5"**
- Card internal padding: **0.15–0.2"** left offset after the accent bar
- Never fill every inch — leave breathing room

---

## QA Checklist (Visual)

Open the generated `.pptx` in PowerPoint or LibreOffice and verify each slide:

- [ ] No text overflows or is cut off at the edge
- [ ] No elements overlap each other
- [ ] Left accent bar visible on all content cards
- [ ] Chart renders with correct theme colors
- [ ] Dark title/closer slide uses correct background colour
- [ ] All text has sufficient contrast against its background
- [ ] Slide edge margins ≥ 0.4" on all sides
- [ ] No AI tells (accent lines under titles, random blue defaults, uneven spacing)
