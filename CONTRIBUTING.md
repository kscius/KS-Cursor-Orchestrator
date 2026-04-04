# Contributing

## Cursor setup changes

1. Edit artifacts in versioned folders (`rules/`, `commands/`, `agents/`, `skills/`, `hooks/`, etc.). **Do not** version `skills-cursor/`: Cursor already ships those with the install.
2. If install flow or paths change, update **`docs/guide/installation.md`** and, when relevant, **`docs/cursor-install-paths.md`** (and the short pointer in **`LLM_Installer.md`** if the raw URL path changes).
3. Keep each section README current when you add new categories.
4. Before publishing, validate the bundle against your local profile: **[`docs/sync-checklist.md`](./docs/sync-checklist.md)** (path comparison, `hooks.json` with `node`).

## Quick validation

```bash
node -e "JSON.parse(require('fs').readFileSync('hooks/hooks.json','utf8')); console.log('hooks OK')"
```

Run from the repository root.

## Install for collaborators

See **[`README.md`](./README.md) → Installation** for how to run the install from Cursor Chat. The assistant follows **`docs/guide/installation.md`** (executor protocol). **`LLM_Installer.md`** is only a compatibility pointer.

## License

By contributing, you agree the material is distributed under the repository license (`LICENSE`).
