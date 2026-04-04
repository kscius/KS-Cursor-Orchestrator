# /cli-health-check — Verify Cursor CLI is installed and the dispatch runner is ready

Run this before any `/agent-dispatch`, `/cli-batch`, or `/cloud-handoff` work to confirm
the Cursor CLI toolchain is functional. Reports what works, what is missing, and the exact
fix for each gap.

TASK (optional — context or repo to check against):
{{args}}

## MISSION

Check that the full Cursor CLI dispatch stack is operational:
1. `agent` or `cursor agent` binary is on PATH and responds
2. `agent-dispatch.js` runner exists at the expected location
3. Log directory is writable
4. (Optional) A smoke invocation confirms the binary produces output

---

## STEP 1 — CHECK BINARY

Run the most reliable probe for each platform:

```bash
# Unix / macOS / WSL
agent --version 2>&1 || cursor agent --version 2>&1 || echo "BLOCKED: neither agent nor cursor agent found on PATH"

# Windows (cmd)
agent --version 2>&1 || (cursor agent --version 2>&1 || echo BLOCKED: neither agent nor cursor agent found on PATH)
```

**Expected:** A version string such as `0.xx.y` or `cursor 0.xx.y`.
**If blocked:** Install or reinstall Cursor. Confirm `cursor` is on PATH with `where cursor` (Windows) or `which cursor` (Unix). The `agent` alias is created automatically on Cursor install.

---

## STEP 2 — CHECK RUNNER

Verify the Node runner exists at the canonical path:

```bash
# Unix / macOS
ls -la "$HOME/.cursor/hooks/agent-dispatch.js"

# Windows (cmd)
dir "%USERPROFILE%\.cursor\hooks\agent-dispatch.js"

# Windows (PowerShell)
Test-Path "$env:USERPROFILE\.cursor\hooks\agent-dispatch.js"
```

Then confirm it reports help correctly:

```bash
node "%USERPROFILE%\.cursor\hooks\agent-dispatch.js" --help
# Unix:
node "$HOME/.cursor/hooks/agent-dispatch.js" --help
```

**Expected:** The `Usage:` block listing all flags.
**If missing:** The runner must be present at this path. Check that `~/.cursor/hooks/` was not accidentally deleted.

---

## STEP 3 — CHECK LOG DIRECTORY

Verify the log sink is writable (the runner creates it automatically, but permission issues surface here):

```bash
# Unix
ls -la "$HOME/.cursor/hooks/logs/agent-runs/" 2>/dev/null || echo "Will be created on first run"

# Windows
dir "%USERPROFILE%\.cursor\hooks\logs\agent-runs\" 2>nul || echo Will be created on first run
```

---

## STEP 4 — SMOKE TEST (optional, read-only)

Run a no-op ask-mode invocation to confirm end-to-end connectivity:

```bash
node "%USERPROFILE%\.cursor\hooks\agent-dispatch.js" \
  --prompt "Reply with the single word: OK" \
  --mode ask \
  --cwd "%USERPROFILE%"
```

**Expected exit code:** `0`
**Expected stdout:** A short response containing "OK".
**If blocked:** Report the exit code and stderr. Common causes: `agent` not on PATH, expired Cursor session, or no active subscription.

---

## AGENT INSTRUCTIONS

1. Run Steps 1–3 via **Shell** tool (do not ask the user to run these).
2. For Step 4, run only if Steps 1–3 pass and the user has not explicitly skipped smoke tests.
3. Report a clear status table:

```
CLI Health Check
================
Binary (agent / cursor agent):  [OK: <path> v<version>] | [BLOCKED: <reason>]
Runner (agent-dispatch.js):     [OK: <path>] | [BLOCKED: <path not found>]
Log dir writable:               [OK] | [BLOCKED: <permission error>]
Smoke invocation (ask mode):    [OK: exit 0] | [SKIPPED] | [BLOCKED: exit <code>]

Overall: READY | NOT READY — fix items marked BLOCKED before proceeding.
```

4. For each BLOCKED item, provide the exact fix command.

---

## OPERATING RULES

- Do not attempt to install Cursor CLI or modify PATH — only report gaps.
- Do not run with `--force` or any write flags in a health check.
- If `agent` binary is present but STEP 4 returns non-zero, check for expired auth: `cursor login --status`.
