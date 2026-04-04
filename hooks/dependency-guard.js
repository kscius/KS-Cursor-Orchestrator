#!/usr/bin/env node
/**
 * afterFileEdit hook: detect when an agent introduces imports of packages that
 * are NOT in the project's package.json / requirements.txt / go.mod etc.
 *
 * Anti-hallucination guard: prevents agents from importing packages they invent.
 * Returns a followup_message asking the agent to verify the package exists.
 *
 * Only fires when new import lines are added (not for removals or rewrites).
 */
const fs = require("fs");
const path = require("path");

const IMPORT_PATTERNS = [
  // JS/TS: import ... from 'package-name'
  /\bimport\s+(?:.*?\s+from\s+)?['"]([^'"./][^'"]*)['"]/g,
  // JS/TS: require('package-name')
  /\brequire\s*\(\s*['"]([^'"./][^'"]*)['"]\s*\)/g,
];

const PYTHON_IMPORT = /^(?:import|from)\s+([a-zA-Z_][a-zA-Z0-9_]*)/gm;

function extractNpmPackage(importPath) {
  // Handle scoped packages: @scope/package
  if (importPath.startsWith("@")) {
    const parts = importPath.split("/");
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : importPath;
  }
  // Handle subpath imports: package/subpath → package
  return importPath.split("/")[0];
}

function getInstalledPackages(projectDir) {
  const pkgPath = path.join(projectDir, "package.json");
  if (!fs.existsSync(pkgPath)) return null;
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    return new Set([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
      ...Object.keys(pkg.optionalDependencies || {}),
      // Node built-ins — always allowed
      "fs", "path", "os", "http", "https", "crypto", "stream", "events",
      "util", "url", "querystring", "buffer", "child_process", "process",
      "readline", "zlib", "net", "tls", "dns", "cluster", "worker_threads",
      "assert", "timers", "module", "vm", "v8", "perf_hooks", "async_hooks",
    ]);
  } catch {
    return null;
  }
}

function extractNewLines(oldStr, newStr) {
  const oldLines = new Set((oldStr || "").split("\n"));
  return (newStr || "").split("\n").filter(l => !oldLines.has(l));
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

  const filePath = payload.file_path || "";
  const edits = payload.edits || [];

  // Only check JS/TS files
  const isJsTs = /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(filePath);
  const isPy = /\.py$/.test(filePath);

  if (!isJsTs && !isPy) {
    process.stdout.write("{}\n");
    return;
  }

  // Find project root (walk up from file looking for package.json or requirements.txt)
  let projectDir = path.dirname(filePath);
  for (let i = 0; i < 6; i++) {
    const parent = path.dirname(projectDir);
    if (
      fs.existsSync(path.join(projectDir, "package.json")) ||
      fs.existsSync(path.join(projectDir, "requirements.txt")) ||
      fs.existsSync(path.join(projectDir, "pyproject.toml"))
    ) {
      break;
    }
    if (parent === projectDir) break;
    projectDir = parent;
  }

  const installed = isJsTs ? getInstalledPackages(projectDir) : null;
  if (isJsTs && !installed) {
    // No package.json found — skip check
    process.stdout.write("{}\n");
    return;
  }

  const suspiciousImports = [];

  for (const edit of edits) {
    const newLines = extractNewLines(edit.old_string, edit.new_string);
    const newCode = newLines.join("\n");

    if (isJsTs && installed) {
      for (const pattern of IMPORT_PATTERNS) {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(newCode)) !== null) {
          const rawImport = match[1];
          if (rawImport.startsWith(".")) continue; // relative import
          const pkg = extractNpmPackage(rawImport);
          if (!installed.has(pkg)) {
            suspiciousImports.push(pkg);
          }
        }
      }
    }
  }

  const unique = [...new Set(suspiciousImports)];
  if (unique.length === 0) {
    process.stdout.write("{}\n");
    return;
  }

  const output = {
    followup_message: [
      `[Dependency Guard] New imports detected that may not be in package.json: ${unique.map(p => `\`${p}\``).join(", ")}`,
      "",
      "Before continuing, verify:",
      unique.map(p => `- \`${p}\`: run \`npm list ${p}\` or check package.json`).join("\n"),
      "",
      "If these packages are missing, install them first or use an existing alternative.",
    ].join("\n"),
  };

  process.stdout.write(JSON.stringify(output) + "\n");
}

main().catch(() => process.stdout.write("{}\n"));
