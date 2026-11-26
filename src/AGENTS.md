# AGENTS.md
## Project
Smart Campus room availability checker. Read-only prototype with
fictional rooms (eng-201, lib-110, lh-3, sem-4b, mus-2) and fictional
bookings. User story: As a student, I want to check a room's
availability so I can choose a valid booking time.
## Structure
- src/availability.ts – pure booking rules: checkAvailability
- src/rules.ts – validateInterval, fmtTime, parseTimeInput
- src/filtering.ts – capacity and equipment filters
- src/state.ts – pure reducer for the UI state
- src/explain.ts – mock explanation adapter (explainAvailability)
- src/data.ts – fictional room fixtures (do not change)
- src/types.ts – Room, Booking, CheckOutcome, ReasonCode types
- src/components/ – RoomSelector, TimeInput, BookingsList,
ResultPanel, FilterPanel (UI only)
- src/App.tsx – page state and layout
- src/overlaps.test.ts, src/explain.test.ts – Vitest tests
## Accepted rules (must not change)
- AC1: 0 <= start < end <= 1440 and start strictly after current
time.
- AC2: reject durations longer than 120 minutes.
- AC3: reject a blocked room.
- AC4: reject overlaps; bookings touching only at endpoints are
allowed.
- AC5: do not mutate booking data.
- AC6: keep clear feedback on desktop and mobile.
## Commands
- npm install
- npm test (all tests must pass)
- npm run typecheck
## Engineering rules
- Prefer pure functions and the smallest change that solves one
problem.
- Use at most 2 patterns, and only with a written justification.
No Singleton, Factory or class hierarchies.
- Do not change UI text, styling or layout unless asked.
- Do not weaken or delete existing test assertions.
## Forbidden scope changes
- No login, backend, database, external APIs, saving or creating
bookings.
- No new pages or features.
## Reporting
After each change, report: changed files, rationale, and the exact
test command to run. Do not claim tests pass unless they were run.
