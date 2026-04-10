# Agent instructions (global)

Tool-agnostic defaults for any coding agent (Cursor, Codex CLI, Gemini CLI, etc.) working on repositories you touch. **Cursor-specific** depth lives in `~/.cursor/rules/*.mdc`.

## Engineering

- Prefer composition over inheritance; early returns; named constants; focused functions; explain **why** in comments, not what.
- Smallest coherent diff; do not invent scope, scripts, or architecture not justified by the task or repo evidence.
- Verify commands and scripts from the repository (package.json, Makefile, CI, README)—never assume.

## Security

- No secrets in code or logs; parameterized SQL; validate untrusted inputs at boundaries; least privilege.

## Documentation

- Project docs under `/docs/` when the repo uses that convention; update docs when behavior, contracts, or ops change materially.

## Quality

- Run proportional validation before claiming done; state what was not run and why.
- Preserve accessibility and non-happy-path UI states when changing user-facing code.

## Cursor department runtime

When using Cursor with this profile: follow `/ks-conductor` phase gates, **orchestration-protocol** (Sequential Thinking triggers, MCP lifecycle), and **operating-model** artifact paths under `.cursor/plans/`.
