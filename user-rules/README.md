# User Rules (Cursor IDE)

## Where Cursor keeps User Rules

**User Rules** live in editor settings (**Cursor → Settings → Rules**), not in `~/.cursor/rules/`.

- **`~/.cursor/rules/*.mdc`** — on-disk profile rules (this repo versions them under `rules/`).
- **User Rules** — markdown/text the product injects globally; you edit them in the UI.

## Public mirror in this repository

This repo publishes a **read-only mirror** of the maintainer’s User Rules so others can review, diff, or copy them:

| File | Contents |
|------|----------|
| [`PUBLIC_USER_RULES.md`](./PUBLIC_USER_RULES.md) | Introduction + first block of rules |
| [`PUBLIC_USER_RULES_PART2.md`](./PUBLIC_USER_RULES_PART2.md) | Remaining rules (overlays, workflow, quality, security, docs, etc.) |

These files are **not** installed by [`docs/guide/installation.md`](../docs/guide/installation.md). After clone or update, if you want the same User Rules in your Cursor profile, open **Settings → Rules** and paste or reconcile manually.

To refresh the mirror from Cursor when your local rules change: copy everything from **Settings → Rules** into `PUBLIC_USER_RULES.md` (or split across the part files) and commit.

## Aligning a team

1. Use the public mirror as the reference text (or export from a reference member’s Settings).
2. Each developer pastes into **Settings → Rules** (or keeps a personal variant).
3. Do not commit secrets, internal hostnames, or credentials into the public mirror.

## Optional template

For a shorter team baseline (non-maintainer), you can add e.g. `user-rules/TEAM_RULES.template.md` and document it in the root **[`README.md`](../README.md)**.
