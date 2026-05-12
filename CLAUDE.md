# Claude Code – Project Context

## Design System

This project uses the Cortes Design System.

→ [design-system/design-components.md](design-system/design-components.md) — component keys & page map  
→ [design-system/design-tokens.md](design-system/design-tokens.md) — color, spacing & typography tokens  
→ [design-system/layout-guidelines.md](design-system/layout-guidelines.md) — layout principles (read before building any screen)  
→ [design-system/figma/figma-protocol.md](design-system/figma/figma-protocol.md) — technical rules for every `use_figma` call  
→ [design-system/figma/figma-plugin-helpers.js](design-system/figma/figma-plugin-helpers.js) — token & component helper functions  

## Figma Workflow Tips

- Always specify the **page name** when targeting a page (e.g. "on the ↳ Gadai Instan page")
- Use pre-indexed component keys from `design-components.md` directly — do not run `search_design_system` unless a component is missing
- When a component is missing, search for it and add it to `design-components.md`
