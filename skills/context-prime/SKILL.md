# Context Prime Skill

Use this skill at the start of a session on a known project to quickly load structured context. Invoke when starting work, resuming after a gap, or when you need a fast orientation of the project state.

## Trigger phrases

- "prime context"
- "load project context"
- "/context-prime"
- "orient me on this project"
- "what's the current state of the project"
- "context load"

## Skill instructions

When this skill is invoked, execute the following steps to build and emit a structured context summary:

### Step 1: Read project identity

Read these files if they exist (in order):
1. `README.md` — project overview, tech stack, quick start
2. `package.json` / `pyproject.toml` / `Cargo.toml` / `go.mod` — name, version, dependencies
3. `.cursor/plans/workflow_state.md` — current workflow phase and active tasks
4. `AGENTS.md` — agent conventions for this project

Extract:
- Project name and purpose
- Primary language(s) and frameworks
- Key scripts/commands (`dev`, `test`, `build`, `lint`)
- Current workflow state (if available)

### Step 2: Read recent decisions and docs

Scan these paths for relevant context:
1. `docs/` — architecture, decisions, API contracts (read top-level index or most recent files)
2. `.cursor/plans/` — any `.plan.md` or `.md` files (read titles and summaries)
3. `CHANGELOG.md` or `HISTORY.md` — last 10 entries for recent changes

### Step 3: Identify recently modified files

Run to find files modified in the last 7 days:
```bash
git log --since="7 days ago" --name-only --format="" | sort -u | head -20
```

Or use Glob to find recent files and read key ones for context.

### Step 4: Check current git state

```bash
git status --short
git log --oneline -10
git branch --show-current
```

Extract:
- Current branch
- Recent commits (last 10)
- Uncommitted changes

### Step 5: Query memory systems (if available)

If `cursor10x-mcp` or `devcontext` MCP is available, query for:
- Previous session context for this project
- Stored decisions and findings
- Active tasks or blockers

### Step 6: Emit structured context summary

Output in this format:

```
## Project Context: <PROJECT_NAME>

**Purpose:** <one-line description>
**Stack:** <languages, frameworks, databases>
**Key commands:**
- Dev: `<command>`
- Test: `<command>`
- Build: `<command>`
- Lint: `<command>`

---

**Current branch:** <branch>
**Workflow phase:** <phase from workflow_state.md or "unknown">
**Active tasks:**
- <task 1>
- <task 2>

---

**Recent changes (last 7 days):**
- <file 1>: <what changed>
- <file 2>: <what changed>

**Uncommitted changes:**
- <file>: <M/A/D status>

---

**Architecture highlights:**
<2-3 sentences from docs/ or README>

**Open decisions / known issues:**
<from plans/ or recent commits>

---

**Suggested focus areas for this session:**
1. <area 1>
2. <area 2>
```

### Notes

- This skill is inspired by the elizaOS `/context-prime` command pattern, adapted for Cursor skills format.
- If memory MCP tools are available, prefer querying them for richer cross-session context.
- Keep the output concise — aim for one screen of context, not an encyclopedia.
- For monorepos, scope to the relevant package/app directory when possible.
