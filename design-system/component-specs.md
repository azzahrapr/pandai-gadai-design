# Cortes Design System – Component Specs

Stack-agnostic reference for implementing DS components **without Figma access**.  
All token names refer to values defined in `design-tokens.md`. No Figma keys appear here.

---

## How to use this file

1. Read `design-tokens.md` first — every token name used here (e.g. `background/primary`, `rounded-lg`) resolves to a concrete hex, px, or font value in that file.
2. Each component section describes anatomy, variant dimensions, and which tokens to apply per state.
3. Font family for all components: **Geist**.

### Height vs Padding rule

When a component lists both a **fixed height** and **vertical padding**, the height is the CSS constraint — not the padding. The vertical padding value in the spec is a Figma design measurement (distance from edge to text), not a CSS `padding-top/bottom`.

**Correct pattern:**
```
display: inline-flex;
align-items: center;
height: [spec height]px;
padding: 0 [spec horizontal padding]px;   /* vertical padding = 0 */
```

**Wrong pattern:**
```
padding: [spec vertical padding]px [spec horizontal padding]px;   /* makes the element taller than spec */
```

This applies to any component where `height` is explicitly listed alongside `padding`. If height is not listed (auto-height), apply padding on all sides as written.

---

## Components

- [Accordion](#accordion)
- [Avatar](#avatar)
- [Badge Notification](#badge-notification)
- [Badge Product](#badge-product)
- [Badge Status](#badge-status)
- [Banner Info](#banner-info)
- [Bottom Navbar](#bottom-navbar)
- [Bottom Sheet](#bottom-sheet)
- [Button](#button)
- [Checkbox](#checkbox)
- [Chips](#chips)
- [Data Table](#data-table)
- [Date Picker](#date-picker)
- [Divider](#divider)
- [List](#list)
- [Loader: General](#loader-general)
- [Loader: Skeleton](#loader-skeleton)
- [Modal](#modal)
- [Pagination](#pagination)
- [Progress Bar](#progress-bar)
- [Radio Button](#radio-button)
- [Side Navbar](#side-navbar)
- [Stepper](#stepper)
- [Switch](#switch)
- [Tab](#tab)
- [Text Area](#text-area)
- [Text Field](#text-field)
- [Toast](#toast)
- [Tooltip](#tooltip)
- [Top Navbar](#top-navbar)
- [Uploader: General](#uploader-general)
- [Uploader: Image](#uploader-image)
- [Generic Token Migration](#generic-token-migration) — cross-cutting note, read this if a token doesn't match

---

## Accordion

Single collapsible section with a header trigger and expandable body.

**Anatomy:** header row (label + chevron icon + notification badge) → body content (revealed on expand)

> **2026-07-23 drift:** the header row now includes a "BARU" notification badge next to the label (see [Badge Notification](#badge-notification)) — not previously documented. Also, the container carries a whole-card border (`border/subtle`, #E1E7EF) not in the original anatomy.

**Dimensions:** 487px wide (scales to container)

**Tokens:**
| Element | Token |
|---|---|
| background | `background/neutral` (live: bound to generic `background` token, see [Migration note](#generic-token-migration) — resolves to the same white) |
| label | `text/default` |
| chevron icon | `icon/default` (live: bound to generic `foreground` token — same slate/950 value, different variable) |
| border (bottom) | `border/subtle` (live: `border/default`, #CBD5E1 — one step darker) |
| body text | `text/subtle` |

---

## Avatar

Circular user identifier shown as initials or an image.

**Anatomy:** circle container → (alphabet label **or** artwork/image)

**Variants:** `size` × `Type`

| Size | Diameter |
|---|---|
| large | 40px |
| medium | 32px |
| default | 24px |
| small | 16px |

**Tokens:**
| Element | Token |
|---|---|
| background (alphabet) | `background/info-subtle` (#E5F2FF, pale blue) |
| label (alphabet) | `text/default` |
| background (artwork) | same `background/info-subtle` fill on both variants — no distinct fallback token was found |
| border (optional) | not present on any inspected variant |

> **2026-07-23 drift — color identity change:** this component was documented as brand blue (`background/primary` #023DFF + white text), but Figma now renders it in pale blue (`background/info-subtle` #E5F2FF + dark text). Confirm with design whether this is the intended new look before shipping — it changes how prominent avatars read against a page.

---

## Badge Notification

Small indicator overlaid on icons or nav items to signal unread state.

**Anatomy:** container → (text label **or** number **or** dot)

**Variants:** `Variant` — `text` · `number` · `dot`

| Variant | Approx. size |
|---|---|
| text | 50 × 20px |
| number | 39 × 20px |
| dot | 8 × 8px |

**Tokens:**
| Element | Token |
|---|---|
| background | `background/error` |
| label / number | `text/neutral` |
| typography (text/number) | **12px Bold** (2026-07-23: was Label 2/10px Bold — font size grew, still Geist Bold) |
| radius | `rounded-full` |

---

## Badge Product

Compact label used to tag a product or category.

**Anatomy:** container → label text

**Variants:** `variant` — `light` · `heavy`

**Dimensions:** auto-width × 20px height

**Tokens:**
| Variant | bg | text | border |
|---|---|---|---|
| light | `background/info-subtle` | `text/info` | `border/info` |
| heavy | `background/primary` | `text/neutral` | — |

**Typography:** **12px Bold** (2026-07-23: was Label 2/10px Bold)
**Radius:** `rounded-full`  
**Padding:** 2px top/bottom · 8px left/right

> **Implementation:** height is the constraint. Use `inline-flex items-center h-5 px-2` (Tailwind) or `display:inline-flex; align-items:center; height:20px; padding:0 8px`. Do NOT set `py-[2px]` — it overshoots the fixed height.

> **2026-07-23 drift:** the `heavy` variant's label text is now a hardcoded white value, not bound to `text/neutral` — visually identical, but detached from the token so a future theme change won't reach it. The `light` variant is unaffected.

---

## Badge Status

Semantic status label used on items, lists, and tables.

**Anatomy:** container → label text

**Variants:** `state` × `type`

- States (light): `success` · `informative` · `warning` · `error` · `default` (renamed from `finished` on 2026-07-23)
- States (solid): `success` · `informative` · `warning` · `error` · `default` — **but the Figma variant names are still the old placeholders `type10`/`type9`/`type8`/`type7`/`type6` respectively**, except `type9` (informative), which was never renamed at all. Map by position, not by trusting the name.
- Types: `light` · `solid`

**Dimensions:** auto-width × 16px height (confirmed unchanged across all 10 variants)
**Radius:** `rounded-full`  
**Padding:** 2px top/bottom · 8px left/right  
**Typography:** Label 2 — 10px Bold

> **Implementation:** height is the constraint. Use `inline-flex items-center h-4 px-2 leading-none` (Tailwind) or `display:inline-flex; align-items:center; height:16px; padding:0 8px`. Do NOT set `py-[2px]` — it overshoots the fixed height.

**Tokens — light type:**
| State | bg | border | text |
|---|---|---|---|
| success | `background/success-subtle` | `border/success` | `text/success` |
| informative | `background/info-subtle` | `border/info` | `text/info` |
| warning | `background/warning-subtle` | `border/warning` | `text/warning` |
| error | `background/error-subtle` | `border/error` | `text/error` |
| default (was `finished`) | `background/subtle` (2026-07-23: was `background/disabled`) | `border/hover` (was `border/default`) | `text/disabled` (was `text/subtle`) |

**Tokens — solid type:**
| State | bg | border | text |
|---|---|---|---|
| success | `background/success` | undocumented hardcoded green/700 border (not semantic) | `text/neutral` |
| informative | `background/primary` | undocumented hardcoded blue/700 border (not semantic) | `text/neutral` |
| warning | `background/secondary` (2026-07-23: was `background/warning` — same yellow hex, wrong token) | `border/warning` (correctly semantic, unlike the other 3) | `text/neutral` |
| error | `background/error` | undocumented hardcoded red/700 border (not semantic) | `text/neutral` |
| default (was unresolved placeholder) | `background/dark-secondary` | `border/default` (semantic) | `text/neutral` |

---

## Banner Info

Full-width informational strip used to surface contextual messages.

**Single component (`banner - info`):** merged 2026-07-02 from what were previously two separate component sets (`banner - desktop`, `banner - mobile`). Variant axis is now `Type` × `Device`, plus independent boolean props: `icon`, `title`, `actionButton`, `closeButton`, `closeIcon`.

**Variants:** `Type` — `Base` · `Informative` · `Success` · `Alert` · `Error` × `Device` — `Mobile` · `Desktop`

**Dimensions:**
| Device | Width | Height |
|---|---|---|
| Mobile | 343px (full-width) | 60px |
| Desktop | 343px | 150px |

**Anatomy differs by device, not just size:**
- **Desktop:** icon (top-aligned) → title + 2-line message (stacked) → action link/button → close (✕) icon absolutely positioned top-right
- **Mobile:** icon → single-line message → action link/button, all in one row. No title, no close icon.

**Tokens — Desktop:**
| Type | bg | text | border/icon |
|---|---|---|---|
| Base | `background/subtle` | `text/default` | `border/default` |
| Informative | `info-background` | `text/info` | `icon/info` |
| Success | `success-background` | `text/success` | `icon/success` |
| Alert | `warning-background` | `text/warning` | `icon/warning` |
| Error | `error-background` | `text/error` | `icon/error` |

**Tokens — Mobile:**
| Type | bg | text | icon |
|---|---|---|---|
| Base | `background/subtle` | `text/subtle` | `icon/subtle` |
| Informative | `background/info-subtle` | `text/subtle` | `icon/info` |
| Success | `background/success-subtle` | `text/subtle` | `icon/success` (check-circle) |
| Alert | `background/warning-subtle` | `text/subtle` | `icon/warning` (triangle-warning) |
| Error | `background/error-subtle` | `text/subtle` | `icon/error` (triangle-warning) |

> **Desktop and Mobile use different background tokens for the same semantic type.** Informative and Alert are visibly different shades between the two (`info-background` #EFF6FF vs `background/info-subtle` #E5F2FF; `warning-background` #FEFCE8 vs `background/warning-subtle` #FEFDEA) — confirm with design whether this divergence is intentional before assuming it's a bug. Success and Error currently resolve to the same hex on both devices despite using separate variables.

**Radius:** `rounded-lg`

---

## Bottom Navbar

Fixed bottom navigation bar containing 4 tab items.

**Anatomy:**  
`bottom-navbar` (assembled, 375 × 84px) → 4 menu items side by side

**Individual menu items** (`menu-home`, `menu-pinjaman`, `menu-emas`, `menu-profile`):
- 80 × 44px each
- `State`: `Unselected` · `Selected`
- **New as of 2026-07-23:** every menu item gained a boolean `Badge` prop (default `true`) that renders a 28×15px red notification pill ("99+", `icon/error` bg, `text/neutral` text, Bold 10px) — not in the original anatomy. Set to `false` for a normal nav item.

**Local assets (prototype):**
| Menu item | Unselected icon | Selected icon |
|---|---|---|
| `menu-home` | `nav-home-solid.svg` | `nav-home-solid.svg` |
| `menu-pinjaman` | `credit-card.png` | `credit-card.png` |
| `menu-emas` | `poinemas.outline.png` | `poin-fill-active.svg` |
| `menu-profile` | `smile.png` | `smile.png` |

**Tokens:**
| Element | State | Token |
|---|---|---|
| navbar background | — | `background/neutral` (2026-07-23: live bound to generic `background` token — same white; see [Migration note](#generic-token-migration)) |
| navbar top border | — | **removed** — no stroke exists on the assembled navbar as of 2026-07-23 |
| icon | Selected (menu-home, menu-pinjaman) | `background/primary` (2026-07-23 drift — wrong token family, was `icon/info`) |
| icon | Selected (menu-emas) | unbound raw hex, ~#023DFF — no token at all |
| icon | Selected (menu-profile) | `icon/info` — correct, unaffected |
| icon | Unselected (all 4) | `icon/subtle` — unaffected |
| label | Unselected | `text/subtle` |
| label | Selected | `text/info` |
| typography | — | **Bold**, 12px (2026-07-23: was Regular) |

> **Token binding is now inconsistent across the 4 sibling menu items** — `menu-profile` is untouched, `menu-home`/`menu-pinjaman` point to the wrong token family, and `menu-emas` has no token binding at all. This unevenness (rather than a clean uniform change) is itself a signal that the edit is unfinished — see the [migration note](#generic-token-migration).

---

## Bottom Sheet

Modal overlay anchored to the bottom of the screen.

**Anatomy:** drag handle → title → body content → action button(s)

**Variants:** `variants`
| Variant | Width | Height |
|---|---|---|
| Default | 375px | 384px |
| With Image | 375px | 376px |
| Custom | 375px | 522px (flexible) |

**Tokens:**
| Element | Token |
|---|---|
| background | 2026-07-23: no longer bound to `background/neutral`. Now a variable literally named `background` in a **new 4-mode `Token` collection** (`light/bluects`, `dark/slate`, `light/zinc`, `dark/zinc`) — resolves to white in the default mode but is an architecturally different, multi-theme layer with no other equivalent in this doc. See [Migration note](#generic-token-migration). |
| drag handle | `background/disabled` (unaffected) |
| title | `text/default`, **18px SemiBold** (2026-07-23: was Title 1/20px Bold) |
| body text | `text/subtle`, Body 2 — 14px Regular (unaffected) |
| backdrop / overlay | `overlay/default` |
| radius (top corners) | `rounded-lg` (8px) (2026-07-23: was `rounded-3xl`/16px) |

---

## Button

Primary interactive control for triggering actions.

**Anatomy:** container → (leading icon?) → label → (trailing icon?)

**Variants:** `Type` × `State` × `Size`

- Types: `Primary` · `Secondary` · `Ghost` · `Destructive`
- States: `Default` · `Hovered` · `Loading` · `Disabled`
- Sizes: `Large` · `Medium` · `Small` · `Extra Small`

**Dimensions:**
| Size | Height | H-padding | V-padding |
|---|---|---|---|
| Large | 44px | 16px (`spacing-4`) | 8px (`spacing-2`) |
| Medium | 38px | 16px (`spacing-4`) | 8px (`spacing-2`) |
| Small | 30px | 8px (`spacing-2`) | 4px (`spacing-1`) |
| Extra Small | 24px | 8px (`spacing-2`) | 4px (`spacing-1`) |

> **Implementation:** height is the constraint. Set height explicitly and use `flex items-center` — do NOT set vertical padding. Tailwind: `h-11 px-4` (Large) · `h-[38px] px-4` (Medium) · `h-[30px] px-2` (Small) · `h-6 px-2` (Extra Small).

**Radius:** `rounded-lg` (8px)  
**Typography:** Subtitle 2 — 14px SemiBold

**Colors per type (Default state):**
| Type | bg | text | border |
|---|---|---|---|
| Primary | `background/primary` | `text/neutral` | — |
| Secondary | `background/neutral` | `text/default` | `border/default` (1px) |
| Ghost | transparent | `text/link` | — |
| Destructive | `background/error` | `text/neutral` | — |

**Colors per type (Hovered state):**
| Type | bg | text | border |
|---|---|---|---|
| Primary | `background/primary-darker` | `text/neutral` | — |
| Secondary | `background/info-subtle` | `text/link` | `border/info` (1px) |
| Ghost | `background/info-subtle` | `text/link` | — |
| Destructive | `text/error` (as bg) | `text/neutral` | — |

**Disabled state (all types):**
| Element | Token |
|---|---|
| bg | `background/disabled` |
| text | `text/disabled` |
| border | — |

---

## Checkbox

Binary selection control, used standalone or in lists.

**Anatomy:** checkbox box → (checkmark icon when selected) → label text

**Variants:** `State` — `Default` · `Selected` · `Disabled Default` · `Disabled Selected`

**Dimensions:** auto-width × 21px height (box is 16 × 16px)

**Tokens:**
| State | box bg | box border | checkmark | label |
|---|---|---|---|---|
| Default | no fill (2026-07-23: was `background/neutral`) | `icon/disabled` (was `border/default`) | — | `text/default` |
| Selected | `background/primary` | `background/primary` (was `border/info` — same blue, different token) | `background/neutral` (was `icon/neutral` — same white, different token) | `text/default` |
| Disabled Default | no fill (was `background/disabled`) | `icon/disabled` (was `border/subtle`) | — | `text/disabled` |
| Disabled Selected | `background/disabled` | `border/default` (was `border/subtle`) | `icon/disabled` | `text/disabled` |

**Radius (box):** `rounded-sm` (4px)  
**Typography (label):** Body 2 — 14px Regular

---

## Chips

Compact selection pill, used for filters and multi-select.

**Two sub-components:** `chips/default` and `chips/badge`

### chips/default

**Variants:** `state` — `default` · `active` · `disabled`

**Dimensions:** auto-width × 32px  
**Radius:** `rounded-3xl` (16px)  
**Padding:** 6px top/bottom · 12px left/right  
**Typography:** Subtitle 2 — 14px SemiBold

> **Implementation:** height is the constraint. Use `inline-flex items-center h-8 px-3` (Tailwind) or `display:inline-flex; align-items:center; height:32px; padding:0 12px`. Do NOT set `py-[6px]`.

| State | bg | border | text |
|---|---|---|---|
| default | `background/neutral` | `border/default` | `text/default` |
| active | `background/info-subtle` | `border/info` | `text/link` |
| disabled | `background/subtle` | `border/default` | `text/disabled` |

### chips/badge

**Variants:** `state` — `badge` · `active` · `disabled`  
Extends `chips/default` with a notification count badge overlaid on the right.

| State | chip bg | chip border | chip text | badge bg | badge text |
|---|---|---|---|---|---|
| badge | `background/neutral` | `border/default` | `text/default` | `background/error` | `text/neutral` |
| active (Figma variant still named `Variant2`, not renamed) | `background/info-subtle` | `border/info` | `text/link` | `background/error` (2026-07-23 drift — stuck on red, doesn't switch to `background/primary`) | `text/neutral` |
| disabled | `background/subtle` | `border/default` | `text/disabled` | `background/error` (2026-07-23 drift — stuck on red, doesn't switch to `background/disabled`) | `text/neutral` |

> **2026-07-23:** the base chip tokens (bg/border/text) are unaffected — only the notification-count badge overlay is stuck on `background/error` regardless of state. The `active` variant is still literally named `state=Variant2` in Figma, confirmed not renamed on re-check.

---

## Data Table

Tabular display of structured data.

**Two sub-components:** `table-header` and `table-cell`

### table-header

**Variants:** `text` (true/false) × `checkbox` (true/false)

**Dimensions:** auto-width × 40px  
**Typography:** **14px SemiBold** (2026-07-23: was Label 1/12px Bold)
**Tokens:**
| Element | Token |
|---|---|
| background | `background/neutral` (2026-07-23: was `background/subtle`) |
| text | `text/subtle` |
| border (bottom) | `border/subtle` (was `border/default`) |
| checkbox | see [Checkbox](#checkbox) |

### table-cell

**Variants:** `type` × `state`
- Types: `default` · `badge` · `multi-badge` · `text action` · `single text`
- States: `default` · `hovered`

**Dimensions:** auto-width × 64px  
**Typography (primary text):** Body 2 — 14px Regular  
**Typography (secondary text):** Caption 1 — 12px Regular

| State | bg | border (bottom) |
|---|---|---|
| default | no fill (2026-07-23: was `background/neutral` — removed on default/badge/multi-badge/text-action types) | `border/subtle` |
| hovered | `background/subtle` | `border/subtle` |

Badges inside cells use the [Badge Status](#badge-status) component.

> **2026-07-23 drift:** the "avatar + text" cell content is bound to foreign, non-Cortes tokens — `Colors/Text/text-primary (900)` #181D27 and `Colors/Text/text-tertiary (600)` #535862 — instead of `text/default`/`text/subtle`. Close in value but not the same variables; a future Cortes token update would silently miss these cells.

---

## Date Picker

Calendar UI for selecting a date or date range.

**Variants:** `Variant` × `State`
- Variants: `2 Month` · `1 Month` · `Single`
- States: `Default` · `Filled` — confirmed `Single, Filled` genuinely does not exist in Figma (not a doc gap)

**Dimensions:**
| Variant | Width | Height |
|---|---|---|
| 2 Month | 560px | 352px |
| 1 Month | 276px | 358px |
| Single | 276px | 358px |

**Tokens (outer shell — unaffected by the 2026-07-23 drift below):**
| Element | Token |
|---|---|
| background | `background/neutral` |
| border | `border/default` |
| radius | `rounded-xl` |
| today indicator | `border/info` |
| range highlight | `background/info-subtle` |
| day text (disabled) | `text/disabled` |
| nav icon | `icon/default` |

**Tokens (calendar grid — drifted 2026-07-23):**
| Element | Doc token | Live token |
|---|---|---|
| selected day bg | `background/primary` | `primary` (generic, same hex) |
| selected day text | `text/neutral` #FFFFFF | `primary-foreground` #F8FAFC — near-white, not pure white; **reduced contrast** against the blue fill |
| day text (default) | `text/default` #0F1729 | `foreground` #020617 — darker than spec |
| header text | `text/default`, Subtitle 1 — 16px SemiBold | unaffected |

> The calendar grid (day numbers, month title, selected day, nav chevrons) is now bound to a parallel generic token set — `background`, `border`, `foreground`, `muted-foreground`, `primary`, `primary-foreground` — instead of Cortes semantic tokens. Some of these coincide in value with existing Cortes tokens, others don't (see selected-day text above). See [Migration note](#generic-token-migration).

---

## Divider

Visual separator between content sections.

**Variants:** `Type` — `Line` · `Gap` · `dash`

**Dimensions (default width 375px, scales to container):**
| Type | Height | Description |
|---|---|---|
| Line | 1px | Solid horizontal rule |
| dash | 1px | Dashed horizontal rule, dash pattern [6,6] |
| Gap | 8px | Spacer block — 2026-07-23: no longer transparent, see below |

**Tokens:**
| Type | color |
|---|---|
| Line | `border/default` (2026-07-23: was `border/subtle`) |
| dash | `border/default` (was `border/subtle`) |
| Gap | `background/subtle` fill, plus a new 1px `border/default` line child — not transparent, and the line is a new anatomy element not in the original spec |

---

## List

Navigable row item, used in menus, settings, and content lists.

**Two sub-components:** `list` (row item) and `action` (trailing control)

### list

**Variants:** `State` × `Type`
- States: `Active` · `Hovered` · `Disabled`
- Types: `Default` · `Nested`

**Dimensions:** 360px wide × 44px height  
**Typography (label):** Body 2 — 14px Regular  
**Typography (secondary):** Caption 1 — 12px Regular

| State | bg | text | icon |
|---|---|---|---|
| Active | no fill (2026-07-23: was `background/neutral` — transparent now, unbound) | `text/default` | `icon/default` |
| Hovered | `background/info-subtle` (was `background/subtle` — now a light-blue tint) | `text/default` | `icon/default` |
| Disabled | `background/neutral` | `text/disabled` | `icon/disabled` |

Nested type adds 16px left indent to the content.

> **2026-07-23 drift — new anatomy:** every state now embeds a "BARU" notification-badge pill (see [Badge Notification](#badge-notification)) not present in the original spec. The trailing checkbox/radio control inside a row is also hardcoded white rather than bound to a variable.

### action (trailing control)

24 × 24px slot placed at the trailing edge of a list item.

**Variants:** `Action` — `Checkbox` · `Radio Button` · `Arrow`

Uses the respective [Checkbox](#checkbox) or [Radio Button](#radio-button) component styling. Arrow stroke is bound to a generic `foreground` token (2026-07-23: was `icon/subtle`) — same slate/950-ish value, different variable. This sub-component does **not** share the sibling `list` row-item's hover/badge drift above — it's an isolated token swap.

---

## Loader: General

Animated spinner shown during loading states.

**Variants:** `Size` — `small` · `default` · `large` · `extra large`

| Size | Container height |
|---|---|
| small | 64px |
| default | 80px |
| large | 96px |
| extra large | 104px |

**Tokens:**
| Element | Token |
|---|---|
| spinner track | `background/disabled` |
| spinner fill | `icon/info` (2026-07-23: was `background/primary`) |
| label text | `text/default` (was `text/subtle`); Geist Medium 14px on default/small, **18px on large/xl** (undocumented per-size variance — was uniformly Body 2/14px Regular) |

---

## Loader: Skeleton

Placeholder blocks shown while content is loading.

**Variants:** `Type` — `Rectangle` · `Circle`

> **2026-07-23 — detokenized:** the two-layer fill + shimmer anatomy has been replaced by a single node using a 3-stop linear gradient (~#EBEFF2 → #FAFAFA → #EBEFF2), and **all three stops are unbound raw hex** — there is no design token driving this component's fill at all anymore. Flag this to whoever owns the DS; it can't be kept in sync with a token update.

**Tokens:** none currently bound (see above)

**Radius:**
- Rectangle: `rounded-2xl` (12px) (2026-07-23: was `rounded-lg`/8px)
- Circle: `rounded-full`

---

## Modal

Centered overlay dialog requiring user acknowledgement or action.

**Anatomy:** backdrop → modal card (icon + title + body + action buttons)

**Variants:** `variant` — `default` · `info` · `success` · `alert` · `error`

**Dimensions:** 343px wide × 215px height (confirmed unchanged on all 5 variants)
**Radius:** `rounded-2xl` (confirmed, radius 10)
**Padding:** 12px top/bottom · 16px left/right (2026-07-23: was uniform 24px all sides)

**Tokens:**
| Element | Token |
|---|---|
| card background | `background/neutral` |
| backdrop | `overlay/default` |
| title | `text/default`, Title 1 — 20px Bold |
| body | `text/subtle`, Body 2 — 14px Regular |
| close icon | `icon/default` (2026-07-23: was `icon/subtle` — now matches the title's dark color instead of a lighter gray) |

> **2026-07-23 — icon-per-variant feature removed:** all 5 variants (default/info/success/alert/error) now render **identically** — header is just a title + close icon. There is no icon or icon-background node in any variant's tree anymore; the `variant` prop currently produces no visual difference at all. Confirm with design whether this is a deliberate simplification or an accidental strip during a recent edit before removing the table below from this doc.

**Icon color per variant (as previously documented — currently not rendered in Figma):**
| Variant | icon bg | icon |
|---|---|---|
| default | — | — |
| info | `background/info-subtle` | `icon/info` |
| success | `background/success-subtle` | `icon/success` |
| alert | `background/warning-subtle` | `icon/warning` |
| error | `background/error-subtle` | `icon/error` |

Buttons inside the modal follow the [Button](#button) spec.

---

## Pagination

Navigation control for multi-page content.

**Two sub-components:** `pagination` (assembled bar) and `page` (individual page button)

### pagination

**Variants:** `Type`
| Variant | Description |
|---|---|
| No numbers | Prev / Next only |
| < 5 | Shows all page numbers |
| > 5 | Shows ellipsis |
| > 100 | Shows ellipsis with compact notation |

### page

**Variants:** `State` — `Default` · `Selected` · `Nav Back - Default` · `Nav Back - Disabled` · `Nav Next - Default` · `Nav Next - Disabled`

**Dimensions:** 40 × 40px  
**Radius:** `rounded-lg`

| State | bg | text/icon |
|---|---|---|
| Default | `background/neutral` (solid white) (2026-07-23: was documented as transparent) | `text/default` (was `text/subtle`) |
| Selected | `background/primary` | `text/neutral` |
| Nav Default | transparent | `icon/default` |
| Nav Disabled | transparent | `icon/disabled` |

**Typography:** Body 2 — 14px Regular

> Selected and Nav states, plus the `pagination` container itself, are unchanged from spec.

---

## Progress Bar

Horizontal bar indicating completion percentage.

**Variants:** `State` × `Device`
- States: `0%` · `25%` · `50%` · `75%` · `100%`
- Devices: `Mobile` · `Desktop`

**Dimensions (Mobile):** full-width × 8px  
**Dimensions (Desktop):** full-width × 12px (corrected 2026-07-23 — this doc previously said 8px for both devices, which was our error, not a Figma change; track/fill tokens and radius were already correct)

**Tokens:**
| Element | Token |
|---|---|
| track (empty) | `background/disabled` |
| fill (progress) | `background/primary` |
| radius | `rounded-full` |

---

## Radio Button

Single-selection control within a group.

**Anatomy:** circle → (inner dot when selected) → label text

**Variants:** `State` — `Default` · `Selected` · `Disabled`

**Dimensions:** auto-width × 21px (circle is 16 × 16px)

**Tokens:**
| State | circle border | inner dot | label |
|---|---|---|---|
| Default | `icon/disabled` #94A3B8 (2026-07-23: was `border/default` #CBD5E1 — visibly darker) | — | `text/default` |
| Selected | `icon/info` #0020E3 (was `border/info`/`background/primary` #023DFF — slightly different blue) | `icon/info` (same swap) | `text/default` |
| Disabled | `icon/disabled` #94A3B8 (was `border/subtle` #E1E7EF — much darker); inner dot for this state is now absent entirely | — (removed) | `text/disabled` |

> **2026-07-23:** tokens shifted from the `border/*`/`background/*` family to the `icon/*` family across all 3 states, producing real (if subtle) color shifts on every ring.

**Radius (circle):** `rounded-full`  
**Typography (label):** Body 2 — 14px Regular

---

## Side Navbar

Vertical navigation panel for tablet and desktop layouts.

**Variants:** `Variant` × `State`
- Variants: `Desktop` · `Mobile`
- Desktop states: `Open-Default` · `Open-Scrollable` · `Closed-Default` (2026-07-23: Figma variant name is now `Closed-Defaul`, missing the trailing "t" — key unchanged, only the label typo'd)
- Mobile states: `Default` · `Scrollable`

**Tokens — as documented (no longer accurate, see drift note below):**
| Element | Token |
|---|---|
| active item bg | `background/dark-secondary` |
| active item indicator | `background/primary` |
| typography | Body 2 — 14px Regular |

> **2026-07-23 — major drift, Desktop flipped to a light theme:** `Open-Default`/`Open-Scrollable` background is now bound to `background/neutral` #FFFFFF (was `background/dark` #0F1729) with border `border/default` #CBD5E1 (was `border/subtle` #E1E7EF). `Closed-Default` has **no token binding at all** — bg/border are unbound raw hex (#FFFFFF / #E2E8F0), and #E2E8F0 doesn't match any documented border token. Mobile (`Default`/`Scrollable`) still renders dark, but via **unbound raw hex #0F172A** — close to but not equal to `background/dark` #0F1729, and no longer tokenized either. Net effect: Desktop is now light-themed while Mobile stays dark-themed — an inconsistent, half-migrated state rather than a clean redesign. See [Migration note](#generic-token-migration).

---

## Stepper

Multi-step progress indicator.

**Three sub-components:** `stepper indicator` · `line indicator` · `Stepper` (assembled)

### stepper indicator

**Variants:** `State` — `Inactive` · `Active` · `Completed`

24 × 24px circle per step.

| State | bg | icon/number | border |
|---|---|---|---|
| Inactive | `background/disabled` | `text/disabled` | — |
| Active | `background/info-subtle` (2026-07-23: was `background/primary` — solid blue redesigned to pale blue) | `text/info` (was `text/neutral`) | — |
| Completed | `background/primary` | checkmark `icon/info` (was `icon/neutral`) | — |

### line indicator

**Variants:** `State` — `Line Active` · `Line Inactive`

Horizontal connector between steps (rendered as a stroke, not a fill).

| State | color |
|---|---|
| Active | `border/info` (2026-07-23: same hex as `background/primary`, but now bound as a border-family token on what's a stroke anatomy, not the fill token documented before) |
| Inactive | `border/default` (was `background/disabled` — real color shift, #CBD5E1 vs #E1E7EF) |

> Inactive stepper-indicator state and the assembled `Stepper` (2/3/4 steps) variant/key list are unchanged.

### Stepper (assembled)

**Variants:** `Type` — `2 steps` · `3 steps` · `4 steps`

Uses `stepper indicator` + `line indicator` + step label text.  
**Label typography:** Caption 1 — 12px Regular, `text/subtle` (inactive) / `text/default` (active)

---

## Switch

Toggle control for binary on/off settings.

**Anatomy:** track → thumb (circle) → label text

**Variants:** `State` — `Default` · `Active` · `Disabled`

**Track dimensions:** 40 × 24px  
**Thumb:** 20 × 20px white circle  
**Radius (track):** `rounded-full`  
**Typography (label):** Body 2 — 14px Regular

| State | track bg | thumb | label |
|---|---|---|---|
| Default (off) | `background/disabled` | `base/white` (2026-07-23: renamed from `background/neutral` — identical hex, cosmetic only) | `text/default` |
| Active (on) | `background/primary` | `base/white` (same rename) | `text/default` |
| Disabled | `background/disabled` | `slate/100` #F1F5F9 (2026-07-23: was `background/neutral` #FFFFFF — a real if subtle shift off pure white) | `text/disabled` |

> Track colors match spec exactly in all 3 states — this is otherwise the cleanest component in the 2026-07-23 audit.

---

## Tab

Horizontal navigation within a single page or section.

**Three sub-components:** `Tab/Primary` · `Tab/Secondary` · `Tabs` (assembled container)

### Tab/Primary

Full-width underline-style tabs. Used for primary page-level navigation.

**Variants:** `state` — `Active` · `Inactive` · `Hovered`

**Dimensions:** 125px wide × 54px height (per tab, scales with content)  
**Padding:** 16px top/bottom · 12px left/right  
**Typography:** Subtitle 2 — 14px SemiBold

| State | text | bottom border |
|---|---|---|
| Active | `text/link` | `border/info` (2026-07-23: **2px**, was 3px) |
| Inactive | `text/subtle` | now has a 2px stroke bound to a non-semantic `info-border` variable (was documented as no border at all) |
| Hovered | `text/link` (2026-07-23: was `text/default`) | `border/info` (was `border/default`) — Hovered is now visually **identical to Active**, plus an undocumented `background/subtle` fill |

### Tab/Secondary

Pill-style tabs. Used for sub-sections or filter groups.

**Variants:** `state` — `Active` · `Default` · `Hovered` · `Disabled`

**Dimensions:** auto-width × **38px** (2026-07-23: was 36px)
**Padding:** 12px left/right · 8px top/bottom (was 8px/16px — horizontal and vertical swapped from the original spec)
**Radius:** **6px** (2026-07-23: was `rounded-full`/pill — no longer a pill shape)
**Typography:** Subtitle 2 — 14px SemiBold

| State | bg | text |
|---|---|---|
| Active | `background/primary` | `text/neutral` |
| Default | raw unbound var `bluects/400` (~#3D7AFF) (2026-07-23: was documented as transparent) | `text/subtle` |
| Hovered | `background/subtle` (plus an undocumented `border/info` stroke) | `text/link` (was `text/default`) |
| Disabled | `background/disabled` | `text/disabled` |

### Tabs (assembled)

**Variants:** `variant` — `primary` · `secondary`

Container that holds a row of Tab/Primary or Tab/Secondary items.  
Background: raw unbound white (2026-07-23: was bound to `background/neutral`) — visually identical but detached from the token. Bottom border: `strokeBottomWeight` is still set to 1px, but the paint array is now empty — the documented `border/subtle` divider is not actually rendered (effectively invisible). Measured sizes: Primary variant 387×54px, Secondary 385×46px (not previously documented).

---

## Text Area

Multi-line text input.

**Anatomy:** label → field (textarea) → helper text + character count

**Variants:** `Variant` × `State`
- Variants: `Auto-Resize` · `Scrollbar`
- States: `Default` · `Hover` · `Focused` · `Filled` · `Error` · `Success` · `Disabled`

**Padding (field):** **8px top/bottom · 12px left/right** (2026-07-23: was uniform 12px all sides)
**Radius:** `rounded` (6px, confirmed)
**Typography (label):** Subtitle 2 — 14px SemiBold (confirmed)
**Typography (input/placeholder):** Body 2 — 14px Regular (confirmed)
**Typography (helper):** Caption 1 — 12px Regular (confirmed)

| State | field bg | field border | border width | label color | helper color |
|---|---|---|---|---|---|
| Default | `background/neutral` | `border/default` | 1px | `text/default` | `text/subtle` |
| Hover | `background/neutral` | `border/info` (2026-07-23: was `border/hover`) | 1px | `text/default` | `text/subtle` |
| Focused | `background/neutral` | `blue/300` | 3px | `text/default` | `text/subtle` |
| Filled | `background/neutral` | `border/default` | 1px | `text/default` | `text/subtle` |
| Error | `background/neutral` | `icon/error` (2026-07-23: was `border/error` — an icon token reused as a border) | 1px | `text/error` | `text/error` |
| Success | `background/neutral` | `icon/success` (was `border/success` — same pattern) | 1px | `text/default` | `text/success` |
| Disabled | `background/disabled` (2026-07-23: was `background/subtle`) | `border/default` | 1px | `text/default` | `text/subtle` |

`blue/300` (#73AEFF) is used for the focused border — no semantic token alias exists for this value. Focused state, Default/Filled borders, and all typography are unaffected by the drift above.

---

## Text Field

Single-line text input.

**Anatomy:** label → field (input) → (prefix/suffix slot) → helper text + character count

**Variants:** `Variant` × `State` × `Size`
- Variants: `Default` · `Prefix` · `Suffix`
- States: `Default` · `Hover` · `Focused` · `Filled` · `Error` · `Success` · `Disabled`
- Sizes: `Large` (44px) · `Regular` (36px) · `Small` (32px)

**Padding (field):** 12px all sides (`spacing-3`)  
**Radius:** `rounded` (6px)  
**Typography (label):** Subtitle 2 — 14px SemiBold  
**Typography (input/placeholder):** Body 2 — 14px Regular  
**Typography (helper + counter):** Caption 1 — 12px Regular

| State | field bg | field border | border width | label | placeholder | helper |
|---|---|---|---|---|---|---|
| Default | `background/neutral` | `border/default` | 1px | `text/default` | `text/subtle` | `text/subtle` |
| Hover | `background/neutral` | `border/hover` | 1px | `text/default` | `text/subtle` | `text/subtle` |
| Focused | `background/neutral` | `blue/300` | 3px | `text/default` | `text/subtle` | `text/subtle` |
| Filled | `background/neutral` | `border/default` | 1px | `text/default` | `text/default` | `text/subtle` |
| Error | `background/neutral` | `icon/error` (2026-07-23: was `border/error` — an icon token reused as a border, same systemic swap as Text Area) | 1px | `text/error` | `text/default` | `text/error` |
| Success | `background/neutral` | `icon/success` (was `border/success`) | 1px | `text/default` | `text/default` | `text/success` |
| Disabled | `background/subtle` | `border/default` | 1px | `text/default` | `text/subtle` | `text/subtle` |

**Prefix / Suffix:** **62px** tall slot at leading or trailing edge of the field (2026-07-23: was documented as 44px). bg: `background/subtle` (confirmed), divider: stroke weight is set (1px) but has **no bound color** — the documented `border/default` divider is effectively invisible.

`blue/300` (#73AEFF) is used for the focused border — no semantic token alias exists for this value. Dimensions (Large 44px / Regular 36px / Small 32px field heights), 12px padding, 6px radius, and the Focused state are all confirmed unaffected.

---

## Toast

Temporary notification shown at the bottom of the screen.

**Anatomy:** message text → dismiss "×" icon

> **2026-07-23 — status icon removed:** walked the full node tree for Positive/Alert/Error/General (Single Action) — each variant's only children are a text frame and the dismiss "×" icon (`icon/fi/solid/cross-small`). There is no `icon/success`/`icon/warning`/`icon/error`/`icon/neutral` status icon anywhere. The dismiss icon is bound to `icon/neutral` (white) for Positive/Error/General and `icon/default` (dark) for Alert.

**Variants:** `Variant` × `Type`
- Variants: `Single Action` · `Multiple Action`
- Types: `Positive` · `Alert` · `Error` · `General`

**Dimensions:** 343px wide (auto height)  
**Radius:** `rounded-xl`  
**Padding:** 16px (`spacing-4`)

**Tokens (2026-07-23 — moved from pale-background/colored-text to solid-background/neutral-text, with several tokens now pointing to the wrong family):**
| Type | bg (doc → live) | text (doc → live) |
|---|---|---|
| Positive | `background/success-subtle` → **`background/success`** (solid saturated green #16A34A, not a pale tint) | `text/success` → **`text/neutral`** (white) |
| Alert | `background/warning-subtle` → **`background/secondary`** (not even a warning-family token; solid gold #FFCD05) | `text/warning` → **`text/default`** (dark) |
| Error | `background/error-subtle` → **`error-foreground`** (a *foreground* token driving a *background* fill; solid red #DC2626) | `text/error` → **`text/neutral`** (white) |
| General | `background/dark` → **`background/dark-secondary`** (different variable, visually close — solid dark slate #344256) | `text/neutral` (unaffected) |

**Typography (message):** Body 2 — 14px Regular  
**Typography (action):** Subtitle 2 — 14px SemiBold

Multiple Action variants were not independently re-verified — assumed to share the same per-type token drift as Single Action above.

---

## Tooltip

> **2026-07-23 — full anatomy rebuild.** This is no longer a small dark hint bubble; it's now a light, fixed-size info card. Confirm with design whether this rename-in-place (same component key, totally different look) is intentional before building against either version.

**Anatomy (current):** title text + body paragraph — the arrow pointer is gone entirely, no pointer node exists in the tree.

**Dimensions:** fixed **308×150px** (was: auto-size, wraps content, max ~200px)  
**Radius:** `rounded` (6px) (was `rounded-lg`/8px)  
**Padding:** 8px top/bottom · 12px left/right (unchanged)

**Tokens:**
| Element | Token |
|---|---|
| background | `background/neutral` (2026-07-23: was `background/dark` — inverted from a dark bubble to a white card) |
| title text | `text/default`, Geist **SemiBold 14px** (was single Caption 1/12px Regular) |
| body text | `text/default`, Geist **Regular 14px** (was `text/neutral`/Caption 1) |

---

## Top Navbar

Fixed top navigation bar. Has variants per platform context.

**Variants:** `Variant`
| Variant | Width | Context |
|---|---|---|
| CustomerApp-Default | 375px | Mobile customer app |
| Intools-Mobile | 375px | Internal tools, mobile |
| Intools-Tablet/Desktop | **589px** (2026-07-23: was documented as 1440px) | Internal tools, wide |
| LandingPage-Mobile | 374px (was 375px, likely negligible) | Marketing site, mobile |
| LandingPage-Tablet/Desktop | 1440px | Marketing site, wide |

**Tokens:**
| Element | Token |
|---|---|
| background (CustomerApp-Default) | `background/neutral` (correctly bound) |
| background (Intools-Tablet/Desktop) | `background/primary` + `border/default` — 2026-07-23: this variant no longer shares the same bg/border tokens as CustomerApp-Default, despite the doc implying one shared pair |
| bottom border (CustomerApp-Default) | raw unbound white #FFFFFF (2026-07-23: binding to `border/subtle` was dropped — the divider is effectively invisible instead of a visible subtle line) |
| title text | `text/default`(ish — hardcoded, not bound), **20px Bold** (2026-07-23: was Subtitle 1/16px SemiBold, and detached from any text style even though the color coincidentally still matches) |
| icon | `icon/default` |
| back arrow | `icon/default` |

**ActionButton-TopNavbar:** 24 × 24px icon slot (supports icon-only or icon + badge). Confirmed unchanged 2026-07-23 — both variants (`Icon-TopNavbar`, `Badge-Navbar`) still match anatomy and keys.
Badge styling: see [Badge Notification](#badge-notification).

**Tablet/Desktop-Leading-TopNavBar** (previously undocumented — gap filled 2026-07-23):
| Variant | Dimensions | Key |
|---|---|---|
| Page Title | 119.5×32px | `f7d64ef34dbf6c6f94a5e3cd4e6f859f1bbf6690` |
| Search | 255×32px | `e89dac159118cc4c4795de4921051c15d817c900` |

---

## Uploader: General

> **2026-07-23 — rebuilt on a different pattern.** This is not incremental drift: the dashed drop-zone has been replaced by a text-field-style control. Confirm with design which anatomy is current before implementing.

**Variants:** `states` — `default` · `filled` · `error` · `disabled` (2026-07-23: doc previously said no named variant axis existed)

**Anatomy (current):** a text-field-style row (search icon, "Choose File"/"Filled Value" text, a clear icon in default/filled or an exclamation icon in error, a chevron) plus a separate "Select File" button (user icon + label + arrow-right icon). No dashed stroke exists in any inspected state, and the documented drag-over active state does not appear to exist at all anymore.

**Anatomy (previously documented, no longer current):** dashed border container → icon → label → helper text → (file list)

**Tokens (current):**
| Element | Token |
|---|---|
| label/helper | `muted-foreground` (non-Cortes generic token, see [Migration note](#generic-token-migration)) |
| error text | `text/error` |
| error border | `icon/error` (an icon token reused as a stroke) |
| button bg | `background/primary` / `background/disabled` |
| icons | `icon/neutral` / `icon/disabled` |
| radius | 6px (was `rounded-xl`/10px) |

**Tokens (previously documented, no longer current):**
| Element | Token |
|---|---|
| background | `background/subtle` |
| border | `border/default` dashed |
| icon | `icon/subtle` |
| label | `text/default`, Subtitle 2 — 14px SemiBold |

**Active (file dragged over) — previously documented, not found in current anatomy:**
| Element | Token |
|---|---|
| background | `background/info-subtle` |
| border | `border/info` dashed |

---

## Uploader: Image

Image-specific upload input with preview support.

**Variants:** 2026-07-23 — gained a `size` axis (`large` 320×171 / `default` 152×120 / `small` 80×80, tripling the variant count to 12) plus two new states: `loading` (embeds a [Loader: General](#loader-general) instance) and `error` (dark `overlay/default` scrim, solid red `border/error` border replacing the dashed one, retry CTA icon). These are additive, not a destructive rebuild — unlike its sibling [Uploader: General](#uploader-general), the empty-state anatomy below is still fully intact and correctly tokenized.

**Anatomy:** square/rectangular container → placeholder icon → label → preview (post-upload)

**Tokens:**
| Element | Token |
|---|---|
| background (empty) | `background/subtle` (confirmed) |
| border (empty) | `border/default` dashed, dash [6,6] weight 1 (confirmed) |
| radius | **8px** (2026-07-23: was `rounded-xl`/10px) |
| icon (empty) | `icon/subtle` (confirmed) |
| label | `text/subtle`, Geist Regular 12px (confirmed) |
| background (filled/error) | `background/neutral` (white) (2026-07-23: was documented as `background/disabled`) |

---

*Generated 2026-05-18 from Figma DS audit, updated 2026-07-23 (Banner Info merged into a single component set with new desktop background tokens; full DS re-audit — 32 of 38 components found drifted from Figma, see [Migration note](#generic-token-migration)). Covers all 30 component groups in Design System – Component – Cortes.*

---

## Generic Token Migration

**2026-07-23 — this looks like an in-progress design-token migration, not a finished redesign.** Across the components above, the same signatures repeat: semantic tokens rebound to the wrong family (borders → `icon/*`, backgrounds → `foreground`/`error-foreground`), a parallel *generic* token set bleeding in (`background`, `foreground`, `muted-foreground`, `primary`, `primary-foreground`, `border`, `info-border`, `bluects/400` — shadcn/ui-style names, not Cortes' own), colors detached from any token (raw unbound hex where a variable used to be), and — on Bottom Sheet — a brand-new 4-mode `Token` collection (`light/bluects`, `dark/slate`, `light/zinc`, `dark/zinc`) with no other equivalent in this file. Several components also show inconsistency *between sibling variants* (e.g. Bottom Navbar's `menu-profile` is untouched while `menu-emas` has no token binding at all), which reads as a partially-applied edit rather than a settled decision. Treat every "2026-07-23" note above as current-state-as-observed, not as an endorsed new spec — confirm with whoever owns the DS before building against it, especially for anything marked as a full anatomy rebuild (Toast, Tooltip, Uploader: General, Modal, Loader: Skeleton, Bottom Sheet).
