import { PALETTE, STAGES, T, stickyCorners } from "../tokens";

export default function StickyNote({
  id, text, color, done=false, stage, priority,
  tilt=0, size="md",
  selected=false,
  draggable: isDraggable=true,
  onDragStart, onDragEnd,
  onClick,
  showStage=false,
}) {
  const pal  = PALETTE.find(p=>p.bg===color)||PALETTE[0];
  const st   = stage ? STAGES.find(s=>s.id===stage) : null;
  const corners = stickyCorners(id);

  const pad   = size==="lg" ? "14px 16px 16px" : size==="sm" ? "6px 7px 7px" : "9px 10px 11px";
  const fsize = size==="lg" ? T.t1 : size==="sm" ? T.t2 : T.t1;
  const lh    = size==="sm" ? 1.4 : 1.5;

  const cardBg = color;

  const shadow = selected
    ? `0 0 0 1.5px #fff, 0 0 0 3.5px #FF6EB4, 0 12px 40px rgba(0,0,0,0.6)`
    : `0 4px 20px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.12) inset`;

  return (
    <div
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className="note-card"
      style={{
        "--tilt": `${tilt}deg`,
        borderRadius: corners,
        padding: pad,
        fontSize: fsize,
        fontFamily:T.body,
        fontWeight: 700,
        fontStyle: "normal",
        color: "#fff",
        cursor: isDraggable ? "grab" : "pointer",
        userSelect:"none",
        WebkitUserSelect:"none",
        boxShadow: shadow,
        transform: selected
          ? `rotate(${tilt*0.3}deg) scale(1.06)`
          : `rotate(${tilt}deg)`,
        transition:"transform 0.15s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.15s, opacity 0.15s",
        opacity: done ? 0.35 : 1,
        textDecoration: done ? "line-through" : "none",
        lineHeight: lh,
        touchAction:"manipulation",
        position:"relative",
        overflow:"hidden",
        backgroundColor: "#0e0c1a",
        backgroundImage: `
          radial-gradient(ellipse 90% 80% at 50% 50%,
            ${cardBg}55 0%,
            ${cardBg}22 45%,
            transparent 70%
          ),
          linear-gradient(135deg,
            rgba(255,255,255,0.06) 0%,
            transparent 40%,
            rgba(0,0,0,0.3) 100%
          )
        `,
        border: `1px solid rgba(255,255,255,0.22)`,
      }}
    >
      {/* TOP-LEFT corner shine */}
      <div style={{
        position:"absolute", top:"-8px", left:"-8px",
        width:"32px", height:"32px",
        background:"radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 70%)",
        pointerEvents:"none",
        borderRadius:"50%",
      }}/>
      {/* BOTTOM-RIGHT corner shine */}
      <div style={{
        position:"absolute", bottom:"-10px", right:"-10px",
        width:"28px", height:"28px",
        background:"radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)",
        pointerEvents:"none",
        borderRadius:"50%",
      }}/>
      {/* inner border glow */}
      <div style={{
        position:"absolute", inset:"0",
        borderRadius: corners,
        boxShadow:"inset 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.3)",
        pointerEvents:"none",
      }}/>

      {showStage && st && (
        <div style={{fontSize:T.t3,fontWeight:700,letterSpacing:"2px",
          color:"rgba(255,255,255,0.45)",marginBottom:"5px",textTransform:"uppercase",
          fontFamily:T.body}}>
          {st.icon} {st.label}
        </div>
      )}

      <span style={{
        position:"relative", zIndex:1,
        textShadow:"0 1px 4px rgba(0,0,0,0.5)",
      }}>{text}</span>

      {priority==="High" && (
        <span style={{display:"inline-block",marginLeft:"5px",fontSize:T.t4,
          background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",
          padding:"1px 4px",fontFamily:T.body,
          fontWeight:700,letterSpacing:"1px",verticalAlign:"middle",color:"rgba(255,255,255,0.7)"}}>
          HIGH
        </span>
      )}

      {done && (
        <div style={{fontSize:T.t3,marginTop:"3px",opacity:0.55,fontWeight:700,
          fontFamily:T.body,letterSpacing:"1px"}}>✓ DONE</div>
      )}

      {selected && (
        <div style={{position:"absolute",inset:0,
          border:"2px solid rgba(255,110,180,0.8)",
          borderRadius:corners,pointerEvents:"none",
          boxShadow:"inset 0 0 12px rgba(255,110,180,0.2)"}}/>
      )}
    </div>
  );
}
