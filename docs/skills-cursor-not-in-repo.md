# Why `skills-cursor/` is not in this repository

Cursor installs **built-in product skills** under:

- **Windows:** `%USERPROFILE%\.cursor\skills-cursor\`
- **macOS / Linux:** `~/.cursor/skills-cursor/`

That directory is **managed by Cursor** (updates ship with the product). It is **not** part of this bundle and is **not** copied by [`docs/guide/installation.md`](./guide/installation.md).

This repository versions **custom** skills under `skills/` at the repo root, which map to `~/.cursor/skills/` after install.

`.gitignore` excludes a local `skills-cursor/` folder so accidental copies are never committed.

For the relationship between `skills/` and `skills-cursor/`, see also [`../skills/README.md`](../skills/README.md).
