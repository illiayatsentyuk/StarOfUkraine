---
name: readme-writer
description: >-
  README authoring expert for the StarOfUkraine monorepo. Knows how to write
  clear, structured README files for apps (Nuxt frontend, NestJS backend) and
  the root monorepo. Covers setup, environment variables, scripts, architecture
  overview, and contribution guidelines. Use when the user asks to write, update,
  or improve a README, CONTRIBUTING, or any project documentation file.
category: documentation
risk: low
source: project
date_added: "2026-05-05"
---

# README Writer

Expert for authoring `README.md` files in the **StarOfUkraine** monorepo.

## Project structure

```
StarOfUkraine/               # monorepo root
├── apps/
│   ├── frontend/            # Nuxt 4, port 4040
│   └── backend/             # NestJS + Prisma, port 3000
├── packages/                # shared libs (if any)
├── .env / .env.example      # secrets — never commit real values
└── turbo.json / pnpm-workspace.yaml
```

---

## When to write each README

| File | Write when |
|---|---|
| `README.md` (root) | monorepo overview, quick-start, links to sub-apps |
| `apps/frontend/README.md` | frontend-specific setup, env vars, scripts |
| `apps/backend/README.md` | backend-specific setup, env vars, Prisma, scripts |
| `packages/*/README.md` | shared package API / usage |

---

## Standard sections (use only what applies)

```markdown
# Project Name

One-sentence description.

## Prerequisites
- Node.js ≥ X / pnpm ≥ X
- (other tools)

## Installation
```bash
pnpm install
```

## Environment variables
Copy `.env.example` → `.env` and fill in real values.

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `3000` |
| … | … | … |

## Development
```bash
pnpm dev          # start dev server
```

## Scripts
| Script | Purpose |
|---|---|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm test:e2e` | Playwright E2E tests |
| … | … |

## Architecture
Short diagram or bullet list of key layers / modules.

## Contributing
Branch → PR → review. Follow `.husky/pre-commit` hooks.
```

---

## Rules

- **Never** paste real secrets; reference `.env.example` and say "copy and fill in".
- Keep code blocks runnable — use exact script names from `package.json`.
- List env vars in a table; include a `Default` column.
- Use relative links for cross-app references (e.g. `[Backend README](apps/backend/README.md)`).
- Write in English (project convention) unless asked otherwise.
- Omit sections that have no content — an empty "Architecture" heading is worse than nothing.

---

## Checklist

- [ ] Title + one-sentence description
- [ ] Prerequisites (Node, pnpm versions from `package.json` `engines`)
- [ ] Install command
- [ ] `.env.example` reference, env var table
- [ ] All `package.json` scripts documented
- [ ] No real secrets or credentials
- [ ] Architecture section (if non-trivial)
- [ ] Contributing / PR guidelines
