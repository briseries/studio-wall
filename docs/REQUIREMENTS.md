# Studio Wall — Product Requirements
> What the app does, feature by feature.
> New features start here as user stories before any code is written.

---

## Vision

A personal design process calendar for solo designers and small teams.
Tasks (sticky notes) move from an unscheduled inbox onto calendar days.
Every note belongs to a design process stage (Discovery → Launch).

**Core loop:**
1. Capture ideas/tasks into the Inbox (unscheduled)
2. Drag or tap-schedule inbox notes onto calendar days
3. Tap a day to focus — edit, reorder, complete notes
4. Hard deadlines mark critical dates

---

## Current Features (v1 — shipped)

### Calendar
- [x] Month view — 7-column grid, all days of month
- [x] Week view — 7-day strip, current week
- [x] Navigate months forward/backward
- [x] Jump to today
- [x] Today highlighted with yellow dot
- [x] Day cells show up to N notes, truncated if overflow
- [x] Hover a day → shows dashed "+ note" button
- [x] Click "+ note" → opens DayFocusOverlay with new note pre-selected
- [x] Right-click day → set/edit/remove hard deadline
- [x] Deadline shown as red left-border + red ! badge on cell
- [x] Notes auto-roll overnight (undone notes from yesterday → today on load)

### Sticky Notes
- [x] Each note has: text, stage, priority (High/""), done state, color
- [x] Done state: 0.35 opacity, strikethrough
- [x] Priority: ★ badge bottom-right
- [x] Deterministic tilt per note id
- [x] Deterministic corner radius per note id
- [x] Drag notes between calendar days
- [x] Tap-select a note → highlight ring, move by tapping another day
- [x] Notes persist to localStorage

### Inbox
- [x] Horizontal scrollable rail of unscheduled notes
- [x] Click anywhere on rail → open note composer
- [x] Hover over rail → ghost "+ note" chip appears at end
- [x] Drag inbox note → calendar day to schedule it
- [x] Drag calendar note → inbox to unschedule it
- [x] Reorder notes within inbox by drag
- [x] Remove note with ✕ button
- [x] Template Packs — add a preset batch of notes to inbox
- [x] Empty state: italic placeholder text → "＋ NOTE" on hover

### DayFocusOverlay
- [x] Tap any calendar note → open focus view for that day
- [x] Shows all notes for that day as fan thumbnails
- [x] Tap thumbnail → switch editor to that note
- [x] NEW NOTE chip at end of fan row
- [x] Stage picker (collapsed, tap label to expand)
- [x] Priority toggle
- [x] Complete / Delete actions
- [x] SAVE button — full-width CTA
- [x] Backdrop click → saves + closes
- [x] Drag to reorder notes within the fan

### Note Composer (StickyComposer)
- [x] Inbox mode: create new notes, add multiple to inbox in one session
- [x] Edit mode: edit existing calendar note
- [x] Stage picker (collapsed by default, above textarea)
- [x] Priority toggle
- [x] Enter to save
- [x] Backdrop click → saves + closes

### Persistence
- [x] Notes → `localStorage` key `sw3_notes`
- [x] Deadlines → `localStorage` key `sw3_dl`
- [x] Inbox → `localStorage` key `sw3_inbox`
- [x] Export: copy full JSON to clipboard
- [x] Import: paste JSON to restore

---

## Pending / Roadmap

### v1.1 — Polish
- [ ] Mobile layout: calendar cells too small on iPhone
- [ ] PWA manifest + service worker (installable to home screen)
- [ ] Better empty state for calendar (first-run experience)

### v1.2 — Power Features
- [ ] "Work backwards from deadline" — auto-generate milestone notes from a deadline
- [ ] Schedule inbox note to a day without drag (tap-to-schedule on mobile)
- [ ] Filter calendar by stage (show only Discovery notes, etc.)
- [ ] Keyboard shortcuts (n = new note, t = today, ←→ = prev/next month)

### v2 — Collaboration
- [ ] Auth (Supabase)
- [ ] Shared boards (replace localStorage with Postgres)
- [ ] Team members see each other's notes
- [ ] Comments on notes
- [ ] @mention a teammate

---

## Data Model

### Note
```typescript
interface Note {
  id: string           // uid() — random, used for tilt/corners
  text: string         // note content
  stage: StageId       // "discovery" | "research" | ... | "launch"
  priority: "" | "High"
  color: string        // hex — derived from stage at creation
  done: boolean
}
```

### Notes Map (calendar)
```typescript
type NotesMap = Record<DateKey, Note[]>
// DateKey = "YYYY-MM-DD"
// stored in localStorage as "sw3_notes"
```

### Deadline
```typescript
interface Deadline {
  label: string        // e.g. "Design Deck"
}
type DeadlineMap = Record<DateKey, Deadline>
// stored in localStorage as "sw3_dl"
```

### Inbox Item
```typescript
interface InboxItem {
  id: string
  text: string
  stage: StageId
  priority: "" | "High"
  color?: string       // optional, derived from stage
}
// stored in localStorage as "sw3_inbox"
```

### Export Format
```json
{
  "notes": { "2026-03-11": [...] },
  "deadlines": { "2026-03-13": { "label": "Design Deck" } },
  "inbox": [...],
  "exportedAt": "2026-03-11T17:00:00.000Z"
}
```

---

## Stage Definitions

```typescript
type StageId =
  | "discovery"
  | "research"
  | "synthesis"
  | "ideation"
  | "prototyping"
  | "testing"
  | "handoff"
  | "launch"
```

---

## Non-Goals (v1)

- No user accounts
- No cloud sync
- No recurring events
- No time-of-day scheduling (dates only, no hours)
- No notifications
