---
name: post-mortem
description: Writes blameless post-mortem documents after incidents, outages, or significant failures. Captures timeline, root cause, contributing factors, and action items. Use after an incident has been resolved, when the user asks to write a post-mortem, incident review, or retrospective after a production issue. Produces a structured document ready for team review.
---

# Blameless Post-Mortem

## Purpose

A post-mortem is a structured learning document produced after a significant incident. Its goals are:
- Understand what happened and why
- Identify systemic contributing factors (not blame individuals)
- Define concrete, prioritized action items to prevent recurrence
- Share learnings across the team

**Blameless principle:** The post-mortem focuses on systems, processes, and decisions — not on individual fault. Humans make mistakes; systems should be designed to catch them.

## When to write

Write a post-mortem when:
- A SEV-1 or SEV-2 incident occurred in production
- An outage or degradation affected users
- A significant near-miss was caught late in the process
- The team wants to learn from a complex or unexpected failure

## Process

### 1. Gather the incident facts

Ask the user (or infer from context):
- When did the incident start and end?
- What was the user-visible impact? (service down, degraded, data issue)
- Who detected it and how? (alert, user report, monitoring)
- What was the resolution?
- Timeline of key events (approximate times OK)

### 2. Check for existing format

Look in: `docs/post-mortems/`, `docs/incidents/`, `post-mortems/`. Follow existing format if present.

### 3. Write the post-mortem

---

## Post-Mortem Template

```markdown
# Post-Mortem: [Incident Title]

**Date of incident:** YYYY-MM-DD  
**Duration:** [e.g., 47 minutes]  
**Severity:** SEV-1 | SEV-2 | SEV-3  
**Status:** Draft | In Review | Final  
**Authors:** [Names or roles]  
**Reviewed by:** [Names or roles]

---

## Summary

[2–4 sentences: What happened? What was the user impact? What was the resolution?]

---

## Impact

| Dimension | Detail |
|-----------|--------|
| Duration | [HH:MM – HH:MM UTC] |
| Scope | [e.g., All users / Users in region X / Enterprise tier] |
| Users affected | [Estimated number or %] |
| Revenue impact | [If quantifiable] |
| SLO impact | [Error budget burned: X%] |

---

## Timeline

All times UTC.

| Time | Event |
|------|-------|
| HH:MM | [Deployment / change / event that started it] |
| HH:MM | [First sign of problem — alert, user report, monitoring] |
| HH:MM | [On-call paged] |
| HH:MM | [First investigation step] |
| HH:MM | [Hypothesis confirmed / ruled out] |
| HH:MM | [Mitigation applied] |
| HH:MM | [Incident declared resolved] |
| HH:MM | [Monitoring confirmed stable] |

---

## Root Cause

[1–3 sentences: The specific technical reason the incident occurred. Be precise.
Not "there was a bug" — but "the connection pool was configured with a max of 10 connections, which became exhausted under normal load after the new query pattern was deployed at HH:MM."]

---

## Contributing Factors

Factors that amplified the incident or slowed detection/recovery:

- **[Factor 1]:** [How it contributed]
- **[Factor 2]:** [How it contributed]
- **[Factor 3]:** [How it contributed]

Factors are systemic, not personal. Examples: missing alert, insufficient observability, complex manual recovery steps, lack of runbook, unclear on-call handoff.

---

## What Went Well

- [Thing that worked well — good alert, fast response, clear communication]
- [Thing that worked well]
- [Thing that worked well]

---

## What Could Have Been Better

- [Gap or missed step]
- [Gap or missed step]
- [Gap or missed step]

---

## Action Items

| # | Action | Owner | Priority | Due |
|---|--------|-------|----------|-----|
| 1 | [Specific, concrete action] | [Team/person] | P1 (critical) | YYYY-MM-DD |
| 2 | [Specific, concrete action] | [Team/person] | P2 (important) | YYYY-MM-DD |
| 3 | [Specific, concrete action] | [Team/person] | P3 (nice to have) | YYYY-MM-DD |

**Priority guidelines:**
- P1: Prevents recurrence of this exact incident; implement within 1 week
- P2: Reduces risk or improves detection; implement within 1 month
- P3: Systemic improvement; schedule in next quarter

**Action item quality bar — each must be:**
- Specific and actionable (not "improve monitoring")
- Assigned to an owner (person or team, not "we")
- Time-bounded
- Measurable: the team will know when it's done

---

## Lessons Learned

[2–5 key insights the team should carry forward. Write these as statements, not questions.

Example: "Our connection pool size was not reviewed during the migration to the new query pattern. Future migrations should include a review of connection pool configuration."]

---

## Follow-Up

- [ ] Action items created in [Linear / Jira / GitHub Issues]
- [ ] Runbook updated: `docs/runbooks/[filename].md`
- [ ] Alert added / modified: [alert name]
- [ ] Post-mortem shared in [#engineering / team channel]
```

---

## File naming convention

```
docs/post-mortems/2026-04-01-database-connection-exhausted.md
docs/post-mortems/2026-03-15-api-gateway-timeout-storm.md
```

Format: `YYYY-MM-DD-[kebab-case-incident-title].md`

## Quality checklist

- [ ] Root cause is specific (not "there was a bug" or "human error")
- [ ] Contributing factors are systemic (no blame on individuals)
- [ ] Action items are specific, assigned, and time-bounded
- [ ] Timeline is accurate (approximate is fine; label it)
- [ ] "What went well" section is genuine (prevents pure negativity)
- [ ] Linked to any updated runbooks or created alerts

## After writing

1. Present the draft for review — post-mortems are collaborative
2. Ask: "Should I create this at `docs/post-mortems/`?"
3. Suggest linking from the incident's Slack thread, Linear issue, or GitHub issue
4. If action items include runbook updates, offer to write those using the `incident-runbook` skill
