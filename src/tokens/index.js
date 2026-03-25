// ─────────────────────────────────────────────────────────────────────────────
// STUDIO WALL — DESIGN TOKENS
// Single source of truth. Import from here everywhere.
// Before changing anything, update docs/DESIGN.md first.
// ─────────────────────────────────────────────────────────────────────────────

// ── Typography ────────────────────────────────────────────────────────────────
export const T = {
  display: "'Archivo Black', sans-serif",
  body:    "'Playfair Display', serif",
  t1: "11px",   // body text, card content, textarea
  t2: "9px",    // labels, stage tags, button text (ALL CAPS)
  t3: "7.5px",  // secondary labels, hints
  t4: "6.5px",  // micro labels on small cards
};

export const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&display=swap";

// ── Colors ────────────────────────────────────────────────────────────────────
export const COLORS = {
  yellow:  { base: "#FFE566", shadow: "#C9A800" },
  pink:    { base: "#FF6EB4", shadow: "#C4006A" },
  teal:    { base: "#5FE0C0", shadow: "#009E7A" },
  orange:  { base: "#FF8C5A", shadow: "#C44A00" },
  violet:  { base: "#A87EFA", shadow: "#5B10D6" },
  blue:    { base: "#5CC8FF", shadow: "#007DC4" },
  green:   { base: "#B8F240", shadow: "#6A9B00" },
  red:     { base: "#FF5C5C", shadow: "#B80000" },
};

// Flat palette array (legacy compat)
export const PALETTE = Object.values(COLORS).map(c => ({ bg: c.base, sh: c.shadow }));

// ── Gradients ─────────────────────────────────────────────────────────────────
export const RAINBOW =
  "linear-gradient(110deg,#A87EFA 0%,#5CC8FF 14%,#5FE0C0 28%,#B8F240 42%,#FFE566 57%,#FF8C5A 71%,#FF6EB4 85%,#A87EFA 100%)";

export const RAINBOW_ANIMATED = {
  ...parseGradientToStyle(RAINBOW),
  backgroundSize: "400% 100%",
  animation: "holo 3s ease infinite",
};

// ── Backgrounds ───────────────────────────────────────────────────────────────
export const BG = {
  appBase:    "#080810",
  cardBase:   "#0e0c1a",
  navSurface: "rgba(14,12,26,0.95)",
  inboxSurface: "rgba(14,12,26,0.8)",
  inputSurface: "rgba(255,255,255,0.05)",
  subtleBorder: "rgba(255,255,255,0.042)",
  cellBorder:   "rgba(255,255,255,0.06)",
};

// ── Glass Surfaces ──────────────────────────────────────────────────────────
export const GLASS = {
  nav: {
    background: "rgba(14,12,26,0.92)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
  },
  inbox: {
    background: "rgba(14,12,26,0.78)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  modal: {
    background: "rgba(3,2,10,0.85)",
    backdropFilter: "blur(28px)",
    WebkitBackdropFilter: "blur(28px)",
  },
};

// ── Stages ────────────────────────────────────────────────────────────────────
export const STAGES = [
  { id: "discovery",   label: "Discovery",   color: COLORS.blue.base,   shadow: COLORS.blue.shadow,   icon: "🔍" },
  { id: "research",    label: "Research",    color: COLORS.green.base,  shadow: COLORS.green.shadow,  icon: "📊" },
  { id: "synthesis",   label: "Synthesis",   color: COLORS.orange.base, shadow: COLORS.orange.shadow, icon: "🧩" },
  { id: "ideation",    label: "Ideation",    color: COLORS.pink.base,   shadow: COLORS.pink.shadow,   icon: "💡" },
  { id: "prototyping", label: "Prototyping", color: COLORS.violet.base, shadow: COLORS.violet.shadow, icon: "🛠" },
  { id: "testing",     label: "Testing",     color: COLORS.yellow.base, shadow: COLORS.yellow.shadow, icon: "🧪" },
  { id: "handoff",     label: "Handoff",     color: COLORS.green.base,  shadow: COLORS.green.shadow,  icon: "📦" },
  { id: "launch",      label: "Launch",      color: COLORS.pink.base,   shadow: COLORS.pink.shadow,   icon: "🚀" },
];

// ── Spacing ───────────────────────────────────────────────────────────────────
export const SPACING = {
  navPadding:   "20px 28px 16px",
  modalPadding: "28px 28px 24px",
  cardSm:       "6px 7px 7px",
  cardMd:       "9px 10px 11px",
  cardLg:       "14px 16px 16px",
  stageTag:     "4px 9px",
  pill:         "6px 14px",
};

// ── Card Dimensions ───────────────────────────────────────────────────────────
export const CARD_SIZE = {
  inbox:   { width: "118px", minHeight: "80px" },
  fan:     { width: "130px", minHeight: "80px" },
  composer:{ width: "118px", minHeight: "72px" },
};

// ── Persistence Keys ──────────────────────────────────────────────────────────
export const LS = {
  notes:  "sw3_notes",
  dl:     "sw3_dl",
  inbox:  "sw3_inbox",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

// Deterministic non-uniform corners per note id
export function stickyCorners(id) {
  const c = (id || "zzz").split("").map(x => x.charCodeAt(0));
  const v = (i) => (c[i % c.length] % 4 === 0) ? "1px" : "0px";
  return `${v(0)} ${v(1)} ${v(2)} ${v(3)}`;
}

// Deterministic tilt -3.5° to +3.5°
export function stickyTilt(id, index) {
  const seed = ((id || "a").charCodeAt(0) * 13 + index * 97) % 140;
  return (seed - 70) / 20;
}

// localStorage helpers
export const load = (k, fb) => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; }
  catch { return fb; }
};
export const save = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
};

// Unique id
export const uid = () => Math.random().toString(36).slice(2, 9);

// Date key "YYYY-MM-DD"
export const dKey = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

// Helper to avoid lint error — gradient is used as a string in JSX
function parseGradientToStyle(gradient) {
  return {
    background: gradient,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };
}
