---
name: langfuse-tracing
description: >
  Use this skill to log agent execution traces, spans, and LLM generations directly
  to a Langfuse instance. Useful for telemetry, monitoring, debugging prompts,
  and tracking tokens/costs of multi-step agent actions.
license: MIT
compatibility: >
  Requires Python >= 3.10 and the 'langfuse' Python SDK.
  Can automatically extract authentication details from local .env files.
metadata:
  version: "1.0"
  author: akjamie
allowed-tools: Read Bash(python:*)
---

# Langfuse Tracing Skill

Use this skill to log your execution traces, spans, and LLM generations to a Langfuse observability backend.

## Quick Reference

| Task | How |
|------|-----|
| Log Traces & Spans | `python scripts/langfuse_trace.py --payload-file <path_to_json_file>` |
| Inline Payload | `python scripts/langfuse_trace.py --json-payload '<json_string>'` |
| Credential Auto-discovery | Automatically parses `.env` looking for `OTEL_EXPORTER_OTLP_HEADERS` or `LANGFUSE_*` variables |

---

## When to Use This Skill

Use this skill whenever you complete a multi-step workflow (e.g., Code Review, Document Generation, complex task execution) where observability or audit logs are desired in the self-hosted Langfuse dashboard.

---

## Workflow

1. **Collect Spans**: As you execute your tasks, keep track of each significant step:
   - Name of the step (e.g., `security-analysis`, `synthesis`)
   - Inputs sent to the step (e.g., prompt, code diff)
   - Outputs received (e.g., JSON response, markdown text)
   - Start and end timestamps (or mock timestamps matching the current time)
   - (Optional) Token counts (`input_tokens`, `output_tokens`)
   - (Optional) Model name used (e.g., `deepseek-chat`)

2. **Construct JSON Payload**: Format the gathered details into a single structured JSON object matching this format:

   ```json
   {
     "trace": {
       "name": "review-pipeline",
       "session_id": "owner/repo#pr-number",
       "user_id": "author-username",
       "input": "Summary of inputs for the entire operation",
       "output": "Summary of the final result"
     },
     "spans": [
       {
         "name": "step-1-name",
         "input": "input for step 1",
         "output": "output for step 1",
         "start_time": "ISO-8601-timestamp",
         "end_time": "ISO-8601-timestamp"
       },
       {
         "name": "step-2-name",
         "input": "input for step 2",
         "output": "output for step 2",
         "model": "deepseek-chat",
         "input_tokens": 1024,
         "output_tokens": 512,
         "start_time": "ISO-8601-timestamp",
         "end_time": "ISO-8601-timestamp"
       }
     ]
   }
   ```

3. **Execute Tracing Script**:
   Write the JSON to a temporary file (e.g. `trace.json` under your scratch or temporary directory) and execute the CLI script:
   ```bash
   python scripts/langfuse_trace.py --payload-file trace.json
   ```

4. **Clean Up**: Delete the temporary JSON file after the script executes successfully.

---

## Environment Configuration

The script attempts to read the following environment variables:
- `LANGFUSE_PUBLIC_KEY`
- `LANGFUSE_SECRET_KEY`
- `LANGFUSE_HOST` (or `LANGFUSE_BASE_URL`)

### Auto-Discovery Fallback
If these variables are not set in the environment, the script searches the current directory and parent directories for a `.env` file and:
1. Decodes `OTEL_EXPORTER_OTLP_HEADERS` (extracting the basic auth token containing the public and secret keys).
2. Sets the host using `OTEL_EXPORTER_OTLP_ENDPOINT`.
