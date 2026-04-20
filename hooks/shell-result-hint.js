#!/usr/bin/env node
/**
 * afterShellExecution: deterministic hints from exit code + output (no LLM).
 * Emits additional_context only on failure or when concise stats are extracted.
 */
function collectOutput(payload) {
  const parts = [];
  const keys = ["stderr", "stdout", "output", "combined_output", "result"];
  for (const k of keys) {
    const v = payload[k];
    if (typeof v === "string" && v.trim()) parts.push(v);
  }
  if (payload.tool_output && typeof payload.tool_output === "object") {
    const o = payload.tool_output;
    for (const k of keys) {
      if (typeof o[k] === "string" && o[k].trim()) parts.push(o[k]);
    }
  }
  return parts.join("\n");
}

function exitCode(payload) {
  const v =
    payload.exit_code ??
    payload.exitCode ??
    payload.code ??
    (payload.result && payload.result.exit_code);
  if (v === undefined || v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function tailLines(text, maxLines) {
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length <= maxLines) return lines.join("\n");
  return lines.slice(-maxLines).join("\n");
}

function pickErrorSlice(text) {
  const errLines = [];
  const lines = text.split(/\r?\n/);
  const hot = /error:|Error:|ERROR|failed|FAILED|AssertionError|✖|FAIL\s| npm ERR!|fatal:|exception/i;
  for (let i = 0; i < lines.length; i++) {
    if (hot.test(lines[i])) {
      errLines.push(...lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 12)));
      break;
    }
  }
  const body = errLines.length > 0 ? errLines.join("\n") : tailLines(text, 25);
  return body.slice(0, 4500);
}

function summarizeTestsOk(text) {
  const m =
    text.match(/(\d+)\s+(passed|tests?\s+passed)/i) ||
    text.match(/Tests:\s*(\d+)\s+passed/i) ||
    text.match(/(\d+)\s+passing/i);
  if (m) return `Tests OK signal: ${m[0].slice(0, 120)}`;
  return null;
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

  const code = exitCode(payload);
  const text = collectOutput(payload);
  const cmd = payload.command || payload.shell_command || "";

  if (code !== null && code !== 0) {
    const slice = text ? pickErrorSlice(text) : "(no output captured)";
    process.stdout.write(
      JSON.stringify({
        additional_context: `[shell-result] exit=${code} cmd=${cmd.slice(0, 200)}\n${slice}`,
      }) + "\n"
    );
    return;
  }

  if (code === 0 && text && /\b(jest|vitest|pytest|mocha)\b/i.test(cmd)) {
    const sum = summarizeTestsOk(text);
    if (sum) {
      process.stdout.write(
        JSON.stringify({
          additional_context: `[shell-result] ${sum}`,
        }) + "\n"
      );
      return;
    }
  }

  process.stdout.write("{}\n");
}

main().catch(() => process.stdout.write("{}\n"));
