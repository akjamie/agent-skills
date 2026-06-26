---
name: orchestrated-pr-review
description: >
  Use this skill to perform a multi-agent orchestrated code review on a GitHub pull
  request. Analyzes changes across 4 domains (Security, Performance, Style, and Test Coverage),
  synthesizes the findings, posts a unified review comment to GitHub, and logs full trace
  observability to Langfuse.
license: MIT
compatibility: >
  Requires the GitHub MCP server and the 'langfuse-tracing' skill.
metadata:
  version: "1.0"
  author: akjamie
allowed-tools: mcp(github:*) Read Bash(python:*)
---

# Orchestrated PR Review Skill

This skill teaches you how to perform a multi-domain code review on a GitHub Pull Request, matching the exact orchestration process of the `code-review-orchestrator` system.

---

## Quick Reference

| Phase | Action |
|-------|--------|
| **1. Context & Data** | Discover project rules and fetch the PR diff. |
| **2. Analysis** | Run 4 parallel/sequential reviews (Security, Performance, Style, Test Coverage). |
| **3. Synthesis** | Deduplicate, rank, and format findings into Markdown. |
| **4. Telemetry** | Log the full review trace to Langfuse. |
| **5. Delivery** | Post the final comment back to the GitHub PR. |

---

## Workflow Steps

Follow these steps precisely:

### Step 1: Discover Project Context & Fetch PR
1. Run context discovery to find project-specific coding rules:
   ```bash
   python d:/workbench/ai-agent/agent-skills/skills/python-pr-review/scripts/check_context.py --path <repo-root> --json
   ```
2. Fetch the PR metadata and changed files. You can use the reusable python script:
   ```bash
   python d:/workbench/ai-agent/agent-skills/skills/python-pr-review/scripts/fetch_pr.py --owner <owner> --repo <repo> --pr <number> --json
   ```
   Or use the GitHub MCP tools `get_pull_request` and `get_pull_request_files`.

### Step 1b: Run Static Analysis & Linters (Optional but Recommended)
If the project environment allows executing commands, run the configured linter to find deterministic issues on the changed files:
1. **Python**: Run `ruff check <changed_files>` or `flake8 <changed_files>` or `pylint <changed_files>`.
2. **Java**: Run `./gradlew check` / `./gradlew checkstyleMain` (for Gradle) or `mvn checkstyle:check` (for Maven) if available.
3. **JS/TS**: Run `npm run lint` or `npx eslint <changed_files>`.
4. Parse the linter stdout/stderr, map the issues to changed lines, and convert them to this JSON finding format:
   ```json
   {
     "severity": "MEDIUM|LOW|INFO",
     "category": "style",
     "filePath": "path/to/file",
     "lineNumber": 12,
     "message": "Linter: [rule-id] rule description",
     "suggestion": "Correct the syntax according to the linter rule"
   }
   ```
5. Append these findings to the **Style Review** findings JSON array in the next step.

### Step 2: Perform the 4 Specialized Reviews
For each file changed in the PR, run four separate analyses. For each analysis, load its respective prompt from `references/prompts/` and analyze the code diff to generate findings:

1. **Security Review** (`references/prompts/security.txt`):
   - Look for OWASP Top 10, SQL/Command injections, hardcoded credentials, and path traversals.
2. **Performance Review** (`references/prompts/performance.txt`):
   - Look for N+1 queries, high algorithmic complexity, resource leaks, and unnecessary allocations.
3. **Style Review** (`references/prompts/style.txt`):
   - Look for naming conventions, SOLID violations, code smells, and dead code.
4. **Test Coverage Review** (`references/prompts/test_coverage.txt`):
   - Look for missing tests on new features, weak assertions, or untested edge cases.

*Note: Each analysis must return a JSON array containing findings or `[]` if none.*

### Step 3: Synthesize Findings
Load the synthesizer system prompt from `references/prompts/synthesizer.txt`. Pass the JSON findings from the 4 specialized reviews as inputs to the synthesizer. The output must be a single, clean Markdown string.

### Step 4: Log Telemetry to Langfuse
Record your execution steps and log them to Langfuse using the `langfuse-tracing` skill:
1. Construct the JSON trace payload containing the root trace (overall inputs and final Markdown output) and individual generation/span objects for each specialist review and the synthesis step. Include model name, inputs, outputs, and token counts.
2. Save this JSON payload to a temporary file (e.g. `review_trace.json`).
3. Run the tracing script:
   ```bash
   python d:/workbench/ai-agent/agent-skills/skills/langfuse-tracing/scripts/langfuse_trace.py --payload-file review_trace.json --env-file d:/workbench/ai-agent/code-review-orchestrator/.env
   ```
4. Delete the temporary JSON file.

### Step 5: Post to GitHub
Post the synthesized Markdown comment as a pull request review:
- Use the GitHub MCP tool `create_pull_request_review`.
- Set the `event` to `"COMMENT"` (or `"REQUEST_CHANGES"` if at least one `🔴 CRITICAL` or `🔴 BLOCKER` finding is identified).
- Set the `body` to the synthesized Markdown string.
