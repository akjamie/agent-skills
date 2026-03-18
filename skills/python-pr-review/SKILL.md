---
name: python-pr-review
description: >
  Use this skill when the user wants to review a Python pull request, do a code
  review, check a PR, or give feedback on changes. Applies even if they say
  "look at this PR", "review my branch", "what do you think of these changes",
  or "can you check PR #42". Uses GitHub MCP to fetch the diff, reads available
  project context files (AGENTS.md, project.md, pyproject.toml) to align the
  review with the project's architecture, then posts a structured review comment.
license: MIT
compatibility: >
  Requires Python >= 3.10 and GitHub MCP available in the agent environment.
  No external pip dependencies beyond the standard library.
metadata:
  version: "1.0"
  author: akjamie
allowed-tools: mcp(github:*) Read Bash(python:*)
---

# Python PR Review Skill

## Quick Reference

| Task | How |
|------|-----|
| Fetch PR data | `mcp: get_pull_request`, `get_pull_request_files`, `get_pull_request_comments` |
| Discover project context | `python scripts/check_context.py --path <repo-root> --json` |
| Post review | `mcp: create_pull_request_review` |
| Review standards | [references/review_standards.md](references/review_standards.md) |
| Output template | [references/review_template.md](references/review_template.md) |
| Context file guide | [references/architecture_patterns.md](references/architecture_patterns.md) |

---

## When to Use This Skill

Use this skill when the user provides:
- A GitHub PR URL or a PR number + repo name
- A request to "review", "check", "look at", or "give feedback on" code changes
- Phrases like "what do you think of this PR?", "is this ready to merge?"

If the user does not provide enough information to identify the PR, ask for:
- `owner/repo` (e.g. `akjamie/agent-skills`)
- PR number

---

## Workflow

Follow these steps in order. Check off each before proceeding to the next.

- [ ] **Step 1 — Discover project context**
  Run: `python scripts/check_context.py --path <repo-root> --json`
  If the repo root is unknown, use the GitHub MCP to list repository files and look for context files in the root. Priority order: `AGENTS.md` > `project.md` > `CLAUDE.md` > `pyproject.toml` > `README.md`.
  See [architecture_patterns.md](references/architecture_patterns.md) for what to extract from each file.

- [ ] **Step 2 — Fetch PR data via GitHub MCP**
  ```
  mcp: get_pull_request        → title, body, base branch, labels
  mcp: get_pull_request_files  → list of changed files + patch diffs
  mcp: get_pull_request_comments → existing review comments (avoid duplicating)
  ```

- [ ] **Step 3 — Load the review checklist**
  Read [references/review_standards.md](references/review_standards.md) fully before starting the review.
  Map each changed file to the relevant checklist sections.

- [ ] **Step 4 — Perform the review**
  Go through **each changed file** in the PR diff:
  1. Note the file's layer/role (model, service, router, test, config, etc.)
  2. Apply architecture alignment checks from the context files
  3. Apply Python quality checks from the standards reference
  4. Record every issue with: severity, file, line number (from the diff), issue, suggestion

- [ ] **Step 5 — Produce the review using the template**
  Use the template in [references/review_template.md](references/review_template.md) exactly.
  Do not abbreviate the checklist section even if there are no issues — mark each item ✅ or ❌.

- [ ] **Step 6 — Post the review via GitHub MCP**
  ```
  mcp: create_pull_request_review
    event: "APPROVE" | "REQUEST_CHANGES" | "COMMENT"
    body: <full review from Step 5>
  ```
  Default to `"COMMENT"` if uncertain whether to approve or request changes.
  Use `"REQUEST_CHANGES"` only when at least one 🔴 BLOCKER is found.

---

## GitHub MCP Quick Reference

| MCP Tool | Use For |
|----------|---------|
| `get_pull_request` | PR title, description, base/head branches |
| `get_pull_request_files` | List of changed files with patch diffs |
| `get_pull_request_comments` | Existing comments (avoid duplication) |
| `get_pull_request_reviews` | Prior review decisions |
| `create_pull_request_review` | Post the final structured review |
| `add_issue_comment` | Leave a general repo comment instead |
| `get_file_contents` | Read full source files for context |

---

## Gotchas

- **Diff vs. full file**: `get_pull_request_files` returns only the patch. Call `get_file_contents` to see the full function if the diff lacks enough context.
- **AGENTS.md is authoritative**: If `AGENTS.md` or `CLAUDE.md` says "do not modify X", flag any PR touching X as a BLOCKER regardless of code quality.
- **Migration files**: If a Django/SQLAlchemy model changes but no migration file is in the diff, flag as a BLOCKER.
- **Test coverage**: If new logic is added without any corresponding test file change, flag as a WARNING minimum.
- **Python version**: Check `pyproject.toml` for `requires-python`. Do not suggest syntax unavailable in the declared minimum version.
- **Async pitfalls**: `time.sleep()` inside an `async def` is always a BLOCKER. Check for it explicitly.

---

## Key Content References

- [references/review_standards.md](references/review_standards.md) — full Python quality checklist
- [references/architecture_patterns.md](references/architecture_patterns.md) — project context extraction guide
- [references/review_template.md](references/review_template.md) — mandatory review output template
- [evals/evals.json](evals/evals.json) — structured test cases for this skill
