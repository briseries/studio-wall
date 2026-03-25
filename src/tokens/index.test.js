import { describe, it, expect } from "vitest";
import { stickyCorners, stickyTilt, uid, dKey, load, save, STAGES, PALETTE, GLASS, T } from "./index";

describe("stickyCorners", () => {
  it("returns 4 corner values", () => {
    const result = stickyCorners("abc123");
    const parts = result.split(" ");
    expect(parts).toHaveLength(4);
    parts.forEach(p => expect(["0px", "1px"]).toContain(p));
  });

  it("is deterministic for the same id", () => {
    expect(stickyCorners("test1")).toBe(stickyCorners("test1"));
  });

  it("handles undefined id gracefully", () => {
    const result = stickyCorners(undefined);
    expect(result).toBeTruthy();
  });
});

describe("stickyTilt", () => {
  it("returns a value between -3.5 and 3.5", () => {
    for (let i = 0; i < 20; i++) {
      const tilt = stickyTilt(`id-${i}`, i);
      expect(tilt).toBeGreaterThanOrEqual(-3.5);
      expect(tilt).toBeLessThanOrEqual(3.5);
    }
  });

  it("is deterministic for same id+index", () => {
    expect(stickyTilt("abc", 3)).toBe(stickyTilt("abc", 3));
  });
});

describe("uid", () => {
  it("generates unique ids", () => {
    const ids = new Set(Array.from({ length: 100 }, () => uid()));
    expect(ids.size).toBe(100);
  });

  it("returns a string of reasonable length", () => {
    const id = uid();
    expect(id.length).toBeGreaterThanOrEqual(5);
  });
});

describe("dKey", () => {
  it("formats date as YYYY-MM-DD", () => {
    expect(dKey(2026, 0, 5)).toBe("2026-01-05");
    expect(dKey(2026, 11, 25)).toBe("2026-12-25");
  });

  it("pads single-digit months and days", () => {
    expect(dKey(2026, 2, 3)).toBe("2026-03-03");
  });
});

describe("token exports", () => {
  it("exports 8 stages", () => {
    expect(STAGES).toHaveLength(8);
    STAGES.forEach(s => {
      expect(s).toHaveProperty("id");
      expect(s).toHaveProperty("label");
      expect(s).toHaveProperty("color");
      expect(s).toHaveProperty("icon");
    });
  });

  it("exports 8 palette colors", () => {
    expect(PALETTE).toHaveLength(8);
    PALETTE.forEach(p => {
      expect(p.bg).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it("exports GLASS with nav, inbox, and modal surfaces", () => {
    expect(GLASS.nav).toHaveProperty("backdropFilter");
    expect(GLASS.inbox).toHaveProperty("backdropFilter");
    expect(GLASS.modal).toHaveProperty("backdropFilter");
  });

  it("exports typography tokens", () => {
    expect(T.display).toContain("Archivo Black");
    expect(T.body).toContain("Playfair Display");
    expect(T.t1).toBe("11px");
  });
});
