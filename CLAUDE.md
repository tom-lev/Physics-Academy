# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Physics Academy — a Brilliant.org-style interactive physics course. Static site,
zero build step: plain HTML/CSS/JS loaded via `<script>` tags in `index.html`, no
bundler, no package.json, no transpiler. Deployed via GitHub Pages from `main` at
https://github.com/tom-lev/Physics-Academy.

## Running it

There is no build/lint/test command — this project has none of those tools.

- **Serve locally** (must be http://, not file://, since it's multi-file):
  `python -m http.server 8000` from the repo root, then open `http://localhost:8000/`.
- **Syntax-check a file**: `node --check js/whatever.js` (catches typos; it's not a
  linter and won't catch semantic bugs).
- **No automated test suite exists.** Verification is manual: serve the site and
  click through it in a real browser. For headless verification, `playwright-core`
  works against the system-installed Chrome (`executablePath` pointing at
  `Program Files\Google\Chrome\Application\chrome.exe`) — install it in a scratch
  directory outside the repo, not as a project dependency, since this repo
  deliberately has no `node_modules`.

## Code style (deliberate, not legacy)

- ES5 only: `function`/`var`, no `let`/`const`/arrow functions/classes/template
  literals. This is a conscious choice to avoid needing a transpiler.
- Every file is an IIFE — `(function (root) { 'use strict'; ... })(typeof window
  !== 'undefined' ? window : globalThis);` — that attaches its API to a shared
  `window.PA` namespace and, where the module has no DOM dependency (`store.js`,
  `fmt.js`, `physics.js`), also exports via `module.exports` so it's importable
  from Node for quick sanity checks.
- No comments explaining *what* code does — names carry that. A comment is only
  for a non-obvious *why* (a formula's derivation, a workaround, a subtle
  invariant). Keep this sparse, dry style when editing existing files.

## Architecture

### Load order is the dependency graph

`index.html`'s `<script>` tags run in order and each file assumes everything
before it has already populated `window.PA`:

```
store.js → fmt.js → physics.js → simkit.js → sims.js → curriculum.js
  → lessons/toolkit.js → lessons/kinematics.js → lessons/projectile.js
  → lessons/forces.js → ... → engine.js → sync.js → app.js
```

Adding a new lesson file means adding its `<script>` tag in that block, after
`curriculum.js` (which it depends on) and before `engine.js`/`app.js`.

### Module responsibilities

- **`store.js`** (`PA.store`) — progress persistence: XP, day streak, per-lesson
  completion/best-score. Backed by `localStorage`, degrades to an in-memory
  object if storage is blocked. **No cross-device sync** — progress is scoped to
  one browser on one device.
- **`fmt.js`** (`PA.fmt`) — turns lesson-author source strings into HTML: a small
  inline LaTeX-ish math subset (`$...$`, `\frac`, `^`/`_`, greek letters) plus
  `**bold**`/`*italic*`/`` `code` `` markdown. This is what every `body`/`prompt`
  string in lesson content gets run through — never hand-write HTML in lesson
  files, write the math/markup source and let `fmt.inline`/`fmt.rich` render it.
- **`physics.js`** (`PA.kin`) — pure physics functions, SI units, no DOM. This is
  the single source of truth: every graded numeric answer in every lesson *and*
  every simulation's math routes through these same functions, so a lesson's
  answer key and its interactive sim can never silently disagree. When a chapter
  needs new physics, add small composable pure functions here (mirroring the
  existing style: `stoppingDistance`, `projectilePosition`, etc.) rather than
  inlining formulas in lesson files or sim `draw()` callbacks.
- **`simkit.js`** (`PA.simkit.build(host, spec)`) — generic canvas sim builder.
  Given a `spec` (state object, `controls` for sliders/segmented-toggles,
  `readouts`, an optional `goal`, optional `buttons`, an optional `animate(state,
  dt)` for time-based sims, and a `draw(ctx, w, h, state, drawHelpers)`), it
  builds the whole `.sim` DOM block, wires inputs to state, and redraws on every
  change. `PA.simkit.draw` has the shared canvas primitives (`grid`, `ground`,
  `circle`, `dashedV`/`dashedH`, `arrow`, `label`).
- **`sims.js`** (`PA.sims`) — concrete sim factories (`drop`, `brake`,
  `vectorAdd`, `projectile`, ...), each a function `(args) -> spec` consumed by
  `simkit.build`. Referenced from a lesson step by string key.
- **`curriculum.js`** (`PA.curriculum`) — course structure: `tiers[]` →
  `chapters[]`, each chapter starting with an empty `lessons: []`. Chapter
  metadata (icon, color, blurb, kicker) lives here; **lesson content does not**.
  A chapter with an empty `lessons` array renders as a locked/"Soon" card on the
  home page — this is how unauthored chapters stay visible in the course map
  without needing content yet.
- **`js/lessons/<chapter-id>.js`** — one file per chapter, each an IIFE that
  looks up its chapter via `PA.curriculum.findChapter(id)` and `.push()`es lesson
  objects (each `{ id, title, sub, steps: [...] }`) into it. This is where all
  actual course content lives. See the "Step schema" section below.
- **`engine.js`** (`PA.engine.start(chapter, lesson, opts)`) — the lesson player.
  Builds the full-screen `.player` overlay, renders one step at a time, grades
  answers, tracks score, and on completion calls `PA.store.completeLesson(...)`.
- **`app.js`** (`PA.app`) — hash router (`#/` = course map, `#/chapter/<id>` =
  lesson path) and the two corresponding view renderers into `#view`. Also owns
  the toast helper and the topbar XP/streak chips (subscribed to
  `PA.store.onChange`).

### Step schema (the content-authoring contract)

Every lesson is `{ id, title, sub, steps: [...] }`. Each step has a `kind` and
kind-specific fields — see the header comment in `engine.js` for the full
authoritative list, but in short:

- `lesson` — pure explanation: `body` (rich text), optional `callout`, `formula`
  (itself optionally carrying `vars: [{sym, mean}]`, rendered as a "who's who"
  legend under the formula). Also optional `hook` (a short relatable scenario
  rendered above `body`, before the formal definition) and `prereq` (a fixed
  callout above everything else in the step, reserved for a chapter's opening
  lesson, spelling out assumed background knowledge).
- `mcq` — `prompt`, `options[]`, `correct` (index), `explain`. Optional
  `wrongExplain: {idx: 'text'}` keyed by an option's original index (same
  indexing as `correct`) — a misconception-specific explanation shown instead
  of `explain` when that particular wrong option is picked.
- `numeric` — `prompt`, `unit`, `correct`, `tol`, `decimals`, `explain`. `tol`
  should stay generous enough that reasonable learner rounding still passes.
- `order` — `prompt`, `items[]` given **already in correct order** (the engine
  shuffles them for display and checks the learner's reordering).
- `sim` — `prompt`, `simId` (key into `PA.sims`), `args` passed to that factory,
  optional `note`. Each factory in `sims.js` may also declare `kind` (its own
  stable type name) and `orient: {text}` — a one-time, dismissible orientation
  banner shown the first time that sim *type* appears anywhere in the app
  (tracked in `localStorage`), independent of which lesson step renders it.

**Voice — apply this to every `body`, `hook`, and `callout` in every chapter,
new and existing:** write like a young, enthusiastic teacher who's genuinely
excited about the topic, not a textbook. The goal of every sentence is to
keep the reader interested and motivated to keep going, not just to be
technically correct. Concretely: open with (or build on) a vivid, specific
real-world example — not "a car" but a roller coaster's speed readout, not
"an object" but a dropped phone — and let the formal definition grow out of
that example rather than precede it. Favor a confident, conversational
register ("Here's the thing about...", a rhetorical question, a concrete
stake) over the passive, hedged tone dry reference material defaults to.
This doesn't mean padding — keep it as tight as a drier version would be,
just spend the words on texture instead of throat-clearing.

**Notation audit — required before a chapter counts as done.** Every math
symbol, operation, or notation convention that appears inside any `tex`
string (exponents, $\sin$/$\cos$, $\sqrt{}$, the Pythagorean theorem,
$\vec{}$ for vectors, subscripts, whatever's next) must have an explicit
teaching moment at its *first appearance anywhere in the curriculum* —
via `hook`/`body`, a `formula.vars` entry, or a `callout`. It is not
enough for a symbol to be *used correctly* by the answer key; a first-time
learner must be able to see where it came from before being graded on it.
This bit repeatedly in this chapter's build: negative exponents, trig
values, $\vec{}$ notation, and the Pythagorean theorem were all used
before being taught, and each was only caught by a learner actually
getting stuck mid-question — not by reading the source. Concretely: before
marking a chapter finished, list every distinct notation/operation it
introduces and check each one against this rule; don't rely on read-through
review alone to catch this class of gap.

**Beginner-friendliness conventions — apply these to every new chapter, not
just the four below:**

- Every lesson's *first* step (`kind: 'lesson'`) gets a `hook`: one or two
  sentences grounding the concept in a concrete, everyday scenario, before
  the formal definition in `body`. Write the formal definition second, not
  first — the hook exists so a total beginner has something to picture
  before the abstraction lands.
- The *first* lesson of a chapter also gets `prereq` on that same opening
  step: one sentence naming the background the chapter assumes (specific
  math skills, or which earlier chapters/lessons it leans on).
- Any `formula` a learner will need to *use* (not just admire) should carry
  `vars`, spelling out what each symbol means — skip it only for formulas
  that are already self-explanatory inline (e.g. a labeled list of prefix
  values).
- For `mcq` steps, add `wrongExplain` to the 1–2 distractors that represent
  a real, specific misconception — not every wrong option needs one; a
  distractor that's just obviously wrong can fall through to the generic
  `explain`.
- If a chapter introduces a new sim type in `sims.js`, give that factory a
  `kind` and a one-sentence `orient` describing what to drag/watch for.

The four chapters built so far (`toolkit`, `kinematics`, `projectile`, `forces`
— in that build order) are good reference examples for tone, step-mix, and how
later chapters explicitly cross-reference concepts taught in earlier ones (e.g.
projectile motion's velocity components reusing the vector-components lesson
from `toolkit.js`). Next up, in order: `energy` (Work & Energy), `momentum`,
`circular-gravity`, `rotational`, `fluids`, then Tier 2 onward — see
`curriculum.js` for the full chapter list and ids.

### Styling

`css/style.css` is one dark-first design system with no external assets and no
per-component CSS files. Class names there (`.step`, `.opt`, `.numinput`,
`.orderitem`, `.sim`, `.sim-goal`, `.readout`, `.ctrl`, etc.) are the contract
between `engine.js`/`simkit.js` (which generate that markup) and the stylesheet
— don't rename one side without the other. New lesson/sim content should almost
never need new CSS; if it does, that's a signal to double check you're not
reinventing an existing pattern.

### Cross-device sync (optional, additive layer)

`store.js` itself is still pure localStorage/single-device — that has not changed.
`js/sync.js` (`PA.sync`) is a separate opt-in layer on top: a permanent, reusable
"sync code" pairs a browser with `server/`, a small Express API (`POST /api/sync`
generates a code, `GET /api/sync/:code` fetches stored state, `PUT /api/sync/:code`
merges and stores it) backed by Upstash Redis. Merge policy (applied identically
server-side and client-side, since either side may be the one merging): `xp` takes
the max of both; `streak` keeps whichever side has the more recent `lastDay`; each
`lessons[id]` is unioned, with `done` OR'd and `best`/`attempts`/`lastTs` maxed —
this means progress never silently regresses when an out-of-date device syncs.
`sync.js` mutates the object `store.all()` returns by reference and calls the
existing `addXp(0)` purely to reuse `store`'s own save/notify pipeline, rather than
adding a new public method to `store.js`. It auto-pulls once on load if a code is
saved, and auto-pushes (debounced ~2.5s) on `store.onChange` while a code is
linked; any network failure fails silently into `PA.sync.status()`, never breaking
local-only usage. `js/sync.js`'s `API_BASE` constant points at the live deployed
backend, `https://physics-academy-nuxi.onrender.com` (Render free tier — the
service sleeps after ~15min idle, so the first request after a lull can take
30-50s to wake it). The pairing UI lives at the `#/sync` route in `app.js`,
reached from the small 🔄 icon in the topbar. Redeploying `server/` only
requires a `git push` — Render auto-deploys `main`; the Upstash credentials
live in Render's environment variables, never in the repo.

### Curriculum scope

The full course is 26 chapters across 7 tiers (`PA.curriculum.tiers`), from
foundational units/vectors through mechanics, waves, thermo, E&M, optics, and
modern physics. Most chapters are currently placeholders (empty `lessons[]`,
shown as locked "Soon" cards) — content is being authored chapter by chapter.
