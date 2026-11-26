import { Check, Filter, RotateCcw, Users } from "lucide-react";
import type { RoomFilters } from "@/filtering";

interface FilterPanelProps {
  filters: RoomFilters;
  equipmentOptions: string[];
  onAttendeesChange: (value: number) => void;
  onToggleEquipment: (item: string) => void;
  onClear: () => void;
}

export default function FilterPanel({
  filters,
  equipmentOptions,
  onAttendeesChange,
  onToggleEquipment,
  onClear,
}: FilterPanelProps) {
  const isFiltered = filters.attendees > 1 || filters.equipment.length > 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center h-10 w-10 rounded-xl bg-sky-100 text-sky-700">
            <Filter className="h-5 w-5" />
          </span>
          <h2 className="text-lg font-semibold tracking-tight">Filter rooms</h2>
        </div>
        {isFiltered && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-sky-700 hover:bg-sky-50 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        )}
      </div>

      <div>
        <label htmlFor="attendees" className="block text-sm font-medium text-slate-700 mb-1.5">
          Number of attendees
        </label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            id="attendees"
            type="number"
            min={1}
            inputMode="numeric"
            value={filters.attendees}
            onChange={(e) => onAttendeesChange(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2.5 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 outline-none"
          />
        </div>
        <p className="text-xs text-slate-400 mt-1.5">Shows rooms that seat at least this many people.</p>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-slate-700 mb-2">Required equipment</legend>
        <div className="flex flex-wrap gap-2">
          {equipmentOptions.map((item) => {
            const selected = filters.equipment.includes(item);
            return (
              <button
                type="button"
                key={item}
                aria-pressed={selected}
                onClick={() => onToggleEquipment(item)}
                className={[
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                  selected
                    ? "border-sky-500 bg-sky-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50",
                ].join(" ")}
              >
                {selected && <Check className="h-3.5 w-3.5" />}
                {item}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
