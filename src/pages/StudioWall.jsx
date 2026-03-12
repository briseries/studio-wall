import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";
import useSupabaseSync from "../hooks/useSupabaseSync";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const MONTHS   = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_S = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS_S   = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
const DAYS_L   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const uid     = () => Math.random().toString(36).slice(2,9);
const dKey    = (y,m,d) => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
const getDIM  = (y,m)   => new Date(y,m+1,0).getDate();
const getFirst= (y,m)   => new Date(y,m,1).getDay();
const TODAY   = new Date();
const TODAY_K = dKey(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());

// Candy palette — bg + hard shadow colour
const PALETTE = [
  { bg:"#FFE566", sh:"#C9A800" },
  { bg:"#FF6EB4", sh:"#C4006A" },
  { bg:"#5FE0C0", sh:"#009E7A" },
  { bg:"#FF8C5A", sh:"#C44A00" },
  { bg:"#A87EFA", sh:"#5B10D6" },
  { bg:"#5CC8FF", sh:"#007DC4" },
  { bg:"#B8F240", sh:"#6A9B00" },
  { bg:"#FF5C5C", sh:"#B80000" },
];

const STAGES = [
  { id:"discovery",   label:"Discovery",   color:"#5CC8FF", sh:"#007DC4", icon:"🔍" },
  { id:"research",    label:"Research",    color:"#B8F240", sh:"#6A9B00", icon:"📊" },
  { id:"synthesis",   label:"Synthesis",   color:"#FF8C5A", sh:"#C44A00", icon:"🧩" },
  { id:"ideation",    label:"Ideation",    color:"#FF6EB4", sh:"#C4006A", icon:"💡" },
  { id:"prototyping", label:"Prototyping", color:"#A87EFA", sh:"#5B10D6", icon:"🛠"  },
  { id:"testing",     label:"Testing",     color:"#FFE566", sh:"#C9A800", icon:"🧪" },
  { id:"handoff",     label:"Handoff",     color:"#B8F240", sh:"#6A9B00", icon:"📦" },
  { id:"launch",      label:"Launch",      color:"#FF6EB4", sh:"#C4006A", icon:"🚀" },
];

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE PACKS
// ─────────────────────────────────────────────────────────────────────────────
const TEMPLATE_PACKS = [
  {
    id:"sprint", name:"Sprint Pack", icon:"⚡", desc:"Agile sprint essentials",
    items:[
      { text:"Sprint planning",  stage:"discovery",   priority:"High" },
      { text:"Daily standup",    stage:"research",    priority:"" },
      { text:"Design review",    stage:"synthesis",   priority:"High" },
      { text:"Dev handoff",      stage:"handoff",     priority:"" },
      { text:"Sprint retro",     stage:"testing",     priority:"" },
    ],
  },
  {
    id:"research", name:"Research Pack", icon:"🔬", desc:"User research workflow",
    items:[
      { text:"Recruit participants",  stage:"research",  priority:"High" },
      { text:"Write discussion guide",stage:"research",  priority:"" },
      { text:"Run interviews",        stage:"research",  priority:"High" },
      { text:"Affinity mapping",      stage:"synthesis", priority:"" },
      { text:"Insight readout",       stage:"synthesis", priority:"" },
    ],
  },
  {
    id:"launch", name:"Launch Pack", icon:"🚀", desc:"Ship a feature or product",
    items:[
      { text:"Final design QA",    stage:"testing",  priority:"High" },
      { text:"Write release notes",stage:"handoff",  priority:"" },
      { text:"Stakeholder sign-off",stage:"handoff", priority:"High" },
      { text:"Go live",            stage:"launch",   priority:"High" },
      { text:"Post-launch review", stage:"testing",  priority:"" },
    ],
  },
  {
    id:"ideation", name:"Ideation Pack", icon:"💡", desc:"Concepting & brainstorming",
    items:[
      { text:"Crazy 8s",          stage:"ideation",    priority:"" },
      { text:"Concept sketches",  stage:"ideation",    priority:"" },
      { text:"Design crit",       stage:"ideation",    priority:"" },
      { text:"Lo-fi wireframes",  stage:"prototyping", priority:"High" },
      { text:"Prototype & test",  stage:"prototyping", priority:"" },
    ],
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// TYPE RAMP
// T1 11px  — body text, textarea input, card text
// T2  9px  — labels, stage tags, button text
// T3 7.5px — secondary labels, dot labels, keyboard hints
// T4 6.5px — micro labels, stage chips on cards
// Display  — Archivo Black (titles, CTAs, day names)
// Body     — Playfair Display (everything else)
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  display: "'Archivo Black',sans-serif",
  body:    "'Playfair Display',serif",
  t1: "11px",
  t2: "9px",
  t3: "7.5px",
  t4: "6.5px",
};
// ─────────────────────────────────────────────────────────────────────────────
// STICKY NOTE VISUAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────
// Sharp corners — 0px mostly, occasional 1px
function stickyCorners(id) {
  const c = (id||"zzz").split("").map(x=>x.charCodeAt(0));
  const v = (i) => (c[i%c.length] % 4 === 0) ? "1px" : "0px";
  return `${v(0)} ${v(1)} ${v(2)} ${v(3)}`;
}

// Deterministic tilt -3.5° to +3.5°
function stickyTilt(id, index) {
  const seed = ((id||"a").charCodeAt(0) * 13 + index * 97) % 140;
  return (seed - 70) / 20;
}

// ─────────────────────────────────────────────────────────────────────────────
// LOCALSTORAGE
// ─────────────────────────────────────────────────────────────────────────────
const LS = { notes:"sw3_notes", dl:"sw3_dl", inbox:"sw3_inbox" };
const load = (k,fb) => { try { const v=localStorage.getItem(k); return v?JSON.parse(v):fb; } catch { return fb; } };
const save = (k,v)  => { try { localStorage.setItem(k,JSON.stringify(v)); } catch {} };

const INIT_NOTES = { [TODAY_K]: [
  { id:uid(), text:"Sprint planning",    color:"#FFE566", done:false },
  { id:uid(), text:"Review design specs",color:"#5CC8FF", done:false },
  { id:uid(), text:"Ship it 🚀",         color:"#B8F240", done:false },
]};
const INIT_INBOX = [
  { id:uid(), text:"User research plan", stage:"research",   priority:"High" },
  { id:uid(), text:"Journey map",        stage:"synthesis",  priority:"" },
  { id:uid(), text:"Concept sketches",   stage:"ideation",   priority:"" },
  { id:uid(), text:"Lo-fi wireframes",   stage:"prototyping",priority:"High" },
];

// ─────────────────────────────────────────────────────────────────────────────
// STICKY NOTE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function StickyNote({
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

  // Dark iridescent base from the color — mix toward dark
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
        // Dark iridescent card: deep dark base + color bloom in center
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
      {/* TOP-LEFT corner shine — bright white spot */}
      <div style={{
        position:"absolute", top:"-8px", left:"-8px",
        width:"32px", height:"32px",
        background:"radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 70%)",
        pointerEvents:"none",
        borderRadius:"50%",
      }}/>
      {/* BOTTOM-RIGHT corner shine — softer */}
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


// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// Single source of truth — used by StickyComposer + DayFocusOverlay
// ─────────────────────────────────────────────────────────────────────────────

// ── StageTag ─────────────────────────────────────────────────────────────────
// The colored pill used in both the collapsed header label and the expanded tray
function StageTag({ stage, isActive, onClick }) {
  return (
    <button onClick={onClick} className="stage-tag"
      style={{
        background:  isActive ? `${stage.color}22` : "rgba(255,255,255,0.04)",
        border:      isActive ? `1.5px solid ${stage.color}99` : "1.5px solid rgba(255,255,255,0.08)",
        borderRadius:"0", padding:"4px 9px", cursor:"pointer",
        fontFamily:T.body, fontSize:T.t2, fontWeight:700,
        color:       isActive ? stage.color : "rgba(255,255,255,0.28)",
        transform:   isActive ? "scale(1.05) translateY(-1px)" : "scale(1)",
        boxShadow:   isActive ? `0 0 8px ${stage.color}44` : "none",
        letterSpacing:"0.5px", whiteSpace:"nowrap",
      }}>
      {stage.icon} {stage.label}
    </button>
  );
}

// ── CTAButton ────────────────────────────────────────────────────────────────
// Full-width primary action — SAVE / ADD TO INBOX / SET IT
function CTAButton({ onClick, disabled=false, color="#A87EFA", children, style={} }) {
  const active = !disabled;
  return (
    <button onClick={onClick} disabled={disabled} className="cta-btn"
      style={{
        width:"100%", padding:"14px 0",
        background: active
          ? `linear-gradient(135deg, ${color}44 0%, ${color}18 100%)`
          : "rgba(255,255,255,0.04)",
        border: active
          ? `1.5px solid ${color}77`
          : "1.5px solid rgba(255,255,255,0.08)",
        borderRadius:"0", cursor: active ? "pointer" : "default",
        fontFamily:T.display, fontSize:"14px",
        color: active ? "#fff" : "rgba(255,255,255,0.2)",
        letterSpacing:"2px",
        boxShadow: active ? `0 0 24px ${color}44, 0 0 0 1px ${color}33` : "none",
        ...style,
      }}>
      {children}
    </button>
  );
}

// ── CompleteDeletePair ────────────────────────────────────────────────────────
// COMPLETE (flex) + 🗑 (fixed 38px) side-by-side inside the focus card
function CompleteDeletePair({ done, auraColor, onComplete, onDelete }) {
  return (
    <div style={{display:"flex", gap:"8px", marginTop:"4px"}}>
      <button onClick={onComplete} className="action-btn"
        style={{
          flex:1, padding:"9px 0",
          background: done ? "rgba(95,224,192,0.1)" : "transparent",
          border: done
            ? "1.5px solid rgba(95,224,192,0.55)"
            : `1.5px solid ${auraColor}55`,
          borderRadius:"0", cursor:"pointer",
          fontFamily:T.display, fontSize:T.t2,
          color: done ? "rgba(95,224,192,0.9)" : `${auraColor}cc`,
          letterSpacing:"2px",
          textDecoration: done ? "line-through" : "none",
        }}>
        {done ? "↩ UNDO" : "COMPLETE"}
      </button>
      <button onClick={onDelete} className="action-btn"
        style={{
          flexShrink:0, width:"38px", padding:"9px 0",
          background:"transparent",
          border:`1.5px solid ${auraColor}55`,
          borderRadius:"0", cursor:"pointer",
          fontSize:"14px", lineHeight:1,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}
        onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,92,92,0.1)"; e.currentTarget.style.borderColor="rgba(255,92,92,0.5)"; }}
        onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor=`${auraColor}55`; }}>
        🗑
      </button>
    </div>
  );
}

// ── ModalShell ───────────────────────────────────────────────────────────────
// Dark blurred backdrop + centered card. All modals use this.
function ModalShell({ onClose, children, zIndex=9000, tilt=0, accentColor=null, width="min(520px,96vw)", style={} }) {
  return (
    <div onClick={onClose} className="anim-overlay"
      style={{
        position:"fixed", inset:0, zIndex,
        background:"rgba(3,2,10,0.82)",
        backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
        display:"flex", alignItems:"center", justifyContent:"center", padding:"20px",
      }}>
      <div onClick={e=>e.stopPropagation()} className="anim-modal"
        style={{
          width, background:"#0e0c1a", borderRadius:"0",
          padding:"28px 28px 24px", ...style,
          border: accentColor
            ? `1.5px solid ${accentColor}`
            : "1px solid rgba(255,255,255,0.1)",
          boxShadow: accentColor
            ? `0 0 0 1px ${accentColor}33, 0 0 40px ${accentColor}18, 0 32px 64px rgba(0,0,0,0.7)`
            : "0 0 0 1px rgba(95,224,192,0.15), 0 40px 80px rgba(0,0,0,0.8)",
          transform: tilt ? `rotate(${tilt}deg)` : undefined,
        }}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STICKY COMPOSER — dark KATSEYE aesthetic
// Dark card, aura gradient from stage color, white sparkle, white text
// mode="inbox" : Exposé stack, Enter=save+next, Done=flush to inbox
// mode="edit"  : single note edit
// ─────────────────────────────────────────────────────────────────────────────

// White sparkle SVG — 4-pointed star
function Sparkle({ size=22, opacity=0.9 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{display:"block",flexShrink:0,opacity}}>
      <path d="M12 2 C12 2 12.8 7.5 14.5 9.5 C16.5 11.5 22 12 22 12 C22 12 16.5 12.5 14.5 14.5 C12.5 16.5 12 22 12 22 C12 22 11.2 16.5 9.5 14.5 C7.5 12.5 2 12 2 12 C2 12 7.5 11.5 9.5 9.5 C11.5 7.5 12 2 12 2 Z"
        fill="white"/>
    </svg>
  );
}

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

function StickyComposer({
  mode,
  initialText, initialStage, initialDone,
  onSaveDone, onDelete, onToggleDone,
  onFlush,
  onClose,
}) {
  const [stack,         setStack]         = useState([]);
  const [text,          setText]          = useState(initialText||"");
  const [stage,         setStage]         = useState(initialStage||"discovery");
  const [priority,      setPriority]      = useState("");
  const [done,          setDone]          = useState(initialDone||false);
  const [ejecting,      setEjecting]      = useState(false);
  const [editingIdx,    setEditingIdx]    = useState(null); // which stack card is being re-edited
  const [stackDragOver, setStackDragOver] = useState(null); // index for pink insert line
  const stackDragging   = useRef(null);
  const inputRef        = useRef();
  const isInbox         = mode==="inbox";

  useEffect(()=>{ inputRef.current?.focus(); },[]);

  const stageIndex  = STAGES.findIndex(s=>s.id===stage);
  const activeStage = STAGES[stageIndex] || STAGES[0];

  // Snapshot the current textarea into the stack (used on blur / card switch)
  function flushCurrent() {
    if (!text.trim()) return;
    const item = { id: editingIdx!==null ? stack[editingIdx]?.id||uid() : uid(),
                   text:text.trim(), stage, priority, color:activeStage.color };
    if (editingIdx !== null) {
      setStack(s=>s.map((x,i)=>i===editingIdx ? item : x));
    } else {
      setStack(s=>[...s, item]);
    }
  }

  // Start editing a blank new note slot
  function startNew() {
    if (isInbox) flushCurrent(); // auto-save current before switching
    setText("");
    setPriority("");
    setEditingIdx(null);
    setTimeout(()=>{ inputRef.current?.focus(); }, 0);
  }

  function commit() {
    if (!text.trim()) return;
    flushCurrent();
    setText("");
    setPriority("");
    setEditingIdx(null);
    setTimeout(()=>inputRef.current?.focus(), 0);
  }

  function handleDone() {
    // Auto-save whatever is in the textarea before flushing
    const currentItem = text.trim()
      ? [{ id:uid(), text:text.trim(), stage, priority, color:activeStage.color }]
      : [];
    // Merge: if editingIdx, replace that slot; else append
    let merged;
    if (text.trim() && editingIdx !== null) {
      merged = stack.map((x,i)=>i===editingIdx
        ? {id:x.id,text:text.trim(),stage,priority,color:activeStage.color} : x);
    } else {
      merged = [...stack, ...currentItem];
    }
    if (merged.length > 0) {
      setEjecting(true);
      setTimeout(()=>{ onFlush(merged); }, 420);
    } else {
      onClose();
    }
  }

  function handleKey(e) {
    if (e.key==="Enter" && !e.shiftKey && isInbox) { e.preventDefault(); commit(); }
    if (e.key==="Enter" && !e.shiftKey && !isInbox) { e.preventDefault(); onSaveDone({text:text.trim(),stage,color:activeStage.color}); }
    if (e.key==="Escape") { if(isInbox) handleDone(); else onClose(); }
    if (e.key==="Tab") {
      e.preventDefault();
      const next = e.shiftKey
        ? (stageIndex - 1 + STAGES.length) % STAGES.length
        : (stageIndex + 1) % STAGES.length;
      setStage(STAGES[next].id);
    }
  }

  // Click a stack card → auto-save current, load that card into editor
  function editStackCard(idx) {
    if (isInbox) flushCurrent(); // save current before switching
    const item = stack[idx];
    setText(item.text);
    setStage(item.stage);
    setPriority(item.priority||"");
    setEditingIdx(idx);
    setTimeout(()=>{ inputRef.current?.focus(); inputRef.current?.select(); }, 0);
  }

  // Remove a stack card
  function removeStackCard(idx) {
    setStack(s=>s.filter((_,i)=>i!==idx));
    if(editingIdx===idx) { setEditingIdx(null); setText(""); setPriority(""); }
    else if(editingIdx!==null && idx<editingIdx) setEditingIdx(i=>i-1);
  }

  // Total count including in-progress text
  const totalCount = stack.length + (text.trim() && editingIdx===null ? 1 : 0);

  const auraColor = activeStage.color;

  return (
    <div
      onClick={isInbox ? handleDone : onClose}
      className="anim-overlay"
      style={{
        position:"fixed", inset:0, zIndex:9000,
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        backdropFilter:"blur(28px)", WebkitBackdropFilter:"blur(28px)",
        background:"rgba(3,2,10,0.88)",
        backgroundImage:`radial-gradient(ellipse 70% 60% at 50% 50%, ${auraColor}18 0%, transparent 65%)`,
        transition:"background-image 0.3s",
        gap:"14px",
      }}>

      {/* ── Stack row (above active card) ── */}
      {isInbox && (
        <div onClick={e=>e.stopPropagation()}
          style={{
            display:"flex", gap:"8px", flexWrap:"wrap", justifyContent:"center",
            width:"min(680px,98vw)", paddingBottom:"2px",
          }}>
          {stack.map((item, gi) => {
            const gStage     = STAGES.find(s=>s.id===item.stage)||STAGES[0];
            const seed       = item.id.charCodeAt(0);
            const rot        = ((seed % 11) - 5) * 0.7;
            const isEditing  = editingIdx === gi;
            const isDragTarget = stackDragOver === gi;
            return (
              <div key={item.id}
                style={{position:"relative", display:"flex", alignItems:"stretch"}}
                draggable
                onDragStart={()=>{ stackDragging.current=gi; }}
                onDragOver={e=>{ e.preventDefault(); if(stackDragging.current!==gi) setStackDragOver(gi); }}
                onDragLeave={()=>setStackDragOver(null)}
                onDrop={e=>{
                  e.preventDefault();
                  const from=stackDragging.current;
                  if(from!=null && from!==gi){
                    setStack(s=>{
                      const arr=[...s]; const [moved]=arr.splice(from,1); arr.splice(gi,0,moved); return arr;
                    });
                    if(editingIdx===from) setEditingIdx(gi);
                    else if(editingIdx===gi) setEditingIdx(from);
                  }
                  stackDragging.current=null; setStackDragOver(null);
                }}
                onDragEnd={()=>{ stackDragging.current=null; setStackDragOver(null); }}>

                {isDragTarget && (
                  <div style={{width:"3px",alignSelf:"stretch",marginRight:"6px",borderRadius:"2px",flexShrink:0,
                    background:"rgba(255,110,180,0.85)",
                    boxShadow:"0 0 8px rgba(255,110,180,0.7),0 0 16px rgba(255,110,180,0.35)"}}/>
                )}

                <div
                  onClick={()=>editStackCard(gi)}
                  style={{
                    ...darkCard(gStage.color),
                    borderRadius:"2px", padding:"10px 12px", width:"118px", minHeight:"72px",
                    boxShadow: isEditing
                      ? `0 0 0 2px #fff, 0 0 0 4px ${gStage.color}99, 0 8px 24px rgba(0,0,0,0.55)`
                      : `0 0 0 1px ${gStage.color}44, 0 8px 24px rgba(0,0,0,0.55)`,
                    transform:`rotate(${rot}deg)`,
                    cursor:"pointer", fontFamily:T.body, fontSize:T.t1,
                    color:"rgba(255,255,255,0.72)", lineHeight:1.4,
                    opacity: ejecting ? 0 : 1,
                    transition: ejecting
                      ? `opacity 0.2s ease ${gi*25}ms, transform 0.3s ease ${gi*25}ms`
                      : `opacity 0.28s ease ${gi*40}ms, transform 0.28s cubic-bezier(0.34,1.56,0.64,1) ${gi*40}ms, box-shadow 0.15s`,
                    userSelect:"none", position:"relative",
                  }}>
                  <div style={{position:"absolute",inset:0,borderRadius:"2px",pointerEvents:"none",
                    background:`radial-gradient(ellipse 80% 70% at 50% 40%, ${gStage.color}18 0%, transparent 65%)`}}/>
                  <div style={{position:"absolute",inset:0,borderRadius:"2px",pointerEvents:"none",
                    boxShadow:"inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.12)"}}/>
                  <button
                    onClick={e=>{ e.stopPropagation(); removeStackCard(gi); }}
                    style={{position:"absolute",top:"-6px",right:"-6px",width:"16px",height:"16px",
                      borderRadius:"50%",background:"rgba(14,12,26,0.9)",border:"1px solid rgba(255,255,255,0.15)",
                      color:"rgba(255,255,255,0.5)",fontSize:T.t2,cursor:"pointer",
                      display:"flex",alignItems:"center",justifyContent:"center",padding:0,lineHeight:1,zIndex:2,
                      transition:"background 0.1s,color 0.1s"}}
                    onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,92,92,0.7)"; e.currentTarget.style.color="#fff"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.background="rgba(14,12,26,0.9)"; e.currentTarget.style.color="rgba(255,255,255,0.5)"; }}>
                    ✕
                  </button>
                  <div style={{display:"flex",alignItems:"center",gap:"5px",marginBottom:"6px",position:"relative"}}>
                    <span style={{fontSize:T.t1,lineHeight:1}}>{gStage.icon}</span>
                    <span style={{fontFamily:T.body,fontSize:T.t4,letterSpacing:"1.4px",textTransform:"uppercase",
                      color:gStage.color,fontWeight:700}}>{gStage.label}</span>
                  </div>
                  <div style={{position:"relative",fontFamily:T.body,fontSize:T.t1,fontWeight:500,
                    overflow:"hidden",display:"-webkit-box",WebkitLineClamp:3,
                    WebkitBoxOrient:"vertical"}}>{item.text}</div>
                </div>
              </div>
            );
          })}

          {/* ── + note chip at end of stack ── */}
          <div
            onClick={startNew}
            className="new-note-chip"
            style={{
              width:"118px", minHeight:"72px", borderRadius:"2px",
              border:"1.5px dashed rgba(255,255,255,0.12)",
              background:"rgba(255,255,255,0.02)",
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              gap:"6px", cursor:"pointer", transition:"border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,0.28)"; e.currentTarget.style.background="rgba(255,255,255,0.04)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,0.12)"; e.currentTarget.style.background="rgba(255,255,255,0.02)"; }}>
            <span style={{fontFamily:T.display,fontSize:"22px",lineHeight:1,color:"rgba(255,255,255,0.25)"}}>+</span>
            <span style={{fontFamily:T.display,fontSize:T.t3,letterSpacing:"1.5px",textTransform:"uppercase",
              color:"rgba(255,255,255,0.2)"}}>NEW NOTE</span>
          </div>
        </div>
      )}

      {/* ── Active card ── */}
      <div onClick={e=>e.stopPropagation()}
        className="anim-card-up"
        style={{position:"relative", width:"min(420px,94vw)"}}>
        <div style={{
          position:"relative",
          ...darkCard(auraColor),
          borderRadius:"2px",
          padding:"22px 24px 20px",
          boxShadow:`0 0 0 1px ${auraColor}55, 0 0 40px ${auraColor}22, 0 40px 80px rgba(0,0,0,0.7)`,
          transform: ejecting ? "translate(0,-130vh) rotate(-10deg) scale(0.65)" : "rotate(-0.5deg)",
          transition: ejecting
            ? "transform 0.42s cubic-bezier(0.4,0,1,1)"
            : "background-image 0.22s, box-shadow 0.22s, border-color 0.22s, transform 0.1s",
          fontFamily:T.body, overflow:"hidden",
        }}>
          <div style={{position:"absolute",inset:0,pointerEvents:"none",borderRadius:"2px",
            boxShadow:"inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.18)"}}/>
          <div style={{position:"absolute",top:"-16px",left:"-16px",width:"56px",height:"56px",
            background:"radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 65%)",
            pointerEvents:"none",borderRadius:"50%"}}/>

          {/* ── Stage header: icon + label + priority (no X) ── */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"14px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <span style={{fontSize:"15px",lineHeight:1}}>{activeStage.icon}</span>
              <span style={{fontFamily:T.display,fontSize:T.t2,
                color:auraColor,letterSpacing:"2px",lineHeight:1,textTransform:"uppercase",
                textShadow:`0 0 12px ${auraColor}55`}}>
                {activeStage.label}
              </span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <span style={{fontSize:T.t3,color:"rgba(255,255,255,0.12)",letterSpacing:"0.3px",fontFamily:T.body,fontStyle:"italic"}}>
                {isInbox ? "↵ next · tab stage" : "tab stage · esc close"}
              </span>
              <button onClick={()=>setPriority(p=>p==="High"?"":"High")}
                style={{
                  background:priority==="High"?`${auraColor}22`:"transparent",
                  border:priority==="High"?`1px solid ${auraColor}88`:"1px solid rgba(255,255,255,0.1)",
                  borderRadius:"0",padding:"3px 10px",cursor:"pointer",
                  fontFamily:T.display,fontSize:T.t3,
                  color:priority==="High"?auraColor:"rgba(255,255,255,0.25)",
                  letterSpacing:"1.5px",transition:"all 0.12s",whiteSpace:"nowrap",
                }}>
                {priority==="High"?"★ HIGH":"☆ PRIORITY"}
              </button>
            </div>
          </div>

          {/* ── Textarea ── */}
          <textarea
            ref={inputRef}
            value={text}
            onChange={e=>setText(e.target.value)}
            onKeyDown={handleKey}
            onBlur={()=>{ if(isInbox && text.trim()) flushCurrent(); }}
            placeholder={isInbox ? "What needs to get done?" : "Edit note..."}
            rows={3}
            style={{
              width:"100%",
              background:"rgba(255,255,255,0.05)",
              border:`1px solid ${auraColor}33`,
              borderRadius:"0", padding:"11px 13px",
              fontFamily:T.body, fontSize:"14px",
              resize:"none", outline:"none", boxSizing:"border-box",
              color:"rgba(255,255,255,0.92)", fontWeight:500, lineHeight:1.6,
              caretColor: auraColor, transition:"border-color 0.2s",
              boxShadow:`inset 0 0 0 1px rgba(255,255,255,0.04), 0 0 12px ${auraColor}11`,
              marginBottom:"14px",
            }}/>

          {/* ── Stage tags (bottom) ── */}
          <div style={{display:"flex",gap:"5px",flexWrap:"wrap",marginBottom:"12px"}}>
            {STAGES.map(s=>(
              <StageTag key={s.id} stage={s} isActive={stage===s.id} onClick={()=>setStage(s.id)}/>
            ))}
          </div>

          {/* ── Done + Delete pair (edit mode only) ── */}
          {!isInbox && (
            <CompleteDeletePair done={done} auraColor={auraColor}
              onComplete={()=>{ onToggleDone(); setDone(d=>!d); }}
              onDelete={onDelete}/>
          )}
        </div>
      </div>

      {/* ── SAVE button outside card (edit mode) ── */}
      {!isInbox && (
        <div onClick={e=>e.stopPropagation()} className="anim-fade-up"
          style={{width:"min(420px,94vw)",animationDelay:"0.12s"}}>
          <CTAButton color={auraColor}
            onClick={()=>onSaveDone({text:text.trim(),stage,color:activeStage.color})}>
            SAVE ↵
          </CTAButton>
        </div>
      )}

      {/* ── Master ADD button — outside the card, below ── */}
      {isInbox && (
        <div onClick={e=>e.stopPropagation()} className="anim-fade-up"
          style={{width:"min(420px,94vw)",animationDelay:"0.12s"}}>
          <CTAButton color={auraColor} onClick={handleDone} disabled={totalCount===0}>
            {totalCount > 0 ? `ADD  (${totalCount})` : "ADD TO INBOX"}
          </CTAButton>
        </div>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// DAY FOCUS OVERLAY
// Tap any note in a date cell → this overlay fans all that day's notes
// horizontally, lets you tap to edit in-place (same card stack UX as inbox),
// drag to reorder, add/remove. Shares card rendering with StickyComposer.
// ─────────────────────────────────────────────────────────────────────────────
function DayFocusOverlay({ dateKey, initialIdx=null, notes: initNotes, deadlines, onUpdateNotes, onClose, onAddNote }) {
  const isNewNote = initialIdx === "new";
  const [notes,        setNotes]        = useState(initNotes);
  // Pre-load the clicked note into editor on mount
  const resolvedIdx = isNewNote ? null : initialIdx;
  const firstNote = resolvedIdx!==null ? initNotes[resolvedIdx] : null;
  const [editingIdx,   setEditingIdx]   = useState(resolvedIdx);
  const [text,         setText]         = useState(firstNote?.text||"");
  const [stage,        setStage]        = useState(firstNote?.stage||"discovery");
  const [priority,     setPriority]     = useState(firstNote?.priority||"");
  const [done,         setDone]         = useState(firstNote?.done||false);
  const [dragOver,     setDragOver]     = useState(null);
  const [ejecting,     setEjecting]     = useState(false);
  const [tagsOpen,     setTagsOpen]     = useState(false);
  const draggingIdx    = useRef(null);
  const inputRef       = useRef();
  useEffect(()=>{ setTimeout(()=>{ inputRef.current?.focus(); if(resolvedIdx!==null) inputRef.current?.select(); },60); },[]);
  const stageIndex     = STAGES.findIndex(s=>s.id===stage);
  const activeStage    = STAGES[stageIndex]||STAGES[0];
  const auraColor      = activeStage.color;

  // Parse date label from dateKey (YYYY-MM-DD)
  const [dy,dm,dd] = dateKey.split("-").map(Number);
  const dayName    = DAYS_L[new Date(dy,dm-1,dd).getDay()];
  const dateLabel  = `${MONTHS_S[dm-1]} ${dd}`;

  // Flush current editor text into the notes array (used when switching cards)
  function flushCurrent() {
    if (!text.trim()) return;
    setNotes(prev => {
      if (editingIdx !== null) {
        return prev.map((n, i) => i === editingIdx
          ? { ...n, text: text.trim(), stage, priority, color: activeStage.color, done }
          : n);
      }
      return [...prev, { id: uid(), text: text.trim(), stage, priority, color: activeStage.color, done: false }];
    });
  }

  // Save on close — imperative, reads current closure values directly
  function saveAndClose() {
    const finalText = text.trim();
    let updated = [...notes];
    if (finalText && editingIdx !== null) {
      updated = updated.map((n, i) => i === editingIdx
        ? { ...n, text: finalText, stage, priority, color: activeStage.color, done }
        : n);
    } else if (finalText && editingIdx === null) {
      updated = [...updated, { id: uid(), text: finalText, stage, priority, color: activeStage.color, done: false }];
    }
    onUpdateNotes(updated);
    onClose();
  }

  // Alias so backdrop onClick and Escape still work
  function handleClose() { saveAndClose(); }

  function openCard(idx) {
    flushCurrent();
    const n = notes[idx];
    setText(n.text); setStage(n.stage||"discovery");
    setPriority(n.priority||""); setDone(n.done||false);
    setEditingIdx(idx); setTagsOpen(false);
    setTimeout(()=>{ inputRef.current?.focus(); inputRef.current?.select(); },0);
  }

  function removeCard(idx) {
    const updated = notes.filter((_,i)=>i!==idx);
    setNotes(updated);
    if(editingIdx===idx){ setEditingIdx(null); setText(""); }
    else if(editingIdx!==null && idx<editingIdx) setEditingIdx(i=>i-1);
  }

  function toggleCardDone(idx) {
    setNotes(prev=>prev.map((n,i)=>i===idx?{...n,done:!n.done}:n));
    if(editingIdx===idx) setDone(d=>!d);
  }

  function handleKey(e) {
    if(e.key==="Escape"){ e.preventDefault(); handleClose(); }
    if(e.key==="Tab"){
      e.preventDefault();
      const next = e.shiftKey
        ? (stageIndex-1+STAGES.length)%STAGES.length
        : (stageIndex+1)%STAGES.length;
      setStage(STAGES[next].id);
    }
  }

  const dl = deadlines[dateKey];

  return (
    <div
      onClick={saveAndClose}
      className="anim-overlay"
      style={{
        position:"fixed",inset:0,zIndex:9000,
        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
        backdropFilter:"blur(28px)",WebkitBackdropFilter:"blur(28px)",
        background:"rgba(3,2,10,0.9)",
        backgroundImage:`radial-gradient(ellipse 70% 60% at 50% 50%, ${auraColor}14 0%, transparent 65%)`,
        gap:"16px",
      }}>

      {/* Date header — top-left corner, stacked, with divider */}
      <div onClick={e=>e.stopPropagation()}
        style={{
          position:"fixed", top:0, left:0,
          padding:"28px 32px 0",
          userSelect:"none", pointerEvents:"none", zIndex:9001,
          width:"min(520px,60vw)",
        }}>
        <div style={{
          fontFamily:T.body,
          fontSize:"clamp(32px,4.5vw,60px)",
          lineHeight:1.1,
          letterSpacing:"-1.5px",
          fontStyle:"italic",
          overflow:"visible",
          background:"linear-gradient(110deg,#A87EFA 0%,#5CC8FF 14%,#5FE0C0 28%,#B8F240 42%,#FFE566 57%,#FF8C5A 71%,#FF6EB4 85%,#A87EFA 100%)",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
          marginBottom:"2px",
        }}>{dayName},</div>
        <div style={{
          fontFamily:T.body,
          fontSize:"clamp(26px,3.5vw,48px)",
          lineHeight:0.95,
          letterSpacing:"-1px",
          fontStyle:"italic",
          color:"rgba(255,255,255,0.2)",
        }}>{dateLabel}</div>
        {dl?.label && (
          <div style={{marginTop:"6px",fontSize:T.t2,color:"#FF8C5A",
            fontFamily:T.body,letterSpacing:"1.5px",fontWeight:700}}>
            🔴 {dl.label}
          </div>
        )}
        {/* Divider */}
        <div style={{
          marginTop:"12px",
          height:"1px",
          background:"linear-gradient(90deg,rgba(255,255,255,0.14) 0%,rgba(255,255,255,0.04) 55%,transparent 100%)",
        }}/>
      </div>

      {/* Fan of note cards */}
      <div onClick={e=>e.stopPropagation()}
        style={{display:"flex",gap:"10px",flexWrap:"wrap",justifyContent:"center",
          width:"min(680px,96vw)",paddingBottom:"24px",marginBottom:"4px",
          animation:"fadeSlideUp 0.24s ease both"}}>
        {notes.map((note,ni)=>{
          const gStage    = STAGES.find(s=>s.id===note.stage)||STAGES[0];
          const seed      = note.id.charCodeAt(0);
          const rot       = ((seed%11)-5)*0.7;
          const isEditing = editingIdx===ni;
          const isDragTgt = dragOver===ni;
          return (
            <div key={note.id}
              style={{position:"relative",display:"flex",alignItems:"stretch"}}
              draggable
              onDragStart={()=>{ draggingIdx.current=ni; }}
              onDragOver={e=>{ e.preventDefault(); if(draggingIdx.current!==ni) setDragOver(ni); }}
              onDragLeave={()=>setDragOver(null)}
              onDrop={e=>{
                e.preventDefault();
                const from=draggingIdx.current;
                if(from!=null && from!==ni){
                  setNotes(prev=>{
                    const arr=[...prev];
                    const [moved]=arr.splice(from,1);
                    arr.splice(ni,0,moved);
                    return arr;
                  });
                  if(editingIdx===from) setEditingIdx(ni);
                  else if(editingIdx===ni) setEditingIdx(from);
                }
                draggingIdx.current=null; setDragOver(null);
              }}
              onDragEnd={()=>{ draggingIdx.current=null; setDragOver(null); }}>

              {isDragTgt && (
                <div style={{width:"3px",alignSelf:"stretch",marginRight:"6px",borderRadius:"2px",flexShrink:0,
                  background:"rgba(255,110,180,0.85)",
                  boxShadow:"0 0 8px rgba(255,110,180,0.7),0 0 16px rgba(255,110,180,0.35)"}}/>
              )}

              <div
                onClick={()=>openCard(ni)}
                style={{
                  ...darkCard(gStage.color),
                  borderRadius:"2px",padding:"10px 12px",
                  width:"130px",minHeight:"80px",
                  boxShadow: isEditing
                    ? `0 0 0 2px #fff, 0 0 0 4px ${gStage.color}99, 0 8px 24px rgba(0,0,0,0.55)`
                    : `0 0 0 1px ${gStage.color}44, 0 8px 24px rgba(0,0,0,0.55)`,
                  transform:`rotate(${rot}deg)`,
                  cursor:"pointer",fontFamily:T.body,fontSize:T.t1,
                  color: note.done ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.8)",
                  lineHeight:1.4,userSelect:"none",position:"relative",
                  textDecoration: note.done ? "line-through" : "none",
                  transition:"box-shadow 0.15s, opacity 0.15s",
                  opacity: ejecting ? 0 : 1,
                }}>
                <div style={{position:"absolute",inset:0,borderRadius:"2px",pointerEvents:"none",
                  background:`radial-gradient(ellipse 80% 70% at 50% 40%, ${gStage.color}18 0%, transparent 65%)`}}/>
                <div style={{position:"absolute",inset:0,borderRadius:"2px",pointerEvents:"none",
                  boxShadow:"inset 0 0 0 1px rgba(255,255,255,0.06),inset 0 1px 0 rgba(255,255,255,0.12)"}}/>
                {/* ✓ done — top-left */}
                <button onClick={e=>{e.stopPropagation();toggleCardDone(ni);}}
                  style={{position:"absolute",top:"-6px",left:"-6px",width:"16px",height:"16px",
                    borderRadius:"50%",
                    background: note.done ? "rgba(95,224,192,0.85)" : "rgba(14,12,26,0.9)",
                    border:`1px solid ${note.done ? "rgba(95,224,192,0.8)" : "rgba(255,255,255,0.12)"}`,
                    color: note.done ? "#fff" : "rgba(255,255,255,0.28)",
                    fontSize:T.t3,cursor:"pointer",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    padding:0,lineHeight:1,zIndex:2,transition:"background 0.15s,border-color 0.15s"}}
                  title={note.done ? "Mark undone" : "Mark done"}>
                  ✓
                </button>
                {/* ✕ remove — top-right */}
                <button onClick={e=>{e.stopPropagation();removeCard(ni);}}
                  style={{position:"absolute",top:"-6px",right:"-6px",width:"16px",height:"16px",
                    borderRadius:"50%",background:"rgba(14,12,26,0.9)",border:"1px solid rgba(255,255,255,0.15)",
                    color:"rgba(255,255,255,0.5)",fontSize:T.t2,cursor:"pointer",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    padding:0,lineHeight:1,zIndex:2,transition:"background 0.1s,color 0.1s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,92,92,0.7)";e.currentTarget.style.color="#fff";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(14,12,26,0.9)";e.currentTarget.style.color="rgba(255,255,255,0.5)";}}>
                  ✕
                </button>
                <div style={{display:"flex",alignItems:"center",gap:"5px",marginBottom:"6px",position:"relative"}}>
                  <span style={{fontSize:T.t1,lineHeight:1}}>{gStage.icon}</span>
                  <span style={{fontFamily:T.body,fontSize:T.t4,letterSpacing:"1.4px",textTransform:"uppercase",
                    color:gStage.color,fontWeight:700}}>{gStage.label}</span>
                </div>
                <div style={{position:"relative",fontFamily:T.body,fontSize:T.t1,fontWeight:500,
                  overflow:"hidden",display:"-webkit-box",WebkitLineClamp:3,
                  WebkitBoxOrient:"vertical"}}>{note.text}</div>
              </div>
            </div>
          );
        })}

        {/* + new note chip */}
        <div
          onClick={()=>{
            flushCurrent();
            setText(""); setStage("discovery"); setPriority(""); setDone(false);
            setEditingIdx(null);
            setTimeout(()=>inputRef.current?.focus(),0);
          }}
          style={{
            width:"130px",minHeight:"80px",borderRadius:"2px",
            border:"1.5px dashed rgba(255,255,255,0.12)",
            background:"rgba(255,255,255,0.02)",
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            gap:"6px",cursor:"pointer",transition:"border-color 0.15s, background 0.15s",
          }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.28)";e.currentTarget.style.background="rgba(255,255,255,0.04)";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.12)";e.currentTarget.style.background="rgba(255,255,255,0.02)";}}>
          <span style={{fontFamily:T.display,fontSize:"22px",lineHeight:1,color:"rgba(255,255,255,0.25)"}}>+</span>
          <span style={{fontFamily:T.display,fontSize:T.t3,letterSpacing:"1.5px",textTransform:"uppercase",
            color:"rgba(255,255,255,0.2)"}}>NEW NOTE</span>
        </div>
      </div>

      {/* Active editor card */}
      <div onClick={e=>e.stopPropagation()}
        className="anim-card-up"
        style={{position:"relative",width:"min(420px,94vw)",marginBottom:"12px"}}>
        <div style={{
          position:"relative",...darkCard(auraColor),borderRadius:"2px",
          padding:"20px 22px 18px",
          boxShadow:`0 0 0 1px ${auraColor}55, 0 0 40px ${auraColor}22, 0 40px 80px rgba(0,0,0,0.7)`,
          transition:"background-image 0.22s,box-shadow 0.22s,border-color 0.22s",
          fontFamily:T.body,overflow:"hidden",
        }}>
          <div style={{position:"absolute",inset:0,pointerEvents:"none",borderRadius:"2px",
            boxShadow:"inset 0 0 0 1px rgba(255,255,255,0.08),inset 0 1px 0 rgba(255,255,255,0.18)"}}/>
          <div style={{position:"absolute",top:"-16px",left:"-16px",width:"56px",height:"56px",
            background:"radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 65%)",
            pointerEvents:"none",borderRadius:"50%"}}/>

          {/* Stage header: icon + label + priority (no X) */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"14px"}}>
            <button onClick={()=>setTagsOpen(o=>!o)}
              style={{display:"flex",alignItems:"center",gap:"8px",
                background:"transparent",border:"none",cursor:"pointer",padding:"0",
                transition:"opacity 0.12s"}}
              title="Tap to change stage">
              <span style={{fontSize:"15px",lineHeight:1}}>{activeStage.icon}</span>
              <span style={{fontFamily:T.body,fontWeight:700,fontStyle:"normal",fontSize:T.t2,
                color:auraColor,letterSpacing:"2px",lineHeight:1,textTransform:"uppercase",
                textShadow:`0 0 12px ${auraColor}55`}}>
                {activeStage.label}
              </span>
              <span style={{fontSize:T.t4,color:`${auraColor}66`,marginLeft:"2px",lineHeight:1}}>
                {tagsOpen ? "▲" : "▼"}
              </span>
            </button>
            <button onClick={()=>setPriority(p=>p==="High"?"":"High")}
              style={{
                background:priority==="High"?`${auraColor}22`:"transparent",
                border:priority==="High"?`1px solid ${auraColor}88`:"1px solid rgba(255,255,255,0.1)",
                borderRadius:"0",padding:"3px 10px",cursor:"pointer",
                fontFamily:T.display,fontSize:T.t3,
                color:priority==="High"?auraColor:"rgba(255,255,255,0.25)",
                letterSpacing:"1.5px",transition:"all 0.12s",whiteSpace:"nowrap",
              }}>
              {priority==="High"?"★ HIGH":"☆ PRIORITY"}
            </button>
          </div>

          {/* Stage tags — collapsed, tap header label to expand (above textarea) */}
          {tagsOpen && (
            <div className="anim-tags" style={{display:"flex",gap:"5px",flexWrap:"wrap",marginBottom:"12px"}}>
              {STAGES.map(s=>(
                <StageTag key={s.id} stage={s} isActive={stage===s.id}
                  onClick={()=>{ setStage(s.id); setTagsOpen(false); }}/>
              ))}
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={inputRef}
            value={text}
            onChange={e=>setText(e.target.value)}
            onKeyDown={handleKey}
            onBlur={()=>{ if(text.trim()) { flushCurrent(); } }}
            placeholder="What needs to get done?"
            rows={2}
            style={{
              width:"100%",background:"rgba(255,255,255,0.05)",
              border:`1px solid ${auraColor}33`,borderRadius:"0",
              padding:"10px 12px",fontFamily:T.body,fontSize:"13px",
              resize:"none",outline:"none",boxSizing:"border-box",
              color:"rgba(255,255,255,0.92)",fontWeight:500,lineHeight:1.6,
              caretColor:auraColor,transition:"border-color 0.2s",
              boxShadow:`inset 0 0 0 1px rgba(255,255,255,0.04),0 0 12px ${auraColor}11`,
              marginBottom:"14px",
            }}/>

          {/* Done + Delete — full-width pair, purple outline */}
          {editingIdx!==null && (
            <CompleteDeletePair done={done} auraColor={auraColor}
              onComplete={()=>toggleCardDone(editingIdx)}
              onDelete={()=>removeCard(editingIdx)}/>
          )}
        </div>
      </div>

      {/* ── SAVE button ── */}
      <div onClick={e=>e.stopPropagation()} className="anim-fade-up"
        style={{width:"min(420px,94vw)",animationDelay:"0.12s"}}>
        <CTAButton color={auraColor} onClick={saveAndClose}>SAVE</CTAButton>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEADLINE MODAL
// ─────────────────────────────────────────────────────────────────────────────
function DeadlineModal({ dateLabel, existing, onSave, onRemove, onClose }) {
  const [text, setText] = useState(existing?.label||"");
  const ref = useRef();
  useEffect(()=>{ ref.current?.focus(); },[]);
  return (
    <ModalShell onClose={onClose} accentColor="#FF5C5C" width="min(340px,92vw)" tilt={-0.8}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"baseline",gap:"10px",marginBottom:"20px"}}>
          <div style={{fontFamily:T.display,fontSize:T.t2,color:"#FF5C5C",
            letterSpacing:"2px",textTransform:"uppercase"}}>HARD DEADLINE</div>
          <div style={{fontFamily:T.body,fontSize:T.t3,color:"rgba(255,92,92,0.5)",
            letterSpacing:"0.5px"}}>{dateLabel}</div>
        </div>
        {/* Input */}
        <input ref={ref} value={text} onChange={e=>setText(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter")onSave(text);if(e.key==="Escape")onClose();}}
          placeholder="What's due?"
          style={{width:"100%",border:"none",borderBottom:"1.5px solid rgba(255,92,92,0.4)",
            padding:"8px 0",fontFamily:T.body,fontSize:T.t1,outline:"none",
            background:"transparent",color:"rgba(255,255,255,0.9)",caretColor:"#FF5C5C",
            marginBottom:"22px",boxSizing:"border-box",letterSpacing:"0.3px"}}/>
        {/* Actions */}
        <div style={{display:"flex",gap:"8px"}}>
          <CTAButton color="#FF5C5C" onClick={()=>onSave(text)}>SET IT</CTAButton>
          {existing && (
            <button onClick={onRemove}
              style={{padding:"11px 14px",background:"transparent",
                border:"1.5px solid rgba(255,255,255,0.08)",borderRadius:"0",
                fontFamily:T.body,fontSize:T.t2,cursor:"pointer",
                color:"rgba(255,255,255,0.28)",letterSpacing:"0.5px"}}>
              REMOVE
            </button>
          )}
          <button onClick={onClose}
            style={{padding:"11px 14px",background:"transparent",border:"none",
              cursor:"pointer",color:"rgba(255,255,255,0.2)",fontFamily:T.display,
              fontSize:T.t2,letterSpacing:"1px"}}>
            ESC
          </button>
        </div>
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE PACK MODAL
// ─────────────────────────────────────────────────────────────────────────────
function TemplateModal({ onAdd, onClose }) {
  return (
    <ModalShell onClose={onClose} width="min(540px,96vw)" style={{maxHeight:"85vh",overflowY:"auto"}}>
        <div style={{fontFamily:T.display,fontSize:"20px",
          letterSpacing:"-0.3px",color:"#fff",marginBottom:"4px"}}>TEMPLATE PACKS</div>
        <div style={{fontSize:T.t1,color:"rgba(255,255,255,0.3)",fontFamily:T.body,
          marginBottom:"20px"}}>Add a full pack of sticky notes to your inbox at once</div>
        <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
          {TEMPLATE_PACKS.map(pack=>{
            return (
              <div key={pack.id}
                style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",
                  borderRadius:"0",padding:"16px",cursor:"pointer"}}
                onClick={()=>onAdd(pack)}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"10px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                    <span style={{fontSize:"18px"}}>{pack.icon}</span>
                    <span style={{fontFamily:T.display,fontSize:"14px",color:"#fff"}}>{pack.name}</span>
                    <span style={{fontSize:T.t1,color:"rgba(255,255,255,0.3)",fontFamily:T.body}}>{pack.desc}</span>
                  </div>
                  <button style={{background:"rgba(255,229,102,0.1)",
                    border:"1px solid rgba(255,229,102,0.3)",color:"#FFE566",borderRadius:"0",
                    padding:"4px 12px",fontFamily:T.display,
                    fontSize:T.t1,cursor:"pointer",whiteSpace:"nowrap",letterSpacing:"0.5px"}}>
                    + ADD
                  </button>
                </div>
                {/* preview mini stickies — same StickyNote component as inbox */}
                <div style={{display:"flex",gap:"10px",flexWrap:"wrap",paddingTop:"4px"}}>
                  {pack.items.map((item,i)=>{
                    const st=STAGES.find(s=>s.id===item.stage)||STAGES[0];
                    const seed=item.text.charCodeAt(0)||65;
                    const rot=((seed*i)%9-4)*0.8;
                    return (
                      <div key={i} style={{transform:`rotate(${rot}deg)`,flexShrink:0,width:"100px"}}>
                        <StickyNote
                          id={`tpl-${pack.id}-${i}`}
                          text={item.text}
                          color={st.color}
                          stage={item.stage}
                          priority={item.priority||""}
                          tilt={0}
                          size="sm"
                          showStage
                          draggable={false}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={onClose} style={{marginTop:"16px",background:"transparent",
          border:"1px solid rgba(255,255,255,0.08)",borderRadius:"0",padding:"10px",
          color:"rgba(255,255,255,0.35)",cursor:"pointer",fontFamily:T.body,
          fontSize:T.t1,width:"100%"}}>close</button>
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
export default function StudioWall() {
  const [year,  setYear]  = useState(TODAY.getFullYear());
  const [month, setMonth] = useState(TODAY.getMonth());
  const [view,  setView]  = useState("month");

  const { notes, deadlines, inbox, setNotes, setDeadlines, setInbox, loaded: sbLoaded } = useSupabaseSync(INIT_NOTES, INIT_INBOX);

  const [dlModal,       setDlModal]       = useState(null);
  const [noteModal,     setNoteModal]     = useState(null);
  const [noteText,      setNoteText]      = useState(""); // seed for StickyComposer initialText
  const [showTemplates,  setShowTemplates]  = useState(false);
  const [inboxModal,    setInboxModal]    = useState(false);
  const [editInboxItem, setEditInboxItem] = useState(null); // {item}
  const [hovDay,        setHovDay]        = useState(null);
  const [hovInbox,      setHovInbox]      = useState(false);
  const [expandedDay,   setExpandedDay]   = useState(null); // {key, noteIdx}
  const [backupModal,   setBackupModal]   = useState(null);
  const [importText,    setImportText]    = useState("");
  const [copyLabel,     setCopyLabel]     = useState("COPY");

  // Selection state — tap-to-select, tap-day-to-place (works on mobile)
  const [sel, setSel] = useState(null);

  // Desktop HTML5 drag
  const dragging            = useRef(null);
  const inboxDragEnterCount = useRef(0);
  const [dragOver,      setDragOver]      = useState(null);
  const [inboxDragOver,      setInboxDragOver]      = useState(false);
  const [calReorderTarget,   setCalReorderTarget]   = useState(null);
  const [inboxReorderTarget, setInboxReorderTarget] = useState(null);
  const [inboxDraggingId,    setInboxDraggingId]    = useState(null);

  useEffect(()=>{ save(LS.notes, notes);     },[notes]);
  useEffect(()=>{ save(LS.dl,    deadlines); },[deadlines]);
  useEffect(()=>{ save(LS.inbox, inbox);     },[inbox]);

  // Auto-roll yesterday's undone notes → today
  useEffect(()=>{
    const yd=new Date(TODAY); yd.setDate(yd.getDate()-1);
    const yk=dKey(yd.getFullYear(),yd.getMonth(),yd.getDate());
    setNotes(prev=>{
      const yn=(prev[yk]||[]).filter(n=>!n.done); if(!yn.length) return prev;
      const tn=prev[TODAY_K]||[]; const ex=new Set(tn.map(n=>n.text));
      const mv=yn.filter(n=>!ex.has(n.text)); if(!mv.length) return prev;
      return {...prev,[yk]:(prev[yk]||[]).filter(n=>n.done),[TODAY_K]:[...tn,...mv.map(n=>({...n,id:uid()}))]};
    });
  },[]);

  // ── Drop ─────────────────────────────────────────────────────────────────
  function dropToInbox(info) {
    if (!info) return;
    const data = info.data;
    // Move calendar note → inbox
    setNotes(p=>({...p,[data.fromDate]:(p[data.fromDate]||[]).filter(n=>n.id!==data.id)}));
    const st = STAGES.find(s=>s.id===data.stage)||STAGES[0];
    setInbox(p=>[...p,{id:uid(),text:data.text,stage:data.stage||"discovery",priority:""}]);
    setSel(null);
  }

  function drop(toKey, info) {
    if (!info||!toKey) return;
    if (info.type==="inbox") {
      const st=STAGES.find(s=>s.id===info.data.stage)||STAGES[0];
      setNotes(p=>({...p,[toKey]:[...(p[toKey]||[]),
        {id:uid(), text:info.data.text, color:st.color, done:false, stage:info.data.stage}
      ]}));
      // Remove from inbox — it's been scheduled
      setInbox(p=>p.filter(x=>x.id!==info.data.id));
    } else if (info.type==="noteReorder") {
      // Reorder within same day
      const { fromDate, fromIndex, toIndex } = info.data;
      if (fromIndex !== toIndex) {
        setNotes(p=>{
          const arr=[...(p[fromDate]||[])];
          const [moved]=arr.splice(fromIndex,1);
          arr.splice(toIndex,0,moved);
          return {...p,[fromDate]:arr};
        });
      }
    } else if (info.type==="note" && info.data.fromDate!==toKey) {
      setNotes(p=>{
        const fn=p[info.data.fromDate]||[];
        const note=fn.find(n=>n.id===info.data.id);
        if(!note) return p;
        return {...p,
          [info.data.fromDate]:fn.filter(n=>n.id!==info.data.id),
          [toKey]:[...(p[toKey]||[]),{...note,id:uid()}]
        };
      });
    }
    setSel(null);
  }

  // Desktop HTML5 drag
  function dStart(info) { dragging.current=info; }
  function dEnd()       { dragging.current=null; setDragOver(null); setInboxDragOver(false); }
  function dEnter(e,key){
    e.preventDefault();
    const t=dragging.current?.type;
    if(t==="note"||t==="inbox") setDragOver(key);
  }
  function dOver(e,key) { e.preventDefault(); } // just keep drop alive, no state
  function dLeave(e)    {
    // Only clear when truly leaving the cell (not moving to a child)
    if(!e.currentTarget.contains(e.relatedTarget)) {
      setDragOver(null); setCalReorderTarget(null);
    }
  }
  function dDrop(key,e) {
    if(e) e.stopPropagation();
    setDragOver(null); setCalReorderTarget(null);
    if(!dragging.current) return;
    // Only fires on empty cells (notes have their own onDrop + stopPropagation)
    drop(key, dragging.current);
    dragging.current=null;
  }

  // Modals
  function openNew(dk) {
    setNoteModal({date:dk,isNew:true,done:false,stage:"discovery"});
    setNoteText("");
  }
  function openEdit(dk,note) {
    setNoteModal({date:dk,noteId:note.id,isNew:false,done:note.done,stage:note.stage||"discovery"});
    setNoteText(note.text);
  }
  // saveNote / delNote now inlined in StickyComposer onSaveDone / onDelete
  function toggleDone(dk,id) {
    setNotes(p=>({...p,[dk]:(p[dk]||[]).map(n=>n.id===id?{...n,done:!n.done}:n)}));
  }

  function saveDl(text) {
    if(!text.trim()){setDeadlines(p=>{const n={...p};delete n[dlModal.key];return n;});}
    else setDeadlines(p=>({...p,[dlModal.key]:{label:text.trim()}}));
    setDlModal(null);
  }
  function removeDl() { setDeadlines(p=>{const n={...p};delete n[dlModal.key];return n;}); setDlModal(null); }
  function fmtDate(k) { const [y,m,d]=k.split("-").map(Number); return `${MONTHS[m-1]} ${d}, ${y}`; }

  const daysInMonth = getDIM(year,month);
  const firstDay    = getFirst(year,month);
  const isSelecting = !!sel;

  // ── Day cell renderer ─────────────────────────────────────────────────────
  function renderDay(key) {
    const isToday    = key===TODAY_K;
    const dl         = deadlines[key];
    const dayNotes   = notes[key]||[];
    const isDragOver = dragOver===key;
    const isHov      = hovDay===key;

    return (
      <div
        data-daykey={key}
        onMouseEnter={()=>setHovDay(key)}
        onMouseLeave={()=>setHovDay(null)}
        onDragEnter={e=>dEnter(e,key)}
        onDragOver={e=>dOver(e,key)}
        onDragLeave={e=>dLeave(e)}
        onDrop={e=>dDrop(key,e)}
        onContextMenu={e=>{e.preventDefault();setDlModal({key});}}
        onClick={()=>{ if(isSelecting) drop(key,sel); }}
        style={{
          minHeight:"100px",
          height:"100%",
          flex:1,
          padding:"5px 4px 6px",
          position:"relative",
          background: isDragOver
            ? "rgba(255,110,180,0.12)"
            : isToday
            ? "rgba(255,229,102,0.05)"
            : "rgba(14,12,26,0.92)",
          border: isDragOver
            ? "2px solid #FF6EB4"
            : isSelecting
            ? "2px dashed rgba(255,110,180,0.38)"
            : isToday
            ? "1px solid rgba(255,229,102,0.16)"
            : "1px solid rgba(255,255,255,0.042)",
          borderRadius:"0",
          cursor: isSelecting ? "cell" : "default",
          transition:"background 0.1s, border 0.1s",
        }}
      >
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"4px",overflow:"visible"}}>
          <span style={{fontFamily:T.display,fontSize:isToday?T.t1:"10px",
            color:isToday?"#FFE566":"rgba(255,255,255,0.2)",letterSpacing:"-0.2px",
            lineHeight:1.4, display:"block"}}>
            {isToday && "● "}{parseInt(key.split("-")[2])}
          </span>
          {dl ? (
            <button onClick={e=>{e.stopPropagation();setDlModal({key});}}
              style={{background:"rgba(255,92,92,0.16)",border:"2px solid #FF5C5C",borderRadius:"0",
                width:"18px",height:"18px",cursor:"pointer",display:"flex",alignItems:"center",
                justifyContent:"center",color:"#FF5C5C",fontSize:T.t2,fontWeight:900,padding:0,flexShrink:0}}>!</button>
          ) : isHov ? (
            <button onClick={e=>{e.stopPropagation();setDlModal({key});}}
              style={{background:"transparent",border:"1px dashed rgba(255,92,92,0.22)",borderRadius:"0",
                width:"16px",height:"16px",cursor:"pointer",display:"flex",alignItems:"center",
                justifyContent:"center",color:"rgba(255,92,92,0.28)",fontSize:T.t3,padding:0,flexShrink:0}}>○</button>
          ) : null}
        </div>

        {dl?.label && (
          <div onClick={e=>{e.stopPropagation();setDlModal({key});}}
            style={{borderLeft:"3px solid #FF5C5C",background:"rgba(255,92,92,0.08)",
              padding:"2px 5px",marginBottom:"4px",cursor:"pointer"}}>
            <span style={{fontSize:T.t3,color:"#FF8C5A",fontFamily:T.body,fontWeight:600}}>
              🔴 {dl.label}
            </span>
          </div>
        )}

        <div style={{display:"flex",flexDirection:"column",gap:"4px"}}>
          {dayNotes.map((note,ni)=>{
            const isSel = sel?.type==="note" && sel.data.id===note.id && sel.data.fromDate===key;
            const isReorderTarget = calReorderTarget?.date===key && calReorderTarget?.index===ni;
            return (
              <div key={note.id}
                style={{position:"relative"}}
                onDragOver={e=>{
                  e.preventDefault(); e.stopPropagation();
                  const t=dragging.current?.type;
                  const isMovable = (t==="note" && dragging.current.data.id!==note.id) || t==="inbox";
                  if(isMovable) setCalReorderTarget({date:key,index:ni});
                }}
                onDrop={e=>{
                  e.stopPropagation();
                  const d=dragging.current;
                  if(!d) return;
                  if(d.type==="note") {
                    if(d.data.id===note.id) return;
                    if(d.data.fromDate===key) {
                      drop(key,{type:"noteReorder",data:{fromDate:key,fromIndex:d.data.fromIndex,toIndex:ni}});
                    } else {
                      // Cross-day insert at ni
                      setNotes(p=>{
                        const srcNotes=(p[d.data.fromDate]||[]).filter(n=>n.id!==d.data.id);
                        const srcNote=(p[d.data.fromDate]||[]).find(n=>n.id===d.data.id);
                        if(!srcNote) return p;
                        const dest=[...(p[key]||[])];
                        dest.splice(ni,0,{...srcNote});
                        return {...p,[d.data.fromDate]:srcNotes,[key]:dest};
                      });
                      setSel(null);
                    }
                  } else if(d.type==="inbox") {
                    // Inbox → calendar: insert at ni
                    const st=STAGES.find(s=>s.id===d.data.stage)||STAGES[0];
                    setNotes(p=>{
                      const dest=[...(p[key]||[])];
                      dest.splice(ni,0,{id:uid(),text:d.data.text,color:st.color,done:false,stage:d.data.stage});
                      return {...p,[key]:dest};
                    });
                    setInbox(p=>p.filter(x=>x.id!==d.data.id));
                    setSel(null);
                  } else { return; }
                  dragging.current=null; setCalReorderTarget(null);
                }}>
                {isReorderTarget && (
                  <div style={{height:"2px",background:"rgba(255,110,180,0.7)",
                    borderRadius:"1px",marginBottom:"2px",
                    boxShadow:"0 0 6px rgba(255,110,180,0.5)"}}/>
                )}
                <StickyNote
                  id={note.id}
                  text={note.text}
                  color={note.color}
                  done={note.done}
                  stage={note.stage}
                  tilt={stickyTilt(note.id,ni)}
                  size="sm"
                  selected={isSel}
                  draggable
                  onDragStart={e=>{
                    e.stopPropagation();
                    // Always emit "note" with fromIndex — drop target decides reorder vs move
                    dStart({type:"note",data:{id:note.id,fromDate:key,fromIndex:ni,text:note.text,color:note.color,stage:note.stage}});
                  }}
                  onDragEnd={e=>{e.stopPropagation();dEnd();setCalReorderTarget(null);}}
                  onClick={e=>{
                    e.stopPropagation();
                    if(isSelecting&&!isSel){ drop(key,sel); return; }
                    if(isSel){ setSel(null); return; }
                    setExpandedDay({key, noteIdx:ni});
                  }}
                />
              </div>
            );
          })}

          {/* Append-at-end drop target — shown below last note during any note drag */}
          {dragOver===key && (
            <div
              style={{
                minHeight:"20px",
                flex:1,
                position:"relative",
              }}
              onDragOver={e=>{
                e.preventDefault(); e.stopPropagation();
                const t=dragging.current?.type;
                if(t==="note"||t==="inbox")
                  setCalReorderTarget({date:key,index:dayNotes.length});
              }}
              onDrop={e=>{
                e.stopPropagation();
                const d=dragging.current;
                if(!d) return;
                if(d.type==="note") {
                  if(d.data.fromDate===key) {
                    drop(key,{type:"noteReorder",data:{fromDate:key,fromIndex:d.data.fromIndex,toIndex:dayNotes.length}});
                  } else {
                    setNotes(p=>{
                      const srcNotes=(p[d.data.fromDate]||[]).filter(n=>n.id!==d.data.id);
                      const srcNote=(p[d.data.fromDate]||[]).find(n=>n.id===d.data.id);
                      if(!srcNote) return p;
                      return {...p,[d.data.fromDate]:srcNotes,[key]:[...(p[key]||[]),{...srcNote}]};
                    });
                    setSel(null);
                  }
                } else if(d.type==="inbox") {
                  const st=STAGES.find(s=>s.id===d.data.stage)||STAGES[0];
                  setNotes(p=>({...p,[key]:[...(p[key]||[]),{id:uid(),text:d.data.text,color:st.color,done:false,stage:d.data.stage}]}));
                  setInbox(p=>p.filter(x=>x.id!==d.data.id));
                  setSel(null);
                } else { return; }
                dragging.current=null; setDragOver(null); setCalReorderTarget(null);
              }}>
              {calReorderTarget?.date===key && calReorderTarget?.index===dayNotes.length && (
                <div style={{
                  height:"2px",background:"rgba(255,110,180,0.7)",borderRadius:"1px",
                  boxShadow:"0 0 8px rgba(255,110,180,0.6)",
                  margin:"4px 0 0",
                }}/>
              )}
            </div>
          )}
        </div>

        {isHov&&!isSelecting&&(
          <button onClick={e=>{e.stopPropagation();setExpandedDay({key,noteIdx:"new"});}}
            className="add-note-btn"
            style={{marginTop:"4px",width:"100%",background:"rgba(255,255,255,0.03)",
              border:"1px dashed rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.22)",
              borderRadius:"0",fontFamily:T.body,fontSize:T.t2,
              padding:"2px 4px",cursor:"pointer",textAlign:"left",
              transition:"all 0.15s"}}>
            + note
          </button>
        )}
      </div>
    );
  }

  // ── LOADING ──────────────────────────────────────────────────────────────
  if(!sbLoaded || !notes || !deadlines || !inbox) return (
    <div style={{minHeight:"100vh",background:"#0e0e12",display:"flex",alignItems:"center",
      justifyContent:"center",fontFamily:"'Archivo Black',sans-serif",color:"rgba(255,255,255,0.3)",fontSize:14}}>
      Loading&hellip;
    </div>
  );

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{minHeight:"100vh",background:"#0e0e12",fontFamily:T.body,color:"#fff",overflowX:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Playfair+Display:ital,wght@0,400;0,500;0,700;0,900;1,400;1,700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{height:4px;width:4px;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);}

        body::before{
          content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
          background:
            radial-gradient(ellipse 60% 50% at 15% 15%, rgba(95,224,192,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 50% 60% at 85% 20%, rgba(168,126,250,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 55% 45% at 50% 88%, rgba(255,110,180,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 40% 50% at 78% 75%, rgba(92,200,255,0.05) 0%, transparent 65%);
        }

        /* ── Pills ── */
        .pill{
          background:rgba(255,255,255,0.06);
          border:1.5px solid rgba(255,255,255,0.09);
          color:rgba(255,255,255,0.68);
          border-radius:0;padding:6px 14px;cursor:pointer;
          font-family:'Archivo Black',sans-serif;font-size:9px;
          transition:background 0.18s, border-color 0.18s, color 0.18s, transform 0.12s;
          letter-spacing:1.5px;text-transform:uppercase;
        }
        .pill:hover{background:rgba(255,255,255,0.12); transform:translateY(-1px);}
        .pill:active{transform:translateY(0);}
        .pill.on{background:#FFE566;color:#0e0e12;border-color:#FFE566;}

        /* ── Day headers ── */
        .day-hdr{
          font-family:'Archivo Black',sans-serif;font-size:9px;letter-spacing:2.5px;
          color:rgba(255,255,255,0.17);text-align:center;padding:8px 0;
        }
        .day-hdr.wknd{color:rgba(255,229,102,0.28);}

        /* ── Selection banner ── */
        @keyframes holo{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        .sel-banner{
          background:linear-gradient(90deg,#A87EFA,#5CC8FF,#5FE0C0,#B8F240,#FFE566,#FF8C5A,#FF6EB4,#A87EFA);
          background-size:400% 100%;
          animation:holo 2.5s ease infinite;
          font-family:'Archivo Black',sans-serif;font-size:11px;letter-spacing:2px;
          padding:10px 16px;text-align:center;color:#000;
        }

        /* ── Keyframes ── */
        @keyframes overlayIn{
          from{opacity:0;}
          to{opacity:1;}
        }
        @keyframes cardUp{
          from{opacity:0; transform:translateY(18px) scale(0.97);}
          to{opacity:1; transform:translateY(0) scale(1);}
        }
        @keyframes cardUpSlight{
          from{opacity:0; transform:translateY(10px);}
          to{opacity:1; transform:translateY(0);}
        }
        @keyframes fanIn{
          from{opacity:0; transform:translateY(12px) scale(0.94);}
          to{opacity:1; transform:translateY(0) scale(1);}
        }
        @keyframes fadeSlideUp{
          from{opacity:0; transform:translateY(8px);}
          to{opacity:1; transform:translateY(0);}
        }
        @keyframes tagsOpen{
          from{opacity:0; transform:translateY(-6px);}
          to{opacity:1; transform:translateY(0);}
        }
        @keyframes modalIn{
          from{opacity:0; transform:scale(0.96) translateY(8px);}
          to{opacity:1; transform:scale(1) translateY(0);}
        }
        @keyframes noteIn{
          from{opacity:0; transform:scale(0.88) translateY(6px);}
          to{opacity:1; transform:scale(1) translateY(0);}
        }
        @keyframes pulse{
          0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,0.15);}
          50%{box-shadow:0 0 0 6px rgba(255,255,255,0);}
        }

        /* ── Motion utility classes ── */
        .anim-overlay{animation:overlayIn 0.22s ease both;}
        .anim-card-up{animation:cardUp 0.28s cubic-bezier(0.34,1.2,0.64,1) both;}
        .anim-card-slight{animation:cardUpSlight 0.22s ease both;}
        .anim-fade-up{animation:fadeSlideUp 0.22s ease both;}
        .anim-modal{animation:modalIn 0.24s cubic-bezier(0.34,1.2,0.64,1) both;}
        .anim-tags{animation:tagsOpen 0.16s ease both;}

        /* ── Note cards hover lift ── */
        .note-card{
          transition: transform 0.15s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.15s ease !important;
        }
        .note-card:hover{
          transform: translateY(-3px) rotate(var(--tilt,0deg)) scale(1.04) !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.18) inset !important;
          z-index: 10;
        }

        /* ── Inbox rail item hover ── */
        .inbox-item{
          transition: background 0.14s, border-color 0.14s, transform 0.14s !important;
        }
        .inbox-item:hover{ transform: translateX(3px) !important; }

        /* ── Stage tag buttons ── */
        .stage-tag{
          transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.15s, box-shadow 0.15s !important;
        }
        .stage-tag:hover{ transform: translateY(-1px) !important; }

        /* ── Action buttons inside card ── */
        .action-btn{
          transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.12s !important;
        }
        .action-btn:hover{ transform: scale(1.02) !important; }
        .action-btn:active{ transform: scale(0.97) !important; }

        /* ── Primary CTA (Save/Add) ── */
        .cta-btn{
          transition: box-shadow 0.2s, opacity 0.2s, transform 0.14s !important;
        }
        .cta-btn:hover{ transform: translateY(-2px) !important; }
        .cta-btn:active{ transform: translateY(0) scale(0.98) !important; }

        /* ── New-note chip pulse on hover ── */
        .new-note-chip:hover{ animation: pulse 1.2s ease infinite; }
        .add-note-btn:hover{ background:rgba(255,110,180,0.06)!important; border-color:rgba(255,110,180,0.3)!important; color:rgba(255,110,180,0.7)!important; }
        .inbox-add-btn:hover{ background:rgba(255,229,102,0.22)!important; border-color:rgba(255,229,102,0.7)!important; transform:translateY(-1px); }
        .inbox-rail-add:hover{ background:rgba(255,110,180,0.06)!important; border-color:rgba(255,110,180,0.6)!important; }
        .inbox-rail-add:hover span{ color:rgba(255,110,180,0.9)!important; }

        [draggable]{cursor:grab;}
        [draggable]:active{cursor:grabbing;}
      `}</style>

      {isSelecting && (
        <div className="sel-banner" style={{position:"fixed",top:0,left:0,right:0,zIndex:8500,
          display:"flex",alignItems:"center",justifyContent:"center",gap:"12px"}}>
          <span>✦ "{sel.data.text}" — tap a day to move</span>
          {sel.type==="note" && (
            <button onClick={()=>dropToInbox(sel)}
              style={{background:"rgba(0,0,0,0.2)",border:"none",borderRadius:"0",
                padding:"3px 10px",color:"#000",cursor:"pointer",
                fontFamily:T.body,fontSize:T.t1,fontWeight:700,
                letterSpacing:"0.5px"}}>
              → INBOX
            </button>
          )}
          <button onClick={()=>setSel(null)}
            style={{background:"rgba(0,0,0,0.15)",border:"none",padding:"3px 12px",
              color:"rgba(0,0,0,0.6)",cursor:"pointer",fontFamily:T.body,fontSize:T.t1}}>
            cancel
          </button>
        </div>
      )}

      {/* NAV */}
      <div style={{position:"relative",zIndex:10,background:"rgba(14,12,26,0.95)",
        borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"20px 28px 16px",
        backdropFilter:"blur(24px)"}}>

        {/* Row 1 — wordmark */}
        <div style={{marginBottom:"16px"}}>
          <div style={{
            fontFamily:T.body, fontSize:"clamp(32px,4.5vw,60px)",
            lineHeight:1.05, letterSpacing:"-1px", fontStyle:"italic", fontWeight:700,
            background:"linear-gradient(110deg,#A87EFA 0%,#5CC8FF 14%,#5FE0C0 28%,#B8F240 42%,#FFE566 57%,#FF8C5A 71%,#FF6EB4 85%,#A87EFA 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            overflow:"visible", paddingBottom:"4px",
          }}>Studio Wall</div>
        </div>

        {/* Row 2 — month nav left, view + today right */}
        <div style={{display:"flex",alignItems:"center",gap:"6px"}}>

          {/* Month title + nav arrows */}
          <button className="pill" style={{padding:"6px 10px"}} onClick={()=>{if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1);}}>‹</button>
          <span style={{fontFamily:T.body,fontWeight:700,fontSize:"22px",letterSpacing:"0.2px",
            color:"rgba(255,255,255,0.88)",minWidth:"150px"}}>{MONTHS[month]} {year}</span>
          <button className="pill" style={{padding:"6px 10px"}} onClick={()=>{if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1);}}>›</button>

          <div style={{flex:1}}/>

          {/* View toggle + Today */}
          <div style={{display:"flex",gap:"3px"}}>
            <button className={`pill${view==="month"?" on":""}`} onClick={()=>setView("month")}>Month</button>
            <button className={`pill${view==="week"?" on":""}`} onClick={()=>setView("week")}>Week</button>
          </div>
          <button className="pill" onClick={()=>{setYear(TODAY.getFullYear());setMonth(TODAY.getMonth());}}
            style={{marginLeft:"6px"}}>Today</button>
        </div>
      </div>

      {/* Export / Import — fixed bottom-right */}
      <div style={{position:"fixed",bottom:"20px",right:"20px",zIndex:200,display:"flex",gap:"6px"}}>
        <button className="pill" onClick={()=>setBackupModal("export")}
          style={{borderColor:"rgba(95,224,192,0.25)",color:"rgba(95,224,192,0.55)",
            background:"rgba(14,12,26,0.9)",backdropFilter:"blur(12px)"}}>↓ Export</button>
        <button className="pill" onClick={()=>{ setBackupModal("import"); setImportText(""); setCopyLabel("COPY"); }}
          style={{borderColor:"rgba(168,126,250,0.25)",color:"rgba(168,126,250,0.55)",
            background:"rgba(14,12,26,0.9)",backdropFilter:"blur(12px)"}}>↑ Import</button>
        <button className="pill" onClick={()=>supabase.auth.signOut()}
          style={{borderColor:"rgba(255,92,92,0.25)",color:"rgba(255,92,92,0.55)",
            background:"rgba(14,12,26,0.9)",backdropFilter:"blur(12px)"}}>Sign out</button>
      </div>

      {/* INBOX */}
      <div style={{position:"relative",zIndex:9,background:"rgba(14,12,26,0.8)",
        borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"12px 14px",
        backdropFilter:"blur(16px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"10px"}}>
          <div style={{fontFamily:T.display,fontSize:T.t1,letterSpacing:"3.5px",
            color:"rgba(255,255,255,0.3)"}}>INBOX</div>
          <div style={{flex:1,height:"1px",background:"rgba(255,255,255,0.06)"}}/>
          <button onClick={()=>setShowTemplates(true)}
            style={{background:"transparent",border:"1.5px solid rgba(255,255,255,0.09)",
              color:"rgba(255,255,255,0.35)",borderRadius:"0",padding:"5px 12px",
              fontFamily:T.display,fontSize:T.t2,letterSpacing:"1.5px",cursor:"pointer",flexShrink:0,transition:"all 0.15s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.2)";e.currentTarget.style.color="rgba(255,255,255,0.6)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.09)";e.currentTarget.style.color="rgba(255,255,255,0.35)";}}>
            📦 PACKS
          </button>
        </div>

        {/* Horizontal sticky note rail — reorderable + calendar-drop target */}
        <div
          onDragEnter={e=>{
            inboxDragEnterCount.current++;
            const t=dragging.current?.type;
            if(t==="note"||t==="inbox") setInboxDragOver(true);
          }}
          onDragOver={e=>{ e.preventDefault(); }}
          onDragLeave={e=>{
            inboxDragEnterCount.current--;
            if(inboxDragEnterCount.current<=0){
              inboxDragEnterCount.current=0;
              setInboxDragOver(false);
              setInboxReorderTarget(null);
            }
          }}
          onDrop={e=>{
            inboxDragEnterCount.current=0;
            setInboxDragOver(false);
            const d=dragging.current;
            if(!d) return;
            // Only fires on empty rail space — items stopPropagation their own drops
            if(d.type==="note"){
              dropToInbox(d);
              dragging.current=null;
              setInboxReorderTarget(null);
            }
          }}
          style={{display:"flex",gap:"12px",overflowX:"auto",paddingBottom:"10px",paddingTop:"6px",
            WebkitOverflowScrolling:"touch",alignItems:"flex-start",minHeight:"80px",
            border: inboxDragOver ? "2px solid #FF6EB4" : "2px solid transparent",
            borderRadius:"0",transition:"border 0.1s, background 0.1s",
            cursor: "default",
            background: inboxDragOver ? "rgba(255,110,180,0.06)" : "transparent"}}
          onMouseEnter={()=>setHovInbox(true)}
          onMouseLeave={()=>setHovInbox(false)}
          onClick={()=>setInboxModal(true)}>
          {inbox.length===0 && (
            <div onClick={()=>setInboxModal(true)} style={{cursor:"pointer",color: hovInbox ? "rgba(255,110,180,0.6)" : "rgba(255,255,255,0.14)",
              fontSize:T.t1,padding:"14px 0",fontFamily: hovInbox ? T.display : T.body,
              fontStyle: hovInbox ? "normal" : "italic",
              letterSpacing: hovInbox ? "2px" : "0",
              textTransform: hovInbox ? "uppercase" : "none",
              transition:"all 0.15s"}}>
              {hovInbox ? "+ NOTE" : "inbox empty — add a pack or a note"}
            </div>
          )}
          {inbox.map((item,i)=>{
            const st    = STAGES.find(s=>s.id===item.stage)||STAGES[0];
            const isInboxDragTarget = inboxReorderTarget===item.id;
            return (
              <div key={item.id}
                style={{flexShrink:0,position:"relative",display:"flex",alignItems:"stretch",
                  opacity: inboxDraggingId===item.id ? 0.35 : 1,
                  transition:"opacity 0.12s",
                }}
                onDragOver={e=>{
                  e.preventDefault(); e.stopPropagation();
                  const t=dragging.current?.type;
                  const fromId=dragging.current?.data?.id;
                  if(t==="inbox" && fromId!==item.id) setInboxReorderTarget(item.id);
                  if(t==="note") setInboxReorderTarget(item.id);
                }}
                onDrop={e=>{
                  e.stopPropagation();
                  const d=dragging.current;
                  if(!d) return;
                  if(d.type==="inbox") {
                    // Inbox reorder: move to before this item
                    const fromId=d.data.id;
                    if(fromId!==item.id){
                      setInbox(prev=>{
                        const arr=[...prev];
                        const fi=arr.findIndex(x=>x.id===fromId);
                        const ti=arr.findIndex(x=>x.id===item.id);
                        if(fi===-1||ti===-1) return prev;
                        const [moved]=arr.splice(fi,1);
                        arr.splice(ti,0,moved);
                        return arr;
                      });
                    }
                  } else if(d.type==="note") {
                    // Calendar note → inbox: insert before this item
                    const newItem={id:uid(),text:d.data.text,stage:d.data.stage||"discovery",priority:""};
                    setNotes(p=>({...p,[d.data.fromDate]:(p[d.data.fromDate]||[]).filter(n=>n.id!==d.data.id)}));
                    setInbox(prev=>{
                      const arr=[...prev];
                      const ti=arr.findIndex(x=>x.id===item.id);
                      arr.splice(ti<0?arr.length:ti,0,newItem);
                      return arr;
                    });
                    setSel(null);
                  } else { return; }
                  dragging.current=null;
                  inboxDragEnterCount.current=0;
                  setInboxDragOver(false);
                  setInboxReorderTarget(null);
                  setInboxDraggingId(null);
                }}>
                {/* Vertical pink insert line — shown to LEFT of this item when it's the drop target */}
                {isInboxDragTarget && (
                  <div style={{
                    width:"3px", alignSelf:"stretch",
                    marginRight:"6px", borderRadius:"2px",
                    background:"rgba(255,110,180,0.85)",
                    boxShadow:"0 0 8px rgba(255,110,180,0.7), 0 0 16px rgba(255,110,180,0.35)",
                    flexShrink:0,
                  }}/>
                )}
                <StickyNote
                  id={item.id}
                  text={item.text||"(empty)"}
                  color={st.color}
                  stage={item.stage}
                  priority={item.priority}
                  tilt={stickyTilt(item.id, i)}
                  size="md"
                  selected={false}
                  showStage
                  draggable
                  onDragStart={e=>{
                    e.stopPropagation();
                    dStart({type:"inbox", data:{...item, color:st.color, id:item.id}});
                    setInboxDraggingId(item.id);
                    setInboxDragOver(false);
                  }}
                  onDragEnd={e=>{
                    e.stopPropagation();
                    dEnd();
                    setInboxReorderTarget(null);
                    setInboxDraggingId(null);
                  }}
                  onClick={()=>{ setEditInboxItem(item); }}
                />
                {/* ✕ remove */}
                <button
                  onClick={e=>{e.stopPropagation();setInbox(p=>p.filter(x=>x.id!==item.id));}}
                  style={{position:"absolute",top:"-6px",right:"-6px",
                    background:"rgba(14,12,26,0.85)",border:"1px solid rgba(255,255,255,0.1)",
                    borderRadius:"50%",width:"16px",height:"16px",
                    color:"rgba(255,255,255,0.4)",cursor:"pointer",fontSize:T.t2,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    padding:0,lineHeight:1,zIndex:2}}>
                  ✕
                </button>

              </div>
            );
          })}
          {/* Hover + note chip at end of rail — matches sticky note size */}
          {hovInbox && !inboxDragOver && (
            <button onClick={e=>{e.stopPropagation();setInboxModal(true);}}
              style={{flexShrink:0,width:"80px",minHeight:"56px",alignSelf:"flex-start",
                background:"transparent",border:"1px dashed rgba(255,255,255,0.12)",
                borderRadius:"2px",cursor:"pointer",display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center",gap:"5px",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.28)";e.currentTarget.style.background="rgba(255,255,255,0.03)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.12)";e.currentTarget.style.background="transparent";}}>
              <span style={{fontFamily:T.body,fontWeight:700,fontSize:"18px",color:"rgba(255,255,255,0.22)"}}>+</span>
              <span style={{fontFamily:T.display,fontSize:T.t3,letterSpacing:"1.5px",color:"rgba(255,255,255,0.18)",textTransform:"uppercase"}}>note</span>
            </button>
          )}
          {/* Append-at-end slot — visible when dragging a calendar note over the inbox */}
          {inboxDragOver && dragging.current?.type==="note" && (
            <div
              style={{flexShrink:0,display:"flex",alignItems:"stretch",alignSelf:"stretch",minWidth:"20px",paddingRight:"4px"}}
              onDragOver={e=>{ e.preventDefault(); e.stopPropagation(); setInboxReorderTarget("__end__"); }}
              onDrop={e=>{
                e.stopPropagation();
                const d=dragging.current;
                if(d?.type==="note"){
                  dropToInbox(d);
                  dragging.current=null;
                  setInboxReorderTarget(null);
                  inboxDragEnterCount.current=0;
                  setInboxDragOver(false);
                }
              }}>
              {inboxReorderTarget==="__end__" && (
                <div style={{
                  width:"3px",alignSelf:"stretch",borderRadius:"2px",
                  background:"rgba(255,110,180,0.85)",
                  boxShadow:"0 0 8px rgba(255,110,180,0.7), 0 0 16px rgba(255,110,180,0.35)",
                }}/>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CALENDAR */}
      <div style={{position:"relative",zIndex:5,padding:"10px 8px"}}>
        {view==="month" && (
          <div style={{border:"1px solid rgba(255,255,255,0.06)"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",background:"rgba(0,0,0,0.42)"}}>
              {DAYS_S.map(d=><div key={d} className={`day-hdr${d==="SUN"||d==="SAT"?" wknd":""}`}>{d}</div>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gridAutoRows:"auto",gap:"1px",background:"rgba(255,255,255,0.04)"}}>
              {Array.from({length:firstDay}).map((_,i)=>(
                <div key={`e${i}`} style={{background:"rgba(0,0,0,0.22)",minHeight:"100px",height:"100%"}}/>
              ))}
              {Array.from({length:daysInMonth}).map((_,i)=>{
                const key=dKey(year,month,i+1);
                return <div key={key} style={{height:"100%",display:"flex",flexDirection:"column"}}>{renderDay(key)}</div>;
              })}
            </div>
          </div>
        )}

        {view==="week" && (
          <WeekView notes={notes} deadlines={deadlines} dragOver={dragOver}
            hovDay={hovDay} setHovDay={setHovDay}
            onDragEnter={dEnter} onDragOver={dOver} onDragLeave={dLeave} onDrop={dDrop}
            renderDay={renderDay}/>
        )}

      </div>

      {/* MODALS */}
      {dlModal && (
        <DeadlineModal dateLabel={fmtDate(dlModal.key)} existing={deadlines[dlModal.key]}
          onSave={saveDl} onRemove={removeDl} onClose={()=>setDlModal(null)}/>
      )}
      {noteModal && noteModal.isNew && (
        <StickyComposer
          mode="edit"
          initialText=""
          initialStage="discovery"
          initialDone={false}
          onSaveDone={({text,stage,color})=>{
            setNotes(p=>{
              const dn=p[noteModal.date]||[];
              return {...p,[noteModal.date]:[...dn,{id:uid(),text,color,stage,done:false}]};
            });
            setNoteModal(null);
          }}
          onDelete={()=>setNoteModal(null)}
          onToggleDone={()=>{}}
          onClose={()=>setNoteModal(null)}/>
      )}
      {expandedDay && (
        <DayFocusOverlay
          dateKey={expandedDay.key}
          initialIdx={expandedDay.noteIdx}
          notes={notes[expandedDay.key]||[]}
          deadlines={deadlines}
          onUpdateNotes={updated=>{
            setNotes(p=>({...p,[expandedDay.key]:updated}));
          }}
          onClose={()=>setExpandedDay(null)}
          onAddNote={()=>{ const k=expandedDay.key; setExpandedDay(null); openNew(k); }}
        />
      )}
      {showTemplates && (
        <TemplateModal
          onAdd={pack=>{
            setInbox(p=>[...p,...pack.items.map(item=>({id:uid(),...item}))]);
            setShowTemplates(false);
          }}
          onClose={()=>setShowTemplates(false)}/>
      )}
      {inboxModal && (
        <StickyComposer
          mode="inbox"
          onFlush={items=>{
            setInbox(p=>[...p,...items]);
            setInboxModal(false);
          }}
          onClose={()=>setInboxModal(false)}/>
      )}
      {editInboxItem && (
        <StickyComposer
          mode="edit"
          initialText={editInboxItem.text}
          initialStage={editInboxItem.stage||"discovery"}
          initialDone={false}
          onSaveDone={({text,stage,color})=>{
            setInbox(p=>p.map(x=>x.id===editInboxItem.id?{...x,text,stage,color}:x));
            setEditInboxItem(null);
          }}
          onDelete={()=>{
            setInbox(p=>p.filter(x=>x.id!==editInboxItem.id));
            setEditInboxItem(null);
          }}
          onToggleDone={()=>{}}
          onClose={()=>setEditInboxItem(null)}/>
      )}
      {/* BACKUP MODAL */}
      {backupModal && (
        <ModalShell onClose={()=>setBackupModal(null)} zIndex={9900} width="min(560px,96vw)">
          <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontFamily:T.display,fontSize:T.t1,letterSpacing:"2px",
                color:backupModal==="export"?"#5FE0C0":"#A87EFA"}}>
                {backupModal==="export" ? "↓ EXPORT BACKUP" : "↑ IMPORT BACKUP"}
              </span>
              <button onClick={()=>setBackupModal(null)} style={{
                background:"transparent",border:"none",cursor:"pointer",
                color:"rgba(255,255,255,0.3)",fontSize:"18px",lineHeight:1,padding:0,
              }}>✕</button>
            </div>
            <p style={{fontFamily:T.body,fontSize:T.t2,color:"rgba(255,255,255,0.38)",margin:0,lineHeight:1.7}}>
              {backupModal==="export"
                ? "Copy this JSON and save it somewhere safe. Paste it back using Import to restore your notes, inbox, and deadlines."
                : "Paste your previously exported JSON below. This will overwrite your current notes, inbox, and deadlines."}
            </p>
            {backupModal==="export" ? (
              <>
                <textarea readOnly
                  value={JSON.stringify({notes,deadlines,inbox,exportedAt:new Date().toISOString()},null,2)}
                  rows={10} style={{
                    width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.03)",
                    border:"1px solid rgba(95,224,192,0.18)",padding:"12px 14px",
                    fontFamily:"monospace",fontSize:"11px",color:"rgba(255,255,255,0.65)",
                    resize:"none",outline:"none",lineHeight:1.55,
                  }}/>
                <button onClick={()=>{
                  const json = JSON.stringify({notes,deadlines,inbox,exportedAt:new Date().toISOString()},null,2);
                  navigator.clipboard.writeText(json).then(()=>{
                    setCopyLabel("COPIED ✓"); setTimeout(()=>setCopyLabel("COPY"),2200);
                  }).catch(()=>{
                    const ta = document.querySelector("textarea[readonly]");
                    if(ta){ ta.select(); document.execCommand("copy"); setCopyLabel("COPIED ✓"); setTimeout(()=>setCopyLabel("COPY"),2200); }
                  });
                }} style={{
                  width:"100%",padding:"13px 0",background:"rgba(95,224,192,0.1)",
                  border:"1.5px solid rgba(95,224,192,0.4)",borderRadius:"0",cursor:"pointer",
                  fontFamily:T.display,fontSize:T.t2,color:"#5FE0C0",letterSpacing:"2px",transition:"all 0.15s",
                }}>{copyLabel}</button>
              </>
            ) : (
              <>
                <textarea value={importText} onChange={e=>setImportText(e.target.value)}
                  placeholder="Paste JSON here..."
                  rows={10} style={{
                    width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.03)",
                    border:"1px solid rgba(168,126,250,0.18)",padding:"12px 14px",
                    fontFamily:"monospace",fontSize:"11px",color:"rgba(255,255,255,0.65)",
                    resize:"none",outline:"none",lineHeight:1.55,caretColor:"#A87EFA",
                  }}/>
                <button onClick={()=>{
                  try {
                    const d = JSON.parse(importText);
                    if(d.notes)     { setNotes(d.notes);         save(LS.notes, d.notes); }
                    if(d.deadlines) { setDeadlines(d.deadlines); save(LS.dl,    d.deadlines); }
                    if(d.inbox)     { setInbox(d.inbox);         save(LS.inbox, d.inbox); }
                    setBackupModal(null);
                  } catch { alert("Invalid JSON — make sure you copied the full export."); }
                }} style={{
                  width:"100%",padding:"13px 0",
                  background:importText.trim()?"rgba(168,126,250,0.12)":"rgba(255,255,255,0.04)",
                  border:importText.trim()?"1.5px solid rgba(168,126,250,0.45)":"1.5px solid rgba(255,255,255,0.08)",
                  borderRadius:"0",cursor:importText.trim()?"pointer":"default",
                  fontFamily:T.display,fontSize:T.t2,
                  color:importText.trim()?"#A87EFA":"rgba(255,255,255,0.2)",
                  letterSpacing:"2px",transition:"all 0.15s",
                }}>RESTORE</button>
              </>
            )}
          </div>
        </ModalShell>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WEEK VIEW
// ─────────────────────────────────────────────────────────────────────────────
function WeekView({ notes, deadlines, dragOver, hovDay, setHovDay, onDragOver, onDragLeave, onDrop, renderDay }) {
  const dow  = TODAY.getDay();
  const days = Array.from({length:7},(_,i)=>{
    const d=new Date(TODAY); d.setDate(TODAY.getDate()-dow+i); return d;
  });
  return (
    <div style={{border:"1px solid rgba(255,255,255,0.06)"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",background:"rgba(0,0,0,0.42)"}}>
        {days.map((d,i)=>{
          const k=dKey(d.getFullYear(),d.getMonth(),d.getDate());
          const isT=k===TODAY_K;
          return (
            <div key={k} style={{textAlign:"center",padding:"10px 4px",
              borderLeft:i>0?"1px solid rgba(255,255,255,0.05)":"none",
              background:isT?"rgba(255,229,102,0.04)":"transparent"}}>
              <div style={{fontFamily:T.display,fontSize:T.t2,letterSpacing:"2.5px",
                color:isT?"#FFE566":"rgba(255,255,255,0.2)"}}>{DAYS_S[i]}</div>
              <div style={{fontFamily:T.display,fontSize:"22px",letterSpacing:"-1px",
                color:isT?"#FFE566":"rgba(255,255,255,0.42)",lineHeight:1.1}}>{d.getDate()}</div>
              {deadlines[k] && (
                <div style={{fontSize:T.t3,color:"#FF8C5A",fontWeight:700,fontFamily:T.body}}>
                  🔴 {deadlines[k].label}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"1px",background:"rgba(255,255,255,0.04)"}}>
        {days.map((d,i)=>{
          const k=dKey(d.getFullYear(),d.getMonth(),d.getDate());
          return (
            <div key={k} style={{background:"rgba(14,12,26,0.92)",minHeight:"200px",
              borderLeft:i>0?"1px solid rgba(255,255,255,0.04)":"none"}}>
              {renderDay(k)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
