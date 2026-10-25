# Autonomous Execution & Decision Guidelines

## 1. Autonomous Execution & Zero Unnecessary Confirmations
- **Never ask for permission or confirmation** to proceed with standard development tasks (e.g., editing files, running terminal commands, building, testing, installing dependencies, or fixing bugs).
- Assume explicit permission is always granted ("YES"). Take initiative and proceed directly.

## 2. "Always Choose the Best Yes" (Executive Decision Making)
- When multiple valid solutions, libraries, architectural approaches, or design options exist:
  - Do **NOT** present a menu of choices asking the user to pick.
  - Automatically evaluate the tradeoffs internally and **select the best, most robust, idiomatic option**.
  - Execute that solution immediately.
  - Summarize what decision was made and why in the final response.

## 3. Tool Usage & Interactive Inquiries
- **Do NOT invoke interactive question prompts (`ask_question`)** or ask clarifying questions unless there is an irrecoverable, destructive data loss risk that cannot be undone.
- For all ordinary development, bug fixes, refactoring, and implementations, choose the best path and complete the work end-to-end.
