# Harness lessons (Playwright and ExcelJS)

Many first Fails are the runner's own mistake. Print the full actual text before concluding.

**Playwright**
- Toasts often lack `role=status`: compare page text before and after the action instead of using a selector.
- Desktop and mobile may render twin elements: use `.locator('visible=true')` and `.first()`.
- Custom dropdowns are not `<select>`: click the placeholder, then the option `div` with exact text.
- Native browser validation (`type=email`, `required`, `step`) blocks submit before app-level validation. Check `validity` when no message appears.
- Client-side navigation caches: sidebar clicks may skip the API and middleware. Test sessions with a full reload or `goto`.
- Pages that use `router.back()` after Save must be entered from the list, not by direct URL.
- Wait for URL with a `pathname` predicate; a regex like `/dashboard/` also matches a host such as `stg.dashboard...`.
- Plain HTTP clients get HTML for static files; use `context.request.get` to send browser-like requests.
- Text may be uppercased by CSS: match case-insensitively.
- Utility-first CSS with `lab()`/`oklab()` colors needs canvas normalization before computing contrast.
- List APIs may ignore `page` and `limit`. Find test data from the newest items and clean up in several passes. Names may be auto-uppercased: search with `/i`.

**Process**
- Write scripts with the Write tool, not shell heredocs or `node -e` (backslashes and quotes get mangled on Windows shells). Run long jobs in the background.
- Run each module's runner once and write `results-<PREFIX>.final.json` with `{status, actual}` per case ID. Apply corrections in a separate merge script instead of re-running.

**ExcelJS**
- Formulas without a cached result show blank until opened in Excel.
- A file open in Excel cannot be overwritten (EBUSY): write a temp name, then replace after the user closes Excel.
