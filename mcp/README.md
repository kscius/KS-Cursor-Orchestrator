# MCP (Model Context Protocol)

This folder shares a **template** MCP configuration for Cursor: [`mcp.config.example.json`](./mcp.config.example.json). It mirrors the maintainer’s typical stack (Docker + `npx` + hosted HTTP MCPs) but **replaces every secret with placeholders**.

## Security

- **Never commit** a real `mcp.json` with API keys, PATs, or Turso tokens.  
- If you copy a live config into this repo by mistake, treat all exposed keys as **compromised**: revoke and rotate them at the provider.
- `.gitignore` ignores `mcp/mcp.json` and `mcp/*.local.json` so a local copy next to the example is harder to commit accidentally.

## How to use the example in Cursor

1. Copy the template to your Cursor profile (adjust the path for your OS):

   - **Windows:** `%USERPROFILE%\.cursor\mcp.json`  
   - **macOS / Linux:** `~/.cursor/mcp.json`

2. Replace every placeholder (`<...>`) with your own values (see table below).

3. Restart Cursor (or reload the window) so MCP servers pick up changes.

Alternatively, add servers one by one in **Cursor → Settings → MCP** using the same commands, URLs, and env vars.

## Placeholders to fill in

| Server | What to provide |
|--------|------------------|
| **Memory** | Host directory for `memory.json` (replace `<HOST_PATH_TO_MEMORY_DIR>` in the `-v` mount). Create the folder first. |
| **context7** | `CONTEXT7_API_KEY` from [Context7](https://context7.com/). |
| **github** | `Bearer` token for [GitHub MCP / Copilot MCP](https://github.com/) (fine-grained or product-specific token per GitHub docs). |
| **cursor10x-mcp** | Docker image `cursor10x-mcp-turso:local` must exist locally (build from the cursor10x-mcp project). Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` for your Turso DB. |
| **devcontext** | `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` for devcontext’s Turso database. |
| **stitch** | Google API key header for Stitch (see Google’s Stitch / Gemini API docs). |
| **firecrawl** | `FIRECRAWL_API_KEY` from [Firecrawl](https://firecrawl.dev/). |
| **exa** | `EXA_API_KEY` from [Exa](https://exa.ai/). |
| **filesystem** | One or more allowed root paths (replace `<ALLOWED_ROOT_DIRECTORY>`). **Use a narrow path** (e.g. project root), not a full drive, unless you accept the risk. |
| **mtg-commander-analyzer** | Absolute path to your clone of the MCP server repo (Windows `cmd` example; on macOS/Linux use a `sh -c` style command or Cursor’s equivalent). |
| **mempalace** | Replace `<MEMPALACE_PYTHON_EXE>` with your Python (commonly `%USERPROFILE%\.cursor\venvs\mempalace\Scripts\python.exe` on Windows when using the pinned venv). Install the `mempalace` package; pin file: [`../requirements-mempalace-mcp.txt`](../requirements-mempalace-mcp.txt); see [`../rules/mempalace-mcp.mdc`](../rules/mempalace-mcp.mdc). |
| **obsidian** | Path to your Obsidian vault directory (`<OBSIDIAN_VAULT_PATH>` as the last `npx` argument). |

## Prerequisites

- **Docker** — for Memory, Sequential Thinking, time, semgrep, fetch, cursor10x-mcp (image must be built locally).  
- **Node.js / `npx`** — for Interactive, duckduckgo, devcontext, playwright, firecrawl, exa, filesystem, obsidian.  
- **Python** — for MemPalace (`python -m mempalace.mcp_server`) when that server is enabled.  
- **Network** — for HTTP MCPs (context7, github, linear, notion, stitch).

## Servers in `mcp.config.example.json` (overview)

| Server | Transport | Notes |
|--------|-----------|--------|
| Memory | Docker | Persistent volume for memory file |
| Sequential Thinking | Docker | Reasoning chain |
| Interactive | npx | User prompts / confirmations |
| duckduckgo | npx | Web search |
| time | Docker | `TZ` env in args (change to your timezone) |
| context7 | HTTPS + API key | Library docs |
| semgrep | Docker | Security scanning MCP |
| github | HTTPS + Bearer | GitHub / Copilot MCP endpoint |
| linear | HTTPS | Disabled by default; enable + auth in UI if needed |
| cursor10x-mcp | Docker | Turso-backed memory (local image) |
| devcontext | npx | Turso-backed session context |
| stitch | HTTPS | Google Stitch |
| playwright | npx | Browser automation MCP |
| mtg-commander-analyzer | cmd | Optional local MCP (disabled) |
| firecrawl | npx | Crawl / scrape |
| notion | HTTPS | Notion MCP (follow Notion auth flow in Cursor) |
| fetch | Docker | HTTP fetch MCP |
| filesystem | npx | Scoped filesystem access |
| exa | npx | Search |
| mempalace | Python module | Local semantic memory (optional) |
| obsidian | npx | Obsidian vault integration (optional) |

Docker image digests in the example are **pins from a working setup**; upstream may publish newer digests or tags — update if a pull fails.

## References in repo rules

- [`../rules/cursor10x-mcp.mdc`](../rules/cursor10x-mcp.mdc)  
- [`../rules/devcontext-mcp.mdc`](../rules/devcontext-mcp.mdc)  
- [`../rules/mempalace-mcp.mdc`](../rules/mempalace-mcp.mdc)  
- [`../rules/obsidian-mcp.mdc`](../rules/obsidian-mcp.mdc)
