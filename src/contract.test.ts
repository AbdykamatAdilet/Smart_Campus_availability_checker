import { describe, expect, it } from "vitest";
import { checkAvailability } from "@/availability";
import { CURRENT_TIME, ROOMS } from "@/data";

const lib = ROOMS.find((r) => r.id === "lib-110")!;
const music = ROOMS.find((r) => r.id === "mus-2")!;
const t = (h: number, m = 0) => h * 60 + m;

describe("Practice 12 shared contract (code-based)", () => {
  it("T1: valid free interval -> Available", () => {
    const r = checkAvailability({ room: lib, start: t(12), end: t(13), now: CURRENT_TIME });
    expect(r.status).toBe("available");
    expect(r.code).toBe("AVAILABLE");
  });

  it("T2: overlap with existing booking -> Unavailable", () => {
    const r = checkAvailability({ room: lib, start: t(10, 30), end: t(11), now: CURRENT_TIME });
    expect(r.status).toBe("unavailable");
    expect(r.code).toBe("OVERLAP");
  });

  it("T3: blocked room -> Unavailable", () => {
    const r = checkAvailability({ room: music, start: t(12), end: t(13), now: CURRENT_TIME });
    expect(r.status).toBe("unavailable");
    expect(r.code).toBe("ROOM_BLOCKED");
  });

  it("T4: duration = 0 -> validation error", () => {
    const r = checkAvailability({ room: lib, start: t(12), end: t(12), now: CURRENT_TIME });
    expect(r.status).toBe("invalid");
    expect(r.code).toBe("END_BEFORE_START");
  });

  it("T5: duration = 121 -> validation error", () => {
    const r = checkAvailability({ room: lib, start: t(12), end: t(12) + 121, now: CURRENT_TIME });
    expect(r.status).toBe("invalid");
    expect(r.code).toBe("TOO_LONG");
  });

  it("T6: past start time -> validation error", () => {
    const r = checkAvailability({ room: lib, start: t(8), end: t(9), now: CURRENT_TIME });
    expect(r.status).toBe("invalid");
    expect(r.code).toBe("START_NOT_AFTER_NOW");
  });

  it("T7: adjacent non-overlapping interval -> Available", () => {
    const r = checkAvailability({ room: lib, start: t(11), end: t(12), now: CURRENT_TIME });
    expect(r.status).toBe("available");
    expect(r.code).toBe("AVAILABLE");
  });

  it("T8: booking data unchanged after checks", () => {
    const before = JSON.stringify(ROOMS);
    checkAvailability({ room: lib, start: t(12), end: t(13), now: CURRENT_TIME });
    checkAvailability({ room: lib, start: t(10, 30), end: t(11), now: CURRENT_TIME });
    checkAvailability({ room: music, start: t(12), end: t(13), now: CURRENT_TIME });
    expect(JSON.stringify(ROOMS)).toBe(before);
  });
});