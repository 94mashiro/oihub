## ADDED Requirements

### Requirement: TypeScript strict compilation remains enabled
The system SHALL keep TypeScript compilation in `strict` mode and SHALL NOT relax compiler safety options to address typing friction.

#### Scenario: Developer runs type-check
- **WHEN** a developer runs `bun run compile`
- **THEN** TypeScript MUST type-check with `strict` enabled

### Requirement: Explicit `any` is permitted only in scoped locations
The system SHALL permit explicit `any` only in a limited, documented set of locations where typing is disproportionately costly (e.g., tests and boundary/infrastructure modules).

#### Scenario: Writing a unit test that mocks browser APIs
- **WHEN** a unit test needs to patch globals or mock untyped runtime behavior
- **THEN** the test MAY use `any` to avoid non-essential type modeling

#### Scenario: Implementing boundary glue code
- **WHEN** code integrates with browser/service-worker globals or dynamic message payloads
- **THEN** it MAY use `any` locally to bridge untyped boundaries
- **AND** it SHOULD avoid exporting `any`-typed APIs across module boundaries

### Requirement: Lint enforces the scoped `any` policy
The system SHALL configure linting so that explicit `any` is rejected outside the approved scope and allowed within it.

#### Scenario: Linting application feature code
- **WHEN** a developer runs `bun run lint`
- **THEN** explicit `any` in non-approved locations MUST be reported as an error

#### Scenario: Linting tests and boundary modules
- **WHEN** a developer runs `bun run lint`
- **THEN** explicit `any` in approved locations MUST NOT be reported as an error

