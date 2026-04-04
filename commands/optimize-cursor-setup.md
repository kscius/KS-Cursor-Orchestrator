# Audit, optimize, and evolve the full Cursor setup toward an autonomous software department

You are `/optimize-cursor-setup`. This command runs its full pipeline through `/ks-conductor` — it inherits all phase rules, memory, parallel subagents, context hooks, and escalation behavior.

TASK:
{{args}}

MISSION

Audit the current Cursor setup (rules, user rules, skills, commands, MCPs, hooks, subagents), identify gaps against current best practices, and apply concrete improvements with the smallest coherent change that moves the setup toward the next level of autonomy and quality.

End goal: a setup that behaves like a full software department — autonomous, with specialized roles, quality pipelines, and parallel execution when safe.

---

KS-CONDUCTOR DELEGATION

This command runs through the `/ks-conductor` pipeline. Before any action:

1. Treat this invocation as a **COMPLEX** task for `/ks-conductor` (cross-cutting by nature and high impact on global setup).
2. Follow the full pipeline: INTAKE → SCOUT → PLAN → CRITIC → BUILD → VERIFY → CLOSE.
3. Enable **CONTEXT PERSISTENCE PROTOCOL** from the start (cursor10x + devcontext).
4. Apply **PARALLEL EXECUTION STRATEGY** in phases that allow it (recon, critic, implementation of disjoint categories).
5. Honor all **USER ESCALATION TRIGGERS** from ks-conductor.
6. Run `self-validate` before final closure.

---

SETUP LOCATIONS (fixed context for SCOUT)

| Component          | Path                                    |
|--------------------|-----------------------------------------|
| Rules (workspace)  | `~/.cursor/rules/*.mdc`                 |
| Skills             | `~/.cursor/skills/**/SKILL.md`          |
| Built-in skills    | `~/.cursor/skills-cursor/` (read-only — do not modify) |
| Commands           | `~/.cursor/commands/*.md`               |
| Cursor subagents   | `~/.cursor/agents/`                     |
| Claude subagents   | `~/.claude/agents/`                     |
| Hooks              | `~/.cursor/hooks.json`                  |
| MCP config         | Cursor settings (MCP servers)           |
| Global AGENTS.md   | `~/.cursor/AGENTS.md`                   |

---

PHASE 0 — INTAKE (ks-conductor-delegated)

Determine whether `{{args}}` specifies a concrete focus (e.g. “hooks only”, “subagents only”, “everything”) or a full audit. If there are no args, treat as a full audit and improvement across all categories.

Write an intake brief to `~/.cursor/plans/intake-brief-YYYY-MM-DD-cursor-setup.md` with:

- Categories in scope
- Categories excluded (if `{{args}}` says so)
- Criterion for “better”: what makes an improvement valid (see ACCEPTANCE CRITERIA below)

---

PHASE 1 — SCOUT (read-only; run `/audit-quality` first)

**Step 1 — Structured audit:** Run `/audit-quality` with no args for the full health report of skills, rules, commands, and MCPs. Use its output as SCOUT input.

**Step 2 — Setup recon:** Read in parallel (disjoint Task subagents with `model: fast`):

- Stream A: all files under `~/.cursor/rules/` + `~/.cursor/AGENTS.md`
- Stream B: all `SKILL.md` under `~/.cursor/skills/`
- Stream C: all commands under `~/.cursor/commands/`
- Stream D: `~/.cursor/hooks.json` + `~/.cursor/agents/` + `~/.claude/agents/`

**Step 3 — Best-practices research:** Use `user-duckduckgo` to search:

- `"Cursor AI rules best practices 2025"`
- `"Cursor AI hooks automation advanced"`
- `"Claude subagents orchestration patterns 2025"`
- `"Cursor CLI agent autonomous execution"`

**Step 4 — Gap analysis by category:**

| Category     | Gap criterion |
|--------------|---------------|
| Rules        | Redundant, contradictory, overly generic, wrong `alwaysApply`, missing glob scope |
| Skills       | SKILL.md > 150 lines, no clear activation section, no progressive disclosure, duplicates |
| Commands     | No MISSION, no subagent routing, no escalation triggers, no output format |
| Hooks        | Incomplete coverage (phases without hooks), vague prompts, wrong timeouts, missing matchers |
| Subagents    | Wrong `model`, missing `readonly`, vague `description`, SDLC phases without coverage |
| MCPs         | Duplicates, unclear usage, missing for uncovered use cases |
| Cursor CLI   | `agent-dispatch` flows undocumented, parallelism underused |

Write `~/.cursor/plans/scout-YYYY-MM-DD-cursor-setup.md` with:

- Classification: COMPLEX (preset by this command)
- VALIDATION MANIFEST: N/A for lint/typecheck/tests; browser_check: no; migration_check: no
- Prioritized gap report by category (HIGH / MEDIUM / LOW)
- List of proposed files to create/edit/delete

---

PHASE 2 — PLAN

Produce an EXECUTION PACK with:

- Disjoint streams by category (rules, skills, commands, hooks, subagents, MCPs)
- Implementation order that respects dependencies (rules before commands that reference them)
- Exact file list to touch
- What is not touched (`~/.cursor/skills-cursor/` never; working setup without gaps)

Each improvement in the EXECUTION PACK must include:

- What exists today
- What problem the change solves
- Exact change applied
- How to validate improvement

---

PHASE 3 — CRITIC

Run `code-reviewer` on the EXECUTION PACK.  
Run `architect-reviewer` because changes are cross-cutting on agent architecture.

The critic must verify:

- Does each proposed change have justification from repo evidence or verified best practices?
- Could any change break workflows that already work well?
- Is scope bounded (no invented unjustified architecture)?
- Do new subagents/rules/skills follow patterns of the current setup?

---

PHASE 4 — BUILD

Implement by streams in parallel when paths are disjoint (Task subagents, inherit model):

**Stream — Rules:**

- Consolidate redundant rules
- Fix `alwaysApply` and glob scopes
- Add missing rules identified in SCOUT

**Stream — Skills:**

- Refactor SKILL.md > 150 lines (move content to `references/`)
- Add clear activation section where missing
- Create new skills for identified gaps

**Stream — Commands:**

- Add missing sections (MISSION, PREFERRED SUBAGENTS, ESCALATION TRIGGERS, OUTPUT FORMAT)
- Create commands for uncovered workflows

**Stream — Hooks:**

- Enrich vague prompts in `hooks.json`
- Add entries for uncovered phases
- Adjust matchers and timeouts per evidence

**Stream — Subagents:**

- Fix `model`, `readonly`, `is_background` in frontmatter
- Improve subagent `description` with specific triggers
- Create missing subagents for SDLC roles not covered in `~/.cursor/agents/`

**Stream — Documentation:**

- Update `AGENTS.md` if global setup changed

BUILD CONSTRAINTS:

- Never touch `~/.cursor/skills-cursor/`
- Do not remove rules/skills/commands actively referenced from `ks-conductor.md`
- Do not add complexity without verified justification (YAGNI)
- Prefer edit over create; prefer consolidate over multiply

---

PHASE 5 — VERIFY

There is no lint/typecheck/tests in this domain. Verify as follows:

1. Read each modified file and confirm content matches purpose
2. Confirm no command referenced from `ks-conductor.md` was removed or renamed
3. Confirm new subagents in `~/.cursor/agents/` have valid frontmatter (`name`, `description`, `model`, `readonly`)
4. Confirm `hooks.json` is valid JSON after any edit
5. Run `self-validate` on BUILD claims

---

ACCEPTANCE CRITERIA

An improvement is valid if it satisfies at least one and violates none:

- [ ] Removes verifiable redundancy (two rules/skills saying the same thing)
- [ ] Fixes a RED/YELLOW criterion from `/audit-quality`
- [ ] Adds coverage for an SDLC phase that had no subagent or skill
- [ ] Improves a hook prompt with more specific, actionable instruction
- [ ] Creates a command for a frequent undocumented workflow
- [ ] Fixes subagent frontmatter (`model`, `readonly`) per `cursor-subagents-architecture.mdc`
- [ ] Adds best-practices research with a verified source

An improvement is **not** valid if:

- It is speculative (no gap identified in SCOUT)
- It breaks a workflow the CRITIC confirms works
- It duplicates something that already exists
- It adds bureaucracy without execution value

---

PREFERRED SKILLS

- `audit-quality` — initial SCOUT (read and run first)
- `brainstorming` — only if ambiguity remains about what to improve after SCOUT
- `create-rule` — when generating new rules
- `create-skill` — when generating new skills
- `self-validate` — mandatory at close
- `phase-handoff` — at phase transitions
- `reducing-entropy` — to consolidate duplicate rules/skills

PREFERRED SUBAGENTS

- `explore` (`model: fast`) — parallel recon of disjoint categories in SCOUT
- `architect-reviewer` — CRITIC (cross-cutting, structural)
- `code-reviewer` — CRITIC (quality and coherence of prompts/instructions)
- `research-analyst` — if deep synthesis of external best practices is needed
- `documentation-engineer` — to update AGENTS.md or other setup docs

PREFERRED MCPs

- Base: `user-cursor10x-mcp`, `user-devcontext`, `user-Sequentialthinking`
- Research: `user-duckduckgo` (best-practices research)
- Conditional: `user-context7` (when looking up Cursor/Claude API docs)

---

ESCALATION TRIGGERS (inherited from ks-conductor + specific to this command)

- MCP `user-duckduckgo` unavailable → document and continue without external research; mark as gap
- A proposed change would remove a workflow the CRITIC cannot verify → escalate to user
- `hooks.json` JSON would become invalid → stop that stream, document blocker
- Scope expands to project repositories (outside `~/.cursor/`) → reject without explicit confirmation

---

OUTPUT FORMAT

### Executive summary

- Categories audited
- Initial health (from `/audit-quality`): GREEN/YELLOW/RED per category
- Final health: GREEN/YELLOW/RED per category after changes

### Gap report (from SCOUT)

| Category | Gaps found | Priority |
|----------|------------|----------|
| Rules    | ...        | HIGH     |

### Changes applied

| File | Action | Rationale |
|------|--------|-----------|
| ...  | ...    | ...       |

### Changes rejected or out of scope

- [item] — reason

### Pending improvements (not implemented this run)

- [item] — why deferred (scope, blocker, needs user decision)

### Context persistence

- What was stored in cursor10x / devcontext
