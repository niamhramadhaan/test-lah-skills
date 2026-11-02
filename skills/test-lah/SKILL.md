---
name: test-lah
description: Use when asked to QA or test a web app and produce a test-case workbook (Excel) with pass/fail results, evidence, UX suggestions and an issues table for developers. Learns the project from its code, then asks about language, workbook color, modules and environment before testing.
---

# test-lah

Test a live app like a careful QA, and deliver a workbook devs and PMs will actually read.

Never change application source code unless the user asks. Never claim a case was "tested manually" if it was run by script.

## Step 0: Load saved profile

Read `docs/qa/TEST-LAH.md` if it exists. Answers recorded there are not asked again: show them as one line ("Using: Indonesian, green, modules A/B/C") and let the user override.

## Step 1: Discover (no questions yet)

Learn the project from code, bounded. Follow `references/discovery.md`. Output: a short summary of modules, roles, forms, API base, and the questions the code could not answer.

## Step 2: Intake

Ask with AskUserQuestion, max 4 questions per call, skipping anything answered in the profile or discovery. Build option lists from what discovery found, never from a fixed list.

Round 1 (scope):
- Language of Actual Result and suggestions: English / Indonesian / Mixed (Indonesian with English terms). Titles, UI labels and technical terms stay in the app's language.
- Modules in scope (multiSelect, built from discovery, include "all").
- Test as which roles (built from discovery).
- Environment: base URL, and who provides accounts. Never store passwords; read them from env vars.

Round 2 (output):
- Workbook color: neutral / project brand (ask for hex via "Other") / keep existing workbook.
- UX suggestions: None / Light (obvious issues) / Full review. Light or Full: read `references/ux-review.md`.
- Model states first? Yes / No. Yes: read `references/state-model.md`.
- New workbook or continue an existing one.

Then restate the answers in 4 to 6 lines, wait for "go", and save them to `docs/qa/TEST-LAH.md`.

If nobody can answer (unattended run) and there is no saved profile: stop and report what is missing. Do not guess.

## Step 3: Plan cases

Per module, write cases as data (one array per module), separate from styling, so a color or language change never means re-running tests. IDs are `PREFIX-001` by array order. Add new cases at the END; never insert in the middle after results exist.

Do not guess business intent. A case whose expected result needs a decision gets status TBC, not Pass or Fail.

## Step 4: Run

Read `references/safety.md` before touching any environment, and `references/harness-lessons.md` before writing a runner.

- Verify every Fail: print the full actual text before concluding. Many first Fails are the runner's own mistake. If the assumption was wrong, correct the Expected Result and note the correction in Notes.
- Capture evidence while the case runs, not afterwards.
- Keep per-module progress in the profile file after each module, so a new session can resume.

## Step 5: Build the workbook

Follow `references/workbook-spec.md` (columns, statuses, formatting, evidence, issues table, summary). Write the builder with ExcelJS. If the file is open in Excel (EBUSY), write to `*.next.xlsx` and ask the user to close Excel.

## Step 6: Report

One short message: counts per status, the urgent items first, what is Blocked and what the user must provide. End by updating the profile file.

## Rules that always apply

- One suggestion has one wording everywhere it appears (workbook, UX notes, issues table, any report). Change it everywhere at once.
- Merge issues one developer would fix together into one numbered row. Do not fragment.
- Urgent findings (open endpoints, missing permission checks, wrong money or dates, data loss) are marked red and listed first.
- Whatever needs a person or a device is Blocked and listed under "needs from the team".
