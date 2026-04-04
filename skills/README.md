# Agent Skills — `~/.cursor/skills/`

Reusable skills: each skill lives in a subdirectory with `SKILL.md` (and optionally `references/`, scripts, etc.).

## Contents

This bundle includes skills for SDLC (`phase-handoff`, `sdlc-checkpoint`, `ship-feature`), quality (`self-validate`, `review-and-secure`), domain (React, API, auth, database), and operations (git, post-mortem, runbooks).

## Installation

Copy with structure intact:

```text
repo/skills/<skill-name>/SKILL.md  →  ~/.cursor/skills/<skill-name>/SKILL.md
```

Skills are installed by the Cursor assistant following **`docs/guide/installation.md`** (see **`README.md`** → Installation).

## Use in Cursor

Cursor discovers skills under the user profile per version and settings. Keep folder names stable; `SKILL.md` should state when to activate the skill.

## Relationship to `skills-cursor/`

`~/.cursor/skills-cursor/` is filled **automatically by Cursor** (built-in product skills). They are **not** in this repository and the install protocol does not copy them.
