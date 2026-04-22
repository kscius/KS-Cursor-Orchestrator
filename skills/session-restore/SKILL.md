# Session Restore Skill

Use this skill to recover context from a previous Cursor session. Invoke when resuming work after an interruption, when starting a new chat on an ongoing task, or when you need to understand what the previous session accomplished.

## Trigger phrases

- "restore session"
- "what happened last session"
- "resume from where we left off"
- "what was I doing"
- "session restore"
- "load previous context"
- "/session-restore"

## Skill instructions

### Step 1: Locate recent agent transcripts

The Cursor agent transcripts are stored in:
```
C:\Users\mitza\.cursor\projects\c-Users-mitza-cursor\agent-transcripts\
```

Each transcript is a `.jsonl` file named by UUID. Find the most recent ones:

```bash
# Find the 5 most recently modified transcript files
Get-ChildItem "C:\Users\mitza\.cursor\projects\c-Users-mitza-cursor\agent-transcripts\*\*.jsonl" | 
  Sort-Object LastWriteTime -Descending | 
  Select-Object -First 5 | 
  Select-Object FullName, LastWriteTime
```

Or on Unix-style paths:
```bash
ls -lt ~/.cursor/projects/*/agent-transcripts/*.jsonl | head -5
```

### Step 2: Read the tail of the most recent transcript

Transcripts can be large. Read the last ~100 lines to find:
- What task was being worked on
- What files were created or modified
- What decisions were made
- What was completed vs left pending
- Any errors encountered
- Todo items in progress

```bash
# Read last 100 lines of the most recent transcript
Get-Content <path-to-transcript.jsonl> -Tail 100
```

Each line is a JSON event. Look for:
- `"role": "assistant"` messages: what the agent said/did
- `"role": "user"` messages: what was requested
- Tool call results (file writes, shell commands, etc.)
- Summary events if present

### Step 3: Check workflow state file

If a workflow state file exists, read it:
```
.cursor/plans/workflow_state.md
```

This will show the current SDLC phase and task status from the previous session.

### Step 4: Check git log for recent changes

```bash
git log --oneline --since="24 hours ago"
git diff HEAD~3..HEAD --stat
```

This shows what was actually committed (ground truth of what was done).

### Step 5: Check for in-progress todos

Look for any plan files with pending items:
```bash
Get-ChildItem "C:\Users\mitza\.cursor\plans\*.plan.md" | 
  Sort-Object LastWriteTime -Descending | 
  Select-Object -First 3
```

Read them for `status: pending` or `status: in_progress` todos.

### Step 6: Query memory systems

If `cursor10x-mcp` MCP is available:
```
Query cursor10x for recent context about the current project
```

If `devcontext` MCP is available:
```
Query devcontext for active session state
```

### Step 7: Emit session restore summary

Output in this format:

```
## Session Restore Summary

**Last session:** <timestamp from transcript>
**Session ID:** <transcript UUID>

---

**What was being worked on:**
<task description from user messages>

**What was completed:**
- <item 1>
- <item 2>

**What is still pending:**
- <item 1> (status: in_progress / pending)
- <item 2>

**Files modified in last session:**
- <file 1>
- <file 2>

**Last decision made:**
<key decision from assistant messages>

**Known blockers / open questions:**
<any issues that were raised>

---

**Recommended next action:**
<what to do to continue from where we left off>
```

### Notes

- If the transcript is a summary (pre-compacted), look for the `[Previous conversation summary]` block in the system prompt — it contains a structured summary of past work.
- The `agent-transcripts` folder contains JSONL files. Each line is a separate JSON event. The file is append-only and grows throughout a session.
- Complement this skill with `context-prime` for full project orientation.
- For very long sessions, focus on the last 200 lines of the transcript tail rather than reading the full file.
