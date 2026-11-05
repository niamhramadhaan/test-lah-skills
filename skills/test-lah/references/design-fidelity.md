# Design fidelity

Goal: check that the deployed app matches the design the team agreed on. Run only when intake named a design source. No design for a screen means no fidelity case for that screen; do not invent one from taste (that belongs in UX notes).

## Sources, best first

1. HTML design (a Claude artifact, an HTML prototype, Storybook, any web link that renders the design): open it in Playwright like the live app and compare the same elements' computed styles on both. This is the most exact source.
   - Claude artifact link (`claude.ai/artifact/...` or `claude.ai/code/artifact/...`): fetch it with the Artifact tool's `read` action, never WebFetch or curl. Save the returned HTML locally and open it as a file in Playwright. If the read returns only a summary (an artifact someone else owns), you cannot measure it: ask the owner for edit access or for screenshots.
   - Other links: open directly. If it needs a login, ask for an export instead of credentials.
2. Figma link: use the Figma MCP tools if connected (node screenshot plus design context: sizes, colors, text styles, spacing). Ask for the frame or node per screen, not just the file.
3. Exported images or PDF of the screens: compare visually; measure only what the image makes clear.
4. Design tokens or a brand guideline (colors, type scale, radius, spacing, logo rules): check against computed styles.

Several sources can be combined (for example, a Figma or HTML design for layout and a brand guideline for tokens). If two sources disagree, that is a TBC with the question in Notes.

Record in Notes which source and frame each case used, and the design's version or last-modified date if visible. A design older than the feature may be out of date: that is a TBC, not a Fail.

## What to check, per screen

Plan one case per screen and check group, not one per pixel:

- **Layout**: order and grouping of sections, alignment, which elements exist. Missing or extra elements are the most important finding.
- **Typography**: family, size, weight, line height for headings, body and labels.
- **Color**: brand, text, background, borders, status colors. Compare hex values.
- **Spacing and size**: paddings, gaps, control heights, radius, icon sizes.
- **Components and states**: buttons, inputs, tables, badges, in the states the design shows (hover, focus, disabled, error, empty, loading).
- **Copy**: labels, headings and messages match the design text word for word (the app's language stays as is).
- **Assets**: logo, icons and images are the right ones, not stretched or blurry.
- **Breakpoints**: only the widths the design has frames for. Set the viewport to the frame's width.

## How

- Read values with Playwright: `getComputedStyle` on the element (color, font, padding, margin, border-radius, height). Do not rely on eyes for numbers. With an HTML design, run the same read on the design page and the live page at the same viewport, and diff the two.
- Take the live screenshot at the design frame's width. For evidence, put design and live side by side in one PNG (render a two-image HTML page and screenshot it) and use that as `shot`.
- Tolerances: colors exact hex (allow small anti-aliasing drift on screenshots only); font family, weight and size exact; spacing and sizes within 2 px; copy exact apart from whitespace. State the tolerance once in the Precondition of the first case.

## Writing the cases

- Module name `Design Fidelity`, prefix `DSG`. Feature = screen, Scenario = check group ("Login: typography").
- Expected Result lists the design values with key ones bold: "Heading **Inter 600 24px**, body **#2B2F33**".
- Actual Result lists only what differs, design vs live: "Heading 20px (design 24px). Button radius 4px (design 8px)." A Pass says "Matches design."
- A difference the team may have chosen on purpose (newer brand rule, dev constraint) is TBC with the question in Notes.
- A token or component wrong on many screens is one issue row with the shared component named, and one pattern on the Summary. Do not file it per screen.
- Severity: missing or wrong element, wrong copy or brand color = High; wrong type size or weight = Medium; spacing within a few px = Low.
