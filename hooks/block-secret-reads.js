#!/usr/bin/env node

const BLOCKED_FILE_PATTERNS = [
  /\.env$/,
  /\.env\.\w+$/,
  /credentials\.json$/,
  /service[_-]?account.*\.json$/,
  /\.pem$/,
  /\.key$/,
  /id_rsa$/,
  /id_ed25519$/,
  /\.p12$/,
  /\.pfx$/,
  /secret[s]?\.ya?ml$/,
  /vault\.ya?ml$/,
];

const ALLOWED_PATTERNS = [/\.env\.example$/, /\.env\.template$/, /\.env\.sample$/];

async function main() {
  let input = "";
  for await (const chunk of process.stdin) {
    input += chunk;
    // Bail early if payload is unreasonably large — only the file_path matters,
    // not the file content. A 32KB threshold covers any realistic metadata payload.
    if (input.length > 32768) break;
  }

  let payload;
  try {
    // If input was truncated mid-JSON, extract file_path via regex fallback
    payload = JSON.parse(input);
  } catch {
    const match = input.match(/"file_path"\s*:\s*"([^"]+)"/);
    if (match) {
      payload = { file_path: match[1] };
    } else {
      process.stdout.write(JSON.stringify({ permission: "allow" }) + "\n");
      return;
    }
  }

  const filePath = (payload.file_path || "").replace(/\\/g, "/").toLowerCase();

  for (const allowed of ALLOWED_PATTERNS) {
    if (allowed.test(filePath)) {
      process.stdout.write(JSON.stringify({ permission: "allow" }) + "\n");
      return;
    }
  }

  for (const blocked of BLOCKED_FILE_PATTERNS) {
    if (blocked.test(filePath)) {
      process.stdout.write(
        JSON.stringify({
          permission: "deny",
          user_message: `Blocked: reading sensitive file ${payload.file_path}`,
        }) + "\n"
      );
      return;
    }
  }

  process.stdout.write(JSON.stringify({ permission: "allow" }) + "\n");
}

main().catch(() => {
  process.stdout.write(JSON.stringify({ permission: "allow" }) + "\n");
});
