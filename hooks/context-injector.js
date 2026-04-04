#!/usr/bin/env node
/**
 * sessionStart hook: inject rich project context at the start of each session.
 * Returns additional_context with: active project stack, key rules reminder,
 * and any in-progress work from .cursor/plans/.
 *
 * This supplements session-context.js (which captures git/stack info) with
 * higher-level orchestration context: active plans, workflow state, rules summary.
 */
const fs = require("fs");
const path = require("path");

function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

function normalizeRoot(root) {
  if (!root) return "";
  let r = String(root).replace(/\\/g, "/");
  if (/^\/[a-zA-Z]:\//.test(r)) r = r.slice(1);
  return r;
}

/** Find the most recently modified plan file (in-progress work indicator) */
function findActivePlan(projectDir) {
  const plansDir = path.join(projectDir, ".cursor", "plans");
  if (!fs.existsSync(plansDir)) return null;

  const files = fs.readdirSync(plansDir)
    .filter(f => f.endsWith(".md"))
    .map(f => {
      const full = path.join(plansDir, f);
      try {
        const stat = fs.statSync(full);
        return { name: f, mtime: stat.mtimeMs, full };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.mtime - a.mtime);

  if (files.length === 0) return null;

  const newest = files[0];
  const content = safeRead(newest.full);
  if (!content) return null;

  // Check if it has unchecked items (in-progress indicator)
  const hasUnchecked = /^-\s*\[ \]/m.test(content);
  const firstLine = content.split("\n").find(l => l.trim() && !l.startsWith("---")) || "";

  return {
    name: newest.name,
    hasUnchecked,
    firstLine: firstLine.replace(/^#+\s*/, "").trim(),
    modifiedAgo: Math.round((Date.now() - newest.mtime) / 60000) + "m ago",
  };
}

/** Find workflow_state.md if it exists */
function findWorkflowState(projectDir) {
  const wsPath = path.join(projectDir, ".cursor", "plans", "workflow_state.md");
  const content = safeRead(wsPath);
  if (!content) return null;
  // Extract current phase from workflow_state
  const phaseMatch = content.match(/current[_\s]?phase[:\s]+([A-Z_]+)/i);
  const statusMatch = content.match(/status[:\s]+(in.progress|blocked|completed|pending)/i);
  return {
    phase: phaseMatch ? phaseMatch[1] : null,
    status: statusMatch ? statusMatch[1] : null,
  };
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

  const roots = (payload.workspace_roots || []).map(normalizeRoot);
  const contextParts = [];

  for (const root of roots) {
    const projectDir = root.replace(/\//g, path.sep);
    if (!projectDir || !fs.existsSync(projectDir)) continue;

    const activePlan = findActivePlan(projectDir);
    if (activePlan) {
      const indicator = activePlan.hasUnchecked ? "🔄 IN PROGRESS" : "📋 recent";
      contextParts.push(
        `Active plan [${indicator}]: "${activePlan.firstLine}" (${activePlan.name}, modified ${activePlan.modifiedAgo})`
      );
    }

    const ws = findWorkflowState(projectDir);
    if (ws && ws.phase) {
      contextParts.push(`Workflow state: phase=${ws.phase}${ws.status ? `, status=${ws.status}` : ""}`);
    }
  }

  const output = {};
  if (contextParts.length > 0) {
    output.additional_context =
      "[Context Injector] Session starting with active work context:\n" +
      contextParts.map(p => `- ${p}`).join("\n") +
      "\n\nResume from this context if the user's request seems related.";
  }

  process.stdout.write(JSON.stringify(output) + "\n");
}

main().catch(() => process.stdout.write("{}\n"));
