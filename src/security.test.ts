import { describe, expect, it } from "vitest";
import { checkAvailability } from "@/availability";
import { CURRENT_TIME, ROOMS } from "@/data";

const lib = ROOMS.find((r) => r.id === "lib-110")!;
const run = (start: number, duration: number) =>
  checkAvailability({ room: lib, start, end: start + duration, now: CURRENT_TIME });

describe("Practice 12 extra runtime checks S2-S5 (rule engine level)", () => {
  it("S2: empty duration (NaN) -> rejected", () => {
    const r = run(720, NaN);
    expect(r.status).toBe("invalid");
    expect(r.code).toBe("NOT_WHOLE_MINUTES");
  });
  it("S3: negative duration -> rejected", () => {
    const r = run(720, -30);
    expect(r.status).toBe("invalid");
    expect(r.code).toBe("END_BEFORE_START");
  });
  it("S4: fractional duration -> rejected", () => {
    const r = run(720, 30.5);
    expect(r.status).toBe("invalid");
    expect(r.code).toBe("NOT_WHOLE_MINUTES");
  });
  it("S5: booking ending after midnight -> rejected", () => {
    const r = run(1430, 60);
    expect(r.status).toBe("invalid");
    expect(r.code).toBe("PAST_MIDNIGHT");
  });
});