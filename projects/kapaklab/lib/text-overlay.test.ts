import { describe, expect, it } from "vitest";
import { escapeXml, wrapTitle } from "./text-overlay";

describe("wrapTitle", () => {
  it("keeps short titles on one line", () => {
    expect(wrapTitle("Büyük Sürpriz")).toEqual(["BÜYÜK SÜRPRİZ"]);
  });

  it("wraps long titles into at most three lines", () => {
    const lines = wrapTitle("Bunu kimse sana daha önce anlatmadı", 12);
    expect(lines.length).toBeGreaterThan(1);
    expect(lines.length).toBeLessThanOrEqual(3);
  });
});

describe("escapeXml", () => {
  it("escapes unsafe SVG characters", () => {
    expect(escapeXml("A&B <test>")).toBe("A&amp;B &lt;test&gt;");
  });
});
