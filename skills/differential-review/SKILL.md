# Differential Security Review Skill

Use this skill to perform a security-focused review of code changes (diffs). Invoke when reviewing pull requests, auditing a feature branch, or validating that a changeset does not introduce security regressions.

## Trigger phrases

- "review this diff for security"
- "security review of changes"
- "audit the PR"
- "check what changed for vulnerabilities"
- "differential security review"

## Skill instructions

### Step 1: Obtain the diff

Get the changeset to review via one of:

```bash
# Current working tree vs HEAD
git diff HEAD

# A specific branch vs main
git diff main...feature-branch

# A specific commit range
git diff <base-sha>..<head-sha>

# Staged changes only
git diff --cached
```

Or use the `github` MCP to fetch a PR diff directly.

### Step 2: Classify changed surfaces

For each changed file, classify the security surface:

| Surface | Scrutiny level |
|---------|---------------|
| Auth, sessions, tokens | **Critical** — review every line |
| Permission checks, RBAC | **Critical** — review every line |
| SQL queries, ORM | **High** — injection risk |
| File system access | **High** — path traversal risk |
| External API calls | **High** — SSRF, data exfiltration |
| User input handling | **High** — XSS, injection |
| Serialization/deserialization | **High** — object injection |
| Cryptography, hashing | **High** — weak algo risk |
| Config, env vars, secrets | **High** — exposure risk |
| Middleware, interceptors | **Medium** — bypass risk |
| Logging, error messages | **Medium** — information disclosure |
| Dependencies updated | **Medium** — supply chain risk |
| Tests only | **Low** — validate coverage |
| Documentation only | **Info** |

### Step 3: Security-focused diff review

For each high/critical surface change, evaluate:

**Authentication & Authorization**
- [ ] Are permission checks preserved in refactored code?
- [ ] Was any authentication check removed or weakened?
- [ ] Are new endpoints protected?
- [ ] Does the change widen access unintentionally?

**Injection**
- [ ] Is user input validated before use in queries/commands?
- [ ] Are parameterized queries used (not string concatenation)?
- [ ] Are template literals safe from injection?
- [ ] Is output encoded before rendering?

**Secrets & Credentials**
- [ ] No secrets, tokens, or keys added to code/config?
- [ ] Are new env var references documented?
- [ ] Are credentials handled via secure storage?

**Data Exposure**
- [ ] Does error handling avoid leaking stack traces/internals to users?
- [ ] Are new log statements free of PII/secrets?
- [ ] Does the API response expose only necessary fields?

**Dependencies**
- [ ] Are new dependencies well-maintained and not known-vulnerable?
- [ ] Are version pins appropriate?
- [ ] Are lockfile changes consistent with declared deps?

**Logic & Business Rules**
- [ ] Are edge cases handled (null, empty, overflow)?
- [ ] Does the change introduce time-of-check/time-of-use (TOCTOU) issues?
- [ ] Are transactions used where needed?

### Step 4: Run targeted static analysis

For changed files, run Semgrep on just the diff scope:

```bash
# Get list of changed files
CHANGED=$(git diff --name-only HEAD)

# Run semgrep on changed files only
semgrep --config p/security-audit --config p/secrets $CHANGED
```

Or invoke the `semgrep-audit` skill on the changed file set.

### Step 5: Report

Structure the report as:

```
## Differential Security Review

**Base:** <base ref>
**Head:** <head ref>
**Changed files:** N
**Security-relevant surfaces touched:** <list>

---

### Critical Issues (must fix before merge)
...

### High Issues (should fix before merge)
...

### Medium Issues (fix in follow-up)
...

### Positive Security Changes
(changes that improve security posture)
...

### Verdict

- [ ] **APPROVED** — no security concerns found
- [ ] **APPROVED WITH CONDITIONS** — minor issues to address
- [ ] **NEEDS CHANGES** — significant issues require remediation
- [ ] **BLOCKED** — critical security issues found
```

### Notes

- This skill draws from Trail of Bits' differential review methodology. Their full methodology (`methodology.md`, `adversarial.md`, `cognitive-biases.md`) documents an adversarial review mindset not included here.
- Key principle from ToB: review changes from an attacker's perspective, not a developer's perspective.
- Pay extra attention to: removed security controls, new code paths that bypass existing checks, and changes to error handling that might swallow security exceptions.
- For cryptographic changes, always consult a cryptography specialist.
