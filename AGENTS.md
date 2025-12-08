# Repository Guidelines

## Project Structure & Module Organization
The extension follows the WXT layout: `entrypoints/background.ts` holds service-worker logic, `entrypoints/content.ts` injects DOM helpers, and `entrypoints/popup/` contains the React UI (`main.tsx`, `App.tsx`, component styles). Shared icons live in `assets/`, while `public/` hosts static manifest assets bundled untouched. Project-wide options sit in `wxt.config.ts` and `tsconfig.json`, and the `@/` alias resolves to the repo root so cross-entry modules stay declarative.

## Build, Test, and Development Commands
- `bun install`: install dependencies recorded in `bun.lock`.
- `bun run dev` / `bun run dev:firefox`: launch the WXT dev server with hot reloading in Chromium or Firefox.
- `bun run build` (or `build:firefox`): produce the production-ready `.output/` bundle.
- `bun run zip` and `zip:firefox`: emit signed zip packages for store uploads.
- `bun run compile`: type-check the project with `tsc --noEmit` before pushing.

## Coding Style & Naming Conventions
Use TypeScript, React function components, and hooks. Prefer 2-space indentation and avoid default exports except for entry roots. Name React components in `PascalCase`, hooks/utilities in `camelCase`, and background jobs in `verbNoun` form. Keep imports grouped (packages, aliases, relatives) and rely on the `@/` alias for shared modules to prevent deep relative paths. Update CSS modules in `popup/*.css` together with the TSX they style.
When working with anything related to the coss component library, consult `docs/coss.md` for the latest usage notes and component references.

## Storage & State Rules
Before touching any persistent or cross-context data, read `docs/storage-state-rules.md` and follow every mandatory rule in it: declare storage items under `lib/state` via `storage.defineItem`, keep stores in the Zustand vanilla + `hydrate/ready` pattern, access state from React only through selector hooks, and never interact with `browser.storage*`/`localStorage` directly. Code reviews will enforce this document.

## Third-Party Dependency Policy
Before introducing, upgrading, or otherwise working with any third-party dependency, you must first use Context7 (resolve-library-id + get-library-docs) to gather the latest documentation context, and only proceed to design or implement changes after that context is established.

## Security & Configuration Tips
Store secrets in local `.env` files loaded by WXT; never hard-code API keys inside `entrypoints`. Review `public/manifest.json` before release to ensure permissions are minimal, and double-check external URLs referenced from `content.ts`.
