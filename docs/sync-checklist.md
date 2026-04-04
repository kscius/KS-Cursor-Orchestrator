# Checklist: validate the bundle against `~/.cursor`

Use this before a release or after editing the global profile.

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

Validate JSON:

```powershell
node -e "JSON.parse(require('fs').readFileSync('hooks/hooks.json','utf8')); console.log('hooks OK')"
```

## 3. `skills-cursor/`

Not versioned in this repository (`.gitignore`). Cursor keeps it under `~/.cursor/skills-cursor/`.

## 4. Clean install

Have Cursor Chat execute the protocol in **`docs/guide/installation.md`** (see **`README.md`** → Installation), or copy manually using the same mapping as in that file.
