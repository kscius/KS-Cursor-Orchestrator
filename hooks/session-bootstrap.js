#!/usr/bin/env node
/**
 * sessionStart: merged git/stack/env + active plan/workflow hints (replaces
 * session-context.js + context-injector.js). Single invocation = lower latency.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function safe(fn) {
  try {
    return fn();
  } catch {
    return null;
  }
}

function git(cmd, cwd) {
  return safe(() =>
    execSync(cmd, {
      cwd,
      encoding: "utf8",
      timeout: 5000,
      stdio: ["ignore", "pipe", "ignore"],
    }).trim()
  );
}

function detectStack(projectDir) {
  const markers = [];
  const has = (f) => fs.existsSync(path.join(projectDir, f));

  if (has("package.json")) {
    const pkg = safe(() =>
      JSON.parse(fs.readFileSync(path.join(projectDir, "package.json"), "utf8"))
    );
    if (pkg) {
      const allDeps = {
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {}),
      };
      if (allDeps.next) markers.push("Next.js");
      else if (allDeps.react) markers.push("React");
      if (allDeps.vue) markers.push("Vue");
      if (allDeps.svelte || allDeps["@sveltejs/kit"]) markers.push("Svelte");
      if (allDeps.express) markers.push("Express");
      if (allDeps.fastify) markers.push("Fastify");
      if (allDeps.prisma || allDeps["@prisma/client"]) markers.push("Prisma");
      if (allDeps.drizzle || allDeps["drizzle-orm"]) markers.push("Drizzle");
      if (allDeps.typescript) markers.push("TypeScript");
      if (allDeps.tailwindcss) markers.push("Tailwind CSS");
      if (allDeps.jest || allDeps.vitest)
        markers.push(allDeps.jest ? "Jest" : "Vitest");
      if (allDeps.playwright || allDeps["@playwright/test"])
        markers.push("Playwright");

      const pm = has("pnpm-lock.yaml")
        ? "pnpm"
        : has("yarn.lock")
          ? "yarn"
          : has("bun.lockb")
            ? "bun"
            : "npm";
      markers.push(`pkg-manager: ${pm}`);
    }
  }

  if (has("Gemfile")) markers.push("Ruby/Rails");
  if (has("requirements.txt") || has("pyproject.toml")) markers.push("Python");
  if (has("go.mod")) markers.push("Go");
  if (has("Cargo.toml")) markers.push("Rust");
  if (has("composer.json")) markers.push("PHP");
  if (has("pubspec.yaml")) markers.push("Flutter/Dart");

  return markers;
}

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

function findActivePlan(projectDir) {
  const plansDir = path.join(projectDir, ".cursor", "plans");
  if (!fs.existsSync(plansDir)) return null;

  const files = fs
    .readdirSync(plansDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
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

  const hasUnchecked = /^-\s*\[ \]/m.test(content);
  const firstLine =
    content.split("\n").find((l) => l.trim() && !l.startsWith("---")) || "";

  return {
    name: newest.name,
    hasUnchecked,
    firstLine: firstLine.replace(/^#+\s*/, "").trim(),
    modifiedAgo: Math.round((Date.now() - newest.mtime) / 60000) + "m ago",
  };
}

function findWorkflowState(projectDir) {
  const wsPath = path.join(projectDir, ".cursor", "plans", "workflow_state.md");
  const content = safeRead(wsPath);
  if (!content) return null;
  const phaseMatch = content.match(/current[_\s]?phase[:\s]+([A-Z_]+)/i);
  const statusMatch = content.match(
    /status[:\s]+(in.progress|blocked|completed|pending)/i
  );
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

  const projectDir =
    process.env.CURSOR_PROJECT_DIR ||
    (payload.workspace_roots && payload.workspace_roots[0]) ||
    ".";

  const ctx = [];

  const branch = git("git rev-parse --abbrev-ref HEAD", projectDir);
  if (branch) {
    ctx.push(`Branch: ${branch}`);

    const status = git("git status --porcelain", projectDir);
    if (status) {
      const lines = status.split("\n").length;
      ctx.push(`Uncommitted: ${lines} file(s)`);
    } else {
      ctx.push("Working tree: clean");
    }

    const recent = git('git log --oneline -5 --format="%h %s"', projectDir);
    if (recent) {
      ctx.push(`Recent commits:\n${recent}`);
    }
  }

  const stack = detectStack(projectDir);
  if (stack.length > 0) {
    ctx.push(`Stack: ${stack.join(", ")}`);
  }

  const pkgPath = path.join(projectDir, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = safe(() => JSON.parse(fs.readFileSync(pkgPath, "utf8")));
    if (pkg && pkg.scripts) {
      ctx.push(`Scripts: ${Object.keys(pkg.scripts).join(", ")}`);
    }
  }

  const envFiles = [".env", ".env.local", ".env.development"].filter((f) =>
    fs.existsSync(path.join(projectDir, f))
  );
  if (envFiles.length > 0) {
    ctx.push(`Env files present: ${envFiles.join(", ")}`);
  }

  if (fs.existsSync(path.join(projectDir, "docs"))) ctx.push("Has docs/");
  if (fs.existsSync(path.join(projectDir, "README.md"))) ctx.push("Has README.md");

  const rulesDir = path.join(projectDir, ".cursor", "rules");
  if (fs.existsSync(rulesDir)) {
    const rules = safe(() =>
      fs.readdirSync(rulesDir).filter((f) => f.endsWith(".mdc"))
    );
    if (rules && rules.length > 0) {
      ctx.push(`Project rules: ${rules.length} (.mdc)`);
    }
  }

  const roots = (payload.workspace_roots || []).map(normalizeRoot);
  const planParts = [];
  for (const root of roots) {
    const dir = root.replace(/\//g, path.sep);
    if (!dir || !fs.existsSync(dir)) continue;

    const activePlan = findActivePlan(dir);
    if (activePlan) {
      const tag = activePlan.hasUnchecked ? "[active]" : "[recent]";
      planParts.push(
        `${tag} plan "${activePlan.firstLine}" (${activePlan.name}, ${activePlan.modifiedAgo})`
      );
    }

    const ws = findWorkflowState(dir);
    if (ws && ws.phase) {
      planParts.push(
        `workflow_state: phase=${ws.phase}${ws.status ? ` status=${ws.status}` : ""}`
      );
    }
  }

  const sessionId = payload.session_id || payload.conversation_id || "";
  const composerMode = payload.composer_mode || "agent";
  const cursorVersion = payload.cursor_version || null;
  const isBackgroundAgent = payload.is_background_agent || false;

  const sections = [];
  if (ctx.length > 0) {
    sections.push("Session:\n" + ctx.map((p) => `- ${p}`).join("\n"));
  }
  if (planParts.length > 0) {
    sections.push("Plans:\n" + planParts.map((p) => `- ${p}`).join("\n"));
  }
  sections.push(
    "Optional MCP (multi-step project work): cursor10x getComprehensiveContext / initConversation; devcontext initialize_conversation_context."
  );
  if (sessionId) {
    sections.push(`session_id=${sessionId} composer_mode=${composerMode}`);
  }

  const env = {};
  if (branch) env.GIT_BRANCH = branch;
  if (stack.length > 0) env.CURSOR_STACK = stack.join(",");
  env.CURSOR_SESSION_START = new Date().toISOString();
  if (cursorVersion) env.CURSOR_VERSION = cursorVersion;
  if (isBackgroundAgent) env.CURSOR_IS_BACKGROUND_AGENT = "1";

  process.stdout.write(
    JSON.stringify({
      additional_context: sections.join("\n\n"),
      env,
    }) + "\n"
  );
}

main().catch(() => process.stdout.write("{}\n"));
