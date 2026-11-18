# CLAUDE.md: Reading Room Cinema Agent Entry Point

This file governs interactive and subagent workflows inside Claude Code, Antigravity, and Cursor for `reading-room-cinema`. Follow [AGENTS.md](file:///d:/Youtube%20channel/reading-room-cinema/AGENTS.md) for the shared five-step episode compilation contract, and apply the tool-orchestration rules below when planning or repairing edits.

## Context Pointers

- Reach [AGENTS.md](file:///d:/Youtube%20channel/reading-room-cinema/AGENTS.md) when executing a full script-to-FCPXML episode run.
- Reach [exemplars.ts](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/exemplars.ts) when hydrating any of the 20 semantic `BeatArchetype` variants during Pass 4.
- Reach [qualityGateAndHealer.ts](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/qualityGateAndHealer.ts) when inspecting any of the 35 broadcast quality gates (`G01` through `G35`) or running Tier-1 / Tier-2 healing.
- Reach [DEEPSEEK_EQUALIZER.md](file:///d:/Youtube%20channel/reading-room-cinema/DEEPSEEK_EQUALIZER.md) when delegating micro-passes to cheaper open-weights workers or exporting offline prompt packs.

## Execution Protocol for Frontier & Multi-Agent Sessions

### 1. Determinism & Remotion Runtime Discipline

Every rendered component in `studio/src/` executes as a pure function of `useCurrentFrame()` and `useVideoConfig()`. Seeded deterministic generators replace `Math.random()`. Critically-damped `spring()` presets (`SNAP_STRIKE`, `EDITORIAL_CUT`, `PRECISION_LEDGER`, `MATCH_GLIDE`, `DOCUMENT_SETTLE`) and clamped `interpolate(..., { extrapolateLeft: "clamp", extrapolateRight: "clamp" })` drive all motion without CSS `transition` or `@keyframes`.

- **Completion criterion**: `npx eslint src && npx tsc --noEmit` inside `studio/` exits with code `0`.

### 2. Parallel Pass 4 Hydration & Pruned Decoding

When authoring a full 20-minute documentary (`60` to `95` beats):

1. Run Stage 0 [`createScriptLock`](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/scriptLock.ts) once on the canonical script markdown and cache the `ScriptLock` object.
2. Run Pass 1 (entity & roadmap declarations) and Pass 2 (15-sentence sliding segmentation windows) sequentially so `sentenceRange` spans cover `S001..Sn` with zero gaps.
3. Run Pass 3 sequentially in 6-beat batches, calling [`computeAllowedChoices`](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/schemaPruner.ts) before each beat so the recency mask, `A42` monolith cap, and 8-beat Shannon entropy lookahead (`H >= 2.25` bits) prune repeated templates out of the candidate enum.
4. Dispatch Pass 4 single-beat slot hydration in parallel batches of up to 8 beats per turn. Pass each worker only its assigned beat's `SentenceLock[]`, its `ExtractedFact[]` slice, the single chosen archetype schema from [`storyboardIR.ts`](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/storyboardIR.ts), and [`getGoldExemplarPair(archetype)`](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/exemplars.ts).

- **Completion criterion**: Every hydrated beat passes [`assertZeroForbiddenTokens`](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/storyboardIR.ts) and [`BeatNodeSchema.parse`](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/storyboardIR.ts) on the first validation check.

### 3. Creativity Escalation & Self-Healing Gate

Pipe assembled `StoryboardIR` drafts directly into [`healStoryboard`](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/qualityGateAndHealer.ts) with `targetScore: 96`.

1. Verify that `3` to `6` beats across the episode use `CUSTOM_CONTRAPTION_BLUEPRINT` or `DEPTH_SANDWICH_STAGE` (`G29_SHOWSTOPPER_PEAK_DENSITY`).
2. Confirm every mention of recurring multi-act entities (such as `ENT_CLAIRE_AUSTIN`, `ENT_ESCAPE_HATCH_BOARD`, `ENT_SOVEREIGN_DEBT_WALL`, and `ENT_PAYCHECK_TO_ALLOWANCE`) carries monotonic `introduces`, `recalls`, or `roadmapUpdate` bindings (`G26_CONTINUITY_ENTITY_CLOSURE`).
3. Confirm every primary statutory, judicial, or fiscal table mention (`Table 9`, `Wielechowski v. State`, `Fair Labor Standards Act`, `Monthly Treasury Statement`) binds its exact `LEGAL_OR_DOC_CITE` `FactId` (`G03` and `G27`).

- **Completion criterion**: `healResult.finalScore.releaseReady96 === true` (`totalScore >= 96` and `hardBlockerFailures === 0`).

## Architecture Reference Table

| Module | Primary Exports | Responsibility |
| :--- | :--- | :--- |
| [scriptLock.ts](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/scriptLock.ts) | `createScriptLock`, `sha256Hex`, `applyNonBreakingUnitGlue` | Pure-TS SHA-256, sentence/token IDs, Whisper or syllable alignment, `FactCatalog` |
| [storyboardIR.ts](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/storyboardIR.ts) | `StoryboardIRSchema`, `assertZeroForbiddenTokens`, `parseStrictStoryboardIR` | 20-archetype strict Zod union, zero-CSS/pixel/hex boundary |
| [schemaPruner.ts](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/schemaPruner.ts) | `computeAllowedChoices`, `escalateFlatBeats`, `buildBeatPayloadForArchetype` | Pre-decode enum pruning, `R43` to `R47` guardrails, Creativity Escalator |
| [viterbiChoreographer.ts](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/viterbiChoreographer.ts) | `solveViterbiChoreography`, `REGISTER_PALETTE_SPECS`, `LOCKED_SPRING_PRESETS` | Global DP register/variant/camera/FLIP solver, `< 3.8s` sub-beat splitter |
| [qualityGateAndHealer.ts](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/qualityGateAndHealer.ts) | `scoreStoryboard`, `healStoryboard`, `generateSingleBeatRepairPrompt` | 35-gate `100.0`-point rubric, Tier-1 AST healer, `< 350`-token repair tasks |
| [exemplars.ts](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/exemplars.ts) | `GOLD_BEAT_EXEMPLARS`, `getGoldExemplarPair` | 20 gold Episode 01 beat fixtures |
| [index.ts](file:///d:/Youtube%20channel/reading-room-cinema/studio/src/equalizer/index.ts) | `runEqualizerPipeline`, `buildDeterministicStoryboardIR` | End-to-end deterministic compiler entry point |
