import { useEffect, useRef, useState } from "react";
import { CalendarClock, CheckCircle2, Sparkles, AlertTriangle, XCircle } from "lucide-react";
import type { CheckOutcome } from "@/types";
import { explainAvailability, FALLBACK_TEXT, type ExplainMode } from "@/explain";

interface ResultPanelProps {
  result: CheckOutcome | null;
  roomLabel: string | null;
  start: number | null;
  end: number | null;
}

export default function ResultPanel({ result, roomLabel, start, end }: ResultPanelProps) {
  const [mode, setMode] = useState<ExplainMode>("normal");
  const [explanation, setExplanation] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const requestRef = useRef(0);

  // A new outcome (or a different adapter mode) invalidates any previous explanation.
  useEffect(() => {
    setExplanation(null);
    setLoading(false);
    requestRef.current += 1;
  }, [result, mode]);

  if (!result) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-5 flex items-center gap-3 text-sm text-slate-500">
        <CalendarClock className="h-5 w-5 text-slate-400 shrink-0" />
        Pick a room and a start time, then check availability.
      </div>
    );
  }

  const canExplain = roomLabel !== null && start !== null && end !== null;

  const onExplain = async () => {
    if (!canExplain || loading) return;
    const requestId = ++requestRef.current;
    setLoading(true);
    setExplanation(null);

    try {
      const adapterResult = await explainAvailability(
        { roomLabel, start, end, status: result.status, code: result.code },
        mode,
      );
      if (requestRef.current !== requestId) return;
      setExplanation(adapterResult.ok ? adapterResult : { ok: false, text: FALLBACK_TEXT });
    } finally {
      if (requestRef.current === requestId) setLoading(false);
    }
  };

  const badge =
    result.status === "available"
      ? { icon: CheckCircle2, frame: "border-emerald-200 bg-emerald-50", iconColor: "text-emerald-600", title: "text-emerald-900", body: "text-emerald-800", titleText: "Available" }
      : result.status === "unavailable"
        ? { icon: XCircle, frame: "border-amber-200 bg-amber-50", iconColor: "text-amber-600", title: "text-amber-900", body: "text-amber-800", titleText: "Unavailable" }
        : { icon: XCircle, frame: "border-rose-200 bg-rose-50", iconColor: "text-rose-600", title: "text-rose-900", body: "text-rose-800", titleText: "Please fix the following" };
  const Icon = badge.icon;

  return (
    <div className="space-y-4">
      <div className={`rounded-xl border ${badge.frame} p-5 flex items-start gap-3`}>
        <Icon className={`h-6 w-6 ${badge.iconColor} shrink-0`} />
        <div>
          <p className={`font-semibold ${badge.title}`}>{badge.titleText}</p>
          {result.status !== "available" && (
            <p className={`text-sm ${badge.body} mt-0.5`}>{result.reason}</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            type="button"
            onClick={onExplain}
            disabled={!canExplain || loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 active:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 text-sm font-medium px-3 py-1.5 transition-colors"
          >
            <Sparkles className="h-4 w-4 text-sky-600" />
            {loading ? "Explaining…" : "Explain availability"}
          </button>
          <label className="flex items-center gap-2 text-xs text-slate-600 sm:ml-auto">
            Adapter mode
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as ExplainMode)}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
            >
              <option value="normal">normal</option>
              <option value="timeout">timeout</option>
              <option value="error">error</option>
              <option value="no-key">no-key</option>
            </select>
          </label>
        </div>

        {explanation && (
          <div
            className={`rounded-lg p-3 text-sm ${
              explanation.ok ? "bg-white border border-slate-200" : "bg-amber-50 border border-amber-200"
            }`}
            role="note"
          >
            <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              AI-GENERATED EXPLANATION (MOCK) — THE STATUS ABOVE IS THE OFFICIAL DECISION
            </p>
            <p className="mt-1 text-slate-700">{explanation.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}
