# Generate project roadmap

Scan the codebase and produce a visual roadmap with phased milestones.

## Process

1. **Scan**: Read the repository structure, README, docs, open issues/TODOs, and recent commit history
2. **Identify workstreams**: Group related tasks into logical phases or tracks
3. **Prioritize**: Order by dependencies, risk, and impact
4. **Visualize**: Create a Mermaid timeline or Gantt chart with phases and milestones
5. **Create todos**: Use `todo_write` to capture the next actionable items

## Output format

Render directly in chat (do not write files). Include:

1. **Executive summary** — 2-3 sentences on current state and recommended direction
2. **Mermaid timeline** — Use styled theme:

```
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#4F46E5', 'primaryTextColor': '#fff', 'primaryBorderColor': '#3730A3', 'lineColor': '#6366F1', 'secondaryColor': '#E0E7FF', 'tertiaryColor': '#F5F3FF'}}}%%
```

3. **Phase breakdown** — For each phase:
   - Goal
   - Key deliverables
   - Dependencies
   - Estimated effort (T-shirt: S/M/L/XL)

4. **Next steps** — Ask: "Which phase would you like to plan in detail?"

## Constraints

- Base the roadmap on evidence from the repo, not speculation
- If the repo is small or new, focus on architecture and foundation phases
- Do not create files — keep everything in chat

{{args}}
