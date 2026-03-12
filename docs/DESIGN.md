# Studio Wall — Design Spec
> This file is the source of truth for all visual decisions.
> Before changing any color, font, or spacing in code — change it here first.

---

## Concept

An IDEO-inspired design process calendar. Dark, iridescent, KATSEYE-aesthetic.
Sticky notes represent tasks. The inbox holds unscheduled work.
Notes are dragged from inbox → calendar to schedule them.

**Aesthetic direction:** Dark maximalist. Candy colors on near-black.
Editorial typography (Playfair) paired with brutal display type (Archivo Black).

---

## Typography

### Typefaces
| Role    | Font               | Use |
|---------|--------------------|-----|
| Display | Archivo Black      | Titles, CTAs, button labels, stage names, nav controls |
| Body    | Playfair Display   | Note content, body text, date headers, inputs, labels |

Google Fonts import:
```
https://fonts.googleapis.com/css2?family=Archivo+Black&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&display=swap
```

### Type Scale (T tokens)
| Token | Size   | Font    | Use |
|-------|--------|---------|-----|
| t1    | 11px   | Body    | Note content, card text, textarea input |
| t2    | 9px    | Display | Labels, stage tags, button text (ALL CAPS, 2px tracking) |
| t3    | 7.5px  | Body    | Secondary labels, keyboard hints |
| t4    | 6.5px  | Body bold | Micro labels on small cards |

### Display Sizes (not tokenized — use clamp)
| Use                  | Size                        | Style |
|----------------------|-----------------------------|-------|
| App wordmark         | clamp(32px, 4.5vw, 60px)   | Playfair italic bold, rainbow gradient |
| Day name (focus)     | clamp(32px, 4.5vw, 60px)   | Playfair italic bold, rainbow gradient |
| Date (focus)         | clamp(26px, 3.5vw, 48px)   | Playfair italic, rgba(255,255,255,0.2) |
| Month/year nav       | 22px                        | Playfair bold, rgba(255,255,255,0.88) |
| Modal title          | 20px                        | Archivo Black |
| Editor textarea      | 13–14px                     | Playfair, weight 500 |

### Letter Spacing Rules
- ALL CAPS Archivo Black labels: `2px`
- Nav pills: `1.5px`
- Micro labels (T4): `1.4px`
- Body text: default / `0.2–0.3px` max

---

## Color Palette

### Candy Colors
| Name           | Hex       | Shadow    | Use |
|----------------|-----------|-----------|-----|
| Electric Yellow | `#FFE566` | `#C9A800` | Priority, testing stage |
| Hot Pink        | `#FF6EB4` | `#C4006A` | Drag/drop insert line, ideation, launch |
| Mint Teal       | `#5FE0C0` | `#009E7A` | Done/complete state |
| Coral Orange    | `#FF8C5A` | `#C44A00` | Synthesis stage |
| Soft Violet     | `#A87EFA` | `#5B10D6` | Prototyping, default aura |
| Sky Blue        | `#5CC8FF` | `#007DC4` | Discovery stage |
| Acid Green      | `#B8F240` | `#6A9B00` | Research, handoff |
| Candy Red       | `#FF5C5C` | `#B80000` | Deadline, delete, error |

### Rainbow Gradient
Used on: wordmark, Wednesday header, selection banner
```
linear-gradient(110deg, #A87EFA 0%, #5CC8FF 14%, #5FE0C0 28%, #B8F240 42%, #FFE566 57%, #FF8C5A 71%, #FF6EB4 85%, #A87EFA 100%)
```

### Background Layers
| Name           | Value |
|----------------|-------|
| App base       | `#080810` |
| Card base      | `#0e0c1a` |
| Nav surface    | `rgba(14,12,26,0.95)` |
| Inbox surface  | `rgba(14,12,26,0.8)` |
| Input surface  | `rgba(255,255,255,0.05)` |
| Subtle border  | `rgba(255,255,255,0.042)` |
| Cell border    | `rgba(255,255,255,0.06)` |

---

## Design Process Stages

Each stage has: id, label, color, shadow color, icon emoji.

| id          | label       | color     | shadow    | icon |
|-------------|-------------|-----------|-----------|------|
| discovery   | Discovery   | `#5CC8FF` | `#007DC4` | 🔍 |
| research    | Research    | `#B8F240` | `#6A9B00` | 📊 |
| synthesis   | Synthesis   | `#FF8C5A` | `#C44A00` | 🧩 |
| ideation    | Ideation    | `#FF6EB4` | `#C4006A` | 💡 |
| prototyping | Prototyping | `#A87EFA` | `#5B10D6` | 🛠 |
| testing     | Testing     | `#FFE566` | `#C9A800` | 🧪 |
| handoff     | Handoff     | `#B8F240` | `#6A9B00` | 📦 |
| launch      | Launch      | `#FF6EB4` | `#C4006A` | 🚀 |

---

## Spacing & Geometry

### Border Radius
- **All elements: 0px** — strict rectilinear. Occasional `1px` on sticky note corners (deterministic per note id).
- Exceptions: deadline dot (50%), priority star icon area

### Padding Scale
| Context         | Value |
|-----------------|-------|
| Nav             | `20px 28px 16px` |
| Modal           | `28px 28px 24px` |
| Card (sm)       | `6px 7px 7px` |
| Card (md)       | `9px 10px 11px` |
| Card (lg)       | `14px 16px 16px` |
| Stage tag       | `4px 9px` |
| Button pill     | `6px 14px` |
| CTA button      | `11–14px 0` (full width) |

### Card Dimensions
| Context        | Width   | Min Height |
|----------------|---------|------------|
| Inbox card (md)| 118px   | 80px |
| DFO fan card   | 130px   | 80px |
| Composer card  | 118px   | 72px |

---

## Shadows & Borders

| Element              | Value |
|----------------------|-------|
| Card default         | `0 4px 20px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)` |
| Card selected        | `0 0 0 1.5px #fff, 0 0 0 3.5px #FF6EB4, 0 12px 40px rgba(0,0,0,0.6)` |
| Focus overlay card   | `0 0 0 1px {color}55, 0 0 40px {color}22, 0 40px 80px rgba(0,0,0,0.7)` |
| Stage tag active     | `0 0 8px {color}44` |
| CTA save button      | `0 0 24px {color}44, 0 0 0 1px {color}33` |
| Deadline modal       | `1.5px solid #FF5C5C` + `0 0 40px rgba(255,92,92,0.12)` |
| Card inner highlight | `inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.18)` |

---

## Motion System

### Keyframes
| Name        | Definition | Duration |
|-------------|------------|----------|
| overlayIn   | opacity 0→1 | 0.22s ease |
| cardUp      | translateY(18px)+scale(0.97) → normal, spring overshoot | 0.28s |
| fadeSlideUp | translateY(8px) → normal | 0.22s |
| modalIn     | scale(0.96)+translateY(8px) → normal, spring | 0.24s |
| tagsOpen    | translateY(-6px) → normal | 0.16s |
| pulse       | box-shadow 0→6px→0 (white) | 1.2s infinite |
| holo        | background-position scroll | 3s infinite |

### CSS Classes → Animation mapping
| Class            | Animation   | Applied to |
|------------------|-------------|------------|
| `.anim-overlay`  | overlayIn   | DFO, StickyComposer, modal backdrops |
| `.anim-card-up`  | cardUp      | Editor card entrance |
| `.anim-fade-up`  | fadeSlideUp + 0.12s delay | Save/Add buttons |
| `.anim-modal`    | modalIn     | All modal inner cards |
| `.anim-tags`     | tagsOpen    | Stage tag tray |
| `.note-card`     | hover lift 3px + scale | Sticky notes |
| `.stage-tag`     | hover translateY(-1px) | Stage picker tags |
| `.action-btn`    | hover scale(1.02) | Complete/Delete |
| `.cta-btn`       | hover translateY(-2px) | Save/Add |
| `.new-note-chip` | pulse on hover | New note ghost cards |

---

## Ghost / Empty State Rules

- New note chips: `1px dashed rgba(255,255,255,0.12)`, white text at 0.2 opacity
- Hover state: border brightens to `rgba(255,255,255,0.28)`, bg `rgba(255,255,255,0.03)`
- Never use pink/brand color for ghost states — reserved for active drag indicators
- Drag insert lines: `rgba(255,110,180,0.85)` — hot pink, 3px wide with glow

---

## Sticky Note Anatomy

```
┌─────────────────────────┐
│ 🔍 DISCOVERY            │  ← icon (8px) + stage label (T4, bold, ALL CAPS, stage color)
│                         │
│ Note content here       │  ← T1, Playfair, rgba(255,255,255,0.75)
│ that wraps naturally    │
│                         │
│ ★                       │  ← priority star (bottom-right, if priority="High")
└─────────────────────────┘
```

Card background: `#0e0c1a` + radial gradient bloom of stage color at 55% opacity center.

---

## Nav Layout

```
Row 1: [Studio Wall wordmark — large, rainbow gradient]
Row 2: [‹] [Month Year] [›]  ·  flex spacer  ·  [Month] [Week] [Today]

Fixed bottom-right: [↓ Export] [↑ Import]  — ghosted, low opacity
```

---

## Inbox Layout

```
[INBOX ─────────────────────────────────────────────] [📦 PACKS]
[card] [card] [card] ... [+ note ghost on hover]
```

- PACKS button: grey/neutral — same as inactive pill
- + NOTE removed from header
- Hover over rail → ghost + note chip appears at end (same size as cards)
- Click anywhere on rail → opens note composer
