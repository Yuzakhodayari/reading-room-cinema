# Reading Room Cinema: Recovery Ledger & 16-Pillar Execution Roadmap

> [!IMPORTANT]
> Workspace: `d:/Youtube channel/reading-room-cinema`
> Target Repository: `https://github.com/Yuzakhodayari/reading-room-cinema` (`Yuzakhodayari/reading-room-studio` remains untouched at commit `534d89a`).
> Policy: Every completed engineering wave runs `npx tsc --noEmit` and `npx eslint src`, updates this ledger, and pushes directly to `origin/main`.

## 1. Forensic Recovery Summary (Session `0654f84f`)

All five architectural blueprints, the Wave 4 prompt manifest, and every completed or partial code file from the 20 prior agents were recovered intact from disk:

- **Architectural Specs Committed (`docs/specs/`)**:
  - `00_studio_master_plan.md` (16-Pillar Master Blueprint)
  - `01_video_01_visual_architecture_spec.md` (Episode 01 visual architecture, continuity state graph, `SEQ-01..42`)
  - `02_model_invariance_compiler_spec.md` (Equalizer compiler, pruned IR, Viterbi solver, quality gates)
  - `03_reading_room_enterprise_spec.md` (Dual-palette registers, optics, 2.5D camera rig, damped springs, procedural audio)
  - `04_generative_animation_novelty_spec.md` (1,380+ element registry, 2D/3D sandbox, 30-episode novelty vault)
  - `05_wave4_engineering_manifest.md` (Verbatim module contracts for Agents 9 through 20)
- **Recovered Source Modules Passing `tsc` & `eslint` (26,835 lines across 40 files in `studio/src/`)**:
  - **Pillar 4 (Complete)**: `design/fonts.ts`, `typography/prosodySync.ts`, `typography/KineticText.tsx` (all 32 modes), `typography/DataTicker.tsx`, `typography/EditorialHeadline.tsx`, `components/SourceBadge.tsx`
  - **Pillar 2 (Partial)**: `motion/physicsModels.ts` (14 physics solvers), `design/choreography.ts`
  - **Pillar 12 (Partial)**: `registry/props/propTypes.ts`, `registry/props/parametricBuilders.tsx`, `registry/props/heroContraptions.tsx`
  - **Pillar 13 (Partial)**: `generative/blueprintTypes.ts`, `generative/physics2d.ts`, `generative/spatialSolver.ts`, `generative/IsometricDiorama3D.tsx`
  - **Pillar 14 (Partial)**: `novelty/strategyPresets.ts` (all 9 `STR-*` channel presets + hard guardrails)
  - **Pillar 3B (Partial)**: `styles/diagramMetaphor.tsx` (upgraded)

## 2. Staged Execution Waves (3 to 4 Parallel Engineers Max Per Wave)

Running 13 simultaneous heavy streams caused the server drop in session `0654f84f`. Remaining work runs in four conflict-free waves with Git commits and pushes after every gate.

### Checkpoint 0: Recovery Snapshot & GitHub Initialization
- [x] Recover all 5 architectural specs and Wave 4 contracts into `docs/specs/`
- [x] Fix 3 unused imports and 7 lint issues across recovered files (`0` TS errors, `0` ESLint errors)
- [x] Create `Yuzakhodayari/reading-room-cinema` and push Commit 1 (`6f4e804`) + Handoff Notes (`61721ff`)

### Wave A: Optics, 220 Motion Primitives, 525 Props & World/US Cartography
- [x] **A1 (Pillar 1 & 10 Optics)**: `design/tokens.ts` (5 registers + OKLCH dissolve + contrast), `design/fitText.ts` (quadratic line breaker + binary-search sizing), `design/optics.tsx` (`ReadingRoomStage`, `CameraRig25D`, `OpticalLoupe`, `HighlighterStroke`), `LiquidGlassPresets.tsx` (18 presets), `PresenterDepthStage.tsx`, `EditorialBackdrop.tsx`, `LiquidGlassObject.tsx`, `ObjectLayerStage.tsx`
- [x] **A2 (Pillar 2 Motion)**: Expand `motion/primitives.ts` to 234 deterministic primitives and 434+ aliases (`661` total resolvable tokens) with `MOTION_PRIMITIVE_CATALOG`, wire 3D perspective/clip wipes into `motion/ObjectAnimator.tsx`, verify progressive sub-beats in `design/choreography.ts`
- [x] **A3 (Pillar 12 Prop Vault)**: Expand `registry/props/heroContraptions.tsx` to 45 multi-part animated rigs, build `registry/props/domainCatalogs.ts` (500 parametric vector schematics), and export unified `PROP_VAULT` (`545` items) in `registry/props/index.tsx`
- [x] **A4 (Pillar 3 Cartography)**: Build `maps/geoDatabase.ts`, `maps/atlasResolver.ts`, `maps/CinemaMapStage.tsx`, and `maps/index.ts` covering 211 countries/territories, 51 US states + D.C., and 24 named geopolitical corridors with zero false Austin fallbacks
- [x] **Gate A**: `tsc --noEmit` + `eslint` + Git commits pushed to `origin/main`

### Wave B: Procedural Audio/LUTs, 30-Episode Vault, Generative Set-Pieces & Equalizer Compiler
- [x] **B1 (Pillars 6 & 7 Audio/Color)**: Upgrade `generate-sfx.mjs` and synthesize 96 studio 48kHz WAVs; build `generate-music.mjs` and synthesize 12 seamless documentary stems; build `generate-luts.mjs` and generate 12 `.cube` LUTs; wire `SfxCue.tsx`, `MusicBed.tsx`, and `audio/soundRegistry.ts`
- [x] **B2 (Pillar 14 Novelty & Continuity)**: Build `novelty/continuityEngine.ts`, `novelty/episodeVault.ts`, `novelty/seasonRoadmap.ts` (Season 1 Episodes 1 to 11 + 30-slot blueprint), `novelty/index.ts`, and seed `studio/episodes-vault.json`
- [x] **B3 (Pillar 13 Generative Sandbox)**: Build `generative/SceneBlueprintRenderer.tsx` (3,467 lines), `generative/presetSetPieces.ts` (24 flagship Episode 1 + Season 1 animated contraption set-pieces), and `generative/index.ts`
- [x] **B4 (Pillar 15 Equalizer Compiler)**: Build `equalizer/scriptLock.ts`, `equalizer/storyboardIR.ts`, `equalizer/schemaPruner.ts` (with Creativity Escalator), `equalizer/viterbiChoreographer.ts`, `equalizer/qualityGateAndHealer.ts` (35-gate critic + two-tier auto-healer scoring `100/100` on Episode 01), `equalizer/exemplars.ts`, `equalizer/index.ts`, plus root `AGENTS.md`, `CLAUDE.md`, and `DEEPSEEK_EQUALIZER.md`
- [x] **Gate B**: `tsc --noEmit` + `eslint` + asset verification (96 WAVs, 12 music stems, 12 LUTs) + Git commits pushed to `origin/main`

### Wave C: 120 Documentary Style Recipes & AI CLI / DaVinci FCPXML v1.9 / Depth Matte Bridge
- [x] **C1 (Pillar 3A Styles)**: Upgrade `styles/docBroadcast.tsx` (12 recipes) and `styles/vintageEditorial.tsx` (10 recipes); build `styles/macroTelemetry.tsx` (22 chart recipes) and `styles/forensicExhibits.tsx` (24 primary-source and media-collision stages) — 68 recipes total
- [x] **C2 (Pillar 3B Styles)**: Upgrade `styles/dataMaps3D.tsx` (remove WebGL leak, wire `src/maps/`, 6 recipes) + `styles/diagramMetaphor.tsx` (6 recipes); build `styles/systemSimulators.tsx` (26 mechanical/plumbing simulators) and `styles/uiSatireAndCollage.tsx` (24 household, scrip, and dry-wit stages) — 62 recipes total (`130` combined across Suite A + Suite B)
- [ ] **C3 (Pillars 6, 9, 10, 15 Tooling)**: Build `tools/ai_director.mjs` (DeepSeek, OpenAI, Gemini, Anthropic, Ollama, prompt-pack, and offline deterministic compiler); upgrade `studio/scripts/export-fcpxml.mjs` (V1 punch-in keyframes, V1-V4 Depth Sandwich lanes, A1-A3 stems); build `studio/scripts/master-audio.mjs` (`-14 LUFS`); upgrade `tools/room_object_swap.py` and `tools/OBJECT_SWAP_GUIDE.md`
- [ ] **Gate C**: `tsc --noEmit` + `eslint` + Git commit & push

### Wave D: Grand Unification, 1,380+ Semantic Catalog, Showrunner & 4K Cinema Exam
- [ ] **D1 (`src/registry/catalog.ts`)**: Unified semantic catalog indexing all 1,380+ composable elements across all 16 pillars with domain/mood/weight search and inventory verification
- [ ] **D2 (Pillar 8 Showrunner & `DirectorBeatRenderer.tsx`)**: Unify `director/schema.ts` + `director/planner.ts` + `scripts/plan-edit.mjs` onto TypeScript + Zod, wire all 120 style recipes, 18 glass rigs, 32 kinetic modes, 220 motion primitives, 525 props, `SceneBlueprintRenderer`, `PresenterDepthStage`, and `episodes-vault.json` into `DirectorBeatRenderer.tsx` and `Root.tsx` (including standalone 4K/1080p full-episode compositor)
- [ ] **D3 (Pillar 11 & 16 Pipeline + Visual Exam)**: Upgrade `tools/run_pipeline.mjs`, build `studio/scripts/cinema-exam.mjs` (contact sheets + Episode 01 full compilation & 35-gate verification `>= 96/100`), and update root `README.md`
- [ ] **Gate D (Final Release Verification)**: Full `tsc` + `eslint` + Episode 01 plan compilation + Remotion PNG/MP4/FCPXML render proof + final Git commit & push to `Yuzakhodayari/reading-room-cinema`
