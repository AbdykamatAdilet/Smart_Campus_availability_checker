import { checkAvailability } from "@/availability";
import { CURRENT_TIME, ROOMS } from "@/data";
import { parseTimeInput } from "@/rules";
import type { RoomFilters } from "@/filtering";
import type { CheckOutcome, Room } from "@/types";

export interface AppState {
  filters: RoomFilters;
  roomId: string | null;
  startInput: string;
  duration: number;
  result: CheckOutcome | null;
}

export type AppAction =
  | { type: "setAttendees"; value: number }
  | { type: "toggleEquipment"; item: string }
  | { type: "clearFilters" }
  | { type: "selectRoom"; room: Room }
  | { type: "setStart"; value: string }
  | { type: "setDuration"; value: number }
  | { type: "check"; room: Room };

export const DEFAULT_DURATION = 60;

export function createInitialState(): AppState {
  return {
    filters: { attendees: 1, equipment: [] },
    roomId: ROOMS[0]?.id ?? null,
    startInput: "",
    duration: DEFAULT_DURATION,
    result: null,
  };
}

export function requestedInterval(state: AppState): { start: number; end: number } | null {
  const start = parseTimeInput(state.startInput);
  if (start === null) return null;
  return { start, end: start + state.duration };
}

function evaluate(room: Room, state: AppState): CheckOutcome {
  const interval = requestedInterval(state);
  if (!interval) {
    return {
      status: "invalid",
      reason: "Enter a start time in HH:MM (24-hour) format.",
      code: "START_OUT_OF_RANGE",
    };
  }
  return checkAvailability({ room, start: interval.start, end: interval.end, now: CURRENT_TIME });
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "setAttendees":
      return { ...state, filters: { ...state.filters, attendees: action.value }, result: null };
    case "toggleEquipment": {
      const has = state.filters.equipment.includes(action.item);
      const equipment = has
        ? state.filters.equipment.filter((item) => item !== action.item)
        : [...state.filters.equipment, action.item];
      return { ...state, filters: { ...state.filters, equipment }, result: null };
    }
    case "clearFilters":
      return { ...state, filters: { attendees: 1, equipment: [] }, result: null };
    case "selectRoom":
      return {
        ...state,
        roomId: action.room.id,
        result: requestedInterval(state) ? evaluate(action.room, state) : null,
      };
    case "setStart":
      return { ...state, startInput: action.value, result: null };
    case "setDuration":
      return { ...state, duration: action.value, result: null };
    case "check":
      return { ...state, result: evaluate(action.room, state) };
  }
}
