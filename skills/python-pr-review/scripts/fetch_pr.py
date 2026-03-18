#!/usr/bin/env python3
"""
fetch_pr.py — GitHub PR data fetcher for the python-pr-review skill.

Wraps GitHub MCP tool calls by providing a structured summary of the PR,
its changed files, and existing review comments — all in a single JSON output.

This script is designed for AGENTIC use:
  - No interactive prompts
  - Structured JSON output (--json flag)
  - Helpful --help documentation
  - Non-zero exit code on errors

Usage:
  python scripts/fetch_pr.py --owner <owner> --repo <repo> --pr <number>
  python scripts/fetch_pr.py --owner akjamie --repo agent-skills --pr 7 --json

NOTE: This script does not make direct HTTP calls. It outputs a structured
prompt/instruction block that tells the agent which GitHub MCP tools to call
and in what order, then synthesizes the output into a unified JSON payload.
For direct execution with live GitHub data, set GITHUB_TOKEN in environment.
"""

import argparse
import json
import os
import sys
import urllib.request
import urllib.error

GITHUB_API = "https://api.github.com"


def parse_args():
    p = argparse.ArgumentParser(
        prog="fetch_pr.py",
        description="Fetch GitHub PR metadata, changed files, and review comments.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/fetch_pr.py --owner akjamie --repo agent-skills --pr 7
  python scripts/fetch_pr.py --owner akjamie --repo agent-skills --pr 7 --json

Output fields:
  title           PR title
  number          PR number
  body            PR description
  state           open / closed / merged
  base_branch     target branch
  head_branch     source branch
  labels          list of label names
  changed_files   list of {filename, status, additions, deletions, patch}
  comments_count  number of existing review comments

Exit codes:
  0  Success
  1  Missing required arguments or API error
""",
    )
    p.add_argument("--owner", required=True, help="GitHub repo owner (user or org)")
    p.add_argument("--repo", required=True, help="GitHub repository name")
    p.add_argument("--pr", required=True, type=int, help="Pull request number")
    p.add_argument("--json", action="store_true", dest="json_out",
                   help="Emit machine-readable JSON to stdout")
    p.add_argument("--token", default=os.environ.get("GITHUB_TOKEN"),
                   help="GitHub personal access token (defaults to $GITHUB_TOKEN)")
    return p.parse_args()


def gh_get(path: str, token: str | None) -> dict | list:
    url = f"{GITHUB_API}{path}"
    req = urllib.request.Request(url)
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("X-GitHub-Api-Version", "2022-11-28")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        sys.exit(f"GitHub API error {e.code} for {url}: {body}")
    except urllib.error.URLError as e:
        sys.exit(f"Network error fetching {url}: {e.reason}")


def main():
    args = parse_args()

    if not args.token:
        print(
            "Warning: No GitHub token provided. Requests may be rate-limited.\n"
            "Set GITHUB_TOKEN env var or use --token.",
            file=sys.stderr,
        )

    base = f"/repos/{args.owner}/{args.repo}"

    # Fetch in sequence (GitHub API doesn't support batch)
    pr = gh_get(f"{base}/pulls/{args.pr}", args.token)
    files = gh_get(f"{base}/pulls/{args.pr}/files", args.token)
    reviews = gh_get(f"{base}/pulls/{args.pr}/reviews", args.token)
    comments = gh_get(f"{base}/pulls/{args.pr}/comments", args.token)

    result = {
        "title": pr.get("title"),
        "number": pr.get("number"),
        "body": pr.get("body") or "",
        "state": pr.get("state"),
        "merged": pr.get("merged", False),
        "base_branch": pr["base"]["ref"],
        "head_branch": pr["head"]["ref"],
        "labels": [lb["name"] for lb in pr.get("labels", [])],
        "author": pr["user"]["login"],
        "html_url": pr.get("html_url"),
        "changed_files": [
            {
                "filename": f["filename"],
                "status": f["status"],
                "additions": f["additions"],
                "deletions": f["deletions"],
                "patch": f.get("patch", ""),  # may be absent for binary files
            }
            for f in files
        ],
        "reviews_count": len(reviews),
        "comments_count": len(comments),
        "existing_review_verdicts": [
            {"author": r["user"]["login"], "state": r["state"]}
            for r in reviews
            if r["state"] in ("APPROVED", "CHANGES_REQUESTED")
        ],
    }

    if args.json_out:
        print(json.dumps(result, indent=2))
    else:
        print(f"\nPR #{result['number']}: {result['title']}")
        print(f"  Author : {result['author']}")
        print(f"  State  : {result['state']}{'  [MERGED]' if result['merged'] else ''}")
        print(f"  Branch : {result['head_branch']} → {result['base_branch']}")
        print(f"  Labels : {', '.join(result['labels']) or 'none'}")
        print(f"  Files  : {len(result['changed_files'])} changed")
        print(f"  Reviews: {result['reviews_count']}  Comments: {result['comments_count']}")
        if result["existing_review_verdicts"]:
            print("  Prior verdicts:")
            for v in result["existing_review_verdicts"]:
                print(f"    {v['author']}: {v['state']}")
        print(f"\nURL: {result['html_url']}\n")


if __name__ == "__main__":
    main()
