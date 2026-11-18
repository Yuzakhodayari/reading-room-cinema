# Reading Room Cinema 2027: 16-Pillar Architecture, 1,202-Element Registry, Generative Physics Sandbox & 30-Episode Novelty Vault

Target Workspace: `d:\Youtube channel\reading-room-cinema\studio` (Remotion `4.0.544`, React `19.3.1`, TypeScript `5.9.3`, Three `0.187.0`, D3 `7.9.2`, Zod `4.6.7`).

---

## 0. System Evolution: 11 Core Modules Expanded to 16 System Pillars

All 11 modules from the baseline repository (`docs/STYLE_CATALOG.md` Part 2) remain intact with zero breaking export changes. Five new pillars (#12 through #16) turn fixed overlays into a deterministic generative animation studio capable of shipping 30 distinct episodes in 2027 without repeating visual gags.

| Pillar | Name | Exact Target Paths (`studio/src/` & `tools/`) | Baseline Preserved & Upgrade Scope |
|---|---|---|---|
| **#1** | **Dual-Palette Tokens, Fonts & Choreography** | `src/design/tokens.ts`, `src/design/fonts.ts`, `src/design/choreography.ts` | Keeps `PAGE_PALETTE`, `OVER_FOOTAGE_PALETTE`, `FONTS`, `SPRINGS`, `EASINGS`, `resolveLayerLifecycle`. Expands `STYLE_FAMILIES` from 8 to 10 sub-palettes and adds per-episode `EpisodeMotifTokens` (`motifPrimary`, `motifSecondary`, `surfaceTexture`). |
| **#2** | **Stage & Smoked-Navy Liquid Glass** | `src/components/glass/CameraPreviewStage.tsx`, `LiquidGlassObject.tsx`, `LiquidGlassPresets.tsx`, `EditorialBackdrop.tsx` | Keeps `LiquidGlassObject` (`blur(12px) saturate(165%) brightness(0.66)` + 10px XOR perimeter bevel) and original 6 presets. Adds 12 new optical/depth presets (18 total). |
| **#3** | **Multi-Object & Presenter Depth-Sandwich Stage** | `src/components/layers/ObjectLayerStage.tsx`, `src/components/layers/DepthSandwichStage.tsx` | Keeps `ObjectLayerStage`. Adds 5-plane Z-compositing (`z-skybox`, `z-behind-presenter`, `z-presenter-matte`, `z-over-shoulder-glass`, `z-foreground-telestrator`) driven by MediaPipe `selfie_segmenter` alpha track mattes. |
| **#4** | **Deterministic Motion & Physics Vocabulary** | `src/motion/primitives.ts`, `src/motion/ObjectAnimator.tsx`, `src/registry/motion-registry.ts` | Keeps all 57 existing `EntryAction`, `ExitAction`, and `InPlaceAction` literals. Expands to **216 deterministic primitives** + **360 fuzzy/LLM alias tokens**. |
| **#5** | **Kinetic Typography Engine** | `src/typography/KineticText.tsx`, `DataTicker.tsx`, `EditorialHeadline.tsx`, `src/registry/typography-registry.tsx` | Keeps 7 `KineticTextMode` values, `DataTicker`, and 4 `HeadlineVariant` values. Expands to **32 addressable typography modes**. |
| **#6** | **Procedural 96-SFX & 12-Stem Music Engine** | `src/components/SfxCue.tsx`, `MusicBed.tsx`, `scripts/generate-sfx.mjs`, `scripts/generate-music-beds.mjs` | Keeps all 20 existing WAV names and cosine speech ducking (`computeMusicBedVolume`). Synthesizes **96 procedural 48kHz WAVs** and **12 multi-energy procedural music stems**. |
| **#7** | **Primary-Source Citation & Provenance Badges** | `src/components/SourceBadge.tsx` | Keeps lower-left (`64px, 38px`) badge API. Adds SEC EDGAR accession pills, Treasury TIC/Table 9 line highlights, court docket stamps, and automatic dual-palette contrast. |
| **#8** | **AI Director Brain, Zod v4 Schema & Plan Healer** | `src/director/schema.ts`, `src/director/planner.ts`, `scripts/plan-edit.mjs` | Keeps `DirectorBeat`, `DirectorPlan`, `STYLE_CATALOG`, `buildDraftDirectorPlan`, `validateDirectorPlan`. Adds `zod@^4.6.7` schemas, LLM-token healing, and `SceneBlueprint` beat payloads. |
| **#9** | **Remotion 4.0 Root & Beat Compositions** | `src/Root.tsx`, `src/compositions/DirectorBeatRenderer.tsx`, `StudioShowcase.tsx`, `TreasuryTable9Scene.tsx`, `TreasuryOverlayCard.tsx` | Keeps all 4 registered compositions (`TreasuryTable9-Full`, `TreasuryTable9-Overlay`, `StudioShowcase`, `DirectorBeat`). Adds `ShowstopperPreview` and `RegistryAuditGrid`. |
| **#10** | **Render, 12-LUT Color Science & 4-Lane FCPXML** | `scripts/prep-aroll.mjs`, `render-overlays.mjs`, `export-fcpxml.mjs`, `scripts/generate-luts.mjs`, `luts/*.cube` | Keeps 3 original `.cube` LUTs and FCPXML v1.9 output. Expands to **12 algorithmic 33x33x33 `.cube` LUTs** and 4-video-lane DaVinci Resolve depth-sandwich FCPXML timelines. |
| **#11** | **Python Whisper, MediaPipe Matte & Rig Bounds** | `tools/run_pipeline.mjs`, `transcribe.py`, `room_object_swap.py`, `benchmark_media.py` | Extends `auto-person-mask` in `room_object_swap.py` to emit `aroll_person_mask.mp4` + per-frame `presenter_rig_bounds.json` (`headBox`, `torsoBox`, `leftShoulderAnchor`, `rightShoulderAnchor`). |
| **#12** | **1,202-Element Combinatorial Creative Registry** | `src/registry/index.ts`, `motion-registry.ts`, `style-registry.ts`, `camera-registry.ts`, `audio-lut-registry.ts` | Unified `O(1)` typed index over 216 motions, 120 style recipes, 660 props, 32 type modes, 18 glass/depth presets, 36 camera rigs, 12 LUTs, 96 SFX, and 12 music beds (**1,202 canonical IDs**). |
| **#13** | **660-Atom Procedural Vector & Mechanical Prop Vault** | `src/registry/prop-vault.tsx`, `src/registry/props/*.tsx` (15 domain rig files) | Parametric SVG/Canvas mechanical rigs with live articulated sub-parts (`rotorDeg`, `valveOpen`, `fluidPct`, `tearGap`, `cableSag`, `ledBits`) across 15 macro/tech/war/finance domains. |
| **#14** | **Deterministic XPBD 2D/2.5D Physics & Fluid Solver** | `src/generative/physics2d.ts`, `src/generative/prng.ts` | Pure seeded Mulberry32 + 240Hz fixed-substep XPBD solver (rigid bodies, springs, balance scales, catenary cables, dominoes, hydraulic flow, Voronoi shatter) pre-baked per beat for `O(1)` frame lookup. |
| **#15** | **Model-Agnostic `SceneBlueprint` & Auto-Polish Compiler** | `src/generative/SceneBlueprint.tsx`, `spatialSolver.ts`, `autoPolish.ts`, `blueprintSchema.ts` | Compiles minimal JSON contraptions emitted by any LLM (including DeepSeek) into collision-free, palette-locked, foley-synced, spring-polished Remotion animations. |
| **#16** | **30-Episode Anti-Repetition & Novelty Vault** | `src/novelty/episodeVault.ts`, `vault/episodes-vault.json`, `scripts/audit-novelty.mjs` | Cross-episode ledger enforcing cooldown decay, TF-IDF cosine structural novelty, per-episode Signature Visual Motifs, and 3 Viral Showstopper Peaks per video across 30+ episodes. |

---

## 1. The 1,202-Element Combinatorial Registry (`src/registry/`)

### Exact Canonical Element Count Breakdown

| Domain Catalog | Module Path | Baseline | 2027 Target | Implementation Mechanism |
|---|---|---|---|---|
| Motion & Physics Primitives | `src/registry/motion-registry.ts` + `src/motion/primitives.ts` | 57 | **216** (+360 aliases) | Parametric kinematics + XPBD trajectory curves + 3D perspective transforms + SVG stroke-dash solvers |
| Documentary & Metaphor Style Recipes | `src/registry/style-registry.ts` + `src/styles/*.tsx` | 24 | **120** (10 families x 12) | Composable family shells x layout topologies x data/prop slots; original 24 IDs preserved verbatim |
| Procedural Vector & Mechanical Props | `src/registry/prop-vault.tsx` + `src/registry/props/*.tsx` | 0 | **660** (15 domains x 44) | 15 domain SVG/Canvas rig engines x 44 parametric/curated mechanical blueprints with animatable joints |
| Kinetic Typography Modes | `src/registry/typography-registry.tsx` | 12 | **32** | 4 sub-engines (Spoken Word, Archival Redaction, Quantitative Odometer, Cinema Intertitles) x 8 modes |
| Liquid Glass & Depth-Sandwich Presets | `src/components/glass/LiquidGlassPresets.tsx` + `DepthSandwichStage.tsx` | 6 | **18** | 10 smoked-navy optical glass shells + 8 presenter behind-shoulder / foreground sandwich rigs |
| Virtual Camera & 3D Parallax Moves | `src/registry/camera-registry.ts` | 5 | **36** | 2.5D frustum pan/dolly/rack-focus/dutch-tilt/isometric-orbit/split-diopter matrix evaluators |
| Color-Science `.cube` 3D LUTs | `src/registry/audio-lut-registry.ts` + `luts/*.cube` | 3 | **12** | Algorithmic 33x33x33 tetrahedral color transform generator (`scripts/generate-luts.mjs`) |
| Procedural 48kHz PCM SFX WAVs | `src/registry/audio-lut-registry.ts` + `scripts/generate-sfx.mjs` | 20 | **96** | 8 physical synthesis families (glass, paper, mechanical, data, map/radar, stamp/gavel, electrical, transitions) x 12 |
| Procedural Multi-Energy Music Beds | `src/registry/audio-lut-registry.ts` + `scripts/generate-music-beds.mjs` | 1 | **12** | 12 deterministic offline PCM stems (4 energy bands: `calm`, `pulse`, `tense`, `drop-silence` x 3 tonal palettes) |
| **TOTAL CANONICAL ELEMENTS** | `src/registry/index.ts` | **128** | **1,202** | **Zero empty stubs; 100% deterministic frame functions** |

---

### 1A. 216 Deterministic Motion & Physics Primitives (`src/motion/primitives.ts` & `src/registry/motion-registry.ts`)

`src/motion/primitives.ts` keeps every existing export (`ENTRY_ACTIONS`, `EXIT_ACTIONS`, `IN_PLACE_ACTIONS`, `MOTION_SPRINGS`, `calcEntryMotion`, `calcExitMotion`, `calcInPlaceMotion`, `countUpValue`, `staggerOffset`, `progressFill`, `readingDuration`, `steppedHold`, `combineMotionStyles`) and delegates extended primitive evaluation to `src/registry/motion-registry.ts`.

#### Exact Taxonomy of All 216 Primitives

1. **Entries (`64` total = `21` legacy + `43` new)**:
   - *Legacy 21 preserved*: `pop-out`, `elastic-open`, `slide-left`, `slide-right`, `slide-up`, `slide-down`, `whip-slide`, `curtain-wipe`, `iris-reveal`, `paper-unfold`, `flip-x`, `flip-y`, `stamp-slam`, `blur-snap`, `zoom-burst`, `shutter-flash`, `bounce-drop`, `skew-wipe`, `accordion-unfold`, `rubber-snap`, `zoom-punch`.
   - *Mechanical & Hydraulic Entries (12)*: `hydraulic-press-down`, `hydraulic-lift-up`, `pneumatic-lock-left`, `pneumatic-lock-right`, `guillotine-drop`, `vault-door-swing`, `solari-flap-cascade`, `gantry-lower`, `ratchet-step-in`, `piston-thrust`, `turnstile-spin-in`, `scale-beam-drop`.
   - *Archival, Paper & Legal Entries (11)*: `dossier-slide-desk`, `microfilm-snap`, `blueprint-unroll-x`, `blueprint-unroll-y`, `wax-seal-press`, `notary-emboss`, `clipping-toss`, `ledger-page-turn`, `redaction-bar-reveal`, `receipt-feed-up`, `carbon-copy-peel`.
   - *3D Perspective & Optical Entries (10)*: `hinge-drop-top`, `hinge-swing-left`, `isometric-rise`, `orthographic-extrude`, `loupe-pop-focus`, `prism-refract-in`, `depth-emerge-behind`, `parallax-stride-in`, `card-deal-arc`, `monolith-tilt-up`.
   - *Data, Vector & Signal Entries (10)*: `path-stroke-draw`, `radar-sweep-reveal`, `oscilloscope-lock`, `matrix-row-cascade`, `bar-grow-baseline`, `sankey-flood-in`, `node- burst-graph` (`node-graph-bloom`), `crt-beam-open`, `satellite-lock-reticle`, `sonar-ping-appear`.

2. **Exits (`40` total = `12` legacy + `28` new)**:
   - *Legacy 12 preserved*: `fade-out`, `slide-left`, `slide-right`, `slide-up`, `slide-down`, `pop-down`, `blur-fade`, `curtain-close`, `iris-close`, `fade-blur-out`, `skew-wipe`, `zoom-punch`.
   - *Physical & Destructive Exits (14)*: `shatter-voronoi`, `paper-tear-split`, `guillotine-sever`, `trapdoor-drop`, `sink-underwater`, `incinerate-ash-edge`, `shredder-strip-down`, `domino-topple-out`, `cable-snap-recoil`, `vacuum-collapse`, `hydraulic-retract`, `pendulum-swing-off`, `magnet-pull-off`, `conveyor-carry-right`.
   - *Editorial & Optical Exits (14)*: `solari-flip-blank`, `dossier-close-fold`, `microfilm-whip-next`, `crt-line-collapse`, `defocus-bokeh-out`, `redact-blackout-exit`, `ink-bleed-dissolve`, `blueprint-roll-tight`, `depth-recede-behind`, `split-barn-doors`, `stamp-void-dismiss`, `ticker-scroll-off`, `radar-fade-decay`, `glass-evaporate`.

3. **In-Place Effects & Continuous Loops (`72` total = `24` legacy + `48` new)**:
   - *Legacy 24 preserved*: `highlight-sweep`, `underline-draw`, `circle-telestrator`, `lens-zoom`, `tilt-3d`, `float-idle`, `pulse-warning`, `nudge`, `shake-alert`, `focus-dim`, `ken-burns`, `split-compare`, `glow-rim`, `glitch-jitter`, `card-tilt-3d`, `spotlight-vignette`, `split-push-left`, `split-push-right`, `parallax-hover`, `dial-rotate`, `magnifier-pan`, `border-trace`, `orbit-float`, `card-flip-180`.
   - *Mechanical & Gauge Loops (16)*: `pendulum-tick-1hz`, `turbine-spin-rpm`, `watt-meter- eddy` (`watt-meter-spin`), `needle-redline-flutter`, `piston-reciprocate`, `conveyor-belt-march`, `gear-mesh-cw`, `gear-mesh-ccw`, `balance-scale-oscillate`, `hydraulic-pressure-tremor`, `check-valve-chatter`, `gavel-double-tap`, `solari-digit-flutter`, `crane-trolley-shuttle`, `escapement-step-12fps`, `gyro-gimbal-precess`.
   - *Editorial Callouts & Inspection (16)*: `loupe-scan-row`, `caliper-measure-span`, `red-pen-strike`, `margin-bracket-draw`, `footnote-zoom-callout`, `watermark-shimmer`, `caustic-edge-sweep`, `paper-grain-breathe`, `halftone-pulse`, `redact-bar-slide`, `audit-row-step`, `crosshair-track`, `bounding-box-lock`, `split-loupe-ab`, `stamp-recoil-hold`, `ink-highlighter-double`.
   - *Geopolitics, Grid & Finance Loops (16)*: `radar-cone-360`, `sonar-ripple-ring`, `seabed-current-sway`, `cable-packet-pulse`, `capital-flow-dash`, `yield-spread-widen`, `transformer-hum-60hz`, `server-led-blink-random`, `euv-laser-burst`, `drone-hover-bob`, `anchor-drag-scrape`, `debt-clock-blur`, `sankey-particle-stream`, `contagion-ripple`, `blockade-ring-constrict`, `vault-drain-vortex`.

4. **Parametric Physics & 3D Trajectory Primitives (`40` new — `TrajectoryAction`)**:
   - Deterministic continuous multi-keyframe transforms evaluated via exact closed-form mechanics:
   - `ballistic-lob-arc`, `parabolic-interceptor-arc`, `catenary-sag-settle`, `catenary-cut-whip`, `spring-tether-pull`, `double-pendulum-chaotic-seeded`, `domino-cascade-wave`, `newton-cradle-transfer`, `buoyancy-surface-bob`, `subsea-sink-drift`, `centrifuge-spiral-out`, `vortex-funnel-in`, `magnetic-snap-grid`, `elastic-collision-rebound`, `friction-slide-stop`, `inclined-plane-slip`, `lever-fulcrum-see-saw`, `pulley-counterweight-lift`, `cam-follower-lift`, `geneva-drive-index`, `s-curve-lane-change`, `bezier-dock-shoulder-left`, `bezier-dock-shoulder-right`, `depth-orbit-around-presenter`, `z-pass-behind-shoulders`, `z-emerge-over-shoulder`, `isometric-conveyor-step`, `orthographic-explode-layers`, `orthographic-collapse-stack`, `accordion-pleat-wave`, `origami-quarter-unfold`, `spiral-ledger-fan`, `card-cascade-deal`, `shockwave-radial-displace`, `fault-line-shear`, `hydraulic-head-equalize`, `siphon-transfer-curve`, `pik-snowball-compound`, `circular-spv-carousel`, `cliff-edge-freefall`.

#### Mathematical Formulation & TypeScript Specification (`src/registry/motion-registry.ts`)

```typescript
// d:\Youtube channel\reading-room-cinema\studio\src\registry\motion-registry.ts
import type { CSSProperties } from "react";
import type { SpringConfig } from "remotion";
import type { EntryAction, ExitAction, InPlaceAction, MotionTransform } from "../motion/primitives";

export type TrajectoryAction =
  | "ballistic-lob-arc"
  | "parabolic-interceptor-arc"
  | "catenary-sag-settle"
  | "catenary-cut-whip"
  | "spring-tether-pull"
  | "double-pendulum-chaotic-seeded"
  | "domino-cascade-wave"
  | "newton-cradle-transfer"
  | "buoyancy-surface-bob"
  | "subsea-sink-drift"
  | "centrifuge-spiral-out"
  | "vortex-funnel-in"
  | "magnetic-snap-grid"
  | "elastic-collision-rebound"
  | "friction-slide-stop"
  | "inclined-plane-slip"
  | "lever-fulcrum-see-saw"
  | "pulley-counterweight-lift"
  | "cam-follower-lift"
  | "geneva-drive-index"
  | "s-curve-lane-change"
  | "bezier-dock-shoulder-left"
  | "bezier-dock-shoulder-right"
  | "depth-orbit-around-presenter"
  | "z-pass-behind-shoulders"
  | "z-emerge-over-shoulder"
  | "isometric-conveyor-step"
  | "orthographic-explode-layers"
  | "orthographic-collapse-stack"
  | "accordion-pleat-wave"
  | "origami-quarter-unfold"
  | "spiral-ledger-fan"
  | "card-cascade-deal"
  | "shockwave-radial-displace"
  | "fault-line-shear"
  | "hydraulic-head-equalize"
  | "siphon-transfer-curve"
  | "pik-snowball-compound"
  | "circular-spv-carousel"
  | "cliff-edge-freefall";

export type CanonicalMotionId = EntryAction | ExitAction | InPlaceAction | TrajectoryAction; // 64 + 40 + 72 + 40 = 216

export interface MotionEvaluationContext {
  frame: number;
  fps: number;
  startFrame: number;
  durationFrames: number;
  seed?: number;                 // Deterministic per-beat Mulberry32 seed
  intensity?: number;            // Default 1.0; clamped [0.25, 2.0]
  anchorFrom?: [number, number]; // Pixel coordinates for trajectory primitives
  anchorTo?: [number, number];
  isJokeOrClimax?: boolean;      // Controls director softening rules
}

export interface ExtendedMotionTransform extends MotionTransform {
  svgStrokeDashoffset?: number;
  zPlaneOverride?: "behind-presenter" | "over-shoulder" | "foreground";
  subPartScalar?: number;        // Normalized [0, 1] scalar piped into mechanical Prop Atoms
  cssVars?: Record<`--rr-${string}`, string | number>;
}

export interface MotionPrimitiveSpec {
  id: CanonicalMotionId;
  phase: "entry" | "exit" | "in-place" | "trajectory";
  family: "editorial" | "mechanical" | "archival" | "optical-3d" | "physics-kinematic" | "signal-data";
  defaultDurationFrames: number;
  springConfig: SpringConfig;
  defaultSfx?: string;
  peakOnly?: boolean;
  evaluate: (ctx: MotionEvaluationContext) => ExtendedMotionTransform;
}

export const MOTION_PRIMITIVES: Readonly<Record<CanonicalMotionId, MotionPrimitiveSpec>>;
export const MOTION_ALIAS_TABLE: Readonly<Record<string, CanonicalMotionId>>; // 360+ fuzzy/legacy/LLM aliases

export function resolveMotionToken(
  rawToken: string,
  expectedPhase?: "entry" | "exit" | "in-place" | "trajectory",
  isJokeOrClimax?: boolean
): CanonicalMotionId;
```

**Closed-Form Kinematics (Zero Copy-Paste Bloat)**:
Instead of writing 216 ad-hoc `if/else` blocks, `motion-registry.ts` builds all 216 specs from **9 parameterized kinematic kernels**:
1. **Damped Harmonic Oscillator**: $x(t) = 1 - e^{-\zeta \omega_0 t}\left(\cos(\omega_d t) + \frac{\zeta}{\sqrt{1-\zeta^2}}\sin(\omega_d t)\right)$ where $\omega_d = \omega_0\sqrt{1-\zeta^2}$, driving `hydraulic-*`, `stamp-*`, `scale-beam-*`, `gavel-*`.
2. **Geneva / Escapement Quantizer**: $q(t, N) = \frac{\lfloor N \cdot t \rfloor + \text{smoothstep}(0.72, 1.0, \{N \cdot t\})}{N}$ for `ratchet-step-in`, `escapement-step-12fps`, `geneva-drive-index`, `solari-*`.
3. **3D Perspective Hinge Matrix**: `perspective(${P}px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${tz}px)` with `transformOrigin` pinned to spine edges (`top`, `left`, `50% 100%`) for `vault-door-swing`, `solari-flap-cascade`, `origami-quarter-unfold`, `orthographic-explode-layers`.
4. **Ballistic & Interceptor Parabola**: $\mathbf{p}(u) = (1-u)\mathbf{p}_0 + u\mathbf{p}_1 + \begin{bmatrix} 0 \\ -4 h_{\text{apex}} u(1-u) \end{bmatrix}$ with tangent heading $\theta(u) = \text{atan2}(p'_y(u), p'_x(u))$ for `parabolic-interceptor-arc`, `card-deal-arc`, `cliff-edge-freefall`.
5. **Catenary & Snap-Whip Solver**: $y(x, t) = a(t)\cosh\left(\frac{x - x_c}{a(t)}\right) - a(t)$; on `catenary-cut-whip` at $t \ge t_{\text{cut}}$, splits curve at $x_{\text{cut}}$ and adds decaying whip wave $A e^{-4\tau}\sin(14\tau - k x)$.
6. **Depth-Sandwich Z-Curve**: Interpolates `scale` + `blur` + `zPlaneOverride` across presenter shoulder boundaries (`z-pass-behind-shoulders`, `depth-orbit-around-presenter`).
7. **Voronoi / Tear Clip-Path Generator**: Seeded deterministic polygon clip-paths pushed radially by impulse $\mathbf{v}_i \cdot t + \frac{1}{2}\mathbf{g}t^2$ (`shatter-voronoi`, `paper-tear-split`, `guillotine-sever`).
8. **Exponential / PIK Compounding Curve**: $s(u) = \frac{(1 + r)^{N u} - 1}{(1 + r)^N - 1}$ for `pik-snowball-compound`, `yield-spread-widen`, `debt-clock-blur`.
9. **360-Token Alias Resolution (`resolveMotionToken`)**: Maps all legacy aliases (`"enter"`, `"focus"`, `"dock"`, `"highlight"`, `"glass-exit"`, `"fade-blur"`) plus 350+ natural LLM verbs (`"slam"`, `"drop-in"`, `"type-in"`, `"draw-path"`, `"spin"`, `"pendulum"`, `"shatter"`, `"tear"`, `"flip-3d"`, `"zoom-in"`, `"behind-speaker"`, `"radar-sweep"`, `"float"`, `"pulse"`, `"wipe-left"`) via exact dictionary lookup first, then normalized token-stem Levenshtein/cosine fallback within `expectedPhase`. Any LLM hallucinated motion string resolves deterministically to a valid `CanonicalMotionId`.

---

### 1B. 120 Documentary & Metaphor Style Recipes Across 10 Families (`src/registry/style-registry.ts`)

**100% Backward Compatibility Rule**:
- All **5 original `StyleEngineFamily` literals** (`"liquid-glass"`, `"doc-broadcast"`, `"vintage-editorial"`, `"diagram-metaphor"`, `"data-maps-3d"`) remain valid and expand to **10 `StyleEngineFamily` literals** by adding 5 specialized documentary/metaphor families.
- All **24 original `STYLE_CATALOG` recipe IDs** (`liquid-glass-card`, `liquid-glass-dock`, `liquid-glass-toast`, `doc-news-package`, `doc-caption-news`, `doc-visual-investigation`, `doc-archive-light-table`, `doc-live-countdown-split`, `doc-telestrator`, `doc-kino-montage`, `doc-city-symphony`, `vintage-newsreel`, `vintage-silent-film`, `vintage-collage`, `vintage-spy-titles`, `vintage-stained-glass`, `diagram-sticker`, `diagram-stick-figure`, `diagram-instruction-manual`, `diagram-isometric`, `data-map-explainer`, `data-physical-card`, `data-white-model-3d`, `data-blob-simulation`) keep their **exact IDs, props, and `DirectorBeatRenderer` dispatch behavior** as the first 24 entries of the 120-recipe registry (`STYLE_CATALOG` in `planner.ts` re-exports `ALL_120_STYLE_RECIPES`).

#### All 10 Style Families x 12 Recipes = 120 Style Recipes

| # | `StyleEngineFamily` | Palette Default | Recipes (`12` per family; **bold** = preserved original 24 IDs) | Target Visual Worlds |
|---|---|---|---|---|
| 1 | `liquid-glass` | `over-footage` | **`liquid-glass-card`**, **`liquid-glass-dock`**, **`liquid-glass-toast`**, `liquid-glass-pill-stack`, `liquid-glass-split-versus`, `liquid-glass-toolbar-scrub`, `liquid-glass-shoulder-wing`, `liquid-glass-loupe-callout`, `liquid-glass-ticker-ribbon`, `liquid-glass-metric-triptych`, `liquid-glass-dossier-drawer`, `liquid-glass-warning-banner` | Talking-head A-roll anchoring, quick receipts, live counters over shoulder |
| 2 | `doc-broadcast` | `page` / `over-footage` | **`doc-news-package`**, **`doc-caption-news`**, **`doc-visual-investigation`**, **`doc-archive-light-table`**, **`doc-live-countdown-split`**, **`doc-telestrator`**, **`doc-kino-montage`**, **`doc-city-symphony`**, `doc-cspan-hearing-slate`, `doc-bloomberg-terminal-clean`, `doc-evidence-red-string`, `doc-split-fact-check` | Investigative desk boards, congressional hearings, yield/auction alerts |
| 3 | `vintage-editorial` | `page` | **`vintage-newsreel`**, **`vintage-silent-film`**, **`vintage-collage`**, **`vintage-spy-titles`**, **`vintage-stained-glass`**, `vintage-1930s-depression-ledger`, `vintage-1941-ration-booklet`, `vintage-company-scrip-voucher`, `vintage-bretton-woods-cable`, `vintage-patent-blueprint-1910`, `vintage-broadsheet-frontpage`, `vintage-microfiche-reader` | Ep #1 1933 Fisher / 1912 coal scrip / 1941 rationing, historical parallels |
| 4 | `diagram-metaphor` | `page` | **`diagram-sticker`**, **`diagram-stick-figure`**, **`diagram-instruction-manual`**, **`diagram-isometric`**, `diagram-balance-scale-court`, `diagram-rube-goldberg-chain`, `diagram-hydraulic-plumbing`, `diagram-conveyor-bottleneck`, `diagram-tug-of-war`, `diagram-house-of-cards`, `diagram-escape-hatch-doors`, `diagram-funnel-sieve` | Physical/mechanical visual metaphors, tax plumbing, debt traps |
| 5 | `data-maps-3d` | `page` | **`data-map-explainer`**, **`data-physical-card`**, **`data-white-model-3d`**, **`data-blob-simulation`**, `data-transit-corridor-map`, `data-bathymetry-cross-section`, `data-chokepoint-strait-zoom`, `data-grid-transmission-map`, `data-sovereign-yield-spread`, `data-waterfall-bridge-chart`, `data-demographic-pyramid`, `data-sankey-capital-flow` | Ep #6 PJM/China copper, Ep #7 Taiwan, Ep #9 550 seabed cables, Ep #10 France/Greece, Ep #11 2032 OASI |
| 6 | `sec-forensic-ledger` *(new)* | `page` | `forensic-10k-footnote-zoom`, `forensic-treasury-tic-table`, `forensic-bdc-pik-schedule`, `forensic-irs-form-941-split`, `forensic-fannie-mae-covenant`, `forensic-depreciation-stretch`, `forensic-spv-circular-loop`, `forensic-balance-sheet-t-account`, `forensic-waterfall-seniority`, `forensic-rollover-maturity-wall`, `forensic-escrow-bill-shock`, `forensic-audit-redline-diff` | Ep #1 Table 9, Ep #2 TIC/GENIUS Act, Ep #3 10-K/CoreWeave SPV, Ep #4 BDC PIK, Ep #5 FAIR Plan, Ep #11 Form 941 |
| 7 | `defense-tactical-hud` *(new)* | `over-footage` / `page` | `tactical-radar-vls-salvo`, `tactical-cost-exchange-ledger`, `tactical-carrier-threat-ring`, `tactical-maritime-ais-track`, `tactical-anchor-drag-sonar`, `tactical-blockade-insurance-zone`, `tactical-drone-lidar-roof-scan`, `tactical-magazine-depletion-bar`, `tactical-satellite-sar-pass`, `tactical-kill-switch-telemetry`, `tactical-munitions-queue-gantt`, `tactical-strait-ais-freeze` | Ep #5 drone roof LiDAR, Ep #7 Taiwan blockade & EUV kill-switch, Ep #8 $20k drone vs $4M SM-6, Ep #9 Baltic/Red Sea sabotage |
| 8 | `industrial-grid-scada` *(new)* | `page` | `scada-substation-one-line`, `scada-transformer-waitlist-queue`, `scada-watt-scale-comparator`, `scada-mine-17yr-timeline`, `scada-refining-monopoly-bars`, `scada-euv-wafer-litho-stage`, `scada-nuclear-ppa-lockup`, `scada-port-crane-automation`, `scada- auction-clearing-spike` (`scada-capacity-auction-spike`), `scada-copper-concentrate-funnel`, `scada-datacenter-gw-meter`, `scada-grid-frequency-droop` | Ep #1 1GW microwaves/PJM/TMI/port cranes, Ep #6 94GW & 128-wk transformers, Ep #7 2nm/A16 fabs |
| 9 | `ui-satire-wallet` *(new)* | `over-footage` / `page` | `satire-expiring-wallet-app`, `satire-cloud-credit-checkout`, `satire-saas-seat-slasher`, `satire-landlord-tweet-reply`, `satire-nonrenewal-push-alert`, `satire-veto-pen-budget-slider`, `satire-compute-token-ticker`, `satire-force-placed-notice`, `satire-bond-vigilante-orderbook`, `satire-company-store-terminal`, `satire-autopay-nsf-bounce`, `satire-ai-agent-pr-merge` | Ep #1 Musk tweet / expiring yuan / cloud credits / Alaska veto, Ep #4 AI agent seat cuts, Ep #5 escrow notice |
| 10 | `cinema-setpiece-stage` *(new)* | `page` / `over-footage` | `setpiece-behind-shoulder-colossus`, `setpiece-split-century-mirror`, `setpiece-guillotine-budget-cut`, `setpiece-domino-contagion-run`, `setpiece-ocean-floor-slice`, `setpiece-circular-money-machine`, `setpiece-vault-sand-timer`, `setpiece-scale-tipping-point`, `setpiece-three-doors-trap`, `setpiece-debt-snowball-hill`, `setpiece-cable-sever-blackout`, `setpiece-generative-blueprint` | Viral Peak Showstoppers + Generative `SceneBlueprint` execution |

---

### 1C. 660 Procedural Vector & Mechanical Prop Atoms (`src/registry/prop-vault.tsx` & `src/registry/props/*.tsx`)

**Zero-Bloat Parametric Rig Architecture**:
Writing 660 standalone hand-pasted SVG files creates unmaintainable bloat. Writing empty placeholder boxes ruins visual authority. Instead, `src/registry/props/` defines **15 Domain Rig Engines** (`src/registry/props/<domain>.tsx`), where each engine contains **4 parametric mechanical archetypes** driven by a typed `PropGeometryRecipe` table (`11` curated real-world variants per archetype = `44` distinct, historically and technically accurate props per domain, `15 x 44 = 660` canonical prop atoms).

Every prop atom renders deterministic crisp vector geometry (`rx=0` archival precision on ledger plates, dual-palette strokes `#1C2B3A` / `#FAF8F3` / `#A3402E` / `#2F8F8B`, hairline cross-hatching, and live articulated sub-joints animated at 30/60fps via `joints` props or `SceneBlueprint` physics bindings).

```typescript
// d:\Youtube channel\reading-room-cinema\studio\src\registry\prop-vault.tsx
import type { CSSProperties, ReactNode } from "react";
import type { PaletteMode } from "../director/schema";

export type PropDomain =
  | "treasury-sovereign"   // 44 props: T-bills, TIC ledgers, JGB/OAT bonds, gold bars, auction gavels, debt clocks
  | "ai-compute-silicon"   // 44 props: H100/B200/R100 racks, EUV scanner, 2nm wafer, token burn meter, SPV loop
  | "private-credit-bank"  // 44 props: BDC schedule, PIK toggle switch, covenant padlock, mezzanine tranche tower
  | "housing-insurance"    // 44 props: Austin bungalow, roof LiDAR drone, escrow thermometer, foreclosure padlock
  | "grid-energy-mining"   // 44 props: 500kV LPT transformer, 128-wk queue, copper pit, PJM dial, TMI cooling tower
  | "naval-air-defense"    // 44 props: Ford carrier, VLS 96-cell grid, SM-6 interceptor, $20k delta drone, Phalanx
  | "subsea-maritime"      // 44 props: Garden-hose fiber cross-section, repeater, dragging ship anchor, LNG/boxship
  | "labor-industrial"     // 44 props: STS robotic port crane, driverless drayage truck, 1955 picket sign, assembly arm
  | "legal-governance"     // 44 props: Veto fountain pen, guillotine budget blade, SCOTUS docket, GENIUS Act stamp
  | "historical-scrip"     // 44 props: Island Creek brass scrip, 1941 UK ration book, 1933 Fisher ledger, coal cart
  | "pension-demographics" // 44 props: OASI trust vault, Form 941 payroll funnel, 2032 cliff calendar, birthrate cradle
  | "ui-satire-fintech"    // 44 props: Expiring yuan wallet, cloud-credit mirage card, SaaS seat counter, X post card
  | "chokepoint-commod"    // 44 props: Hormuz/Malacca/Panama locks, oil barrel stack, grain silo, potash hopper, SWIFT
  | "healthcare-corp"      // 44 props: Dental X-ray lightbox, PBM rebate siphon, PE rollup funnel, patent cliff bottle
  | "telestrator- drafting" // 44 props (`telestrator-drafting`): Vernier caliper, optical loupe, red-string pin, balance scale, hydraulic pipe
  ;

export interface PropJointState {
  primary?: number;        // [0..1] main actuator: plunger, blade height, valve aperture, crane trolley, needle
  secondary?: number;      // [0..1] secondary joint: pan tilt, tear split, fluid level, magazine fill
  angleDeg?: number;       // Continuous rotation: turbine, watt-meter disk, radar sweep, gear teeth
  ledMask?: number;        // 16-bit integer bitmask driving server rack / VLS cell status LEDs
  highlightPart?: string;  // Sub-element ID to rim-light in brickRed (#A3402E) or teal (#2F8F8B)
  labelOverride?: string;  // Dynamic serial number, yield %, dollar tag, or vessel name
}

export interface PropAtomProps {
  propId: string;          // e.g. "subsea-maritime/cable-cross-section-armored"
  paletteMode?: PaletteMode;
  width?: number;
  height?: number;
  joints?: PropJointState;
  strokeScale?: number;
  style?: CSSProperties;
}

export interface PropAtomSpec {
  id: string;
  domain: PropDomain;
  archetype: string;
  displayName: string;
  viewBox: [number, number];
  defaultJoints: Required<Omit<PropJointState, "highlightPart" | "labelOverride">>;
  anchorPorts: Record<string, [number, number]>; // Named ports ("inlet", "outlet", "panLeft", "hook", "tip") for pipes/springs
  tags: string[];
  renderSvg: (props: PropAtomProps, resolvedFrame: number) => ReactNode;
}

export const PROP_VAULT: Readonly<Record<string, PropAtomSpec>>; // 660 entries
export function PropAtom(props: PropAtomProps): JSX.Element;
```

#### Complete 15-Domain x 44-Prop Matrix (Season 1 Ep #1–#11 + 20+ Future Geopolitics/Finance/Tech Domains)

| # | Domain File (`src/registry/props/`) | 4 Parametric Archetypes (`x 11` variants = `44` props) | Season 1 & 2027 Episode Coverage |
|---|---|---|---|
| 1 | `treasurySovereign.tsx` | (a) Sovereign Bond Certificate (`90d-tbill`, `10y-ust`, `30y-jgb`, `10y-oat-france`, `10y-greece`, `gilts`...), (b) Rollover Conveyor & Maturity Wall, (c) Central Bank Bullion / Reserve Stack (`boj`, `fed`, `ecb`, `pboc`, `tether-treasury`, `circle-reserve`), (d) Yield-Spread Basis Caliper & Auction Gavel | **Ep #1** ($40.5T debt), **Ep #2** (Tokyo vs Tether $132.4B), **Ep #10** (France 4.93% vs Greece 4.26%), BRICS gold |
| 2 | `aiComputeSilicon.tsx` | (a) Liquid-Cooled GPU Rack (`h100-8u`, `b200-nvlink`, `gb300`, `depreciated-6yr-rack`...), (b) ASML High-NA EUV Scanner & Tin-Droplet Laser + Kill-Switch Relay, (c) FinFET/GAA Wafer Die Map (`tsmc-n2`, `tsmc-a16`, `phoenix-n4`, `packaging-cowos`), (d) Circular SPV Equity-Debt Pipe & Token Burn Meter | **Ep #1** (UBC tokens, $740B CapEx), **Ep #3** ($176B 6-yr depreciation, CoreWeave/Nvidia SPV), **Ep #7** (Taiwan 2nm & EUV kill-switch) |
| 3 | `privateCreditBank.tsx` | (a) BDC Loan Book & Tranche Waterfall (`arcc`, `bxsl`, `obdc`, `senior-1l`, `unitranche`), (b) Mechanical PIK Toggle Valve (flips cash pipe into compounding debt pipe), (c) Leveraged Buyout Per-Seat Meter, (d) Shadow-Bank Repo / Eurodollar Balance T-Account | **Ep #4** ($2.5T Private Credit, 6.3% default, 50% PIK toggles), Subprime Auto ABS, Regional Bank CRE |
| 4 | `housingInsurance.tsx` | (a) Isometric Single-Family Home (`austin-bungalow`, `florida-gable-roof`, `calif-brush-hill`, `ac-condenser-unit`), (b) Quadcopter Roof-Scan LiDAR Cone & Shingle Heat-Grid, (c) Monthly Mortgage + Variable Escrow Split Bar, (d) Force-Placed Policy Stamp & Sheriff Lockset | **Ep #1** (Claire $3,400 mortgage + August AC), **Ep #5** ($13.4T mortgages, CA FAIR +29.1%, drone roof non-renewal) |
| 5 | `gridEnergyMining.tsx` | (a) Extra-High-Voltage Large Power Transformer (`500kv-lpt`, `345kv-autotransformer`, `grain-oriented-steel-core`, `128wk-queue-crate`), (b) Wattage Comparator (`10w-charger`, `1kw-microwave`, `1gw-city`, `5gw-ai-campus`), (c) Open-Pit Copper Terraces & Refining Smelter Funnel, (d) Nuclear / Gas / Hydro Generation Unit (`tmi-unit1-tower`, `smr-vessel`, `ccgt-turbine`, `pjm-auction-meter`) | **Ep #1** (1M microwaves, PJM +833%, TMI lockup), **Ep #6** (94GW gap, 17.5-yr copper mine, China 72% refining) |
| 6 | `navalAirDefense.tsx` | (a) Surface Combatant Hull & Radar Dome (`cvn78-carrier`, `ddg51-aegis`, `frigate`, `unmanned-usv`), (b) Mk 41 VLS Vertical Launch Cell Matrix (`96-cell-cutaway` with depleting LED cells), (c) Interceptor Missile (`sm6-dual-ii`, `sm2-block-iiic`, `patriot-pac3`, `thaad`), (d) Low-Cost Autonomous One-Way Drone (`shahed-delta`, `fpv-quad`, `decoy-uav`) | **Ep #8** ($20k drone vs $13B carrier & $4M SM-6 100:1 war math), **Ep #7** (Strait blockade), Defense Prime backlogs |
| 7 | `subseaMaritime.tsx` | (a) Submarine Fiber Cable Cutaway (`17mm-deep-sea-polyethylene`, `double-armored-shallow`, `copper-power-conductor`, `erbium-optical-repeater`), (b) Ocean Bathymetry Trench & Dragging Ship Anchor (`hall-anchor-fluke`, `severed-fiber-arc`), (c) Commercial Hull (`panamax-boxship`, `shadow-tanker-eagle-s`, `cable-layer-ship`, `lng-membrane-carrier`), (d) Maritime War-Risk Insurance Certificate | **Ep #7** (Taiwan shipping insurance pull), **Ep #9** (550 garden-hose cables, $10T/day SWIFT, Baltic/Red Sea cuts) |
| 8 | `laborIndustrial.tsx` | (a) Ship-to-Shore Gantry Crane (`1955-manual-boom` vs `2034-autonomous-sts`), (b) Autonomous Yard Tractor & Warehouse AMR Robot, (c) Factory Payroll Timeclock & W-2 Paystub Tear-Off, (d) Capitol Picket / Bargaining Lever Fulcrum | **Ep #1** (1955 Rotterdam/Detroit strike vs 2034 robotic port, $120 running shoe labor breakdown), Freight Rail PSR |
| 9 | `legalGovernance.tsx` | (a) Executive Veto Fountain Pen & Budget Line Slicer, (b) Mechanical Budget Guillotine (`22pct-oasi-blade`, `50pct-pfd-blade`), (c) Congressional Act & Court Opinion Plate (`genius-act-2025`, `wielechowski-v-state`, `flsa-1938`, `sec-reg-sk`), (d) Debt-Ceiling Countdown Clock & Parliamentary Gavel | **Ep #1** (Alaska Gov. Walker veto, 2036 CBO wall), **Ep #2** (GENIUS Act), **Ep #11** (automatic statutory cut) |
| 10 | `historicalScrip.tsx` | (a) Company Coal Scrip (`island-creek-brass-token-50c`, `logan-county-paper-scrip`, `company-store-ledger`), (b) Wartime Ration Coupon Booklet (`uk-1941-ministry-of-food-16pt`, `canned-meat-tin`, `fuel-ration-stamp`), (c) 1930s Great Depression Bank Passbook & Gold-Standard Chain, (d) Empty Departing Airliner Seat (perishable capacity metaphor) | **Ep #1** (1912 West Virginia coal scrip, Dec 1 1941 UK rationing, 1933 Irving Fisher, perishable Tuesday compute) |
| 11 | `pensionDemographics.tsx` | (a) Social Security OASI Trust Vault (`special-issue-bond-drawer`, `sand-hourglass-2032`), (b) IRS Form 941 12.4% FICA Dual-Inlet Funnel (`human-w2-stream` vs `gpu-zero-tax-bypass`), (c) Demographic Age-Cohort Pyramid (`us-boomer-bulge`, `sk-072-inversion`, `japan-super-aged`), (d) Retiree Benefit Check with Perforated 24%-Cut Stub | **Ep #11** (Q4 2032 Social Security cliff, 12.4% FICA vs 0% GPUs, 0.72 South Korea birthrate), Muni pension traps |
| 12 | `uiSatireFintech.tsx` | (a) Programmable Expiring Wallet Phone UI (`shenzhen-6day-yuan-timer`, `20pct-exit-toll-modal`), (b) Cloud-Credit Dashboard vs Bank Rent Bounce (`aws-100k-credit` -> `chase-0-usd`), (c) SaaS Seat-License Deprovision Counter (`500-seats-to-40`), (d) Social Post / Wire Alert Frame (`x-post-quote`, `bloomberg-red-headline`, `fair-plan-hike-letter`) | **Ep #1** (Musk X post, Shenzhen digital yuan, AWS credits), **Ep #4** (SaaS seat cuts), **Ep #5** (FAIR Plan notice) |
| 13 | `chokepointCommod.tsx` | (a) Canal Lock & Strait Gate (`panama-gatun-lock`, `hormuz-tanker-lane`, `suez-trench`, `malacca-funnel`), (b) Strategic Petroleum / Grain / Rare-Earth Silo & Barrel Gauge, (c) SWIFT / CIPS / mBridge Cross-Border Clearing Switchboard, (d) Tariff / Export-Control Customs Gate (`nov27-truce-barrier`) | **Ep #6** (China Nov 27 export-ban deadline), **Ep #9** (SWIFT $10T/day), Season 2 Commodity & Chokepoint episodes |
| 14 | `healthcareCorp.tsx` | (a) Clinical Diagnostic & Cost Breakdown (`dental-xray-film`, `hospital-chargemaster-scroll`, `iv-bag-meter`), (b) PBM Rebate Siphon & Insurance Prior-Auth Stamp, (c) Corporate Tax IP-Routing Conduit (`delaware-ireland-sandwich`, `100pct-bonus-depreciation-shield`), (d) Portfolio Margin-Loan Collateral Vault (`borrow-against-stock-pledge`) | **Ep #1** (Dental X-ray unit cost, 100% chip write-off, Ireland IP routing, buy-borrow-die), Season 2 Healthcare/PE |
| 15 | `telestratorDrafting.tsx` | (a) Precision Two-Pan Balance Scale (`debt-vs-payroll`, `cost-exchange-100-to-1`, `yield-france-vs-greece`), (b) Segmented Hydraulic Pipe, Check-Valve & Pressure Manifold, (c) Optical Magnifying Loupe, Vernier Caliper & Red-Ink Stamp, (d) Domino Tile, Newton Cradle Sphere & Rube-Goldberg Chute | Universal mechanical connectors across all 30 episodes and Generative `SceneBlueprint` contraptions |

---

### 1D. Typography (32), Glass & Depth-Sandwich (18), Cameras (36), LUTs (12), SFX (96), Music Beds (12)

#### 1. 32 Kinetic Typography Modes (`src/registry/typography-registry.tsx`)
Preserves all 7 `KineticTextMode` values + 4 `HeadlineVariant` values + `DataTicker`, expanding into 4 sub-engines x 8 modes:
- **Sub-Engine A — Spoken Word & Rhetoric (`8`)**: `word-pop` *(legacy)*, `karaoke-highlight` *(legacy)*, `typewriter` *(legacy)*, `split-lines` *(legacy)*, `whisper-karaoke-pill`, `syllable-cadence-underline`, `contrast-flip-pair`, `deadpan-punchline-drop`.
- **Sub-Engine B — Archival, Legal & Correction (`8`)**: `stamp-slam` *(legacy)*, `marker-sweep` *(legacy)*, `red-correction` *(legacy)*, `blackout-redaction-unveil`, `sec-footnote-magnify`, `contract-clause-strike`, `microfilm-focus-lock`, `notary-emboss-title`.
- **Sub-Engine C — Quantitative & Financial Odometer (`8`)**: `data-ticker-countup` *(legacy `DataTicker`)*, `solari-split-flap-number`, `debt-odometer-blur`, `basis-point-spread-tick`, `percentage-bar-inline`, `currency-devalue-shrink`, `ratio-inversion-100x`, `countdown-cliff-clock`.
- **Sub-Engine D — Cinema & Broadcast Intertitles (`8`)**: `newspaper-cutout` *(legacy)*, `broadcast-lower-third` *(legacy)*, `spy-title` *(legacy)*, `chapter-card` *(legacy)*, `constructivist-slab-title`, `dossier-tab-header`, `silent-intertitle-ornate`, `cold-open-thesis-lock`.

#### 2. 18 Liquid Glass & Presenter Depth-Sandwich Presets (`src/components/glass/LiquidGlassPresets.tsx` & `src/components/layers/DepthSandwichStage.tsx`)
- **10 Smoked-Navy Optical Glass Presets (`over-footage`)**:
  1. `GlassCard` *(legacy `card`)*
  2. `GlassCornerPill` *(legacy `pill`)*
  3. `GlassBottomDock` *(legacy `dock`)*
  4. `GlassFloatingToolbar` *(legacy `toolbar`)*
  5. `GlassToastAlert` *(legacy `toast`)*
  6. `GlassSplitModal` *(legacy `split-modal`)*
  7. `GlassMetricTriptych` (3 synchronized live counters)
  8. `GlassFootnoteLoupe` (circular optical zoom ring over 10-K/table clip)
  9. `GlassTimelineScrubber` (horizontal decade scrub bar 2016->2036)
  10. `Glass LedgerRibbon` (`GlassLedgerRibbon` — top/bottom ticker strip with citation pill)
- **8 Presenter Depth-Sandwich Presets (`DepthSandwichStage.tsx` using Pillar #11 `aroll_person_mask.mp4`)**:
  ```typescript
  // d:\Youtube channel\reading-room-cinema\studio\src\components\layers\DepthSandwichStage.tsx
  export type DepthSandwichPreset =
    | "behind-shoulder-billboard"     // Giant stat/chart at z-behind-presenter, presenter torso occludes inner edge
    | "dual-shoulder-wings"           // Left vs Right comparison plates tucked 18% behind left/right shoulders
    | "halo-arc-gauge"                // Semicircular debt/radar arc rising behind presenter's head & shoulders
    | "pass-through-conveyor"         // Props/ships/cables enter left behind presenter and exit right in front!
    | "over-shoulder-dossier-stack"   // Cascading 3-layer SEC filings in z-behind + top callout in z-over-shoulder
    | "subsea-horizon-split"          // Presenter stands in front of cross-section ocean floor + foreground glass pill
    | "colossus-prop-backdrop"        // Towering carrier/transformer/vault rendered at 85% viewport height behind speaker
    | "spotlight-dim-sandwich";       // Dims room background behind speaker by 55% while keeping presenter 100% lit + front glass
  ```
  **Compositing Math**:
  - **Preview / Cutaway Mode**: `<DepthSandwichStage>` renders `BackplateVideo` -> `BehindPresenterLayer` -> `<MaskedPresenterCanvas videoSrc={arollSrc} maskSrc={personMaskSrc} />` (WebGL2 shader `gl_FragColor = vec4(video.rgb, smoothstep(0.15, 0.85, mask.r))`) -> `FrontGlassLayer`.
  - **DaVinci Resolve FCPXML Export (`export-fcpxml.mjs`)**: Emits `V1` (`aroll_prepped.mp4`), `V2` (`beat_XXXX_behind.mov` ProRes 4444), `V3` (`aroll_prepped.mp4` masked by `aroll_person_mask.mp4` luminescence matte), and `V4` (`beat_XXXX_front.mov` ProRes 4444). Zero manual masking in Resolve Free.

#### 3. 36 Virtual Camera & 3D Parallax Moves (`src/registry/camera-registry.ts`)
Evaluates deterministic `[scale, tx, ty, tz, rx, ry, rz, dofBlurPx]` camera rigs: `static-locked`, `punch-in-108`, `punch-in-118`, `slow-creep-in`, `pull-back-reveal`, `pan-left-to-right-ledger`, `whip-pan-snap`, `dolly-zoom-vertigo`, `isometric-orbit-15deg`, `top-down-desk-drop`, `low-angle-monolith`, `rack-focus-bg-to-fg`, `rack-focus-fg-to-bg`, `split-diopter-dual`, `handheld-doc-subtle`, `micro-shake-impact`, `bathymetry-plunge-y`, `altitude-ascend-grid`, plus 18 targeted waypoint camera rigs.

#### 4. 12 Algorithmic `.cube` 3D LUTs (`scripts/generate-luts.mjs` -> `studio/luts/*.cube`)
1. `editorial-warm.cube` *(legacy)*
2. `documentary-slate.cube` *(legacy)*
3. `clean-room-pop.cube` *(legacy)*
4. `archival-newsprint-1933.cube` (warm parchment roll-off, muted cyan)
5. `treasury-emerald-ink.cube` (subtle engraving green-slate shadows, crisp cream highs)
6. `smoked-navy-nocturne.cube` (deep `#0F1923` shadow toe, warm `#FAECD4` skin preservation via tetrahedral skin-hue lock)
7. `subsea-abyssal-teal.cube` (cold benthic blue-teal shadows for Ep #8/#9)
8. `silicon-cleanroom-amber.cube` (lithography yellow-amber highlight split)
9. `high-voltage-copper.cube` (oxidized teal vs warm copper midtone separation)
10. `bond-vigilante-crimson.cube` (desaturated slate + preserved `#A3402E` alert reds)
11. `cold-war-microfilm.cube` (high-acutance silver halide contrast curve)
12. `daylight-austin-heat.cube` (high-key warm summer highlights for Ep #1/#5 housing)

#### 5. 96 Procedural 48kHz PCM SFX WAVs (`scripts/generate-sfx.mjs`) & 12 Music Beds (`scripts/generate-music-beds.mjs`)
- **96 SFX** = 20 legacy WAVs preserved + 76 new physical-modeled synthesis cues across 8 banks x 12:
  1. *Optical Glass (`12`)*: `glass-enter`, `glass-dock`, `glass-exit`, `glass-expand`, `glass-loupe-click`, `glass-shimmer-sweep`, `glass-pill-tick`, `glass-toast-warn`, `glass-prism-lock`, `glass-frosted-slide`, `glass-triptych-cascade`, `glass-evaporate-soft`.
  2. *Archival Paper & Ink (`12`)*: `paper-slide`, `paper-flip-fast`, `marker-sweep`, `telestrator-draw`, `paper-tear-crisp`, `ledger-thud-heavy`, `blueprint-unroll`, `fountain-pen-scratch`, `redaction-tape-pull`, `microfilm-whir`, `ration-coupon-snip`, `card-deal-flick`.
  3. *Stamps, Gavels & Locks (`12`)*: `warning-thud`, `sticker-pop`, `gavel-wood-crack`, `notary-iron-press`, `guillotine-slice-thud`, `vault-bolt-clank`, `padlock-shackle-snap`, `brass-scrip-clink`, `coin-scale-drop`, `veto-stamp-slam`, `covenant-chain-taut`, `shredder-whir-short`.
  4. *Mechanical & Hydraulic (`12`)*: `hydraulic-hiss-lock`, `pneumatic-valve-toggle`, `ratchet-click-6x`, `pendulum-escapement-tick`, `solari-flap-burst`, `crane-winch-hum`, `turbine-spool-up`, `check-valve-slam`, `scale-beam-creak`, `domino-clack-chain`, `conveyor-step-servo`, `spring-recoil-twang`.
  5. *Data, Tickers & Terminals (`12`)*: `data-tick`, `type-click`, `alert-ping`, `chapter-chime`, `odometer-fast-roll`, `basis-point-blip`, `bloomberg-bell-soft`, `nsf-decline-buzz`, `seat-slash-tick`, `pik-compound-swell`, `audit-row-lock`, `calculator-ribbon-print`.
  6. *Grid, Silicon & Electrical (`12`)*: `transformer-60hz-hum`, `high-voltage-arc-snap`, `watt-meter-whir`, `euv-laser-pulse`, `kill-switch-power-down`, `server-fan-surge`, `breaker-trip-clunk`, `copper-smelt-hiss`, `capacitor-charge-whine`, `grid-droop-alarm`, `wafer-stepper-index`, `relay-contactor-click`.
  7. *Maritime, Subsea & Tactical (`12`)*: `map-whoosh`, `sonar-active-ping`, `radar-sweep-chirp`, `vls-hatch-pop-whoosh`, `drone-prop-buzz-pass`, `anchor-chain-drag-scrape`, `fiber-cable-snap-sub`, `hydrophone-deep-rumble`, `ais-transponder-beep`, `lock-gate-water-rush`, `carrier-horn-distant`, `target-reticle-lock`.
  8. *Cinematic Transitions & Drones (`12`)*: `flash-cut`, `camera-shutter`, `newsreel-click`, `riser-subtle`, `ambient-tension-drone`, `sub-bass-cliff-drop`, `reverse-glass-suck`, `clockwork-tension-pulse`, `tape-stop-pitch-drop`, `century-whip-whoosh`, `silence-vacuum-gate`, `resolve-chord-warm`.
- **12 Procedural Royalty-Free Music Beds (`public/music/*.wav`, 60s seamless loopable 48kHz stereo PCM)**:
  3 tonal suites (`reading-room-chamber`, `sovereign-pulse-synth`, `forensic-clockwork`) x 4 `MusicEnergy` stems (`calm`, `pulse`, `tense`, `drop-silence`), synthesized deterministically from additive marimba/felt-piano harmonics, analog sub-pulses, and brushed clockwork transients with zero copyright risk.
