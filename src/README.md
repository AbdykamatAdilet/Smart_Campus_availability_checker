# Smart Campus Room Availability Checker

A read-only React + TypeScript prototype: pick a room, enter a start time and
duration, and check whether the slot is free. Includes an optional (mock)
"explain availability" feature that produces a plain-language explanation of
the deterministic check result.

## Setup, run, test

Requires Node.js 18+.

```bash
npm install
npm run dev        # open the printed local URL
npm test           # Vitest, runs all *.test.ts files
npm run typecheck  # tsc on the whole project
```

## Structure (`src`)

| Module | Responsibility |
|---|---|
| `types.ts` | Shared types: `Room`, `Booking`, `CheckOutcome`, `ReasonCode` |
| `data.ts` | Fictional catalog of 5 rooms (one blocked), fixed "now" = 540 |
| `rules.ts` | The only place with the interval rules: `validateInterval` (AC1, AC2) plus `fmtTime` and `parseTimeInput` |
| `availability.ts` | `checkAvailability(room, ...)` for ONE room (AC1–AC5), uses `rules.ts` |
| `filtering.ts` | Pure filters: capacity (F1), ALL equipment (F2), `listEquipment` |
| `state.ts` | Pure reducer for the UI state: selection, filters, result refresh (F4, F5) |
| `explain.ts` | Mock explanation adapter: `explainAvailability` wraps the deterministic result in plain language, with mode simulations (`normal`, `timeout`, `error`, `no-key`), input/output validation, and a deterministic fallback |
| `components/` | Rendering only: `FilterPanel`, `RoomSelector`, `TimeInput`, `BookingsList`, `ResultPanel` |
| `App.tsx` | Wires the reducer to the components |

## Design decisions

- **Blocked rooms stay in the filter result.** Being blocked is not a user
  requirement, so `filterRooms` does not remove them; they are shown as
  "blocked / under maintenance" and `checkAvailability` always reports them
  Unavailable (F3). Covered by tests F3-a and I-5.
- **Result refresh (F5).** If a result is on screen and the user switches room
  (or changes requirements), the result is recomputed for the newly selected
  room. If the times are edited, the old result is cleared because it no
  longer describes the inputs. Covered by I-4, I-6, I-7.
- **Whole minutes.** `validateInterval` rejects non-integer times, matching
  AC1.
- **Explanations never override the status.** The explanation is generated
  from the check result, validated (length cap, no contradiction with the
  status), and shown under a persistent "the status above is the official
  decision" disclaimer. Any validation failure returns a deterministic
  fallback text instead of the explanation.

## Tests

`src` currently contains 17 Vitest tests in two files:

- `src/overlaps.test.ts` — overlap/interval rule tests
- `src/explain.test.ts` — explanation adapter tests (E01–E14)

## Known limitations

- Data lives in memory; nothing is saved between page reloads.
- UI and reducer behavior are verified manually; there is no DOM or component
  test suite. (The reducer's logic is exercised indirectly through the
  deterministic `checkAvailability` tests.)
