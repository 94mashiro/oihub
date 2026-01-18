<!--
Sync Impact Report
- Version change: N/A (template) -> 1.0.0
- Modified principles:
  - Template principle 1 -> I. Cross-Browser Isomorphism
  - Template principle 2 -> II. UX Consistency and Vercel/Linear Minimalism
  - Template principle 3 -> III. Code Quality and Architecture Discipline
  - Template principle 4 -> IV. Testing Standards and Regression Safety
  - Template principle 5 -> V. Performance-First Delivery
- Added sections: Architecture and Platform Constraints; Delivery Workflow and Quality Gates
- Removed sections: None
- Templates requiring updates:
  - OK .specify/templates/plan-template.md
  - OK .specify/templates/spec-template.md
  - OK .specify/templates/tasks-template.md
  - PENDING .specify/templates/commands/*.md (directory not present)
- Follow-up TODOs: None
-->
# OiHub Extension Constitution

## Core Principles

### I. Cross-Browser Isomorphism
- MUST ship the same user-visible features and UI in Chrome and Firefox.
- MUST keep browser-specific handling behind explicit adapters and document any parity
  gaps in the spec and tasks.
- MUST verify critical user flows in both browsers before release.

Rationale: Parity preserves trust, reduces support load, and avoids store review risk.

### II. UX Consistency and Vercel/Linear Minimalism
- MUST compose UI from coss components in `components/ui/` and style with Tailwind
  `cn()` plus semantic tokens only.
- MUST follow `docs/ui-design-rules.md` for spacing, typography, accessibility, and
  form patterns; no raw Tailwind colors or ad hoc overrides.
- MUST keep layouts minimal and refined: one visual idea per component, clear
  hierarchy, and generous whitespace.

Rationale: A consistent, elegant UI ensures clarity and reinforces brand quality.

### III. Code Quality and Architecture Discipline
- MUST use TypeScript strictness, avoid `any`, and keep module boundaries explicit.
- MUST follow the architecture layers (components -> hooks -> services -> client
  -> transport) and call APIs only via `TenantAPIService`.
- MUST manage state via `createStore` in `lib/state/` and guard UI with `ready`
  checks before rendering forms.
- MUST follow naming conventions (kebab-case modules, PascalCase components) and
  avoid default exports except entry roots.

Rationale: Strong boundaries and typing preserve maintainability at scale.

### IV. Testing Standards and Regression Safety
- MUST add or update automated tests for new logic, parsing, or user workflows; if
  automation is not feasible, document a manual test plan and justification.
- MUST validate cross-browser behavior for user-facing changes in both Chrome and
  Firefox.
- MUST keep API types, adapters, and response schemas synchronized when any of
  them change.

Rationale: Tests and parity checks prevent regressions and drift.

### V. Performance-First Delivery
- MUST define measurable performance budgets for each feature (latency, memory,
  bundle size) in the spec.
- MUST avoid long tasks on the popup UI thread; move heavy work to background or
  async flows.
- MUST prevent redundant work by batching requests and minimizing re-renders.

Rationale: The extension must feel instant and remain efficient on all devices.

## Architecture and Platform Constraints

- Use WXT entrypoints (`entrypoints/background.ts`, `entrypoints/content.ts`,
  `entrypoints/popup/`) and the `@/` alias for shared logic.
- Build UI by composing coss components; keep business logic in `components/biz/`
  and `components/biz-screen/` rather than editing `components/ui/`.
- Implement all persistent state in `lib/state/<feature>-store.ts` via
  `createStore` with `persist()` and `ready` hydration.
- Route all API calls through `TenantAPIService` and `apiClient` with typed
  responses and `APIError` handling.
- Store secrets in local `.env` files and keep `public/manifest.json` permissions
  minimal.

## Delivery Workflow and Quality Gates

- Every spec and plan MUST include a Constitution Check covering cross-browser
  parity, UX consistency, testing strategy, and performance budgets.
- Before merge, `bun run compile`, `bun run lint`, and relevant tests MUST pass;
  cross-browser validation steps must be recorded.
- Code review MUST confirm coss usage, semantic tokens, `ready` guards,
  `createStore`, and `TenantAPIService` usage.
- Any exception to these gates requires explicit documentation and a follow-up
  task to restore compliance.

## Governance

- This constitution is authoritative; conflicting practices require amendment, not
  exemption.
- Amendments require a documented rationale, impact summary, and semantic version
  bump. Major changes require team sign-off; minor or patch changes require
  maintainer approval.
- Versioning follows semantic rules: MAJOR for incompatible principle changes,
  MINOR for new or materially expanded guidance, PATCH for clarifications.
- Compliance is verified during planning and code review; non-compliant work is
  blocked until resolved or formally waived.

**Version**: 1.0.0 | **Ratified**: 2026-01-18 | **Last Amended**: 2026-01-18
