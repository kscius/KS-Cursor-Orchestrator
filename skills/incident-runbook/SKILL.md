---
name: incident-runbook
description: Creates incident response runbooks for production systems — step-by-step guides for detecting, diagnosing, and resolving specific failure modes. Use when the user asks to create a runbook, write incident response procedures, document how to recover from an outage, or prepare on-call documentation. Also use after a post-mortem to capture prevention procedures.
---

# Incident Runbook

## Purpose

A runbook is a step-by-step operational guide for a specific type of incident. It answers:
- How do I know this is happening? (detection)
- Who needs to know? (escalation)
- What do I do right now? (immediate actions)
- How do I diagnose the root cause? (investigation)
- How do I fix it? (resolution steps)
- How do I confirm it's fixed? (verification)
- What do I do after? (follow-up)

## When to create a runbook

Create a runbook when:
- An incident type has occurred more than once
- Recovery requires non-obvious steps or specific credentials
- The fix requires multiple people or systems
- The on-call engineer may not have deep expertise in the affected area

## Process

### 1. Gather context

Ask the user (or infer from context):
- What service or component is this runbook for?
- What is the failure mode? (e.g., database connection exhausted, API returning 500s, job queue not processing)
- What alerts or signals indicate the problem?
- What are the immediate mitigation steps?
- What causes this failure? (known root causes)
- What is the resolution for each cause?

### 2. Check for existing runbooks

Look in: `docs/runbooks/`, `docs/operations/`, `runbooks/`, `.cursor/docs/`.
Follow existing naming and structure if present.

### 3. Write the runbook

---

## Runbook Template

```markdown
# Runbook: [Incident Name]

**Service:** [Name of affected service]  
**Severity:** SEV-1 (user-impacting, immediate) | SEV-2 (degraded, urgent) | SEV-3 (partial, normal hours)  
**Owner:** [Team or person responsible]  
**Last reviewed:** YYYY-MM-DD  

---

## Summary

[1–2 sentences: What failure does this runbook cover? What is the user-visible impact?]

---

## Detection

### Alerts
- Alert name: `[alert-name-in-monitoring]` — fires when [condition]
- Dashboard: [link to monitoring dashboard]

### Manual signals
- [Log pattern or metric that indicates the issue]
- [Customer complaint pattern that suggests this failure]

---

## Escalation

| Severity | Contact | When |
|----------|---------|------|
| SEV-1 | [Name/role] via [Slack/PagerDuty] | Immediately |
| SEV-2 | [Name/role] via [Slack] | Within 15 min |

---

## Immediate Actions (< 5 minutes)

1. **Acknowledge the alert** — prevent duplicate response
2. **Assess scope** — check [dashboard link] for affected users/requests
3. **Notify** — post in [#incident-channel]: "Investigating [issue] since [time]"
4. **Quick mitigation** (if available):
   - [Rollback command or action]
   - [Feature flag to disable]
   - [Traffic shift or failover command]

---

## Diagnosis

### Check 1: [Most common cause]

```bash
# Command to confirm or rule out this cause
[command]
```

Expected output if this IS the cause: `[output]`  
Expected output if this is NOT the cause: `[output]`

### Check 2: [Second most common cause]

```bash
[command]
```

### Check 3: [Third most common cause]

```bash
[command]
```

---

## Resolution

### Case A: [Root cause matching Check 1]

```bash
# Step 1: [action]
[command]

# Step 2: [action]
[command]

# Step 3: Verify resolution
[verification command]
```

Expected recovery time: [N minutes]

### Case B: [Root cause matching Check 2]

[steps]

### Unknown cause

1. Escalate to [team/person]
2. Preserve evidence: dump logs, take heap snapshot, capture state
3. Consider rollback if impact is SEV-1 and cause is unknown

---

## Verification

After resolution, confirm:
- [ ] [Metric or alert is back to normal] — check [dashboard link]
- [ ] [Affected users can perform the action again]
- [ ] [Error rate is < threshold] — confirm with: `[command or query]`

---

## Post-Incident

1. **Update incident channel** with resolution time and root cause (1 sentence)
2. **File a follow-up ticket** if root cause was not fully addressed
3. **Schedule post-mortem** for SEV-1 within 48 hours; SEV-2 within 1 week
4. **Update this runbook** if steps were inaccurate or missing

---

## Known issues / Gotchas

- [Thing that looks like this incident but isn't — how to tell the difference]
- [Command that seems right but causes a worse problem — avoid it]

---

## Related runbooks

- [Link to related runbook 1]
- [Link to related runbook 2]
```

---

## File naming convention

```
docs/runbooks/database-connection-exhausted.md
docs/runbooks/api-high-error-rate.md
docs/runbooks/job-queue-stalled.md
docs/runbooks/memory-leak-detected.md
```

Format: `[kebab-case-failure-mode].md`

## Quality checklist

- [ ] Commands are copy-pasteable and environment-specific (no placeholders left unfilled)
- [ ] Severity is accurately set
- [ ] Escalation contacts are current
- [ ] At least one "quick mitigation" listed (even if imperfect)
- [ ] Verification steps confirm the incident is actually resolved, not just the fix applied
- [ ] "Gotchas" section captures real lessons from previous incidents
- [ ] Last-reviewed date is set

## After writing

1. Present the draft for review
2. Ask: "Should I place this in `docs/runbooks/`?"
3. Write the file on confirmation
4. Optionally: link from monitoring dashboard or alert configuration
