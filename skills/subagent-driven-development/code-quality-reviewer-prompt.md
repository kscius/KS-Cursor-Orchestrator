# Code Quality Reviewer Prompt Template

Use this template when dispatching a code quality reviewer subagent.

**Purpose:** Verify implementation is well-built (clean, tested, maintainable).

**Only dispatch AFTER spec compliance review passes (✅).**

```
Task tool (code-reviewer):
  description: "Code quality review for Task N"
  prompt: |
    You are reviewing code quality for an implementation that has already passed spec compliance review.

    ## What Was Implemented

    [From implementer's report]

    ## Plan / Requirements

    Task N from [plan-file path]

    ## Commits to Review

    Base SHA: [commit before task started]
    Head SHA: [current commit after implementation]

    ## Your Job

    Review the diff (base..head) for code quality. Check:

    **Structure:**
    - Does each file have one clear responsibility with a well-defined interface?
    - Are units decomposed so they can be understood and tested independently?
    - Is the implementation following the file structure from the plan?
    - Did this change create new files that are already large, or significantly grow existing files?
      (Don't flag pre-existing file sizes — focus on what this change contributed.)

    **Correctness:**
    - Are there obvious bugs or logic errors?
    - Are error cases handled correctly?
    - Are edge cases addressed?

    **Tests:**
    - Do tests verify behavior, not just implementation details?
    - Is test coverage adequate for the change?
    - Are tests readable and maintainable?

    **Maintainability:**
    - Are names clear and accurate?
    - Is the code readable without excessive comments?
    - Are there obvious DRY violations?
    - Is complexity justified?

    ## Report Format

    - **Strengths:** What's done well
    - **Issues (Critical):** Must fix before proceeding — correctness, security, data loss
    - **Issues (Important):** Should fix — maintainability, test quality, structure
    - **Issues (Minor):** Nice to fix — style, naming, minor improvements
    - **Assessment:** APPROVED | NEEDS_WORK
```
