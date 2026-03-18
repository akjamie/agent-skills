# PR Review Output Template

Use this template EXACTLY for every review produced by the `python-pr-review` skill.
Do not abbreviate or omit any section. If a section has nothing to report, write "None."

---

```markdown
## PR Review — {PR Title} (#{PR Number})

> **Repo**: {owner}/{repo} · **Base**: `{base_branch}` ← `{head_branch}`
> **Context files used**: {comma-separated list of context files found, or "None (defaults applied)"}

---

### Summary

{1–2 sentence overall assessment of the PR. State clearly whether it is ready to merge, needs changes, or is pending more information.}

---

### Architecture Alignment

{How the changed files fit (or conflict) with the project's documented architecture from project.md / AGENTS.md. If no context files were found, state that defaults were applied.}

| File | Layer | Aligned? | Note |
|------|-------|----------|------|
| {path/to/file.py} | {service/model/router/...} | ✅ / ❌ | {brief note} |

---

### Issues Found

{List every issue discovered. If none, write "No issues found."}

| Severity | File | Line | Issue | Suggestion |
|----------|------|------|-------|------------|
| 🔴 BLOCKER | {file} | {L42} | {description} | {fix} |
| 🟡 WARNING | {file} | {L17} | {description} | {fix} |
| 🔵 INFO | {file} | {L88} | {description} | {fix} |

---

### Checklist

- {✅/❌} Type hints on all new public functions
- {✅/❌} Docstrings on all new classes and public methods
- {✅/❌} Tests cover new logic
- {✅/❌} No hardcoded secrets or credentials
- {✅/❌} All new third-party imports declared in pyproject.toml / requirements.txt
- {✅/❌} No blocking I/O or `time.sleep()` inside `async def`
- {✅/❌} Database model changes include migration files
- {✅/❌} No AGENTS.md / project.md rules violated

---

### Verdict

**{APPROVE / REQUEST CHANGES / COMMENT}**

{1–3 sentence reasoning. For REQUEST CHANGES: list the blockers that must be resolved. For APPROVE: confirm what was checked. For COMMENT: explain why a firm decision wasn't made.}
```

---

## Verdict Decision Rules

| Condition | Verdict |
|-----------|---------|
| Zero 🔴 BLOCKERs, all checklist items ✅ | **APPROVE** |
| One or more 🔴 BLOCKERs | **REQUEST CHANGES** |
| No blockers but checklist items unclear or PR description incomplete | **COMMENT** |
| PR only contains documentation or config changes with no logic | **APPROVE** (after confirming no AGENTS.md violations) |

---

## Notes on Line References

- Use the GitHub diff line format, e.g. `L42` for line 42 in the **new** file
- When referencing a line that was removed (prefixed `-` in diff), use `L42 (removed)`
- If the exact line number is unclear from the patch, reference the function or class name instead
