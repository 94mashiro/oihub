# UI Design & Component Usage Rules

## Quick Reference (Core Rules)

**Component Selection:**
- All UI components MUST use coss library from `components/ui/` (see `docs/coss.md` for catalog)
- Never modify `components/ui/` for business logic - create wrappers in `components/biz/`
- Style exclusively with Tailwind utilities using `cn()` helper

**Color System:**
- Use semantic CSS variables only: `bg-background`, `text-foreground`, `bg-primary`, etc.
- Never use raw Tailwind colors like `bg-blue-500`
- Dark mode is automatic via semantic tokens - avoid manual `dark:` overrides

**Spacing Scale:**
- `gap-2` (8px): Button groups, field internal gaps
- `gap-3` (12px): Popup padding, section gaps
- `gap-4` (16px): Form field spacing (standard)
- `gap-6` (24px): Card section spacing

**Typography:**
- `text-xl font-semibold`: Screen titles
- `text-lg font-semibold`: Card titles
- `text-sm font-medium`: Labels, buttons
- `text-xs text-muted-foreground`: Metadata
- Never use `font-bold` - use `font-semibold` instead

**Form Pattern:**
- Always check store `ready` state before rendering forms
- Use Field/FieldLabel/FieldControl/FieldError composition
- Stack fields vertically (never side-by-side in 560×420px popup)
- Action buttons: right-aligned, Cancel + Primary order

**Accessibility:**
- Icon buttons MUST have `aria-label`
- Form inputs MUST have associated labels via `htmlFor`
- Use `focus-visible:ring-2` for keyboard focus states

---

## Design Philosophy

**Core Principles:**
1. **Simplicity**: One visual idea per component
2. **Refinement**: Subtle shadows, precise borders (12% alpha), smooth 200ms transitions
3. **Minimalism**: Trust whitespace, remove decoration until it hurts
4. **Breathing Room**: Minimum `gap-4` between major sections

---

## Component Organization

```
components/
├── ui/              # coss components ONLY (never modify for business logic)
├── biz/             # Business components (compose 2-4 coss components)
└── biz-screen/      # Screen-level components (routed pages)
```

**Modification Policy:**
```tsx
// ✅ CORRECT: Compose and extend in biz/
import { Button } from '@/components/ui/button';
export function TenantActionButton({ tenant, ...props }) {
  return <Button variant="outline" size="sm" {...props}>{tenant.name}</Button>;
}

// ❌ INCORRECT: Don't add business variants to ui/ files
```

---

## Color & Theming

**Semantic Tokens (defined in `assets/tailwind.css`):**

| Purpose | Light | Dark |
|---------|-------|------|
| Surfaces | `bg-background`, `bg-card`, `bg-muted` | Auto-switches |
| Text | `text-foreground`, `text-muted-foreground` | Auto-switches |
| Interactive | `bg-primary`, `bg-secondary`, `bg-destructive` | Auto-switches |
| Status | `bg-success`, `bg-warning`, `bg-info` | Auto-switches |

**Alpha Composition:**
- `/4` (4%): Subtle accents, muted surfaces
- `/8` (8%): Status backgrounds
- `/32` (32%): Borders, hover states
- `/64` (64%): Disabled opacity

```tsx
// ✅ CORRECT
<div className="bg-card text-card-foreground" />
<div className="bg-destructive/4 border-destructive/32" />

// ❌ INCORRECT
<div className="bg-white dark:bg-black" />
<div className="bg-blue-500 text-white" />
```

---

## Layout Patterns

**Screen Layout Template:**
```tsx
<div className="flex flex-col h-full gap-4 p-4">
  <h1 className="text-xl font-semibold">Screen Title</h1>
  <div className="flex-1 overflow-y-auto">{/* Content */}</div>
  <div className="flex gap-2 justify-end border-t pt-4">{/* Actions */}</div>
</div>
```

**Form Layout:**
```tsx
<Form className="flex flex-col gap-4">
  <Field>
    <FieldLabel htmlFor="email">Email</FieldLabel>
    <FieldControl render={() => <Input id="email" type="email" required />} />
    <FieldError match="valueMissing">Email is required</FieldError>
  </Field>
  <div className="flex gap-2 justify-end">
    <Button variant="outline">Cancel</Button>
    <Button type="submit">Save</Button>
  </div>
</Form>
```

**Card Layout:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Settings</CardTitle>
    <CardDescription>Manage preferences</CardDescription>
  </CardHeader>
  <CardPanel>{/* Content */}</CardPanel>
</Card>
```

---

## Button Patterns

| Variant | Usage |
|---------|-------|
| `default` | Primary CTA (one per section) |
| `outline` | Secondary actions (most common) |
| `ghost` | Subtle inline actions |
| `destructive` | Danger actions |
| `link` | Text links |

| Size | Height | Usage |
|------|--------|-------|
| `default` | 32px | Standard buttons |
| `sm` | 28px | Compact forms |
| `lg` | 36px | Prominent CTAs |
| `icon` | 32px | Icon-only buttons |

```tsx
// Icon button with accessibility
<Button size="icon" aria-label="Close dialog"><XIcon /></Button>

// Loading state
<Button disabled={isSubmitting}>
  {isSubmitting ? <><Spinner className="size-4" />Saving...</> : 'Save'}
</Button>
```

---

## Form Validation

**Browser Validation (preferred):**
```tsx
<Field>
  <FieldLabel htmlFor="username">Username</FieldLabel>
  <FieldControl render={() => (
    <Input id="username" required minLength={3} maxLength={50} pattern="[a-zA-Z0-9_]+" />
  )} />
  <FieldError match="valueMissing">Username is required</FieldError>
  <FieldError match="tooShort">Minimum 3 characters</FieldError>
  <FieldError match="patternMismatch">Only letters, numbers, underscores</FieldError>
</Field>
```

**State Handling:**
```tsx
const ready = useTenantStore((state) => state.ready);
if (!ready) return <div className="text-sm text-muted-foreground">Loading...</div>;

// Or use StoreReadyGuard
<StoreReadyGuard store={tenantStore} fallback={<Spinner />}>
  <Form />
</StoreReadyGuard>
```

---

## Interactive States

All interactive components must define:
- Default state
- Hover: `hover:bg-accent` or `hover:bg-primary/90`
- Focus: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1`
- Disabled: `disabled:opacity-64 disabled:pointer-events-none`

**Transitions:**
- `duration-200`: Most interactions
- `duration-150`: Quick feedback (hover)
- `duration-300`: Modal open/close

---

## Accessibility Checklist

- [ ] Icon buttons have `aria-label`
- [ ] Form inputs have `<FieldLabel htmlFor="...">`
- [ ] Required fields use HTML5 `required` attribute
- [ ] Loading states have `aria-busy={true}`
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Keyboard navigation works (Tab, Enter, Escape)

---

## Do's and Don'ts

**Components:**
```tsx
// ✅ DO: Use coss components
<Button variant="outline">Cancel</Button>
<Input type="email" placeholder="Email" />

// ❌ DON'T: Use raw HTML
<button className="...">Submit</button>
<input type="text" />
```

**Colors:**
```tsx
// ✅ DO: Semantic tokens
<div className="bg-background text-foreground" />
<span className="text-muted-foreground">Secondary</span>

// ❌ DON'T: Raw colors
<div className="bg-slate-100 text-gray-900" />
```

**Layout:**
```tsx
// ✅ DO: Semantic spacing
<div className="flex flex-col gap-4">...</div>

// ❌ DON'T: Arbitrary values
<div className="mt-[13px]">...</div>
```

**Typography:**
```tsx
// ✅ DO: Semantic weights
<h1 className="text-xl font-semibold">Heading</h1>

// ❌ DON'T: font-bold
<h1 className="font-bold">...</h1>
```

---

## Reference Links

- **Component Catalog**: `docs/coss.md`
- **State Management**: `docs/storage-state-rules.md`
- **CSS Variables**: `assets/tailwind.css` (lines 50-104)
- **Base UI**: https://base-ui.com/
- **Tailwind CSS v4**: https://tailwindcss.com/
