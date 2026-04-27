#!/usr/bin/env node
/**
 * beforeSubmitPrompt: validate prompts before they reach the model.
 * - Blocks prompts with obvious secrets (API keys, tokens, passwords in plain text)
 * - Warns on excessively large pasted content (>50K chars) that may waste context
 * - Output: { continue: true/false, user_message?: string }
 */

const SECRET_PATTERNS = [
  /\b(sk-[a-zA-Z0-9]{20,})\b/,
  /\b(ghp_[a-zA-Z0-9]{36,})\b/,
  /\b(gho_[a-zA-Z0-9]{36,})\b/,
  /\b(glpat-[a-zA-Z0-9\-_]{20,})\b/,
  /\b(xox[bpsa]-[a-zA-Z0-9\-]{10,})\b/,
  /\b(AKIA[A-Z0-9]{16})\b/,
  /-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/,
  /\b(eyJ[a-zA-Z0-9_-]{20,}\.eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]+)\b/,
];

const CONTEXT_WARN_THRESHOLD = 50000;

async function main() {
  let input = "";
  for await (const chunk of process.stdin) input += chunk;

  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    process.stdout.write(JSON.stringify({ continue: true }) + "\n");
    return;
  }

  const userMessage = payload.user_message || "";

  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(userMessage)) {
      process.stdout.write(
        JSON.stringify({
          continue: false,
          user_message:
            "[prompt-gate] Your message appears to contain a secret or credential. Remove it before sending.",
        }) + "\n"
      );
      return;
    }
  }

  if (userMessage.length > CONTEXT_WARN_THRESHOLD) {
    process.stdout.write(
      JSON.stringify({
        continue: true,
        user_message: `[prompt-gate] Large prompt (${Math.round(userMessage.length / 1000)}K chars). Consider using file references instead of pasting large content.`,
      }) + "\n"
    );
    return;
  }

  process.stdout.write(JSON.stringify({ continue: true }) + "\n");
}

main().catch(() => process.stdout.write(JSON.stringify({ continue: true }) + "\n"));
