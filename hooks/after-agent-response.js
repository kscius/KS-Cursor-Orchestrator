#!/usr/bin/env node
/**
 * afterAgentResponse: deterministic signals only (secrets / placeholders).
 * Claim-without-evidence checks removed (high false-positive rate vs token cost).
 */
const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(
  process.env.USERPROFILE || process.env.HOME || ".",
  ".cursor",
  "hooks",
  "logs"
);
const QUALITY_LOG = path.join(LOG_DIR, "response-quality.jsonl");
const MAX_LOG_BYTES = 5 * 1024 * 1024;

function rotateIfNeeded() {
  try {
    const stat = fs.statSync(QUALITY_LOG);
    if (stat.size > MAX_LOG_BYTES) {
      const backup = QUALITY_LOG + ".old";
      if (fs.existsSync(backup)) fs.unlinkSync(backup);
      fs.renameSync(QUALITY_LOG, backup);
    }
  } catch {}
}

const PLACEHOLDER_RE = /\b(?:lorem\s+ipsum|todo:\s*fixme|fixme:|xxx\b)\b/i;

const SECRET_IN_TEXT_RE = /['"]sk-[a-zA-Z0-9]{20,}['"]|ghp_[a-zA-Z0-9]{36,}/;

function analyze(text) {
  const flags = [];
  if (!text || typeof text !== "string") {
    return flags;
  }

  if (SECRET_IN_TEXT_RE.test(text)) {
    flags.push("possible_secret_in_assistant_text");
  }

  if (PLACEHOLDER_RE.test(text)) {
    flags.push("placeholder_or_todo_language");
  }

  return flags;
}

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

  const text = payload.text || "";
  const flags = analyze(text);

  if (flags.length > 0) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    rotateIfNeeded();
    const entry = {
      timestamp: new Date().toISOString(),
      hook_event_name: payload.hook_event_name || "afterAgentResponse",
      conversation_id: payload.conversation_id || null,
      flags,
      text_preview: text.slice(0, 400),
    };
    fs.appendFileSync(QUALITY_LOG, JSON.stringify(entry) + "\n");
  }

  const followup = buildFollowupMessage(flags);
  if (followup) {
    process.stdout.write(
      JSON.stringify({ followup_message: followup }) + "\n"
    );
  } else {
    process.stdout.write("{}\n");
  }
}

/** @param {string[]} flags */
function buildFollowupMessage(flags) {
  if (!flags.length) return "";
  const parts = [];
  if (flags.includes("placeholder_or_todo_language")) {
    parts.push(
      "Quality check: placeholder or TODO-style wording detected—replace with real content or mark explicitly as temporary."
    );
  }
  if (flags.includes("possible_secret_in_assistant_text")) {
    parts.push(
      "Security check: assistant text may resemble a token or secret—verify nothing sensitive was echoed; rotate credentials if exposed."
    );
  }
  return parts.join(" ");
}

main().catch(() => {
  process.stdout.write("{}\n");
});
