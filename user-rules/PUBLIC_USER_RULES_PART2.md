# Public User Rules — part 2

Continuation of [`PUBLIC_USER_RULES.md`](./PUBLIC_USER_RULES.md).

---

## Rule: Session lifecycle (`**/*`, alwaysApply: true)

### Session start

When starting a new conversation on a known project:

1. Use session-context hook output to understand current repo state
2. Query memory for previous decisions and findings if the project has history
3. Detect stack, validation commands, and conventions from the repo

### During execution

- Create logical checkpoints for multi-step tasks
- Track artifacts produced (files created, modified, deleted)
- Use memory to store decisions that should persist across sessions

### Session end

- Store significant findings and decisions in memory
- State what was completed, what remains, and what risks exist
- Do not leave tasks in ambiguous states

---

## Rule: Agent autonomy and self-validation (`**/*`, alwaysApply: true)

### Execution preference

- Execute tasks end-to-end when context is sufficient
- Do not stop for unnecessary handoffs or confirmations
- Do not switch into tutorial mode when implementation is possible
- Use tools to verify facts instead of asking the user
- Prefer execution over recommendations when the task is implementable

### Self-validation before completion

- Before declaring any task complete, run the `self-validate` skill checklist
- Do not claim "tests pass" without showing test output
- Do not reference commands not verified from the repo
- Do not reference file paths not confirmed by inspection
- Explicitly state what was **NOT** validated and why

### Memory and context continuity

- At session start, query `user-cursor10x-mcp` for previous context when working on known projects
- Store significant decisions, patterns, and findings in memory after complex tasks
- Use `user-devcontext` to initialize conversation context for multi-step work
- At session end or task completion, store milestones and decisions for future reference

### MCP usage discipline

- Always check MCP tool schemas before calling
- Prefer `user-cursor10x-mcp` and `user-devcontext` for session continuity
- Use `user-Sequentialthinking` for ambiguous classifications or complex reasoning
- Use `user-context7` for up-to-date library documentation
- Use `user-semgrep` when touching security-sensitive surfaces
- Do not activate MCPs unless they add clear execution value

---

## Rule: Gemini integration overlay

Apply only when the touched area includes Gemini integrations, prompts, provider configuration, or Gemini-specific workflows.

- Respect provider-specific SDK, configuration, and output handling patterns already used by the repo
- Do not assume OpenAI conventions map directly to Gemini integrations
- Make output expectations explicit when downstream code depends on structure
- Treat provider swaps, model changes, and output-format changes as behavior changes; validate prompt, parser, and integration together when output is consumed programmatically

---

## Rule: OpenAI Agents overlay

Apply only when the touched area includes agent orchestration, tool definitions, assistant instructions, or OpenAI-specific agent behavior.

- Keep system, developer, tool, and task-level instructions conceptually separated
- Define tools narrowly and clearly; avoid overlapping tools when one abstraction suffices
- Keep agent context relevant and bounded; avoid redundant policy in prompts
- Treat instruction changes, tool routing changes, and output schema changes as behavior changes requiring targeted validation; prefer structured outputs when downstream systems depend on them

---

## Rule: LLM prompt engineering overlay

Apply when touching prompts, templates, instruction sets, or LLM-facing text artifacts.

- Treat prompts as versioned behavioral artifacts, not ad hoc text blobs
- Make task, constraints, format, and success criteria explicit; prefer clarity over cleverness
- Separate role framing, task instructions, constraints, output format, and examples (only when justified)
- Specify output shape explicitly when downstream depends on it; prefer deterministic formatting when parsing or evaluation matters
- Do not change prompts blindly; treat edits as behavior changes; avoid prompt bloat unless it materially improves reliability

---

## Rule: Ruby / Rails / Chatwoot overlay (`**/*.rb`, Gemfile, routes, migrations)

Apply only to Ruby/Rails code, especially Chatwoot-style structure.

- Follow established Rails and project-specific patterns before introducing new ones
- Prefer logic in the layer the repo already uses (model, service, concern, job, controller, presenter)
- Keep validations, callbacks, scopes, and associations intentional; avoid callback-heavy hidden behavior when service orchestration is clearer
- Be explicit about transactional boundaries on write paths
- Respect existing module boundaries and workflow patterns for inbox, conversation, message, automation, and events unless strong repo evidence supports change

---

## Rule: API contracts overlay (`**/*.{ts,js,py,php,rb}`)

Apply when affecting API routes, handlers, controllers, schemas, or external contracts.

- Validate request and response boundaries explicitly
- Prefer consistent response shapes for similar endpoints
- Preserve backward compatibility unless a breaking change is intentional
- Make schema or contract changes explicit; consider migration or rollout implications

---

## Rule: Node.js backend overlay (`**/*.{ts,js,mjs,cjs}`)

Apply only when the area contains backend/service/controller/handler/API logic in Node.js.

- Keep transport glue separate from business logic
- Keep auth, validation, and transport concerns separated from core domain logic
- Prefer modular services/handlers/repositories/controllers per repo conventions
- Validate request boundaries explicitly; preserve async and domain boundaries; avoid hidden cross-module side effects unless intentional

---

## Rule: Next.js overlay (App Router, pages, middleware, next.config)

Apply only when the area uses Next.js.

- Prefer Server Components by default in App Router projects
- Mark client components explicitly only when required
- Minimize client-side state when server rendering or derived state suffices
- Keep server-only logic and secrets out of client components
- Respect route, layout, loading/error boundary conventions; prefer established data-fetching patterns; design loading, error, and empty states intentionally

---

## Rule: React overlay (`**/*.{tsx,jsx}`, components)

Apply only when using React component patterns.

- Prefer small focused components; descriptive names; `handle*` for event handlers
- Extract hooks or subcomponents when complexity grows
- Avoid unnecessary `useEffect`; prefer derived state over duplicated state; avoid prop drilling when an existing project pattern solves it cleanly
- Design loading, error, empty, and disabled states; preserve accessibility (semantic structure, labels, keyboard, focus)

---

## Rule: TypeScript contracts overlay (`**/*.{ts,tsx,mts,cts}`)

Apply only to TypeScript code.

- Avoid `any` unless there is a compelling boundary reason
- Prefer `unknown` for untrusted values
- Use explicit types for public interfaces and shared contracts

---

## Rule: Flutter / Dart overlay (`**/*.dart`)

Apply only to Dart/Flutter code.

- PascalCase classes, camelCase members, snake_case file names
- Preserve existing architecture, routing, DI, and state-management patterns
- Favor shallow trees and reusable components; platform-consistent UX; efficient state management; avoid fighting the platform unless intentional

---

## Rule: Python / Jupyter overlay (`**/*.py`, `**/*.ipynb`)

Apply only to Python modules and notebooks.

- Follow PEP 8; prefer vectorized pandas/numpy when appropriate; validate data early
- Keep notebooks reproducible and readable; docstrings where useful; try/except around I/O and fragile operations

---

## Rule: PHP overlay (`**/*.php`)

Apply only to PHP code.

- `declare(strict_types=1);` where appropriate; typed signatures and properties when available; PSR-12; one primary class per file; Composer autoloading
- Avoid `@` suppression; prefer exceptions over silent failure

---

## Rule: Database / SQL overlay (sql, migrations, db, prisma)

Apply when touching schema, migrations, queries, or database access.

- Parameterized queries; transactional correctness; migrations for schema changes; no ad hoc production mutation
- Explicit constraints and indexes when justified; prevent N+1 when relevant; prefer pagination over unbounded reads; design indexes from access patterns

---

## Rule: Backend service boundaries overlay (`**/*.{ts,js,mjs,cjs,py,php}`)

Apply when touching backend/service/controller/handler/API logic.

- Same themes as Node overlay: validate boundaries, separate transport from domain, consistent response shapes, modular structure per repo conventions

---

## Rule: Frontend React / Next overlay (`**/*.{tsx,jsx}`, app/pages/components)

Apply when the area actually uses React, Next.js, or frontend components.

- Small components, `handle*` names, extract hooks/subcomponents when needed
- Avoid unnecessary `useEffect`; minimize client state; intentional loading/error/empty states
- Prefer Server Components by default in modern Next.js App Router; Tailwind when the project uses it; preserve accessibility

---

## Rule: Engineering conventions core (`**/*.{ts,tsx,js,jsx,mjs,cjs,php,py,ipynb,dart,sql}`)

When relevant across stacks:

- Composition over inheritance; early returns; named constants; focused functions; bounded classes/modules
- Avoid hidden side effects when explicit boundaries are possible
- Follow repository-established conventions unless there is a strong reason not to
- Comments explain **why**, not what

---

## Rule: UI state and accessibility gates (`**/*.{tsx,jsx,css,scss}`)

For user-facing UI changes, validate loading, submitting, success, error, empty, disabled, validation feedback, keyboard usability, focus, labels/semantics, and that important feedback is not color-only. Confirm the interface remains usable off the happy path and that obvious a11y regressions are not introduced.

---

## Rule: Repo command and script verification (`**/*`, alwaysApply: true)

- Do not guess project commands, scripts, task runners, or environment expectations
- Derive commands from package manifests, Makefiles, CI, README, `/docs/`, etc.
- Never assume package manager, script names, runtimes, env vars, or deployment behavior
- If a fact is missing, treat it as unknown — do not invent
- Repository evidence outranks stack habit; project docs outrank generic conventions; CI outranks intuition

---

## Rule: Stack overlay activation (`**/*`, alwaysApply: true)

- Apply framework/library-specific guidance only when repository evidence shows that stack is in use in the touched area
- Do not activate overlays from weak or stale signals alone; scope overlays to the relevant module or package
- Do not carry conventions from one repo area into another unless the stack is shared

---

## Rule: Change hygiene and non-invention (`**/*`, alwaysApply: true)

- Do not introduce changes not requested or not justified by evidence, validation, direct dependencies, or necessary safety fixes
- Modify only what needs to change; preserve unrelated behavior, contracts, defaults, and UX outside scope
- No empty or whitespace-only churn unless formatter-required or part of a real touched-line change
- No redundant confirmation of facts already in prompt, repo, or validated context
- Prefer coherent, reviewable diffs; no fake updates

---

## Rule: Ticket and requirements format (`**/*`, alwaysApply: true)

Use the structured ticket format to refine ambiguous or multi-step work (objective, context, constraints, scope in/out, approach, acceptance criteria, validation, risks). Acceptance criteria must be testable. Do not force full ticket structure on tiny edits. Use to improve planning quality without duplicating existing plans unnecessarily.

---

## Rule: Rule precedence (`**/*`, alwaysApply: true)

When rules conflict: (1) safety/security/privacy/data-loss prevention, (2) correctness and verified evidence, (3) scope fidelity, (4) minimal necessary change, (5) proportional validation, (6) tools when they reduce uncertainty, (7) docs when behavior/contracts/ops changed, (8) speed/convenience/style. Never trade safety or correctness for speed. Prefer smallest coherent diff. Framework overlays apply only when activated by evidence and never override higher-priority rules.

---

## Rule: Core operating workflow (`**/*`, alwaysApply: true)

Research → analyze → plan → implement → test → validate (proportionally, without ritual).

- Classify scope, risk, surface, impact, uncertainty before acting
- Inspect repo structure, relevant paths, `/docs/`, README, commands, conventions before editing; never invent scripts, commands, or architecture
- Plan depth: P0 direct execution, P1 short plan, P2 full plan when auth/security/migrations/infra/high uncertainty
- Execute end-to-end when safe; ask only when missing facts block correctness/safety/scope
- Change minimally; on failure, diagnose before speculative patches
- Done = implemented + validated + risks stated + docs if policy requires
- Preserve scope; do not touch files that do not need to change

---

## Rule: Planning and execution pack (`**/*`, alwaysApply: true)

For P1/P2 work: plans include task restatement, success criteria, approach, likely files, risks, verification. Investigate before editing. For P1/P2 append **Execution Pack for Executor** with proportional structure (context packet, tasks, validation, risks; P2 adds task contracts, routing, dependencies, escalation triggers). Model assignment optional.

---

## Rule: Tooling, skills, and subagents (`**/*`, alwaysApply: true)

- Identify relevant MCPs, skills, subagents, repo commands before non-trivial work; use the smallest set that materially helps
- Prefer repo inspection first; use MCPs when they confirm facts, reduce uncertainty, validate, or retrieve authoritative docs
- Skills for reusable workflows and domain patterns; delegate to subagents when expertise, risk, parallelization, or independent investigation clearly helps
- Do not invoke tools ritualistically; if skipped, state why (not applicable, already verified, unavailable, too costly)

---

## Rule: Project context and naming (`**/*`, alwaysApply: true)

Isolate project context; do not mix assumptions across repos. Follow established naming and conventions. Respect folder structure and boundaries. Inspect README, `/docs/`, plans, schema, CI when touching significant behavior. Never assume missing project context; local convention outranks generic preference.

---

## Rule: Quality, validation, and done (`**/*`, alwaysApply: true)

- Cheapest effective validation first: inspect → lint/typecheck → targeted tests → build → integration/e2e as needed
- V0–V3 validation levels by surface (docs-only through strict for auth/payments/migrations/infra)
- Handle relevant edge cases; DoD-lite/standard/strict as appropriate; honest about what was not run; UI quality when relevant; backend/DB validation when relevant

---

## Rule: Security, compliance, and data safety (`**/*`, alwaysApply: true)

Treat auth, permissions, secrets, uploads, SQL, external APIs, payments, PII, serialization, infra, logging as sensitive by default. Mandatory security review triggers for auth, payments, PII, secrets, schema, file access, integrations, access widening. Never expose secrets; no hardcoded credentials; safe defaults and least privilege; schema safety and data-loss prevention.

---

## Rule: Documentation and living knowledge (`**/*`, alwaysApply: true)

- Docs under `/docs/` per project convention; do not create root markdown unless the repo uses that convention
- Prefer updating existing docs; treat `/docs/*.md` as knowledge base; scan before changes, update after when behavior/contracts/ops change
- Update when user-visible behavior, APIs, architecture, setup, ops, or important tradeoffs change; skip for pure refactors/cosmetics
- Inline comments for non-obvious logic only; summary in chat; audience-aware docs

---

## Rule: Release, dependencies, and observability (`**/*`, alwaysApply: true)

When relevant: disciplined dependencies (lockfiles, justify upgrades, security/compatibility); release awareness (envs, flags, rollback, versioning); observability for critical flows without leaking secrets; respect PR/CI governance without artificial bureaucracy

---

## Rule: Cursor rules management (`.cursor/rules/**/*`, alwaysApply: true)

Rules need clear metadata, purpose, actionable instructions, examples when useful. Store under `PROJECT_ROOT/.cursor/rules/`, kebab-case `.mdc`. Prefer fewer stronger rules; update on repeated patterns/mistakes/stack changes; deprecate outdated rules; `alwaysApply: true` only when broadly valuable; scoped activation otherwise; merge/split consciously; encode precedence explicitly when needed

---

## Rule: Critical thinking and rigor (`**/*`, alwaysApply: true)

Analyze assumptions; stress-test reasoning for hidden scope, weak causality, false tradeoffs, unverified repo assumptions; prefer truth over agreement; mark uncertainty explicitly; never hallucinate repository truth; be rigorous without debating for sport; proportionate skepticism

---

## Rule: Communication and language (`**/*`, alwaysApply: true)

Match the user’s language. Be concise, modular, explicit; direct outcomes, scope, risks, structured summaries. Do not present assumptions as facts. Prefer execution over recommendations. Ask only when context truly blocks safe execution. Final reporting: inspected, changed, validated, not validated, risks/follow-ups. Avoid conversational noise and filler acknowledgment.

---

## Rule: Ultrathink (optional, `alwaysApply: false`)

Use for especially important architectural or quality-sensitive work: question assumptions, read deeply, plan before broad changes, prefer elegant simple solutions, refine naming/boundaries/edge cases. Inspirational only — never overrides safety, correctness, scope fidelity, or proportional execution.

---

*End of part 2. Part 1: [`PUBLIC_USER_RULES.md`](./PUBLIC_USER_RULES.md).*
