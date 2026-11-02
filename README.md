# test-lah

A Claude Code skill that tests a web app and produces a QA workbook (Excel): test cases, evidence, UX suggestions, and an issues table for the tech team.

## Install

In a terminal:

```
claude plugin marketplace add niamhramadhaan/test-lah-skills
claude plugin install test-lah@test-lah-skills
```

Check `claude plugin --help` if the commands differ in your version.

## Use

In the project you want to test, say "run test-lah" (or `/test-lah`). It will:

1. Read the project (routes, roles, forms) and any saved profile at `docs/qa/TEST-LAH.md`.
2. Ask what it could not learn: language, workbook color, modules, UX depth, environment.
3. Test, then build the workbook.

Progress and answers are saved to `docs/qa/TEST-LAH.md` so the next run skips them.

## Layout

```
skills/test-lah/
  SKILL.md                  workflow, intake, rules (always loaded when used)
  references/discovery.md   how to learn a project cheaply
  references/workbook-spec.md   columns, statuses, formatting, issues table
  references/safety.md      data safety rules for non-production targets
  references/ux-review.md   optional UX suggestion checklist
  references/state-model.md optional state/transition coverage method
  references/harness-lessons.md  Playwright and ExcelJS pitfalls
```

Not included yet: a workbook builder script. The skill tells the agent to write one with ExcelJS following `workbook-spec.md`.
