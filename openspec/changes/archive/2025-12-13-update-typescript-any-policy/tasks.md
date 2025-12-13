## 1. Implementation
- [ ] Decide the allowed scope for explicit `any` (tests only vs. boundary modules vs. global)
- [ ] Update `eslint.config.js` with file-based overrides for `@typescript-eslint/no-explicit-any`
- [ ] Standardize existing `any` usage to match the agreed policy (localized casts, avoid exporting `any`-typed APIs)
- [ ] Fix remaining lint blockers unrelated to `any` so `bun run lint` passes
- [ ] Update project conventions in `openspec/project.md` to reflect the new policy (replace "TypeScript no any" with the scoped rule)

## 2. Validation
- [ ] Run `bun run compile`
- [ ] Run `bun run lint`
- [ ] Run `bun test`

