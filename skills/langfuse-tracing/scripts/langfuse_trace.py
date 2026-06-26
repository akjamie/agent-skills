#!/usr/bin/env python3
"""
langfuse_trace.py — Log trace payloads to Langfuse.

Reads trace and span details from a JSON file or inline payload,
discovers Langfuse credentials from environment or local .env file,
and registers traces, spans, and generations in Langfuse.

Usage:
  python scripts/langfuse_trace.py --payload-file trace.json
  python scripts/langfuse_trace.py --json-payload '{"trace": {...}, "spans": [...]}'
"""

import argparse
import base64
import json
import os
import re
import sys
from langfuse import Langfuse, propagate_attributes


def parse_args():
    p = argparse.ArgumentParser(
        prog="langfuse_trace.py",
        description="Log trace and span data to a Langfuse instance.",
    )
    group = p.add_mutually_exclusive_group(required=True)
    group.add_argument(
        "--payload-file", help="Path to JSON file containing trace and spans data"
    )
    group.add_argument(
        "--json-payload", help="JSON string containing trace and spans data"
    )
    p.add_argument(
        "--env-file", default=".env", help="Path to .env file for auto-discovery"
    )
    return p.parse_args()


def parse_env_file(filepath: str) -> dict:
    env_vars = {}
    if not os.path.exists(filepath):
        return env_vars
    
    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, val = line.split("=", 1)
                key = key.strip()
                val = val.strip().strip("'\"")
                env_vars[key] = val
    return env_vars


def discover_credentials(env_file_path: str) -> tuple[str | None, str | None, str | None]:
    # 1. Check environment variables directly
    host = os.environ.get("LANGFUSE_HOST") or os.environ.get("LANGFUSE_BASE_URL")
    pub_key = os.environ.get("LANGFUSE_PUBLIC_KEY")
    sec_key = os.environ.get("LANGFUSE_SECRET_KEY")

    # 2. Try parsing .env in current directory or parent directory
    if not (pub_key and sec_key and host):
        candidates = [env_file_path, os.path.join("..", env_file_path), os.path.join("../..", env_file_path)]
        for cand in candidates:
            if os.path.exists(cand):
                vars_dict = parse_env_file(cand)
                
                # Check for direct Langfuse configs in .env
                if not pub_key:
                    pub_key = vars_dict.get("LANGFUSE_PUBLIC_KEY")
                if not sec_key:
                    sec_key = vars_dict.get("LANGFUSE_SECRET_KEY")
                if not host:
                    host = vars_dict.get("LANGFUSE_HOST") or vars_dict.get("LANGFUSE_BASE_URL")
                
                # Check for OTel exporter mappings in .env
                if not (pub_key and sec_key):
                    otel_headers = vars_dict.get("OTEL_EXPORTER_OTLP_HEADERS", "")
                    m = re.search(r"Basic\s+([A-Za-z0-9+/=]+)", otel_headers)
                    if m:
                        try:
                            decoded = base64.b64decode(m.group(1)).decode("utf-8")
                            if ":" in decoded:
                                pub_key, sec_key = decoded.split(":", 1)
                        except Exception as e:
                            print(f"Warning: Failed to decode basic auth header: {e}", file=sys.stderr)
                
                if not host:
                    otel_endpoint = vars_dict.get("OTEL_EXPORTER_OTLP_ENDPOINT", "")
                    if otel_endpoint:
                        if "/api/public" in otel_endpoint:
                            host = otel_endpoint.split("/api/public")[0]
                        else:
                            host = otel_endpoint
                
                if pub_key and sec_key and host:
                    break

    return pub_key, sec_key, host


def main():
    args = parse_args()

    # Load payload
    try:
        if args.payload_file:
            with open(args.payload_file, "r", encoding="utf-8") as f:
                data = json.load(f)
        else:
            data = json.loads(args.json_payload)
    except Exception as e:
        sys.exit(f"Error loading payload: {e}")

    # Discover credentials
    pub_key, sec_key, host = discover_credentials(args.env_file)
    
    if not (pub_key and sec_key):
        sys.exit("Error: Langfuse Public/Secret key could not be resolved from environment or .env file.")
    if not host:
        host = "https://cloud.langfuse.com"
        print(f"No host configured, falling back to default: {host}", file=sys.stderr)

    # Initialize Langfuse client
    print(f"Initializing Langfuse client (host: {host}, public_key: {pub_key[:10]}...)")
    langfuse = Langfuse(
        public_key=pub_key,
        secret_key=sec_key,
        host=host
    )

    # Parse trace details
    trace_data = data.get("trace", {})
    trace_name = trace_data.get("name", "agent-trace")
    session_id = trace_data.get("session_id")
    user_id = trace_data.get("user_id")
    trace_input = trace_data.get("input")
    trace_output = trace_data.get("output")

    # Create trace using start_as_current_observation
    print(f"Creating root trace '{trace_name}'...")
    with langfuse.start_as_current_observation(
        name=trace_name,
        as_type="span",
        input=trace_input,
        output=trace_output
    ):
        # Set trace-level attributes that propagate to child spans
        with propagate_attributes(
            user_id=user_id,
            session_id=session_id,
            trace_name=trace_name
        ):
            spans = data.get("spans", [])
            print(f"Ingesting {len(spans)} spans/generations...")
            for s in spans:
                name = s.get("name", "span")
                span_input = s.get("input")
                span_output = s.get("output")
                metadata = s.get("metadata", {})

                # If it specifies LLM params, treat as generation
                if "model" in s or "input_tokens" in s or "output_tokens" in s:
                    model = s.get("model", "unknown-model")
                    usage = {}
                    if "input_tokens" in s:
                        usage["input_tokens"] = int(s["input_tokens"])
                    if "output_tokens" in s:
                        usage["output_tokens"] = int(s["output_tokens"])
                    
                    obs = langfuse.start_observation(
                        name=name,
                        as_type="generation",
                        input=span_input,
                        output=span_output,
                        model=model,
                        usage_details=usage if usage else None,
                        metadata=metadata
                    )
                    obs.end()
                else:
                    obs = langfuse.start_observation(
                        name=name,
                        as_type="span",
                        input=span_input,
                        output=span_output,
                        metadata=metadata
                    )
                    obs.end()

    # Flush events to Langfuse
    print("Flushing events to Langfuse...")
    langfuse.flush()
    print("Done! Telemetry registered successfully.")


if __name__ == "__main__":
    main()
