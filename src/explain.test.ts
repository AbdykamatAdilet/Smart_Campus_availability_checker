import { describe, expect, it, vi } from "vitest";
import { checkAvailability } from "@/availability";
import { CURRENT_TIME, ROOMS } from "@/data";
import { FALLBACK_TEXT, explainAvailability, type ExplainInput } from "@/explain";

function makeInput(overrides: Partial<ExplainInput> = {}): ExplainInput {
  return {
    roomLabel: "Engineering Lab 201",
    start: 720,
    end: 780,
    status: "available",
    code: "AVAILABLE",
    ...overrides,
  };
}

describe("explainAvailability", () => {
  it("E01: normal mode explains an available slot", async () => {
    const result = await explainAvailability(makeInput(), "normal");
    expect(result.ok).toBe(true);
    expect(result.text).toContain("Engineering Lab 201");
    expect(result.text).not.toMatch(/cannot be booked|not available|unavailable/i);
  });

  it("E02: normal mode explains an overlap without offering the slot", async () => {
    const result = await explainAvailability(
      makeInput({ status: "unavailable", code: "OVERLAP" }),
      "normal",
    );
    expect(result.ok).toBe(true);
    expect(result.text.toLowerCase()).toContain("overlap");
    expect(result.text).not.toMatch(/can be booked/i);
  });

  it("E03: normal mode explains a blocked room", async () => {
    const result = await explainAvailability(
      makeInput({
        roomLabel: "Music Practice Room 2",
        status: "unavailable",
        code: "ROOM_BLOCKED",
      }),
      "normal",
    );
    expect(result.ok).toBe(true);
    expect(result.text).toContain("Music Practice Room 2");
    expect(result.text.toLowerCase()).toMatch(/blocked|unavailable/);
  });

  it("E04: normal mode gives a specific explanation for an invalid interval", async () => {
    const result = await explainAvailability(
      makeInput({
        roomLabel: "Library Study Room 110",
        start: 500,
        end: 560,
        status: "invalid",
        code: "START_NOT_AFTER_NOW",
      }),
      "normal",
    );
    expect(result.ok).toBe(true);
    expect(result.text).not.toBe(FALLBACK_TEXT);
    expect(result.text).toContain("Library Study Room 110");
  });

  it("E05: empty/whitespace roomLabel returns the fallback", async () => {
    const result = await explainAvailability(makeInput({ roomLabel: "   " }), "normal");
    expect(result.ok).toBe(false);
    expect(result.text).toBe(FALLBACK_TEXT);
  });

  it("E06: roomLabel longer than 60 chars returns the fallback", async () => {
    const result = await explainAvailability(
      makeInput({ roomLabel: "R".repeat(61) }),
      "normal",
    );
    expect(result.ok).toBe(false);
    expect(result.text).toBe(FALLBACK_TEXT);
  });

  it("E07: non-finite start/end returns the fallback", async () => {
    for (const numbers of [
      { start: NaN, end: 780 },
      { start: 720, end: Infinity },
    ]) {
      const result = await explainAvailability(makeInput(numbers), "normal");
      expect(result.ok).toBe(false);
      expect(result.text).toBe(FALLBACK_TEXT);
    }
  });

  it("E08: contradictory status/code pairs return the fallback", async () => {
    for (const contradiction of [
      { status: "available" as const, code: "OVERLAP" as const },
      { status: "unavailable" as const, code: "AVAILABLE" as const },
    ]) {
      const result = await explainAvailability(makeInput(contradiction), "normal");
      expect(result.ok).toBe(false);
      expect(result.text).toBe(FALLBACK_TEXT);
    }
  });

  it("E09: timeout mode does not resolve before the 3s limit and ends in the fallback", async () => {
    vi.useFakeTimers();
    try {
      const pending = explainAvailability(makeInput(), "timeout");
      let settled = false;
      void pending.then(() => {
        settled = true;
      });

      await vi.advanceTimersByTimeAsync(2999);
      expect(settled).toBe(false);

      await vi.advanceTimersByTimeAsync(501);
      const result = await pending;
      expect(result.ok).toBe(false);
      expect(result.text).toBe(FALLBACK_TEXT);
    } finally {
      vi.useRealTimers();
    }
  });

  it("E10: error and no-key modes return the fallback", async () => {
    for (const mode of ["error", "no-key"] as const) {
      const result = await explainAvailability(makeInput(), mode);
      expect(result.ok).toBe(false);
      expect(result.text).toBe(FALLBACK_TEXT);
    }
  });

  it("E11: no mode mutates the input or the deterministic check result", async () => {
    const room = ROOMS.find((r) => r.id === "lib-110");
    if (!room) throw new Error("lib-110 room not found in data.ts");

    const input = makeInput({
      roomLabel: room.name,
      start: 541,
      end: 600,
      status: "available",
      code: "AVAILABLE",
    });
    const inputSnapshot = structuredClone(input);
    const before = checkAvailability({ room, start: input.start, end: input.end, now: CURRENT_TIME });

    for (const mode of ["normal", "timeout", "error", "no-key"] as const) {
      if (mode === "timeout") {
        vi.useFakeTimers();
        try {
          const pending = explainAvailability(input, mode);
          await vi.runAllTimersAsync();
          await pending;
        } finally {
          vi.useRealTimers();
        }
      } else {
        await explainAvailability(input, mode);
      }
      expect(input).toEqual(inputSnapshot);
      expect(checkAvailability({ room, start: input.start, end: input.end, now: CURRENT_TIME })).toEqual(before);
    }
  });

  it("E12: timeout mode leaves no pending timers after settling", async () => {
    vi.useFakeTimers();
    try {
      const pending = explainAvailability(makeInput(), "timeout");
      await vi.runAllTimersAsync();
      const result = await pending;
      expect(result.ok).toBe(false);
      expect(result.text).toBe(FALLBACK_TEXT);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it("E13: NOT_WHOLE_MINUTES and TOO_LONG produce clear, non-fallback explanations", async () => {
    const wholeMinutes = await explainAvailability(
      makeInput({
        start: 720.5,
        end: 780,
        status: "invalid",
        code: "NOT_WHOLE_MINUTES",
      }),
      "normal",
    );
    expect(wholeMinutes.ok).toBe(true);
    expect(wholeMinutes.text).not.toBe(FALLBACK_TEXT);
    expect(wholeMinutes.text.toLowerCase()).toContain("whole minute");
    expect(wholeMinutes.text).toContain("Engineering Lab 201");

    const tooLong = await explainAvailability(
      makeInput({ start: 720, end: 1200, status: "invalid", code: "TOO_LONG" }),
      "normal",
    );
    expect(tooLong.ok).toBe(true);
    expect(tooLong.text).not.toBe(FALLBACK_TEXT);
    expect(tooLong.text.toLowerCase()).toContain("duration");
  });

  it("E14: output validation enforces length cap and never contradicts the status", async () => {
    // With valid input the generated text can approach but never exceed the
    // 300-char output cap, and output validation would fall back if it did.
    const longestValidInput = makeInput({
      roomLabel: "A".repeat(60),
      start: 720,
      end: 780,
      status: "available",
      code: "AVAILABLE",
    });
    const result = await explainAvailability(longestValidInput, "normal");
    expect(result.ok).toBe(true);
    expect(result.text).not.toBe(FALLBACK_TEXT);
    expect(result.text.length).toBeLessThanOrEqual(300);

    // Output validation also guards contradiction: an unavailable status can
    // never be explained with "can be booked" without triggering the fallback.
    const unavailable = await explainAvailability(
      makeInput({ status: "unavailable", code: "ROOM_BLOCKED" }),
      "normal",
    );
    expect(unavailable.ok).toBe(true);
    expect(unavailable.text).not.toMatch(/can be booked/i);
  });
});
