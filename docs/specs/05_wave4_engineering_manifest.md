# Wave 4 Engineering Manifest (Exact Prompts for Subagents #9?#20)

Extracted verbatim from conversation `0654f84f-e9ca-4f70-a5a0-310b668bbbd7` (`transcript_full.jsonl`).

---

## Agent #9: Optical Rig & 18-Glass Architect (Agent 9)

- **Subagent ID:** `c67c4fc4-57af-4b80-ad0e-9fa302177605`
- **TypeName:** `cinema-engineer`
- **Model:** `inherit`
- **Workspace:** `inherit`
- **Invoked at Step:** `57`

### Exact Prompt

````markdown
Build **Pillar #1 & Optical Foundation** inside `d:\Youtube channel\reading-room-cinema\studio\src`.

First read the existing files you own to preserve 100% backward compatibility with all existing exported symbol names and prop types:
- `d:\Youtube channel\reading-room-cinema\studio\src\design\tokens.ts`
- `d:\Youtube channel\reading-room-cinema\studio\src\components\EditorialBackdrop.tsx`
- `d:\Youtube channel\reading-room-cinema\studio\src\components\glass\LiquidGlassObject.tsx`
- `d:\Youtube channel\reading-room-cinema\studio\src\components\glass\LiquidGlassPresets.tsx`
- `d:\Youtube channel\reading-room-cinema\studio\src\components\glass\CameraPreviewStage.tsx`
- `d:\Youtube channel\reading-room-cinema\studio\src\components\layers\ObjectLayerStage.tsx`

You EXCLUSIVELY own and may create/modify ONLY:
- `studio/src/design/tokens.ts`
- `studio/src/design/fitText.ts` (NEW)
- `studio/src/design/optics.tsx` (NEW)
- `studio/src/components/EditorialBackdrop.tsx`
- `studio/src/components/glass/LiquidGlassObject.tsx`
- `studio/src/components/glass/LiquidGlassPresets.tsx`
- `studio/src/components/glass/PresenterDepthStage.tsx` (NEW)
- `studio/src/components/layers/ObjectLayerStage.tsx`

Implement:
1. **`tokens.ts`**: Keep all existing exports (`COLORS`, `PAGE_PALETTE`, `OVER_FOOTAGE_PALETTE`, `SPRINGS`, `LAYOUT`, etc.) intact AND add:
   - `REGISTERS` (`page_editorial` `#FAF8F3` milk paper + `#1C2B3A` classic navy, `archival_parchment` `#F4EFE6`, `midnight_telemetry` `#111315`, `drafting_blueprint` `#0F2236`, `vintage_newsreel` `#141210`) with WCAG AAA (`>=7.0:1`) verified ink/accent tokens (`liability`, `capital`, `solvent`, `statutory`, `wash`).
   - `interpolateRegisterOKLCH(fromReg, toReg, progress)` perceptual 18-frame dissolve helper + `getContrastRatio(hexA, hexB)` utility.
   - `CINEMA_SPRINGS` (`editorialSnap`, `archivalSettle`, `heavyStamp`, `mechanicalTick`, `cameraGlide`, `inkSweep` — all critically damped $\zeta \ge 1.0$).
2. **`fitText.ts`**: Deterministic text layout & anti-clipping solver (zero DOM measurement race): character-width table estimator for serif/sans/mono, binary-search optimal `fontSize` inside `(maxWidth, maxHeight)` with 4% safety guard, dynamic-programming quadratic minimum-raggedness line breaker with orphan prevention (never leaving a single short word or year alone on the last line), and tabular-numeral / currency-prefix / unit-suffix formatter.
3. **`optics.tsx`**:
   - `<ReadingRoomStage register folioLabel chapterTitle sourceCitation cameraMove>`: 6-plane optical stage with register grid (`0.94x` parallax), masthead folio header, `1px` rule, source citation footer, stepped 2-frame SVG `feTurbulence` 16mm grain (`0.03` opacity), and $\cos^4$ natural vignette.
   - `<CameraRig25D>`: 3-depth parallax (`z=-120`, `z=0`, `z=+85`), `dollyPush` exponential zoom, micro-float, `dutchMicro`, `focusPull` blur, and `shakeImpact` damped anvil recoil for `<=6` word verdict slams.
   - `<OpticalLoupe x y radius zoom register>`: Circular glass magnifier cloning target children at `1.85x–2.4x` with brushed brass/steel bezel and specular rim.
   - `<HighlighterStroke width height progress color seed>`: Organic chisel-nib felt highlighter sweep with subtle wrist arc and multiply/screen blend.
4. **`LiquidGlassPresets.tsx` & `PresenterDepthStage.tsx`**:
   - Keep all 6 original presets (`GlassCard`, `GlassCornerPill`, `GlassBottomDock`, `GlassFloatingToolbar`, `GlassToastAlert`, `GlassSplitModal`) AND add **12 new presets** (18 total!): `GlassDossierStack`, `GlassEvidenceRail`, `GlassMagnifierCard`, `GlassTelemetryStrip`, `GlassVerdictSeal`, `GlassCompareScale`, `GlassTimelineScrubber`, `GlassReceiptTicker`, `GlassTerminalConsole`, `GlassMapCallout`, `GlassStatTriptych`, `GlassQuoteCitation`, plus `GLASS_PRESET_REGISTRY` indexing all 18!
   - Build `<PresenterDepthStage>` (Pillar #10 Depth Sandwich): composites `Background Plate -> Midground Behind-Presenter Graphics (giant numbers, rising walls, maps!) -> Masked Presenter Silhouette/Video Layer -> Foreground Smoked-Navy Liquid Glass`, supporting both live alpha-masked presenter video AND a crisp simulated presenter depth preview mode for standalone/exam renders!

Do NOT run `tsc` while sibling files are mid-edit unless checking only imports you own; ensure zero syntax or type errors in all files you touch.
````

---

## Agent #10: 220-Primitive Motion & Physics Engineer (Agent 10)

- **Subagent ID:** `9f29e7e8-71ed-44a8-8f1f-26b7f6878599`
- **TypeName:** `cinema-engineer`
- **Model:** `inherit`
- **Workspace:** `inherit`
- **Invoked at Step:** `57`

### Exact Prompt

````markdown
Build **Pillar #2: 220 Deterministic Motion & Physics Primitives Engine** inside `d:\Youtube channel\reading-room-cinema\studio\src`.

First read the existing files you own to preserve 100% backward compatibility with every existing primitive name, function signature, and export:
- `d:\Youtube channel\reading-room-cinema\studio\src\motion\primitives.ts`
- `d:\Youtube channel\reading-room-cinema\studio\src\motion\ObjectAnimator.tsx`
- `d:\Youtube channel\reading-room-cinema\studio\src\design\choreography.ts`

You EXCLUSIVELY own and may create/modify ONLY:
- `studio/src/motion/physicsModels.ts` (NEW)
- `studio/src/motion/primitives.ts`
- `studio/src/motion/ObjectAnimator.tsx`
- `studio/src/design/choreography.ts`

Implement:
1. **`physicsModels.ts`**: Pure frame-deterministic mathematical motion solvers (`f(frame, fps, opts)` — ZERO `Math.random()`, ZERO CSS transitions):
   - Critically-damped editorial springs ($\zeta \ge 1.0$), hydraulic press/crush curves (slow high-pressure ramp -> sudden yield -> hard mechanical stop), Solari split-flap steppers, damped pendulum kinematics, domino tip cascade, gear tooth interlock stepping, pneumatic stamp (`1.32 -> 1.00` impact + anvil micro-recoil), guillotine drop with frame-lock stop, buoyancy/slosh harmonics, conveyor ratchet steps, seismic shockwave decay, radar sweep, elastic cable tension & snap recoil, origami 3D perspective fold, and logarithmic group stagger (`staggerDelayFrames`).
2. **`primitives.ts`**:
   - Preserve ALL 57 existing primitives and ALL 84 existing alias mappings 100% intact.
   - Expand the catalog cleanly and genuinely (distinct mathematical curves & transform matrices `{ translateX, translateY, scaleX, scaleY, rotate, rotateX, rotateY, skewX, opacity, blurPx, clipInset }` — not duplicate clones!) to **at least 220 named deterministic primitives** (`52` entries, `40` exits, `96` in-place/mechanical/physics loops, `32` camera/depth trajectories) resolving **350+ aliased motion tokens**!
   - Export `MOTION_PRIMITIVE_CATALOG` metadata array with `{ id, kind, domainTags, intensity, recommendedSfx, description }` so the Showrunner & 30-Episode Novelty Vault can query primitives by domain (`fiscal`, `mechanical`, `legal`, `maritime`, `grid`, `compute`, `archival`, `verdict`) and intensity!
3. **`ObjectAnimator.tsx` & `choreography.ts`**:
   - Upgrade `ObjectAnimator` to support all 220 primitives (`perspective(1100px)` for 3D flips/origami, `clipPath` wipes for laser-etch/unroll/shredder/guillotine, `skewX` for whip-pans, and multi-stage `LayerLifecyclePlan` `enter -> focus -> highlight -> nudge -> dock -> exit`).
   - Upgrade `choreography.ts` with **Sub-Beat Progressive Disclosure (`buildSubBeatChoreography`)**: automatically subdivides any beat `> 3.2s` into timed internal micro-beats (`0.00` enter, `0.28` camera/focus shift, `0.55` highlight/secondary action, `0.85` settle/dock) synced to word timestamps when provided!
````

---

## Agent #11: 525-Prop & Contraption Vault Engineer (Agent 11)

- **Subagent ID:** `f72b1b3f-c8dc-4522-888e-2966029ad530`
- **TypeName:** `cinema-engineer`
- **Model:** `inherit`
- **Workspace:** `inherit`
- **Invoked at Step:** `57`

### Exact Prompt

````markdown
Build **Pillar #12: The 520+ Parametric Vector & Mechanical Contraption Prop Vault** inside `d:\Youtube channel\reading-room-cinema\studio\src\registry\`.

You EXCLUSIVELY own and may create/modify ONLY files inside `studio/src/registry/props/`:
- `studio/src/registry/props/propTypes.ts` (NEW)
- `studio/src/registry/props/parametricBuilders.tsx` (NEW)
- `studio/src/registry/props/heroContraptions.tsx` (NEW)
- `studio/src/registry/props/domainCatalogs.ts` (NEW)
- `studio/src/registry/props/index.tsx` (NEW — exports `PROP_VAULT`, `renderPropAtom`, `searchPropsBySemanticTags`, `getPropCount()`)

Read `d:\Youtube channel\video_01_script.md` (lines 1-60) and `d:\Youtube channel\season_01_roadmap.md` so your prop & contraption vault covers every visual world of Season 1 AND 20+ future 2027 episodes!

Architecture & Quality Bar:
1. Build **40+ rich, multi-part Hero Animated Contraptions** in `heroContraptions.tsx` where sub-elements animate deterministically via `frame` & `progress` (`0..1`) + `accentColor` / `inkColor`:
   - Fiscal & Debt: `W2WithholdingGuillotine`, `TreasuryBondVault`, `DebtMonolithWall`, `SpillwayDam3Tier`, `CircularGpuSpvCarousel` (Ep 3 Nvidia/CoreWeave loop!), `PikDebtSnowball` (Ep 4!), `BondVigilanteScale` (Ep 10 France vs Greece!), `SocialSecurity2032Dial` (Ep 11!), `TetherTBill BarrelStack` (Ep 2!)
   - Compute & Chips: `GpuServerRackTower` (blinking LED matrix + heat shimmer), `TokenDeflationFurnace`, `ClosedScripWalletRig`, `EmptyAirlineGate14A`, `ShenzhenExpiringWallet`, `AsmlEuvKillSwitchRig` (Ep 7!), `SiliconWaferNodeCompare` (`2nm` vs `4nm`!)
   - Energy & Grid: `WattageApplianceNode` (`10W` charger / `1kW` microwave / `1GW` city / `5GW` campus), `HighVoltageSubstationRig`, `Transformer128WeekQueue` (Ep 6!), `NuclearCoolingTowerLock` (Three Mile Island!), `CopperOpenPitClock` (17.5-yr mine!)
   - Defense, Maritime & Subsea: `CarrierVsDroneExchange` (Ep 8 `$13B` carrier + VLS missile cell matrix draining `$4M` shots vs `$20k` delta drone!), `SubseaCableAnchorCut` (Ep 9 seabed cross-section + garden-hose fiber + dragged ship anchor snapping pulses!), `AutonomousPortGantry2034` vs `IdlePier1955`
   - Household, Labor & History: `ClaireAustinHouseRig` (consistent architectural house elevation with spinning kWh smart-meter, exterior A/C condenser unit, and 2025/2030/2036 weather states!), `RunningShoeExplodedStack` (`$120` BOM layers!), `PaloAltoFlipWhiteboard`, `RoofScanInsuranceDrone` (Ep 5 laser roof grid!), `CoalScripBrassToken1912`, `BritishRationBook1941` (16 coupons ticking out!), `GovernorVetoFountainPen`, `SupremeCourtBenchGavel`.
2. Build **Parametric Architectural/Technical Blueprint Vector Generators** in `parametricBuilders.tsx` + `domainCatalogs.ts` that generate **480+ additional distinct, crisp, genuinely differentiated SVG blueprint/editorial vector props** (gauges, valves, meters, currency notes, legal filings, industrial machines, vehicles, semiconductor tools, grid hardware, shipping vessels, financial instruments, household items, historical artifacts, telestrator brackets/arrows/stamps) parameterized by geometry specs (blade counts, dial arcs, tower tiers, port profiles, circuit pins, document seals, waveform profiles) — bringing `getPropCount()` to **525+ real, renderable, visually distinct vector & mechanical props**, each tagged with `id`, `category`, `keywords`, `animatableParts`, and `defaultMotion`!
3. Every SVG must look like Financial Times / Art of the Problem / IKEA-schematic / archival engraving linework (`strokeWidth` crisp, current-register `inkColor` & `accentColor` props, zero emoji or cheap clipart!).
````

---

## Agent #12: World & US Cartographic Atlas Engineer (Agent 12)

- **Subagent ID:** `58a03993-5435-4f54-a84e-2edc9db28cde`
- **TypeName:** `cinema-engineer`
- **Model:** `inherit`
- **Workspace:** `inherit`
- **Invoked at Step:** `57`

### Exact Prompt

````markdown
Build **Pillar #3 Cartography: Real Offline World & US War-Room Atlas Engine** inside `d:\Youtube channel\reading-room-cinema\studio\src\maps\`.

First inspect `d:\Youtube channel\reading-room-cinema\studio\package.json` and `d:\Youtube channel\reading-room-cinema\studio\src\styles\dataMaps3D.tsx` (READ ONLY—do not modify `dataMaps3D.tsx` yet!) to see how `d3`, `topojson-client`, `us-atlas`, and `world-atlas` are currently imported.

You EXCLUSIVELY own and may create/modify ONLY files inside `studio/src/maps/`:
- `studio/src/maps/geoDatabase.ts` (NEW)
- `studio/src/maps/atlasResolver.ts` (NEW)
- `studio/src/maps/CinemaMapStage.tsx` (NEW)
- `studio/src/maps/index.ts` (NEW)

Fix the legacy repo's worst geographic bug (where `MapExplainer` only knew 5 places and silently routed Shenzhen, Rotterdam, Detroit, Japan, Taiwan, France, Greece, West Virginia, etc. to Austin, Texas!):
1. **`geoDatabase.ts` & `atlasResolver.ts`**:
   - Map ALL ~177 countries in `world-atlas/countries-110m.json` by ISO numeric ID, common names, and aliases (USA, China, Japan, Taiwan, UK, Ireland, France, Greece, Germany, South Korea, Netherlands, Ukraine, Yemen, Saudi Arabia, Egypt, Panama, etc.).
   - Map ALL 50 US states + Washington D.C. (`FIPS "01".."56"`, `"11"`) in `us-atlas/states-10m.json` by state name, postal code, and major cities.
   - Define **24 Named Geopolitical & Infrastructure Corridors / Regions** covering Video 1 + Season 1 Episodes 2–11 + global chokepoints:
     - `PJM_GRID` (exact 13 states: IL, IN, MI, OH, KY, WV, VA, PA, MD, DE, NJ, NC, TN + DC — plus Three Mile Island pin!)
     - `WEST_LONDON_M4`, `AUSTIN_TEXAS`, `LOGAN_COUNTY_WV` (Paint Creek 1912), `ALASKA_JUNEAU`, `SILICON_VALLEY_PALO_ALTO`, `MEMPHIS_FREIGHT_HUB`, `DETROIT_AUTO`, `ROTTERDAM_PORT`, `SHENZHEN_DELTA`, `TAIWAN_STRAIT_2NM` (TSMC Hsinchu/Tainan vs Phoenix AZ), `RED_SEA_CHOKEPOINT` (Bab el-Mandeb / Jeddah cables & carrier engagement), `BALTIC_CABLES` (Finland-Estonia-Germany), `TRANSATLANTIC_CABLES` (US-UK-EU 90% Big-4 corridor), `EURO_SOVEREIGN_SPREAD` (France vs Greece vs Germany), `TOKYO_JGB_FLOW` (Tokyo -> Washington Treasury flow), `ARIZONA_FAB_CORRIDOR`, `CALIFORNIA_FAIR_INSURANCE`, `FLORIDA_INSURANCE`, `STRAIT_OF_HORMUZ`, `MALACCA_STRAIT`, `SUEZ_CORRIDOR`, `PANAMA_CANAL`, `CHILE_PERU_COPPER_BELT`.
   - `resolveGeoQuery(textOrTarget)` deterministically resolves structured `mapTarget` OR free-text entity mentions to exact projection bounds, highlighted polygons, pin coordinates `[lon, lat]`, and geodesic arcs—NEVER silently falling back to Austin when another real place is named!
2. **`CinemaMapStage.tsx`**:
   - High-craft D3/SVG cartographic stage supporting `world`, `usa`, `europe`, `east-asia`, `middle-east`, and auto-fitted bounding-box zoom with smooth critically-damped camera fly-in (`zoom 1.0 -> targetZoom`), graticule coordinate lines, highlighted primary/secondary territory fills (honoring both `PAGE_PALETTE` `#FAF8F3` + `#1C2B3A` navy AND `midnight_telemetry` / `drafting_blueprint` registers!), animated geodesic shipping/capital/submarine-cable arcs (`strokeDashoffset`), pulsing facility/substation/port pins with leader-line callout cards, and cable-cut / blockade warning markers!
````

---

## Agent #13: 96-SFX, 12-Music & 12-LUT Audio/Color Engineer (Agent 13)

- **Subagent ID:** `9a5fe4f3-9323-4744-ba2f-8c590d241b11`
- **TypeName:** `cinema-engineer`
- **Model:** `inherit`
- **Workspace:** `inherit`
- **Invoked at Step:** `57`

### Exact Prompt

````markdown
Build **Pillars #6 & #7: 96 Procedural Studio Foley WAVs, 12 Bundled Royalty-Free Documentary Music Stems, and 12 Cinema `.cube` LUTs** inside `d:\Youtube channel\reading-room-cinema\studio\`.

First read the existing files you own to preserve 100% backward compatibility with all existing 20 WAV filenames, 3 `.cube` filenames, and React component props:
- `d:\Youtube channel\reading-room-cinema\studio\scripts\generate-sfx.mjs`
- `d:\Youtube channel\reading-room-cinema\studio\src\components\SfxCue.tsx`
- `d:\Youtube channel\reading-room-cinema\studio\src\components\MusicBed.tsx`
- Check `d:\Youtube channel\reading-room-cinema\studio\luts\` to inspect the format of the existing 3 `.cube` files.

You EXCLUSIVELY own and may create/modify ONLY:
- `studio/scripts/generate-sfx.mjs`
- `studio/scripts/generate-music.mjs` (NEW)
- `studio/scripts/generate-luts.mjs` (NEW)
- `studio/public/sfx/*.wav` (generated output)
- `studio/public/music/*.wav` (generated output — keep loop durations compact e.g. `8.0s` seamless equal-power crossfaded 48kHz 16-bit stereo WAVs so git repo size stays crisp and reasonable while sounding rich and click-free!)
- `studio/luts/*.cube` (preserve original 3 `.cube` files untouched + generate 9 new `.cube` files = 12 total)
- `studio/src/components/SfxCue.tsx`
- `studio/src/components/MusicBed.tsx`
- `studio/src/audio/soundRegistry.ts` (NEW — typed catalog of all 96 SFX cues + 12 music beds + mood/domain auto-matching)

Implement & Execute:
1. **`generate-sfx.mjs` -> 96 Procedural 48kHz Studio WAVs**:
   - Keep ALL 20 original `.wav` filenames (`paper-slide.wav`, `marker-sweep.wav`, `data-tick.wav`, `warning-thud.wav`, `glass-enter.wav`, etc.) intact AND generate **76 new high-craft procedural documentary foley WAVs** (96 total!) using seeded PRNG, Kellet pink noise, RBJ biquad swept bandpass/lowpass/highpass filters, modal resonators, and click-free envelopes:
     - Multi-variant detuned families (`_v1..v4`) for `odometer-tick`, `paper-slide`, `felt-highlighter`, `solari-flap`, `typewriter-strike`, `archival-stamp` so rapid hits never sound robotic!
     - Domain foley cues: `fountain-pen-slash.wav`, `gavel-wood-hit.wav`, `guillotine-slice.wav`, `vault-bolt-lock.wav`, `hydraulic-press.wav`, `pneumatic-servo.wav`, `server-rack-hum.wav`, `substation-60hz-buzz.wav`, `radar-sonar-ping.wav`, `subsea-cable-snap.wav`, `vls-launch-whoosh.wav`, `drone-pass-by.wav`, `coin-brass-clink.wav`, `anvil-iron-clank.wav`, `jet-gate-retract.wav`, `crowd-cut-mute.wav`, `sub-bass-drop.wav`, `register-dissolve-swell.wav`, `room-tone-library.wav`, etc.!
   - Run `node scripts/generate-sfx.mjs` inside `d:\Youtube channel\reading-room-cinema\studio` and verify all 96 WAVs exist and have valid non-zero PCM headers.
2. **`generate-music.mjs` -> 12 Bundled Royalty-Free Documentary Music Beds**:
   - Synthesize **12 distinct, restrained documentary score stems** (`8.0s` seamless zero-click equal-power crossfade loops, 48kHz 16-bit stereo, ~1.5MB each) into `studio/public/music/`:
     `01-archival-pulse.wav`, `02-ledger-investigation.wav`, `03-midnight-telemetry.wav`, `04-clockwork-mechanism.wav`, `05-sovereign-tension.wav`, `06-subsea-drone.wav`, `07-industrial-march.wav`, `08-quiet-reckoning.wav`, `09-toy-model-marimba.wav`, `10-speculative-horizon.wav`, `11-verdict-drone.wav`, `12-epilogue-warmth.wav` (using warm filtered analog-style pads, soft felt-piano/marimba harmonic plucks in minor/Dorian fifths, muted sub-pulses, and subtle tape warmth — zero cheesy chiptune buzz!).
   - Run `node scripts/generate-music.mjs` and verify all 12 `.wav` stems exist.
3. **`SfxCue.tsx`, `MusicBed.tsx` & `soundRegistry.ts`**:
   - Upgrade `SfxCue.tsx` to resolve all 96 cues + deterministic variant selection (`seed` / `frame` modulo) + minimum `72ms` onset spacing guard.
   - Upgrade `MusicBed.tsx` so `trackId` defaults to bundled `public/music/02-ledger-investigation.wav` (or selects any of the 12 stems by `mood` / `musicEnergy`), loops seamlessly across arbitrary video lengths, and performs smooth cosine speech-range ducking!
4. **`generate-luts.mjs` -> 12 `.cube` Color Grading LUTs**:
   - Keep `editorial-warm.cube`, `documentary-slate.cube`, `clean-room-pop.cube` intact and generate 9 new `17x17x17` / `33x33x33` valid DaVinci/FFmpeg `.cube` 3D LUTs (`archival-parchment.cube`, `kodak-2383-print.cube`, `midnight-desk.cube`, `cold-2030-deflation.cube`, `austin-august-heat.cube`, `blueprint-cyanotype.cube`, `silver-gelatin-1941.cube`, `subsea-sodium.cube`, `verdict-high-contrast.cube`). Run the generator and verify FFmpeg `lut3d` parses them cleanly!
````

---

## Agent #14: 32-Mode Kinetic Typography & Sync Engineer (Agent 14)

- **Subagent ID:** `8fe1921f-bf67-4292-92dc-8b2460ac98c3`
- **TypeName:** `cinema-engineer`
- **Model:** `inherit`
- **Workspace:** `inherit`
- **Invoked at Step:** `57`

### Exact Prompt

````markdown
Build **Pillar #4: 32-Mode Kinetic Typography, Stenography & Live Whisper Word-Sync Engine** inside `d:\Youtube channel\reading-room-cinema\studio\src\typography\`.

First read all existing files you own to preserve 100% backward compatibility with existing exports and prop interfaces:
- `d:\Youtube channel\reading-room-cinema\studio\src\design\fonts.ts`
- `d:\Youtube channel\reading-room-cinema\studio\src\typography\KineticText.tsx`
- `d:\Youtube channel\reading-room-cinema\studio\src\typography\DataTicker.tsx`
- `d:\Youtube channel\reading-room-cinema\studio\src\typography\EditorialHeadline.tsx`
- `d:\Youtube channel\reading-room-cinema\studio\src\components\SourceBadge.tsx`

You EXCLUSIVELY own and may create/modify ONLY:
- `studio/src/design/fonts.ts`
- `studio/src/typography/prosodySync.ts` (NEW)
- `studio/src/typography/KineticText.tsx`
- `studio/src/typography/DataTicker.tsx`
- `studio/src/typography/EditorialHeadline.tsx`
- `studio/src/components/SourceBadge.tsx`

Implement:
1. **`fonts.ts`**: Keep all 5 Google font families (`Inter`, `IBM Plex Mono`, `Newsreader`, `Space Grotesk`, `Oswald`) and exact `FONTS` keys intact; add `TABULAR_NUM_STYLE` (`fontVariantNumeric: 'tabular-nums lining-nums'`), optical tracking calculator `getOpticalTracking(px)`, and number-unit splitter (`$40.5T` -> prefix `$`, digits `40.5`, suffix `T` for crisp superscript/unit styling).
2. **`prosodySync.ts`**:
   - Connects real `TimedWord[]` from Whisper `words.json` (`startFrame`, `endFrame`, `word`) directly to any beat window (`[beatStartFrame, beatEndFrame]`).
   - ALSO provides a **deterministic Syllable & Punctuation Prosody Estimator (`synthesizeTimedWords(text, durationFrames, fps)`)** when `timedWords` is absent—weighting word durations by syllable count, numeric density (`$40.5 trillion` takes longer to speak than `the`), comma pauses (`+4f`), period/question pauses (`+8f`), and `<=6`-word burstiness punch holds! That way word-level kinetic typography animates naturally on BOTH transcribed A-roll AND raw script previews!
3. **`KineticText.tsx` -> 32 Distinct Kinetic Typography & Stenography Modes**:
   - Preserve all 7 existing `TypographyMode` strings 100% intact AND expand to **32 modes** exported in `TYPOGRAPHY_MODES`:
     - Original 7 preserved + 25 new cinema modes: `solari-split-flap`, `redacted-declassify`, `stenographer-ribbon`, `verdict-anvil-slam`, `burstiness-staccato-cuts` (rapid 1-phrase-at-a-time Maxinomics montage!), `chisel-highlighter-sweep`, `behind-presenter-monolith` (ultra-large display scale for Depth Sandwich!), `ledger-tabular-rollup`, `court-syllabus-italic`, `telestrator-grease-math`, `footnote-loupe-zoom`, `stock-ticker-crawl`, `antithesis-split-lock`, `erosion-decay-fade`, `veto-fountain-strike` (draws ink slash across old word and reveals replacement e.g. `PAYCHECK` -> `ALLOWANCE`!), `typewriter-1941-ribbon`, `blueprint-dimension-callout`, `chapter-roman-folio`, `debt-odometer-inline`, `whisper-focus-spotlight`, `margin-redline-gloss`, `statute-clause-box`, `question-inversion-turn`, `silent-black-aphorism`, `cascading-evidence-stack`.
4. **`DataTicker.tsx`, `EditorialHeadline.tsx`, `SourceBadge.tsx`**:
   - Upgrade `DataTicker` to handle negative numbers (`-$42B`), basis points (`+67 bps`), ratios (`100:1`), multipliers (`+833%`), currency prefixes (`$`), and unit suffixes (`T`, `GW`, `TWh`, `/MW-day`) without ever clamping or misformatting!
   - Upgrade `EditorialHeadline` and `SourceBadge` with orphan-free balanced wrapping and WCAG AAA contrast across both `page` (`#FAF8F3`) and `over-footage` (`#0F1923` glass) modes.
````

---

## Agent #15: Equalizer Compiler & Auto-Healer Engineer (Agent 15)

- **Subagent ID:** `f84b2652-ba47-439e-b8f8-6949d8d016c6`
- **TypeName:** `cinema-engineer`
- **Model:** `inherit`
- **Workspace:** `inherit`
- **Invoked at Step:** `72`

### Exact Prompt

````markdown
Build **Pillar #15: The Model-Invariant Equalizer Compiler, Pruned IR, Viterbi Solver, Creativity Escalator & 30-Gate Auto-Healer** inside `d:\Youtube channel\reading-room-cinema\`.

Read the architectural spec at `C:\Users\youza\.gemini\antigravity\brain\a9137728-f376-4c33-97b0-37b6d65e8ba4\model_invariance_compiler_spec.md` for reference.

You EXCLUSIVELY own and may create/modify ONLY:
- `studio/src/equalizer/scriptLock.ts` (NEW)
- `studio/src/equalizer/storyboardIR.ts` (NEW)
- `studio/src/equalizer/schemaPruner.ts` (NEW)
- `studio/src/equalizer/viterbiChoreographer.ts` (NEW)
- `studio/src/equalizer/qualityGateAndHealer.ts` (NEW)
- `studio/src/equalizer/exemplars.ts` (NEW)
- `studio/src/equalizer/index.ts` (NEW)
- `AGENTS.md` (NEW at repo root `d:\Youtube channel\reading-room-cinema\AGENTS.md`)
- `CLAUDE.md` (NEW at repo root `d:\Youtube channel\reading-room-cinema\CLAUDE.md`)
- `DEEPSEEK_EQUALIZER.md` (NEW at repo root `d:\Youtube channel\reading-room-cinema\DEEPSEEK_EQUALIZER.md`)

Implement completely (zero placeholders, strict TypeScript + `zod`):
1. **`scriptLock.ts`**: Deterministic script tokenizer (`createScriptLock(markdownText, timedWords?)`) producing SHA-256 `scriptSha256`, `SentenceLock[]` (`S001..Sn`), `ScriptToken[]` (`S001.T01..Tm`) aligned to Whisper `words.json` OR syllable-weighted prosody timestamps, `ExtractedFact` catalog (`F001..Fk` capturing every `$` currency, `%`, year/date, physical unit like `GW`/`TWh`/`MW-day`/`nm`, multiplier `833%`/`100:1`, and primary document/court cite like `Table 9`, `Wielechowski v. State`, `Fair Labor Standards Act`), non-breaking unit glue (`$40.5\u00A0trillion`), and sentence burstiness class (`STACCATO_PUNCH` `<=6w`, `SHORT_PIVOT`, `ANALYTICAL_CLAIM`, `DENSE_MECHANISM`).
2. **`storyboardIR.ts`**: Strict Zod `StoryboardIRSchema` + `assertZeroForbiddenTokens(raw)` rejecting raw CSS/pixel/hex/spring strings, supporting both high-craft semantic archetypes AND declarative `CUSTOM_CONTRAPTION_BLUEPRINT` / `DEPTH_SANDWICH_STAGE` payloads (zero raw coordinates—only semantic slots, `FactId` refs, prop IDs, physics rules, and `TokenId` triggers!).
3. **`schemaPruner.ts` + Creativity Escalator**:
   - `computeAllowedChoices(beat, recentHistory, episodeVaultCooldowns)` prunes ineligible and recently used styles/archetypes BEFORE LLM decoding so smaller models cannot repeat templates!
   - `escalateFlatBeats(ir, scriptLock)`: **The Creativity Escalator**—detects low-kinetic/generic text-card drafts from weaker models (like DeepSeek) and automatically promotes high-stakes metaphor/mechanism/shock beats into bespoke animated contraptions, split-era diptychs, plumbing schematics, cartographic stages, or behind-presenter depth sandwiches!
4. **`viterbiChoreographer.ts`**: Dynamic-programming Viterbi solver assigning optimal register polarity, layout variant, 2.5D camera trajectory, FLIP continuity match-cut transitions, burstiness hard-cuts on `<=6w` punches, and `<3.8s` progressive sub-beat reveals!
5. **`qualityGateAndHealer.ts`**:
   - **30-Gate Mathematical Broadcast Scorer (`scoreStoryboard` -> `0..100`)**: Verbatim token coverage, zero hallucinated numbers (`FactCatalog` lock), citation parity, `<180ms` word-sync lead, zero `>4.5s` dead static intervals, `<=6w` burstiness cut alignment, zero adjacent repeats, 8-beat Shannon entropy $H \ge 2.25$ bits, channel `A42` restraint ceiling, presenter breathing balance, safe-zone/AABB collision zero, orphan-free line rag, WCAG AAA contrast, continuity entity closure, cross-episode novelty score, and showstopper peak density!
   - **Two-Tier Self-Healer (`healStoryboard`)**: Tier-1 deterministic AST repair (`<80ms`) fixing dead zones, sync drift, missing citations, continuity recalls, repetition clashes, and flat-beat escalation + Tier-2 `<350-token` surgical single-beat repair prompt builder!
6. **`exemplars.ts` & Root Playbooks (`AGENTS.md`, `CLAUDE.md`, `DEEPSEEK_EQUALIZER.md`)**: Concrete gold JSON exemplars + crystal-clear step-by-step protocols so any AI agent (Claude Code, Antigravity, Cursor, DeepSeek API, or copy-paste chat UI) produces `96+/100` cooked edits identically.
````

---

## Agent #16: 30-Episode Novelty & Continuity Engineer (Agent 16)

- **Subagent ID:** `14b31b64-e0d7-4b97-8f60-423186945af6`
- **TypeName:** `cinema-engineer`
- **Model:** `inherit`
- **Workspace:** `inherit`
- **Invoked at Step:** `72`

### Exact Prompt

````markdown
Build **Pillar #14: The 30-Episode Anti-Repetition Novelty Vault, Stateful Continuity Engine & Season-1 Strategy Registry** inside `d:\Youtube channel\reading-room-cinema\studio\src\novelty\`.

Read `d:\Youtube channel\season_01_roadmap.md` and `C:\Users\youza\.gemini\antigravity\brain\f8aa5d23-1835-44f1-b5b8-8e5c40ace1a4\scratch\video_01_visual_architecture_spec.md` (Section 1 & Section 3) for exact Season-1 episodes, channel `STR-*` strategy rules, and Episode 01's 4 stateful continuity entities.

You EXCLUSIVELY own and may create/modify ONLY:
- `studio/src/novelty/strategyPresets.ts` (NEW)
- `studio/src/novelty/continuityEngine.ts` (NEW)
- `studio/src/novelty/episodeVault.ts` (NEW)
- `studio/src/novelty/seasonRoadmap.ts` (NEW)
- `studio/src/novelty/index.ts` (NEW)
- `studio/episodes-vault.json` (NEW)

Implement completely (strict TypeScript, zero `any`):
1. **`strategyPresets.ts`**: Encodes all **9 Channel Strategy Presets** (`STR-GEN-EXPLAINER`, `STR-AIC-CLOCKED`, `STR-AIC-SPECULATIVE`, `STR-FISHER-ARTIFACT`, `STR-MAX-ESSAY`, `STR-AOTP-LADDER`, `STR-BOYLE-CHAPTERED`, `STR-HMW-PRIMER`, `STR-GEN-FIELD`) with exact normalized beat windows (`0.00–0.10` hook/stake, optional bridged sponsor window, decile re-hook requirement, `0.60–0.85` fair adversary concession, `0.90–1.00` bookend verdict + single lean-matched CTA), presenter A-roll ratio target, preferred registers, and **forbidden-engine hard guardrails** (`R43–R47`, e.g., banning fake countdown hour-clocks when `clocked` is forbidden!).
2. **`continuityEngine.ts`**: Stateful `ContinuityEngine` tracking recurring multi-act visual entities across a full 20–40 minute documentary so geometry, colors, and numbers evolve from plant to payoff:
   - Built-in Episode 01 stateful graph (`ENT_CLAIRE_AUSTIN` evolving `Late 2025 $3,400 lock -> 2030 -70% pay cut & refi denial -> $45k locked 401k -> Oct 2036 house kept via inflation vs Austin August A/C shock`; `ENT_ESCAPE_HATCH_BOARD` accumulating red failure stamps across Bays `01 Check`, `02 Compute`, `03 Print` without ever resetting prior stamps; `ENT_SOVEREIGN_DEBT_WALL`; `ENT_PAYCHECK_TO_ALLOWANCE` reusing Gov. Walker's fountain-pen slash trajectory on the final `PAYCHECK -> ALLOWANCE` strike).
   - Generic entity state-machine builder so Episodes 02–30 define their own persistent dossiers, suspect boards, and callback props declaratively!
3. **`episodeVault.ts` & `studio/episodes-vault.json`**:
   - Persistent Season Memory across **30+ uploads in 2027**: records every episode's `styleCounts`, `motionCombos`, `propIds`, `glassPresets`, `typographyModes`, `lutId`, `musicStems`, and `showstopperBlueprints`.
   - `computeNoveltyWeights(vault, targetEpisodeNumber)`: applies exponential cross-episode cooldown penalties ($e^{-\Delta \text{ep} / 2.5}$) to heavily used combinations from the last 5 videos, selects a fresh **Episode Visual Signature** (register pairing + LUT + primary mechanical motif + score palette), and enforces **3–5 unique Showstopper Set-Pieces** per episode so audiences come back every week just to see what crazy edit happens next!
4. **`seasonRoadmap.ts`**: Pre-wires Episode 01 (*The Allowance: AI vs $40.5T Debt*) + Episodes 02 through 11 from `season_01_roadmap.md` (with verified titles, backup titles, thumbnail text pairs, `STR-*` engine locks, primary source artifacts, key stats, cold opens, and bespoke signature set-piece recommendations for each episode!).
````

---

## Agent #17: Generative Physics & Set-Piece Engineer (Agent 17)

- **Subagent ID:** `d3bf75a5-4de6-4d01-897b-500818b9a6f0`
- **TypeName:** `cinema-engineer`
- **Model:** `inherit`
- **Workspace:** `inherit`
- **Invoked at Step:** `72`

### Exact Prompt

````markdown
Build **Pillar #13: The Generative Custom Animation Sandbox, 2D Physics Metaphor Lab, Spatial Auto-Polish Solver & Memory-Safe 3D Isometric Stage** inside `d:\Youtube channel\reading-room-cinema\studio\src\generative\`.

You EXCLUSIVELY own and may create/modify ONLY files inside `studio/src/generative/`:
- `studio/src/generative/blueprintTypes.ts` (NEW)
- `studio/src/generative/physics2d.ts` (NEW)
- `studio/src/generative/spatialSolver.ts` (NEW)
- `studio/src/generative/IsometricDiorama3D.tsx` (NEW)
- `studio/src/generative/SceneBlueprintRenderer.tsx` (NEW)
- `studio/src/generative/presetSetPieces.ts` (NEW)
- `studio/src/generative/index.ts` (NEW)

Implement completely (100% Remotion frame-deterministic, zero `Math.random()`, zero per-frame WebGL renderer leaks!):
1. **`blueprintTypes.ts`**: Declarative `SceneBlueprint` schema allowing ANY AI (DeepSeek or Fable 5.2) to invent brand-new custom multi-actor animated contraptions without writing raw coordinates or fragile JSX! Supports semantic zones (`left-stage`, `center-hero`, `right-stage`, `top-header`, `bottom-ledger`, `split-left`, `split-right`), actors (`prop-rig`, `metric-counter`, `document-card`, `fluid-tank`, `balance-scale`, `conveyor-belt`, `timeline-track`, `isometric-tower`, `verdict-stamp`), connectors (`flow-pipe` with moving particles, `guillotine-cut`, `laser-scan`, `geodesic-arc`, `veto-slash`, `dimension-line`), 2D physics behaviors, and timed phase triggers (`0..1` normalized or frame-locked).
2. **`physics2d.ts`**: Random-access deterministic 2D physics & mechanism solver (`evaluateMechanismAtFrame(config, frame, fps)`):
   - Torque balance scale (tips smoothly under unequal weights e.g. `$4M interceptor` vs `$20k drone` `100:1`, or `Top 10% = 90%` vs `Bottom 50% = 1%`),
   - Hydraulic pipe & tiered dam spillway (particles flow through pipes, slice at withholding guillotine, or overflow Tier-1 `$2.1T` bond basin before reaching Tier-3 household check),
   - Conveyor & BOM stack vaporizer (layers drop under deterministic gravity + damped bounce $\zeta = 0.92$ as middle slices vaporize),
   - Perishable decay sand-timer / countdown erosion,
   - Circular carousel orbit (for circular GPU SPV accounting loops!),
   - Tension cable stretch & sudden snap recoil (for undersea cable anchor sabotage!).
3. **`spatialSolver.ts` ("The DeepSeek Auto-Polish & Collision Solver")**:
   - Takes any `SceneBlueprint` (even a minimal 4-node draft from a small LLM!), resolves semantic zones to crisp 1920x1080 golden-ratio rectangles inside the `96px` broadcast safe frame, runs deterministic iterative AABB repulsion so ZERO actors or labels ever collide, routes orthogonal/curved flow pipes cleanly between actor ports, and **auto-injects cinema polish** (subtle 2.5D camera push, staggered critically-damped entries, chisel highlighter under key figures, masthead folio, and source badge)!
4. **`IsometricDiorama3D.tsx`**:
   - Replaces the legacy repo's buggy `WhiteModel3D` (which leaked `new THREE.WebGLRenderer` every frame!) with a rock-solid, razor-sharp **Deterministic Parametric Isometric 3D Architectural & Telemetry Diorama Engine** (pure SVG/Canvas isometric 3D projection with shaded top/left/right faces, cast shadows, elevation gridlines, animated extrusion heights, glowing server/window matrices, cooling plumes, and callout leader lines—works 100% reliably across all headless Chrome workers with zero WebGL context crashes!).
5. **`SceneBlueprintRenderer.tsx` & `presetSetPieces.ts`**:
   - Renders any `SceneBlueprint` cleanly in both `page` (full-screen `#FAF8F3` / `midnight_telemetry` / `drafting_blueprint` / `archival_parchment`) and `over-footage` (inside smoked-navy liquid glass or Behind-Presenter Depth Sandwich!).
   - Pre-builds **24 jaw-dropping Set-Piece Blueprints** in `presetSetPieces.ts`: 14 flagship custom animations for Episode 01 (`$120 Running Shoe 80% Labor Vaporizer`, `Palo Alto Whiteboard 180° Flip to Cast-Iron 30-Yr Loan`, `Claire's Longitudinal 2025->2030->2036 House & T-Account`, `W-2 Guillotine vs Ireland/Margin-Loan Tax Plumbing`, `1955 Silent Pier vs 2034 99.9% Robotic Port`, `Alaska Gov. Walker Fountain-Pen Veto Slash`, `Federal $2.1T Bond Priority Spillway`, `Uber 4-Month AI Budget Burnout`, `Empty Gate 14A vs Expiring Tuesday Compute`, `Closed Scrip Wallet 20% Exit Toll vs 1912 Coal Scrip`, `10W Charger -> 5GW AI Campus Power Ladder`, `6-Month Agent vs 10-Year Grid Permitting Race`, `1941 UK 16-Point Ration Counter`, `200-Year Friday Truce -> One Signature -> ALLOWANCE`) PLUS **10 Season-1 Episode 2–11 Signature Set-Pieces** (`Tether vs Tokyo T-Bill Shift`, `Nvidia-CoreWeave Circular SPV Carousel`, `SaaS PIK Debt Snowball`, `California Roof-Scan Insurance Drone`, `128-Week Transformer & Copper Bottleneck`, `Taiwan 2nm Blockade & ASML EUV Kill-Switch`, `$20k Drone vs $13B Carrier VLS Drain`, `550 Garden-Hose Subsea Cable Anchor Cut`, `France 4.93% vs Greece Bond Vigilante Flip`, `Q4 2032 Social Security Vault Exhaustion`)!
````

---

## Agent #18: AI CLI, DaVinci FCPXML & Depth-Matte Engineer (Agent 18)

- **Subagent ID:** `f5a92aed-f03b-4fb1-9cab-42425bf99887`
- **TypeName:** `cinema-engineer`
- **Model:** `inherit`
- **Workspace:** `inherit`
- **Invoked at Step:** `72`

### Exact Prompt

````markdown
Build **Pillars #6, #9, #10 & #15 CLI/NLE Infrastructure**: Multi-Provider AI Director CLI, Upgraded DaVinci Resolve FCPXML v1.9 Multi-Lane Keyframe Exporter, Broadcast Loudness Master, and Enhanced Room Swap / Alpha Presenter Matte Tooling inside `d:\Youtube channel\reading-room-cinema\`.

First read the existing files you own to preserve 100% backward compatibility with existing CLI flags and workflows:
- `d:\Youtube channel\reading-room-cinema\studio\scripts\export-fcpxml.mjs`
- `d:\Youtube channel\reading-room-cinema\tools\room_object_swap.py`
- `d:\Youtube channel\reading-room-cinema\tools\OBJECT_SWAP_GUIDE.md`

You EXCLUSIVELY own and may create/modify ONLY:
- `tools/ai_director.mjs` (NEW)
- `studio/scripts/export-fcpxml.mjs`
- `studio/scripts/master-audio.mjs` (NEW)
- `tools/room_object_swap.py`
- `tools/OBJECT_SWAP_GUIDE.md`

Implement completely:
1. **`tools/ai_director.mjs` ("Universal DeepSeek / Frontier / Offline Equalizer Runner")**:
   - Supports `--provider deepseek | openai | gemini | anthropic | ollama | pack` (reads standard env vars `DEEPSEEK_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `OLLAMA_HOST` using native Node `fetch`—zero bloated SDK dependencies required!).
   - Supports `--export-pack <dir>` and `--import-pack <dir>` so users without API keys can run the exact 4-pass pruned Equalizer prompts in any chat window (DeepSeek web, Fable, Claude, Gemini) and import the JSON cleanly!
   - Also supports `--deterministic` zero-API compilation mode (driving the studio's semantic classifier + Creativity Escalator + 30-Episode Novelty Vault + Auto-Healer offline in `<2s`!).
2. **`studio/scripts/export-fcpxml.mjs` (Upgraded DaVinci Resolve FCPXML v1.9 Bridge)**:
   - Preserves valid FCPXML v1.9 schema for DaVinci Resolve Free AND fixes all legacy NLE gaps:
     - **Real V1 A-Roll Camera Keyframes**: Emits `<adjust-transform>` scale & position keyframes on V1 A-roll clips for `talking-head-punch-in` (`100% -> 112%` crisp reframing!), `split-screen` (shifts presenter cleanly to left frame while right half displays graphic!), and subtle `100% -> 104%` tension creeps!
     - **True Pillar #10 Depth-Sandwich Lanes**: When an alpha presenter matte (`aroll_person_alpha.mov` / `.webm`) is present (or `--depth-sandwich` enabled) and a beat uses `behind-presenter` layering, places V1 = Background A-Roll, V2 (`lane="1"`) = Behind-Presenter Giant Typography / 3D Wall / Map, V3 (`lane="2"`) = Foreground Alpha-Masked Presenter, V4 (`lane="3"`) = Smoked-Navy Foreground Liquid Glass! Falls back gracefully to V1 + V2 when no separate person-alpha file is supplied.
     - **3-Stem Broadcast Audio**: A1 = `-14 LUFS` dialogue, A2 (`lane="-1"`) = sample-accurate 96-WAV foley cues (`public/sfx/`), A3 (`lane="-2"`) = bundled procedural documentary music stem (`public/music/`) with volume ducking keyframes!
3. **`studio/scripts/master-audio.mjs`**:
   - Two-pass linear EBU R128 / ITU-R BS.1770-4 FFmpeg broadcast loudness normalizer (`-14.0 LUFS`, `-1.0 dBTP`, `LRA=7.0`, `48kHz` `320kbps` AAC) with optional speech-sidechain foley/music ducking!
4. **`tools/room_object_swap.py` & `tools/OBJECT_SWAP_GUIDE.md`**:
   - Keep all existing tripod plate extraction, Gemini prop swap, video clip prep, and `auto-person-mask` commands intact (`selfie_segmenter.tflite` stays git-ignored).
   - Add `export-person-matte` command exporting a clean temporally-smoothed alpha presenter video (`aroll_person_alpha.webm` / ProRes 4444 `.mov`) directly consumable by `<PresenterDepthStage>` and `export-fcpxml.mjs`!
   - Add `suggest-props --script <path>` analyzing act breaks to recommend tasteful chapter-specific desk/bookshelf prop swaps for *The Reading Room*, and document everything clearly in `OBJECT_SWAP_GUIDE.md`.
````

---

## Agent #19: 60-Style Broadcast, Macro & Forensic Engineer (Agent 19)

- **Subagent ID:** `37824435-21f2-4a30-b2d6-2f2b3a4492f4`
- **TypeName:** `cinema-engineer`
- **Model:** `inherit`
- **Workspace:** `inherit`
- **Invoked at Step:** `77`

### Exact Prompt

````markdown
Build **Pillar #3A: 60 Data-Driven Broadcast, Archival, Judicial, Media-Collision & Macro-Telemetry Documentary Styles** inside `d:\Youtube channel\reading-room-cinema\studio\src\styles\`.

First read the two existing files you own to preserve 100% backward compatibility with every existing exported component name and prop type:
- `d:\Youtube channel\reading-room-cinema\studio\src\styles\docBroadcast.tsx`
- `d:\Youtube channel\reading-room-cinema\studio\src\styles\vintageEditorial.tsx`

You EXCLUSIVELY own and may create/modify ONLY:
- `studio/src/styles/docBroadcast.tsx`
- `studio/src/styles/vintageEditorial.tsx`
- `studio/src/styles/macroTelemetry.tsx` (NEW)
- `studio/src/styles/forensicExhibits.tsx` (NEW)

Import ONLY stable base exports (`COLORS`, `PAGE_PALETTE`, `OVER_FOOTAGE_PALETTE`, `SPRINGS` from `../design/tokens`, `FONTS` from `../design/fonts`, `remotion`, `react`, `d3`, `lucide-react`) so there are zero cross-agent import races.

Implement completely (100% Remotion deterministic, zero `Math.random()`, zero CSS transitions, full-1920x1080 balanced compositions on `page` mode and right-third/dock smoked-navy glass support on `over-footage` mode):
1. **Upgrade `docBroadcast.tsx` & `vintageEditorial.tsx`**:
   - Fix all legacy hardcoded text/years (e.g. `LiveCountdownSplit` must accept dynamic `startYear`, `endYear`, `leftLabel`, `rightLabel`, `metric` while defaulting cleanly if omitted; `TelestratorOverlay` must accept dynamic `targetLabel`, `calloutText`, `highlightShape`, and underlying evidence framing instead of drawing an empty ellipse in thin air!).
   - Upgrade `Newsreel1920s`, `SilentFilmCard`, `SpyTitleSequence`, `CaptionNewsCard`, `SplitScreenFrame`, `QuoteHighlightCard`, etc. with dynamic data props, crisp typography, and subtle film/archival detail.
2. **Create `macroTelemetry.tsx` (22 Financial Times / Bloomberg / Patrick Boyle Cinema Charts)**:
   - `DivergingJawsChart` (e.g., 2017–2026 Output/hr `+20%` vs lagging Pay, or 1947–2026 `53%` Labor Share piercing Truman floor),
   - `NegativeFcfWaterfall` (positive revenue/capex `$740B–$820B` plunging below `$0` into red `-$42B` FCF),
   - `WealthDecileMonoliths` (`Top 10% = 90%` vs `Bottom 50% = 1%` with inset magnifier on the `1%` sliver),
   - `AuctionPriceShockwave` (`$28.92 -> $269.92/MW-day`, `+833%` vertical step eruption),
   - `JevonsDeflationCurve` (`-99%` unit token price plunging to floor while automated volume rockets up),
   - `SovereignSpreadFlip` (e.g. France `4.93%` OAT crossing above Greece `4.26%` `+67 bps`),
   - `DebtDeflationJaws1933` (Irving Fisher falling wages/prices vs frozen nominal debt bar),
   - `GoldVsFiatFedCorridor` (`1933` gold lock vs `2%` CPI liquidity pump),
   - `GenerationalHorizonRule` (`Age 18 -> Age 28` `2026–2056` fixed liability vs asset ownership),
   - Plus 13 parameterized analytical variants (`StackedShareShift`, `CapexVsDepreciationGap`, `ForeignHolderRollover`, `ReserveAttestationBar`, `TrustFundDepletionCurve`, `DemographicCliffPyramid`, `CostExchangeRatioBar`, `BandwidthConcentrationBar`, `EscrowShockBreakdown`, `MineralRefiningDominance`, `WaitlistQueueHistogram`, `RealVsNominalShrink`, `MarginBidComparison`) — all rendered via genuine parametric chart components with distinct visual encodings and exported in `MACRO_TELEMETRY_STYLES` (`22` style recipes)!
3. **Create `forensicExhibits.tsx` (24 Primary-Source, Legal & Media-Confrontation Stages)**:
   - `FiscalLedgerTableStage` (data-driven multi-row Treasury/CBO/10-K table inspector with animated row highlight sweep, delta badges, statute callouts, and vertical page pan—turning `TreasuryTable9Scene`'s 696-line one-off magic into a reusable data-driven component for ANY table!),
   - `ClaimVsRealityCollision` (left verified X post / podcast / interview card colliding with right ACH rent draft / CTO `$1,500` spend cap / CBO `$2.1T` interest brick wall),
   - `SupremeCourtSyllabusStage` (judicial caption e.g. *Wielechowski v. State*, unanimous holding highlight, formula vs actual payout bar drop `$3,900 -> $1,000`),
   - `EscapeHatchSwitchboard` (persistent 3-bay investigation board locking red failure stamps onto prior bays without resetting!),
   - `ArchivalRationBook1941` (16 ration coupons ticking down while sterling notes sit unusable),
   - `FoiaRedactionDeclassify`, `Sec10KFootnoteStretch`, `BdcPikScheduleExhibit`, `StatutoryClauseHighlighter`, `InsuranceRateHikeNotice`, `IrsForm941FicaSplit`, `SubseaSabotageIncidentLog`, plus 12 parameterized forensic document/press/corkboard recipes exported in `FORENSIC_EXHIBIT_STYLES` (`24` style recipes, bringing Suite A total with upgraded `docBroadcast` + `vintageEditorial` to **60+ distinct style recipes**!).
````

---

## Agent #20: 60-Style Simulators, 3D, Maps & UI Engineer (Agent 20)

- **Subagent ID:** `8c5fb81d-b75c-44cf-8d0b-f0017d0358d9`
- **TypeName:** `cinema-engineer`
- **Model:** `inherit`
- **Workspace:** `inherit`
- **Invoked at Step:** `77`

### Exact Prompt

````markdown
Build **Pillar #3B: 60 Data-Driven Mechanical Metaphor, System Plumbing, UI Satire, Collage, Cartography & 3D Isometric Documentary Styles** inside `d:\Youtube channel\reading-room-cinema\studio\src\styles\`.

First read the two existing files you own to preserve 100% backward compatibility with every existing exported component name and prop type:
- `d:\Youtube channel\reading-room-cinema\studio\src\styles\diagramMetaphor.tsx`
- `d:\Youtube channel\reading-room-cinema\studio\src\styles\dataMaps3D.tsx`

You EXCLUSIVELY own and may create/modify ONLY:
- `studio/src/styles/diagramMetaphor.tsx`
- `studio/src/styles/dataMaps3D.tsx`
- `studio/src/styles/systemSimulators.tsx` (NEW)
- `studio/src/styles/uiSatireAndCollage.tsx` (NEW)

Import ONLY stable base exports (`COLORS`, `PAGE_PALETTE`, `OVER_FOOTAGE_PALETTE`, `SPRINGS` from `../design/tokens`, `FONTS` from `../design/fonts`, `remotion`, `react`, `d3`, `topojson-client`, `us-atlas`, `world-atlas`, `lucide-react`) so there are zero cross-agent import races.

Implement completely (100% Remotion deterministic, zero `Math.random()`, zero CSS transitions, full-1920x1080 balanced layouts on `page` mode—eliminating the legacy 75%-blank-canvas bug!):
1. **Fix & Upgrade `diagramMetaphor.tsx` & `dataMaps3D.tsx`**:
   - **`DataPhysicalCard`**: Fix the bug where values were clamped to `[5, 100]` and suffixed with `%`! Support arbitrary units (`$40.5T`, `$3,400`, `820B`, `84.1%`, `100:1`), proportional normalization across bars, and full-frame editorial composition (left analytical thesis/context column + right 3D isometric physical pillar stage) when rendered in `page` mode!
   - **`WhiteModel3D`**: Eliminate the per-frame `new THREE.WebGLRenderer` memory leak completely! Replace with a crisp, deterministic, multi-tier **Parametric Isometric 3D Architectural Model** (SVG shaded top/left/right faces, cast shadows, elevation dimension lines, dynamic block heights/labels/colors from props)!
   - **`MapExplainer`**: Upgrade to resolve all US states, world countries, and multi-state corridors (`PJM`, `Taiwan`, `UK`, `Ireland`, `Japan`, `China`, `France`, `Greece`, `Alaska`, `Texas`, `West Virginia`, `Netherlands`, `Red Sea`, `Baltic`, etc.) with dynamic title, metric callout card, pins, and arcs—never silently defaulting foreign countries to Austin, Texas!
   - **`InstructionManualCard`, `StickFigureStage`, `CollageCutout`, `BlobSimulation`**: Remove hardcoded `"TAXES (84%)"` / `"$38.4T DEBT"` defaults when dynamic props are passed, add rich configurable poses/steps/bottleneck labels, and compose cleanly across the full 1920x1080 editorial grid!
2. **Create `systemSimulators.tsx` (26 Mechanical, Plumbing & Infrastructure Simulation Styles)**:
   - `SupplyChainBomStrip` (`$120` shoe / X-ray decomposed into human-hour slices vaporizing 80% down to electricity plinth),
   - `PaloAltoWhiteboardFlip` (3D Y-axis flip from `Falling Prices = Abundance` whiteboard to cast-iron `30-Year Fixed Loan`),
   - `DualTaxPlumbingSchematic` (top W-2 pipe sliced by automatic withholding guillotine vs bottom corporate/capital pipe routing through `100% Write-Off`, `Ireland IP`, and `0%-Tax Stock Margin Loans`),
   - `SovereignPrioritySpillway` (3-tier dam paying `$2.1T Bondholders` and `Defense/Social Security` first, starving citizen check below),
   - `SplitEraStrikeDiptych` (`1955` frozen Rotterdam/Detroit pier bleeding owner cash vs `2034` `99.9%`-uptime robotic port + Capitol march),
   - `LogarithmicWattageLadder` (`10W` charger -> `1kW` microwave -> `1GW` 1M microwaves / city -> `5GW` AI campus = 5 cities),
   - `VelocityMismatchChronometer` (`6-month` coding agent industry rollout vs `5–10 year` 765kV grid permitting checkpoints),
   - `CircularAccountingLoop` (`Nvidia <-> CoreWeave <-> Cloud SPV` circular revenue/debt carousel),
   - `AsymmetricExchangeSimulator` (`$20k` drone vs `$13B` carrier draining `$4M` VLS cells),
   - `SubseaCableCrossSection` (550 garden-hose fibers carrying `$10T/day` + anchor severing),
   - `LithographyNodeLock` (Phoenix `4nm` vs Taiwan `2nm/A16` + EUV remote kill-switch),
   - Plus 15 parameterized physical/hydraulic/industrial/toy-model recipes exported in `SYSTEM_SIMULATOR_STYLES` (`26` style recipes)!
3. **Create `uiSatireAndCollage.tsx` (24 Consumer Wallet, Household Dossier, Perishability & Dry-Wit Styles)**:
   - `LongitudinalHouseholdDossier` (Claire's stateful Austin house elevation + right-hand T-account tracking `2025 $3,400 lock -> 2030 -70% pay cut & refi denial -> $45k locked 401k -> Oct 2036 house kept vs Austin August A/C shock`),
   - `PerishableSeatVsComputeSplit` (pushing-back airliner empty seat `14A` paired with expiring Tuesday GPU clock),
   - `ClosedComputeScripWallet` (`$100k` cloud credits = `$0.00` at Chase rent + `0%` captive partner rails vs `-20%` cash-out tollgate),
   - `CoalScripVsDigitalYuan` (`1912` Island Creek brass token `-25%` haircut paired with `2020` Shenzhen `6-day` vanishing digital yuan app),
   - `FountainPenVetoSlash` (Gov. Walker veto slicing `$2,052 -> $1,022` / one-signature `-50%` phone balance cut),
   - `UnwrittenTruceToAllowance` (200-year `48-hour walkout` contract morphing via strikethrough from `PAYCHECK` to `ALLOWANCE`),
   - Plus 18 parameterized UI satire, hinged paper-cutout comedy, receipt-printer, viewer-game quiz, roof-drone escrow, and dossier recipes exported in `UI_SATIRE_COLLAGE_STYLES` (`24` style recipes, bringing Suite B + upgraded `diagramMetaphor` + `dataMaps3D` to **60+ distinct style recipes**!).
````

