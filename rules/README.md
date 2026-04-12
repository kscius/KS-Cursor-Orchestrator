# Cursor Rules — `~/.cursor/rules/`

Global profile-level rules for the Cursor AI assistant. Apply across all projects opened with this Cursor profile.

## Rule inventory

| File | Activation | Scope / Globs | Purpose |
| ---- | ---------- | ------------- | ------- |
| `change-hygiene.mdc` | **alwaysApply** | All | No invented scope, minimal diffs, no churn |
| `operating-model.mdc` | **alwaysApply** | All | SDLC artifact paths, phase gate conditions, escalation |
| `orchestration-protocol.mdc` | **alwaysApply** | All | Brainstorming gates, SequentialThinking triggers, MCP lifecycle |
| `sdlc-workflow.mdc` | **alwaysApply** | All | Workflow types (feature/bugfix/refactor/…) and phase sequences |
| `backend-service-unified.mdc` | Intelligently + globs | `**/*.{ts,js,mjs,cjs,py,php}` | Node/backend service boundaries and API validation |
| `frontend-react-unified.mdc` | Intelligently + globs | `**/*.{tsx,jsx}`, app/pages/components | React / Next.js conventions |
| `testing.mdc` | Intelligently + globs | `**/*.{test,spec}.*`, test/spec/e2e dirs | Test structure, AAA, mocking, anti-patterns |
| `security-sensitive.mdc` | Intelligently + globs | auth, payment, middleware, token paths | Security discipline on sensitive surfaces |
| `cursor10x-mcp.mdc` | Intelligently | — | cursor10x memory MCP tool reference |
| `devcontext-mcp.mdc` | Intelligently | — | devcontext MCP lifecycle reference |
| `overlay-cursor-rules-mgmt.mdc` | globs | `.cursor/rules/**/*` | Rules authoring and maintenance |
| `overlay-database-sql.mdc` | globs | DB, migration, Prisma files | Database, SQL, migrations |
| `overlay-flutter-dart.mdc` | globs | `**/*.dart` | Flutter / Dart conventions |
| `overlay-gemini-llm.mdc` | globs | gemini/prompt/llm/agent files | Gemini integration conventions |
| `overlay-openai-agents.mdc` | globs | agent/openai/tool/workflow files | OpenAI agent and orchestration conventions |
| `overlay-php.mdc` | globs | `**/*.php` | PHP conventions |
| `overlay-python-jupyter.mdc` | globs | `**/*.py`, `**/*.ipynb` | Python / Jupyter conventions |
| `ruby-rails-chatwoot.mdc` | globs | `**/*.rb`, Gemfile, routes, migrations | Ruby / Rails / Chatwoot conventions |

## Design principles

1. **`alwaysApply: true`** — only for rules that are universally relevant regardless of task (orchestration, hygiene, SDLC model). Currently: 4 files ≈ 389 lines total context budget per session.
2. **Globs + description** — for stack or domain-specific rules. The `description` field enables "Apply Intelligently" activation when a glob alone is insufficient.
3. **Under 200 lines per file** — optimal context budget. Cursor loads all matching rule content into the model context; shorter rules are more reliably applied.
4. **One concern per file** — no mixed-topic blobs. Split if a file grows beyond its original purpose.
5. **Avoid duplicating what the AI already knows** — common conventions, standard tools, well-known library APIs do not need rules.

## Adding a new rule

1. Create `~/.cursor/rules/<kebab-case-name>.mdc`.
2. Add frontmatter with `description`, `globs` (if scoped), and `alwaysApply`.
3. Keep content under 200 lines; use bullet points and headers for scannability.
4. Prefer `alwaysApply: false` unless the rule is genuinely universal.
5. Update this README table.

## Load order note

When multiple `alwaysApply: true` files exist, Cursor loads them in lexicographic (dictionary) order. If order matters, prefix filenames with numbers: `00-base.mdc`, `01-core.mdc`, etc. Current alwaysApply files do not have order dependencies, so numeric prefixes are not required.

## Relationship to user rules

User Rules (Cursor Settings → Rules) are also always injected into every session. These cover stack-specific conventions (React, TypeScript, Next.js, etc.) and quality/security policies globally. Project-level rules in this directory complement them with profile-wide orchestration logic and targeted overlays.

To avoid token bloat, avoid duplicating what user rules already cover.
