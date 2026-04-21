# Figma Design Protocol

Follow this checklist every time a screen is built via `use_figma`, without exception.

---

## 1. Always use top-level `await` — never `async function main()`

The Figma MCP runtime does NOT await Promises returned by async functions.
Always write plugin code using top-level `await` only.

```js
// WRONG — all async ops silently fail, nothing appears in Figma
async function main() { ... }
main();

// CORRECT
await figma.setCurrentPageAsync(page);
const v = await figma.variables.importVariableByKeyAsync(key);
```

Applies to: `setCurrentPageAsync`, `importComponentByKeyAsync`, `importVariableByKeyAsync`,
`importStyleByKeyAsync`, `loadFontAsync`, `setTextStyleIdAsync`.

---

## 2. Always switch to the target page explicitly

The MCP runtime connects to whichever page was last active — never assume.
Always call `setCurrentPageAsync` at the top of every plugin call.

```js
const page = figma.root.children.find(p => p.name.includes('Gadai Instan'));
await figma.setCurrentPageAsync(page);
```

---

## 3. Pre-import everything before creating nodes

Import all variables, text styles, and components at the top before creating any frames or nodes.
This avoids partial builds where some nodes appear and others don't.

```js
// ── Fonts
await figma.loadFontAsync({ family: 'Geist', style: 'Regular' });
await figma.loadFontAsync({ family: 'Geist', style: 'SemiBold' });
await figma.loadFontAsync({ family: 'Geist', style: 'Bold' });

// ── Variables
const vSubtle = await figma.variables.importVariableByKeyAsync('...');

// ── Text styles
const sSub1 = await figma.importStyleByKeyAsync('...');

// ── Components
const cNavbar = await figma.importComponentByKeyAsync('...');

// ── Then build nodes
const frame = figma.createFrame();
```

---

## 4. Text layers — always bind DS text style + color token

Never set font properties manually. Always:
1. Pre-load the font with `loadFontAsync`
2. Set characters
3. Apply full text style with `setTextStyleIdAsync` (covers family, size, weight, line height, letter spacing)
4. Bind color variable with `setBoundVariableForPaint`

---

## 5. Color fills — always bind a variable, never raw hex

```js
// WRONG
node.fills = [{ type: 'SOLID', color: { r: 0.02, g: 0.24, b: 1 } }];

// CORRECT
node.fills = [figma.variables.setBoundVariableForPaint(
  { type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', variable
)];
```

---

## 6. Components — always import from DS, never recreate

Use keys from `design-components.md`. Never draw shapes to replicate buttons, inputs,
chips, navbars, list items, dividers, or badges.

---

## 7. Auto layout — always `appendChild` before setting `layoutSizing*`

`layoutSizingHorizontal = 'FILL'` only works on children of an auto layout frame.
Always append the child to the parent first, then set sizing.

```js
// WRONG
node.layoutSizingHorizontal = 'FILL';
parent.appendChild(node);

// CORRECT
parent.appendChild(node);
node.layoutSizingHorizontal = 'FILL';
```

---

## 8. Component properties — set before reading height

Set boolean props (e.g. hide Helper Text) before using `component.height` for layout.
Otherwise height is calculated from the un-collapsed state and positions will be wrong.

---

## 9. Component sizing — resize to content width after import

Default component widths often don't match the frame. After importing, resize to `343px`
(375px frame − 16px margin each side).

---

## 10. Target text nodes by exact name, not index

```js
// WRONG
instance.findAll(n => n.type === 'TEXT')[0]

// CORRECT
instance.findOne(n => n.type === 'TEXT' && n.name === 'List name')
```
