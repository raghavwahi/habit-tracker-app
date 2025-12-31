# GitHub Copilot Instructions

## Goals
- Build a production-ready, Vercel-hosted web app.
- Prefer simple, maintainable solutions over cleverness.
- Keep the UX mobile-first (iPhone primary).

## Coding standards
- Use TypeScript.
- Prefer server-side data access for sensitive operations.
- Avoid unnecessary abstraction.
- No emojis in code, comments, scripts, commits, or docs.
- Do not add comments unless they prevent misunderstanding.

## Project conventions
- Use Next.js App Router.
- Prefer React Server Components by default; use Client Components only when needed.
- Use Tailwind CSS for styling.
- Prefer `zod` for input validation.
- Prefer `date-fns` for date handling.

## Security and privacy
- Never log secrets or tokens.
- Validate all untrusted input at the boundary (server actions / route handlers).
- Enforce row-level security (RLS) at the database.
- Use least-privilege access.

## Database
- Use a managed free-tier Postgres (Supabase).
- Use RLS policies to scope data to the authenticated user.
- Keep schema normalized but pragmatic.

## Testing and quality
- Keep formatting consistent.
- Fix root causes, not symptoms.
- Run typecheck and lint after meaningful changes.

## Documentation
- Maintain a single `README.md` describing setup, env vars, database setup, and deployment.
- Do not document every small change; document usage and operational steps.
