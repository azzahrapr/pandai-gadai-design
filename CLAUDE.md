# Claude Code – Project Context

## Design System

This project uses the Cortes Design System.

→ [design-system/design-components.md](design-system/design-components.md) — component keys & page map (Figma users)  
→ [design-system/design-tokens.md](design-system/design-tokens.md) — color, spacing & typography tokens (all users)  
→ [design-system/component-specs.md](design-system/component-specs.md) — stack-agnostic component specs (non-Figma users)  
→ [design-system/layout-guidelines.md](design-system/layout-guidelines.md) — layout principles (read before building any screen)  
→ [design-system/figma/figma-protocol.md](design-system/figma/figma-protocol.md) — technical rules for every `use_figma` call  
→ [design-system/figma/figma-plugin-helpers.js](design-system/figma/figma-plugin-helpers.js) — token & component helper functions  

---

## Design System Workflow — Auto-Detection

**At the start of any UI implementation task, determine which mode applies:**

### Figma Mode (MCP connected)
Condition: the `use_figma` / Figma MCP tools are available in this session.

1. Read `design-system/design-components.md` for component keys
2. Read `design-system/design-tokens.md` for tokens
3. Follow `design-system/figma/figma-protocol.md` for every `use_figma` call
4. Use `design-system/layout-guidelines.md` before building any screen

### Non-Figma Mode (no MCP)
Condition: Figma MCP tools are NOT available, or the user has no Figma access.

1. Read `design-system/component-specs.md` for component anatomy, variants, dimensions, and token usage
2. Read `design-system/design-tokens.md` to resolve every token name to its concrete value (hex, px, font)
3. Read `design-system/layout-guidelines.md` before building any screen
4. Do NOT reference `design-components.md` — the Figma keys in that file are not useful without MCP access

**Do not ask the user which mode to use — detect it automatically.**  
If `use_figma` is callable in the current session → Figma Mode. Otherwise → Non-Figma Mode.

---

## Figma Workflow Tips

- Always specify the **page name** when targeting a page (e.g. "on the ↳ Gadai Instan page")
- Use pre-indexed component keys from `design-components.md` directly — do not run `search_design_system` unless a component is missing
- When a component is missing, search for it and add it to `design-components.md`
