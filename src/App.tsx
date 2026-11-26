import { useMemo, useReducer, type FormEvent } from "react";
import { Building2, CalendarClock, Clock } from "lucide-react";
import BookingsList from "@/components/BookingsList";
import FilterPanel from "@/components/FilterPanel";
import ResultPanel from "@/components/ResultPanel";
import RoomSelector from "@/components/RoomSelector";
import TimeInput from "@/components/TimeInput";
import { CURRENT_TIME, ROOMS } from "@/data";
import { filterRooms, listEquipment } from "@/filtering";
import { fmtTime } from "@/rules";
import { appReducer, createInitialState, requestedInterval } from "@/state";

const EQUIPMENT_OPTIONS = listEquipment(ROOMS);

export default function App() {
  const [state, dispatch] = useReducer(appReducer, undefined, createInitialState);

  const visibleRooms = useMemo(() => filterRooms(ROOMS, state.filters), [state.filters]);
  const selectedRoom = visibleRooms.find((room) => room.id === state.roomId) ?? null;
  const interval = requestedInterval(state);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selectedRoom) dispatch({ type: "check", room: selectedRoom });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-24 -mt-16 relative z-10">
        <div className="grid gap-6 lg:grid-cols-5">
          <section className="lg:col-span-3 bg-white rounded-2xl shadow-xl shadow-slate-200/60 ring-1 ring-slate-200/70 p-6 sm:p-8 space-y-8">
            <FilterPanel
              filters={state.filters}
              equipmentOptions={EQUIPMENT_OPTIONS}
              onAttendeesChange={(value) => dispatch({ type: "setAttendees", value })}
              onToggleEquipment={(item) => dispatch({ type: "toggleEquipment", item })}
              onClear={() => dispatch({ type: "clearFilters" })}
            />

            <RoomSelector
              rooms={visibleRooms}
              selectedId={selectedRoom?.id ?? null}
              onSelect={(room) => dispatch({ type: "selectRoom", room })}
              onClearFilters={() => dispatch({ type: "clearFilters" })}
            />

            <form onSubmit={onSubmit} className="space-y-6">
              <TimeInput
                startInput={state.startInput}
                duration={state.duration}
                onStartChange={(value) => dispatch({ type: "setStart", value })}
                onDurationChange={(value) => dispatch({ type: "setDuration", value })}
              />

              <button
                type="submit"
                disabled={!selectedRoom}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 transition-colors shadow-sm shadow-sky-600/20"
              >
                <CalendarClock className="h-4 w-4" />
                Check availability
              </button>
            </form>

            <ResultPanel
              result={state.result}
              roomLabel={selectedRoom ? `${selectedRoom.name} (${selectedRoom.building})` : null}
              start={interval?.start ?? null}
              end={interval?.end ?? null}
            />
          </section>

          <aside className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 ring-1 ring-slate-200/70 p-6 lg:sticky lg:top-6">
              <BookingsList room={selectedRoom} requested={interval} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="bg-gradient-to-br from-sky-700 via-sky-600 to-cyan-600 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-24">
        <div className="flex items-center gap-2 text-sky-100/90 text-sm">
          <Building2 className="h-4 w-4" />
          <span>Smart Campus</span>
        </div>
        <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">Room Availability Checker</h1>
        <p className="mt-2 text-sky-100/90 max-w-xl">
          Filter by headcount and equipment, then see if a room is free for your time slot.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1.5 text-sm">
          <Clock className="h-4 w-4" />
          Current time: <span className="font-mono font-semibold">{fmtTime(CURRENT_TIME)}</span>
        </div>
      </div>
    </header>
  );
}
