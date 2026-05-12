# Pandai Gadai — Layout Guidelines

Design principles for Claude and teammates generating screens in the Customer App.
These define **what must always be true**, not how every screen must look.

---

## 1. Information Hierarchy First

Before laying out any screen, answer: **"What does the user need to know or do first?"**
That answer becomes the visual anchor — the largest, highest-contrast, most prominent element.

Don't force screens into templates. A simulator shows the result first. A detail page
shows the status first. A form page shows the input first. Let the user's goal decide.

---

## 2. Spatial Constants (Non-Negotiable)

These never change regardless of screen type or creative direction:

| Rule | Value |
|---|---|
| Side margins | 16px left & right |
| Content width | 343px (375 − 32) |
| Minimum gap between major sections | 24px |
| Spacing scale | Multiples of 8px only (8, 16, 24, 32, 48…) |
| Internal card padding | 16px |
| Card corner radius | 12px standard, 16px for hero cards |
| Home indicator clearance (sub-screens) | 34px bottom padding |
| Bottom navbar clearance (root screens) | 82px bottom padding on scroll content |

---

## 3. DS Components for All Interactive Elements

Buttons, inputs, chips, navbars, list items, dividers, badges — always import from the
Cortes DS. Never recreate them from scratch.

Keys are in `design-components.md`. If a component is missing, search for it and add it.

---

## 4. Token-Only Colors

Never use raw hex values. Always use semantic color tokens from `design-tokens.md`.

| Surface | Token |
|---|---|
| Screen background | `background/subtle` |
| Cards, elevated content | `background/neutral` |
| Hero moments, primary emphasis | `background/primary` |
| Text body | `text/default` |
| Text secondary/metadata | `text/subtle` |
| Destructive actions | `background/error` |

Use surface depth intentionally — `background/primary` is a signal, not decoration.
Reserve it for the most important thing on the screen.

---

## 5. Navigation Structure

These are structural facts, not design choices:

- **Root screens** (Beranda, Pinjaman, Poin Pandai, Akun): bottom navbar with 4 tabs, always visible
- **Sub-screens**: top navbar with back arrow, no bottom navbar
- **Support entry point**: headset icon top-right, only on screens where users may need help
- Destructive actions (e.g. Keluar) must be spatially separated from normal navigation

---

## 6. One Primary Action Per Screen

Each screen has one dominant CTA. Secondary actions are visually subordinate (ghost or text button).
Never two primary buttons of equal weight on the same screen.

---

## 7. Typography as Hierarchy

Use DS text styles to signal importance — don't style everything the same weight.

| Moment | Style |
|---|---|
| Hero value (loan amount, points, balance) | `heading-1` or `heading-2` |
| Screen/section anchor | `title-1` or `subtitle-1` |
| Body content | `body-1` or `body-2` |
| Metadata, captions, secondary info | `caption-1` or `label-1` |

Large numbers (amounts, points) should feel large. Make the user feel the value.

---

## 8. Creative Freedom Lives Here

Within the constants above, these are open to interpretation per screen:

- Where the primary content sits (top, middle, card, full-bleed)
- Whether to use section labels or let components speak for themselves
- Whether the hero uses `background/primary`, a card, or just whitespace
- How many cards vs one unified scrollable surface
- Whether breakdown info is a list, inline row, or table
- Whether to use a sticky CTA or inline CTA

---

## Reference Screens

These are **examples**, not templates to copy:

| Screen | Key decision | Why |
|---|---|---|
| Beranda | Full-bleed hero with greeting | User's first screen — brand moment |
| Poin Pandai | Yellow summary card at top | Points are the reward — show them immediately |
| Pinjaman | Plain white + filter chips | Content-dense list, no distraction needed |
| Detail Pinjaman | Status card first | User came to check payment status |
| Simulasi Gadai (guidelines) | Form → result at bottom | Safe, conventional |
| Simulasi Gadai (v2) | Result hero first → form below | Result is the motivation — show it upfront |
