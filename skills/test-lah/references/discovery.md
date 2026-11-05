# Discovery

Goal: learn enough to ask good questions. Stay cheap: targeted greps and file listings, keep a summary only. For a large repo use a read-only Explore subagent.

Read, in this order, stopping when you have enough:

1. `README`, `package.json` / `pyproject.toml` / `composer.json`: stack, scripts, test tooling.
2. Routing: framework route folders or router config, sidebar or nav config. Each top-level entry is a candidate module.
3. Roles and permissions: grep for `role`, `permission`, `can(`, guards, middleware. Produce a role list.
4. Forms and validation: schema files (zod, yup, joi), required fields, limits. These become test data and negative cases.
5. API layer: base URL config, endpoint list, error handling. Note when the config in the repo differs from the live host.
6. Existing tests, docs, PRD, previous QA files: reuse, do not repeat.
7. Design sources: Figma links (grep `figma.com`), Claude artifact links (grep `claude.ai/artifact`, `claude.ai/code/artifact`), HTML prototypes, design image or PDF folders, token files (tailwind config, theme, CSS variables), brand guidelines. List them; do not open large binaries.
8. States: list the statuses an entity can have (for example open, acknowledged, resolved) when `references/state-model.md` is in use.

Output (keep under 30 lines):
- stack and how the app is reached
- modules with one line each
- roles
- notable rules and limits found in code
- design sources found, if any
- Open questions: what the code cannot tell you (expected business behavior, accounts, seed data, live-system actions)

Do not hardcode a framework's folder layout; look at what the project actually uses.
