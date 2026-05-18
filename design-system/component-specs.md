# Cortes Design System – Component Specs

Stack-agnostic reference for implementing DS components **without Figma access**.  
All token names refer to values defined in `design-tokens.md`. No Figma keys appear here.

---

## How to use this file

1. Read `design-tokens.md` first — every token name used here (e.g. `background/primary`, `rounded-lg`) resolves to a concrete hex, px, or font value in that file.
2. Each component section describes anatomy, variant dimensions, and which tokens to apply per state.
3. Font family for all components: **Geist**.

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

---

## Accordion

Single collapsible section with a header trigger and expandable body.

**Anatomy:** header row (label + chevron icon) → body content (revealed on expand)

**Dimensions:** 487px wide (scales to container)

**Tokens:**
| Element | Token |
|---|---|
| background | `background/neutral` |
| label | `text/default` |
| chevron icon | `icon/default` |
| border (bottom) | `border/subtle` |
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
| background (alphabet) | `background/primary` |
| label (alphabet) | `text/neutral` |
| background (artwork) | `background/disabled` (fallback if no image) |
| border (optional) | `border/neutral` |

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
| typography (text/number) | Label 2 — 10px Bold |
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

**Typography:** Label 2 — 10px Bold  
**Radius:** `rounded-full`  
**Padding:** 2px top/bottom · 8px left/right

---

## Badge Status

Semantic status label used on items, lists, and tables.

**Anatomy:** container → label text

**Variants:** `state` × `type`

- States: `success` · `informative` · `warning` · `error` · `finished`
- Types: `light` · `solid`

**Dimensions:** auto-width × 16px height  
**Radius:** `rounded-full`  
**Padding:** 2px top/bottom · 8px left/right  
**Typography:** Label 2 — 10px Bold

**Tokens — light type:**
| State | bg | border | text |
|---|---|---|---|
| success | `background/success-subtle` | `border/success` | `text/success` |
| informative | `background/info-subtle` | `border/info` | `text/info` |
| warning | `background/warning-subtle` | `border/warning` | `text/warning` |
| error | `background/error-subtle` | `border/error` | `text/error` |
| finished | `background/disabled` | `border/default` | `text/subtle` |

**Tokens — solid type:**
| State | bg | border | text |
|---|---|---|---|
| success | `background/success` | `text/success` (as border) | `text/neutral` |
| informative | `background/primary` | `background/primary-darker` | `text/neutral` |
| warning | `background/warning` | `text/warning` (as border) | `text/neutral` |
| error | `background/error` | `text/error` (as border) | `text/neutral` |

---

## Banner Info

Full-width informational strip used to surface contextual messages.

**Two sub-components:** `banner - mobile` and `banner - desktop`

**Dimensions:**
| Sub-component | Width | Height |
|---|---|---|
| mobile | 343px (full-width) | 60px |
| desktop | 343px | 150px |

**Variants (desktop):** `Base` · `Informative` · `Success` · `Alert` · `Error`

**Tokens:**
| Variant | bg | text | border/icon |
|---|---|---|---|
| Base | `background/subtle` | `text/default` | `border/default` |
| Informative | `background/info-subtle` | `text/info` | `border/info` |
| Success | `background/success-subtle` | `text/success` | `border/success` |
| Alert | `background/warning-subtle` | `text/warning` | `border/warning` |
| Error | `background/error-subtle` | `text/error` | `border/error` |

**Radius:** `rounded-lg`

---

## Bottom Navbar

Fixed bottom navigation bar containing 4 tab items.

**Anatomy:**  
`bottom-navbar` (assembled, 375 × 84px) → 4 menu items side by side

**Individual menu items** (`menu-home`, `menu-pinjaman`, `menu-emas`, `menu-profile`):
- 80 × 44px each
- `State`: `Unselected` · `Selected`

**Tokens:**
| Element | State | Token |
|---|---|---|
| navbar background | — | `background/neutral` |
| navbar top border | — | `border/subtle` |
| icon | Unselected | `icon/subtle` |
| icon | Selected | `icon/info` |
| label | Unselected | `text/subtle` |
| label | Selected | `text/info` |
| typography | — | Caption 1 — 12px Regular |

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
| background | `background/neutral` |
| drag handle | `background/disabled` |
| title | `text/default`, Title 1 — 20px Bold |
| body text | `text/subtle`, Body 2 — 14px Regular |
| backdrop / overlay | `overlay/default` |
| radius (top corners) | `rounded-3xl` |

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
| Default | `background/neutral` | `border/default` | — | `text/default` |
| Selected | `background/primary` | `border/info` | `icon/neutral` | `text/default` |
| Disabled Default | `background/disabled` | `border/subtle` | — | `text/disabled` |
| Disabled Selected | `background/disabled` | `border/subtle` | `icon/disabled` | `text/disabled` |

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
| active | `background/info-subtle` | `border/info` | `text/link` | `background/primary` | `text/neutral` |
| disabled | `background/subtle` | `border/default` | `text/disabled` | `background/disabled` | `text/disabled` |

---

## Data Table

Tabular display of structured data.

**Two sub-components:** `table-header` and `table-cell`

### table-header

**Variants:** `text` (true/false) × `checkbox` (true/false)

**Dimensions:** auto-width × 40px  
**Typography:** Label 1 — 12px Bold  
**Tokens:**
| Element | Token |
|---|---|
| background | `background/subtle` |
| text | `text/subtle` |
| border (bottom) | `border/default` |
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
| default | `background/neutral` | `border/subtle` |
| hovered | `background/subtle` | `border/subtle` |

Badges inside cells use the [Badge Status](#badge-status) component.

---

## Date Picker

Calendar UI for selecting a date or date range.

**Variants:** `Variant` × `State`
- Variants: `2 Month` · `1 Month` · `Single`
- States: `Default` · `Filled`

**Dimensions:**
| Variant | Width | Height |
|---|---|---|
| 2 Month | 560px | 352px |
| 1 Month | 276px | 358px |
| Single | 276px | 358px |

**Tokens:**
| Element | Token |
|---|---|
| background | `background/neutral` |
| border | `border/default` |
| radius | `rounded-xl` |
| selected day bg | `background/primary` |
| selected day text | `text/neutral` |
| today indicator | `border/info` |
| range highlight | `background/info-subtle` |
| day text (default) | `text/default` |
| day text (disabled) | `text/disabled` |
| header text | `text/default`, Subtitle 1 — 16px SemiBold |
| nav icon | `icon/default` |

---

## Divider

Visual separator between content sections.

**Variants:** `Type` — `Line` · `Gap` · `dash`

**Dimensions (default width 375px, scales to container):**
| Type | Height | Description |
|---|---|---|
| Line | 1px | Solid horizontal rule |
| dash | 1px | Dashed horizontal rule |
| Gap | 8px | Transparent spacer block |

**Tokens:**
| Type | color |
|---|---|
| Line | `border/subtle` |
| dash | `border/subtle` |
| Gap | transparent |

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
| Active | `background/neutral` | `text/default` | `icon/default` |
| Hovered | `background/subtle` | `text/default` | `icon/default` |
| Disabled | `background/neutral` | `text/disabled` | `icon/disabled` |

Nested type adds 16px left indent to the content.

### action (trailing control)

24 × 24px slot placed at the trailing edge of a list item.

**Variants:** `Action` — `Checkbox` · `Radio Button` · `Arrow`

Uses the respective [Checkbox](#checkbox) or [Radio Button](#radio-button) component styling. Arrow uses `icon/subtle`.

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
| spinner fill | `background/primary` |
| label text | `text/subtle`, Body 2 — 14px Regular |

---

## Loader: Skeleton

Placeholder blocks shown while content is loading.

**Variants:** `Type` — `Rectangle` · `Circle`

**Tokens:**
| Element | Token |
|---|---|
| fill | `background/disabled` |
| shimmer overlay | `background/subtle` (animated) |

**Radius:**
- Rectangle: `rounded-lg`
- Circle: `rounded-full`

---

## Modal

Centered overlay dialog requiring user acknowledgement or action.

**Anatomy:** backdrop → modal card (icon + title + body + action buttons)

**Variants:** `variant` — `default` · `info` · `success` · `alert` · `error`

**Dimensions:** 343px wide × 215px height (min; grows with content)  
**Radius:** `rounded-2xl`  
**Padding:** 24px (`spacing-6`) all sides

**Tokens:**
| Element | Token |
|---|---|
| card background | `background/neutral` |
| backdrop | `overlay/default` |
| title | `text/default`, Title 1 — 20px Bold |
| body | `text/subtle`, Body 2 — 14px Regular |
| close icon | `icon/subtle` |

**Icon color per variant:**
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
| Default | transparent | `text/subtle` |
| Selected | `background/primary` | `text/neutral` |
| Nav Default | transparent | `icon/default` |
| Nav Disabled | transparent | `icon/disabled` |

**Typography:** Body 2 — 14px Regular

---

## Progress Bar

Horizontal bar indicating completion percentage.

**Variants:** `State` × `Device`
- States: `0%` · `25%` · `50%` · `75%` · `100%`
- Devices: `Mobile` · `Desktop`

**Dimensions (Mobile):** full-width × 8px  
**Dimensions (Desktop):** full-width × 8px

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
| Default | `border/default` | — | `text/default` |
| Selected | `border/info` | `background/primary` | `text/default` |
| Disabled | `border/subtle` | `background/disabled` | `text/disabled` |

**Radius (circle):** `rounded-full`  
**Typography (label):** Body 2 — 14px Regular

---

## Side Navbar

Vertical navigation panel for tablet and desktop layouts.

**Variants:** `Variant` × `State`
- Variants: `Desktop` · `Mobile`
- Desktop states: `Open-Default` · `Open-Scrollable` · `Closed-Default`
- Mobile states: `Default` · `Scrollable`

**Tokens:**
| Element | Token |
|---|---|
| background | `background/dark` |
| active item bg | `background/dark-secondary` |
| active item indicator | `background/primary` |
| nav label (default) | `text/neutral` (at reduced opacity) |
| nav label (active) | `text/neutral` |
| icon (default) | `icon/neutral` (at reduced opacity) |
| icon (active) | `icon/neutral` |
| border (right) | `border/subtle` |
| typography | Body 2 — 14px Regular |

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
| Active | `background/primary` | `text/neutral` | — |
| Completed | `background/primary` | checkmark `icon/neutral` | — |

### line indicator

**Variants:** `State` — `Line Active` · `Line Inactive`

Horizontal connector between steps.

| State | color |
|---|---|
| Active | `background/primary` |
| Inactive | `background/disabled` |

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
| Default (off) | `background/disabled` | `background/neutral` | `text/default` |
| Active (on) | `background/primary` | `background/neutral` | `text/default` |
| Disabled | `background/disabled` | `background/neutral` | `text/disabled` |

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
| Active | `text/link` | `border/info` (3px) |
| Inactive | `text/subtle` | — |
| Hovered | `text/default` | `border/default` |

### Tab/Secondary

Pill-style tabs. Used for sub-sections or filter groups.

**Variants:** `state` — `Active` · `Default` · `Hovered` · `Disabled`

**Dimensions:** auto-width × 36px  
**Padding:** 8px top/bottom · 16px left/right  
**Radius:** `rounded-full`  
**Typography:** Subtitle 2 — 14px SemiBold

| State | bg | text |
|---|---|---|
| Active | `background/primary` | `text/neutral` |
| Default | transparent | `text/subtle` |
| Hovered | `background/subtle` | `text/default` |
| Disabled | `background/disabled` | `text/disabled` |

### Tabs (assembled)

**Variants:** `variant` — `primary` · `secondary`

Container that holds a row of Tab/Primary or Tab/Secondary items.  
Background: `background/neutral`, bottom border: `border/subtle`.

---

## Text Area

Multi-line text input.

**Anatomy:** label → field (textarea) → helper text + character count

**Variants:** `Variant` × `State`
- Variants: `Auto-Resize` · `Scrollbar`
- States: `Default` · `Hover` · `Focused` · `Filled` · `Error` · `Success` · `Disabled`

**Padding (field):** 12px all sides (`spacing-3`)  
**Radius:** `rounded` (6px)  
**Typography (label):** Subtitle 2 — 14px SemiBold  
**Typography (input/placeholder):** Body 2 — 14px Regular  
**Typography (helper):** Caption 1 — 12px Regular

| State | field bg | field border | border width | label color | helper color |
|---|---|---|---|---|---|
| Default | `background/neutral` | `border/default` | 1px | `text/default` | `text/subtle` |
| Hover | `background/neutral` | `border/hover` | 1px | `text/default` | `text/subtle` |
| Focused | `background/neutral` | `blue/300` | 3px | `text/default` | `text/subtle` |
| Filled | `background/neutral` | `border/default` | 1px | `text/default` | `text/subtle` |
| Error | `background/neutral` | `border/error` | 1px | `text/error` | `text/error` |
| Success | `background/neutral` | `border/success` | 1px | `text/default` | `text/success` |
| Disabled | `background/subtle` | `border/default` | 1px | `text/default` | `text/subtle` |

`blue/300` (#73AEFF) is used for the focused border — no semantic token alias exists for this value.

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
| Error | `background/neutral` | `border/error` | 1px | `text/error` | `text/default` | `text/error` |
| Success | `background/neutral` | `border/success` | 1px | `text/default` | `text/default` | `text/success` |
| Disabled | `background/subtle` | `border/default` | 1px | `text/default` | `text/subtle` | `text/subtle` |

**Prefix / Suffix:** 44px tall slot at leading or trailing edge of the field. bg: `background/subtle`, divider: `border/default`.

`blue/300` (#73AEFF) is used for the focused border — no semantic token alias exists for this value.

---

## Toast

Temporary notification shown at the bottom of the screen.

**Anatomy:** icon → message text → (action button)

**Variants:** `Variant` × `Type`
- Variants: `Single Action` · `Multiple Action`
- Types: `Positive` · `Alert` · `Error` · `General`

**Dimensions:** 343px wide (auto height)  
**Radius:** `rounded-xl`  
**Padding:** 16px (`spacing-4`)

| Type | bg | icon | text |
|---|---|---|---|
| Positive | `background/success-subtle` | `icon/success` | `text/success` |
| Alert | `background/warning-subtle` | `icon/warning` | `text/warning` |
| Error | `background/error-subtle` | `icon/error` | `text/error` |
| General | `background/dark` | `icon/neutral` | `text/neutral` |

**Typography (message):** Body 2 — 14px Regular  
**Typography (action):** Subtitle 2 — 14px SemiBold

---

## Tooltip

Small contextual hint bubble shown on hover or focus.

**Anatomy:** arrow pointer → content container → label

**Dimensions:** auto-size (wraps content, max ~200px)  
**Radius:** `rounded-lg`  
**Padding:** 8px top/bottom · 12px left/right

**Tokens:**
| Element | Token |
|---|---|
| background | `background/dark` |
| text | `text/neutral` |
| typography | Caption 1 — 12px Regular |

---

## Top Navbar

Fixed top navigation bar. Has variants per platform context.

**Variants:** `Variant`
| Variant | Width | Context |
|---|---|---|
| CustomerApp-Default | 375px | Mobile customer app |
| Intools-Mobile | 375px | Internal tools, mobile |
| Intools-Tablet/Desktop | 1440px | Internal tools, wide |
| LandingPage-Mobile | 375px | Marketing site, mobile |
| LandingPage-Tablet/Desktop | 1440px | Marketing site, wide |

**Tokens:**
| Element | Token |
|---|---|
| background | `background/neutral` |
| bottom border | `border/subtle` |
| title text | `text/default`, Subtitle 1 — 16px SemiBold |
| icon | `icon/default` |
| back arrow | `icon/default` |

**ActionButton-TopNavbar:** 24 × 24px icon slot (supports icon-only or icon + badge).  
Badge styling: see [Badge Notification](#badge-notification).

---

## Uploader: General

Drag-and-drop or tap-to-upload file input area.

**Variants:** Configurable via props (no named variant axis beyond file types).

**Anatomy:** dashed border container → icon → label → helper text → (file list)

**Tokens:**
| Element | Token |
|---|---|
| background | `background/subtle` |
| border | `border/default` dashed |
| radius | `rounded-xl` |
| icon | `icon/subtle` |
| label | `text/default`, Subtitle 2 — 14px SemiBold |
| helper | `text/subtle`, Caption 1 — 12px Regular |

**Active (file dragged over):**
| Element | Token |
|---|---|
| background | `background/info-subtle` |
| border | `border/info` dashed |

---

## Uploader: Image

Image-specific upload input with preview support.

**Variants:** Configurable; shows image thumbnail after upload.

**Anatomy:** square/rectangular container → placeholder icon → label → preview (post-upload)

**Tokens:**
| Element | Token |
|---|---|
| background (empty) | `background/subtle` |
| border (empty) | `border/default` dashed |
| radius | `rounded-xl` |
| icon (empty) | `icon/subtle` |
| label | `text/subtle`, Caption 1 — 12px Regular |
| background (filled) | `background/disabled` (behind preview) |

---

*Generated 2026-05-18 from Figma DS audit. Covers all 30 component groups in Design System – Component – Cortes.*
