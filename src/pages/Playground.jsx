import { T, PALETTE, STAGES, COLORS, GLASS, RAINBOW, SPACING } from "../tokens";
import StickyNote from "../components/StickyNote";
import FocusCard from "../components/FocusCard";

export default function Playground() {
  return (
    <div style={{minHeight:"100vh",background:"#080810",color:"#fff",fontFamily:T.body,padding:"40px"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .pg-section{margin-bottom:48px;}
        .pg-label{font-family:${T.display};font-size:${T.t2};letter-spacing:3px;
          color:rgba(255,255,255,0.3);text-transform:uppercase;margin-bottom:16px;}
        .pg-grid{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start;}
        .pg-swatch{width:64px;height:64px;border-radius:2px;position:relative;overflow:hidden;}
        .pg-swatch-label{position:absolute;bottom:2px;left:4px;font-family:monospace;
          font-size:8px;color:rgba(0,0,0,0.6);}
      `}</style>

      <div style={{
        fontFamily:T.body,fontSize:"clamp(28px,4vw,48px)",fontStyle:"italic",fontWeight:700,
        background:RAINBOW,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
        marginBottom:"8px",
      }}>Design System Playground</div>
      <div style={{fontSize:T.t1,color:"rgba(255,255,255,0.2)",marginBottom:"48px"}}>
        All tokens and component variants from src/tokens/index.js
      </div>

      {/* ── Typography ── */}
      <div className="pg-section">
        <div className="pg-label">Typography</div>
        <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
          <div style={{fontFamily:T.display,fontSize:"28px",color:"#fff"}}>
            Archivo Black (Display)
          </div>
          <div style={{fontFamily:T.body,fontSize:"20px",fontWeight:700,fontStyle:"italic",color:"#fff"}}>
            Playfair Display Italic Bold (Body)
          </div>
          <div style={{display:"flex",gap:"24px",alignItems:"baseline"}}>
            <span style={{fontFamily:T.body,fontSize:T.t1,color:"rgba(255,255,255,0.5)"}}>t1: {T.t1}</span>
            <span style={{fontFamily:T.body,fontSize:T.t2,color:"rgba(255,255,255,0.5)"}}>t2: {T.t2}</span>
            <span style={{fontFamily:T.body,fontSize:T.t3,color:"rgba(255,255,255,0.5)"}}>t3: {T.t3}</span>
            <span style={{fontFamily:T.body,fontSize:T.t4,color:"rgba(255,255,255,0.5)"}}>t4: {T.t4}</span>
          </div>
        </div>
      </div>

      {/* ── Color Palette ── */}
      <div className="pg-section">
        <div className="pg-label">Color Palette</div>
        <div className="pg-grid">
          {Object.entries(COLORS).map(([name, c]) => (
            <div key={name}>
              <div className="pg-swatch" style={{background:c.base}}>
                <div className="pg-swatch-label">{c.base}</div>
              </div>
              <div style={{fontFamily:"monospace",fontSize:"8px",color:"rgba(255,255,255,0.3)",
                marginTop:"4px",textAlign:"center"}}>{name}</div>
              <div className="pg-swatch" style={{background:c.shadow,width:"64px",height:"24px",
                marginTop:"2px"}}>
                <div className="pg-swatch-label">{c.shadow}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Rainbow Gradient ── */}
      <div className="pg-section">
        <div className="pg-label">Rainbow Gradient</div>
        <div style={{height:"40px",background:RAINBOW,borderRadius:"2px"}}/>
      </div>

      {/* ── Glass Surfaces ── */}
      <div className="pg-section">
        <div className="pg-label">Glass Surfaces</div>
        <div className="pg-grid">
          {Object.entries(GLASS).map(([name, styles]) => (
            <div key={name} style={{
              ...styles,width:"200px",height:"80px",padding:"12px",
              borderRadius:"2px",position:"relative",
            }}>
              <div style={{fontFamily:T.display,fontSize:T.t2,letterSpacing:"2px",
                color:"rgba(255,255,255,0.5)"}}>{name.toUpperCase()}</div>
              <div style={{fontFamily:"monospace",fontSize:"8px",color:"rgba(255,255,255,0.2)",
                marginTop:"6px"}}>{styles.backdropFilter}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stages ── */}
      <div className="pg-section">
        <div className="pg-label">Design Process Stages</div>
        <div className="pg-grid">
          {STAGES.map(s => (
            <div key={s.id} style={{
              display:"flex",alignItems:"center",gap:"8px",
              padding:"8px 14px",
              border:`1.5px solid ${s.color}55`,
              background:`${s.color}11`,
            }}>
              <span style={{fontSize:"14px"}}>{s.icon}</span>
              <span style={{fontFamily:T.body,fontSize:T.t2,fontWeight:700,
                color:s.color,letterSpacing:"1px",textTransform:"uppercase"}}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── StickyNote Variants ── */}
      <div className="pg-section">
        <div className="pg-label">StickyNote Component</div>

        <div style={{marginBottom:"16px"}}>
          <div style={{fontFamily:T.body,fontSize:T.t2,color:"rgba(255,255,255,0.25)",
            marginBottom:"8px",letterSpacing:"1px",textTransform:"uppercase"}}>Sizes</div>
          <div className="pg-grid">
            {["sm","md","lg"].map(size => (
              <div key={size} style={{width: size==="sm"?"100px":size==="lg"?"180px":"130px"}}>
                <StickyNote
                  id={`pg-${size}`}
                  text={`${size.toUpperCase()} card`}
                  color={COLORS.blue.base}
                  size={size}
                  draggable={false}
                />
                <div style={{fontFamily:"monospace",fontSize:"8px",color:"rgba(255,255,255,0.2)",
                  marginTop:"4px"}}>{size}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{marginBottom:"16px"}}>
          <div style={{fontFamily:T.body,fontSize:T.t2,color:"rgba(255,255,255,0.25)",
            marginBottom:"8px",letterSpacing:"1px",textTransform:"uppercase"}}>Colors</div>
          <div className="pg-grid">
            {PALETTE.map((p, i) => (
              <div key={i} style={{width:"118px"}}>
                <StickyNote
                  id={`pg-color-${i}`}
                  text={Object.keys(COLORS)[i]}
                  color={p.bg}
                  size="md"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        <div style={{marginBottom:"16px"}}>
          <div style={{fontFamily:T.body,fontSize:T.t2,color:"rgba(255,255,255,0.25)",
            marginBottom:"8px",letterSpacing:"1px",textTransform:"uppercase"}}>States</div>
          <div className="pg-grid">
            <div style={{width:"130px"}}>
              <StickyNote id="pg-normal" text="Normal" color={COLORS.violet.base} draggable={false}/>
              <div style={{fontFamily:"monospace",fontSize:"8px",color:"rgba(255,255,255,0.2)",marginTop:"4px"}}>default</div>
            </div>
            <div style={{width:"130px"}}>
              <StickyNote id="pg-selected" text="Selected" color={COLORS.pink.base} selected draggable={false}/>
              <div style={{fontFamily:"monospace",fontSize:"8px",color:"rgba(255,255,255,0.2)",marginTop:"4px"}}>selected</div>
            </div>
            <div style={{width:"130px"}}>
              <StickyNote id="pg-done" text="Done" color={COLORS.teal.base} done draggable={false}/>
              <div style={{fontFamily:"monospace",fontSize:"8px",color:"rgba(255,255,255,0.2)",marginTop:"4px"}}>done</div>
            </div>
            <div style={{width:"130px"}}>
              <StickyNote id="pg-high" text="Priority" color={COLORS.orange.base} priority="High" draggable={false}/>
              <div style={{fontFamily:"monospace",fontSize:"8px",color:"rgba(255,255,255,0.2)",marginTop:"4px"}}>priority=High</div>
            </div>
            <div style={{width:"130px"}}>
              <StickyNote id="pg-stage" text="With stage" color={COLORS.green.base} stage="research" showStage draggable={false}/>
              <div style={{fontFamily:"monospace",fontSize:"8px",color:"rgba(255,255,255,0.2)",marginTop:"4px"}}>showStage</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FocusCard ── */}
      <div className="pg-section">
        <div className="pg-label">FocusCard Component</div>
        <div style={{fontFamily:T.body,fontSize:T.t2,color:"rgba(255,255,255,0.25)",
          marginBottom:"12px"}}>
          Used in DayFocusOverlay — the mini cards in the fan view when you click a day.
        </div>
        <div className="pg-grid">
          <div>
            <FocusCard
              note={{id:"fc-default",text:"Sprint planning",stage:"discovery",done:false}}
              onClick={()=>{}}
            />
            <div style={{fontFamily:"monospace",fontSize:"8px",color:"rgba(255,255,255,0.2)",marginTop:"4px"}}>default</div>
          </div>
          <div>
            <FocusCard
              note={{id:"fc-editing",text:"Design review",stage:"ideation",done:false}}
              isEditing
              onClick={()=>{}}
            />
            <div style={{fontFamily:"monospace",fontSize:"8px",color:"rgba(255,255,255,0.2)",marginTop:"4px"}}>isEditing</div>
          </div>
          <div>
            <FocusCard
              note={{id:"fc-done",text:"User interviews",stage:"research",done:true}}
              showDone
              onClick={()=>{}}
              onToggleDone={()=>{}}
            />
            <div style={{fontFamily:"monospace",fontSize:"8px",color:"rgba(255,255,255,0.2)",marginTop:"4px"}}>done + showDone</div>
          </div>
          <div>
            <FocusCard
              note={{id:"fc-remove",text:"Wireframes",stage:"prototyping",done:false}}
              showDone
              onClick={()=>{}}
              onToggleDone={()=>{}}
              onRemove={()=>{}}
            />
            <div style={{fontFamily:"monospace",fontSize:"8px",color:"rgba(255,255,255,0.2)",marginTop:"4px"}}>showDone + onRemove</div>
          </div>
          <div>
            <FocusCard
              note={{id:"fc-small",text:"Ship it",stage:"launch",done:false}}
              width="100px"
              minHeight="60px"
              onClick={()=>{}}
            />
            <div style={{fontFamily:"monospace",fontSize:"8px",color:"rgba(255,255,255,0.2)",marginTop:"4px"}}>custom size</div>
          </div>
        </div>
      </div>

      {/* ── Spacing ── */}
      <div className="pg-section">
        <div className="pg-label">Spacing Tokens</div>
        <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
          {Object.entries(SPACING).map(([name, val]) => (
            <div key={name} style={{display:"flex",alignItems:"center",gap:"12px"}}>
              <span style={{fontFamily:"monospace",fontSize:"10px",color:"rgba(255,255,255,0.3)",
                minWidth:"120px"}}>{name}</span>
              <span style={{fontFamily:"monospace",fontSize:"10px",color:"rgba(255,255,255,0.5)"}}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
