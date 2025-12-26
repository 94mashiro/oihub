# Implementation Plan: Tenant Form Reuse

**Branch**: `001-tenant-form-reuse` | **Date**: 2025-12-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-tenant-form-reuse/spec.md`

## Summary

Refactor tenant form components to share implementation between `popup-tenant-create-screen` and `popup-tenant-edit-screen`. Extract common form fields (name, URL, token, user ID, platform type) into a shared component while keeping screen-specific elements (header, footer, presets) separate. Goal: reduce maintenance cost by 50% through code consolidation.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: React 18, WXT (browser extension framework), Zustand (state management), Tailwind CSS
**Storage**: WXT storage API (chrome.storage.local/sync abstraction)
**Testing**: Manual testing (no automated tests required for this refactoring)
**Target Platform**: Browser extension (Chrome, Firefox)
**Project Type**: Browser extension with React popup UI
**Performance Goals**: Popup TTI < 100ms (per constitution)
**Constraints**: Bundle size < 500KB gzip, no breaking changes to existing functionality
**Scale/Scope**: 2 screens affected, ~300 lines of code to consolidate

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality First | ✅ PASS | Will use coss components, createStore pattern, TenantAPIService, kebab-case naming |
| II. Testing Standards | ✅ PASS | No new tests required (refactoring existing functionality) |
| III. User Experience Consistency | ✅ PASS | Preserving existing UI/UX, loading states, error handling |
| IV. Performance Requirements | ✅ PASS | No performance impact expected (code consolidation only) |
| V. Security & Configuration | ✅ PASS | No changes to security model or configuration |

**Gate Result**: PASS - No violations, proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-tenant-form-reuse/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
components/
├── biz-screen/
│   ├── popup-tenant-create-screen/
│   │   └── index.tsx           # Will import shared form
│   ├── popup-tenant-edit-screen/
│   │   └── index.tsx           # Will import shared form
│   └── tenant-form/            # NEW: Shared form component
│       └── index.tsx
└── ui/                         # Existing coss components
```

**Structure Decision**: Single shared component in `components/biz-screen/tenant-form/` following existing project conventions. Both screen components will import and use this shared form.

## Complexity Tracking

> No violations to justify - all constitution gates pass.
