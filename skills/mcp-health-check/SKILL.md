# MCP Health Check Skill

Use this skill when an MCP server is not responding, returning errors, behaving unexpectedly, or needs to be verified after configuration changes.

Triggers: "MCP not working", "MCP server error", "tool not available", "MCP timeout", "context7 failing", "devcontext broken", or when a tool call returns an unexpected error.

---

## Step 1 — Identify the failing MCP

Determine which MCP server is affected:

```
1. Note the exact error message (timeout, connection refused, tool not found, unexpected output)
2. Identify the MCP name from ~/.cursor/mcp.json or project .cursor/mcp.json
3. Check if the error is from one MCP or multiple
```

Common error patterns and likely causes:

| Error pattern | Likely cause |
| ------------- | ------------ |
| `timeout` | Server process not starting, too slow, or crashed |
| `connection refused` | Port conflict, Docker not running, URL wrong |
| `tool not found` | Wrong MCP name, MCP not enabled, restart needed |
| `auth error` / 401 | API key missing, expired, or wrong header name |
| `ENOENT` / `command not found` | npx/node/docker not in PATH, package not installed |
| `spawn error` | Command args wrong, env vars missing |

---

## Step 2 — Check configuration

Read `~/.cursor/mcp.json` and verify:

- `"enabled": true` is set for the target MCP
- `"command"` and `"args"` match what the MCP package expects
- `"timeout"` is sufficient (slow servers need 60–120s)
- `"env"` contains all required API keys or tokens
- For HTTP/SSE MCPs: `"url"` is reachable and `"headers"` are correct

**For Docker-based MCPs:** verify Docker Desktop is running:
```bash
docker ps
```

**For npx-based MCPs:** verify the package resolves:
```bash
npx -y <package-name> --version 2>&1 | head -5
```

**For URL-based MCPs:** verify the endpoint is reachable:
```bash
curl -s -o /dev/null -w "%{http_code}" <url>
```

---

## Step 3 — Check API keys

If the MCP requires an API key, verify:
1. The key exists in `mcp.json` under `"env"` or `"headers"`
2. The key is not expired (check the service's dashboard)
3. The key has the required permissions/scopes
4. The header name matches exactly what the service expects

Common header names by service:
- context7: `CONTEXT7_API_KEY` in headers
- GitHub: `Authorization: Bearer <token>` in headers
- Firecrawl: `FIRECRAWL_API_KEY` in env
- Exa: `EXA_API_KEY` in env (separate from Firecrawl)
- Linear: OAuth via `https://mcp.linear.app/mcp` (no header needed — opens browser auth)

---

## Step 4 — Restart and re-test

After any configuration change:
1. Restart Cursor completely (not just reload window)
2. Open a new chat session
3. Try a minimal tool call (e.g., ask for current time from `user-time`)
4. If still failing, check Cursor's MCP logs: `Help → Toggle Developer Tools → Console`

---

## Step 5 — Isolation test

If restarting doesn't help, disable all other MCPs temporarily and test the failing one in isolation:
1. Set all other MCP servers to `"enabled": false`
2. Restart Cursor
3. Test the specific MCP
4. If it works in isolation, re-enable others one at a time to find the conflict

---

## Step 6 — Fallback behavior

While the MCP is down, document the fallback:

| MCP | Fallback |
| --- | -------- |
| user-context7 | Use WebSearch or WebFetch directly for library docs |
| user-devcontext | Keep state in chat and write to `.cursor/plans/` manually |
| user-cursor10x-mcp | Skip memory operations for this session |
| user-github | Use Shell with `gh` CLI commands |
| user-Sequential Thinking | Reason through in main chat context |
| cursor-ide-browser | Use Shell with playwright CLI or skip browser verification |

---

## Step 7 — Report findings

Summarize:
```
MCP affected: [name]
Error: [exact message]
Root cause: [what was wrong]
Fix applied: [what was changed]
Status: [working / still failing / using fallback]
Fallback: [which fallback is in use if still failing]
```
