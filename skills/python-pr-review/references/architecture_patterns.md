# Project Context Discovery Guide

Use this reference in **Step 1** of the review workflow. Its purpose is to tell you
**what to extract** from each project context file so you can align the review
with the project's documented architecture and rules.

---

## Priority Order

Read context files in this priority order. Higher-priority files override lower ones.

```
1. AGENTS.md      (agent-specific rules — ALWAYS respect these)
2. CLAUDE.md      (same as AGENTS.md — used by Claude-based agents)
3. project.md     (human-written architecture decisions)
4. pyproject.toml (declared tooling, Python version, linting config)
5. README.md      (design intent, module structure overview)
```

If none are present, apply all defaults from `review_standards.md` without customization.

---

## What to Extract from Each File

### `AGENTS.md` / `CLAUDE.md`
These files contain **agent-specific instructions** that are authoritative and non-negotiable.

Look for and extract:
- **Do-not-touch rules**: "Do not modify X" or "Never change Y" → flag any PR diff touching those files as 🔴 BLOCKER
- **Mandatory review steps**: Any additional checks the agent must perform
- **Bypass rules**: Things explicitly allowed even if they look wrong
- **Output format preferences**: If specified, override the default review template

**Example extraction:**
```
AGENTS.md says: "Never modify config/settings_base.py without a migration ticket."
Action: If the diff touches settings_base.py, add BLOCKER: "Requires migration ticket per AGENTS.md"
```

---

### `project.md`
Contains architectural decisions and conventions written by the team.

Look for and extract:
- **Layer definitions**: What belongs in `models/`, `services/`, `routers/`, etc.
- **Naming conventions**: Project-specific names that differ from defaults
- **Approved libraries**: List of approved dependencies for each concern
- **Forbidden patterns**: Patterns explicitly banned in this codebase
- **Data flow rules**: e.g. "Services must never import from routers"

**Example extraction:**
```
project.md says: "All domain logic lives in services/. Routers are thin."
Action: Flag any business logic found directly in a router file as 🔴 BLOCKER.
```

---

### `pyproject.toml`
Contains authoritative tooling and version configuration.

Extract these fields:
```toml
[project]
requires-python = ">=3.12"   # → enforce syntax/API compatibility

[tool.ruff]
line-length = 100            # → use this for line length warnings

[tool.pytest.ini_options]
testpaths = ["tests"]        # → confirms test directory location

[tool.mypy]
strict = true                # → enforce strict type checking in review
```

If `strict = true` in mypy, upgrade all type hint warnings to **🟡 WARNING**.
If `line-length` is configured, use that value instead of 120 in standards.

---

### `README.md`
Use as a fallback if no `project.md` exists. Extract:
- Module/package structure diagrams
- Key design patterns mentioned
- Any "Contributing" section that specifies review requirements

---

## Context Variables to Carry into the Review

After reading the context files, populate these variables mentally and apply them
throughout the review:

| Variable | Source | Effect |
|----------|--------|--------|
| `python_version` | `pyproject.toml` → `requires-python` | Reject syntax not supported |
| `line_length` | `pyproject.toml` → `tool.ruff.line-length` | Line length threshold |
| `linter` | `pyproject.toml` presence of `[tool.ruff]` or `[tool.flake8]` | Note in review |
| `strict_types` | `pyproject.toml` → `tool.mypy.strict` | Upgrade type hint severity |
| `layer_rules` | `project.md` | Architecture boundary enforcement |
| `no_touch_files` | `AGENTS.md` / `CLAUDE.md` | Immediate BLOCKER if touched |
| `test_path` | `pyproject.toml` → `tool.pytest.ini_options.testpaths` | Locate test files |

---

## When No Context Files Exist

Apply defaults:
- Python version: assume >= 3.10
- Line length: 120
- Test directory: `tests/`
- No layer rules enforced (use common-sense MVC/service pattern)
- No no-touch files
- Note in the review: _"No project.md or AGENTS.md found — review applied generic Python best practices."_
