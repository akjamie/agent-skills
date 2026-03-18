# Python PR Review — Quality Standards

Reference this document in **Step 3** of the review workflow before examining any file.

---

## 1. Architecture Alignment

Before checking code quality, validate structural fit:

- Does the changed file belong to the correct architectural layer for its purpose?
  - Models → `models/` or `domain/`
  - Business logic → `services/` or `use_cases/`
  - HTTP/API → `routers/`, `views/`, or `api/`
  - Infrastructure → `repositories/`, `adapters/`, or `infra/`
- Cross-layer violations (e.g. DB queries in a router file) → **🔴 BLOCKER**
- New top-level modules not aligned with documented project structure → **🟡 WARNING**

---

## 2. Python Code Quality

### Type Hints
- All new **public** functions and methods must have type annotations on parameters and return type.
- Missing type hints on new public API → **🟡 WARNING**
- Using `Any` freely without justification → **🔵 INFO**

### Docstrings
- All new classes must have a class-level docstring.
- All new public methods/functions must have docstrings (Google or NumPy style preferred).
- Missing docstrings → **🔵 INFO** (upgrade to **🟡 WARNING** if the function is complex)

### Exception Handling
- Bare `except:` or `except Exception:` without logging or re-raise → **🟡 WARNING**
- Swallowing exceptions silently (`except ...: pass`) → **🔴 BLOCKER**
- Raising generic `Exception` instead of a domain-specific exception class → **🟡 WARNING**

### Naming Conventions (PEP 8)
- Classes: `PascalCase`. Functions/variables: `snake_case`. Constants: `UPPER_SNAKE`.
- Violations → **🔵 INFO**

### Formatting
- Prefer f-strings over `%` formatting or `.format()` for new code → **🔵 INFO**
- Line length > 120 chars (or project-configured max from `pyproject.toml`) → **🔵 INFO**

---

## 3. Security

| Issue | Severity |
|-------|----------|
| Hardcoded secrets, API keys, passwords (regex: `(?i)(secret|key|token|password)\s*=\s*['"][^'"]{8,}`) | 🔴 BLOCKER |
| SQL string concatenation / f-string SQL without parameterization | 🔴 BLOCKER |
| `subprocess` with `shell=True` and user-controlled input | 🔴 BLOCKER |
| `eval()` or `exec()` on external input | 🔴 BLOCKER |
| `pickle.loads()` on untrusted data | 🔴 BLOCKER |
| `yaml.load()` without `Loader=yaml.SafeLoader` | 🟡 WARNING |
| Logging sensitive fields (passwords, tokens, PII) | 🟡 WARNING |
| `DEBUG=True` or insecure config committed | 🟡 WARNING |

---

## 4. Async Correctness

- `time.sleep()` inside `async def` → **🔴 BLOCKER** (use `asyncio.sleep()`)
- Blocking I/O (file reads, `requests.get()`) inside `async def` without `run_in_executor` → **🔴 BLOCKER**
- Missing `await` on coroutine calls → **🔴 BLOCKER**
- `asyncio.get_event_loop()` instead of `asyncio.get_running_loop()` (Python ≥ 3.10) → **🟡 WARNING**

---

## 5. Testing

- New public business logic added without any test change → **🟡 WARNING**
- New endpoint added without integration/API test → **🟡 WARNING**
- Test file present but no assertions (`assert` statements) → **🟡 WARNING**
- Tests depend on external network or real DB without mocking → **🟡 WARNING**
- Test coverage drop (if CI reports it) → **🔵 INFO**

---

## 6. Database / ORM

- New/changed ORM model without a corresponding migration file in the diff → **🔴 BLOCKER**
- N+1 query pattern (loop with `.get()` inside) → **🟡 WARNING**
- Missing `select_related` / `prefetch_related` (Django) on queryset accessed in template/serializer → **🟡 WARNING**
- Raw SQL in ORM model layer → **🟡 WARNING**

---

## 7. Dependency Hygiene

- New `import` of a third-party package not listed in `pyproject.toml` / `requirements.txt` → **🟡 WARNING**
- Pinned dependency version changed without explanation in PR description → **🔵 INFO**
- `requirements.txt` used instead of `pyproject.toml` in a modern project → **🔵 INFO**

---

## 8. Configuration & Environment

- Config values read directly from environment in business logic instead of a settings/config module → **🟡 WARNING**
- `.env` file committed → **🔴 BLOCKER**
- Default values that differ between environments hardcoded → **🟡 WARNING**

---

## Severity Reference

| Icon | Level | Action Required |
|------|-------|-----------------|
| 🔴 | BLOCKER | Must be fixed before merge. `REQUEST_CHANGES`. |
| 🟡 | WARNING | Should be fixed; acceptable with explanation. `COMMENT`. |
| 🔵 | INFO | Nice-to-have / style / future consideration. `COMMENT`. |
