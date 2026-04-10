# Checklist: validate the bundle against `~/.cursor`

Use this before a release or after editing the global profile.

## 0. Reverse sync (profile → repo)

When the **live profile** is ahead of the bundle and you want the repository to match:

1. Copy `rules/`, `commands/`, `agents/`, `skills/` from `%USERPROFILE%\.cursor\` into `REPO_ROOT\` with **robocopy** using `/E /IS /IT` (no `/MIR`) so repo-only files such as `hooks/README.md` or `commands/README.md` are not deleted.
2. Copy `hooks\*.js`, `hooks\lib\*`, and `%USERPROFILE%\.cursor\hooks.json` → `REPO_ROOT\hooks\hooks.json`.
3. **`mcp.json`:** never commit the real file. Regenerate `mcp/mcp.config.example.json` with **secrets and machine paths replaced** by placeholders (`<YOUR_TOKEN>`, `<HOST_PATH_TO_MEMORY_DIR>`, `<OBSIDIAN_VAULT_PATH>`, etc.), then update `mcp/README.md` if new servers were added.
4. Grep the diff for user-specific paths (`C:\Users\...`) and tokens before committing.

## 1. Commands and rules

- Compare file names between the repo and `%USERPROFILE%\.cursor\commands` (or `~/.cursor/commands`): repo `.md` files should not be missing globally right after install.
- Repeat for `rules/`, `agents/`, `skills/` (same relative paths under `~/.cursor`).

PowerShell (from repo root):

```powershell
$repo = (Get-Location).Path; $g = "$env:USERPROFILE\.cursor"
foreach ($d in 'rules','commands','agents','skills') {
  $rf = Get-ChildItem "$repo\$d" -Recurse -File | % { $_.FullName.Substring($repo.Length+1) }
  foreach ($rel in $rf) {
    if (-not (Test-Path (Join-Path $g $rel))) { "MISSING in global: $rel" }
  }
}
```

## 2. Hooks

- **Source in repo:** `hooks/hooks.json` (and scripts under `hooks/*.js`).
- **Destination on machine:** `%USERPROFILE%\.cursor\hooks.json` + `%USERPROFILE%\.cursor\hooks\`.
- Repo `hooks.json` is the bundle reference; it may differ from global if the installer was not run recently.

**Compare repo vs global correctly:** the bundled file `hooks/hooks.json` maps to **`CURSOR_HOME\hooks.json`** (profile root), not `CURSOR_HOME\hooks\hooks.json`. When diffing hashes or timestamps, compare `REPO_ROOT\hooks\hooks.json` with `%USERPROFILE%\.cursor\hooks.json`.

PowerShell:

```powershell
$repo = (Get-Location).Path
$g = Join-Path $env:USERPROFILE '.cursor'
$h1 = (Get-FileHash "$repo\hooks\hooks.json" -Algorithm SHA256).Hash
$h2 = (Get-FileHash "$g\hooks.json" -Algorithm SHA256).Hash
"hooks.json match: $($h1 -eq $h2)"
```

**Selective sync (repo ← global):** after editing hooks in the live profile, if `hooks.json` or `hooks\*.js` in `%USERPROFILE%\.cursor` is newer than the repo copies, copy back into `REPO_ROOT\hooks\` so the bundle stays authoritative. Rules/commands/skills in the repo are often newer than the profile until you re-run **`docs/guide/installation.md`**.

Validate JSON:

```powershell
node -e "JSON.parse(require('fs').readFileSync('hooks/hooks.json','utf8')); console.log('hooks OK')"
```

## 3. `skills-cursor/`

Not versioned in this repository (`.gitignore`). Cursor keeps it under `~/.cursor/skills-cursor/`.

## 4. Clean install

Have Cursor Chat execute the protocol in **`docs/guide/installation.md`** (see **`README.md`** → Installation), or copy manually using the same mapping as in that file.
