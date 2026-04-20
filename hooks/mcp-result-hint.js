#!/usr/bin/env node
/**
 * afterMCPExecution: surface structured failures (deterministic; avoids broad "error" substring FPs).
 */
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

  const tool = payload.tool_name || payload.mcp_tool || "";
  const raw = payload.tool_result ?? payload.result ?? payload.output ?? payload;
  const blob =
    typeof raw === "string" ? raw : JSON.stringify(raw ?? {}, null, 0);

  const bad =
    /"isError"\s*:\s*true|"error"\s*:\s*\{|"status"\s*:\s*5\d\d\b/i.test(blob) ||
    /\b(RPC error|MCP error|ECONNREFUSED|ENOTFOUND|Request failed|status code 4\d\d)\b/i.test(
      blob
    );

  if (bad) {
    process.stdout.write(
      JSON.stringify({
        additional_context: `[mcp-result] ${tool ? tool + " " : ""}${blob.slice(0, 1400)}`,
      }) + "\n"
    );
    return;
  }

  process.stdout.write("{}\n");
}

main().catch(() => process.stdout.write("{}\n"));
