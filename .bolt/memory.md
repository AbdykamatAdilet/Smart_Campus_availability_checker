# Project memory

## Product intent & audience

- Room availability booking helper; generates plain-language explanations for why a room can/can't be booked.

## Brand personality & voice

- Explanations are plain-language, clear, and deterministic; never fall back to generic text when a specific reason applies.

## Visual design & UX direction

- UI is React + Tailwind via Vite (`vite-react`); icons from `lucide-react`; modules imported via `@/` alias to `src/`.
- `ResultPanel` displays availability explanations; must never show stale explanations when adapter mode (`normal` | `timeout` | `error`) or result changes.
- Timeout mode clears losing timer after race settles to avoid dangling 3500 ms timer.
- No DOM/component test suite — UI and reducer behavior verified manually.

## Decisions, constraints & rationale

- `src/explain.ts` is the adapter: `explainAvailability` handles `normal`/`timeout`/`error` modes; timeout race uses two `setTimeout` IDs and `clearTimeout`s the loser.
- Output validation enforces ≤300-char cap and no contradicting status; deterministic fallback returned on validation failure.
- Longest valid input (60-char room label max) can't generate output over 300 chars, so output-length rejection is not directly unit-tested through the public function (would require exporting validator).
- Fake timers in tests wrapped in `try/finally` to always restore real timers.
- Project structure: `src/{availability,rules,filtering,state,explain,overlaps}.ts`, `src/components/ResultPanel.tsx`; tests `src/explain.test.ts` (14) + `src/overlaps.test.ts` (6) = 20 passing.
- Real room IDs: `eng-201`, `lib-110`, `lh-3`, `sem-4b`, `mus-2`.
- Check commands: `npm test`, `npm run typecheck` (`tsc --noEmit -p tsconfig.app.json`), `npm run lint` (`eslint .`).

## Open questions & assumptions

- Whether to export the output validator for a true isolated unit test of the rejection path remains undecided.
- Authoritative global instructions live in `.bolt/prompt` (not duplicated here).