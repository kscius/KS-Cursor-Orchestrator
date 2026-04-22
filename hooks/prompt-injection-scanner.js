#!/usr/bin/env node
/**
 * prompt-injection-scanner.js — beforeMCPExecution hook
 *
 * Scans MCP tool input arguments for prompt injection and secret exfiltration
 * patterns. Denies execution if a known attack pattern is detected.
 *
 * Returns:
 *   { permission: "deny", agent_message: "..." }  — attack pattern detected
 *   { permission: "allow" }                        — clean, proceed
 */

'use strict';

// ─── PROMPT INJECTION PATTERNS ──────────────────────────────────────────────
// Classic instruction override attempts
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above|preceding)\s+(instructions?|prompts?|context|rules?)/i,
  /disregard\s+(all\s+)?(previous|prior|above)\s+instructions?/i,
  /forget\s+(all\s+)?(previous|prior|your)\s+(instructions?|context|rules?)/i,
  /you\s+are\s+now\s+(a\s+)?(?!cursor|the\s+assistant)/i,
  /act\s+as\s+(if\s+you\s+are\s+)?(a\s+)?(?!cursor|the\s+assistant)/i,
  /pretend\s+(to\s+be|you\s+are)\s+(?!cursor|the\s+assistant)/i,
  /your\s+new\s+(role|instructions?|system\s+prompt)\s+(is|are)/i,
  /\[\[?system\]?\]\s*:/i,                // [[system]]: override attempts
  /<system>/i,                             // XML system tag injection
  /###\s*(new|updated|override)\s+(instructions?|system\s+prompt)/i,
  /---+\s*(new|updated|override)\s+(instructions?|system\s+prompt)/i,
  /\bjaildbreak\b/i,
  /\bdan\s+mode\b/i,                       // "Do Anything Now" jailbreak
  /\bDeveloper\s+Mode\b/,
];

// ─── SECRET EXFILTRATION PATTERNS ───────────────────────────────────────────
const EXFILTRATION_PATTERNS = [
  // Webhook / callback patterns with authorization
  /https?:\/\/[^\s]+\s+.*Authorization:\s*Bearer/i,
  /curl\s+.*-H\s+["']?Authorization/i,
  /curl\s+.*webhook/i,
  /fetch\s*\(\s*["']https?:\/\/(?!localhost|127\.0\.0\.1|::1)/i,

  // Base64 encoded payloads that look like commands (heuristic)
  /\bbase64\s+-d\b/i,
  /echo\s+[A-Za-z0-9+/]{40,}={0,2}\s*\|\s*(base64|bash|sh)/i,

  // Environment variable exfiltration
  /\bprocess\.env\b.*\b(token|key|secret|password|credential)/i,
  /\$\{?[A-Z_]*(TOKEN|KEY|SECRET|PASSWORD|CREDENTIAL|API_KEY)[A-Z_]*\}?/,

  // Suspicious data uploads
  /\bcat\s+.*\.(env|key|pem|p12|pfx|crt|cer)\b/i,
  /\bcat\s+~\/\.(ssh|gnupg|aws|azure|gcloud)\//i,
  /\bssh-keyscan\b/i,
];

// ─── SUSPICIOUS PATH PATTERNS ───────────────────────────────────────────────
// Writing to paths outside workspace or sensitive system locations
const DANGEROUS_PATH_PATTERNS = [
  /\/(etc|root|boot|proc|sys)\//i,
  /[A-Za-z]:[\\\/]Windows[\\\/](System32|SysWOW64)/i,
  /~\/(\.ssh|\.gnupg|\.aws|\.azure|\.kube)\//i,
  /\/dev\/(sd[a-z]|null|zero|random|mem)/i,
];

// ─── HOOK ENTRYPOINT ────────────────────────────────────────────────────────
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(input);
    const result = evaluate(payload);
    process.stdout.write(JSON.stringify(result));
  } catch {
    // On parse error, allow unconditionally (fail open for legitimate calls)
    process.stdout.write(JSON.stringify({ permission: 'allow' }));
  }
});

function evaluate(payload) {
  // Extract all string content from the MCP call arguments for scanning
  const textContent = extractTextContent(payload);

  // Scan for prompt injection
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(textContent)) {
      return {
        permission: 'deny',
        agent_message: `Prompt injection pattern detected in MCP call arguments. ` +
          `Pattern matched: ${pattern.toString()}. ` +
          `Tool: ${payload.tool || payload.name || 'unknown'}. ` +
          `Execution blocked for security.`,
      };
    }
  }

  // Scan for exfiltration patterns
  for (const pattern of EXFILTRATION_PATTERNS) {
    if (pattern.test(textContent)) {
      return {
        permission: 'deny',
        agent_message: `Potential secret exfiltration pattern detected in MCP call. ` +
          `Pattern matched: ${pattern.toString()}. ` +
          `Tool: ${payload.tool || payload.name || 'unknown'}. ` +
          `Execution blocked for security.`,
      };
    }
  }

  // Scan for dangerous filesystem paths in write operations
  const writeArgKeys = ['path', 'file_path', 'destination', 'output', 'filename', 'target'];
  for (const key of writeArgKeys) {
    const argValue = deepGet(payload.arguments || payload.params || {}, key);
    if (argValue && typeof argValue === 'string') {
      for (const pattern of DANGEROUS_PATH_PATTERNS) {
        if (pattern.test(argValue)) {
          return {
            permission: 'deny',
            agent_message: `Suspicious filesystem path detected in MCP call: "${argValue}". ` +
              `Writing to system or sensitive paths is not allowed. ` +
              `Tool: ${payload.tool || payload.name || 'unknown'}.`,
          };
        }
      }
    }
  }

  return { permission: 'allow' };
}

/**
 * Recursively extract all string values from the payload for scanning.
 * Limits depth and total length to avoid performance issues.
 */
function extractTextContent(obj, depth = 0, parts = []) {
  if (depth > 6 || parts.join('').length > 50_000) {
    return parts.join(' ');
  }

  if (typeof obj === 'string') {
    parts.push(obj);
  } else if (Array.isArray(obj)) {
    for (const item of obj) {
      extractTextContent(item, depth + 1, parts);
    }
  } else if (obj && typeof obj === 'object') {
    for (const value of Object.values(obj)) {
      extractTextContent(value, depth + 1, parts);
    }
  }

  return parts.join(' ');
}

/**
 * Get a value from a nested object by key name (shallow, first match).
 */
function deepGet(obj, key, depth = 0) {
  if (depth > 4 || !obj || typeof obj !== 'object') return undefined;
  if (key in obj) return obj[key];
  for (const value of Object.values(obj)) {
    const found = deepGet(value, key, depth + 1);
    if (found !== undefined) return found;
  }
  return undefined;
}
