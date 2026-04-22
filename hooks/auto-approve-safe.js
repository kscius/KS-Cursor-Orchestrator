#!/usr/bin/env node
/**
 * auto-approve-safe.js — beforeShellExecution hook
 *
 * Auto-approves a curated allowlist of safe, read-only, and dev-server
 * shell commands without surfacing a confirmation prompt to the user.
 *
 * Only allows commands that are purely observational or standard dev tasks.
 * Does NOT approve anything in the dangerous patterns list from block-dangerous-shell.js.
 *
 * Returns:
 *   { permission: "allow" }  — safe command, approve silently
 *   { permission: "ask" }    — not on allowlist, pass to next hook/user
 */

'use strict';

// ─── SAFE COMMANDS ALLOWLIST ────────────────────────────────────────────────
// Exact command prefixes or full commands that are safe to auto-approve.
// Only read-only, observational, or standard dev-server operations.
const SAFE_PREFIXES = [
  // Navigation and inspection
  'ls', 'dir', 'cat ', 'head ', 'tail ', 'echo ', 'pwd', 'whoami', 'hostname',
  'which ', 'where ', 'type ', 'file ',

  // Git read operations
  'git status', 'git log', 'git diff', 'git show', 'git branch',
  'git remote', 'git stash list', 'git tag', 'git fetch --dry-run',
  'git describe', 'git rev-parse', 'git ls-files',

  // Node / npm / pnpm / yarn — dev and test only
  'npm run dev', 'npm run start', 'npm test', 'npm run test',
  'npm run lint', 'npm run build', 'npm run typecheck', 'npm run type-check',
  'npm ls', 'npm outdated', 'npm audit',
  'pnpm dev', 'pnpm start', 'pnpm test', 'pnpm run', 'pnpm ls',
  'yarn dev', 'yarn start', 'yarn test', 'yarn run', 'yarn list',
  'npx tsc', 'npx eslint', 'npx jest', 'npx vitest',

  // TypeScript / linting
  'tsc ', 'tsc --', 'eslint ',

  // Python
  'python ', 'python3 ', 'pip list', 'pip show', 'pip check',
  'pytest --collect-only', 'pytest -v', 'pytest ',
  'poetry show', 'poetry env info',

  // Rust
  'cargo check', 'cargo test', 'cargo clippy', 'cargo fmt --check',
  'cargo build', 'cargo run', 'rustfmt ',

  // Go
  'go vet', 'go test', 'go build', 'go fmt', 'go list', 'go env',

  // Ruby
  'bundle exec', 'rubocop ', 'rspec ',

  // Shell utilities — read-only
  'curl -I', 'curl --head', 'curl -s', 'curl -X GET',
  'ping ', 'traceroute ', 'nslookup ', 'dig ',
  'find . ', 'find ./', 'grep ', 'rg ', 'ripgrep ',
  'wc ', 'sort ', 'uniq ', 'awk ', 'sed -n',
  'jq ', 'yq ',

  // System info
  'df ', 'du ', 'ps ', 'top -', 'htop', 'lsof ',
  'uname ', 'env', 'printenv',

  // Docker — read-only
  'docker ps', 'docker images', 'docker logs', 'docker inspect',
  'docker stats', 'docker info', 'docker version', 'docker compose ps',
  'docker compose logs', 'docker compose config',

  // Kubernetes — read-only
  'kubectl get', 'kubectl describe', 'kubectl logs', 'kubectl explain',
  'kubectl version', 'kubectl config', 'kubectl cluster-info',

  // Terraform — read-only
  'terraform validate', 'terraform plan', 'terraform show', 'terraform state list',

  // Testing tools
  'jest ', 'vitest ', 'mocha ', 'jasmine ',
];

// ─── BLOCKED PATTERNS (mirror of block-dangerous-shell.js) ──────────────────
// If ANY of these match, we return "ask" (let the existing blocker handle it).
const BLOCKED_PATTERNS = [
  /rm\s+-rf?\s/i,
  />\s*\/dev\/sd[a-z]/i,
  /mkfs\./i,
  /dd\s+if=/i,
  /:\(\)\{.*\}/,           // fork bomb
  /curl.*\|\s*bash/i,
  /wget.*\|\s*bash/i,
  /curl.*\|\s*sh/i,
  /npm\s+publish/i,
  /yarn\s+publish/i,
  /pnpm\s+publish/i,
  /git\s+push\s+.*--force/i,
  /git\s+push\s+origin\s+main/i,
  /git\s+push\s+origin\s+master/i,
  /sudo\s+rm/i,
  /chmod\s+777/i,
  /chown\s+-R\s+.*\s+\//i,
  /DROP\s+TABLE/i,
  /DROP\s+DATABASE/i,
  /TRUNCATE/i,
];

// ─── HOOK ENTRYPOINT ────────────────────────────────────────────────────────
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(input);
    const result = evaluate(payload);
    process.stdout.write(JSON.stringify(result));
  } catch {
    // On parse error, pass through (ask)
    process.stdout.write(JSON.stringify({ permission: 'ask' }));
  }
});

function evaluate(payload) {
  const command = (payload.command || payload.cmd || '').trim();

  if (!command) {
    return { permission: 'ask' };
  }

  // Never auto-approve if it matches any dangerous pattern
  if (BLOCKED_PATTERNS.some((p) => p.test(command))) {
    return { permission: 'ask' };
  }

  // Check against safe prefixes
  const lowerCmd = command.toLowerCase();
  const isSafe = SAFE_PREFIXES.some((prefix) =>
    lowerCmd === prefix.trim() || lowerCmd.startsWith(prefix.toLowerCase())
  );

  if (isSafe) {
    return { permission: 'allow' };
  }

  // Not on allowlist — let the user decide (or next hook handle it)
  return { permission: 'ask' };
}
