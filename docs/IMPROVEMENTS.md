# Digi-Odd One Out — Improvement Plan

Planning doc for post-MVP improvements. Organized as **epics** → **tasks** → **checklists**.

**Legend**

- `[x]` Done
- `[ ]` Not started
- `[~]` In progress
- **P0** — fixes broken or confusing player experience
- **P1** — high ROI, ship soon
- **P2** — quality, retention, or maintainability
- **P3** — nice-to-have / later

---

## Epic 1: Resilient puzzle loading

**Goal:** Players never get stuck when `/api/puzzle` fails. Errors are visible, recoverable, and preserve game state.

**Priority:** P0  
**Status:** Done

### Tasks

#### Task 1.1 — Puzzle fetch error UI

- [x] Add `puzzleError` state and user-friendly `formatPuzzleError()` messages
- [x] Show **SIGNAL LOST** overlay when fetch fails (themed like existing overlays)
- [x] Provide **Retry sync** action
- [x] On retry failure mid-run, keep the last puzzle on screen
- [x] Allow **Dismiss** (and Escape) when a previous puzzle exists
- [x] Use blocking overlay when no puzzle is loaded yet

#### Task 1.2 — Puzzle client hardening (optional follow-up)

- [ ] Surface retry progress in UI when client auto-retries DB sync (`puzzleClient.ts`)
- [ ] Add exponential backoff instead of fixed 3s delay
- [ ] Log structured error codes from `/api/puzzle` for easier debugging

---

## Epic 2: Surface existing puzzle data

**Goal:** Use fields the API already returns (`connection`, `lore_hint`, speed bonus) so rounds feel clearer and more rewarding.

**Priority:** P1  
**Status:** Not started

### Tasks

#### Task 2.1 — Reveal screen copy

- [ ] Show `puzzle.connection` in the logic log on reveal (before or above `explanation`)
- [ ] Replace generic pre-reveal logic log text with a hint that a category exists (without spoiling the answer)
- [ ] Ensure copy reads well on mobile (logic log panel)

#### Task 2.2 — Speed bonus feedback

- [ ] On correct answer, briefly show points breakdown: base + speed bonus
- [ ] Animate or highlight bonus when picked under `scoreSpeedWindowMs`
- [ ] Optional: add bonus amount to HUD score increment (fly-up micro-animation)

#### Task 2.3 — Card lore hints (optional)

- [ ] Show `lore_hint` (level | type) on card hover or long-press
- [ ] Hide or simplify hints in “expert” mode (see Epic 5)
- [ ] Confirm hints do not leak the puzzle category being tested

---

## Epic 3: Refactor `+page.svelte`

**Goal:** Split the ~1,500-line page into focused modules so gameplay, UI, and styling are easier to change.

**Priority:** P1  
**Status:** Not started

### Tasks

#### Task 3.1 — Extract game logic

- [x] Create `src/lib/game/useGame.svelte.ts` (or `gameState.svelte.ts`)
- [x] Move timer management, `fetchNewPuzzle`, `handleSelect`, score/lives, and phase transitions
- [x] Keep `+page.svelte` as composition + layout only
- [x] Export typed API: `startGame`, `restartGame`, `fetchNewPuzzle`, state getters

#### Task 3.2 — Extract overlay components

- [ ] `HomeOverlay.svelte` — start screen
- [ ] `LogicLogModal.svelte`
- [ ] `PuzzleErrorOverlay.svelte` (from Epic 1)
- [ ] `GameOverModal.svelte`
- [ ] `SharePreviewModal.svelte`
- [ ] `RotateDeviceOverlay.svelte`
- [ ] `LoadingOverlay.svelte`

#### Task 3.3 — Extract game chrome

- [ ] `GameHud.svelte` — header stats + footer actions
- [ ] `CardBoard.svelte` — viewport, resize observer, `DigiCardDom` loop
- [ ] Move shared overlay/panel CSS into component scopes or `layout.css` tokens

#### Task 3.4 — Verify refactor

- [ ] `pnpm check` passes
- [ ] Manual smoke test: start → guess → reveal → next → game over → share
- [ ] No visual regressions on mobile landscape + desktop

---

## Epic 4: Player retention

**Goal:** Give players a reason to come back and compare runs.

**Priority:** P1  
**Status:** Not started

### Tasks

#### Task 4.1 — Personal best (localStorage)

- [ ] Persist high score under a stable key (e.g. `digi-odd:high-score`)
- [ ] Show high score on game over screen
- [ ] Show “New record!” when score beats previous best
- [ ] Handle private browsing / storage failures gracefully

#### Task 4.2 — Streak tracking

- [ ] Track current correct-answer streak during a run
- [ ] Persist best streak across sessions (localStorage)
- [ ] Display streak in HUD or on reveal (correct only)

#### Task 4.3 — Daily challenge (later)

- [ ] Seed `generatePuzzle()` with `YYYY-MM-DD` for deterministic daily set
- [ ] Add “Daily” badge on home screen
- [ ] Include daily seed in share card text
- [ ] Document timezone policy (UTC vs local)

---

## Epic 5: Game modes & difficulty

**Goal:** Support different skill levels without rewriting core loop.

**Priority:** P2  
**Status:** Not started

### Tasks

#### Task 5.1 — Mode definitions

- [ ] **Training** — show category name (Attribute, Level, Type, Field) before guess
- [ ] **Standard** — current behavior
- [ ] **Expert** — shorter timer, no logic log until after reveal
- [ ] Store mode in URL query or session; default to Standard

#### Task 5.2 — Mode selector UI

- [ ] Add mode toggle on home screen (or compact picker in HUD)
- [ ] Persist last selected mode in localStorage
- [ ] Wire mode flags into `GAME` constants (timer, hint visibility)

---

## Epic 6: Puzzle generation quality

**Goal:** Fairer randomization and more interesting odd-one-out picks.

**Priority:** P2  
**Status:** Not started

### Tasks

#### Task 6.1 — Correct shuffle

- [ ] Replace `sort(() => Math.random() - 0.5)` with Fisher–Yates in `puzzle.ts`
- [ ] Add unit test asserting uniform distribution (statistical smoke test)

#### Task 6.2 — Session de-duplication

- [ ] Track recently used Digimon names in client or server session
- [ ] Avoid repeating the same creature in consecutive puzzles when pool allows

#### Task 6.3 — Smarter odd-one selection (optional)

- [ ] Prefer outsiders that share level/type with the group (harder puzzles)
- [ ] Weight obscure `field` values as higher difficulty
- [ ] Optional difficulty param on `GET /api/puzzle?difficulty=`

---

## Epic 7: UX, accessibility & polish

**Goal:** Smoother play on more devices and input methods.

**Priority:** P2  
**Status:** Not started

### Tasks

#### Task 7.1 — Keyboard support

- [ ] `1`–`4` (or arrow keys) select cards during guessing
- [ ] `Enter` triggers “Initialize next sequence” on reveal
- [ ] Document shortcuts in logic log or home brief

#### Task 7.2 — Reduced motion

- [ ] Respect `prefers-reduced-motion: reduce`
- [ ] Replace rAF timer loop with lower-frequency updates when reduced motion is on
- [ ] Disable or shorten fly/scale transitions

#### Task 7.3 — Modal accessibility

- [ ] Focus trap in dialogs (home, logic log, game over, share, error)
- [ ] Return focus to trigger element on close
- [ ] Verify `aria-labelledby` / `aria-describedby` on all overlays

#### Task 7.4 — Image loading

- [ ] Skeleton or pulse placeholder while card images load
- [ ] Fallback art when `imageUrl` fails or is empty
- [ ] Optional: `loading="lazy"` where appropriate

#### Task 7.5 — Prefetch next puzzle

- [ ] After reveal, prefetch `/api/puzzle` in background
- [ ] Use prefetched result when user taps next (fallback to live fetch)
- [ ] Invalidate prefetch on error

#### Task 7.6 — Timer UX

- [ ] Show tenths or urgency styling in last 3 seconds
- [ ] Sync timer bar with displayed seconds (avoid “10s” with empty bar)

#### Task 7.7 — Portrait policy

- [ ] Decide: keep rotate overlay vs allow portrait with responsive layout
- [ ] If allowing portrait, soften or remove blocking rotate overlay on small screens

---

## Epic 8: Internationalization

**Goal:** Align runtime i18n (Paraglide) with visible game copy.

**Priority:** P2  
**Status:** Not started

### Tasks

#### Task 8.1 — Strategy decision

- [ ] **Option A:** Move all player-facing strings to Paraglide messages
- [ ] **Option B:** Remove Paraglide until a second locale is planned
- [ ] Document chosen approach in README

#### Task 8.2 — Implement Option A (if chosen)

- [ ] Extract home, HUD, overlays, and error strings to message files
- [ ] Add visible language switcher (layout currently hides locale links)
- [ ] Verify `hreflang` and localized routes still work

---

## Epic 9: Engineering quality

**Goal:** Catch regressions early and simplify the codebase.

**Priority:** P1 (tests + CI) / P2 (cleanup)  
**Status:** Not started

### Tasks

#### Task 9.1 — Unit tests for puzzle generation

- [ ] Add Vitest (or project test runner)
- [ ] Test: always 4 cards, exactly one odd index
- [ ] Test: `answer_index` points to the unique category value
- [ ] Test: error when data set too small
- [ ] Test: Fisher–Yates shuffle (after Epic 6.1)

#### Task 9.2 — Unit tests for game math & layout

- [ ] Test speed bonus at 0ms, mid-window, and after `scoreSpeedWindowMs`
- [ ] Test `computeHandLayout` for 4 cards at sample viewport sizes

#### Task 9.3 — CI pipeline

- [ ] GitHub Action: `pnpm install` → `pnpm check` → `pnpm lint` → `pnpm build`
- [ ] Run on pull requests and main
- [ ] Optional: `pnpm test` when Vitest is added

#### Task 9.4 — Dead code & dependency cleanup

- [ ] **Threlte:** remove `GameScene`, `Arena`, `DigiCard` OR re-integrate 3D path behind a flag
- [ ] **Sync:** call `startDigimonSync()` on server boot OR remove unused `sync.ts` path
- [ ] **Data path:** document single source of truth (`digimon.json` vs SQLite export pipeline)
- [ ] Remove unused deps from `package.json` after cleanup (`three`, `@threlte/*` if dropped)

#### Task 9.5 — Documentation alignment

- [ ] Update `docs/PRD.md` (SvelteKit, DOM cards, JSON export — not React/R3F)
- [ ] Fix README path references (`svelte/` → repo root)
- [ ] Link this file from README under “Roadmap” or “Improvements”

#### Task 9.6 — Production deploy

- [ ] Choose explicit SvelteKit adapter (not only `adapter-auto`)
- [ ] Set `PUBLIC_SITE_URL` for canonical and Open Graph URLs
- [ ] Verify share flow and OG image on production origin

---

## Suggested sprint order

| Sprint | Epics | Focus |
|--------|--------|--------|
| 1 | Epic 1 ✅, Epic 2 | Errors done → reveal UX & speed bonus |
| 2 | Epic 3, Epic 9.1 | Refactor page + puzzle tests |
| 3 | Epic 4, Epic 9.3 | High score + CI |
| 4 | Epic 7.1–7.3, Epic 6.1 | Keyboard, a11y, shuffle fix |
| 5 | Epic 5, Epic 6.2–6.3 | Modes + puzzle quality |
| 6 | Epic 8, Epic 9.4–9.6 | i18n decision, cleanup, deploy |

---

## Quick checklist (all epics)

Copy for tracking in issues or project boards:

```
Epic 1  Resilient puzzle loading        [x]
Epic 2  Surface existing puzzle data    [ ]
Epic 3  Refactor +page.svelte           [ ]
Epic 4  Player retention                [ ]
Epic 5  Game modes & difficulty         [ ]
Epic 6  Puzzle generation quality       [ ]
Epic 7  UX, accessibility & polish      [ ]
Epic 8  Internationalization            [ ]
Epic 9  Engineering quality             [ ]
```

---

*Last updated: 2026-06-17 — Epic 1 Task 1.1 completed (puzzle fetch error UI).*
