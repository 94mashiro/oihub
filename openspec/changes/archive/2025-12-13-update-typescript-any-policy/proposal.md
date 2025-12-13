# Change: Update TypeScript any policy to unblock lint and reduce friction

## Why
`bun run compile` currently passes, but `bun run lint` fails primarily due to `@typescript-eslint/no-explicit-any`. This creates high friction when working with dynamic boundaries (tests, mocking, browser globals, storage/JSON, message routing) where fully modeling types is not always worth the cost.

## What Changes
- Allow explicit `any` in narrowly-scoped, documented places to avoid non-essential type modeling work.
- Keep TypeScript `strict` compilation unchanged; focus on lint policy and usage boundaries.
- Make `bun run lint` pass by addressing remaining non-`any` lint failures that block CI (e.g., `no-unused-vars`, `no-constant-binary-expression`).
- Document the new policy so contributors know when `any` is acceptable vs. when stronger typing is expected.

## Impact
- Affected specs: new capability `type-safety-policy` (added)
- Affected code/config (apply stage): `eslint.config.js`, selected files under `lib/**` and tests, and project conventions (`openspec/project.md`)
- Risk: broader `any` usage can hide bugs; mitigated by constraining allowed locations and requiring localized usage patterns.

## Open Questions (need confirmation)
- Should `any` be allowed only in tests + infrastructure/boundary modules (`lib/state`, `lib/background`, `lib/api/transport`), or also in feature code (`components/`, `hooks/`, `lib/api/services`)?
- Do you prefer:
  - Option A: keep `@typescript-eslint/no-explicit-any` as `error` with targeted overrides (stricter)
  - Option B: set it to `off` globally (fastest, least guardrails)

