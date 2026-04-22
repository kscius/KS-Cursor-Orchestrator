#!/usr/bin/env node
/**
 * tdd-guard.js — beforeFileWrite hook
 *
 * Soft TDD guard: prompts the user to write a failing test first when
 * production source files are written without any preceding test file changes
 * in the current session.
 *
 * Returns { permission: "ask", ... } (never "deny") to avoid blocking
 * legitimate refactors, migrations, or exploratory work.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read the hook input from stdin (Cursor sends JSON)
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(input);
    const result = evaluate(payload);
    process.stdout.write(JSON.stringify(result));
  } catch (err) {
    // On parse error or unexpected input, allow unconditionally
    process.stdout.write(JSON.stringify({ permission: 'allow' }));
  }
});

// File patterns that are exempt from TDD guard
const EXEMPT_PATTERNS = [
  /\.(md|json|yaml|yml|toml|lock|txt|env|gitignore|dockerignore)$/i,
  /\.(css|scss|sass|less|svg|png|jpg|jpeg|gif|ico|woff|woff2|eot|ttf)$/i,
  /migration/i,
  /schema\.(sql|prisma)/i,
  /\.config\.(js|ts|mjs|cjs)$/i,
  /\bconfig\b/i,
  /\bfixture/i,
  /\bseed/i,
  /\bsetup/i,
  /\bbootstrap/i,
  /\.(d\.ts)$/,           // TypeScript declaration files
  /index\.(ts|js|tsx|jsx)$/, // Barrel files
];

// Source file extensions that trigger TDD guard
const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.rb'];

// Test file patterns — if the written file itself is a test, allow it
const TEST_PATTERNS = [
  /\.(test|spec)\.(ts|tsx|js|jsx|py|go|rb)$/i,
  /__tests__\//i,
  /\/tests?\//i,
  /\/spec(s)?\//i,
  /_test\.(go|py|rb)$/i,
  /Test\.(swift|java|kt)$/i,
];

function evaluate(payload) {
  const filePath = payload.file_path || payload.path || '';
  const normalizedPath = filePath.replace(/\\/g, '/');

  // Allow: exempt file types (config, docs, migrations, etc.)
  if (EXEMPT_PATTERNS.some((p) => p.test(normalizedPath))) {
    return { permission: 'allow' };
  }

  // Allow: if the file being written IS a test file
  if (TEST_PATTERNS.some((p) => p.test(normalizedPath))) {
    return { permission: 'allow' };
  }

  // Only guard source file extensions
  const ext = path.extname(normalizedPath).toLowerCase();
  if (!SOURCE_EXTENSIONS.includes(ext)) {
    return { permission: 'allow' };
  }

  // Check if there are recent test file changes in git
  if (hasRecentTestChanges()) {
    return { permission: 'allow' };
  }

  // Soft guard: ask, don't deny
  return {
    permission: 'ask',
    user_message:
      `TDD Guard: You are writing production code (${path.basename(filePath)}) ` +
      `without a preceding test change in this session.\n\n` +
      `Consider writing a failing test first. ` +
      `If this is a refactor, config change, or you already have tests, you can proceed.`,
  };
}

function hasRecentTestChanges() {
  try {
    // Check git status for any modified test files
    const output = execSync('git status --porcelain', {
      timeout: 3000,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const lines = output.split('\n').filter(Boolean);
    return lines.some((line) => {
      const filePath = line.slice(3).trim().replace(/\\/g, '/');
      return TEST_PATTERNS.some((p) => p.test(filePath));
    });
  } catch {
    // If git is unavailable or fails, allow unconditionally
    return true;
  }
}
