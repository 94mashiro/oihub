# Design: Scoped `any` policy

## Goals
- Reduce TypeScript friction for dynamic boundaries without weakening compile-time safety everywhere.
- Make lint results actionable: flag `any` where it tends to spread, but allow it where it is mainly noise.

## Non-goals
- Rewriting core generics to eliminate all `any`.
- Introducing runtime schema validation libraries or new dependencies.

## Policy (proposed)
1. Keep `tsconfig` strict mode as-is; do not relax compiler safety nets.
2. Permit explicit `any` in these locations by default:
   - Unit tests (`**/*.test.ts`, `**/*.test.tsx`)
   - Test helpers (`lib/test/**`)
   - Infrastructure/boundary modules where typing is disproportionate:
     - `lib/state/**` (generic persistence/indexing)
     - `lib/background/**` (message routing / browser runtime integration)
     - `lib/api/transport/**` (browser/service-worker globals)
3. Keep `@typescript-eslint/no-explicit-any` as `error` outside the allowed locations.
4. Constrain the blast radius:
   - Avoid exporting `any`-typed values or APIs from shared modules; prefer returning a typed value, or `unknown` if truly untyped.
   - Prefer local casts (`const x = value as any`) over widening public types.
   - If `any` is used in non-allowed locations, require a one-line justification via `eslint-disable-next-line` (apply stage implementation detail).

## Enforcement (apply stage)
- ESLint overrides define allowed file globs for `@typescript-eslint/no-explicit-any`.
- Optional follow-up: add a small shared type alias module (e.g., `types/unsafe.ts`) if repeated patterns appear, but only if it clearly reduces duplication.

