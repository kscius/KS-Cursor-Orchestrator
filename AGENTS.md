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

**Slash commands map:** The canonical graph of how `/intake`, `/scout`, `/plan`, `/build-full`, `/verify`, `/fix-loop`, `/audit-quality`, and related commands chain together lives in **`~/.cursor/commands/ks-conductor.md`** → section **RELATED COMMANDS — department graph**. Prefer that section over duplicating flows in other files.

**Command autonomy (skills vs subagents):** **Skills** are applied by reading `~/.cursor/skills/**/SKILL.md` and executing the workflow in the current session. **Subagents** are invoked with the **Task** tool (`subagent_type`), not by naming them only in prose. **Parallel work** uses multiple Task calls in one turn, disjoint Shell, or disjoint CLI passes per **`ks-conductor.md`** → **PARALLEL EXECUTION STRATEGY** — slash commands are not nested OS subprocesses.

**Headless CLI (outside chat):** For `agent -p` batches, follow **`ks-conductor.md`** → **Cursor CLI (condicional)** and **Headless routing outside chat**. **`/cli-batch`** = typical single-pass glob work; **`/agent-dispatch --config`** = **sequential** multi-task queue; **`/parallel`** + worktrees = isolation for real multi-process parallelism. Do not equate `--config` with parallel task execution.

**MemPalace MCP** runs from `~/.cursor/venvs/mempalace` (Python 3.12, `mempalace` 3.1.0); see `~/.cursor/rules/mempalace-mcp.mdc` and `~/.cursor/requirements-mempalace-mcp.txt`.
