export interface Booking {
  title: string;
  start: number;
  end: number;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  equipment: string[];
  blocked: boolean;
  blockReason?: string;
  bookings: Booking[];
}

export type ReasonCode =
  | "AVAILABLE"
  | "ROOM_BLOCKED"
  | "NOT_WHOLE_MINUTES"
  | "START_OUT_OF_RANGE"
  | "END_BEFORE_START"
  | "PAST_MIDNIGHT"
  | "START_NOT_AFTER_NOW"
  | "TOO_LONG"
  | "OVERLAP";

export type CheckOutcome =
  | { status: "available"; code: ReasonCode }
  | { status: "unavailable"; reason: string; code: ReasonCode }
  | { status: "invalid"; reason: string; code: ReasonCode };
