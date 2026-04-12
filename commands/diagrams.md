# Generate diagrams

Create a Mermaid diagram based on the request. Render it directly in chat — do not write diagram files unless explicitly asked.

## Diagram type selection

Choose the most appropriate diagram type:

| Type | Use when |
|------|----------|
| `flowchart TD` | Process flows, decision trees, workflows |
| `flowchart LR` | Left-to-right pipelines, data flows |
| `sequenceDiagram` | API calls, service interactions, message passing |
| `erDiagram` | Database schemas, entity relationships |
| `stateDiagram-v2` | State machines, lifecycle transitions |
| `classDiagram` | Class hierarchies, interfaces, modules |
| `gitgraph` | Branch strategies, release flows |
| `journey` | User journeys, experience maps |
| `gantt` | Timelines, project schedules |
| `pie` | Distribution, composition breakdowns |
| `C4Context` | System architecture (C4 model) |

## Style

Use the theme initialization block for consistent styling:

```
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#4F46E5', 'primaryTextColor': '#fff', 'primaryBorderColor': '#3730A3', 'lineColor': '#6366F1', 'secondaryColor': '#E0E7FF', 'tertiaryColor': '#F5F3FF'}}}%%
```

## Rules

1. Always wrap the diagram in a `mermaid` code block
2. Use clear, concise node labels
3. Add meaningful edge labels for non-obvious connections
4. Keep diagrams readable — split complex systems into multiple diagrams
5. If the request references code, inspect the codebase first to ensure accuracy
6. For architecture diagrams, show only the components relevant to the discussion

## Request

{{args}}
