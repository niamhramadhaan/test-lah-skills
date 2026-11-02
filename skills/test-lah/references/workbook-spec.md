# Workbook spec

Apply the color and language chosen at intake. Default if unspecified: neutral palette, English.

## Sheets

- Summary first: counts per status, stacked bar per module, issue heatmap per module, cross-module pattern matrix (a pattern seen in 3 or more modules is listed once, with the shared component).
- One sheet per module, then a General sheet for rules that hold across pages (responsiveness, toasts, loading/empty/error states, forms, confirmations, export, a11y). Test one representative page per pattern; record shared-component findings once.
- Manual Tests sheet: every Blocked case, with a "What you need / why it is manual" column. Needs from the team are bold green.
- Legend.
- Sheet names cannot contain a colon.

## Test case columns

ID, Module, Feature, Scenario, Type, Priority, Precondition, Steps, Test Data (italic), Expected Result (key points bold), Actual Result, Status, Notes, Evidence.

## Status

`Pass`, `Fail`, `Blocked`, `TBC`, `Not Tested`.
- TBC (teal): the case ran but the expected result waits for a decision. Prefix Actual Result with "Observed (expected still TBC): ". Never leave such a case as Not Tested.
- Not Tested only if truly not run.
- Status is color-filled by conditional formatting. Priority uses a different palette from Status.

## Formatting

Body 12 pt, headers 14 pt, code-like text (requests, paths, field names, JSON) italic 10 pt, all vertically centred. Row heights computed from text length. Precondition and Notes in grey; execution columns (Actual Result to Evidence) have a darker header than the design columns. Zoom 90%. Long Actual Result, Notes and suggestions (3+ sentences) become bullets, one per sentence.

## Evidence

- Fail with a UI view: screenshot, taken during the run. Blur sensitive fields. Skip screenshots that do not show the failure.
- API-only Fail: small monospace request/response snippet, no secrets.

## UX Notes (only if chosen at intake)

Columns: ID, Area, Observation, Suggestion, Related case. Keep separate from pass/fail.

## Issues to raise with the tech team

Below the cases on each module sheet, in a softer palette. Columns: Type (Bug or Improvement), Severity, Area, Issue, Suggested fix, Reference (case and UX IDs), Minimal steps to reproduce (shortest path to the broken state).
- Merge fixes one developer would do together into one row: numbered points, first sentence of each point bold, blank line between points, Suggested fix points numbered the same. State a full spec once, refer to it elsewhere.
- UX note tied to a Fail = Bug. Redesign proposals = Improvement.
- Warn at build time for any Fail with no issue row.
- Urgent items: red bold first sentence of Actual Result and red headline in the issue row. Keep the ID list in one data file.

## Export/Download suggestion pattern (when relevant)

Download opens an "Export data" dialog: date range (prefilled from active filter), format Excel or CSV, editable prefilled file name, row count, Cancel and Download, then a message naming the file. Not a single "Download Excel" button.
