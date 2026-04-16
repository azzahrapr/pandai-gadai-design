# Cortes Design System – Claude Code Setup

This repo contains the Claude Code context files for working with the **Cortes Design System** in Figma. Once set up, Claude will automatically know your component keys, file keys, and page map — no need to manually search or provide links every session.

---

## Getting Started

### 1. Clone the repo
```bash
git clone git@github.com:azzahrapr/Cortes-Design-System.git
```

### 2. Open the folder in Claude Code
Claude Code automatically reads `CLAUDE.md` on startup, which loads the full component index from `CORTES-DS-components.md`.

### 3. Connect Figma MCP
Make sure you have the **Figma MCP server** connected to Claude Code. Without it, Claude can read the index but won't be able to make changes in Figma.

---

## Files in This Repo

| File | What it does |
|---|---|
| `CLAUDE.md` | Entry point — auto-loaded by Claude Code |
| `CORTES-DS-components.md` | Full component index with keys and page map |
| `CORTES-DS-tokens.md` | *(coming soon)* Color, spacing & typography tokens |

---

## How to Talk to Claude

### Be specific about the page
Always mention which Figma page your screen is on. This avoids slow page searches.

✅ Do this:
> "On the **Category: New ELE** page, replace the button on the Riwayat Gadai screen with the DS button"

❌ Not this:
> "Replace the button on the Riwayat Gadai screen"

### Reference components by their DS name
Use the component names from `CORTES-DS-components.md` so Claude can match them directly.

✅ Do this:
> "Add a `chips/default` and a `toast` to this screen"

---

## Keeping the Index Up to Date

If a new component is added to the DS, update `CORTES-DS-components.md` with its name and key, then push. You can ask Claude to do this:

> "Search for the new `[component name]` component in the DS and add it to the index"

---

## Customer App – Page Map

| Page | Contains |
|---|---|
| `↳ Gadai Instan` | Login, Simulasi Pinjaman screens |
| `↳ Category: New ELE` | Riwayat Gadai screen |
| `↳ Category: BPKB` | BPKB category screens |

---

## Future Improvements

### 1. Expand page map with screen node IDs
Currently the page map only tells Claude which page a screen is on. Adding the node ID of each screen would let Claude jump directly to it with zero searching:

```
↳ Category: New ELE
  - Riwayat Gadai → node: 1:2849
```

### 2. Add component usage guide
Add a short note per component on when to use which variant, so Claude makes the right choice without needing explicit instructions every time. Example:

```
badge-status     → use for transaction/order states
badge-notification → use for unread counts
badge-product    → use for product categories
```

### 3. Auto-update index script
Set up a script that re-indexes the DS automatically whenever a new component is added to the Figma library — so `CORTES-DS-components.md` never goes stale without manual effort.
