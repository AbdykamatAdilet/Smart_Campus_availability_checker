import { DoorClosed, MapPin, SearchX, Users } from "lucide-react";
import type { Room } from "@/types";

interface RoomSelectorProps {
  rooms: Room[];
  selectedId: string | null;
  onSelect: (room: Room) => void;
  onClearFilters: () => void;
}

export default function RoomSelector({ rooms, selectedId, onSelect, onClearFilters }: RoomSelectorProps) {
  if (rooms.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <span className="mx-auto grid place-items-center h-12 w-12 rounded-full bg-white text-slate-400 ring-1 ring-slate-200">
          <SearchX className="h-6 w-6" />
        </span>
        <p className="mt-4 font-semibold text-slate-900">No rooms match these filters</p>
        <p className="mt-1 text-sm text-slate-500">Try fewer attendees or fewer equipment requirements.</p>
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-4 inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-sky-700 ring-1 ring-slate-200 hover:bg-sky-50 transition-colors"
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">
        Room <span className="text-slate-400 font-normal">({rooms.length} matching)</span>
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {rooms.map((room) => {
          const selected = room.id === selectedId;
          return (
            <button
              type="button"
              key={room.id}
              onClick={() => onSelect(room)}
              aria-pressed={selected}
              className={[
                "text-left rounded-xl border p-4 transition-all duration-200 active:scale-[0.99]",
                selected
                  ? "border-sky-500 bg-sky-50/60 ring-2 ring-sky-500/30"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{room.name}</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{room.building}</span>
                  </p>
                </div>
                {room.blocked ? (
                  <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-100 rounded-full px-2 py-0.5">
                    <DoorClosed className="h-3 w-3" /> Blocked
                  </span>
                ) : (
                  <span className="inline-flex shrink-0 items-center text-[11px] font-medium text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5">
                    Open
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> Seats {room.capacity}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
