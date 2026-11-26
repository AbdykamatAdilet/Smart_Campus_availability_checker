import { fmtTime } from "@/rules";
import type { ReasonCode } from "@/types";

export type ExplainMode = "normal" | "timeout" | "error" | "no-key";

export interface ExplainInput {
  roomLabel: string;
  start: number;
  end: number;
  status: "available" | "unavailable" | "invalid";
  code: ReasonCode;
}

export interface ExplainResult {
  ok: boolean;
  text: string;
}

export const FALLBACK_TEXT = "Explanation unavailable. The booking status above is still correct.";

const ADAPTER_DELAY_MS = 3500;
const MAX_EXPLANATION_CHARS = 300;

function statusMatchesCode(status: ExplainInput["status"], code: ReasonCode): boolean {
  if (status === "available") return code === "AVAILABLE";
  if (status === "unavailable") return code === "ROOM_BLOCKED" || code === "OVERLAP";
  return (
    code === "NOT_WHOLE_MINUTES" ||
    code === "START_OUT_OF_RANGE" ||
    code === "END_BEFORE_START" ||
    code === "PAST_MIDNIGHT" ||
    code === "START_NOT_AFTER_NOW" ||
    code === "TOO_LONG"
  );
}

function isValidInput(input: ExplainInput): boolean {
  if (typeof input.roomLabel !== "string" || input.roomLabel.trim().length === 0) return false;
  if (input.roomLabel.length > 60) return false;
  if (!Number.isFinite(input.start) || !Number.isFinite(input.end)) return false;
  return statusMatchesCode(input.status, input.code);
}

function validExplanation(text: string, status: ExplainInput["status"]): boolean {
  if (text.trim().length === 0 || text.length > MAX_EXPLANATION_CHARS) return false;
  const sentences = text.split(/[.!?]+(?:\s|$)/).filter((s) => s.trim().length > 0);
  if (sentences.length > 2) return false;
  if (status !== "available" && /can be booked/i.test(text)) return false;
  return true;
}

function generateExplanation(input: ExplainInput): string {
  const { roomLabel, start, end, code } = input;
  const slot = `${fmtTime(start)}–${fmtTime(end)}`;

  switch (code) {
    case "AVAILABLE":
      return `${roomLabel} has no booking overlapping ${slot}, so the slot is free.`;
    case "ROOM_BLOCKED":
      return `${roomLabel} is blocked for maintenance, so ${slot} cannot be booked.`;
    case "OVERLAP":
      return `${roomLabel} already has a booking overlapping ${slot}, so the slot is taken.`;
    case "NOT_WHOLE_MINUTES":
      return `The start and end times must be whole minutes, so ${slot} was not checked for ${roomLabel}.`;
    case "START_OUT_OF_RANGE":
      return `The start time must be between 00:00 and 23:59, so ${slot} is not a valid slot for ${roomLabel}.`;
    case "END_BEFORE_START":
      return `The end time must be after the start time, so ${slot} is not a valid slot for ${roomLabel}.`;
    case "PAST_MIDNIGHT":
      return `The requested slot for ${roomLabel} would run past midnight, which is not allowed.`;
    case "START_NOT_AFTER_NOW":
      return `The start time is not after the current time, so ${slot} cannot be requested for ${roomLabel}.`;
    case "TOO_LONG":
      return `The requested slot for ${roomLabel} is longer than the maximum allowed duration.`;
  }
}

export const UI_TIMEOUT_MS = 3000;

export async function explainAvailability(input: ExplainInput, mode: ExplainMode): Promise<ExplainResult> {
  if (!isValidInput(input) || mode === "no-key" || mode === "error") {
    return { ok: false, text: FALLBACK_TEXT };
  }

  if (mode === "timeout") {
    // Simulates a slow model response: only the caller's timeout (3000 ms)
    // and the adapter delay (3500 ms) race — the timeout wins with fallback.
    // The losing timer is cleared so nothing dangles after the race settles.
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let adapterId: ReturnType<typeof setTimeout> | undefined;
    const winner = await new Promise<"caller-timeout" | "adapter-done">((resolve) => {
      timeoutId = setTimeout(() => resolve("caller-timeout"), UI_TIMEOUT_MS);
      adapterId = setTimeout(() => resolve("adapter-done"), ADAPTER_DELAY_MS);
    });
    if (timeoutId !== undefined) clearTimeout(timeoutId);
    if (adapterId !== undefined) clearTimeout(adapterId);
    if (winner === "caller-timeout") return { ok: false, text: FALLBACK_TEXT };
  }

  const text = generateExplanation(input);
  if (!validExplanation(text, input.status)) {
    return { ok: false, text: FALLBACK_TEXT };
  }
  return { ok: true, text };
}
