# Clarify task before implementation

Before writing any code, ask 2-4 targeted multiple-choice questions to resolve the most impactful ambiguities in the request.

TASK:
{{args}}

MISSION
Surface the smallest set of decisions that unblock implementation so the next command (`/intake`, `/scout`, `/build-full`, or `/ks-conductor`) can run without rework.

RELATED COMMANDS
- **Before:** Use when requirements are ambiguous; can precede `/intake` or `/scout`.
- **After:** Fold answers into the TASK string for `/intake`, the recon scope for `/scout`, or the args for `/ks-conductor`. Do not duplicate a full plan if `/plan` will run next.

## Rules

1. Read the full conversation history and any referenced files first
2. Identify the 2-4 most consequential unknowns that would change your implementation approach
3. Present each as a multiple-choice question with 2-4 concrete options
4. Each option should describe a specific implementation path, not a vague direction
5. Include a "something else" option only if the alternatives genuinely don't cover the space
6. After receiving answers, restate the requirements as a short bullet list and confirm before proceeding

## Question categories to consider

- **Data flow**: Where does the data come from and where does it go?
- **Scope**: Which files, modules, or layers are in scope?
- **API/Contract**: What shape should inputs and outputs have?
- **Auth/Permissions**: Who can access this and under what conditions?
- **Edge cases**: What happens on failure, empty state, or invalid input?
- **UX**: What should the user see and when?
- **Testing**: What level of test coverage is expected?

## Anti-patterns

- Do NOT ask questions whose answers are already in the conversation or repo
- Do NOT ask more than 4 questions
- Do NOT ask open-ended questions — provide concrete options
- Do NOT delay implementation once answers are received

## OUTPUT FORMAT

- **Questions:** numbered multiple-choice (2–4), each option concrete
- **After answers:** bullet restatement of requirements + explicit handoff line (“Proceed with `/scout` …” or “Feed into `/ks-conductor` …”)

