#!/usr/bin/env python3
"""
check_context.py — Project context discovery for the python-pr-review skill.

Walks a repository root to find and parse project context files
(AGENTS.md, project.md, CLAUDE.md, pyproject.toml, README.md) and returns
a structured JSON summary of the architecture rules and tooling configuration
the agent should apply during a PR review.

Usage:
  python scripts/check_context.py --path <repo-root>
  python scripts/check_context.py --path /path/to/repo --json

Exit codes:
  0  Success (even if no context files found — defaults are applied)
  1  The provided path does not exist or is not a directory
"""

import argparse
import json
import os
import sys
import re


CONTEXT_FILES_PRIORITY = [
    "AGENTS.md",
    "CLAUDE.md",
    "project.md",
    "pyproject.toml",
    "README.md",
]


def parse_args():
    p = argparse.ArgumentParser(
        prog="check_context.py",
        description="Discover project context files and extract architecture rules.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/check_context.py --path .
  python scripts/check_context.py --path /home/user/my-project --json

Output fields (JSON mode):
  context_files_found   list of filenames discovered
  python_version        from pyproject.toml requires-python, or null
  linter                "ruff" | "flake8" | "pylint" | null
  line_length           int from linter config, or 120 (default)
  strict_types          bool — true if mypy strict=true in pyproject.toml
  test_paths            list of test directories from pytest config
  no_touch_rules        list of path patterns extracted from AGENTS.md/CLAUDE.md
  agent_rules_summary   first 500 chars of AGENTS.md/CLAUDE.md content
  architecture_summary  first 500 chars of project.md content
""",
    )
    p.add_argument("--path", required=True, help="Path to the repository root")
    p.add_argument("--json", action="store_true", dest="json_out",
                   help="Emit machine-readable JSON to stdout")
    return p.parse_args()


def read_file(path: str) -> str | None:
    try:
        with open(path, encoding="utf-8", errors="replace") as f:
            return f.read()
    except OSError:
        return None


def extract_python_version(toml_content: str) -> str | None:
    m = re.search(r'requires-python\s*=\s*["\']([^"\']+)["\']', toml_content)
    return m.group(1).strip() if m else None


def extract_line_length(toml_content: str) -> int:
    m = re.search(r'line-length\s*=\s*(\d+)', toml_content)
    return int(m.group(1)) if m else 120


def extract_linter(toml_content: str) -> str | None:
    if "[tool.ruff]" in toml_content:
        return "ruff"
    if "[tool.flake8]" in toml_content:
        return "flake8"
    if "[tool.pylint" in toml_content:
        return "pylint"
    return None


def extract_strict_types(toml_content: str) -> bool:
    m = re.search(r'\[tool\.mypy\].*?strict\s*=\s*(true|false)', toml_content,
                  re.DOTALL | re.IGNORECASE)
    return m.group(1).lower() == "true" if m else False


def extract_test_paths(toml_content: str) -> list[str]:
    m = re.search(r'testpaths\s*=\s*\[([^\]]+)\]', toml_content)
    if m:
        raw = m.group(1)
        return [s.strip().strip('"\'') for s in raw.split(',') if s.strip()]
    return ["tests"]  # default


def extract_no_touch_rules(content: str) -> list[str]:
    """Extract file/path patterns from 'do not modify / never change / do not touch' lines."""
    patterns = []
    for line in content.splitlines():
        low = line.lower()
        if any(kw in low for kw in ("do not modify", "never modify", "do not touch",
                                     "never change", "do not change")):
            # Try to extract a path-like token from the line
            tokens = re.findall(r'[`"\']([^`"\']+)[`"\']', line)
            tokens += re.findall(r'(\w[\w/._-]{2,}\.(?:py|toml|cfg|ini|yaml|yml|json|md))',
                                 line)
            patterns.extend(tokens)
    return list(dict.fromkeys(patterns))  # dedupe, preserve order


def main():
    args = parse_args()

    repo_root = os.path.abspath(args.path)
    if not os.path.isdir(repo_root):
        sys.exit(f"Error: '{args.path}' is not a directory or does not exist.")

    found_files: list[str] = []
    contents: dict[str, str] = {}

    for filename in CONTEXT_FILES_PRIORITY:
        full_path = os.path.join(repo_root, filename)
        content = read_file(full_path)
        if content is not None:
            found_files.append(filename)
            contents[filename] = content

    # ── Extract structured fields ──────────────────────────────────────────────
    toml = contents.get("pyproject.toml", "")
    agents_md = contents.get("AGENTS.md") or contents.get("CLAUDE.md") or ""
    project_md = contents.get("project.md", "")

    result = {
        "context_files_found": found_files,
        "python_version": extract_python_version(toml) if toml else None,
        "linter": extract_linter(toml) if toml else None,
        "line_length": extract_line_length(toml) if toml else 120,
        "strict_types": extract_strict_types(toml) if toml else False,
        "test_paths": extract_test_paths(toml) if toml else ["tests"],
        "no_touch_rules": extract_no_touch_rules(agents_md) if agents_md else [],
        "agent_rules_summary": agents_md[:500] if agents_md else None,
        "architecture_summary": project_md[:500] if project_md else None,
    }

    if args.json_out:
        print(json.dumps(result, indent=2))
    else:
        print(f"\nProject Context Discovery — {repo_root}\n")
        print(f"  Files found : {', '.join(found_files) or 'None (using defaults)'}")
        print(f"  Python      : {result['python_version'] or 'unknown'}")
        print(f"  Linter      : {result['linter'] or 'none detected'}")
        print(f"  Line length : {result['line_length']}")
        print(f"  Strict types: {'yes' if result['strict_types'] else 'no'}")
        print(f"  Test paths  : {', '.join(result['test_paths'])}")
        if result["no_touch_rules"]:
            print(f"  No-touch    : {', '.join(result['no_touch_rules'])}")
        if result["architecture_summary"]:
            print(f"\n  Architecture (first 200 chars):\n  {result['architecture_summary'][:200]}")
        print()


if __name__ == "__main__":
    main()
