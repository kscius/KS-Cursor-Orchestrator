# Installation

**Audience:** Cursor assistant (or any agent with disk/terminal access) installing this bundle into the user’s Cursor profile.

**Humans:** use the copy-paste prompt in the repository **[README.md](../../README.md)** (section *Installation*). Do not treat this file as an end-user tutorial.

---

## 0. Execution contract

1. **Apply** this protocol using **tools** (Shell, file reads/writes, terminal). Copy files, run validation commands, and report **which absolute paths** you modified.
2. **Do not** replace execution with a summary of steps for the user to run themselves unless you are **blocked** (no disk access, permission denied, destructive ambiguity, or missing `REPO_ROOT` after asking).
3. **Do not** invent MCP servers, API keys, or User Rules text. If those are needed, point the user to `mcp/README.md` and `user-rules/README.md`.
4. After copies, tell the user to **restart Cursor** or reload the window so rules, commands, and hooks load.

---

## 1. Goal

Install or **update** the following into the user’s Cursor profile:

| Component | Role |
|-----------|------|
| **Rules** (`.mdc`) | `CURSOR_HOME/rules/` |
| **Commands** | `CURSOR_HOME/commands/` |
| **Agents** | `CURSOR_HOME/agents/` |
| **Skills** | `CURSOR_HOME/skills/` |
| **Hooks** | `CURSOR_HOME/hooks.json` + `CURSOR_HOME/hooks/*.js` (and `hooks/lib/` if present) |
| **AGENTS.md** | `CURSOR_HOME/AGENTS.md` |

**Out of scope for direct copy:**

- **User Rules** (Cursor → Settings → Rules): **not auto-copied** by this protocol. A **public mirror** for reference lives under `user-rules/PUBLIC_USER_RULES*.md` — see `user-rules/README.md`. Paste into Settings if you want the same rules in your profile.
- **MCP servers** (secrets): not copied — `mcp/README.md`.

**Do not copy** from the repo into `CURSOR_HOME`: `hooks/logs/`, `.git/`, `.cursor/plans/` (local developer artifacts).

---

## 2. Preconditions (verify before copying)

Confirm (or infer from environment):

- **Cursor** supports Rules, Commands, Agents, Hooks for this user.
- **Git** available if you must clone the repo.
- **`node`** on `PATH` (hooks invoke `node`). Run `node -v` if unsure.
- **Shell:** PowerShell on Windows; bash/zsh on macOS/Linux.

---

## 3. Resolve `REPO_ROOT` and `CURSOR_HOME`

**`REPO_ROOT`:** Absolute path to the **root** of this bundle (directory that contains `rules/`, `commands/`, `hooks/`, `AGENTS.md`, and `docs/guide/installation.md`).

- If the user’s workspace **is** this repo, use the workspace root.
- If they only have a URL, **clone** into a temp or chosen path (use the URL they give, or `https://github.com/kscius/ks-cursor-orchestrator.git` if none specified).

**`CURSOR_HOME`:**

- **Windows:** `%USERPROFILE%\.cursor` → e.g. `C:\Users\<name>\.cursor`
- **macOS / Linux:** `$HOME/.cursor`

Create `CURSOR_HOME` subdirectories if missing (`rules`, `commands`, `agents`, `skills`, `hooks`, `hooks/lib`).

---

## 4. Mapping (source → destination)

| Source under `REPO_ROOT` | Destination |
|--------------------------|-------------|
| `rules/*` | `CURSOR_HOME/rules/` |
| `commands/*` | `CURSOR_HOME/commands/` |
| `agents/*` | `CURSOR_HOME/agents/` |
| `skills/*` | `CURSOR_HOME/skills/` |
| `hooks/*.js`, `hooks/lib/` | `CURSOR_HOME/hooks/` |
| `hooks/hooks.json` | `CURSOR_HOME/hooks.json` |
| `AGENTS.md` | `CURSOR_HOME/AGENTS.md` |

**Overwrite:** Same-named files from this bundle **may** be overwritten to complete the install. If the user has customizations, **back up** first (e.g. `.bak` or copy of `CURSOR_HOME`) — warn them if you detect obvious local-only edits you are about to replace.

**Mirror vs add-only:** Default is **full mirror** of bundle contents into those folders (remove destination files that no longer exist in repo for that subtree). If the user explicitly requests **add-only** (no deletes), use non-mirror flags as documented below.

---

## 5. Copy commands (run the block for the user’s OS)

Substitute the real absolute path for `REPO_ROOT`.

### Windows (PowerShell)

```powershell
$REPO_ROOT = "C:\path\to\ks-cursor-orchestrator"
$CURSOR_HOME = Join-Path $env:USERPROFILE ".cursor"

New-Item -ItemType Directory -Force -Path @(
  "$CURSOR_HOME\rules", "$CURSOR_HOME\commands", "$CURSOR_HOME\agents",
  "$CURSOR_HOME\skills", "$CURSOR_HOME\hooks", "$CURSOR_HOME\hooks\lib"
) | Out-Null

robocopy "$REPO_ROOT\rules"       "$CURSOR_HOME\rules"       *.mdc /MIR
robocopy "$REPO_ROOT\commands"    "$CURSOR_HOME\commands"    *.md  /MIR
robocopy "$REPO_ROOT\agents"      "$CURSOR_HOME\agents"      *.md  /MIR
robocopy "$REPO_ROOT\skills"      "$CURSOR_HOME\skills"      /E /MIR
robocopy "$REPO_ROOT\hooks"       "$CURSOR_HOME\hooks"       *.js /MIR
robocopy "$REPO_ROOT\hooks\lib"   "$CURSOR_HOME\hooks\lib"   *.js /MIR

Copy-Item -Force "$REPO_ROOT\hooks\hooks.json" "$CURSOR_HOME\hooks.json"
Copy-Item -Force "$REPO_ROOT\AGENTS.md"        "$CURSOR_HOME\AGENTS.md"
```

- `robocopy … /MIR` mirrors (deletes extras in destination). For add-only, use `/E` without `/MIR` per subtree and merge manually.
- Robocopy exit codes **0–7** are often success; **≥8** is failure.

### macOS / Linux (bash)

```bash
REPO_ROOT="$HOME/src/ks-cursor-orchestrator"
CURSOR_HOME="$HOME/.cursor"

mkdir -p "$CURSOR_HOME"/{rules,commands,agents,skills,hooks,hooks/lib}

rsync -a --delete "$REPO_ROOT/rules/"       "$CURSOR_HOME/rules/"
rsync -a --delete "$REPO_ROOT/commands/"    "$CURSOR_HOME/commands/"
rsync -a --delete "$REPO_ROOT/agents/"      "$CURSOR_HOME/agents/"
rsync -a --delete "$REPO_ROOT/skills/"      "$CURSOR_HOME/skills/"
rsync -a --delete --exclude='hooks.json' --exclude='logs' "$REPO_ROOT/hooks/" "$CURSOR_HOME/hooks/"

cp -f "$REPO_ROOT/hooks/hooks.json" "$CURSOR_HOME/hooks.json"
cp -f "$REPO_ROOT/AGENTS.md"        "$CURSOR_HOME/AGENTS.md"
```

Omit `--delete` on `rsync` if the user requires add-only.

---

## 6. `hooks.json` and hook working directory

- Entries use paths like `node ./hooks/...`. The process **cwd** for hooks must be **`CURSOR_HOME`** (where `hooks.json` and the `hooks/` folder live). If Cursor’s hook cwd differs in their version, adjust per official Cursor Hooks docs.

**Validate JSON** after copy:

```bash
node -e "JSON.parse(require('fs').readFileSync('PATH_TO_CURSOR_HOME/hooks.json','utf8')); console.log('hooks.json OK')"
```

Use the real absolute path to `hooks.json` (on Windows, PowerShell path to `$env:USERPROFILE\.cursor\hooks.json`).

---

## 7. MCP and User Rules

- **Do not** fabricate MCP config or paste secrets. State that MCP is manual: **Cursor Settings → MCP**, and reference `mcp/README.md`.
- **User Rules** are IDE settings, not files copied into `CURSOR_HOME`. Reference `user-rules/README.md` and the optional public mirror `user-rules/PUBLIC_USER_RULES*.md` if the user wants to paste the same text into **Settings → Rules**.

---

## 8. Post-install verification (you must check)

1. `node -v` succeeds.
2. `CURSOR_HOME/hooks.json` exists and parses as JSON.
3. At least one script from `hooks.json` exists (e.g. `CURSOR_HOME/hooks/session-context.js`).
4. Counts under `rules/`, `commands/`, `agents/`, `skills/` are in line with `REPO_ROOT` (no empty dirs after a full install).
5. Remind the user: **restart or reload Cursor**.

---

## 9. Update from Git (when `REPO_ROOT` is a clone)

```bash
cd "$REPO_ROOT"
git pull
```

Re-run **section 5**. Re-validate **section 6** if `hooks.json` changed.

---

## 10. If the user reports problems after install

| Report | Action |
|--------|--------|
| Hook fails “node not found” | They need Node on PATH; restart terminal/Cursor. |
| Rules not applying | Check `CURSOR_HOME/rules/*.mdc` exist and frontmatter is valid. |
| Commands missing | Check `CURSOR_HOME/commands/*.md` and restart Cursor. |
| Conflicts / duplicates | Suggest backing up `CURSOR_HOME` and reinstall without mirror flags if they need to preserve extras. |

Path reference: [`../cursor-install-paths.md`](../cursor-install-paths.md).
