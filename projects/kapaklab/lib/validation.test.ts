import { describe, expect, it } from "vitest";
import { generateFieldsSchema } from "./validation";

describe("generateFieldsSchema", () => {
  it("accepts a valid request", () => {
    const result = generateFieldsSchema.parse({ topic: "Bambu Lab A1 incelemesi", audience: "Yeni başlayanlar", style: "technology", expression: "excited", language: "tr" });
    expect(result.language).toBe("tr");
  });

  it("rejects a too-short topic", () => {
    expect(() => generateFieldsSchema.parse({ topic: "abc", audience: "", style: "viral", expression: "natural", language: "tr" })).toThrow();
  });
});
