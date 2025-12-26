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

**File Naming Convention (MANDATORY):**
- All TypeScript/JavaScript files MUST use `kebab-case` naming: `use-one-api-client.ts`, `tenant-store.ts`, `api-service.ts`
- React component files MUST use `PascalCase`: `TenantSelector.tsx`, `ApiKeyForm.tsx`
- Test files follow their target: `use-one-api-client.test.ts`, `TenantSelector.test.tsx`
- Configuration files follow their ecosystem convention: `wxt.config.ts`, `tsconfig.json`
- NEVER use `camelCase` or `PascalCase` for non-component module files

## Documentation References

Before working on specific areas, read the corresponding documentation:

| Area | Document | Key Points |
|------|----------|------------|
| UI Components | `docs/ui-design-rules.md` | coss components, semantic colors, spacing, forms |
| Component Catalog | `docs/coss.md` | 48 available components in `components/ui/` |
| State Management | `docs/storage-state-rules.md` | `createStore` pattern, `ready` state, `persist()` |
| API Calls | `docs/api-architecture.md` | `TenantAPIService`, no direct `APIClient` |

**Critical Rules (enforced in code review):**
- All UI uses coss components + Tailwind `cn()` + semantic CSS variables
- All stores use `createStore` from `lib/state/create-store.ts`
- All API calls go through `TenantAPIService` in `lib/api/services/`
- Check store `ready` state before rendering forms

## Third-Party Dependency Policy
Before introducing, upgrading, or otherwise working with any third-party dependency, you must first use Context7 (resolve-library-id + get-library-docs) to gather the latest documentation context, and only proceed to design or implement changes after that context is established.

## Security & Configuration Tips
Store secrets in local `.env` files loaded by WXT; never hard-code API keys inside `entrypoints`. Review `public/manifest.json` before release to ensure permissions are minimal, and double-check external URLs referenced from `content.ts`.

## Active Technologies
- TypeScript 5.x (strict mode) + WXT (browser extension framework), Zustand (state management), React 18, Tailwind CSS (001-store-field-abstraction)
- WXT storage API (chrome.storage.local/sync abstraction) (001-store-field-abstraction)
- TypeScript 5.9.2 (strict mode) + WXT (browser extension framework), Zustand (state management), React 18 (002-platform-api-service)

## Recent Changes
- 001-store-field-abstraction: Added TypeScript 5.x (strict mode) + WXT (browser extension framework), Zustand (state management), React 18, Tailwind CSS
