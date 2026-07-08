# /add-inspect

Add an inspect overlay to any prototype. Supports plain HTML and React. More stacks coming.

**Usage:** `/add-inspect path/to/prototype.html` or `/add-inspect path/to/project/`

---

## Auto-detection

**Before doing anything**, detect the project type. Follow these steps in order — stop at the first match.

### Step A — Is the arg a `.html` file?
If the argument ends in `.html` → **use HTML mode**. Stop here.

### Step B — Find and read `package.json`
Look for `package.json` in the given directory. If not found there, look in the current working directory. Read the file and inspect both `dependencies` and `devDependencies`.

### Step C — Identify the framework

| Signal in `package.json` | Mode |
|---|---|
| `"react"` key present | **React mode** |
| `"vue"` key present | **Not yet implemented** — stop and tell the user |
| `"svelte"` key present | **Not yet implemented** — stop and tell the user |
| `"@angular/core"` key present | **Not yet implemented** — stop and tell the user |
| No framework found | Ask the user: "Is this a plain HTML project or a JS framework?" |

### Step D — If React mode
Before writing any files, also note:
- Entry point: prefer `src/main.tsx` → `src/main.ts` → `src/index.tsx` → `src/index.ts`
- Root component: prefer `src/App.tsx` → `src/App.jsx` → `src/App.vue` (React only cares about `.tsx/.jsx`)
- If no `src/App.tsx` or `src/App.jsx` exists, tell the user which file was found and ask them to confirm before proceeding.

**Do not ask the user which mode to use. Detect it automatically from the signals above.**

---

## HTML Mode

For plain HTML prototype files (e.g. `simulasi-gadai.html`).

### Step 1 — Read the file
Read the full target HTML file.

### Step 2 — Scan for class names and build COMPONENT_MAP
Look at the HTML elements and their class names. Build a `COMPONENT_MAP` object mapping meaningful CSS class names → human-readable component names. Focus on layout containers, interactive elements (buttons, inputs), cards, headers, footers, nav bars. Skip generic utility classes like `flex`, `items-center`, `text-sm`, etc.

### Step 3 — Inject the CSS
Add the following CSS block **immediately before `</style>`** (inside the existing `<style>` tag). If there is no `<style>` tag, add `<style>...</style>` before `</head>`.

```css
/* ── INSPECT OVERLAY ── */
body.inspect-mode [data-inspectable] { cursor: crosshair !important; }
#inspect-badge {
  position: fixed; top: 12px; right: 12px; z-index: 99999;
  color: #fff; font-family: monospace; font-size: 11px; font-weight: 600;
  padding: 5px 12px; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  pointer-events: auto; display: flex; align-items: center; gap: 8px;
  cursor: pointer; border: none; background: #475569; transition: background 0.15s;
}
#inspect-badge:hover { background: #344256; }
body.inspect-mode #inspect-badge { background: #0255CA; box-shadow: 0 2px 8px rgba(2,84,202,0.4); }
body.inspect-mode #inspect-badge:hover { background: #001cdb; }
#inspect-panel {
  position: fixed; top: 44px; right: 12px; z-index: 99998;
  width: 280px; max-height: calc(100vh - 56px); overflow-y: auto;
  background: #021431; border-radius: 10px; box-shadow: 0 4px 24px rgba(0,0,0,0.35);
  font-family: monospace; font-size: 11px; line-height: 1.6; color: #e2e8f0; display: none;
}
body.inspect-mode #inspect-panel { display: block; }
#inspect-panel .ip-hint { padding: 16px 14px; color: #475569; font-size: 11px; text-align: center; line-height: 1.6; }
#inspect-panel .ip-close { position: absolute; top: 8px; right: 10px; background: none; border: none; color: #475569; font-size: 16px; cursor: pointer; line-height: 1; display: none; }
#inspect-panel .ip-close:hover { color: #e2e8f0; }
#inspect-panel .ip-body { padding: 10px 12px 12px; }
.it-component { font-size: 12px; font-weight: 700; color: #60a5fa; margin-bottom: 4px; }
.it-class { color: #94a3b8; font-size: 10px; margin-bottom: 6px; }
.it-row { display: flex; gap: 6px; align-items: center; margin-bottom: 4px; }
.it-label { color: #64748b; min-width: 72px; font-size: 10px; flex-shrink: 0; }
.it-value { color: #f1f5f9; font-size: 11px; }
.it-swatch { display: inline-block; width: 10px; height: 10px; border-radius: 2px; border: 1px solid rgba(255,255,255,0.2); vertical-align: middle; margin-right: 4px; }
.it-token { color: #34d399; font-size: 10px; }
.it-divider { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 8px 0; }
.it-section { color: #f59e0b; font-weight: 700; font-size: 10px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
.it-state-tag { display: inline-block; background: rgba(255,255,255,0.08); border-radius: 3px; padding: 1px 5px; font-size: 10px; color: #f59e0b; margin-bottom: 3px; font-weight: 600; }
.it-state-props { font-size: 10px; color: #94a3b8; margin-bottom: 8px; padding-left: 4px; line-height: 1.7; }
.it-copy-btn { margin-top: 6px; width: 100%; padding: 5px 0; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 5px; color: #94a3b8; font-family: monospace; font-size: 10px; font-weight: 600; cursor: pointer; letter-spacing: 0.03em; }
.it-copy-btn:hover { background: rgba(255,255,255,0.13); color: #f1f5f9; }
.it-copy-btn.copied { color: #34d399; border-color: #34d399; }
.inspect-highlight-ring { outline: 2px solid #0255CA !important; outline-offset: 2px !important; }
.inspect-hover-ring { outline: 2px dashed rgba(2,85,202,0.5) !important; outline-offset: 2px !important; }
```

### Step 4 — Inject the HTML elements
Add immediately after the opening `<body>` tag:

```html
<div id="inspect-badge" onclick="ipToggleInspect()">&#128269; Inspect</div>
<div id="inspect-panel">
  <p class="ip-hint">Click any element on the page to inspect it.</p>
  <button class="ip-close" id="ip-close-btn" onclick="ipUnlock()">&#215;</button>
</div>
```

### Step 5 — Inject the JS
Find the last `<script>` block before `</body>`. Add the IIFE below **before its closing `</script>`**. Replace `/* COMPONENT_MAP */` with the actual map from Step 2. If no script block exists, create one before `</body>`.

```js
// ── INSPECT OVERLAY ──────────────────────────────────────────────────────
(function initInspect() {
  if (new URLSearchParams(location.search).get('inspect') === 'true') {
    document.body.classList.add('inspect-mode');
  }

  const COMPONENT_MAP = { /* COMPONENT_MAP */ };

  const TOKEN_MAP = {
    '#023dff': 'background/primary', '#001cdb': 'background/primary-darker',
    '#ffcd05': 'background/secondary', '#ffffff': 'background/neutral',
    '#f8fafc': 'background/subtle', '#e1e7ef': 'background/disabled',
    '#0f1729': 'background/dark', '#16a34a': 'background/success',
    '#f0fdf4': 'background/success-subtle', '#dc2626': 'background/error',
    '#fef2f2': 'background/error-subtle', '#e5f2ff': 'background/info-subtle',
    '#15803d': 'text/success', '#b91c1c': 'text/error',
    '#cbd5e1': 'border/default', '#94a3b8': 'border/hover',
    '#021431': 'text/default ~', '#001533': 'text/default ~',
    '#5f6c85': 'text/subtle ~', '#65758b': 'text/subtle',
    '#94a0b8': 'text/disabled ~', '#0255ca': 'background/primary ~',
    '#e1e6ef': 'border/subtle ~', '#f1f3f9': 'background/subtle ~',
    '#f8f9fc': 'background/subtle ~', '#f3f4f6': 'background/subtle ~',
  };

  const RADIUS_MAP = {
    '0px': 'rounded-none', '4px': 'rounded-sm', '6px': 'rounded',
    '8px': 'rounded-lg', '10px': 'rounded-xl', '12px': 'rounded-2xl',
    '16px': 'rounded-3xl', '9999px': 'rounded-full', '50%': 'rounded-full',
  };

  function radiusToken(val) { if (!val || val === '0px') return null; return RADIUS_MAP[val.split(' ')[0]] || null; }

  function typographyToken(sizePx, weight) {
    const s = Math.round(parseFloat(sizePx)), w = parseInt(weight);
    if (s === 20 && w >= 700) return 'font-styles/title-1';
    if (s === 18 && w >= 600) return 'font-styles/title-2';
    if (s === 16 && w >= 600) return 'font-styles/subtitle-1';
    if (s === 14 && w >= 600) return 'font-styles/subtitle-2';
    if (s === 16) return 'font-styles/body-1'; if (s === 14) return 'font-styles/body-2';
    if (s === 12 && w >= 700) return 'font-styles/label-1'; if (s === 10 && w >= 700) return 'font-styles/label-2';
    if (s === 12) return 'font-styles/caption-1'; if (s === 10) return 'font-styles/caption-2';
    return null;
  }

  function rgbToHex(rgb) { const m = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/); if (!m) return null; return '#' + [m[1],m[2],m[3]].map(function(n) { return (+n).toString(16).padStart(2,'0'); }).join(''); }
  function tokenLabel(hex) { if (!hex) return null; return TOKEN_MAP[hex.toLowerCase()] || null; }
  function colorRow(label, hex) { if (!hex || hex === '#000000') return ''; const tok = tokenLabel(hex); return '<div class="it-row"><span class="it-label">'+label+'</span><span class="it-value"><span class="it-swatch" style="background:'+hex+'"></span>'+hex+(tok ? ' <span class="it-token">('+tok+')</span>' : '')+'</span></div>'; }

  function getComponentName(el) { const classes = Array.from(el.classList); for (const cls of classes) { if (COMPONENT_MAP[cls]) return { name: COMPONENT_MAP[cls], key: cls }; } return null; }

  function getStateRules(className) {
    const states = [];
    for (const sheet of document.styleSheets) {
      try { for (const rule of sheet.cssRules || []) { if (!rule.selectorText || !rule.style.cssText) continue; const sel = rule.selectorText; if (sel.includes('.' + className) && sel.trim() !== '.' + className) { const statePart = sel.replace(new RegExp('\\.?' + className), '').trim(); if (statePart) states.push({ state: statePart, props: rule.style.cssText }); } } } catch(e) {}
    }
    return states;
  }

  let hoveredEl = null, lockedEl = null;
  window.snippetStore = {}; const snippetStore = window.snippetStore; let snippetId = 0;

  window.ipExport = function(btn, imgEl, scale) {
    const original = btn.textContent; btn.textContent = '...';
    const src = imgEl.getAttribute('src') || '', base = src.split('/').pop().replace(/\.[^.]+$/, '');
    const dw = Math.round(imgEl.offsetWidth), dh = Math.round(imgEl.offsetHeight);
    const nw = imgEl.naturalWidth, nh = imgEl.naturalHeight;
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(dw * scale, nw); canvas.height = Math.max(dh * scale, nh);
    const ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(function(blob) { if (!blob) { btn.textContent = 'Error'; return; } const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = base + '@' + scale + 'x.png'; a.click(); URL.revokeObjectURL(url); btn.textContent = '✓'; setTimeout(function() { btn.textContent = original; }, 1500); }, 'image/png');
  };

  window.ipCopy = function(btn, id) {
    const text = snippetStore[id]; if (!text) return;
    const original = btn.textContent;
    const done = function() { btn.textContent = '✓ Copied!'; btn.classList.add('copied'); setTimeout(function() { btn.textContent = original; btn.classList.remove('copied'); }, 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done).catch(function() { fallbackCopy(text); done(); }); } else { fallbackCopy(text); done(); }
  };

  function fallbackCopy(text) { const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0'; document.body.appendChild(ta); ta.focus(); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); }

  const panel = document.getElementById('inspect-panel');
  const closeBtn = document.getElementById('ip-close-btn');

  function getInspectTarget(el) {
    if (el.tagName === 'IMG') return { type: 'image', el: el };
    const svgEl = el.tagName === 'svg' ? el : el.closest('svg');
    if (svgEl) return { type: 'svg', el: svgEl };
    const comp = getComponentName(el);
    if (comp) return { type: 'component', el: el, comp: comp };
    return null;
  }

  function annotateProps(propsStr) { return propsStr.split(';').map(function(p) { p = p.trim(); if (!p) return ''; const hex = (p.match(/#([0-9a-fA-F]{6})/) || [])[0]; const tok = hex ? tokenLabel(hex) : null; return p + (tok ? ' /* ' + tok + ' */' : ''); }).filter(Boolean).join('; '); }

  function renderComponentPanel(el, comp) {
    const cs = getComputedStyle(el);
    const colorHex = rgbToHex(cs.color), bgHex = rgbToHex(cs.backgroundColor);
    const borderHex = rgbToHex(cs.borderTopColor), radius = cs.borderRadius;
    const radTok = radiusToken(radius), typoTok = typographyToken(cs.fontSize, cs.fontWeight);
    const w = Math.round(el.offsetWidth) + 'px', h = Math.round(el.offsetHeight) + 'px';
    const stateRules = getStateRules(comp.key);
    const statesHtml = stateRules.length ? '<hr class="it-divider"><div class="it-section">States</div>' + stateRules.map(function(s) { const sid = ++snippetId; snippetStore[sid] = '.'+comp.key+s.state+' {\n  '+annotateProps(s.props).split('; ').join(';\n  ')+'\n}'; return '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px"><span class="it-state-tag">'+s.state+'</span><button class="it-copy-btn" style="margin-top:0;width:auto;padding:2px 8px;font-size:9px" onclick="ipCopy(this,'+sid+')">Copy</button></div><div class="it-state-props">'+annotateProps(s.props)+'</div>'; }).join('') : '';
    const cssLines = [ colorHex ? '  color: '+colorHex+';'+(tokenLabel(colorHex) ? ' /* '+tokenLabel(colorHex)+' */' : '') : '', bgHex ? '  background: '+bgHex+';'+(tokenLabel(bgHex) ? ' /* '+tokenLabel(bgHex)+' */' : '') : '', borderHex && borderHex !== colorHex ? '  border-color: '+borderHex+';'+(tokenLabel(borderHex) ? ' /* '+tokenLabel(borderHex)+' */' : '') : '', '  font-size: '+cs.fontSize+';', '  font-weight: '+cs.fontWeight+';', '  padding: '+cs.padding+';', radius !== '0px' ? '  border-radius: '+radius+';' : '', '  width: '+w+';', '  height: '+h+';' ].filter(Boolean).join('\n');
    const statesCss = stateRules.map(function(s) { return '.'+comp.key+s.state+' {\n  '+annotateProps(s.props).split('; ').join(';\n  ')+'\n}'; }).join('\n\n');
    const sid = ++snippetId; snippetStore[sid] = '.'+comp.key+' {\n'+cssLines+'\n}'+(statesCss ? '\n\n'+statesCss : '');
    return '<div class="ip-body"><div class="it-component">'+comp.name+'</div><div class="it-class">.'+comp.key+'</div><hr class="it-divider">'+colorRow('color',colorHex)+(bgHex ? colorRow('background',bgHex) : '')+(borderHex && borderHex !== colorHex ? colorRow('border',borderHex) : '')+'<hr class="it-divider"><div class="it-row"><span class="it-label">font-size</span><span class="it-value">'+cs.fontSize+'</span></div><div class="it-row"><span class="it-label">font-weight</span><span class="it-value">'+cs.fontWeight+'</span></div>'+(typoTok ? '<div class="it-row"><span class="it-label">type token</span><span class="it-value it-token">'+typoTok+'</span></div>' : '')+'<div class="it-row"><span class="it-label">padding</span><span class="it-value">'+cs.padding+'</span></div>'+(radius !== '0px' ? '<div class="it-row"><span class="it-label">border-radius</span><span class="it-value">'+radius+(radTok ? ' <span class="it-token">('+radTok+')</span>' : '')+'</span></div>' : '')+'<div class="it-row"><span class="it-label">width</span><span class="it-value">'+w+'</span></div><div class="it-row"><span class="it-label">height</span><span class="it-value">'+h+'</span></div>'+statesHtml+'<button class="it-copy-btn" onclick="ipCopy(this,'+sid+')">Copy All CSS'+(stateRules.length ? ' + States' : '')+'</button></div>';
  }

  function renderImagePanel(imgEl) {
    const src = imgEl.getAttribute('src') || '', filename = src.split('/').pop() || src;
    const dw = Math.round(imgEl.offsetWidth), dh = Math.round(imgEl.offsetHeight);
    const nw = imgEl.naturalWidth, nh = imgEl.naturalHeight;
    const sid = ++snippetId; snippetStore[sid] = src;
    const eid = ++snippetId; snippetStore[eid] = imgEl;
    function scaleBtn(scale) { const ow = Math.max(dw*scale,nw), oh = Math.max(dh*scale,nh), blurry = ow>nw||oh>nh; const st = blurry?'margin-top:0;color:#f59e0b;border-color:rgba(245,158,11,0.35)':'margin-top:0'; return '<button class="it-copy-btn" style="'+st+'" onclick="ipExport(this,snippetStore['+eid+'],'+scale+')">'+scale+'x &middot; '+ow+'px</button>'; }
    const lowRes = nw < dw*2;
    return '<div class="ip-body"><div class="it-component">Image Asset</div><div class="it-class">&lt;img&gt;</div><hr class="it-divider"><div class="it-row"><span class="it-label">file</span><span class="it-value" style="word-break:break-all;font-size:10px">'+filename+'</span></div><div class="it-row"><span class="it-label">display</span><span class="it-value">'+dw+'&times;'+dh+'px</span></div><div class="it-row"><span class="it-label">source</span><span class="it-value">'+nw+'&times;'+nh+'px'+(lowRes?' <span style="color:#f59e0b">&middot; low-res</span>':'')+'</span></div><hr class="it-divider"><div class="it-section">Export</div><div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:5px;margin-bottom:6px">'+scaleBtn(1)+scaleBtn(2)+scaleBtn(3)+scaleBtn(4)+'</div>'+(lowRes?'<p style="font-size:9px;color:#f59e0b;line-height:1.5;margin-bottom:6px">⚠ Source is low-res. Re-export from Figma at 2x+.</p>':'')+'<button class="it-copy-btn" onclick="ipCopy(this,'+sid+')">Copy src path</button></div>';
  }

  function renderSvgPanel(svgEl) {
    const w=Math.round(svgEl.offsetWidth)+'px', h=Math.round(svgEl.offsetHeight)+'px';
    const sid=++snippetId; snippetStore[sid]=svgEl.outerHTML;
    return '<div class="ip-body"><div class="it-component">SVG Icon</div><div class="it-class">&lt;svg&gt; — inline</div><hr class="it-divider"><div class="it-row"><span class="it-label">width</span><span class="it-value">'+w+'</span></div><div class="it-row"><span class="it-label">height</span><span class="it-value">'+h+'</span></div><hr class="it-divider"><button class="it-copy-btn" onclick="ipCopy(this,'+sid+')">Copy SVG markup</button></div>';
  }

  function lockElement(target) {
    if (lockedEl) lockedEl.classList.remove('inspect-highlight-ring');
    if (hoveredEl) hoveredEl.classList.remove('inspect-hover-ring');
    lockedEl = target.el; lockedEl.classList.add('inspect-highlight-ring');
    let html = '';
    if (target.type === 'image') html = renderImagePanel(target.el);
    else if (target.type === 'svg') html = renderSvgPanel(target.el);
    else html = renderComponentPanel(target.el, target.comp);
    panel.innerHTML = html; closeBtn.style.display = 'block'; panel.prepend(closeBtn);
  }

  window.ipToggleInspect = function() { const isOn = document.body.classList.toggle('inspect-mode'); if (!isOn) { ipUnlock(); if (hoveredEl) { hoveredEl.classList.remove('inspect-hover-ring'); hoveredEl = null; } } };
  window.ipUnlock = function() { if (lockedEl) { lockedEl.classList.remove('inspect-highlight-ring'); lockedEl = null; } panel.innerHTML = '<p class="ip-hint">Click any element on the page to inspect it.</p>'; closeBtn.style.display = 'none'; panel.prepend(closeBtn); };

  document.addEventListener('mouseover', function(e) { if (!document.body.classList.contains('inspect-mode')) return; const el = e.target; if (panel.contains(el)||el.id==='inspect-badge'||el.id==='ip-close-btn') return; if (hoveredEl&&hoveredEl!==lockedEl) hoveredEl.classList.remove('inspect-hover-ring'); const target=getInspectTarget(el); if (!target){hoveredEl=null;return;} if (target.el===lockedEl){hoveredEl=null;return;} target.el.classList.add('inspect-hover-ring'); hoveredEl=target.el; });
  document.addEventListener('mouseout', function(e) { if (!document.body.classList.contains('inspect-mode')) return; const el=e.target; if (el!==lockedEl) el.classList.remove('inspect-hover-ring'); });
  document.addEventListener('click', function(e) { if (!document.body.classList.contains('inspect-mode')) return; const el=e.target; if (panel.contains(el)||el.id==='inspect-badge') return; const target=getInspectTarget(el); if (!target){ipUnlock();return;} e.preventDefault(); e.stopPropagation(); lockElement(target); }, true);
  document.addEventListener('keydown', function(e) { if (!document.body.classList.contains('inspect-mode')) return; if (e.key==='Escape') ipUnlock(); });
})();
```

### Step 6 — Passthrough for overlays/modals
If the file has overlay elements (bottom sheets, modals), add a passthrough guard inside the click listener before `const target = getInspectTarget(el);`:
```js
if (el.closest('#yourOverlayId')) return;
```

### Step 7 — Verify and report
Confirm CSS is inside `<style>`, HTML elements are after `<body>`, JS is inside the last `<script>`, and COMPONENT_MAP is populated from the actual file's classes.

---

## React Mode

For React/Vite projects (detected via `"react"` in `package.json`).

### Step 1 — Check if already installed
Look for `InspectContext.tsx` inside the project's `src/` directory. If it exists, report that inspect is already installed and stop.

### Step 2 — Create `src/inspectStore.ts`

```ts
let _id = 0
const _els: Map<number, Element> = new Map()
const _strs: Map<number, string> = new Map()

export const inspectStore = {
  setEl(el: Element): number { const id = ++_id; _els.set(id, el); return id },
  setStr(s: string): number { const id = ++_id; _strs.set(id, s); return id },
  getEl(id: number): Element | undefined { return _els.get(id) },
  getStr(id: number): string | undefined { return _strs.get(id) },
}
```

### Step 3 — Create `src/InspectContext.tsx`

```tsx
import { createContext, useContext, useEffect, useState } from 'react'

export interface SelectedInfo {
  type: 'component' | 'image' | 'svg' | 'element'
  label: string
  tokens: string[]
  css?: string
  src?: string
  isSvg?: boolean
  displayW?: number; displayH?: number
  naturalW?: number; naturalH?: number
  elId?: number
  markupId?: number
}

interface InspectCtxType {
  active: boolean
  selectedInfo: SelectedInfo | null
  setSelectedInfo: (info: SelectedInfo | null) => void
}

const InspectCtx = createContext<InspectCtxType>({
  active: false,
  selectedInfo: null,
  setSelectedInfo: () => {},
})

export function InspectProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('inspect') === 'true'
    const fromSession = sessionStorage.getItem('pandai_inspect') === 'true'
    return fromUrl || fromSession
  })
  const [selectedInfo, setSelectedInfo] = useState<SelectedInfo | null>(null)

  useEffect(() => {
    sessionStorage.setItem('pandai_inspect', active ? 'true' : 'false')
    if (!active) setSelectedInfo(null)
  }, [active])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if ((e.key === 'i' || e.key === 'I') && tag !== 'INPUT' && tag !== 'TEXTAREA' && !e.metaKey && !e.ctrlKey)
        setActive(v => !v)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <InspectCtx.Provider value={{ active, selectedInfo, setSelectedInfo }}>
      {children}
    </InspectCtx.Provider>
  )
}

export const useInspect = () => useContext(InspectCtx)
```

### Step 4 — Create `src/InspectOverlay.tsx`

```tsx
import { useRef, useEffect } from 'react'
import { useInspect, SelectedInfo } from './InspectContext'
import { inspectStore } from './inspectStore'

const COLOR_TOKENS: Record<string, string> = {
  '#023dff': 'background/primary', '#001cdb': 'background/primary-darker',
  '#ffcd05': 'background/secondary', '#ffffff': 'background/neutral',
  '#f8fafc': 'background/subtle', '#e1e7ef': 'background/disabled',
  '#0f1729': 'background/dark', '#16a34a': 'background/success',
  '#f0fdf4': 'background/success-subtle', '#dc2626': 'background/error',
  '#fef2f2': 'background/error-subtle', '#e5f2ff': 'background/info-subtle',
  '#15803d': 'text/success', '#b91c1c': 'text/error',
  '#cbd5e1': 'border/default', '#94a3b8': 'border/hover',
  '#0f172a': 'text/default ~', '#021431': 'text/default ~',
  '#001533': 'text/default ~', '#65758b': 'text/subtle',
  '#5f6c85': 'text/subtle ~', '#94a0b8': 'text/disabled ~',
  '#0255ca': 'background/primary ~', '#28832d': 'background/success ~',
  '#e85c3d': 'background/error ~', '#e1e6ef': 'border/subtle ~',
  '#ebf5ff': 'background/info-subtle ~', '#e6ecff': 'blue/100 ~',
  '#d3f1d4': 'background/success-subtle ~', '#f1f3f9': 'background/subtle ~',
  '#f8f9fc': 'background/subtle ~',
}

const FONT_TOKENS: Record<string, string> = {
  '48-700': 'font-styles/heading-1', '36-700': 'font-styles/heading-2',
  '28-700': 'font-styles/heading-3', '20-700': 'font-styles/title-1',
  '18-600': 'font-styles/title-2', '16-600': 'font-styles/subtitle-1',
  '14-600': 'font-styles/subtitle-2', '16-400': 'font-styles/body-1',
  '14-400': 'font-styles/body-2', '12-400': 'font-styles/caption-1',
  '10-400': 'font-styles/caption-2', '12-700': 'font-styles/label-1',
  '10-700': 'font-styles/label-2',
}

const RADIUS_TOKENS: Record<string, string> = {
  '4px': 'rounded-sm', '6px': 'rounded', '8px': 'rounded-lg',
  '10px': 'rounded-xl', '12px': 'rounded-2xl', '16px': 'rounded-3xl',
  '9999px': 'rounded-full', '50%': 'rounded-full',
}

function rgbToHex(rgb: string): string | null {
  const m = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!m) return null
  if (rgb.match(/rgba\(.*,\s*0\)/)) return null
  return '#' + [m[1], m[2], m[3]].map(n => parseInt(n).toString(16).padStart(2, '0')).join('')
}

function resolveColorHex(hex: string): string {
  const tok = COLOR_TOKENS[hex.toLowerCase()]
  return tok ? `${hex} — ${tok}` : hex
}

function resolveFont(cs: CSSStyleDeclaration): string | null {
  const size = Math.round(parseFloat(cs.fontSize))
  const weight = parseInt(cs.fontWeight)
  const key = `${size}-${weight >= 700 ? '700' : weight >= 600 ? '600' : '400'}`
  return FONT_TOKENS[key] ?? null
}

function resolveRadius(val: string): string {
  const first = val.split(' ')[0]
  return RADIUS_TOKENS[first] ?? val
}

function buildCss(el: HTMLElement, cs: CSSStyleDeclaration): string {
  const colorHex = rgbToHex(cs.color)
  const bgHex = rgbToHex(cs.backgroundColor)
  const borderHex = rgbToHex(cs.borderTopColor)
  const tag = el.tagName.toLowerCase()
  const withTok = (hex: string | null) => { if (!hex) return ''; const tok = COLOR_TOKENS[hex.toLowerCase()]; return tok ? ` /* ${tok} */` : '' }
  const lines = [
    colorHex ? `  color: ${colorHex};${withTok(colorHex)}` : '',
    bgHex ? `  background: ${bgHex};${withTok(bgHex)}` : '',
    borderHex && cs.borderTopWidth !== '0px' && borderHex !== colorHex ? `  border-color: ${borderHex};${withTok(borderHex)}` : '',
    `  font-size: ${cs.fontSize};`, `  font-weight: ${cs.fontWeight};`,
    cs.padding !== '0px' ? `  padding: ${cs.padding};` : '',
    cs.borderRadius !== '0px' ? `  border-radius: ${cs.borderRadius};` : '',
    `  width: ${Math.round(el.offsetWidth)}px;`, `  height: ${Math.round(el.offsetHeight)}px;`,
  ].filter(Boolean)
  return `${tag} {\n${lines.join('\n')}\n}`
}

function buildAutoRows(el: HTMLElement, cs: CSSStyleDeclaration): string[] {
  const rows: string[] = []
  const fontTok = resolveFont(cs)
  if (fontTok) rows.push(`type · ${fontTok}`)
  rows.push(`font · ${Math.round(parseFloat(cs.fontSize))}px / ${cs.fontWeight} / lh ${cs.lineHeight}`)
  const colorHex = rgbToHex(cs.color)
  if (colorHex) rows.push(`color · ${resolveColorHex(colorHex)}`)
  const bgHex = rgbToHex(cs.backgroundColor)
  if (bgHex) rows.push(`bg · ${resolveColorHex(bgHex)}`)
  const bw = cs.borderTopWidth
  if (bw && bw !== '0px') { const borderHex = rgbToHex(cs.borderTopColor); rows.push(`border · ${bw} ${borderHex ? resolveColorHex(borderHex) : ''}`) }
  const br = cs.borderRadius
  if (br && br !== '0px') rows.push(`radius · ${br} — ${resolveRadius(br)}`)
  rows.push(`size · ${Math.round(el.offsetWidth)}×${Math.round(el.offsetHeight)}px`)
  const [pt, pr, pb, pl] = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft]
  if ([pt, pr, pb, pl].some(v => v !== '0px')) rows.push(`padding · ${pt} ${pr} ${pb} ${pl}`)
  return rows
}

function buildInfo(el: HTMLElement): SelectedInfo {
  if (el.tagName === 'IMG') {
    const img = el as HTMLImageElement
    const src = img.getAttribute('src') || ''
    const filename = src.split('/').pop()?.split('?')[0] || '<img>'
    const elId = inspectStore.setEl(img)
    return { type: 'image', label: img.alt || filename, tokens: [], src, isSvg: src.toLowerCase().endsWith('.svg'), displayW: Math.round(img.offsetWidth), displayH: Math.round(img.offsetHeight), naturalW: img.naturalWidth, naturalH: img.naturalHeight, elId }
  }
  const svgEl = (el.tagName.toLowerCase() === 'svg' ? el : el.closest('svg')) as HTMLElement | null
  if (svgEl) {
    const rect = svgEl.getBoundingClientRect()
    const elId = inspectStore.setEl(svgEl)
    const markupId = inspectStore.setStr(svgEl.outerHTML)
    return { type: 'svg', label: 'SVG Icon', tokens: [], displayW: Math.round(rect.width), displayH: Math.round(rect.height), elId, markupId }
  }
  let labeled: HTMLElement | null = el
  while (labeled) {
    if ((labeled as HTMLElement).dataset?.inspectLabel !== undefined) break
    labeled = labeled.parentElement
  }
  if (labeled?.dataset.inspectLabel) {
    const raw = labeled.dataset.inspectTokens
    const tokens: string[] = raw ? JSON.parse(raw) : []
    const cs = getComputedStyle(labeled)
    return { type: 'component', label: labeled.dataset.inspectLabel, tokens, css: buildCss(labeled, cs) }
  }
  const cs = getComputedStyle(el)
  const tag = el.tagName.toLowerCase()
  const text = el.childElementCount === 0 ? el.textContent?.trim().slice(0, 50) : null
  return { type: 'element', label: text ? `"${text}"` : `<${tag}>`, tokens: buildAutoRows(el, cs), css: buildCss(el, cs) }
}

export function InspectOverlay() {
  const { active, setSelectedInfo } = useInspect()
  const hoveredEl = useRef<Element | null>(null)
  const lockedEl = useRef<Element | null>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (!active && ringRef.current) ringRef.current.style.display = 'none' }, [active])

  if (!active) return null

  const getEl = (clientX: number, clientY: number, overlay: HTMLDivElement): HTMLElement | null => {
    overlay.style.pointerEvents = 'none'
    const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null
    overlay.style.pointerEvents = 'auto'
    return el
  }

  const updateRing = (el: Element | null, locked: boolean) => {
    const ring = ringRef.current; if (!ring) return
    if (!el) { ring.style.display = 'none'; return }
    const r = el.getBoundingClientRect()
    ring.style.display = 'block'; ring.style.top = r.top + 'px'; ring.style.left = r.left + 'px'
    ring.style.width = r.width + 'px'; ring.style.height = r.height + 'px'
    ring.style.outline = locked ? '2px solid #023dff' : '1.5px dashed rgba(2,61,255,0.55)'
    ring.style.boxShadow = locked ? '0 0 0 4px rgba(2,61,255,0.1)' : 'none'
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = getEl(e.clientX, e.clientY, e.currentTarget)
    if (!el || el === hoveredEl.current) return
    hoveredEl.current = el
    if (el !== lockedEl.current) updateRing(el, false)
  }

  const handleMouseLeave = () => { hoveredEl.current = null; updateRing(lockedEl.current, true) }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = getEl(e.clientX, e.clientY, e.currentTarget)
    if (!el) { lockedEl.current = null; updateRing(null, false); setSelectedInfo(null); return }
    lockedEl.current = el; hoveredEl.current = null; updateRing(el, true)
    setSelectedInfo(buildInfo(el))
  }

  return (
    <>
      <div onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={handleClick}
        style={{ position: 'absolute', inset: 0, zIndex: 9998, cursor: 'crosshair' }} />
      <div ref={ringRef} style={{ display: 'none', position: 'fixed', pointerEvents: 'none', zIndex: 99999, outlineOffset: '2px', borderRadius: '2px' }} />
    </>
  )
}
```

### Step 5 — Create `src/InspectPanel.tsx`

Copy the full contents of the existing `InspectPanel.tsx` from `prototypes/mobile-app/src/InspectPanel.tsx`. Read that file and write it verbatim to the target project's `src/InspectPanel.tsx`.

### Step 6 — Create `src/InspectLabel.tsx`

```tsx
import { useInspect } from './InspectContext'

interface Props {
  label: string
  tokens?: string[]
  children: React.ReactNode
  className?: string
}

export function InspectLabel({ label, tokens = [], children, className = '' }: Props) {
  const { active } = useInspect()
  if (!active) return <>{children}</>
  return (
    <div className={`relative ${className}`} data-inspect-label={label} data-inspect-tokens={JSON.stringify(tokens)}
      style={{ outline: '1px dashed rgba(2,61,255,0.2)', outlineOffset: '2px' }}>
      {children}
    </div>
  )
}
```

### Step 7 — Wire into the root component

Read the root component file identified in Step D (e.g. `src/App.tsx` or `src/App.jsx`). Add the following imports at the top:

```tsx
import { InspectProvider } from './InspectContext'
import { InspectPanel } from './InspectPanel'
import { InspectOverlay } from './InspectOverlay'
```

Then wrap the app content with `<InspectProvider>`. The structure inside should be:

```tsx
<InspectProvider>
  <div className="flex items-start gap-6">
    <div className="relative">
      {/* existing router/routes go here */}
      <InspectOverlay />
    </div>
    <InspectPanel />
  </div>
</InspectProvider>
```

Preserve all existing routes and structure — only add the wrapper and two new components.

### Step 8 — Verify and report

Confirm:
- All 5 files created (`inspectStore.ts`, `InspectContext.tsx`, `InspectOverlay.tsx`, `InspectPanel.tsx`, `InspectLabel.tsx`)
- `App.tsx` has the three imports and correct wrapper structure
- Activate with `?inspect=true` or press `I` to toggle
- `InspectLabel` can optionally be used on any component to add named token annotations
