---
name: architecture-decision-record
description: Creates Architecture Decision Records (ADRs) to document significant technical decisions — why a choice was made, what alternatives were considered, and what tradeoffs were accepted. Use when making or documenting important architectural choices, selecting a framework or library, or when the user asks to document a decision, write an ADR, or record a technical choice.
---

# Architecture Decision Record (ADR)

## Purpose

Capture significant architectural decisions in a standardized format so future engineers understand:
- What was decided
- Why it was decided (context and forces)
- What alternatives were rejected and why
- What tradeoffs were accepted

## When to write an ADR

Write an ADR when the decision:
- Is difficult or costly to reverse
- Affects multiple components or teams
- Introduces a new dependency, pattern, or architectural boundary
- Will cause future engineers to ask "why did they do it this way?"

Skip ADRs for low-stakes, easily reversible, or purely stylistic choices.

## Process

### 1. Understand the decision context

Ask the user (or infer from context):
- What problem were you solving?
- What options did you consider?
- What constraints existed (time, team, compatibility, cost)?
- What did you choose, and what were you willing to give up?

### 2. Check for existing ADRs

Look in: `docs/adr/`, `docs/decisions/`, `adr/`, or wherever the repo stores them.
- If a directory exists, follow its naming convention
- If none exists, create `docs/adr/` and a `README.md` there explaining the convention

### 3. Determine the ADR number

Scan existing ADR files for the highest number, increment by 1. Use `0001`, `0002`, etc.

### 4. Write the ADR

Use the template below. Keep it brief and honest.

---

## ADR Template

```markdown
# ADR-[NUMBER]: [Short Title of Decision]

**Date:** YYYY-MM-DD  
**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-[NUMBER]  
**Deciders:** [Names or roles involved]

---

## Context

[2–4 sentences: What is the situation? What problem or opportunity prompted this decision? What constraints existed?]

## Decision

[1–3 sentences: What was decided? Be specific and concrete.]

## Rationale

[Why this option over the alternatives? Key technical, organizational, or strategic reasons.]

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| [Option A]  | [Reason]    |
| [Option B]  | [Reason]    |

## Consequences

**Positive:**
- [Benefit 1]
- [Benefit 2]

**Negative / Tradeoffs:**
- [Accepted cost or limitation 1]
- [Accepted cost or limitation 2]

**Risks:**
- [What could go wrong, and how it would be mitigated]

## Related Decisions

- ADR-[NUMBER]: [Title] — [how it relates]

---

*This decision was made by [team/person] on [date]. Questions: [contact or link].*
```

---

## File naming convention

```
docs/adr/0001-use-postgresql-over-mysql.md
docs/adr/0002-adopt-nextjs-app-router.md
docs/adr/0003-replace-redux-with-zustand.md
```

Format: `[4-digit number]-[kebab-case-short-title].md`

## Status lifecycle

- **Proposed** — Under discussion, not yet implemented
- **Accepted** — Decision made, being or will be implemented
- **Deprecated** — Was accepted but no longer applies (note why)
- **Superseded by ADR-[NUMBER]** — A newer ADR replaced this decision

When superseding an ADR, update the old one's status and add a "Superseded by" note.

## Quality checklist

- [ ] Context section explains WHY the decision was needed (not just what was done)
- [ ] Alternatives were actually considered (not retroactively invented)
- [ ] Consequences section is honest about tradeoffs (not just upsides)
- [ ] Status is set correctly
- [ ] File placed in the repo's ADR directory and follows naming convention
- [ ] Linked from any relevant code comments or PR description

## Output

After writing the ADR:
1. Present the draft for review
2. Ask: "Should I place this in `docs/adr/` and create the directory if it doesn't exist?"
3. Write the file on confirmation
4. Optionally: add a one-line code comment linking to the ADR at the decision point in code
