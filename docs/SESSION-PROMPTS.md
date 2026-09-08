# Fresh-session prompts

Use one fresh Codex or Claude chat for one bounded task. Keep only the assistant you are currently using active.

## Start a new task

Replace the final line with the exact outcome you want.

```text
Read AGENTS.md, CLAUDE.md, and docs/AI-HANDOFF.md. Consult docs/ROADMAP.md or docs/DECISIONS.md only if this task affects them. Inspect git status and the latest commit. Work only in this repository and preserve existing changes. Verify facts from the files instead of guessing. Complete and validate this one task, then update the required project records according to AGENTS.md. Do not push or deploy unless I explicitly ask.

Task: [describe one specific outcome]
```

## Resume an interrupted task with the other assistant

```text
Read AGENTS.md, CLAUDE.md, and docs/AI-HANDOFF.md. Consult docs/ROADMAP.md or docs/DECISIONS.md only if this task affects them. The previous assistant stopped during a task. Inspect git status, the current diff, and only the relevant files to determine what is complete and what remains. Preserve and verify the existing work, finish the task, run the appropriate checks, and update the required project records according to AGENTS.md. Do not push or deploy unless I explicitly ask.
```

## End a task cleanly

```text
Finish the current coherent change and run the appropriate validation. Always update docs/AI-HANDOFF.md with the task outcome, files changed, checks run, and any exact next step. Update docs/ROADMAP.md only if scope, priority, or milestone status changed. Update docs/DECISIONS.md only if we made a durable project decision. Use the Git commit as the progress log, then create a local Git checkpoint. Do not push or deploy.
```
