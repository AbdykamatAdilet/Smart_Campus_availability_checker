import { Building2, DoorClosed } from "lucide-react";
import { overlaps } from "@/availability";
import { fmtTime } from "@/rules";
import type { Room } from "@/types";

interface BookingsListProps {
  room: Room | null;
  requested: { start: number; end: number } | null;
}

export default function BookingsList({ room, requested }: BookingsListProps) {
  if (!room) {
    return (
      <div className="text-sm text-slate-500">Select a room to see its schedule.</div>
    );
  }

  const bookings = room.bookings.slice().sort((a, b) => a.start - b.start);

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Building2 className="h-4 w-4 text-slate-400" />
        <h3 className="font-semibold text-slate-900">{room.name}</h3>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        {room.building} · seats {room.capacity}
      </p>

      {room.blocked ? (
        <div className="rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm p-4">
          <p className="font-medium flex items-center gap-2">
            <DoorClosed className="h-4 w-4" /> Room blocked
          </p>
          <p className="mt-1 text-rose-700/90">{room.blockReason}</p>
        </div>
      ) : bookings.length === 0 ? (
        <p className="text-sm text-slate-500">No existing bookings today.</p>
      ) : (
        <ul className="space-y-2">
          {bookings.map((booking) => {
            const conflicts =
              requested !== null &&
              overlaps(requested, booking);
            return (
              <li
                key={`${booking.start}-${booking.end}`}
                className={[
                  "flex items-center justify-between gap-3 rounded-lg border px-3 py-2 transition-colors",
                  conflicts ? "border-amber-300 bg-amber-50" : "border-slate-200",
                ].join(" ")}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{booking.title}</p>
                  {conflicts && (
                    <p className="text-xs font-medium text-amber-700">Overlaps your requested time</p>
                  )}
                </div>
                <span className="shrink-0 text-xs font-mono text-slate-600 bg-slate-100 rounded-md px-2 py-1">
                  {fmtTime(booking.start)}–{fmtTime(booking.end)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
