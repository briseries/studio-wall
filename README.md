# Studio Wall

A design process calendar for designers. Dark, iridescent, IDEO-inspired.

Sticky notes represent tasks. The Inbox holds unscheduled work.
Drag notes from the inbox onto calendar days to schedule them.

---

## Stack

| Layer      | Tool |
|------------|------|
| Framework  | React 18 + Vite |
| Styling    | Inline styles + CSS classes (no CSS-in-JS library) |
| Fonts      | Google Fonts — Archivo Black + Playfair Display |
| State      | React `useState` / `useRef` (no Redux) |
| Persistence| `localStorage` (v1) → Supabase (v2) |
| Deploy     | Vercel / Netlify |

---

## Project Structure

```
studio-wall/
├── docs/
│   ├── DESIGN.md        ← Visual spec: colors, type, spacing, motion
│   ├── COMPONENTS.md    ← Component inventory: props, states, rules
│   └── REQUIREMENTS.md  ← Feature list, data model, roadmap
├── src/
│   ├── tokens/
│   │   └── index.js     ← Single source of truth: T, COLORS, STAGES, etc.
│   ├── components/
│   │   ├── StickyNote.jsx
│   │   ├── StageTag.jsx
│   │   ├── CTAButton.jsx
│   │   ├── CompleteDeletePair.jsx
│   │   ├── ModalShell.jsx
│   │   ├── NewNoteChip.jsx
│   │   ├── DayFocusOverlay.jsx
│   │   ├── StickyComposer.jsx
│   │   ├── DeadlineModal.jsx
│   │   └── TemplateModal.jsx
│   ├── pages/
│   │   └── StudioWall.jsx   ← Main page: layout + state
│   └── main.jsx
├── index.html
├── vite.config.js
└── package.json
```

---

## Getting Started

```bash
# Install
npm install

# Dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## The Workflow

**Specs are the boss. Code follows specs.**

Before making any visual change:
1. Update `docs/DESIGN.md`
2. Update `src/tokens/index.js` if it's a token change
3. Then update the component

Before building a new feature:
1. Write the user story in `docs/REQUIREMENTS.md`
2. Write the component spec in `docs/COMPONENTS.md`
3. Then write the code

This prevents the drift where a button is one color in one place and another color somewhere else.

---

## Design Tokens

All tokens live in `src/tokens/index.js`. Import from there:

```js
import { T, COLORS, STAGES, RAINBOW, stickyTilt, uid } from '../tokens'
```

Never hardcode a hex color or font name directly in a component.
If you need a new token, add it to `tokens/index.js` and `docs/DESIGN.md` first.

---

## Deployment

```bash
# Vercel (recommended)
npx vercel

# Or Netlify
npm run build
# drag /dist folder to netlify.com/drop
```

App is fully static — no server needed. All data lives in the user's browser localStorage.

---

## Roadmap

See `docs/REQUIREMENTS.md` for the full feature backlog.

Next milestone: **v1.1 Mobile** — PWA manifest + responsive calendar layout.
