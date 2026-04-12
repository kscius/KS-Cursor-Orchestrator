# Address PR comments

Review and resolve comments on a pull request systematically.

## Input

Provide one of:
- A GitHub PR URL
- A paste of PR review comments
- `{{args}}` with PR context

## Process

1. **Gather comments**: Use `gh` CLI or the GitHub MCP to fetch all review comments, grouped by file and thread
2. **Categorize each comment**:
   - `fix` — Code change needed (bug, logic error, missing handling)
   - `style` — Style or convention adjustment
   - `question` — Clarification needed — draft a reply, do not change code
   - `nit` — Minor suggestion — apply if trivial, skip if debatable
   - `wontfix` — Disagree with reviewer — draft a respectful explanation
3. **Apply fixes** for `fix` and `style` items, grouped by file to minimize churn
4. **Draft reply bullets** for each comment thread:
   - For `fix`/`style`: "Fixed in [commit/change description]"
   - For `question`: Direct answer with code reference
   - For `nit`: "Applied" or brief rationale for skipping
   - For `wontfix`: Technical reasoning with evidence

## Output

1. Summary table: comment count by category
2. Code changes applied (minimal, scoped diffs)
3. Draft reply text for each thread — ready to paste into the PR

## Constraints

- Do NOT make changes unrelated to review comments
- Do NOT silently ignore comments — every thread gets a response category
- If a comment conflicts with another, flag it explicitly

{{args}}
