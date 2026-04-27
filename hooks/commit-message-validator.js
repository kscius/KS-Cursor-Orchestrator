#!/usr/bin/env node
/**
 * beforeShellExecution: validate conventional commit format on git commit commands.
 * Blocks commits with non-conventional messages and suggests the correct format.
 * Output: { permission: "allow" | "deny", ... }
 */

const CONVENTIONAL_RE = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?!?:\s.+/;

async function main() {
  let input = "";
  for await (const chunk of process.stdin) input += chunk;

  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    process.stdout.write(JSON.stringify({ permission: "allow" }) + "\n");
    return;
  }

  const command = payload.command || "";

  const commitMatch = command.match(/git\s+commit\s+(?:.*-m\s+)["'](.+?)["']/);
  if (!commitMatch) {
    process.stdout.write(JSON.stringify({ permission: "allow" }) + "\n");
    return;
  }

  const message = commitMatch[1].split("\n")[0];

  if (CONVENTIONAL_RE.test(message)) {
    process.stdout.write(JSON.stringify({ permission: "allow" }) + "\n");
    return;
  }

  process.stdout.write(
    JSON.stringify({
      permission: "deny",
      agent_message: `[commit-validator] Non-conventional commit message: "${message}". Use format: type(scope): description. Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert.`,
    }) + "\n"
  );
}

main().catch(() => process.stdout.write(JSON.stringify({ permission: "allow" }) + "\n"));
