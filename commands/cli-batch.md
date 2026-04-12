# /cli-batch — headless Cursor agent over many files (mechanical batches)

Use **Cursor CLI** (`cursor agent` / `agent`) for **non-interactive** batch passes when the in-IDE orchestrator is the wrong tool (bulk JSDoc, mechanical refactors across globs, scripted hygiene).

**Autonomous runner (Node, cross-platform):** `hooks/agent-dispatch.js` — retries, logs under `hooks/logs/agent-runs/`, optional **`--config`** for a **sequential** multi-task JSON queue (`hooks/dispatch-config.example.json`). Prefer **`/agent-dispatch`** for the full flag surface. Optional git hook: `git config core.hooksPath` → `.cursor/.githooks` (see `commands/agent-dispatch.md`).

**Prereqs:** Cursor CLI installed and on `PATH`; optional **`CURSOR_API_KEY`** (see `docs/mcp-profiles.md`).

TASK (required: glob or file list + intent):
{{args}}

---

## MISSION

1. Confirm **`cursor agent -p`** (or `agent -p`) is available: `cursor agent --help` or `agent --help`.
2. Resolve the **file set** from TASK (glob or explicit paths) relative to **workspace root**.
3. Build a **single prompt** that applies the same transformation to each file (or one prompt that lists files and rules).
4. Run via **`node …/hooks/agent-dispatch.js`** (see **Build invocation** below)—do not hand off copy-paste steps when **Shell** is available.
5. Capture exit code and log paths; summarize in chat.

---

## RELATED COMMANDS

- **`commands/ks-conductor.md`** — **Cursor CLI (condicional)**, **Headless routing outside chat** (`/cli-batch` vs `/agent-dispatch --config` vs `/parallel`), **PARALLEL EXECUTION STRATEGY**.
- **`/agent-dispatch`** — full runner flags, `--config` sequential queue, sandbox/cloud.
- **`/parallel`** — git worktrees + headless agents when you need **real** multi-process isolation (best-of-N).

---

## PREFERRED SKILLS

- `self-validate` — before claiming batch success; quote exit code and logs
- `repo-discovery` — optional when the repo layout is unknown

---

## PREFERRED SUBAGENTS

- None required for a pure CLI batch. Optional: `explore` if TASK needs help scoping disjoint globs before parallel CLI fan-out.

---

## ESCALATION TRIGGERS

- **Blocked:** `agent` / `cursor agent` not on PATH — state **Blocked: Cursor CLI not installed** with evidence from Shell.
- **Stop and sequentialize:** User asked for parallel CLI runs but globs/`--cwd` **overlap** on mutating work — refuse parallel mutators; use disjoint paths, `plan`/`ask` first, or one run.
- **Wrong tool:** Multi-phase SDLC, auth/payments/schema — use **`/ks-conductor`** in-IDE, not bulk CLI alone.

---

## OUTPUT FORMAT

Reply with:

1. **Command(s) run** (verbatim `node …/agent-dispatch.js` line(s) or `--config` path).
2. **Exit code(s)** and **short stderr** if non-zero.
3. **Log paths** under `hooks/logs/agent-runs/` when the runner prints them.
4. **NOT VERIFIED** for anything not observed (e.g. tests not run).

---

## Build invocation

Prefer the **Node runner**:

```bash
node "%USERPROFILE%\.cursor\hooks\agent-dispatch.js" --prompt "YOUR_TASK" --files "src/**/*.ts" --model gemini-3-flash --force
```

Or a **sequential** multi-task queue (not parallel tasks within the JSON):

```bash
node "%USERPROFILE%\.cursor\hooks\agent-dispatch.js" --config "%USERPROFILE%\.cursor\hooks\dispatch-config.example.json" --cwd .
```

(Unix: replace paths with `"$HOME/.cursor/hooks/…"`.)

**Alternative:** raw PowerShell building a file list + `cursor agent -p` — only if the runner is unsuitable; see `commands/agent-dispatch.md`.

---

## OPERATING RULES

- Never pass secrets in prompts; never commit API keys.
- Prefer **`--output-format json`** only when the user needs machine-parseable output.
- **Do not** use CLI alone for multi-phase SDLC, security-sensitive work, or flows that need hooks/MCPs/session memory — use **`/ks-conductor`** in-IDE instead.

## Quality bar

- TASK must define **scope** and **done-when**; no open-ended “improve everything.”
