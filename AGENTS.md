# AjoSync Platform — Agent Guidelines

AjoSync is an AI-first thrift savings (Ajo/Esusu) platform built with Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui, Prisma (SQLite), and PayloadCMS. The runtime is **Bun**.

---

## Build, Lint & Dev Commands

```bash
# Install dependencies
bun install

# Development server (port 3000, logs to dev.log)
bun run dev

# Production build + copy static assets
bun run build

# Start production server
bun run start

# Lint (ESLint with Next.js config)
bun run lint

# Database commands
bun run db:push        # Push schema changes without migration
bun run db:generate    # Regenerate Prisma client
bun run db:migrate     # Create and apply a new migration
bun run db:reset       # Reset database (destructive)
```

### No test framework is configured — there are no test files or test scripts.
If tests are added, use Bun's built-in test runner:
```bash
bun test                        # Run all tests
bun test src/path/to/file.test.ts  # Run a single test file
```

---

## Project Structure

```
src/
  app/                  # Next.js App Router pages and API routes
    (payload)/          # PayloadCMS admin UI routes
    api/                # REST API route handlers
      ai/               # AI endpoints: chat, asr, tts, vision, insights
      users/            # User CRUD
      groups/           # Group CRUD
      contributions/    # Contribution handling
  components/
    ui/                 # shadcn/ui primitives (DO NOT edit these directly)
  hooks/                # Custom React hooks (use-mobile, use-toast)
  lib/
    db.ts               # Prisma singleton client
    utils.ts            # cn() utility (clsx + tailwind-merge)
  payload.config.ts     # PayloadCMS collections and config
prisma/
  schema.prisma         # SQLite schema (Prisma ORM)
```

---

## TypeScript

- **Strict mode is on** (`"strict": true`) but `noImplicitAny` is `false`.
- `ignoreBuildErrors: true` is set in `next.config.ts` — the build will not fail on type errors, but strive for correct types anyway.
- Path alias: `@/*` maps to `src/*`. Always use `@/` imports for internal modules.
- Prefer explicit return types on exported functions and API handlers.
- Use `interface` for object shapes, `type` for unions/aliases.
- Prisma enums use `SCREAMING_SNAKE_CASE`; TypeScript/UI types use `camelCase` string literals.

---

## Code Style

### Imports
- Group imports: 1) React/Next, 2) third-party, 3) internal (`@/`).
- No blank line between groups is acceptable (project default).
- Named imports are preferred; only use default imports when the module requires it.
- Lucide icons should be imported by name from `lucide-react` in a single import block.

### Formatting
- 2-space indentation throughout.
- Double quotes for JSX attributes; single quotes in `.ts` files (follow existing file convention).
- No enforced max line length — keep lines readable.
- Trailing semicolons are used.

### React / Next.js
- Add `"use client"` at the top of any component using hooks, browser APIs, or event handlers.
- Server Components are the default; add `"use client"` only when necessary.
- One component per section; use comment banners (`// ============`) to separate logical sections in large files.
- Prefer function declarations for top-level components; arrow functions for helpers and inline callbacks.
- Use `cn()` from `@/lib/utils` for all conditional class merging (clsx + tailwind-merge).

### Naming Conventions
- **Components**: PascalCase (`GroupCard`, `AIChatBot`).
- **Functions/variables**: camelCase.
- **Types/interfaces**: PascalCase (`GroupMember`, `ContributionStatus`).
- **Files**: kebab-case for routes and hooks (`use-mobile.ts`); PascalCase acceptable for component files.
- **Constants**: camelCase for objects/arrays; `SCREAMING_SNAKE_CASE` only for true compile-time constants.
- **Prisma enums**: `SCREAMING_SNAKE_CASE` in schema; mapped to lowercase string literals in the frontend.
- **API routes**: Always `route.ts` inside a folder matching the resource name.

---

## Styling

- Tailwind CSS v4 with the `@tailwindcss/postcss` plugin.
- All colors are CSS variables consumed via `hsl(var(--...))` tokens (background, foreground, primary, etc.). Never hardcode hex/rgb colors — use Tailwind semantic classes like `bg-primary`, `text-muted-foreground`, `border-border`.
- Dark mode is class-based (`darkMode: "class"`); the `ThemeProvider` from `next-themes` manages it.
- Animations use `tailwindcss-animate` and `framer-motion`. Prefer Tailwind utility animations for simple cases; use `framer-motion` (`motion.div`, `AnimatePresence`) for complex entrance/exit transitions.
- `shadcn/ui` components live in `src/components/ui/`. Do not modify them unless patching a bug — add wrappers instead.

---

## API Routes (Next.js Route Handlers)

- Always import `NextRequest` and `NextResponse` from `next/server`.
- Return `NextResponse.json({ error: '...' }, { status: 4xx/5xx })` for errors.
- Wrap handler bodies in `try/catch`; return a `500` response on unexpected errors.
- Successful creation returns `status: 201`; reads/updates return `200` (default).
- Follow RESTful conventions: `GET` for reads, `POST` for creates, `PATCH` for updates, `DELETE` for deletes.

```ts
// Standard API handler pattern
export async function GET(request: NextRequest) {
  try {
    // ...logic
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to ...' }, { status: 500 });
  }
}
```

---

## Database

- **Prisma** with SQLite (`prisma/schema.prisma`). Use the singleton exported from `src/lib/db.ts` (`import { db } from '@/lib/db'`).
- **PayloadCMS** uses a separate SQLite file (`db/payload.db`) via `@payloadcms/db-sqlite`.
- After schema changes run `bun run db:generate` then `bun run db:push` (dev) or `bun run db:migrate` (production).
- IDs use `cuid()` by default. Do not use `uuid` for Prisma models unless explicitly required.

---

## AI Integration

- AI features use `z-ai-web-dev-sdk` (`ZAI`). Initialize lazily with a module-level singleton (`let zaiInstance = null`).
- AI endpoints live under `src/app/api/ai/`: `chat`, `asr`, `tts`, `vision`, `insights`.
- Keep AI system prompts in the same file as the route handler, as named constants.
- Always wrap ZAI calls in `try/catch`; return `{ success: false, error: string }` on failure.

---

## Error Handling

- In API routes: always catch, log with `console.error`, and return a structured JSON error.
- In client components: use `toast.error(...)` from `sonner` for user-facing errors.
- Never let unhandled promise rejections surface silently.
- Prefer `error instanceof Error ? error.message : 'fallback'` when serializing errors.

---

## ESLint

Most strict rules are **disabled** (see `eslint.config.mjs`). Key relaxed rules:
- `@typescript-eslint/no-explicit-any`: off
- `@typescript-eslint/no-unused-vars`: off
- `react-hooks/exhaustive-deps`: off
- `no-console`: off

Run `bun run lint` before submitting changes. Fix any errors that are not in the disabled list.
