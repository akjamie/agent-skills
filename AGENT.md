# Agent instructions for using this repository

Welcome to the Agent Skills library. This file (`AGENT.md`) dictates how you, the AI Agent, should interact with the skills contained within this repository.

## 1. Skill Discovery
When a user gives you a task, you should first assess if there is an existing skill in this repository that can handle it.
- **Do not** immediately attempt to write bespoke scripts from scratch if a skill exists.
- Review the directories under `skills/` to find relevant capabilities.

## 2. Progressive Loading
To save tokens and keep your context window clean:
1. **Do not** attempt to read every `SKILL.md` in the repository simultaneously.
2. Only `view_file` the specific `skills/<skill-name>/SKILL.md` when the user's task directly matches that skill's purpose.

## 3. Skill Execution
When utilizing a skill:
1. **Read the instructions**: Carefully read the `SKILL.md` from top to bottom. It will contain critical caveats, common pitfalls, and API usage rules that bypass your generic training data.
2. **Respect the vendors**: If the skill provides a `references/` directory (e.g., for an API like PptxGenJS), use it. Do not guess API signatures.
3. **Local first**: Never make unnecessary external HTTP calls (like `mermaid.ink`) if the skill provides local equivalents (like `npx mermaid-cli`).

## 4. Modifying Skills
If a user asks you to update or add a new theme to a skill:
- Keep the skill self-contained within its folder.
- Never add `package.json` configurations or track local `node_modules` in the Git history; dependencies should be installed globally or via `--no-save` unless explicitly forming a standalone package.
- Always run the skill's evaluation harness (e.g., `tests/eval_themes.js`) to ensure you haven't broken the existing functionality.

## 5. QA is Mandatory
Skills are defined by their reliability. Always execute the QA steps outlined in the respective `SKILL.md`. **Assume your first generation has flaws** and actively seek to verify the output before declaring the task complete to the user.
