---
name: spec-driven-development
description: Create machine-readable technical specs before implementing non-trivial features, APIs, or refactors. Use before BUILD phase when PLAN is STANDARD/COMPLEX and precise typed contracts, behavioral invariants, and example pairs are needed for validation. Triggers on "write a spec", "spec-first", "define the contract".
---

> **On-demand loading**: This skill is loaded only when explicitly invoked. It is not active by default.

# Spec-Driven Development Skill

Use this skill before implementing any non-trivial feature, refactor, or API to create a machine-readable technical spec that the agent and reviewer can validate against.

Triggers: "write a spec for", "spec-first", "design before coding", "define the contract", "spec this out", or when PLAN classification is STANDARD/COMPLEX and brainstorming + PRD alone are insufficient technical precision.

---

## What this skill produces

A **technical spec document** — not a PRD, not a plan, not pseudocode. A spec defines:
- **Exact function/class/API signatures** with typed parameters and return values
- **Behavioral contracts**: what it guarantees (invariants) and what it assumes (preconditions)
- **Edge cases and failure modes** with expected behavior for each
- **Data shapes**: input/output schemas with example payloads
- **Test cases as examples**: 3–5 concrete in/out pairs that define the expected behavior

---

## Step 1 — Define the subject

State precisely what you are specifying:
- A single function? An HTTP endpoint? A React component? A service class? A database schema?
- What layer does it live in (UI / API / service / data / infra)?
- What are the inputs and outputs at the boundary?

If you don't know the boundary yet — STOP and use `brainstorming` or `requirements-gathering` first.

---

## Step 2 — Write the signatures

Produce typed signatures for every public-facing interface:

**For functions / methods:**
```typescript
// What it does (one line)
function doThing(input: InputType, options?: OptionsType): Promise<OutputType>

// Throws:
// - ValidationError when input.field is missing or invalid
// - NotFoundError when resource does not exist
```

**For HTTP endpoints:**
```
POST /api/resource
Request:  { field: string; amount: number }
Response: { id: string; status: "created" }
Errors:   400 (validation), 409 (conflict), 500 (unexpected)
```

**For React components:**
```typescript
interface Props {
  items: Item[]          // must be non-empty array
  onSelect: (id: string) => void
  isLoading?: boolean    // default false — renders skeleton when true
}
```

---

## Step 3 — Define behavioral contracts

Write the invariants: things that MUST always be true.

```
INVARIANTS:
- Result.total always equals sum(Result.items[*].amount)
- Returned list is always sorted by createdAt desc
- Operation is idempotent: calling twice with same ID produces same result

PRECONDITIONS (caller must guarantee):
- userId is a valid UUID (not validated here, caller's responsibility)
- amount > 0

POSTCONDITIONS (this function guarantees):
- Database write is atomic — either all fields saved or none
- Email notification sent only when status transitions to "confirmed"
```

---

## Step 4 — Enumerate edge cases

List every non-happy-path scenario with expected behavior:

| Input condition | Expected behavior |
| --------------- | ----------------- |
| Empty array | Returns `[]`, does not throw |
| item.amount = 0 | Throws `ValidationError("amount must be > 0")` |
| Network timeout | Retries up to 3 times, throws `NetworkError` after |
| Duplicate ID | Returns existing record, does not create duplicate |
| Missing optional field | Uses default value documented in signature |

---

## Step 5 — Write example pairs (executable contracts)

These become your test cases. Write 3–5 concrete examples:

```
Example 1 — happy path:
  Input:  { userId: "u_123", amount: 50 }
  Output: { id: "t_789", status: "pending", amount: 50 }

Example 2 — validation failure:
  Input:  { userId: "u_123", amount: -1 }
  Output: throws ValidationError("amount must be positive")

Example 3 — idempotency:
  Input:  { idempotencyKey: "k_abc", amount: 50 } (called twice)
  Output: same { id: "t_789" } returned both times, one DB row created

Example 4 — not found:
  Input:  { userId: "u_nonexistent", amount: 50 }
  Output: throws NotFoundError("user u_nonexistent not found")
```

---

## Step 6 — State what is explicitly out of scope

List what this spec does NOT cover:

```
OUT OF SCOPE:
- Authorization / permission checks (handled by middleware, not this function)
- Rate limiting (handled at API gateway layer)
- Logging (handled by caller or aspect)
- UI presentation (separate component spec)
```

---

## Step 7 — Produce the spec document

Combine everything into a structured spec block to paste into the implementation context:

```markdown
## Spec: [Name]

**Subject**: [what is being specified]
**Layer**: [UI | API | service | data | infra]
**Owner**: [file/module path where this will live]

### Signatures
[paste from Step 2]

### Contracts
[paste from Step 3]

### Edge Cases
[paste from Step 4 — table format]

### Examples
[paste from Step 5]

### Out of Scope
[paste from Step 6]

### Acceptance Criteria
- [ ] All examples produce expected outputs
- [ ] All edge cases handled per table
- [ ] All invariants verified in tests
- [ ] No behavior outside this spec is implemented
```

---

## When to hand off to BUILD

Hand off to the `ship-feature` or `build-full` skill only when:
- All signatures are typed and complete
- At least 3 example pairs are written
- Edge cases table covers at least the empty input, invalid input, and not-found scenarios
- Out of scope section explicitly lists at least 2 items

The spec becomes the binding contract for implementation and review.
