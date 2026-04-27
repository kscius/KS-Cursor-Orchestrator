#!/usr/bin/env node
/**
 * postToolUse: inject additional_context after successful tool calls.
 * - After Shell: remind about test verification when build/install commands succeed
 * - After Write/StrReplace: remind to check lints on edited files
 * - After Task (subagent): remind to check subagent output contract
 * - Output: { additional_context?: string }
 */

const INSTALL_CMD_RE = /\b(npm install|yarn add|pnpm add|pip install|cargo add|gem install|composer require|dotnet add|go get)\b/i;
const BUILD_CMD_RE = /\b(npm run build|yarn build|pnpm build|cargo build|go build|make build|dotnet build)\b/i;
const MIGRATION_CMD_RE = /\b(migrate|prisma|knex|typeorm|sequelize|alembic|django.*migrate)\b/i;

async function main() {
  let input = "";
  for await (const chunk of process.stdin) input += chunk;

  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    process.stdout.write("{}\n");
    return;
  }

  const toolName = payload.tool_name || "";
  const toolInput = JSON.stringify(payload.tool_input || {});
  const hints = [];

  if (toolName === "Shell") {
    if (INSTALL_CMD_RE.test(toolInput)) {
      hints.push("Dependencies changed — verify lockfile is committed and tests still pass.");
    }
    if (BUILD_CMD_RE.test(toolInput)) {
      hints.push("Build succeeded — run targeted tests before marking done.");
    }
    if (MIGRATION_CMD_RE.test(toolInput)) {
      hints.push("Migration command detected — verify schema state and app health.");
    }
  }

  if (toolName === "Write" || toolName === "StrReplace") {
    hints.push("File edited — run ReadLints on changed files.");
  }

  if (toolName === "Task") {
    hints.push("Subagent completed — verify Status/Verdict in output before advancing phase.");
  }

  if (hints.length > 0) {
    process.stdout.write(
      JSON.stringify({ additional_context: `[post-tool] ${hints.join(" ")}` }) + "\n"
    );
  } else {
    process.stdout.write("{}\n");
  }
}

main().catch(() => process.stdout.write("{}\n"));
