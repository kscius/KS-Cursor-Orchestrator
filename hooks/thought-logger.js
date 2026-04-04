#!/usr/bin/env node
/**
 * afterAgentThought: observability hook for agent reasoning.
 * - Logs thinking block summaries and duration
 * - Extracts key signals (decisions, tool choices, confidence) for observability
 * - Emits additional_context when the thought reveals a significant decision
 *   so the conversation can capture it before context compaction
 */
const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(
  process.env.USERPROFILE || process.env.HOME || ".",
  ".cursor",
  "hooks",
  "logs"
);
const LOG_FILE = path.join(LOG_DIR, "thought-log.jsonl");
const MAX_LOG_SIZE = 5 * 1024 * 1024;

/** Patterns that suggest the agent made a notable decision or discovery */
const DECISION_RE = /\b(?:i(?:'ll| will) (?:use|choose|go with|implement|apply|prefer)|(?:decided?|choosing|selected?) to|the (?:best|right|correct) (?:approach|solution|pattern) (?:here )?is|this (?:requires?|needs?) a|trade-?off|CAUTION|REWORK|APPROVED|escalat(?:e|ing)|block(?:er|ed)|classification[:\s]+(?:SIMPLE|STANDARD|COMPLEX))\b/i;

/** Patterns that indicate the agent found something risky or important */
const RISK_RE = /\b(?:security|vulnerability|credential|secret|token|password|migration|schema change|breaking change|data loss|irreversible|rollback|production|prod\b|auth(?:entication|orization))\b/i;

function rotateIfNeeded() {
  try {
    const stat = fs.statSync(LOG_FILE);
    if (stat.size > MAX_LOG_SIZE) {
      const backup = LOG_FILE + ".old";
      if (fs.existsSync(backup)) fs.unlinkSync(backup);
      fs.renameSync(LOG_FILE, backup);
    }
  } catch {}
}

/** Extract the first sentence that matches a pattern, up to 200 chars */
function extractSignal(text, pattern) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  for (const s of sentences) {
    if (pattern.test(s)) return s.slice(0, 200);
  }
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

  const text = payload.text || "";
  if (!text) {
    process.stdout.write("{}\n");
    return;
  }

  fs.mkdirSync(LOG_DIR, { recursive: true });
  rotateIfNeeded();

  const hasDecision = DECISION_RE.test(text);
  const hasRisk = RISK_RE.test(text);
  const signals = [];
  if (hasDecision) {
    const sig = extractSignal(text, DECISION_RE);
    if (sig) signals.push(`Decision signal: "${sig}"`);
  }
  if (hasRisk) {
    const sig = extractSignal(text, RISK_RE);
    if (sig) signals.push(`Risk signal: "${sig}"`);
  }

  const entry = {
    timestamp: new Date().toISOString(),
    conversation_id: payload.conversation_id || null,
    duration_ms: payload.duration_ms || 0,
    preview: text.slice(0, 300),
    length: text.length,
    has_decision: hasDecision,
    has_risk: hasRisk,
    signals,
  };
  fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n");

  /* Emit additional_context only for high-signal thoughts to avoid noise */
  if (signals.length > 0 && text.length > 500) {
    const hint = signals.map((s) => `[Thought] ${s}`).join(" | ");
    process.stdout.write(
      JSON.stringify({ additional_context: hint }) + "\n"
    );
    return;
  }

  process.stdout.write("{}\n");
}

main().catch(() => process.stdout.write("{}\n"));
