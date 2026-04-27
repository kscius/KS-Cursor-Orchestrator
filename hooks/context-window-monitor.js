#!/usr/bin/env node
/**
 * afterAgentResponse: estimate context usage and warn when approaching limits.
 * Tracks cumulative message sizes within a session to detect context pressure.
 * Output: { additional_context?: string }
 */
const fs = require("fs");
const path = require("path");

const STATE_DIR = path.join(
  process.env.USERPROFILE || process.env.HOME || ".",
  ".cursor", "hooks", "state"
);

const WARN_THRESHOLD_CHARS = 300000;
const CRITICAL_THRESHOLD_CHARS = 500000;

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

  const convId = payload.conversation_id || "default";
  const responseLen = (payload.agent_message || "").length;

  fs.mkdirSync(STATE_DIR, { recursive: true });
  const stateFile = path.join(STATE_DIR, `ctx-${convId.slice(0, 8)}.json`);

  let state = { totalChars: 0, messageCount: 0 };
  try {
    state = JSON.parse(fs.readFileSync(stateFile, "utf8"));
  } catch {}

  state.totalChars += responseLen;
  state.messageCount += 1;
  fs.writeFileSync(stateFile, JSON.stringify(state));

  if (state.totalChars > CRITICAL_THRESHOLD_CHARS) {
    process.stdout.write(
      JSON.stringify({
        additional_context:
          "[context-monitor] CRITICAL: estimated context usage is very high. Consider compacting or starting a new session to avoid degraded responses.",
      }) + "\n"
    );
  } else if (state.totalChars > WARN_THRESHOLD_CHARS) {
    process.stdout.write(
      JSON.stringify({
        additional_context:
          "[context-monitor] Context window is getting full. Consider wrapping up the current task or compacting soon.",
      }) + "\n"
    );
  } else {
    process.stdout.write("{}\n");
  }
}

main().catch(() => process.stdout.write("{}\n"));
