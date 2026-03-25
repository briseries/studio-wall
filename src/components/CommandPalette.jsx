import { useState, useEffect, useRef, useMemo } from "react";
import { T, GLASS } from "../tokens";

export default function CommandPalette({ actions, onClose }) {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef();

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return actions;
    const q = query.toLowerCase();
    return actions.filter(a =>
      a.label.toLowerCase().includes(q) ||
      (a.keywords || []).some(k => k.toLowerCase().includes(q))
    );
  }, [query, actions]);

  // Keep active index in bounds
  useEffect(() => {
    if (activeIdx >= filtered.length) setActiveIdx(Math.max(0, filtered.length - 1));
  }, [filtered.length, activeIdx]);

  function handleKey(e) {
    if (e.key === "Escape") { e.preventDefault(); onClose(); }
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && filtered[activeIdx]) {
      e.preventDefault();
      filtered[activeIdx].action();
      onClose();
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        ...GLASS.modal,
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: "min(20vh, 160px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "min(480px, 92vw)",
          background: "#0e0c1a",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(168,126,250,0.15)",
          overflow: "hidden",
        }}
      >
        {/* Search input */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIdx(0); }}
            onKeyDown={handleKey}
            placeholder="Type a command..."
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily: T.body,
              fontSize: "14px",
              fontWeight: 500,
              color: "rgba(255,255,255,0.9)",
              caretColor: "#A87EFA",
              letterSpacing: "0.3px",
            }}
          />
        </div>

        {/* Results */}
        <div style={{ maxHeight: "320px", overflowY: "auto", padding: "6px 0" }}>
          {filtered.length === 0 && (
            <div style={{
              padding: "20px", textAlign: "center",
              fontFamily: T.body, fontSize: T.t2,
              color: "rgba(255,255,255,0.2)",
            }}>
              No matching commands
            </div>
          )}
          {filtered.map((action, i) => (
            <div
              key={action.id}
              onClick={() => { action.action(); onClose(); }}
              onMouseEnter={() => setActiveIdx(i)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 20px",
                cursor: "pointer",
                background: i === activeIdx ? "rgba(168,126,250,0.1)" : "transparent",
                borderLeft: i === activeIdx ? "2px solid #A87EFA" : "2px solid transparent",
                transition: "background 0.08s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "14px", lineHeight: 1 }}>{action.icon || "⚡"}</span>
                <span style={{
                  fontFamily: T.body, fontSize: T.t1, fontWeight: 600,
                  color: i === activeIdx ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.55)",
                }}>
                  {action.label}
                </span>
              </div>
              {action.shortcut && (
                <span style={{
                  fontFamily: "monospace", fontSize: T.t3,
                  color: "rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.05)",
                  padding: "2px 6px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  {action.shortcut}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div style={{
          padding: "8px 20px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          display: "flex", gap: "16px",
          fontFamily: T.body, fontSize: T.t3,
          color: "rgba(255,255,255,0.15)",
        }}>
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
