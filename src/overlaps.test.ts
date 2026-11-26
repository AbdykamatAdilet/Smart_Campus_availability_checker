import { describe, expect, it } from "vitest";
import { overlaps } from "@/availability";

describe("overlaps (half-open intervals)", () => {
  it("O01: rejects when new start equals existing end", () => {
    expect(overlaps({ start: 660, end: 720 }, { start: 540, end: 660 })).toBe(false);
  });

  it("O02: rejects when new end equals existing start", () => {
    expect(overlaps({ start: 480, end: 540 }, { start: 540, end: 660 })).toBe(false);
  });

  it("O03: detects overlap when new interval starts inside existing one", () => {
    expect(overlaps({ start: 600, end: 700 }, { start: 540, end: 660 })).toBe(true);
  });

  it("O04: detects overlap when new interval ends inside existing one", () => {
    expect(overlaps({ start: 500, end: 620 }, { start: 540, end: 660 })).toBe(true);
  });

  it("O05: detects full containment and identical intervals", () => {
    expect(overlaps({ start: 540, end: 660 }, { start: 560, end: 600 })).toBe(true);
    expect(overlaps({ start: 540, end: 660 }, { start: 540, end: 660 })).toBe(true);
  });

  it("O06: rejects disjoint intervals on either side", () => {
    expect(overlaps({ start: 300, end: 400 }, { start: 540, end: 660 })).toBe(false);
    expect(overlaps({ start: 800, end: 900 }, { start: 540, end: 660 })).toBe(false);
  });
});
