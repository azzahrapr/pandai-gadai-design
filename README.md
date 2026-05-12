# Pandai Gadai – Design Workspace

This repo is the end-to-end design workspace for **Pandai Gadai**, a pawnshop (gadai) service based in Jakarta. It covers the design system, product prototypes, and tooling used to design, prototype, and evaluate the product.

---

## What's in Here

### `design-system/`
The **Cortes Design System** — the shared visual language used across all Pandai Gadai products.

- `design-tokens.md` — color, spacing & typography tokens
- `design-components.md` — component index with Figma keys
- `layout-guidelines.md` — layout principles for all screens
- `figma/` — Figma MCP protocol and plugin helpers for Claude Code integration

### `prototypes/`
Interactive prototypes built to explore and validate product flows.

| Prototype | What it is |
|---|---|
| `landing-page/` | Replica of pandaigadai.com — static HTML, faithful to the live site. Includes a simulasi gadai page with a lead capture form. |
| `mobile-app/` | React-based prototype of the Pandai Gadai customer app — covers Homepage, Verifikasi KTP, Detail Pinjaman, Poin Pandai, SBG, and transaction flows (Tebus, Cicil, Perpanjang). |

---

## Initiatives

- **Design System** — Cortes DS built in Figma, fully indexed for Claude Code integration
- **Landing Page Prototype** — pixel-faithful replica of pandaigadai.com with a simulasi gadai flow and lead capture bottomsheet
- **Mobile App Prototype** — multi-screen interactive prototype covering the core customer app flows
- **Claude Code Integration** — all design context (tokens, components, Figma protocol) is wired into Claude Code so AI-assisted design work is consistent and context-aware

---

## Tech Stack

| Layer | Stack |
|---|---|
| Landing page | HTML, CSS, Vanilla JS |
| Mobile app prototype | React, TypeScript, Tailwind CSS, Vite |
| Design system | Figma + Claude Code (MCP) |

---

## Running Locally

**Landing page**
```bash
cd prototypes/landing-page
python3 -m http.server 3030
# open http://localhost:3030
```

**Mobile app prototype**
```bash
cd prototypes/mobile-app
npm install
npm run dev
```
