# Agent Skills Library

A curated repository of modular, professional-grade capabilities for AI Agents. 

This repository follows the standardized agent skill format originally popularized by Anthropic, designed to augment Large Language Models (LLMs) with determinable, task-specific abilities while minimizing prompt bloat.

## What is an Agent Skill?

An agent skill acts as a plug-in for your AI. Instead of giving an agent a massive, singular system prompt that tries to explain how to do everything, you give the agent access to a "Skill Registry." 

When the agent decides it needs to perform a complex task (e.g., generating a professional PowerPoint presentation), it dynamically loads the relevant skill's `SKILL.md` file to learn exactly how to execute the task using the provided code and assets.

### Anatomy of a Skill
- **`SKILL.md`**: The instruction manual for the agent. Contains usage rules, edge cases, and best practices.
- **`scripts/`**: Executable code (Node.js, Bash, Python) that handles deterministic logic. 
- **`references/`** & **`assets/`**: Vendored documentation or design templates so the agent doesn't hallucinate configurations.

## Available Skills

### `pptx-creator`
A comprehensive skill for creating modern, professionally designed PowerPoint presentations using `PptxGenJS`.
- **Features**: 11 distinct corporate themes (including HSBC Red), grid layouts, Mermaid chart integrations, avoiding common file corruption pitfalls.
- **Usage Strategy**: Leverages Progressive Disclosure; the agent only requests the `pptx-creator/SKILL.md` when a user explicitly asks for presentation generation.

## Best Practices
1. **Atomics**: Keep skills focused on single domains (e.g., one for PPT generation, one for SQL querying).
2. **Code Over Prompts**: Use scripts to handle heavy lifting (like binary file generation). Use the LLM strictly for reasoning about the inputs.
3. **Vendored Knowledge**: Do not rely on the LLM's training data for tool APIs. Supply a clean reference file within the skill directory.

---
*Built for the Antigravity Agent ecosystem and compatible with standard LangChain/smolagents frameworks.*
