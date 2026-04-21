# Claude Code – Project Context

## Design System

This project uses the Cortes Design System.

→ [design-components.md](design-components.md) — component keys & page map  
→ [design-tokens.md](design-tokens.md) — color, spacing & typography tokens  
→ [layout-guidelines.md](layout-guidelines.md) — layout principles (read before building any screen)  
→ [figma/figma-protocol.md](figma/figma-protocol.md) — technical rules for every `use_figma` call  
→ [figma/figma-plugin-helpers.js](figma/figma-plugin-helpers.js) — token & component helper functions  

## Figma Workflow Tips

- Always specify the **page name** when targeting a page (e.g. "on the ↳ Gadai Instan page")
- Use pre-indexed component keys from `design-components.md` directly — do not run `search_design_system` unless a component is missing
- When a component is missing, search for it and add it to `design-components.md`
