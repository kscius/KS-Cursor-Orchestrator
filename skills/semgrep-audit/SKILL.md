# Semgrep Audit Skill

Use this skill to perform static analysis security auditing using Semgrep. Invoke when the user asks for a security scan, static analysis, vulnerability audit, or when touching security-sensitive code surfaces.

## Trigger phrases

- "run semgrep"
- "static analysis"
- "security scan"
- "audit for vulnerabilities"
- "check for security issues"

## Skill instructions

When this skill is invoked:

### Step 1: Determine scope

Read the user's request to identify:
- Target paths (default: current workspace)
- Ruleset to use (default: `auto`)
- Language/framework context
- Severity threshold (default: WARNING and above)

### Step 2: Check Semgrep availability

Verify Semgrep is available via one of:
1. The `semgrep` MCP server (preferred — use `semgrep_scan` tool)
2. Local `semgrep` CLI via Bash
3. Docker: `docker run --rm -v $(pwd):/src semgrep/semgrep semgrep scan --config auto /src`

### Step 3: Select rulesets

Choose rulesets based on context:

| Context | Recommended rulesets |
|---------|---------------------|
| General security | `p/owasp-top-ten`, `p/security-audit` |
| Secrets detection | `p/secrets` |
| JavaScript/TypeScript | `p/javascript`, `p/typescript`, `p/nodejs` |
| Python | `p/python`, `p/flask`, `p/django` |
| Ruby/Rails | `p/ruby`, `p/rails` |
| Go | `p/golang` |
| Java | `p/java`, `p/spring` |
| PHP | `p/php` |
| Full audit | `p/default` |

### Step 4: Execute scan

Using the `semgrep` MCP tool (preferred):
```
Use semgrep MCP server → semgrep_scan with appropriate config
```

Using CLI fallback:
```bash
semgrep --config p/owasp-top-ten --config p/secrets --json --output semgrep-results.json .
```

### Step 5: Analyze results

Delegate finding analysis to the `semgrep-scanner` subagent, or process inline:

For each finding:
1. Record: severity, rule ID, file path, line number, message
2. Read surrounding code context (±10 lines)
3. Assess: is this a true positive or false positive?
4. Note: is the finding in test code?
5. Identify: what is the remediation?

### Step 6: Report findings

Structure the output as:

```
## Semgrep Audit Results

**Scan target:** <path>
**Rulesets:** <rulesets used>
**Total findings:** N (X critical, Y high, Z medium, W low)

---

### Critical / High Findings

#### [RULE-ID] Brief title
**File:** path/to/file.ts:LINE
**Severity:** HIGH
**Description:** What the vulnerability is and why it matters.
**Code:**
```<lang>
// relevant code snippet
```
**Remediation:** How to fix it.

---

### Medium Findings
...

### Low / Informational
...

### False Positives Excluded
...

## Summary

Key risks identified:
- ...

Recommended immediate actions:
1. ...
```

### Step 7: Prioritize

Highlight findings that:
- Are reachable from user-controlled input
- Affect authentication, authorization, or secrets
- Are exploitable without authentication
- Affect data at rest or in transit

### Notes

- The Trail of Bits version of this skill references companion docs (`methodology.md`, `adversarial.md`) from their internal repository. Those are not included here but the core scanning workflow is fully functional.
- For supply chain security, add `p/supply-chain` to the ruleset.
- Suppress known false positives with `# nosemgrep: rule-id` in source code.
- For CI integration: `semgrep --config auto --error` (exit 1 on findings).
