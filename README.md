# Pandai Gadai – Claude Code Setup

This repo contains the Claude Code context files for working with the **Cortes Design System** in Figma and on localhost. Once set up, Claude will automatically know your component keys, tokens, layout principles, and Figma protocol — no manual setup needed each session.

---

## Getting Started

### 1. Clone the repo
```bash
git clone git@github.com:azzahrapr/Cortes-Design-System.git
```

### 2. Open the folder in Claude Code
Claude Code automatically reads `CLAUDE.md` on startup, which points to all context files.

### 3. Connect Figma MCP *(for Figma work only)*
Make sure you have the **Figma MCP server** connected to Claude Code. Without it, Claude can read the index but won't be able to make changes in Figma.

### 4. Open your Figma file *(for component placement only)*
This step is only needed when you want Claude to **place or swap components** on your canvas. For token lookups (colors, spacing, typography), Claude reads `design-tokens.md` directly — no Figma needed.

When placing components, Claude cannot open Figma on its own — you need to have the **Figma desktop app open** with the file you want to work on. The Figma MCP connects Claude Code to whatever file is currently active in Figma.

The flow looks like this:
```
You open the Figma file → Claude connects via MCP
↓
Claude reads component keys from design-components.md
↓
Claude places the right components directly onto your canvas
```

> **Token lookups** (e.g. "what's the primary color?" or "use the correct spacing") work without Figma open — Claude reads the values from `design-tokens.md`.

---

## Files in This Repo

| File | Who needs it | What it does |
|---|---|---|
| `CLAUDE.md` | Everyone | Entry point — auto-loaded by Claude Code |
| `layout-guidelines.md` | Everyone | Design principles for all screens |
| `design-components.md` | Everyone | Component index with names and keys |
| `design-tokens.md` | Everyone | Color, spacing & typography tokens |
| `figma/figma-protocol.md` | Figma users | Technical rules for every `use_figma` call |
| `figma/figma-plugin-helpers.js` | Figma users | Token & component helper functions |

---

## How to Talk to Claude

### Be specific about the page *(Figma)*
Always mention which Figma page your screen is on.

✅ Do this:
> "On the **↳ Gadai Instan** page, add a simulasi screen"

❌ Not this:
> "Add a simulasi screen"

### Reference components by DS name
Use component names from `design-components.md` so Claude can match them directly.

✅ Do this:
> "Add a `chips/default` and a `list-item` to this screen"

---

## Keeping the Index Up to Date

If a new component is added to the DS, ask Claude to find and add it:

> "Search for the new `[component name]` component in the DS and add it to `design-components.md`"
