<!--
Sync Impact Report
==================
Version change: 1.0.0 → 1.1.0
Modified principles: N/A
Added sections:
  - Principle VI: Implementation ROI & Pragmatism
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (Complexity Tracking section already supports justification model)
  - .specify/templates/spec-template.md ✅ (Requirements section compatible with ROI-driven prioritization)
  - .specify/templates/tasks-template.md ✅ (User story priority structure aligns with ROI focus)
Follow-up TODOs: None
-->

# OiHub Extension Constitution

## Core Principles

### I. Code Quality First

All code MUST adhere to established patterns and conventions:

- TypeScript strict mode enabled; no `any` types without explicit justification
- All UI components MUST use coss components from `components/ui/` with Tailwind `cn()` utility
- All state management MUST use `createStore` pattern from `lib/state/create-store.ts`
- All API calls MUST route through `TenantAPIService` in `lib/api/services/`
- File naming MUST follow conventions: `kebab-case` for modules, `PascalCase` for React components
- Imports MUST use `@/` alias for shared modules; no deep relative paths beyond two levels
- Code MUST pass `bun run compile` (tsc --noEmit) before merge

### II. Testing Standards

Testing ensures reliability without mandating TDD for all changes:

- Unit tests MUST cover business logic in services and utilities when explicitly requested
- Integration tests MUST verify cross-module interactions when feature scope warrants
- All tests MUST be independently runnable and deterministic
- Test files MUST follow naming convention: `[target].test.ts` or `[Target].test.tsx`
- Mocking SHOULD be minimal; prefer real implementations where feasible
- Tests MUST NOT depend on external services or network calls without explicit mocking

### III. User Experience Consistency

UI/UX MUST maintain visual and behavioral coherence:

- All UI MUST use semantic CSS variables defined in the design system
- Interactive elements MUST provide immediate visual feedback (hover, active, disabled states)
- Loading states MUST be shown for any operation exceeding 200ms
- Error states MUST be user-friendly with actionable guidance
- Store `ready` state MUST be checked before rendering forms or data-dependent UI
- Accessibility MUST be maintained: proper ARIA labels, keyboard navigation, color contrast

### IV. Performance Requirements

Performance budgets ensure responsive user experience:

- Popup initial render MUST complete within 100ms
- Background script MUST NOT block on synchronous operations exceeding 50ms
- Bundle size MUST NOT exceed 500KB for popup entry (gzipped)
- API calls MUST implement timeout handling (default: 10s)
- Memory leaks MUST be prevented: cleanup subscriptions, event listeners, intervals
- Content script injection MUST NOT degrade page performance measurably

### V. Security & Configuration

Security practices protect user data and extension integrity:

- Secrets MUST be stored in `.env` files; NEVER hard-coded in source
- Manifest permissions MUST be minimal and justified
- External URLs in content scripts MUST be explicitly allowlisted
- User data MUST NOT be logged or transmitted without explicit consent
- Input validation MUST occur at system boundaries (user input, API responses)

### VI. Implementation ROI & Pragmatism

Implementation solutions MUST optimize for return on investment, maintainability, and extensibility, in that priority order:

**Priority hierarchy**: ROI >> Maintainability > Extensibility

- **ROI (Return on Investment)**: Solutions MUST deliver maximum value with minimum effort
  - Choose the simplest approach that solves the immediate problem
  - Prefer built-in platform features over custom abstractions
  - Avoid premature optimization and over-engineering
  - Question whether a feature is needed before implementing it
  - Reject solutions that add complexity without proportional value
- **Maintainability**: Code MUST be understandable and modifiable
  - Prioritize code clarity over cleverness
  - Prefer explicit, verbose code over terse, implicit patterns when clarity improves
  - Keep functions small and focused on single responsibilities
  - Document non-obvious decisions with rationale comments
  - Avoid tight coupling between unrelated modules
- **Extensibility**: Design SHOULD accommodate growth without rewrite
  - Use interfaces and dependency injection only when variation is certain
  - Defer abstraction until duplication proves the need
  - Prefer composition over inheritance
  - Keep extension points explicit and documented
  - Accept that refactoring is cheaper than wrong abstractions

**Trade-off Guidance**:
- When ROI conflicts with maintainability: Choose ROI if code will rarely change; choose maintainability if code is frequently modified
- When maintainability conflicts with extensibility: Choose maintainability; refactor when extension is actually needed
- When in doubt, solve today's problem well rather than tomorrow's problem poorly

**Rationale**: This principle prevents gold-plating, over-abstraction, and speculative features that burden the codebase without delivering user value. It enforces pragmatic engineering that ships working software quickly while remaining adaptable to real requirements as they emerge.

## Performance Standards

| Metric | Target | Measurement |
|--------|--------|-------------|
| Popup TTI | < 100ms | Chrome DevTools Performance |
| Background wake | < 50ms | Service worker activation time |
| Bundle size (popup) | < 500KB gzip | Build output analysis |
| API timeout | 10s default | Configurable per endpoint |
| Memory growth | < 10MB/hour | Chrome Task Manager |

## Development Workflow

### Pre-Commit Requirements

1. `bun run compile` MUST pass (type checking)
2. Linting errors MUST be resolved
3. New dependencies MUST be documented with Context7 research

### Code Review Gates

- All PRs MUST verify compliance with Core Principles
- UI changes MUST include visual verification
- Performance-sensitive changes MUST include benchmark data
- Security-relevant changes MUST be flagged for additional review

### Documentation Requirements

- Public APIs MUST have JSDoc comments
- Complex logic SHOULD include inline rationale comments
- Breaking changes MUST be documented in commit message

## Governance

This constitution supersedes all other development practices for this repository.

**Amendment Process**:
1. Propose change with rationale in PR
2. Document impact on existing code
3. Update version following semver (MAJOR: breaking, MINOR: additions, PATCH: clarifications)
4. Propagate changes to dependent templates

**Compliance**:
- All PRs MUST verify adherence to Core Principles
- Violations MUST be justified in PR description with complexity tracking
- Use `CLAUDE.md` for runtime development guidance

**Version**: 1.1.0 | **Ratified**: 2025-12-25 | **Last Amended**: 2025-12-28
