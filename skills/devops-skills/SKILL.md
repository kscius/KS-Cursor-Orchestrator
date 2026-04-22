# DevOps Skills

Use this skill when performing infrastructure-as-code validation, deployment pipeline review, container orchestration operations, or cloud infrastructure change management. Wraps common DevOps validation patterns into a unified workflow.

## Trigger phrases

- "validate infrastructure"
- "review terraform plan"
- "validate docker-compose"
- "dry-run kubernetes"
- "lint CI pipeline"
- "devops review"
- "infrastructure check"
- "/devops-validate"

## Skill instructions

This skill provides a menu of DevOps validation patterns. Select the relevant pattern(s) based on the task.

---

### Pattern 1: Terraform Plan Review

**When to use:** Before applying any Terraform changes.

**Steps:**

1. Check the workspace is initialized:
```bash
terraform init -backend=false
```

2. Validate configuration syntax:
```bash
terraform validate
```

3. Run plan with output:
```bash
terraform plan -out=tfplan.binary
terraform show -json tfplan.binary > tfplan.json
```

4. Review the plan for:
- **Destroys** (⚠️ `"-"` actions): Any resource destruction should be intentional
- **Replacements** (`"-/+"` actions): Forces recreation — check if data will be lost
- **Sensitive changes**: Secrets, credentials, encryption keys
- **Provider version changes**: Breaking changes possible
- **Count/for_each changes**: Index shifts can cause unexpected replacements

5. For large plans, use `jq` to filter:
```bash
# Show only destructive changes
cat tfplan.json | jq '.resource_changes[] | select(.change.actions | contains(["delete"]))'

# Count by action type
cat tfplan.json | jq '[.resource_changes[].change.actions[]] | group_by(.) | map({action: .[0], count: length})'
```

6. Run static analysis:
```bash
# tfsec for security issues
tfsec .

# tflint for best practices
tflint --recursive

# Checkov for compliance
checkov -d .
```

**Checklist before `terraform apply`:**
- [ ] Plan reviewed line by line for destructive changes
- [ ] State file backed up (for risky applies)
- [ ] Staging environment tested first
- [ ] Change window scheduled for production
- [ ] Rollback plan documented

---

### Pattern 2: Docker Compose Validation

**When to use:** Before deploying or updating Docker Compose services.

**Steps:**

1. Validate syntax:
```bash
docker compose config
```

2. Check for issues:
```bash
# Verify all referenced images exist or can be pulled
docker compose pull --dry-run 2>&1

# Check for port conflicts on host
docker compose config | grep -A2 "ports:"
```

3. Review for security issues:
```bash
# Check for privileged containers
grep -n "privileged: true" docker-compose*.yml

# Check for host network mode
grep -n "network_mode: host" docker-compose*.yml

# Check for host volume mounts (sensitive paths)
grep -n ":/etc\|:/var/run\|:/root\|:/home" docker-compose*.yml

# Check for root user
grep -n "user:" docker-compose*.yml
```

4. Validate health checks are defined for critical services:
```bash
docker compose config | grep -A5 "healthcheck:"
```

5. Test with dry-run:
```bash
docker compose up --dry-run
```

**Checklist before deploy:**
- [ ] All images pinned to specific tags or digests
- [ ] Health checks defined on all services
- [ ] Secrets via environment/secrets (not hardcoded values)
- [ ] Resource limits set (memory, CPU)
- [ ] No unnecessary privileged containers

---

### Pattern 3: Kubernetes Dry-Run

**When to use:** Before applying Kubernetes manifests.

**Steps:**

1. Validate manifest syntax:
```bash
kubectl apply --dry-run=client -f manifests/
```

2. Server-side dry-run (checks against cluster state):
```bash
kubectl apply --dry-run=server -f manifests/
```

3. Diff against current state:
```bash
kubectl diff -f manifests/
```

4. Check for security issues:
```bash
# Using kubesec
kubesec scan manifests/*.yaml

# Using Checkov
checkov -d manifests/ --framework kubernetes

# Using polaris
polaris audit --audit-path manifests/
```

5. Review resource requests/limits:
```bash
kubectl apply --dry-run=client -f manifests/ -o json | \
  jq '.items[] | select(.kind == "Deployment") | 
  {name: .metadata.name, 
   containers: [.spec.template.spec.containers[] | 
   {name: .name, requests: .resources.requests, limits: .resources.limits}]}'
```

**Checklist before `kubectl apply`:**
- [ ] Dry-run passed without errors
- [ ] Resource requests/limits set on all containers
- [ ] Non-root user configured in security context
- [ ] Read-only root filesystem where possible
- [ ] Network policies restrict unnecessary traffic
- [ ] Images pinned to digest

---

### Pattern 4: CI Pipeline Lint

**When to use:** Before merging changes to CI/CD pipeline configuration.

**GitHub Actions:**
```bash
# actionlint
actionlint .github/workflows/*.yml

# Check for secrets in workflow files
grep -rn "token\|key\|password\|secret" .github/workflows/ | grep -v "secrets\." | grep -v "env\."
```

**GitLab CI:**
```bash
# GitLab CI lint via API
curl --header "Content-Type: application/json" \
  "https://gitlab.com/api/v4/ci/lint" \
  --data "$(jq -Rs '{content: .}' < .gitlab-ci.yml)"
```

**Checklist for CI pipelines:**
- [ ] No secrets hardcoded in YAML
- [ ] Third-party Actions pinned to SHA (not tag)
- [ ] Minimal permissions (`permissions:` block set)
- [ ] `pull_request` triggers limit token scope
- [ ] Cache paths exclude sensitive files
- [ ] Artifacts don't include credentials

---

### Pattern 5: Infrastructure Security Baseline

**When to use:** Periodic security posture check of infrastructure configuration.

Run these checks in sequence:
1. Terraform static analysis: `tfsec .` or `checkov -d .`
2. Container image scan: `trivy image <image-name>` or `grype <image-name>`
3. Kubernetes CIS benchmark: `kube-bench run`
4. Secrets scan: `trufflesecurity/trufflehog filesystem --directory .`

Report format:
```
## Infrastructure Security Baseline

**Date:** <date>
**Scope:** <what was scanned>

### Critical Issues
...

### High Issues
...

### Remediation Priority
1. <highest risk item>
2. ...
```

---

### Notes

- This skill is based on patterns from `akin-ozer/cc-devops-skills`, distilled into a Cursor-compatible single skill.
- Always prefer dry-run and plan modes before any destructive apply.
- For production changes, document the rollback procedure before starting.
- Pair this skill with `differential-review` when reviewing infrastructure code changes.
