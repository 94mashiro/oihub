# repo-organization Specification

## Purpose
TBD - created by archiving change refactor-repo-organization. Update Purpose after archive.
## Requirements
### Requirement: WXT-Oriented Repository Layout
The repository SHALL organize code into clear top-level layers aligned with WXT entrypoints:

- `entrypoints/`: runtime entrypoints only (`background.ts`, `content.ts`, `popup/*`)
- `components/`: UI components (coss-based), no direct storage access
- `hooks/`: side-effect orchestration between UI and services/stores
- `lib/`: shared runtime logic (api/background/state/utils/constants)
- `types/`: domain type definitions used across layers

#### Scenario: Adding a new popup feature
- **WHEN** a new popup feature requires UI + side effects + API calls
- **THEN** the UI MUST be implemented under `components/`
- **AND** side effects MUST be implemented under `hooks/`
- **AND** API/service logic MUST be implemented under `lib/api/`
- **AND** the popup entrypoint MUST remain a thin composition layer under `entrypoints/popup/`

#### Scenario: Adding background functionality
- **WHEN** new service-worker background functionality is needed
- **THEN** it MUST be implemented as a module under `lib/background/modules/`
- **AND** `entrypoints/background.ts` MUST remain a thin bootstrap that registers modules

### Requirement: Single Source of Truth for Utilities
All runtime utility functions SHALL live under `lib/utils/` (or `lib/utils.ts` for shared helpers like `cn`) and SHALL be imported via `@/lib/utils/...` (or `@/lib/utils`).

#### Scenario: Formatting numbers for display
- **WHEN** a UI component needs number formatting
- **THEN** it imports the formatter from `@/lib/utils/...`
- **AND** the repository MUST NOT maintain a parallel runtime utility source under `utils/`

### Requirement: Stable Domain Type Imports
Domain types SHALL be imported from `@/types/*` and the `types/` folder SHALL contain type definitions only (no runtime side effects required at import time).

#### Scenario: Sharing tenant types across layers
- **WHEN** a store, service, and component all need `Tenant`/`TenantInfo`
- **THEN** they import the types from `@/types/tenant`
- **AND** importing these types MUST NOT trigger runtime work (e.g., storage reads, network calls)

### Requirement: Cross-Context Boundary Enforcement
Popup UI and shared libraries SHALL NOT import browser-entrypoint code directly. Cross-context communication MUST go through shared `lib/background` message types and transport abstractions.

#### Scenario: Popup triggers a background fetch proxy request
- **WHEN** popup code needs to bypass CORS for an API request
- **THEN** it calls a shared transport (e.g., via `lib/api/transport/*`)
- **AND** it MUST NOT import or call `entrypoints/background.ts` directly

