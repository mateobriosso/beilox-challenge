# AI Usage Log

This document records every interaction between the author (Mateo Briosso) and the AI
assistant (Claude Code, model Claude Fable 5.1) during the Beilox take-home challenge.
Each entry captures what was asked, what the AI did, and any decisions or deviations.

---

## 2026-09-05 — Session 1: Project bootstrap

### Prompt (user)

Established the challenge context (maintainable Playwright + TypeScript framework for
web UI and API testing) and the ground rules for the whole project:

1. Keep this `docs/ai-usage.md` log updated with every AI interaction.
2. Commit after every stage/feature/chore with a descriptive message.
3. Never use the `any` type.
4. Scalable, clean, reusable code.
5. Custom fixtures via `test.extend` to inject page objects.
6. Page Object Model; keep tests, page objects, config, helpers and fixtures separated.
7. No fixed `waitForTimeout`; use promise-based waits / `expect` assertions.
8. Never commit sensitive information; use a local `.env` file only.
9. Create an empty `README.md`.

Starting tasks requested:

1. Create a new public GitHub repository named `beilox-challenge`.
2. Add the Playwright, GitHub and Atlassian (Jira) MCP servers for Claude, latest stable versions.
3. Initialize the repo with npm.
4. Install the TypeScript library.
5. Install the Ajv library for schema validation.

### Actions taken (AI)

- **GitHub repo:** created `https://github.com/mateobriosso/beilox-challenge` (public) with
  `gh repo create` and wired it as the `origin` remote of the existing local repo.
- **MCP servers** added at *project* scope so the config ships in `.mcp.json`:
  - `playwright` → `npx @playwright/mcp@0.0.80` (stdio, pinned to the latest published version).
  - `github` → `https://api.githubcopilot.com/mcp/` (official remote HTTP server, OAuth).
    The old npm package `@modelcontextprotocol/server-github` is deprecated, so the
    remote server is the current stable option.
  - `atlassian` → `https://mcp.atlassian.com/v1/mcp` (official Atlassian remote server, OAuth).
  - No tokens are stored in `.mcp.json`; both remote servers authenticate through OAuth
    on first use (`/mcp` inside Claude Code).
- **npm init:** `package.json` created (`private: true`, MIT, description set).
- **Dependencies:**
  - `typescript@7.0.2` (dev) and `@types/node@20` (dev, matching the local Node 20 runtime).
  - `ajv@8.20.0` (runtime) for JSON-schema validation of API responses.
- **TypeScript config:** `tsconfig.json` with `strict`, `noImplicitAny`,
  `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` and `noEmit`, enforcing the
  "no `any`" rule at compile time. `npx tsc --noEmit` passes.
- **Housekeeping:** empty `README.md`, `.gitignore` (ignores `node_modules`, `.env*`,
  Playwright artifacts), and `.env.example` with placeholder keys only.

### Decisions / notes

- `@playwright/test` is not installed yet; it was not part of the starting tasks and will be
  added in the next stage together with the Playwright config.
- The MCP servers show "Pending approval" until the project `.mcp.json` is approved in an
  interactive Claude Code session.
