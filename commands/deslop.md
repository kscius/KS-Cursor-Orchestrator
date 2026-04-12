# Remove AI code slop

Check the diff against main (or the base branch), and remove all AI-generated slop introduced in this branch.

## What counts as slop

- Extra comments that a human wouldn't add or that are inconsistent with the rest of the file (e.g. "// Import the module", "// Handle the error", "// Return the result")
- Extra defensive checks or try/catch blocks that are abnormal for that area of the codebase — especially if called by trusted or validated code paths
- Casts to `any` to work around type issues instead of fixing the type
- Unnecessary `console.log` or debug statements left behind
- Overly verbose variable names that don't match the file's style
- Redundant type annotations where inference is sufficient and the file convention is to rely on inference
- Empty catch blocks or swallowed errors
- Unnecessary `else` after early returns
- AI-style filler phrases in string literals or user-facing text
- Any other style that is inconsistent with the surrounding file

## Process

1. Run `git diff main...HEAD --name-only` (or appropriate base branch) to identify changed files
2. For each changed file, read the full file and the diff
3. Identify slop patterns listed above
4. Remove or fix each instance — prefer deletion over rewriting
5. Do NOT change behavior, logic, or functionality — only remove noise
6. Do NOT touch files outside the branch diff

## Output

Report at the end with only a 1-3 sentence summary of what you changed. No verbose explanations.

{{args}}
