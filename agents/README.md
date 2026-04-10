# ~/.cursor/agents — Cursor-Native Subagents

This directory contains **Cursor-native subagents** optimized for Cursor's built-in features:
- `model: fast` for lightweight/parallel tasks
- `readonly: true` for review/audit agents
- `is_background: true` for async workstreams

## Architecture

```
~/.cursor/agents/     ← Cursor-native (this directory, highest precedence)
~/.claude/agents/     ← Claude Code compatible (87 specialized agents)
.cursor/agents/       ← Project-specific (highest priority for that project)
```

When names conflict, priority order: `.cursor/agents/` > `~/.cursor/agents/` > `~/.claude/agents/`

## Available agents (this directory)

| Agent | Model | Readonly | Description |
|-------|-------|----------|-------------|
| `verifier` | fast | true | Validates completed work with skepticism |
| `explore-fast` | fast | true | Fast codebase recon for SCOUT phase |
| `research-fast` | fast | true | Fast parallel research — docs, APIs, web synthesis |
| `code-reviewer` | inherit | true | CRITIC phase code quality review |
| `security-auditor` | inherit | true | CRITIC phase security review |
| `architect-reviewer` | inherit | true | CRITIC phase architectural review |
| `debugger` | inherit | false | Root cause analysis and bug fixing |
| `test-runner` | fast | false | Run tests and fix failures |
| `performance-engineer` | inherit | false | Profiling and performance optimization |
| `documentation-engineer` | fast | false | Technical documentation |
| `backend-developer` | inherit | false | Backend APIs, services, databases |
| `frontend-developer` | inherit | false | UI components, pages, state |
| `fullstack-developer` | inherit | false | End-to-end feature implementation |
| `qa-expert` | inherit | false | QA strategy and test coverage |
| `devops-engineer` | inherit | false | CI/CD, containers, infrastructure |

## Model selection rationale

**fast**: `verifier`, `explore-fast`, `research-fast`, `test-runner`, `documentation-engineer`
- These tasks are bounded, structured, and don't require deep reasoning
- Cost/speed benefit outweighs quality difference

**inherit**: Everything else
- Risk-sensitive (security, architecture, debugging) needs full model power
- Implementation agents need the same reasoning quality as the orchestrator

## Adding new agents

1. Create `agent-name.md` in this directory
2. Add YAML frontmatter with `name`, `description`, `model`, `readonly`
3. Write focused, specific prompt — not generic "help with coding"
4. Use "Use proactively" in description for automatic delegation

See `~/.cursor/rules/cursor-subagents-architecture.mdc` for full guidelines.
