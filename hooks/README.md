# Cursor Hooks — `~/.cursor/hooks.json` + `~/.cursor/hooks/`

Automation for the agent lifecycle (session start, before/after prompt, shell, subagents, etc.).

## Expected layout on the user machine

| Path | Contents |
|------|----------|
| `~/.cursor/hooks.json` | JSON hook configuration (events → commands or prompts). |
| `~/.cursor/hooks/*.js` | Scripts invoked with `node` from `hooks.json`. |
| `~/.cursor/hooks/lib/` | Shared utilities (e.g. `detect-verify-command.js`). |

Commands in `hooks.json` use relative paths such as `node ./hooks/session-context.js`; the working directory should be **`~/.cursor`** (where `hooks.json` and the `hooks/` folder live).

## Requirements

- **Node.js** available on the `PATH` of the process that runs Cursor.

## Installation

The Cursor assistant copies hooks per **`docs/guide/installation.md`** (see **`README.md`** → Installation).

## Local logs

The `hooks/logs/` folder may be created at runtime (audit, metrics). It does **not** need to be versioned in the orchestrator repo; add it to `.gitignore` if it appears during development.

## References

- `../commands/ks-conductor.md` — pipeline these hooks reinforce.
- `../rules/operating-model.mdc` — artifact paths under `.cursor/plans/`.
