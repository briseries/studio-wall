# Studio Wall — Component Spec
> Every UI building block. Read this before building or modifying any component.
> Visual rules live in DESIGN.md. This file covers behavior, props, and state.

---

## Component Tree

```
App
└── StudioWall (main page + all state)
    ├── Nav
    ├── Inbox
    │   ├── StickyNote (md, inbox variant)
    │   └── NewNoteChip (ghost, hover-only)
    ├── MonthView
    │   └── DayCell (× 35–42)
    │       └── StickyNote (sm/md, calendar variant)
    ├── WeekView
    │   └── DayCell
    ├── DayFocusOverlay (portal, opened on tap)
    │   ├── StickyNote (fan thumbnails)
    │   ├── NewNoteChip
    │   ├── StageTag (× 8)
    │   ├── CTAButton (Save)
    │   └── CompleteDeletePair
    ├── StickyComposer (portal, inbox mode or edit mode)
    │   ├── StageTag (× 8)
    │   ├── CTAButton (Add / Save)
    │   └── CompleteDeletePair (edit mode only)
    ├── DeadlineModal
    ├── TemplateModal
    │   └── StickyNote (preview, draggable=false)
    └── BackupModal (Export / Import)
```

---

## StickyNote

**File:** `src/components/StickyNote.jsx`

The core visual unit of the app. Represents one task.

### Props
| Prop       | Type     | Default | Description |
|------------|----------|---------|-------------|
| id         | string   | —       | Unique ID, used for deterministic tilt + corners |
| text       | string   | —       | Note content |
| color      | hex      | —       | Stage color hex (drives card bloom) |
| stage      | string   | —       | Stage id (used to look up label + icon) |
| priority   | string   | `""`    | `"High"` shows ★ badge |
| done       | bool     | false   | Strikes through text, 0.35 opacity |
| tilt       | number   | 0       | Rotation in degrees (-3.5 to +3.5) |
| size       | enum     | `"md"`  | `"sm"` `"md"` `"lg"` |
| showStage  | bool     | false   | Shows stage label row at top |
| draggable  | bool     | true    | Whether drag is enabled |
| selected   | bool     | false   | Pink outline + scale ring |
| onEdit     | fn       | —       | Called on click (calendar variant) |
| onDragStart| fn       | —       | Pass drag info up |
| onDragEnd  | fn       | —       | Clear drag state |

### Sizes
| Size | Width  | Min Height | Padding        | Font |
|------|--------|------------|----------------|------|
| sm   | auto   | auto       | 6px 7px 7px    | T2 |
| md   | 118px  | 80px       | 9px 10px 11px  | T1 |
| lg   | auto   | auto       | 14px 16px 16px | T1 |

### Visual Rules
- Background: `#0e0c1a` + `radial-gradient` bloom of stage color
- Corners: deterministic per `id` — mostly 0px, occasional 1px
- Tilt: deterministic per `id` + index
- Stage label row: icon (8px) + ALL CAPS label (T4, bold, stage color)
- Priority ★: bottom-right absolute, stage color, T3

---

## StageTag

**File:** `src/components/StageTag.jsx`

A clickable pill representing one design process stage.
Used in the stage picker tray inside StickyComposer and DayFocusOverlay.

### Props
| Prop     | Type | Description |
|----------|------|-------------|
| stage    | obj  | `{ id, label, color, icon }` from STAGES |
| isActive | bool | Highlights with stage color |
| onClick  | fn   | Select this stage |

### Visual Rules
- Active: `background: {color}22`, `border: 1.5px solid {color}99`, `box-shadow: 0 0 8px {color}44`
- Inactive: `background: rgba(255,255,255,0.04)`, `border: 1.5px solid rgba(255,255,255,0.08)`
- Font: Playfair Display, T2, bold
- Hover: `translateY(-1px)`, smooth color transitions
- Layout: `{icon} {Label}` — icon + space + title-case label

---

## CTAButton

**File:** `src/components/CTAButton.jsx`

Full-width call-to-action button. Used for Save, Add to Inbox, Set It.

### Props
| Prop     | Type   | Default | Description |
|----------|--------|---------|-------------|
| onClick  | fn     | —       | Action handler |
| color    | hex    | `#A87EFA` | Aura/border color |
| disabled | bool   | false   | Reduces opacity, blocks click |
| children | node   | —       | Button label |
| style    | obj    | `{}`    | Override styles |

### Visual Rules
- Background: `linear-gradient(135deg, {color}44 0%, {color}18 100%)`
- Border: `1.5px solid {color}77`
- Box shadow: `0 0 24px {color}44`
- Font: Archivo Black, 14px, ALL CAPS, 2px tracking, white
- Hover: `translateY(-2px)` — class `.cta-btn`
- Active: `scale(0.98)`
- Entrance: `.anim-fade-up` with 0.12s delay

---

## CompleteDeletePair

**File:** `src/components/CompleteDeletePair.jsx`

The COMPLETE + 🗑 row at the bottom of any note editor.
Only shown when editing an existing note (not new).

### Props
| Prop       | Type | Description |
|------------|------|-------------|
| done       | bool | Whether note is currently marked done |
| auraColor  | hex  | Stage color for border/text |
| onComplete | fn   | Toggle done state |
| onDelete   | fn   | Remove note |

### Visual Rules
- COMPLETE: `flex:1`, outlined border in aura color, Archivo Black T2
- Done state: teal color `#5FE0C0`, strikethrough text, shows "↩ UNDO"
- Delete: fixed 38px wide, trash icon, same border treatment
- Both: class `.action-btn` — hover scale(1.02), active scale(0.97)

---

## ModalShell

**File:** `src/components/ModalShell.jsx`

The reusable backdrop + centered card wrapper used by all modals.

### Props
| Prop        | Type   | Default | Description |
|-------------|--------|---------|-------------|
| onClose     | fn     | —       | Backdrop click handler |
| children    | node   | —       | Modal content |
| zIndex      | number | 9000    | Stack order |
| tilt        | number | 0       | Card rotation in degrees |
| accentColor | hex    | none    | If set, adds colored border + glow |
| width       | string | `min(400px,92vw)` | Card max width |

### Visual Rules
- Backdrop: `rgba(3,2,10,0.82)`, `backdrop-filter: blur(20px)`
- Card: `#0e0c1a`, no border-radius, `padding: 28px 28px 24px`
- Default shadow: `0 32px 64px rgba(0,0,0,0.7)`
- Accent border (deadline): `1.5px solid {accentColor}` + glow
- Entrance: class `.anim-modal`

---

## DayFocusOverlay

**File:** `src/components/DayFocusOverlay.jsx`

Full-screen overlay opened when tapping any day or note.
Shows a fan of all notes for that day + an inline editor.

### Props
| Prop          | Type    | Description |
|---------------|---------|-------------|
| dateKey       | string  | `"YYYY-MM-DD"` |
| initialIdx    | number\|`"new"` | Which note to open. `"new"` opens blank editor |
| notes         | array   | All notes for this day |
| deadlines     | object  | Full deadlines map (to show deadline label) |
| onUpdateNotes | fn      | `(updatedArray) => void` |
| onClose       | fn      | Close overlay |

### Behavior
- Opens with the tapped note pre-loaded in editor
- `initialIdx="new"` → blank editor, textarea focused
- Fan thumbnails: tap to switch editor to that note
- NEW NOTE chip: dashed ghost card, light grey, opens blank editor
- Backdrop click: saves current text + closes
- Stage tags: above textarea, collapsed by default, tap label to expand, resets on card switch
- Drag between fan cards to reorder notes within the day

### Layout (top → bottom, left side)
```
[Day name large italic]     [Date muted italic]
[Deadline label if set]
─────────────────────────
[Fan of note thumbnails] [NEW NOTE chip]
─────────────────────────
[Stage header: icon + LABEL + PRIORITY]
[Stage tags — collapsible, above textarea]
[Textarea]
[COMPLETE + DELETE — existing notes only]
─────────────────────────
[SAVE — full width CTA]
```

---

## StickyComposer

**File:** `src/components/StickyComposer.jsx`

The note creation/editing panel. Two modes:
- `mode="inbox"` — creates new notes directly into the inbox
- `mode="edit"` — edits an existing calendar note

### Props
| Prop        | Type   | Description |
|-------------|--------|-------------|
| mode        | enum   | `"inbox"` \| `"edit"` |
| note        | obj    | Existing note (edit mode) |
| onSaveDone  | fn     | Called with `{ text, stage, priority, color }` |
| onDelete    | fn     | Delete note (edit mode only) |
| onToggleDone| fn     | Toggle done (edit mode only) |
| onClose     | fn     | Close without saving |

### Behavior
- Backdrop click: saves + closes
- Enter key: saves
- Stage tags: same as DayFocusOverlay — above textarea, collapsed
- `mode="inbox"`: CTA says "ADD TO INBOX" or "ADD (N)" when count > 1
- `mode="edit"`: CTA says "SAVE ↵"

---

## DeadlineModal

**File:** `src/components/DeadlineModal.jsx`

Set or remove a hard deadline for a specific day.
Triggered by right-clicking a day cell.

### Props
| Prop      | Type | Description |
|-----------|------|-------------|
| dateLabel | string | Formatted date string |
| existing  | obj\|null | `{ label: string }` if deadline already set |
| onSave    | fn   | `(text) => void` |
| onRemove  | fn   | Remove deadline |
| onClose   | fn   | Cancel |

### Visual Rules
- Uses ModalShell with `accentColor="#FF5C5C"`, `tilt=-0.8`
- Input: underline-only, candy red caret
- "HARD DEADLINE" label: Archivo Black T2, ALL CAPS, candy red
- Date label: Playfair T3, muted red

---

## NewNoteChip

**File:** `src/components/NewNoteChip.jsx`

Ghost card that invites the user to add a new note.
Appears at end of inbox rail (hover-only) and in DFO fan row.

### Props
| Prop    | Type | Description |
|---------|------|-------------|
| onClick | fn   | Open note composer |
| width   | num  | Card width in px (default: 118) |
| height  | num  | Card height in px (default: 80) |
| pulse   | bool | Whether to animate on hover (DFO variant) |

### Visual Rules
- Border: `1px dashed rgba(255,255,255,0.12)`
- Background: transparent
- Hover border: `rgba(255,255,255,0.28)`, bg: `rgba(255,255,255,0.03)`
- `+` icon: Playfair bold, 18px, `rgba(255,255,255,0.22)`
- "NOTE" label: Archivo Black, T3, `rgba(255,255,255,0.18)`, ALL CAPS
- DFO variant: class `.new-note-chip` adds pulse animation on hover
- **Never pink** — ghost states are always white/grey

---

## Pill (Nav Button)

Not extracted as component — use CSS class `.pill` and `.pill.on`.

### States
| State    | Background | Border | Color |
|----------|-----------|--------|-------|
| Default  | transparent | `rgba(255,255,255,0.08)` | `rgba(255,255,255,0.55)` |
| Active   | `#FFE566` | `#FFE566` | `#0e0e12` |
| Accent   | transparent | `{color}35` | `{color}` (e.g. mint for Export) |
| Ghost    | `rgba(14,12,26,0.9)` | low opacity | low opacity |

Font: Archivo Black, 9px, 1.5px tracking, ALL CAPS
