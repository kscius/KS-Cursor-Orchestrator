---
name: subagent-driven-development
description: Use when executing implementation plans with independent tasks — dispatches fresh subagents per task with two-stage review (spec compliance, then code quality)
---

# Subagent-Driven Development

Execute a plan by dispatching a fresh subagent per task, with two-stage review after each: spec compliance first, then code quality.

**Why subagents:** Fresh subagents have isolated context. By precisely crafting their instructions, you ensure they stay focused. They should never inherit the session's context or history — you construct exactly what they need. This also preserves your own context for coordination work.

**Core principle:** Fresh subagent per task + two-stage review (spec then quality) = high quality, fast iteration

## When to Use

- You have an implementation plan with mostly independent tasks
- You want to stay in the current session (vs. parallel sessions)
- Each task can be dispatched to a fresh agent with full context provided

**vs. inline execution:**
- Fresh subagent per task (no context pollution)
- Two-stage review after each task: spec compliance first, then code quality
- Faster iteration (no human-in-loop between tasks)

## The Process

### Setup

1. Read the plan file once
2. Extract ALL tasks with full text and context
3. Create TodoWrite with all tasks
4. Work directory: confirm with `using-git-worktrees` if needed

### Per Task Loop

For each task:

1. **Dispatch implementer subagent** using `./implementer-prompt.md` template
   - Provide: full task text, scene-setting context, working directory
   - Do NOT make the subagent read the plan file — paste the text

2. **Handle implementer status:**
   - `DONE` → proceed to spec review
   - `DONE_WITH_CONCERNS` → read concerns, address if correctness/scope issue, then proceed
   - `NEEDS_CONTEXT` → provide missing info, re-dispatch
   - `BLOCKED` → assess: provide more context / upgrade model / break task smaller / escalate to human

3. **Dispatch spec compliance reviewer** using `./spec-reviewer-prompt.md`
   - Verify: does implementation match spec? nothing missing? nothing extra?
   - If ❌ issues → implementer fixes → spec reviewer re-reviews → repeat until ✅

4. **Dispatch code quality reviewer** using `./code-quality-reviewer-prompt.md`
   - Only after spec compliance is ✅
   - If issues → implementer fixes → re-review → repeat until ✅

5. **Mark task complete** in TodoWrite

### After All Tasks

- Dispatch final code reviewer for the entire implementation
- Use `finishing-a-development-branch` skill

## Model Selection

Use the least powerful model that can handle each role:

| Task type | Model |
|---|---|
| Isolated functions, clear spec, 1-2 files | Fast/cheap model |
| Multi-file coordination, integration concerns | Standard model |
| Architecture, design, broad review | Most capable model |

## Handling Implementer Status

**DONE:** Proceed to spec compliance review.

**DONE_WITH_CONCERNS:** Read concerns before proceeding. If correctness/scope concerns → address first. If observations (file getting large, etc.) → note and proceed.

**NEEDS_CONTEXT:** Provide missing information and re-dispatch.

**BLOCKED:** 
1. Context problem → provide more context and re-dispatch
2. Needs more reasoning → re-dispatch with more capable model
3. Task too large → break into smaller pieces
4. Plan is wrong → escalate to human

Never ignore an escalation or force the same model to retry without changes.

## Red Flags

**Never:**
- Start implementation on main/master without explicit user consent
- Skip spec compliance review OR code quality review
- Proceed with unfixed review issues
- Dispatch multiple implementation subagents in parallel (causes conflicts)
- Make the subagent read the plan file (paste the text instead)
- Skip scene-setting context
- Accept "close enough" on spec compliance
- Start code quality review before spec compliance is ✅
- Move to next task while either review has open issues

## Prompt Templates

- `./implementer-prompt.md` — Dispatch implementer subagent
- `./spec-reviewer-prompt.md` — Dispatch spec compliance reviewer
- `./code-quality-reviewer-prompt.md` — Dispatch code quality reviewer

## Integration

**Required before starting:**
- `using-git-worktrees` — Set up isolated workspace

**Creates the plan this skill executes:**
- `writing-plans`

**Subagents should use:**
- `test-driven-development` — For each implementation task

**After all tasks complete:**
- `finishing-a-development-branch`
