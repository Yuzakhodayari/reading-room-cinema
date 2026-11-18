# AGENTS.md: Autonomous CLI Equalizer Protocol

Autonomous coding agents operating in Reading Room Cinema build documentary episodes through the deterministic Equalizer compiler (`studio/src/equalizer/`). Every model acts as a discrete semantic classifier over locked script windows, while TypeScript computes all pixel coordinates, optical line breaks, camera trajectories, and spring curves.

## Context Pointers

- Reach [02_model_invariance_compiler_spec.md](file:///d:/Youtube%20channel/reading-room-cinema/docs/specs/02_model_invariance_compiler_spec.md) when modifying compiler architecture, Knuth-Plass rag math, or Viterbi cost equations.
- Reach [storyboardIR.ts](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/storyboardIR.ts) when inspecting exact discriminated-union fields for any of the 20 `BeatArchetype` payloads.
- Reach [DEEPSEEK_EQUALIZER.md](file:///d:/Youtube%20channel/reading-room-cinema/DEEPSEEK_EQUALIZER.md) when running open-weights endpoints (`deepseek-chat`, `deepseek-reasoner`, Ollama, vLLM) or offline copy-paste prompt packs.
- Reach [CLAUDE.md](file:///d:/Youtube%20channel/reading-room-cinema/CLAUDE.md) when executing through Claude Code, Antigravity, or Cursor with parallel Pass 4 batching.

## Five-Step Episode Production Loop

Run every episode build in strict sequence. Do not advance until the current step's completion criterion goes green.

### Step 1: Lock the Script (`scriptLock.ts`)

Tokenize the episode markdown script and optional Whisper word alignment via [`createScriptLock`](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/scriptLock.ts) (or `node tools/ai_director.mjs --ingest <script.md>`). Stage 0 produces an immutable `ScriptLock` containing the 64-char `scriptSha256`, `SentenceLock[]` (`S001..Sn`), `ScriptToken[]` (`S001.T01..Tm`), non-breaking lexical unit glue (`$40.5\u00A0trillion`), `BurstinessClass` tags, and the `ExtractedFact` catalog (`F001..Fk`).

- **Completion criterion**: `ScriptLockSchema.parse(scriptLock)` succeeds with `sentences.length >= 1` and every currency, percentage, date, physical unit, and primary citation indexed in `facts`.

### Step 2: Author Pruned StoryboardIR Passes 1 to 4 (`schemaPruner.ts`)

Generate `StoryboardIR` across four bounded passes so each prompt stays under 1,800 input tokens:

1. **Pass 1 (Macro Act & Entity Map)**: Declare `entities` (`ENT_*` up to 16) and `roadmaps` (`ROADMAP_*`) plus `strategyPresetId` and `forbiddenEngines` (`R43` requires at least one banned narrative engine such as `["clocked", "street", "field"]`).
2. **Pass 2 (Windowed Beat Segmentation)**: Partition `S001..Sn` contiguously into `BeatNode` spans (`B001..Bm`). Isolate `<= 6`-word `STACCATO_PUNCH` sentences into dedicated slam beats.
3. **Pass 3 (Pruned Archetype Selection)**: Call [`computeAllowedChoices`](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/schemaPruner.ts) before classifying each beat and pick `payload.archetype` strictly from `allowedArchetypes`.
4. **Pass 4 (Single-Beat Slot Hydration)**: Populate the chosen archetype's typed slots using [`getGoldExemplarPair`](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/exemplars.ts) as the structural reference.

- **Completion criterion**: [`parseStrictStoryboardIR`](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/storyboardIR.ts) returns without throwing `ForbiddenTokenError` or `ZodError`.

### Step 3: Escalate Flat Drafts & Solve Viterbi Choreography

Run [`escalateFlatBeats`](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/schemaPruner.ts) followed by [`solveViterbiChoreography`](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/viterbiChoreographer.ts). The Creativity Escalator promotes low-kinetic cards on physical mechanisms or sovereign shocks into `CUSTOM_CONTRAPTION_BLUEPRINT` rigs, `DEPTH_SANDWICH_STAGE` 5-plane composites, split-era diptychs, or flow schematics. Viterbi then assigns optimal surface registers, collision-free `1920x1080` safe-zone variants, 2.5D camera trajectories, FLIP `MATCH_MORPH` continuity cuts, and `< 3.8s` progressive sub-beat steps.

- **Completion criterion**: `choreography.maxVisualGapMs <= 3800` and `choreography.planSha256` is a 64-character hex digest.

### Step 4: Score & Self-Heal Across All 35 Broadcast Gates (`qualityGateAndHealer.ts`)

Run [`scoreStoryboard`](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/qualityGateAndHealer.ts) and, whenever `totalScore < 96` or `hardBlockerFailures > 0`, invoke [`healStoryboard`](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/qualityGateAndHealer.ts). Tier-1 AST repair resolves sentence gaps, missing citations, continuity recalls, sync drift, adjacent repeats, and window entropy drops in under 80 milliseconds. If `tier2RepairTasks` is non-empty, answer each `< 350`-token micro-prompt and re-score.

- **Completion criterion**: `finalScore.totalScore >= 96.0` and `finalScore.hardBlockerFailures === 0` (`releaseReady96 === true`).

### Step 5: Render Overlay Clips & Export DaVinci FCPXML

Hand the healed plan to `npm run render:beats` and `npm run fcpxml` inside `studio/`. Render workers stay stateless.

- **Completion criterion**: `studio/` TypeScript (`npx tsc --noEmit`) and ESLint (`npx eslint src/equalizer`) exit with code `0`, and FCPXML v1.9 lanes validate cleanly.

## Hard Production Boundaries

- Keep Remotion runtime components (`studio/src/compositions/`, `studio/src/styles/`, `studio/src/motion/`) untouched during episode storyboard authoring; express visual choices through `StoryboardIR` semantic slots.
- Reference every statistic, year, ratio, and statutory citation via `FactId` pointers (`"F041"`). Keep `ShortLabel` strings at 2 to 4 words, 28 characters maximum, with zero digits and zero hex codes.
- Anchor every `SubBeatStep` to a verbatim `TokenId` (`"S095.T18"`) inside the beat's `sentenceRange`.
- Preserve Reading Room Cinema visual rules: WCAG AAA contrast (`>= 7.0:1`), tabular lining numerals (`tnum`), warm archival substrates (`#FAF8F3`, `#F4EFE6`, `#111315`, `#0F2236`, `#141210`, `#0F1923`), and presenter-safe placement (`right-third`, `bottom-dock`, `top-bar`) on over-footage smoked-navy glass.
