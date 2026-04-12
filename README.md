# KS Cursor Orchestrator

![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)
![Status](https://img.shields.io/badge/status-public%20alpha-blue)
![Cursor](https://img.shields.io/badge/for-Cursor-6f42c1)
![Orchestration](https://img.shields.io/badge/orchestration-agentic-black)

**An end-to-end agentic engineering system for Cursor.**

KS Cursor Orchestrator turns Cursor into a coordinated software execution environment powered by commands, subagents, rules, hooks, MCPs, and CLI workflows.

Instead of treating Cursor as a single assistant, this repository structures it as an orchestrated engineering system that can intake work, explore codebases, plan execution, delegate specialized tasks, build incrementally, validate results, and preserve shared operating context across workflows.

The goal is to make software execution inside Cursor more structured, reusable, and autonomous.

---

## Overview

KS Cursor Orchestrator is a public repository for a complete Cursor setup designed to support high-autonomy software workflows.

It integrates:

- global rules and execution patterns
- slash commands for repeatable workflows
- specialized subagents for task delegation
- hooks for lifecycle automation
- MCP-based tool and context integration
- CLI-driven execution flows
- reusable operating conventions for planning, building, validating, and reviewing software

This repository is for developers who want Cursor to behave less like a single chat assistant and more like a coordinated engineering environment.

---

## Core Idea

The system is built around orchestration.

Rather than solving everything in a single prompt, KS Cursor Orchestrator organizes work into structured flows that can:

1. intake and frame a task
2. explore the codebase and relevant context
3. produce or refine a plan
4. delegate specialized work
5. execute implementation steps
6. verify outputs and detect issues
7. iterate until completion

This makes workflows more modular, inspectable, and reusable.

---

## Main Components

### Rules

Global guidance, execution standards, planning conventions, guardrails, and operating principles.

### Commands

Reusable slash commands for orchestrating discovery, planning, implementation, debugging, validation, and team-style workflows.

### Subagents

Specialized workers used for delegated tasks and role-based execution.

### Hooks

Lifecycle automations that extend or reinforce behavior during agent execution.

### MCPs

Integrated tools and context providers that expand what the system can access and do.

### CLI Workflows

Command-line execution patterns that support repeatable and automatable software delivery.

---

## Design Goals

- high-autonomy software execution
- modular and reusable workflows
- explicit planning and validation
- role-based task delegation
- better operational consistency inside Cursor
- a more complete engineering environment built on top of Cursor

---

## Installation

Same pattern as [Oh My OpenCode](https://github.com/code-yeongyu/oh-my-openagent): humans paste **one prompt** that points the agent at a **raw** install guide; the guide is **executor-only** (for the assistant), not a human tutorial.

**Canonical install protocol (repository path):** [`docs/guide/installation.md`](./docs/guide/installation.md)

### For humans

Copy and paste into **Cursor Chat** (or any agent that can use your disk and terminal):

```text
Install and configure KS Cursor Orchestrator by following the instructions here:
https://raw.githubusercontent.com/kscius/ks-cursor-orchestrator/main/docs/guide/installation.md
```

Then **allow** file and terminal access when prompted so the assistant can copy into `~/.cursor/` (Windows: `%USERPROFILE%\.cursor`).

**Optional — if you already have the repo open in Cursor:** you can `@docs/guide/installation.md` instead of the URL.

**Forks / other branches:** replace `kscius/ks-cursor-orchestrator` and `main` in the raw URL with your GitHub owner, repo, and default branch.

### For LLM agents

Fetch the install guide and follow it (resolve `REPO_ROOT`, run the copy block for the user’s OS, validate `hooks.json`, list paths touched):

```bash
curl -fsSL https://raw.githubusercontent.com/kscius/ks-cursor-orchestrator/main/docs/guide/installation.md
```

If you already have this repository as the workspace, **read** `docs/guide/installation.md` from disk instead of `curl` so you always match the checked-out revision.

**Legacy:** [`LLM_Installer.md`](./LLM_Installer.md) is a short pointer to `docs/guide/installation.md` for old links or `@` mentions.

### Clone the repository (optional)

```bash
git clone https://github.com/kscius/ks-cursor-orchestrator.git
cd ks-cursor-orchestrator
```

Then run the **For humans** prompt above, or `@docs/guide/installation.md`, from that workspace.

**Not copied by the protocol (by design):** Cursor’s built-in `~/.cursor/skills-cursor/`, **User Rules** (Settings → Rules; not mirrored into `~/.cursor` as files), and MCP secrets. This repo includes a **public text mirror** of the maintainer’s User Rules in [`user-rules/PUBLIC_USER_RULES.md`](./user-rules/PUBLIC_USER_RULES.md) (+ [part 2](./user-rules/PUBLIC_USER_RULES_PART2.md)) — copy into Settings manually if you want them. See [`user-rules/README.md`](./user-rules/README.md) and [`mcp/README.md`](./mcp/README.md).

Quick path reference: [`docs/cursor-install-paths.md`](./docs/cursor-install-paths.md).  
Why there is no `skills-cursor/` folder here: [`docs/skills-cursor-not-in-repo.md`](./docs/skills-cursor-not-in-repo.md).  
Validate or diff against your live profile: [`docs/sync-checklist.md`](./docs/sync-checklist.md).

---

## Repository layout

```text
ks-cursor-orchestrator/
├── LLM_Installer.md      # Pointer → docs/guide/installation.md (compatibility)
├── docs/
│   ├── guide/
│   │   └── installation.md   # Canonical executor install protocol (raw URL in README)
│   ├── cursor-install-paths.md
│   ├── sync-checklist.md
│   └── skills-cursor-not-in-repo.md
├── AGENTS.md             # Copy to ~/.cursor/AGENTS.md (global agent defaults)
├── requirements-mempalace-mcp.txt  # Pin for MemPalace MCP venv (copy to ~/.cursor/ alongside AGENTS.md if you use that layout)
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── rules/                # ~/.cursor/rules — profile .mdc rules (+ README)
├── commands/             # ~/.cursor/commands — slash commands (+ README)
├── agents/               # ~/.cursor/agents — Cursor subagents (+ README)
├── skills/               # ~/.cursor/skills — agent skills (+ README)
├── hooks/                # ~/.cursor/hooks + ~/.cursor/hooks.json (+ README)
├── mcp/                  # README + mcp.config.example.json (template; copy to ~/.cursor/mcp.json)
├── user-rules/           # README + PUBLIC_USER_RULES*.md (mirror of Settings → Rules; not auto-installed)
└── extensions/         # Note: IDE extensions are not copied from this repo
```

This repository is **not** an application: it is a versioned **Cursor configuration bundle** plus an **agent-executable** install guide (`docs/guide/installation.md`).

---

## Who Is This For?

This repository is for developers who want to:

* run more structured workflows inside Cursor
* coordinate multi-step implementation tasks
* use commands and subagents consistently
* increase autonomy without losing control
* standardize the way software work is executed in Cursor

---

## Philosophy

KS Cursor Orchestrator is not just a prompt collection.

It is an execution model for software work inside Cursor.

The repository treats Cursor as an orchestrated engineering environment where workflows, delegation, tooling, and validation are part of the same system.

---

## Current Status

KS Cursor Orchestrator is currently in **public alpha**.

The structure is usable today, but it should be expected to evolve as workflows, commands, agents, and integrations become more standardized and easier to install.

---

## Contributing

Contributions, improvements, and workflow ideas are welcome.

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

---

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE).
