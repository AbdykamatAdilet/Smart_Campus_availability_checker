import { Clock, Timer } from "lucide-react";
import { MAX_DURATION_MINUTES } from "@/rules";

interface TimeInputProps {
  startInput: string;
  duration: number;
  onStartChange: (value: string) => void;
  onDurationChange: (value: number) => void;
}

export default function TimeInput({ startInput, duration, onStartChange, onDurationChange }: TimeInputProps) {
  return (
    <div className="grid sm:grid-cols-2 gap-5">
      <div>
        <label htmlFor="start" className="block text-sm font-medium text-slate-700 mb-1.5">
          Start time (24-hour)
        </label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            id="start"
            type="time"
            value={startInput}
            onChange={(e) => onStartChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2.5 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 outline-none"
          />
        </div>
        <p className="text-xs text-slate-400 mt-1.5">Must be later than the current time.</p>
      </div>

      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-slate-700 mb-1.5">
          Duration: {duration} min
        </label>
        <div className="relative pt-2">
          <Timer className="absolute left-0 top-0 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            id="duration"
            type="range"
            min={15}
            max={MAX_DURATION_MINUTES}
            step={15}
            value={duration}
            onChange={(e) => onDurationChange(Number(e.target.value))}
            className="w-full accent-sky-600"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
            <span>15</span>
            <span>60</span>
            <span>{MAX_DURATION_MINUTES}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
