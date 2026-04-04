---
name: reducing-entropy
description: Simplify and consolidate code without changing behavior. Use when the task involves removing duplication, reducing complexity, consolidating near-identical implementations, or shrinking code paths while preserving all required behavior.
---

> **On-demand loading**: This skill is loaded only when explicitly invoked. It is not active by default.

# Reducing Entropy

Simplify and consolidate code without changing behavior. Use when the best safe solution includes reducing duplication, lowering complexity, or shrinking code paths — and the change improves maintainability without altering required behavior.

## When to apply this skill

Invoke when:
- Multiple functions/modules do the same or very similar thing
- A simpler equivalent implementation exists for the stated requirement
- Code complexity (cyclomatic complexity, nesting depth) is high without benefit
- The task can be completed with fewer lines/files than currently exist
- Consolidating duplicate logic would make the change safer or more coherent

Do NOT apply when:
- The "simpler" version would change observable behavior
- The duplication is intentional (different contexts require different behavior)
- Scope fidelity requires preserving the existing structure
- The change would violate a contract (API shape, type interface)

## Execution process

### Step 1: Inventory the duplication/complexity
- Identify all instances of the pattern (use grep/search, not assumptions)
- Confirm they are truly equivalent (same behavior, same contracts)
- Note what differs between instances (if anything)

### Step 2: Determine the minimum safe consolidation
- What is the smallest change that eliminates the duplication?
- Will the consolidated version handle all use cases the duplicates handled?
- Is there any caller that depends on the current file/function name? (breaking change risk)

### Step 3: Implement
- Extract the shared logic to a single well-named location
- Update all call sites
- Remove the now-redundant duplicates
- Do NOT change behavior — if behavior changes are also needed, do them separately

### Step 4: Verify
- All call sites still work correctly
- No behavior was changed (tests pass with same assertions)
- The resulting code is actually simpler to read and understand

## Common patterns

### Consolidating duplicate utilities
```typescript
// Before: utils-a.ts and utils-b.ts both have formatDate()
// After: shared/formatDate.ts used by both

// Before
function formatDateA(d: Date) { return d.toISOString().split('T')[0]; }
function formatDateB(d: Date) { return d.toISOString().split('T')[0]; }

// After — one function, two imports
export function formatDate(d: Date) { return d.toISOString().split('T')[0]; }
```

### Reducing nesting complexity
```typescript
// Before: deep nesting
function process(input) {
  if (input) {
    if (input.valid) {
      if (input.items.length > 0) {
        return input.items.map(transform);
      }
    }
  }
  return [];
}

// After: early returns reduce nesting
function process(input) {
  if (!input || !input.valid) return [];
  if (input.items.length === 0) return [];
  return input.items.map(transform);
}
```

### Merging near-identical handlers
```typescript
// Before: two endpoints with 90% identical logic
// After: one handler with a parameter for the difference
```

## Constraints
- Never sacrifice readability for line count
- Shared utilities must have better names than their duplicates
- Consolidation must not create unwanted coupling between unrelated modules
- If in doubt, preserve the existing structure
