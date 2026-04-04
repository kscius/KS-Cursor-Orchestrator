# Cursor Commands — `~/.cursor/commands/`

Slash commands (Markdown files) exposed in Cursor chat. Each file defines one invocable command such as `/file-name`.

## What this bundle includes

End-to-end orchestration (`ks-conductor.md`), discovery (`scout.md`), implementation (`build-full.md`), fix loops (`fix-loop.md`), review, security, CLI helpers (`agent-dispatch.md`, `cli-batch.md`), and quality utilities.

## Installation

Copy all `.md` files from this folder to `~/.cursor/commands/` (or run the install protocol in **`docs/guide/installation.md`** via Cursor Chat — see **`README.md`** → Installation).

## Conventions

- Commands usually delegate to `/ks-conductor` or reference skills and subagents from `rules/` and `agents/`.
- After adding or changing commands, restart Cursor or reload the window so it picks them up.

## References

- `../docs/guide/installation.md` — executor protocol for full profile install (trigger from `README.md`).
- `../LLM_Installer.md` — pointer to the install guide (compatibility).
- `../rules/orchestration-protocol.mdc` — gates and MCP lifecycle.
- `optimize-cursor-setup.md` — audit and evolve the global Cursor setup.
