# Claude Code Skills

Custom slash commands for this project. Open any file in this folder to see how a skill works.

---

## `/add-inspect`

Adds a live inspect overlay to any prototype — click any element to see its design tokens, computed CSS, size, and export options.

### What it does

| Feature | Detail |
|---|---|
| Click to inspect | Click any element to lock the inspect panel on it |
| Design tokens | Auto-resolves colors, typography, and border-radius to Cortes token names |
| Image export | Export any `<img>` at 1x / 2x / 3x / 4x as PNG |
| SVG copy | Copy inline SVG markup to clipboard |
| CSS copy | Copy computed CSS with token annotations |
| Hover ring | Dashed ring while hovering, solid ring when locked |
| Toggle | Always-visible badge (gray = off, blue = on), or press `I` to toggle |
| URL param | Add `?inspect=true` to start a page with inspect already on |

### Supported stacks

| Stack | Status |
|---|---|
| Plain HTML | ✅ Supported |
| React / Vite | ✅ Supported |
| Vue | 🔜 Not yet implemented |
| Svelte | 🔜 Not yet implemented |
| Angular | 🔜 Not yet implemented |

### Usage

```
/add-inspect path/to/prototype.html
/add-inspect path/to/react-project/
```

The skill auto-detects the stack — no need to specify.

- `.html` file → injects vanilla JS overlay directly into the file
- Directory → reads `package.json` to identify the framework, then scaffolds the right implementation

### How detection works

1. If the arg ends in `.html` → HTML mode
2. Otherwise, reads `package.json` in the target directory
3. Checks `dependencies` and `devDependencies` for framework keys:
   - `react` → React mode
   - `vue` / `svelte` / `@angular/core` → stops with "not yet implemented"
4. If no framework is found → asks you to clarify

### What gets created (React)

Five files are added to `src/` and `App.tsx` is updated:

```
src/
  inspectStore.ts       — in-memory store for element refs and string snippets
  InspectContext.tsx    — React context; manages active state + selected element
  InspectOverlay.tsx    — transparent click/hover capture layer + ring indicator
  InspectPanel.tsx      — sidebar panel showing tokens, CSS, and export buttons
  InspectLabel.tsx      — optional wrapper to annotate a component with a name
```

To use `InspectLabel` on a specific component:

```tsx
import { InspectLabel } from './InspectLabel'

<InspectLabel label="Primary Button" tokens={['background/primary', 'font-styles/label-1']}>
  <button className="btn-primary">Gadai Sekarang</button>
</InspectLabel>
```

### What gets added (HTML)

Injected directly into the `.html` file:

- CSS block with all overlay styles
- `#inspect-badge` toggle button and `#inspect-panel` div after `<body>`
- A self-contained IIFE script with full token resolution and export logic

No build step, no dependencies.

### Adding a new stack

1. Add a row to the detection table in `add-inspect.md`
2. Add a new `## [Stack] Mode` section with step-by-step instructions
3. Update the supported stacks table in this README
