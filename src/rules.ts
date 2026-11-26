import type { ReasonCode } from "@/types";

export const MINUTES_PER_DAY = 1440;
export const MAX_DURATION_MINUTES = 120;

export type IntervalCheck =
  | { valid: true }
  | { valid: false; reason: string; code: ReasonCode };

export function fmtTime(minutes: number): string {
  const m = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export function validateInterval(start: number, end: number, now: number): IntervalCheck {
  if (!Number.isInteger(start) || !Number.isInteger(end)) {
    return { valid: false, reason: "Start and end times must be whole minutes.", code: "NOT_WHOLE_MINUTES" };
  }
  if (start < 0 || start >= MINUTES_PER_DAY) {
    return { valid: false, reason: "Start time must be between 00:00 and 23:59.", code: "START_OUT_OF_RANGE" };
  }
  if (end <= start) {
    return { valid: false, reason: "End time must be after the start time.", code: "END_BEFORE_START" };
  }
  if (end > MINUTES_PER_DAY) {
    return { valid: false, reason: "The booking would run past midnight (24:00).", code: "PAST_MIDNIGHT" };
  }
  if (start <= now) {
    return {
      valid: false,
      reason: `Start time must be after the current time (${fmtTime(now)}).`,
      code: "START_NOT_AFTER_NOW",
    };
  }
  if (end - start > MAX_DURATION_MINUTES) {
    return {
      valid: false,
      reason: `Duration cannot exceed ${MAX_DURATION_MINUTES} minutes.`,
      code: "TOO_LONG",
    };
  }
  return { valid: true };
}

export function parseTimeInput(value: string): number | null {
  const m = /^(\d{2}):(\d{2})$/.exec(value);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}
