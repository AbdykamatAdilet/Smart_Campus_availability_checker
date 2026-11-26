import { fmtTime, validateInterval } from "@/rules";
import type { CheckOutcome, Room } from "@/types";

export interface CheckRequest {
  room: Room;
  start: number;
  end: number;
  now: number;
}

export interface Interval {
  start: number;
  end: number;
}

// Half-open intervals [start, end): touching endpoints do not overlap.
export function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}

export function checkAvailability({ room, start, end, now }: CheckRequest): CheckOutcome {
  if (room.blocked) {
    return {
      status: "unavailable",
      reason: room.blockReason ?? "This room is currently blocked and cannot be booked.",
      code: "ROOM_BLOCKED",
    };
  }

  const interval = validateInterval(start, end, now);
  if (!interval.valid) {
    return { status: "invalid", reason: interval.reason, code: interval.code };
  }

  const conflict = room.bookings.find((b) => overlaps({ start, end }, b));
  if (conflict) {
    return {
      status: "unavailable",
      reason: `Overlaps an existing booking (${fmtTime(conflict.start)}–${fmtTime(conflict.end)}, ${conflict.title}).`,
      code: "OVERLAP",
    };
  }

  return { status: "available", code: "AVAILABLE" };
}
