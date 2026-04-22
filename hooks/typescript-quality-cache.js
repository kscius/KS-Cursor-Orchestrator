#!/usr/bin/env node
/**
 * typescript-quality-cache.js — afterFileEdit hook (matcher: \.ts|tsx$)
 *
 * Provides a fast-path TypeScript quality check with config-hash caching.
 * Runs `tsc --noEmit` and `eslint --fix` on the changed file.
 *
 * Cache key: SHA-256 of tsconfig.json + eslintrc content.
 * If config hash matches cache AND last check was < 30s ago, skips execution.
 *
 * Does NOT replace post-edit-quality.js — runs as an additional TS-specific hook.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync, spawnSync } = require('child_process');
const os = require('os');

const CACHE_FILE = path.join(os.tmpdir(), 'cursor-ts-quality-cache.json');
const CACHE_TTL_MS = 30_000; // 30 seconds hot-path window

// Read hook input
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(input);
    run(payload);
  } catch {
    process.exit(0);
  }
});

function run(payload) {
  const filePath = payload.file_path || payload.path || '';
  if (!filePath) {
    process.exit(0);
  }

  const workspaceRoot = detectWorkspaceRoot(filePath);

  // Compute config hash
  const configHash = computeConfigHash(workspaceRoot);

  // Check cache
  const cache = loadCache();
  const now = Date.now();

  if (
    cache &&
    cache.configHash === configHash &&
    cache.workspaceRoot === workspaceRoot &&
    now - cache.lastCheckMs < CACHE_TTL_MS
  ) {
    // Hot path: config unchanged and recent check passed — skip
    process.exit(0);
  }

  // Run tsc --noEmit
  const tscResult = spawnSync(
    'npx',
    ['--no-install', 'tsc', '--noEmit', '--incremental'],
    {
      cwd: workspaceRoot,
      timeout: 20_000,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
    }
  );

  // Run eslint --fix on the changed file only
  const eslintResult = spawnSync(
    'npx',
    ['--no-install', 'eslint', '--fix', '--quiet', filePath],
    {
      cwd: workspaceRoot,
      timeout: 10_000,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
    }
  );

  // If both passed, update cache
  if (tscResult.status === 0 && eslintResult.status !== 2) {
    saveCache({ configHash, workspaceRoot, lastCheckMs: now });
  } else {
    // Clear cache on failure so next run re-executes
    clearCache();
  }

  // Emit any tsc errors to stderr for Cursor to surface
  if (tscResult.stderr) {
    process.stderr.write(tscResult.stderr);
  }
  if (tscResult.stdout && tscResult.status !== 0) {
    process.stderr.write(tscResult.stdout);
  }

  process.exit(0);
}

function detectWorkspaceRoot(filePath) {
  // Walk up from file path to find tsconfig.json
  let dir = path.dirname(path.resolve(filePath));
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, 'tsconfig.json'))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

function computeConfigHash(workspaceRoot) {
  const hasher = crypto.createHash('sha256');

  // Hash tsconfig.json
  const tsconfig = path.join(workspaceRoot, 'tsconfig.json');
  if (fs.existsSync(tsconfig)) {
    hasher.update(fs.readFileSync(tsconfig));
  }

  // Hash eslint config (try several variants)
  const eslintFiles = [
    '.eslintrc', '.eslintrc.json', '.eslintrc.js', '.eslintrc.cjs',
    '.eslintrc.mjs', '.eslintrc.yaml', '.eslintrc.yml', 'eslint.config.js',
    'eslint.config.mjs', 'eslint.config.cjs',
  ];
  for (const f of eslintFiles) {
    const p = path.join(workspaceRoot, f);
    if (fs.existsSync(p)) {
      hasher.update(fs.readFileSync(p));
      break;
    }
  }

  return hasher.digest('hex');
}

function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    }
  } catch {
    // ignore
  }
  return null;
}

function saveCache(data) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data), 'utf8');
  } catch {
    // ignore — cache write failure is non-fatal
  }
}

function clearCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      fs.unlinkSync(CACHE_FILE);
    }
  } catch {
    // ignore
  }
}
