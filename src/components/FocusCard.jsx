import { STAGES, T } from "../tokens";

// Dark card background with stage-colored aura
function darkCard(stageColor) {
  return {
    backgroundColor: "#07060f",
    backgroundImage: `
      radial-gradient(ellipse 85% 75% at 50% 50%,
        ${stageColor}2e 0%,
        ${stageColor}14 35%,
        transparent 68%
      ),
      linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 55%)
    `,
    border: `1px solid ${stageColor}44`,
  };
}

/**
 * Mini card used in DayFocusOverlay and StickyComposer fan/stack views.
 * Shows stage icon + label, text content, optional done/remove buttons.
 */
export default function FocusCard({
  note,
  isEditing = false,
  ejecting = false,
  ejectDelay = 0,
  width = "130px",
  minHeight = "80px",
  showDone = false,
  onClick,
  onToggleDone,
  onRemove,
}) {
  const gStage = STAGES.find(s => s.id === note.stage) || STAGES[0];
  const seed = (note.id || "a").charCodeAt(0);
  const rot = ((seed % 11) - 5) * 0.7;

  return (
    <div
      onClick={onClick}
      style={{
        ...darkCard(gStage.color),
        borderRadius: "2px",
        padding: "10px 12px",
        width,
        minHeight,
        boxShadow: isEditing
          ? `0 0 0 2px #fff, 0 0 0 4px ${gStage.color}99, 0 8px 24px rgba(0,0,0,0.55)`
          : `0 0 0 1px ${gStage.color}44, 0 8px 24px rgba(0,0,0,0.55)`,
        transform: `rotate(${rot}deg)`,
        cursor: "pointer",
        fontFamily: T.body,
        fontSize: T.t1,
        color: note.done ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.8)",
        lineHeight: 1.4,
        userSelect: "none",
        position: "relative",
        textDecoration: note.done ? "line-through" : "none",
        transition: "box-shadow 0.15s, opacity 0.15s",
        opacity: ejecting ? 0 : 1,
      }}
    >
      {/* Aura overlay */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "2px", pointerEvents: "none",
        background: `radial-gradient(ellipse 80% 70% at 50% 40%, ${gStage.color}18 0%, transparent 65%)`,
      }}/>
      {/* Inner border glow */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "2px", pointerEvents: "none",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.12)",
      }}/>

      {/* Done toggle — top-left */}
      {showDone && (
        <button
          onClick={e => { e.stopPropagation(); onToggleDone?.(); }}
          style={{
            position: "absolute", top: "-6px", left: "-6px",
            width: "16px", height: "16px", borderRadius: "50%",
            background: note.done ? "rgba(95,224,192,0.85)" : "rgba(14,12,26,0.9)",
            border: `1px solid ${note.done ? "rgba(95,224,192,0.8)" : "rgba(255,255,255,0.12)"}`,
            color: note.done ? "#fff" : "rgba(255,255,255,0.28)",
            fontSize: T.t3, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 0, lineHeight: 1, zIndex: 2,
            transition: "background 0.15s, border-color 0.15s",
          }}
          title={note.done ? "Mark undone" : "Mark done"}
        >
          ✓
        </button>
      )}

      {/* Remove — top-right */}
      {onRemove && (
        <button
          onClick={e => { e.stopPropagation(); onRemove(); }}
          style={{
            position: "absolute", top: "-6px", right: "-6px",
            width: "16px", height: "16px", borderRadius: "50%",
            background: "rgba(14,12,26,0.9)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.5)", fontSize: T.t2, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 0, lineHeight: 1, zIndex: 2,
            transition: "background 0.1s, color 0.1s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,92,92,0.7)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(14,12,26,0.9)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
        >
          ✕
        </button>
      )}

      {/* Stage header */}
      <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "6px", position: "relative" }}>
        <span style={{ fontSize: T.t1, lineHeight: 1 }}>{gStage.icon}</span>
        <span style={{
          fontFamily: T.body, fontSize: T.t4, letterSpacing: "1.4px",
          textTransform: "uppercase", color: gStage.color, fontWeight: 700,
        }}>{gStage.label}</span>
      </div>

      {/* Text content */}
      <div style={{
        position: "relative", fontFamily: T.body, fontSize: T.t1, fontWeight: 500,
        overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical",
      }}>{note.text}</div>
    </div>
  );
}
