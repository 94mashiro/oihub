# UI Design & Component Usage Rules

## Context

This WXT browser extension uses **coss UI** - a collection of beautifully designed, accessible components built on Base UI and styled with Tailwind CSS. The extension's popup interface operates within a fixed 560×420px viewport, requiring careful attention to layout, spacing, and component composition. This document standardizes UI patterns aligned with **shadcn** and **Vercel** design principles: simplicity, refinement, and minimalism.

## Design Philosophy

**Core Principles:**
1. **Simplicity**: One visual idea per component. Avoid mixing multiple concepts in a single UI element.
2. **Refinement**: Subtle shadows, precise borders (12% alpha), smooth transitions. Quality over quantity.
3. **Minimalism**: Remove decoration until it hurts, then add back exactly one element. Trust whitespace.
4. **Breathing Room**: Generous spacing (minimum gap-4 between major sections), uncluttered layouts, clear hierarchy.

**When to Consult This Document:**
- Before building any user-facing component or screen
- When choosing between layout approaches for the popup
- When implementing forms with validation
- When adding colors, typography, or interactive states
- When ensuring accessibility compliance (ARIA, keyboard nav, screen readers)

---

## Component Selection Guidelines

### Component Hierarchy Decision Tree

**Step 1: Check coss library** (see `docs/coss.md`)
- 48 components available in `components/ui/`
- Built on Base UI primitives with full accessibility support
- Styled with Tailwind CSS using semantic CSS variables

**Step 2: Determine if component exists**
- ✅ **Component exists** → Use it directly (e.g., Button, Input, Form, Card)
- ⚠️ **Similar component exists** → Compose/extend from coss primitive (e.g., TenantSelector extends Select)
- ❌ **No match** → Create custom component following established patterns

### Organization Rules

**Mandatory Directory Structure:**

```
components/
├── ui/              # coss components ONLY (48 files, copy-paste owned)
│   ├── button.tsx   # Never modify for business logic
│   ├── input.tsx
│   ├── select.tsx
│   └── ...
├── biz/             # Business components built from coss primitives
│   └── tenant-select/
│       └── index.tsx  # Composes Select + custom logic
└── biz-screen/      # Screen-level components (routed pages)
    ├── popup-main-screen/
    └── popup-tenant-create-screen/
```

**Rules:**
- `components/ui/` - **Never modify for business-specific logic.** These are owned coss components.
- `components/biz/` - Compose 2-4 coss components with business logic.
- `components/biz-screen/` - Full screen layouts that compose biz components.

### Modification Policy

✅ **CORRECT: Compose and extend**
```tsx
// components/biz/tenant-action-button/index.tsx
import { Button } from '@/components/ui/button';

export function TenantActionButton({ tenant, ...props }: TenantActionButtonProps) {
  return (
    <Button variant="outline" size="sm" {...props}>
      {tenant.name}
    </Button>
  );
}
```

❌ **INCORRECT: Don't modify ui/ files for business logic**
```tsx
// components/ui/button.tsx - NEVER ADD THIS
const buttonVariants = cva("...", {
  variants: {
    variant: {
      default: '...',
      tenantAction: '...', // ❌ Business-specific variant in ui/
    }
  }
});
```

---

## Design Principles: Shadcn/Vercel Style

### Visual Language

**Simplicity:**
- One call-to-action per screen section
- Limit color accents to 1-2 per view
- Use text hierarchy instead of multiple colors

**Refinement:**
- Subtle shadows with alpha transparency (`shadow-xs`, `shadow-sm`)
- Translucent borders at 12% opacity (`border-border`)
- Smooth 200ms transitions on interactive elements

**Minimalism:**
- Default to removing visual elements
- Prefer spacing over borders for separation
- Use semantic colors exclusively (no raw Tailwind colors like `bg-blue-500`)

**Breathing Room:**
- Minimum `gap-4` (16px) between form fields
- Generous padding: `p-3` (12px) or `p-4` (16px) for screens
- Card internal spacing: `gap-6` (24px) between sections

### Hierarchy Through Scale & Weight

**Type Scale:**
```css
text-xl font-semibold       /* Screen titles (20px) */
text-lg leading-none        /* Card titles (18px) */
text-base font-medium       /* Emphasized body (16px) */
text-sm                     /* Body text, buttons, labels (14px) */
text-xs text-muted-foreground /* Metadata, descriptions (12px) */
```

**Weight Scale:**
```css
font-semibold (600)  /* Headings, card titles - NEVER use font-bold */
font-medium (500)    /* Buttons, field labels, emphasis */
font-normal (400)    /* Body text, descriptions */
```

**Opacity Scale:**
```css
opacity-100 (100%)   /* Primary content */
opacity-72 (72%)     /* Secondary icons */
opacity-64 (64%)     /* Disabled states */
/* Use text-muted-foreground for secondary text instead of opacity */
```

### Borders & Shadows (Subtle Depth)

**Borders: Translucent, context-aware**
```tailwind
border-border          /* Standard borders (12% alpha black/white) */
border-destructive/32  /* Status-colored borders (32% alpha) */
border-primary/32      /* Accent borders */
```

**Shadows: Layered realism**
```tailwind
shadow-xs   /* Component elevation (buttons, cards) - 0px 1px 2px */
shadow-sm   /* Slight lift (inputs focus, select popups) */
shadow-md   /* Popovers, tooltips */
shadow-lg   /* Dialogs, sheets */
```

**Internal Depth: before pseudo-elements**
```tailwind
/* Light mode: inner highlight at top */
before:shadow-[0_1px_--theme(--color-white/16%)]

/* Dark mode: inner highlight at bottom */
dark:before:shadow-[0_-1px_--theme(--color-white/8%)]
```

### Popup Constraint Optimization (560×420px)

**Critical Requirements:**
- ✅ Vertical scrolling preferred over horizontal
- ✅ Stack all form fields vertically (never side-by-side)
- ✅ Use sticky headers for forms/dialogs within popup if needed
- ✅ Max content width: 420px (accounting for padding)
- ✅ Recommended padding: `p-3` (12px) or `p-4` (16px)

**Button Groups:**
```tsx
// Horizontal buttons at bottom (recommended)
<div className="flex gap-2 justify-end">
  <Button variant="outline">Cancel</Button>
  <Button>Submit</Button>
</div>

// Full-width mobile, auto desktop (if responsive needed)
<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
  <Button className="sm:w-auto">Cancel</Button>
  <Button className="sm:w-auto">Submit</Button>
</div>
```

---

## Layout & Spacing Rules

### Spacing Scale (Tailwind v4)

**Semantic Spacing Values:**
```
0.5 = 2px   - Micro gaps (badge internal spacing)
1   = 4px   - Tight icon gaps
1.5 = 6px   - Compact layouts
2   = 8px   - Field internal gaps, button groups
3   = 12px  - Popup padding, section gaps
4   = 16px  - Form field spacing (standard)
6   = 24px  - Card section spacing, major divisions
8   = 32px  - Screen section spacing
12  = 48px  - Hero spacing (rare in popup)
```

### Component Spacing Patterns

**Form Fields:**
```tsx
// Label to input: gap-2 (8px)
<Field className="gap-2">
  <FieldLabel>Email</FieldLabel>
  <FieldControl render={() => <Input />} />
</Field>

// Field to field: gap-4 (16px)
<Form className="flex flex-col gap-4">
  <Field />
  <Field />
  <Field />
</Form>
```

**Cards:**
```tsx
// Internal sections: gap-6 (24px), padding: py-6 px-6
<Card className="gap-6 py-6">
  <CardHeader className="px-6">...</CardHeader>
  <CardPanel className="px-6">...</CardPanel>
  <CardFooter className="px-6">...</CardFooter>
</Card>
```

**Button Groups:**
```tsx
// Horizontal spacing: gap-2 (8px)
<div className="flex gap-2">
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</div>
```

### Flexbox Layout Defaults

**Vertical Stacking (most common in popup):**
```tailwind
flex flex-col gap-4      /* Standard screen layout */
flex flex-col gap-6      /* Generous spacing */
flex flex-col h-full     /* Full-height screen */
```

**Horizontal Grouping:**
```tailwind
flex items-center gap-2         /* Icon + text, inline groups */
flex justify-between items-center  /* Header with actions */
flex justify-end gap-2          /* Button groups (right-aligned) */
```

**Screen Layout Template:**
```tsx
<div className="flex flex-col h-full gap-4 p-4">
  <h1 className="text-xl font-semibold">Screen Title</h1>

  <div className="flex-1 overflow-y-auto">
    {/* Scrollable content */}
  </div>

  <div className="flex gap-2 justify-end border-t pt-4">
    {/* Sticky bottom actions */}
  </div>
</div>
```

---

## Color & Theming

### CSS Variable System

**All colors use semantic CSS variables** defined in `assets/tailwind.css`:

**Surfaces:**
```tailwind
bg-background        /* Main canvas (white / zinc-950) */
bg-card              /* Elevated surface */
bg-popover           /* Overlay surfaces */
bg-muted             /* Subtle background (4% alpha) */
bg-accent            /* Hover states (4% light, 6% dark) */
```

**Interactive:**
```tailwind
bg-primary           /* Primary actions (zinc-800 / zinc-200) */
bg-secondary         /* Secondary actions */
bg-destructive       /* Danger actions (red-500) */
```

**Status:**
```tailwind
bg-success           /* Green states (emerald-500) */
bg-warning           /* Yellow states (amber-500) */
bg-info              /* Blue states (blue-500) */
```

**Foreground Pairs (always use with corresponding bg):**
```tailwind
text-foreground            /* Primary text (zinc-800 / zinc-200) */
text-muted-foreground      /* Secondary text (zinc-500 mix) */
text-primary-foreground    /* Text on primary bg (zinc-50 / zinc-800) */
text-card-foreground       /* Text on card bg */
text-destructive-foreground /* Text on destructive bg */
/* ...and so on for all color pairs */
```

### Dark Mode Guidelines

**Automatic Theme Switching:**
```tsx
// ✅ CORRECT: Uses semantic tokens (auto-switches in dark mode)
<div className="bg-card text-card-foreground" />
<Button variant="outline">Action</Button>

// ❌ INCORRECT: Manual dark mode overrides
<div className="bg-white text-black dark:bg-black dark:text-white" />
```

**NEVER write manual `dark:` overrides** unless fine-tuning alpha values:
```tsx
// ✅ ACCEPTABLE: Fine-tuning opacity for dark mode
<div className="bg-destructive/4 dark:bg-destructive/16" />

// ❌ AVOID: Duplicating color logic
<div className="bg-zinc-100 dark:bg-zinc-900" /> // Use bg-muted instead
```

### Color Application Rules

**Text Hierarchy:**
```tsx
<h1 className="text-foreground">Primary Heading</h1>
<p className="text-foreground">Body content</p>
<span className="text-muted-foreground">Secondary info</span>
```

**Borders:**
```tsx
<div className="border-border">Standard border</div>
<div className="border-destructive/32">Error border</div>
<div className="border-primary/32">Accent border</div>
```

**Status Colors (8% background + foreground text pattern):**
```tsx
<Alert variant="error">
  {/* Internally: border-destructive/32 bg-destructive/4 text-destructive-foreground */}
</Alert>

<Badge variant="success">
  {/* Internally: bg-success/8 text-success-foreground */}
</Badge>
```

**Interactive States:**
```tsx
// Ghost buttons: hover with accent
<Button variant="ghost" className="hover:bg-accent" />

// Filled buttons: hover with 90% opacity
<Button variant="default" className="hover:bg-primary/90" />
```

### Alpha Composition Patterns

**Overlay Backgrounds:**
```tailwind
/4   (4%)   - Subtle accents (muted, accent surfaces)
/8   (8%)   - Status backgrounds (success/warning/info alerts)
/16  (16%)  - Stronger emphasis (dark mode status backgrounds)
/32  (32%)  - Borders, hover states
/64  (64%)  - Disabled opacity
/72  (72%)  - Secondary icon opacity
```

**Usage Examples:**
```tsx
<div className="bg-destructive/4 border-destructive/32">
  Error container with 4% background, 32% border
</div>

<div className="bg-success/8 text-success-foreground">
  Success status with 8% background
</div>

<Button disabled className="opacity-64">
  Disabled button
</Button>
```

---

## Typography Guidelines

### Type Scale

```tailwind
text-xs     /* 12px - Field descriptions, captions, metadata */
text-sm     /* 14px - Body text, buttons, labels (default) */
text-base   /* 16px - Inputs, emphasized body (desktop) */
text-lg     /* 18px - Card titles, subsection headings */
text-xl     /* 20px - Screen headings */
text-2xl    /* 24px - Hero text (rare in 560px popup) */
```

### Font Weights

```tailwind
font-normal    /* 400 - Body text, descriptions */
font-medium    /* 500 - Buttons, labels, field emphasis */
font-semibold  /* 600 - Headings, card titles - PREFERRED over font-bold */
```

**Never use `font-bold` (700)** - use `font-semibold` (600) for all headings.

### Line Height (leading)

**Tight for Headings:**
```tailwind
leading-none    /* Titles with text-xl or text-2xl */
text-sm/4       /* Labels with tight 4px line-height */
```

**Comfortable for Body:**
```tailwind
text-base/5     /* Inputs (16px text, 20px line-height) */
leading-relaxed /* Multi-line descriptions (1.625) */
```

### Typography Patterns

**Screen Heading:**
```tsx
<h1 className="text-xl font-semibold">Create New Tenant</h1>
```

**Card Title:**
```tsx
<CardTitle className="text-lg leading-none font-semibold">
  Settings
</CardTitle>
```

**Field Label:**
```tsx
<FieldLabel className="text-sm/4">Email Address</FieldLabel>
```

**Description Text:**
```tsx
<FieldDescription className="text-muted-foreground text-xs">
  Enter your work email address
</FieldDescription>
```

**Muted Metadata:**
```tsx
<span className="text-muted-foreground text-xs">
  Last updated 2 hours ago
</span>
```

---

## Component Usage Patterns

### Button Patterns

**Variant Usage Guide:**
```tsx
// Primary CTA (use sparingly - one per screen section)
<Button variant="default">Create Tenant</Button>

// Secondary actions (most common)
<Button variant="outline">Cancel</Button>
<Button variant="outline">Edit</Button>

// Subtle inline actions
<Button variant="ghost">View Details</Button>
<Button variant="ghost">Learn More</Button>

// Danger actions
<Button variant="destructive">Delete</Button>
<Button variant="destructive-outline">Remove</Button>

// Text links
<Button variant="link">Read documentation</Button>
```

**Size Variants:**
```tsx
<Button size="default">Standard Button</Button>  // min-h-8 (32px)
<Button size="sm">Compact Button</Button>        // min-h-7 (28px) - forms
<Button size="lg">Large Button</Button>          // min-h-9 (36px) - CTAs
<Button size="xs">Extra Small</Button>           // min-h-6 (24px) - tight UIs
```

**Icon Buttons:**
```tsx
<Button size="icon" aria-label="Close dialog">
  <XIcon />
</Button>

<Button size="icon-sm" aria-label="Edit">
  <EditIcon />
</Button>
```

**Loading State:**
```tsx
<Button disabled={isSubmitting}>
  {isSubmitting ? (
    <>
      <Spinner className="size-4" />
      Saving...
    </>
  ) : (
    'Save Changes'
  )}
</Button>
```

**Icon + Text (auto gap-2):**
```tsx
<Button>
  <PlusIcon />
  Add Item
</Button>

<Button variant="outline">
  <DownloadIcon />
  Export
</Button>
```

### Form Patterns

**Standard Field:**
```tsx
<Field>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <FieldControl render={() => (
    <Input
      id="email"
      type="email"
      placeholder="you@example.com"
      required
    />
  )} />
  <FieldError match="valueMissing">Email is required</FieldError>
  <FieldError match="typeMismatch">Invalid email format</FieldError>
</Field>
```

**Field with Description:**
```tsx
<Field>
  <FieldLabel>API Token</FieldLabel>
  <FieldDescription className="text-muted-foreground text-xs">
    Generate from your dashboard settings page
  </FieldDescription>
  <FieldControl render={() => (
    <Input type="password" placeholder="Enter token" />
  )} />
  <FieldError match="valueMissing">Token is required</FieldError>
</Field>
```

**Form Submission Pattern:**
```tsx
<Form onSubmit={handleSubmit} className="flex flex-col gap-4">
  <Field>
    <FieldLabel htmlFor="name">Name</FieldLabel>
    <FieldControl render={() => (
      <Input id="name" required disabled={isSubmitting} />
    )} />
    <FieldError match="valueMissing">Name is required</FieldError>
  </Field>

  <Field>
    <FieldLabel htmlFor="email">Email</FieldLabel>
    <FieldControl render={() => (
      <Input id="email" type="email" required disabled={isSubmitting} />
    )} />
    <FieldError match="valueMissing">Email is required</FieldError>
    <FieldError match="typeMismatch">Invalid email</FieldError>
  </Field>

  {/* Action buttons: right-aligned, Cancel + Primary */}
  <div className="flex gap-2 justify-end">
    <Button
      type="button"
      variant="outline"
      onClick={onCancel}
      disabled={isSubmitting}
    >
      Cancel
    </Button>
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? 'Creating...' : 'Create'}
    </Button>
  </div>
</Form>
```

### Card Patterns

**Basic Card:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Settings</CardTitle>
    <CardDescription>Manage your account preferences</CardDescription>
  </CardHeader>
  <CardPanel>
    <div className="flex flex-col gap-4">
      {/* Card content */}
    </div>
  </CardPanel>
</Card>
```

**Card with Action:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>API Access</CardTitle>
    <CardDescription>Configure API endpoints</CardDescription>
    <CardAction>
      <Button size="sm" variant="ghost" aria-label="Edit settings">
        <EditIcon />
      </Button>
    </CardAction>
  </CardHeader>
  <CardPanel>
    {/* Content */}
  </CardPanel>
</Card>
```

**Card with Footer:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Project Settings</CardTitle>
  </CardHeader>
  <CardPanel>
    {/* Settings fields */}
  </CardPanel>
  <CardFooter className="border-t">
    <Button>Save Changes</Button>
  </CardFooter>
</Card>
```

### Dialog/Modal Patterns

**Standard Dialog:**
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger>
    <Button>Open Settings</Button>
  </DialogTrigger>

  <DialogPopup>
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogDescription>
        This action cannot be undone. Are you sure?
      </DialogDescription>
    </DialogHeader>

    <DialogPanel>
      {/* Scrollable dialog content */}
    </DialogPanel>

    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => setIsOpen(false)}
      >
        Cancel
      </Button>
      <Button
        variant="destructive"
        onClick={handleConfirm}
      >
        Delete
      </Button>
    </DialogFooter>
  </DialogPopup>
</Dialog>
```

**Alert Dialog (for critical confirmations):**
```tsx
<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
  <AlertDialogTrigger>
    <Button variant="destructive">Delete Tenant</Button>
  </AlertDialogTrigger>

  <AlertDialogPopup>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Tenant?</AlertDialogTitle>
      <AlertDialogDescription>
        This will permanently delete the tenant and all associated data.
      </AlertDialogDescription>
    </AlertDialogHeader>

    <AlertDialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </AlertDialogFooter>
  </AlertDialogPopup>
</AlertDialog>
```

### Alert/Toast Patterns

**Inline Alert with Title:**
```tsx
<Alert variant="error">
  <AlertCircleIcon />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Failed to save changes. Please try again.
  </AlertDescription>
</Alert>
```

**Status Alert (compact, no title):**
```tsx
<Alert variant="success">
  <CheckCircleIcon />
  <AlertDescription>
    Tenant created successfully
  </AlertDescription>
</Alert>

<Alert variant="warning">
  <TriangleAlertIcon />
  <AlertDescription>
    Your session will expire in 5 minutes
  </AlertDescription>
</Alert>
```

**Manual Error Container (from popup-tenant-create-screen):**
```tsx
{submitError && (
  <div className="rounded-lg border border-destructive/32 bg-destructive/4 p-3 text-sm text-destructive-foreground">
    {submitError}
  </div>
)}
```

---

## Form Design Standards

### Field Layout Requirements

**Mandatory Rules:**
- ✅ Stack all fields vertically in popup (never side-by-side due to 420px width)
- ✅ Consistent gap between fields: `gap-4` (16px)
- ✅ Label always above input: `<FieldLabel>` before `<FieldControl>`
- ✅ Required fields: Use HTML5 `required` attribute + validation message
- ✅ Optional fields: Add "(optional)" suffix to label text

**Example:**
```tsx
<Form className="flex flex-col gap-4">
  <Field>
    <FieldLabel htmlFor="name">Name</FieldLabel>
    <FieldControl render={() => <Input id="name" required />} />
    <FieldError match="valueMissing">Name is required</FieldError>
  </Field>

  <Field>
    <FieldLabel htmlFor="notes">Notes (optional)</FieldLabel>
    <FieldControl render={() => <Textarea id="notes" />} />
  </Field>
</Form>
```

### Input Sizing

```tsx
// Default size for most forms (min-h-8 = 32px)
<Input size="default" placeholder="Enter value" />

// Compact forms (selects, toolbars) (min-h-7 = 28px)
<Input size="sm" placeholder="Filter..." />

// Large forms (prominent CTAs) (min-h-9 = 36px)
<Input size="lg" placeholder="Search..." />
```

### Validation Patterns

**Browser Validation (preferred):**
```tsx
<Field>
  <FieldLabel htmlFor="username">Username</FieldLabel>
  <FieldControl render={() => (
    <Input
      id="username"
      required
      minLength={3}
      maxLength={50}
      pattern="[a-zA-Z0-9_]+"
    />
  )} />
  <FieldError match="valueMissing">Username is required</FieldError>
  <FieldError match="tooShort">Minimum 3 characters</FieldError>
  <FieldError match="tooLong">Maximum 50 characters</FieldError>
  <FieldError match="patternMismatch">
    Only letters, numbers, and underscores
  </FieldError>
</Field>
```

**Custom Validation:**
```tsx
<Field>
  <FieldLabel htmlFor="password">Password</FieldLabel>
  <FieldControl render={() => (
    <Input
      id="password"
      type="password"
      required
      minLength={8}
    />
  )} />
  <FieldError match="valueMissing">Password is required</FieldError>
  <FieldError match={(validity) => {
    const value = validity.valid ? '' : (validity as any).value;
    return !validity.valid && !/[A-Z]/.test(value);
  }}>
    Password must contain at least one uppercase letter
  </FieldError>
</Field>
```

### Field State Indicators

**Loading State (before hydration):**
```tsx
const ready = useTenantStore((state) => state.ready);

{!ready ? (
  <div className="text-sm text-muted-foreground">Loading form...</div>
) : (
  <Form onSubmit={handleSubmit}>
    {/* Form fields */}
  </Form>
)}
```

**Disabled During Submission:**
```tsx
<Input disabled={isSubmitting} placeholder="Email" />
<Button disabled={isSubmitting || !ready}>
  {isSubmitting ? 'Saving...' : 'Save'}
</Button>
```

**Success State (post-submission):**
```tsx
{submitSuccess && (
  <Alert variant="success">
    <CheckCircleIcon />
    <AlertDescription>Changes saved successfully</AlertDescription>
  </Alert>
)}
```

### Form Action Patterns

**Action Placement: Bottom-right aligned**
```tsx
<div className="flex gap-2 justify-end">
  <Button type="button" variant="outline">Cancel</Button>
  <Button type="submit">Save</Button>
</div>
```

**Action Ordering:**
- Cancel / Secondary (left) → Primary (right)
- Destructive actions: Use `variant="destructive"`, confirm in AlertDialog

**Responsive (if needed for larger screens):**
```tsx
{/* Full-width mobile, auto desktop */}
<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
  <Button className="sm:w-auto" variant="outline">Cancel</Button>
  <Button className="sm:w-auto">Save</Button>
</div>
```

---

## Interactive States

### State Specification

**All interactive components must define these states:**

```css
/* Default state */
.component { /* base styles */ }

/* Hover state (pointer devices) */
.component:hover { /* hover styles */ }

/* Focus state (keyboard navigation) */
.component:focus-visible {
  ring-2 ring-ring ring-offset-1 ring-offset-background
}

/* Active/Pressed state */
.component:active, .component[data-pressed] { /* pressed styles */ }

/* Disabled state */
.component:disabled {
  opacity-64 pointer-events-none
}

/* Loading state */
.component[data-loading] { /* loading styles */ }
```

### Button State Examples

**Default Variant States:**
```tailwind
/* Default state */
border-primary bg-primary text-primary-foreground shadow-xs

/* Hover state */
hover:bg-primary/90

/* Focus state (keyboard) */
focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1

/* Active/Pressed state */
[&:is(:active,[data-pressed])]:inset-shadow-[0_1px_--theme(--color-black/8%)]

/* Disabled state */
disabled:opacity-64 disabled:pointer-events-none
```

**Ghost Variant (subtle):**
```tailwind
border-transparent                 /* Default */
hover:bg-accent                   /* Hover */
data-pressed:bg-accent            /* Active */
```

### Input State Classes

```tailwind
/* Base state */
border-input bg-background

/* Focus state */
has-focus-visible:border-ring
has-focus-visible:ring-[3px]
has-focus-visible:ring-ring/24

/* Error state (aria-invalid) */
has-aria-invalid:border-destructive/36
has-focus-visible:has-aria-invalid:border-destructive/64
has-focus-visible:has-aria-invalid:ring-destructive/16

/* Disabled state */
has-disabled:opacity-64
```

### Transition Standards

**Properties:**
```tailwind
transition-shadow    /* Buttons, cards (default) */
transition-colors    /* Backgrounds, text color changes */
transition-[scale,opacity,translate]  /* Modals, popovers */
```

**Duration:**
```tailwind
duration-200  /* Most interactions (default) */
duration-150  /* Quick feedback (hover) */
duration-300  /* Modal open/close */
```

**Easing:**
```tailwind
ease-in-out   /* Most animations (default) */
ease-out      /* Entrances */
ease-in       /* Exits */
```

### Loading State Patterns

**Button Loading:**
```tsx
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Spinner className="size-4" />
      Loading...
    </>
  ) : (
    'Load Data'
  )}
</Button>
```

**Skeleton Loading:**
```tsx
<Card>
  <CardHeader>
    <Skeleton className="h-5 w-32" />  {/* Title skeleton */}
    <Skeleton className="h-4 w-48" />  {/* Description skeleton */}
  </CardHeader>
  <CardPanel>
    <Skeleton className="h-20 w-full" />  {/* Content skeleton */}
  </CardPanel>
</Card>
```

**Inline Spinner:**
```tsx
{isLoading && (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <Spinner className="size-4" />
    <span>Loading data...</span>
  </div>
)}
```

---

## Accessibility Requirements

### Mandatory ARIA Attributes

**Buttons Without Visible Text:**
```tsx
<Button size="icon" aria-label="Close dialog">
  <XIcon />
</Button>

<Button size="icon" aria-label="Edit tenant">
  <EditIcon />
</Button>
```

**Form Labels (always associate):**
```tsx
<FieldLabel htmlFor="email">Email</FieldLabel>
<Input id="email" type="email" />
```

**Required Fields:**
```tsx
<Input required aria-required="true" />
```

**Error Messages (connected automatically by Field):**
```tsx
<Field>
  <FieldControl render={() => <Input required />} />
  <FieldError>Error message is connected via aria-describedby</FieldError>
</Field>
```

**Loading States:**
```tsx
<Button aria-busy={isLoading} disabled={isLoading}>
  {isLoading ? 'Loading...' : 'Submit'}
</Button>
```

**Dialogs (role set automatically):**
```tsx
<AlertDialog>...</AlertDialog>  {/* role="alertdialog" */}
<Dialog>...</Dialog>             {/* role="dialog" */}
```

### Keyboard Navigation

**All coss components include keyboard support by default via Base UI:**

```
Tab           - Focus next interactive element
Shift+Tab     - Focus previous interactive element
Enter         - Activate button/link
Space         - Activate button, toggle checkbox/switch
Escape        - Close dialog/popover/menu
Arrow keys    - Navigate menu/select/tabs/radio groups
Home/End      - First/last item in lists
Page Up/Down  - Scroll containers
```

**Custom Components Must Implement:**
```tsx
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  onClick={handleClick}
>
  Custom Button
</div>
```

### Focus Management

**Focus Visible (keyboard only):**
```tailwind
focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
```

**Focus Trap in Dialogs (automatic):**
```tsx
<DialogPopup>
  {/* Focus is trapped here until dialog closes */}
</DialogPopup>
```

**Restore Focus After Close (automatic):**
```tsx
// Dialog automatically returns focus to trigger button after close
<DialogTrigger>
  <Button>Open</Button>  {/* Focus returns here on close */}
</DialogTrigger>
```

**Manual Focus Management:**
```tsx
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  if (isOpen) {
    inputRef.current?.focus();
  }
}, [isOpen]);

return <Input ref={inputRef} />;
```

### Color Contrast Requirements

**All color combinations meet WCAG AA standards:**
- 4.5:1 for normal text (text-sm, text-base)
- 3:1 for large text (text-lg and above)

**Guaranteed Contrast Pairs:**
```tsx
<div className="bg-primary text-primary-foreground" />
<div className="bg-card text-card-foreground" />
<div className="bg-destructive text-white" />
<div className="bg-background text-foreground" />
```

**Muted Text (still meets AA on background):**
```tsx
<span className="text-muted-foreground">
  Secondary text with sufficient contrast
</span>
```

**AVOID Custom Combinations:**
```tsx
{/* ❌ Don't use untested color combinations */}
<div className="bg-blue-500 text-yellow-300">...</div>
```

### Screen Reader Support

**Hidden Content for Screen Readers Only:**
```tsx
<span className="sr-only">Close dialog</span>

<Button size="icon">
  <XIcon />
  <span className="sr-only">Close</span>
</Button>
```

**Skip Navigation (for complex UIs):**
```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
>
  Skip to main content
</a>
```

**Loading Announcements:**
```tsx
<div aria-live="polite" aria-atomic="true">
  {isLoading && 'Loading data...'}
  {loadComplete && 'Data loaded successfully'}
</div>
```

**Error Announcements (in Field automatically):**
```tsx
<FieldError>
  {/* Error is automatically announced to screen readers via aria-describedby */}
  This field is required
</FieldError>
```

### Touch Target Sizing

**Minimum 44×44px touch targets (automatic in coss components):**

```tailwind
/* Applied automatically to Button and interactive Badge */
pointer-coarse:after:absolute
pointer-coarse:after:size-full
pointer-coarse:after:min-h-11
pointer-coarse:after:min-w-11
```

This ensures touchscreen users have adequate target size even when visual size is smaller (e.g., `size="icon"` buttons).

---

## Do's and Don'ts

### Component Usage

✅ **DO:**
```tsx
// Use semantic coss components
<Button variant="outline">Cancel</Button>
<Input type="email" placeholder="Email" />

// Compose business components from UI primitives
import { Select } from '@/components/ui/select';
function TenantSelector() {
  return <Select {...props} />;
}

// Use cn() for conditional classes
<div className={cn('base-class', isActive && 'bg-accent')} />

// Export both component and variants
export { Button, buttonVariants };
```

❌ **DON'T:**
```tsx
// Don't use raw HTML elements
<button className="...">Submit</button>  // Use <Button> instead
<input type="text" />  // Use <Input> instead

// Don't modify ui/ components for business logic
// In components/ui/button.tsx:
<Button variant="tenantAction" />  // Create TenantActionButton in biz/

// Don't use inline styles
<div style={{ marginTop: 16 }}>...</div>  // Use className="mt-4"

// Don't hardcode colors
<div className="bg-blue-500 text-white">...</div>  // Use bg-primary text-primary-foreground
```

### Layout

✅ **DO:**
```tsx
// Use semantic spacing scale
<div className="flex flex-col gap-4">...</div>

// Stack vertically in popup (420px width)
<Form className="flex flex-col gap-4">
  <Field />
  <Field />
</Form>

// Use full height for screens
<div className="flex flex-col h-full">...</div>

// Use flexbox for alignment
<div className="flex justify-between items-center">...</div>
```

❌ **DON'T:**
```tsx
// Don't use arbitrary spacing
<div className="mt-[13px]">...</div>  // Use gap-3 (12px) or gap-4 (16px)

// Don't use side-by-side fields in popup
<div className="grid grid-cols-2 gap-2">
  <Field />  {/* Too cramped at 420px width */}
  <Field />
</div>

// Don't use fixed heights
<div className="h-[400px]">...</div>  // Use flex-1 or min-h-*
```

### Colors & Theming

✅ **DO:**
```tsx
// Use semantic color tokens
<div className="bg-background text-foreground" />
<div className="bg-card text-card-foreground" />

// Use alpha for overlays
<div className="bg-destructive/8 border-destructive/32" />

// Use CSS variable patterns
<span className="text-muted-foreground">Secondary text</span>
```

❌ **DON'T:**
```tsx
// Don't use raw Tailwind colors
<div className="bg-slate-100 text-gray-900">...</div>  // Use bg-muted text-foreground

// Don't manually duplicate dark mode
<div className="bg-white text-black dark:bg-black dark:text-white">...</div>
// Use bg-background text-foreground instead

// Don't use opacity on text directly
<span className="opacity-50">Text</span>  // Use text-muted-foreground
```

### Typography

✅ **DO:**
```tsx
// Use combined size/leading notation
<span className="text-sm/4">Tight label text</span>

// Use semantic weights
<h1 className="text-xl font-semibold">Heading</h1>
<span className="font-medium">Label</span>

// Use muted-foreground for secondary text
<span className="text-muted-foreground text-xs">Metadata</span>
```

❌ **DON'T:**
```tsx
// Don't use arbitrary font sizes
<span className="text-[13px]">...</span>  // Use text-sm or text-xs

// Don't use font-bold
<h1 className="font-bold">...</h1>  // Use font-semibold (600) instead

// Don't set line-height separately without reason
<span className="text-sm leading-5">...</span>  // Use text-sm/5 shorthand
```

### Accessibility

✅ **DO:**
```tsx
// Label all form controls
<FieldLabel htmlFor="email">Email</FieldLabel>
<Input id="email" type="email" />

// Add aria-label for icon buttons
<Button size="icon" aria-label="Delete item">
  <TrashIcon />
</Button>

// Use semantic HTML
<button>, <nav>, <main>, <article>, <section>
```

❌ **DON'T:**
```tsx
// Don't use div as button
<div onClick={handleClick}>Click me</div>  // Use <Button>

// Don't skip labels
<Input placeholder="Email" />  // Add <FieldLabel>

// Don't use color alone for meaning
<span className="text-red-500">Error</span>  // Add icon or explicit "Error:" prefix
```

### State Management

✅ **DO:**
```tsx
// Check ready state before rendering forms
const ready = useTenantStore((state) => state.ready);
{ready ? <Form /> : <div>Loading...</div>}

// Disable during async operations
<Button disabled={isSubmitting}>Submit</Button>

// Show loading text
{isLoading ? 'Loading...' : 'Load Data'}
```

❌ **DON'T:**
```tsx
// Don't render forms before hydration
<Form>...</Form>  // Check store.ready state first (see Storage & State Rules)

// Don't leave buttons enabled during submission
<Button onClick={handleSubmit}>Submit</Button>  // Add disabled={isSubmitting}

// Don't use spinner without text
<Spinner />  // Add "Loading..." for screen readers
```

---

## Examples: Good vs Bad

### Example 1: Form Screen

✅ **GOOD:**
```tsx
const CreateTenantScreen = () => {
  const ready = useTenantStore((state) => state.ready);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Submit logic
      await createTenant(formData);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      <h1 className="text-xl font-semibold">Create Tenant</h1>

      {!ready ? (
        <div className="text-sm text-muted-foreground">Loading form...</div>
      ) : (
        <>
          {submitError && (
            <div className="rounded-lg border border-destructive/32 bg-destructive/4 p-3 text-sm text-destructive-foreground">
              {submitError}
            </div>
          )}

          <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <FieldControl render={() => (
                <Input
                  id="name"
                  required
                  placeholder="Enter tenant name"
                  disabled={isSubmitting}
                />
              )} />
              <FieldError match="valueMissing">Name is required</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <FieldControl render={() => (
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="admin@example.com"
                  disabled={isSubmitting}
                />
              )} />
              <FieldError match="valueMissing">Email is required</FieldError>
              <FieldError match="typeMismatch">Invalid email format</FieldError>
            </Field>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </Form>
        </>
      )}
    </div>
  );
};
```

**Why it's good:**
- ✅ Checks `ready` state before rendering form
- ✅ Uses semantic spacing (`gap-4` for fields, `gap-2` for buttons)
- ✅ Proper form validation with `FieldError` components
- ✅ Disables inputs during submission
- ✅ Shows loading text ("Creating...")
- ✅ Error handling with semantic colors
- ✅ Accessible labels with `htmlFor`
- ✅ Right-aligned action buttons

❌ **BAD:**
```tsx
const CreateTenantScreen = () => {
  return (
    <div style={{ padding: '20px' }}>  {/* ❌ Inline styles */}
      <h1 className="text-2xl font-bold">Create Tenant</h1>  {/* ❌ Too large for popup, wrong weight */}

      <form className="mt-5">  {/* ❌ Arbitrary spacing, not checking ready */}
        <div className="mb-3">  {/* ❌ Not using Field component */}
          <label className="text-gray-700">Name</label>  {/* ❌ Raw color, no htmlFor */}
          <input
            type="text"
            className="w-full border p-2 rounded bg-white"  {/* ❌ Raw input, no validation */}
          />
        </div>

        <div className="mb-3">
          <label className="text-gray-700">Email</label>
          <input type="email" className="w-full border p-2 rounded bg-white" />
        </div>

        <div className="flex gap-3">  {/* ❌ Wrong spacing scale */}
          <button className="bg-gray-200 px-4 py-2 rounded">Cancel</button>  {/* ❌ Raw button, no semantic colors */}
          <button className="bg-blue-500 text-white px-4 py-2 rounded">Create</button>  {/* ❌ No disabled state, hardcoded colors */}
        </div>
      </form>
    </div>
  );
};
```

**Why it's bad:**
- ❌ Inline styles instead of Tailwind utilities
- ❌ Not checking store `ready` state before rendering
- ❌ Using raw HTML elements instead of coss components
- ❌ Arbitrary spacing values (mt-5, mb-3)
- ❌ Hardcoded colors (text-gray-700, bg-blue-500)
- ❌ No form validation
- ❌ No disabled state during submission
- ❌ Labels not connected to inputs (no `htmlFor`)
- ❌ Wrong font weight (font-bold instead of font-semibold)
- ❌ Text too large for 560px popup (text-2xl)

---

### Example 2: Status Display

✅ **GOOD:**
```tsx
<Alert variant="success">
  <CheckCircleIcon />
  <AlertDescription>
    Tenant created successfully
  </AlertDescription>
</Alert>

<Alert variant="error">
  <AlertCircleIcon />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Failed to save changes. Please try again.
  </AlertDescription>
</Alert>
```

**Why it's good:**
- ✅ Uses semantic Alert component with variants
- ✅ Icons provide visual meaning
- ✅ Semantic colors (success/error) with proper contrast
- ✅ Screen reader accessible

❌ **BAD:**
```tsx
<div className="bg-green-100 border-green-400 text-green-700 px-4 py-3 rounded">
  ✓ Tenant created successfully
</div>

<div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">
  <strong>Error</strong><br />
  Failed to save changes. Please try again.
</div>
```

**Why it's bad:**
- ❌ Raw div instead of semantic Alert component
- ❌ Hardcoded colors (bg-green-100, text-red-700)
- ❌ No dark mode support
- ❌ Unicode checkmark instead of icon component
- ❌ Using `<br />` for spacing instead of proper structure
- ❌ No ARIA roles or screen reader support

---

### Example 3: Card with Action

✅ **GOOD:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>API Settings</CardTitle>
    <CardDescription>Configure your API access</CardDescription>
    <CardAction>
      <Button size="sm" variant="ghost" aria-label="Edit API settings">
        <EditIcon />
      </Button>
    </CardAction>
  </CardHeader>
  <CardPanel>
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Endpoint:</span>
        <span className="text-sm text-foreground">api.example.com</span>
      </div>
      <span className="text-muted-foreground text-xs">
        Last updated 2 hours ago
      </span>
    </div>
  </CardPanel>
</Card>
```

**Why it's good:**
- ✅ Uses semantic Card component structure
- ✅ Proper title/description/action hierarchy
- ✅ Icon button has `aria-label`
- ✅ Semantic spacing with flexbox + gap
- ✅ Text hierarchy with size and muted-foreground
- ✅ Semantic color tokens

❌ **BAD:**
```tsx
<div className="bg-white rounded-lg border border-gray-300 p-6 shadow-sm">
  <div className="flex justify-between items-start mb-4">
    <div>
      <h3 className="font-bold text-lg">API Settings</h3>
      <p className="text-gray-500 text-sm mt-1">Configure your API access</p>
    </div>
    <button className="p-1 hover:bg-gray-100 rounded">
      <EditIcon />  {/* ❌ No aria-label */}
    </button>
  </div>
  <div className="space-y-2">
    <p style={{ fontSize: 14 }}>
      <strong>Endpoint:</strong> api.example.com
    </p>
    <p className="text-gray-400" style={{ fontSize: 12 }}>
      Last updated 2 hours ago
    </p>
  </div>
</div>
```

**Why it's bad:**
- ❌ Raw div instead of Card component
- ❌ Hardcoded colors (bg-white, border-gray-300, text-gray-500)
- ❌ Inline styles (fontSize)
- ❌ Arbitrary spacing (mb-4, mt-1)
- ❌ Wrong font weight (font-bold instead of font-semibold)
- ❌ Raw button without Button component
- ❌ Icon button missing `aria-label`
- ❌ Using `space-y-2` instead of explicit flexbox + gap
- ❌ No dark mode support

---

## Reference Links

**Internal Documentation:**
- **Component Catalog**: See `docs/coss.md` for all 48 available coss components
- **State Management**: See `docs/storage-state-rules.md` for store hydration and ready state requirements
- **Project Guidelines**: See `CLAUDE.md` for coding style, build commands, and dependency policies

**External Resources:**
- **Base UI Documentation**: [https://base-ui.com/](https://base-ui.com/) - Headless component primitives
- **Tailwind CSS v4**: [https://tailwindcss.com/](https://tailwindcss.com/) - Utility-first CSS framework
- **shadcn/ui**: [https://ui.shadcn.com/](https://ui.shadcn.com/) - Design inspiration and patterns
- **Vercel Design**: [https://vercel.com/design](https://vercel.com/design) - Design system examples
- **WCAG 2.1 Guidelines**: [https://www.w3.org/WAI/WCAG21/quickref/](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility standards

**CSS Variable Reference:**
All theme variables are defined in `assets/tailwind.css`:
- `:root` - Light mode color variables
- `.dark` - Dark mode color overrides
- See lines 50-76 (light) and 78-104 (dark) for complete token definitions

---

## Summary

This document establishes mandatory UI design rules for the WXT browser extension. All components must:

1. **Use coss components** from `components/ui/` (see `docs/coss.md`)
2. **Follow shadcn/vercel style**: Simplicity, refinement, minimalism, breathing room
3. **Use semantic CSS variables** exclusively (never hardcoded colors)
4. **Optimize for 560×420px popup**: Vertical stacking, generous spacing
5. **Implement proper validation**: Browser validation + FieldError components
6. **Meet accessibility standards**: ARIA, keyboard nav, screen reader support, WCAG AA contrast
7. **Check store ready state** before rendering forms (see `docs/storage-state-rules.md`)

Reviewers will enforce these rules during code review. Deviations require written justification.
