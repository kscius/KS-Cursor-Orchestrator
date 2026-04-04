# Install paths — quick reference

| Component | Windows | macOS / Linux |
|-----------|---------|---------------|
| Cursor profile (`CURSOR_HOME`) | `%USERPROFILE%\.cursor` | `$HOME/.cursor` |
| Rules | `%USERPROFILE%\.cursor\rules` | `~/.cursor/rules` |
| Commands | `%USERPROFILE%\.cursor\commands` | `~/.cursor/commands` |
| Agents | `%USERPROFILE%\.cursor\agents` | `~/.cursor/agents` |
| Skills | `%USERPROFILE%\.cursor\skills` | `~/.cursor/skills` |
| skills-cursor (built-in) | `%USERPROFILE%\.cursor\skills-cursor` | `~/.cursor/skills-cursor` — **managed by Cursor; not from this repo** |
| Hooks (scripts) | `%USERPROFILE%\.cursor\hooks` | `~/.cursor/hooks` |
| Hooks (config) | `%USERPROFILE%\.cursor\hooks.json` | `~/.cursor/hooks.json` |
| Global AGENTS.md | `%USERPROFILE%\.cursor\AGENTS.md` | `~/.cursor/AGENTS.md` |
| User Rules (IDE) | **Cursor → Settings → Rules** (not a path under `.cursor`) | Same — paste manually if using [`user-rules/PUBLIC_USER_RULES.md`](../user-rules/PUBLIC_USER_RULES.md) |

**Executor protocol** (for the Cursor agent): **`docs/guide/installation.md`**. **How to trigger it:** **`README.md`** → Installation (raw GitHub URL). **`LLM_Installer.md`** is a compatibility pointer only.
