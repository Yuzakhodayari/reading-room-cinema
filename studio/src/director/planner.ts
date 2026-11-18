import {
  BeatCategory,
  CameraFraming,
  CinemaRegister,
  DepthSandwichSpec,
  DirectorAudit,
  DirectorBeat,
  DirectorBeatDataPayload,
  DirectorExhibitData,
  DirectorOptions,
  DirectorPlan,
  DirectorSeriesPoint,
  DirectorSfxCue,
  DirectorTableRow,
  GlassPreset,
  MusicEnergy,
  PaletteMode,
  StyleEngineFamily,
  StyleRecipe,
  StyleWorldId,
  TranscriptSegment,
} from "./schema";
import { resolveGeoQuery } from "../maps/atlasResolver";
import {
  CANONICAL_GLASS_PRESET_IDS,
  CANONICAL_TYPOGRAPHY_MODE_IDS,
  STRATEGY_PRESETS,
  StrategyPresetId,
  StrategyPresetIdSchema,
  createEpisode01ContinuityEngine,
  filterRecipesByStrategyGuardrails,
} from "../novelty";
import {
  AnyTimedWord,
  TimedWord,
  connectWhisperWordsToBeat,
  synthesizeTimedWords,
} from "../typography/prosodySync";

export const CINEMA_10_STYLE_WORLDS: readonly StyleWorldId[] = [
  "liquid-glass",
  "doc-broadcast",
  "vintage-editorial",
  "macro-telemetry",
  "forensic-exhibits",
  "diagram-metaphor",
  "data-maps-3d",
  "system-simulators",
  "ui-satire-collage",
  "generative-setpiece",
];

export interface SignatureSetPieceRule {
  id: string;
  blueprintKey: string;
  title: string;
  styleWorld: StyleWorldId;
  styleFamily: StyleEngineFamily;
  componentHint: string;
  register: CinemaRegister;
  typographyMode: string;
  sfxPrimary: string;
  sfxSecondary: string;
  propIds: string[];
  pattern: RegExp;
}

export const SIGNATURE_SET_PIECES: readonly SignatureSetPieceRule[] = [
  {
    id: "sp-ep01-shoe-bom-vaporizer",
    blueprintKey: "SP01_SHOE_LABOR_VAPORIZER",
    title: "$120 Running Shoe 80% Labor Vaporizer",
    styleWorld: "generative-setpiece",
    styleFamily: "diagram-metaphor",
    componentHint: "IsometricScene",
    register: "page_editorial",
    typographyMode: "blueprint-dimension-callout",
    sfxPrimary: "pneumatic-servo",
    sfxSecondary: "data-tick",
    propIds: ["RunningShoeExplodedStack"],
    pattern: /running shoes|dental x-ray|unit costs drop/i,
  },
  {
    id: "sp-ep01-whiteboard-iron-loan-flip",
    blueprintKey: "SP02_PALO_ALTO_WHITEBOARD_FLIP",
    title: "Palo Alto Whiteboard 180° Flip to Cast-Iron Loan",
    styleWorld: "generative-setpiece",
    styleFamily: "diagram-metaphor",
    componentHint: "InstructionManualCard",
    register: "page_editorial",
    typographyMode: "antithesis-split-lock",
    sfxPrimary: "anvil-iron-clank",
    sfxSecondary: "marker-sweep",
    propIds: ["PaloAltoFlipWhiteboard"],
    pattern: /whiteboard in palo alto|thirty-year loan/i,
  },
  {
    id: "sp-ep01-claire-longitudinal-house",
    blueprintKey: "SP03_CLAIRE_LONGITUDINAL_HOUSE",
    title: "Claire Longitudinal 2025-2036 House Ledger",
    styleWorld: "ui-satire-collage",
    styleFamily: "diagram-metaphor",
    componentHint: "StickFigureStage",
    register: "archival_parchment",
    typographyMode: "ledger-tabular-rollup",
    sfxPrimary: "calculator-ribbon-print",
    sfxSecondary: "audit-row-lock",
    propIds: ["ClaireAustinHouseRig"],
    pattern: /claire.{0,45}3,400|austin.{0,30}2025|austin august/i,
  },
  {
    id: "sp-ep01-w2-guillotine-tax-plumbing",
    blueprintKey: "SP04_W2_GUILLOTINE_TAX_PLUMBING",
    title: "W-2 Guillotine vs Ireland Tax Plumbing",
    styleWorld: "system-simulators",
    styleFamily: "diagram-metaphor",
    componentHint: "IsometricScene",
    register: "drafting_blueprint",
    typographyMode: "ledger-tabular-rollup",
    sfxPrimary: "guillotine-slice",
    sfxSecondary: "blueprint-unroll",
    propIds: ["W2WithholdingGuillotine"],
    pattern: /tax plumbing|withholding.{0,40}payroll|route intellectual-property/i,
  },
  {
    id: "sp-ep01-port-1955-vs-2034-diptych",
    blueprintKey: "SP05_1955_PIER_VS_2034_PORT",
    title: "1955 Silent Pier vs 2034 Robotic Port",
    styleWorld: "system-simulators",
    styleFamily: "doc-broadcast",
    componentHint: "LiveCountdownSplit",
    register: "midnight_telemetry",
    typographyMode: "solari-split-flap",
    sfxPrimary: "pneumatic-servo",
    sfxSecondary: "anchor-chain-scrape",
    propIds: ["IdlePier1955", "AutonomousPortGantry2034"],
    pattern: /dockworkers in rotterdam|robotic cranes unload|every machine keeps running/i,
  },
  {
    id: "sp-ep01-alaska-veto-slash",
    blueprintKey: "SP06_ALASKA_WALKER_VETO_SLASH",
    title: "Alaska Gov. Walker Fountain-Pen Veto Slash",
    styleWorld: "forensic-exhibits",
    styleFamily: "doc-broadcast",
    componentHint: "ArchiveLightTable",
    register: "archival_parchment",
    typographyMode: "veto-fountain-strike",
    sfxPrimary: "fountain-pen-slash",
    sfxSecondary: "gavel-wood-hit",
    propIds: ["GovernorVetoFountainPen", "SupremeCourtBenchGavel"],
    pattern: /bill walker|veto pen|wielechowski/i,
  },
  {
    id: "sp-ep01-bond-priority-spillway",
    blueprintKey: "SP07_SOVEREIGN_BOND_SPILLWAY",
    title: "Federal $2.1T Bond Priority Spillway",
    styleWorld: "generative-setpiece",
    styleFamily: "data-maps-3d",
    componentHint: "DataPhysicalCard",
    register: "drafting_blueprint",
    typographyMode: "debt-odometer-inline",
    sfxPrimary: "vault-bolt-lock",
    sfxSecondary: "hydraulic-press",
    propIds: ["SpillwayDam3Tier", "DebtMonolithWall"],
    pattern: /bondholders always get paid first|debt-ceiling standoff/i,
  },
  {
    id: "sp-ep01-uber-4mo-token-burn",
    blueprintKey: "SP08_UBER_4MONTH_TOKEN_BURN",
    title: "Uber 4-Month AI Budget Burnout",
    styleWorld: "forensic-exhibits",
    styleFamily: "doc-broadcast",
    componentHint: "CaptionNewsCard",
    register: "midnight_telemetry",
    typographyMode: "stock-ticker-crawl",
    sfxPrimary: "server-rack-hum",
    sfxSecondary: "alert-ping",
    propIds: ["TokenDeflationFurnace"],
    pattern: /uber burned through|1,500 per engineer/i,
  },
  {
    id: "sp-ep01-empty-gate-14a-compute",
    blueprintKey: "SP09_EMPTY_GATE_14A_PERISHABLE",
    title: "Empty Gate 14A vs Expiring Tuesday Compute",
    styleWorld: "ui-satire-collage",
    styleFamily: "diagram-metaphor",
    componentHint: "InstructionManualCard",
    register: "page_editorial",
    typographyMode: "erosion-decay-fade",
    sfxPrimary: "jet-gate-retract",
    sfxSecondary: "pendulum-escapement-tick",
    propIds: ["EmptyAirlineGate14A"],
    pattern: /spoils on the clock|plane pushes back|idle server time in a jar/i,
  },
  {
    id: "sp-ep01-closed-scrip-wallet",
    blueprintKey: "SP10_CLOSED_SCRIP_20PCT_TOLL",
    title: "Closed Scrip Wallet 20% Exit Toll vs 1912 Coal Scrip",
    styleWorld: "ui-satire-collage",
    styleFamily: "vintage-editorial",
    componentHint: "Newsreel1920s",
    register: "archival_parchment",
    typographyMode: "statute-clause-box",
    sfxPrimary: "coin-brass-clink",
    sfxSecondary: "nsf-decline-buzz",
    propIds: ["ClosedScripWalletRig", "CoalScripBrassToken1912"],
    pattern: /twenty percent fee|island creek coal|paint creek|shenzhen/i,
  },
  {
    id: "sp-ep01-wattage-10w-to-5gw-ladder",
    blueprintKey: "SP11_10W_TO_5GW_POWER_LADDER",
    title: "10W Charger to 5GW AI Campus Power Ladder",
    styleWorld: "generative-setpiece",
    styleFamily: "data-maps-3d",
    componentHint: "WhiteModel3D",
    register: "drafting_blueprint",
    typographyMode: "blueprint-dimension-callout",
    sfxPrimary: "watt-meter-whir",
    sfxSecondary: "substation-60hz-buzz",
    propIds: ["WattageApplianceNode", "HighVoltageSubstationRig"],
    pattern: /phone charger draws ten watts|five gigawatts on a single ai campus/i,
  },
  {
    id: "sp-ep01-agent-vs-grid-permitting-race",
    blueprintKey: "SP12_6MO_AGENT_VS_10YR_GRID",
    title: "6-Month Agent vs 10-Year Grid Permitting Race",
    styleWorld: "system-simulators",
    styleFamily: "doc-broadcast",
    componentHint: "LiveCountdownSplit",
    register: "midnight_telemetry",
    typographyMode: "solari-split-flap",
    sfxPrimary: "ratchet-winch-click",
    sfxSecondary: "high-voltage-arc-snap",
    propIds: ["Transformer128WeekQueue"],
    pattern: /six months.{0,60}five to ten years|gap between software speed and construction speed/i,
  },
  {
    id: "sp-ep01-1941-uk-ration-counter",
    blueprintKey: "SP13_1941_UK_16PT_RATION_BOOK",
    title: "1941 UK 16-Point Ration Counter",
    styleWorld: "vintage-editorial",
    styleFamily: "vintage-editorial",
    componentHint: "Newsreel1920s",
    register: "vintage_newsreel",
    typographyMode: "typewriter-1941-ribbon",
    sfxPrimary: "paper-tear-crisp",
    sfxSecondary: "typewriter-strike",
    propIds: ["BritishRationBook1941"],
    pattern: /december 1, 1941|ministry of food|sixteen ration points/i,
  },
  {
    id: "sp-ep01-walker-veto-allowance-slam",
    blueprintKey: "SP14_FRIDAY_TRUCE_TO_ALLOWANCE",
    title: "200-Year Friday Truce to Allowance Verdict",
    styleWorld: "ui-satire-collage",
    styleFamily: "vintage-editorial",
    componentHint: "SilentFilmCard",
    register: "page_editorial",
    typographyMode: "verdict-anvil-slam",
    sfxPrimary: "fountain-pen-slash",
    sfxSecondary: "resolve-chord-warm",
    propIds: ["GovernorVetoFountainPen"],
    pattern: /we call that an allowance|zero power to negotiate|it'?s an allowance/i,
  },
  {
    id: "sp-ep02-tether-vs-tokyo-tbill-shift",
    blueprintKey: "SP15_TETHER_VS_TOKYO_TBILL",
    title: "Tether vs Tokyo T-Bill Shift",
    styleWorld: "data-maps-3d",
    styleFamily: "data-maps-3d",
    componentHint: "MapExplainer",
    register: "archival_parchment",
    typographyMode: "ledger-tabular-rollup",
    sfxPrimary: "balance-scale-creak",
    sfxSecondary: "map-whoosh",
    propIds: ["TreasuryBondVault"],
    pattern: /tether|stablecoin.{0,40}treasury|tokyo.{0,40}t-bill/i,
  },
  {
    id: "sp-ep03-nvidia-coreweave-spv-carousel",
    blueprintKey: "SP16_NVIDIA_COREWEAVE_SPV_LOOP",
    title: "Nvidia-CoreWeave Circular SPV Carousel",
    styleWorld: "generative-setpiece",
    styleFamily: "diagram-metaphor",
    componentHint: "IsometricScene",
    register: "midnight_telemetry",
    typographyMode: "footnote-loupe-zoom",
    sfxPrimary: "pneumatic-servo",
    sfxSecondary: "glass-loupe-click",
    propIds: ["CircularGpuSpvCarousel", "GpuServerRackTower"],
    pattern: /coreweave|special purpose vehicle|circular.{0,30}gpu/i,
  },
  {
    id: "sp-ep04-saas-pik-debt-snowball",
    blueprintKey: "SP17_SAAS_PIK_DEBT_SNOWBALL",
    title: "SaaS PIK Debt Snowball",
    styleWorld: "macro-telemetry",
    styleFamily: "data-maps-3d",
    componentHint: "BlobSimulation",
    register: "midnight_telemetry",
    typographyMode: "debt-odometer-inline",
    sfxPrimary: "hydraulic-press",
    sfxSecondary: "warning-thud",
    propIds: ["PikDebtSnowball"],
    pattern: /payment-in-kind|\bpik\b|private credit/i,
  },
  {
    id: "sp-ep05-california-lidar-roof-drone",
    blueprintKey: "SP18_CA_ROOF_SCAN_DRONE",
    title: "California Roof-Scan Insurance Drone",
    styleWorld: "ui-satire-collage",
    styleFamily: "diagram-metaphor",
    componentHint: "IsometricScene",
    register: "archival_parchment",
    typographyMode: "telestrator-grease-math",
    sfxPrimary: "drone-pass-by",
    sfxSecondary: "camera-shutter",
    propIds: ["RoofScanInsuranceDrone"],
    pattern: /fair plan|homeowners insurance|roof.{0,25}drone/i,
  },
  {
    id: "sp-ep06-transformer-128wk-copper-trap",
    blueprintKey: "SP19_128WK_TRANSFORMER_COPPER",
    title: "128-Week Transformer & Copper Bottleneck",
    styleWorld: "system-simulators",
    styleFamily: "data-maps-3d",
    componentHint: "DataPhysicalCard",
    register: "drafting_blueprint",
    typographyMode: "blueprint-dimension-callout",
    sfxPrimary: "substation-60hz-buzz",
    sfxSecondary: "breaker-trip-clunk",
    propIds: ["Transformer128WeekQueue", "CopperOpenPitClock"],
    pattern: /128-week|copper wire, high-voltage transformers/i,
  },
  {
    id: "sp-ep07-taiwan-2nm-euv-killswitch",
    blueprintKey: "SP20_TAIWAN_2NM_EUV_KILLSWITCH",
    title: "Taiwan 2nm Blockade & ASML EUV Kill-Switch",
    styleWorld: "data-maps-3d",
    styleFamily: "data-maps-3d",
    componentHint: "MapExplainer",
    register: "midnight_telemetry",
    typographyMode: "redacted-declassify",
    sfxPrimary: "euv-laser-pulse",
    sfxSecondary: "breaker-trip-clunk",
    propIds: ["AsmlEuvKillSwitchRig", "SiliconWaferNodeCompare"],
    pattern: /\basml\b|\beuv\b|taiwan.{0,30}2nm/i,
  },
  {
    id: "sp-ep08-drone-20k-vs-carrier-vls-drain",
    blueprintKey: "SP21_20K_DRONE_VS_13B_CARRIER",
    title: "$20k Drone vs $13B Carrier VLS Drain",
    styleWorld: "macro-telemetry",
    styleFamily: "data-maps-3d",
    componentHint: "DataPhysicalCard",
    register: "drafting_blueprint",
    typographyMode: "antithesis-split-lock",
    sfxPrimary: "vls-launch-whoosh",
    sfxSecondary: "drone-pass-by",
    propIds: ["CarrierVsDroneExchange"],
    pattern: /vls|aircraft carrier.{0,40}drone|20,000 drone/i,
  },
  {
    id: "sp-ep09-subsea-550-cable-anchor-cut",
    blueprintKey: "SP22_550_SUBSEA_CABLE_ANCHOR",
    title: "550 Subsea Cable Anchor Cut",
    styleWorld: "generative-setpiece",
    styleFamily: "data-maps-3d",
    componentHint: "MapExplainer",
    register: "drafting_blueprint",
    typographyMode: "whisper-focus-spotlight",
    sfxPrimary: "subsea-cable-snap",
    sfxSecondary: "radar-sonar-ping",
    propIds: ["SubseaCableAnchorCut"],
    pattern: /subsea cable|undersea cable|550 cables/i,
  },
  {
    id: "sp-ep10-france-greece-vigilante-flip",
    blueprintKey: "SP23_FRANCE_GREECE_SPREAD_FLIP",
    title: "France vs Greece Bond Vigilante Flip",
    styleWorld: "macro-telemetry",
    styleFamily: "doc-broadcast",
    componentHint: "VisualInvestigationBoard",
    register: "midnight_telemetry",
    typographyMode: "antithesis-split-lock",
    sfxPrimary: "basis-point-blip",
    sfxSecondary: "balance-scale-creak",
    propIds: ["BondVigilanteScale"],
    pattern: /france.{0,35}greece|bond vigilante/i,
  },
  {
    id: "sp-ep11-oasi-2032-vault-exhaustion",
    blueprintKey: "SP24_OASI_2032_TRUST_EXHAUSTION",
    title: "Q4 2032 Social Security Vault Exhaustion",
    styleWorld: "forensic-exhibits",
    styleFamily: "doc-broadcast",
    componentHint: "ArchiveLightTable",
    register: "archival_parchment",
    typographyMode: "debt-odometer-inline",
    sfxPrimary: "vault-bolt-lock",
    sfxSecondary: "pendulum-escapement-tick",
    propIds: ["SocialSecurity2032Dial"],
    pattern: /social security.{0,40}2032|oasi trust/i,
  },
];

/**
 * Expanded 60-recipe Cinema Style Catalog spanning all 10 Style Worlds:
 * - Preserves all 24 original commit 534d89a recipes (indices 0..23)
 * - Adds 36 flagship cinema recipes across macro-telemetry, forensic-exhibits,
 *   system-simulators, ui-satire-collage, generative-setpiece, liquid-glass rigs,
 *   vintage archival press, and war-room cartography.
 */
export const STYLE_CATALOG: StyleRecipe[] = [
  // 1-3: Legacy Over-Footage Liquid Glass
  {
    id: "liquid-glass-card",
    styleWorld: "liquid-glass",
    styleFamily: "liquid-glass",
    componentHint: "LiquidGlassObject:card",
    framing: "talking-head-with-glass",
    motionAction: "slide-left -> glow-rim -> fade-blur-out",
    glassPreset: "card",
    glassRig: "card",
    typographyMode: "marker-sweep",
    defaultSfx: "glass-enter",
    secondarySfx: "glass-dock",
    paceProfile: "balanced",
    register: "over_footage",
    depthSandwichEligible: true,
  },
  {
    id: "liquid-glass-dock",
    styleWorld: "liquid-glass",
    styleFamily: "liquid-glass",
    componentHint: "LiquidGlassObject:dock",
    framing: "talking-head-with-glass",
    motionAction: "slide-up -> highlight-sweep -> fade-out",
    glassPreset: "dock",
    glassRig: "bottom-dock",
    typographyMode: "split-lines",
    defaultSfx: "glass-dock",
    secondarySfx: "marker-sweep",
    paceProfile: "balanced",
    register: "over_footage",
  },
  {
    id: "liquid-glass-toast",
    styleWorld: "liquid-glass",
    styleFamily: "liquid-glass",
    componentHint: "LiquidGlassObject:toast",
    framing: "talking-head-punch-in",
    motionAction: "pop-out -> nudge -> pop-down",
    glassPreset: "toast",
    glassRig: "toast-alert",
    typographyMode: "red-correction",
    defaultSfx: "glass-enter",
    secondarySfx: "alert-ping",
    paceProfile: "snappy",
    register: "over_footage",
  },

  // 4-11: Legacy Document & Broadcast
  {
    id: "doc-news-package",
    styleWorld: "doc-broadcast",
    styleFamily: "doc-broadcast",
    componentHint: "NewsPackageLowerThird",
    framing: "talking-head-with-glass",
    motionAction: "slide-left -> highlight-sweep -> fade-out",
    typographyMode: "karaoke-highlight",
    defaultSfx: "glass-enter",
    secondarySfx: "data-tick",
    paceProfile: "balanced",
    register: "over_footage",
  },
  {
    id: "doc-caption-news",
    styleWorld: "doc-broadcast",
    styleFamily: "doc-broadcast",
    componentHint: "CaptionNewsCard",
    framing: "fullscreen-cutaway",
    motionAction: "paper-unfold -> highlight-sweep -> fade-out",
    typographyMode: "marker-sweep",
    defaultSfx: "paper-slide",
    secondarySfx: "marker-sweep",
    paceProfile: "calm-hold",
    register: "page_editorial",
  },
  {
    id: "doc-visual-investigation",
    styleWorld: "doc-broadcast",
    styleFamily: "doc-broadcast",
    componentHint: "VisualInvestigationBoard",
    framing: "fullscreen-cutaway",
    motionAction: "blur-snap -> pulse-warning -> fade-blur-out",
    typographyMode: "stamp-slam",
    defaultSfx: "flash-cut",
    secondarySfx: "warning-thud",
    paceProfile: "calm-hold",
    peakOnly: true,
    register: "midnight_telemetry",
  },
  {
    id: "doc-archive-light-table",
    styleWorld: "doc-broadcast",
    styleFamily: "doc-broadcast",
    componentHint: "ArchiveLightTable",
    framing: "fullscreen-cutaway",
    motionAction: "blur-snap -> lens-zoom -> fade-out",
    typographyMode: "typewriter",
    defaultSfx: "paper-slide",
    secondarySfx: "marker-sweep",
    paceProfile: "calm-hold",
    register: "archival_parchment",
  },
  {
    id: "doc-live-countdown-split",
    styleWorld: "doc-broadcast",
    styleFamily: "doc-broadcast",
    componentHint: "LiveCountdownSplit",
    framing: "split-screen",
    motionAction: "slide-up -> split-compare -> fade-out",
    typographyMode: "word-pop",
    defaultSfx: "data-tick",
    secondarySfx: "riser-subtle",
    paceProfile: "balanced",
    register: "midnight_telemetry",
  },
  {
    id: "doc-telestrator",
    styleWorld: "doc-broadcast",
    styleFamily: "doc-broadcast",
    componentHint: "TelestratorOverlay",
    framing: "split-screen",
    motionAction: "pop-out -> circle-telestrator -> fade-out",
    typographyMode: "marker-sweep",
    defaultSfx: "telestrator-draw",
    secondarySfx: "marker-sweep",
    paceProfile: "balanced",
    register: "over_footage",
  },
  {
    id: "doc-kino-montage",
    styleWorld: "doc-broadcast",
    styleFamily: "doc-broadcast",
    componentHint: "KinoMontageStrip",
    framing: "fullscreen-cutaway",
    motionAction: "slide-left -> lens-zoom -> fade-out",
    typographyMode: "word-pop",
    defaultSfx: "flash-cut",
    secondarySfx: "chapter-chime",
    paceProfile: "snappy",
    register: "page_editorial",
  },
  {
    id: "doc-city-symphony",
    styleWorld: "doc-broadcast",
    styleFamily: "doc-broadcast",
    componentHint: "CitySymphonyFrame",
    framing: "fullscreen-cutaway",
    motionAction: "blur-snap -> ken-burns -> fade-out",
    typographyMode: "split-lines",
    defaultSfx: "camera-shutter",
    paceProfile: "calm-hold",
    register: "page_editorial",
  },

  // 12-16: Legacy Vintage Editorial
  {
    id: "vintage-newsreel",
    styleWorld: "vintage-editorial",
    styleFamily: "vintage-editorial",
    componentHint: "Newsreel1920s",
    framing: "fullscreen-cutaway",
    motionAction: "iris-reveal -> ken-burns -> fade-out",
    typographyMode: "typewriter",
    defaultSfx: "newsreel-click",
    secondarySfx: "paper-slide",
    paceProfile: "calm-hold",
    register: "vintage_newsreel",
  },
  {
    id: "vintage-silent-film",
    styleWorld: "vintage-editorial",
    styleFamily: "vintage-editorial",
    componentHint: "SilentFilmCard",
    framing: "fullscreen-cutaway",
    motionAction: "iris-reveal -> lens-zoom -> fade-out",
    typographyMode: "split-lines",
    defaultSfx: "chapter-chime",
    paceProfile: "balanced",
    register: "vintage_newsreel",
  },
  {
    id: "vintage-collage",
    styleWorld: "vintage-editorial",
    styleFamily: "vintage-editorial",
    componentHint: "CollageCutout",
    framing: "fullscreen-cutaway",
    motionAction: "pop-out -> nudge -> fade-out",
    typographyMode: "word-pop",
    defaultSfx: "paper-flip-fast",
    secondarySfx: "sticker-pop",
    paceProfile: "snappy",
    register: "archival_parchment",
  },
  {
    id: "vintage-spy-titles",
    styleWorld: "vintage-editorial",
    styleFamily: "vintage-editorial",
    componentHint: "SpyTitleSequence",
    framing: "fullscreen-cutaway",
    motionAction: "curtain-wipe -> magnifier-pan -> fade-out",
    typographyMode: "typewriter",
    defaultSfx: "flash-cut",
    secondarySfx: "type-click",
    paceProfile: "balanced",
    register: "midnight_telemetry",
  },
  {
    id: "vintage-stained-glass",
    styleWorld: "vintage-editorial",
    styleFamily: "vintage-editorial",
    componentHint: "StainedGlassFrame",
    framing: "split-screen",
    motionAction: "curtain-wipe -> split-compare -> fade-out",
    typographyMode: "split-lines",
    defaultSfx: "chapter-chime",
    paceProfile: "calm-hold",
    register: "archival_parchment",
  },

  // 17-20: Legacy Diagram & Metaphor
  {
    id: "diagram-sticker",
    styleWorld: "diagram-metaphor",
    styleFamily: "diagram-metaphor",
    componentHint: "StickerCutout",
    framing: "talking-head-punch-in",
    motionAction: "elastic-open -> nudge -> pop-down",
    typographyMode: "word-pop",
    defaultSfx: "sticker-pop",
    paceProfile: "snappy",
    register: "over_footage",
  },
  {
    id: "diagram-stick-figure",
    styleWorld: "diagram-metaphor",
    styleFamily: "diagram-metaphor",
    componentHint: "StickFigureStage",
    framing: "fullscreen-cutaway",
    motionAction: "pop-out -> float-idle -> fade-out",
    typographyMode: "karaoke-highlight",
    defaultSfx: "sticker-pop",
    secondarySfx: "paper-slide",
    paceProfile: "balanced",
    register: "page_editorial",
  },
  {
    id: "diagram-instruction-manual",
    styleWorld: "diagram-metaphor",
    styleFamily: "diagram-metaphor",
    componentHint: "InstructionManualCard",
    framing: "fullscreen-cutaway",
    motionAction: "paper-unfold -> underline-draw -> fade-out",
    typographyMode: "split-lines",
    defaultSfx: "paper-slide",
    secondarySfx: "telestrator-draw",
    paceProfile: "balanced",
    register: "page_editorial",
  },
  {
    id: "diagram-isometric",
    styleWorld: "diagram-metaphor",
    styleFamily: "diagram-metaphor",
    componentHint: "IsometricScene",
    framing: "fullscreen-cutaway",
    motionAction: "slide-up -> tilt-3d -> fade-out",
    typographyMode: "word-pop",
    defaultSfx: "data-tick",
    paceProfile: "calm-hold",
    register: "drafting_blueprint",
  },

  // 21-24: Legacy Data & Maps 3D
  {
    id: "data-map-explainer",
    styleWorld: "data-maps-3d",
    styleFamily: "data-maps-3d",
    componentHint: "MapExplainer",
    framing: "fullscreen-cutaway",
    motionAction: "blur-snap -> circle-telestrator -> fade-out",
    typographyMode: "split-lines",
    defaultSfx: "map-whoosh",
    secondarySfx: "marker-sweep",
    paceProfile: "calm-hold",
    register: "page_editorial",
  },
  {
    id: "data-physical-card",
    styleWorld: "data-maps-3d",
    styleFamily: "data-maps-3d",
    componentHint: "DataPhysicalCard",
    framing: "fullscreen-cutaway",
    motionAction: "slide-up -> card-tilt-3d -> fade-blur-out",
    typographyMode: "word-pop",
    defaultSfx: "data-tick",
    secondarySfx: "marker-sweep",
    paceProfile: "calm-hold",
    register: "page_editorial",
  },
  {
    id: "data-white-model-3d",
    styleWorld: "data-maps-3d",
    styleFamily: "data-maps-3d",
    componentHint: "WhiteModel3D",
    framing: "fullscreen-cutaway",
    motionAction: "blur-snap -> parallax-hover -> fade-blur-out",
    typographyMode: "split-lines",
    defaultSfx: "riser-subtle",
    secondarySfx: "data-tick",
    paceProfile: "calm-hold",
    register: "drafting_blueprint",
  },
  {
    id: "data-blob-simulation",
    styleWorld: "data-maps-3d",
    styleFamily: "data-maps-3d",
    componentHint: "BlobSimulation",
    framing: "fullscreen-cutaway",
    motionAction: "blur-snap -> orbit-float -> fade-blur-out",
    typographyMode: "karaoke-highlight",
    defaultSfx: "ambient-tension-drone",
    secondarySfx: "data-tick",
    paceProfile: "calm-hold",
    register: "midnight_telemetry",
  },

  // 25-30: Extended Liquid Glass Rigs & Depth-Sandwich Stages (World 1)
  {
    id: "glass-dossier-stack",
    styleWorld: "liquid-glass",
    styleFamily: "liquid-glass",
    componentHint: "LiquidGlassObject:card",
    framing: "talking-head-with-glass",
    motionAction: "dossier-slide-desk -> glow-rim -> fade-blur-out",
    glassPreset: "card",
    glassRig: "dossier-stack",
    typographyMode: "cascading-evidence-stack",
    defaultSfx: "glass-frosted-slide",
    secondarySfx: "paper-slide",
    paceProfile: "balanced",
    register: "over_footage",
    depthSandwichEligible: true,
  },
  {
    id: "glass-magnifier-card",
    styleWorld: "liquid-glass",
    styleFamily: "liquid-glass",
    componentHint: "LiquidGlassObject:card",
    framing: "talking-head-with-glass",
    motionAction: "loupe-pop-focus -> loupe-scan-row -> fade-blur-out",
    glassPreset: "card",
    glassRig: "magnifier-card",
    typographyMode: "footnote-loupe-zoom",
    defaultSfx: "glass-loupe-click",
    secondarySfx: "felt-highlighter",
    paceProfile: "calm-hold",
    register: "over_footage",
    depthSandwichEligible: true,
  },
  {
    id: "glass-telemetry-strip",
    styleWorld: "liquid-glass",
    styleFamily: "liquid-glass",
    componentHint: "LiquidGlassObject:dock",
    framing: "talking-head-with-glass",
    motionAction: "slide-up -> highlight-sweep -> fade-out",
    glassPreset: "dock",
    glassRig: "telemetry-strip",
    typographyMode: "stock-ticker-crawl",
    defaultSfx: "glass-dock",
    secondarySfx: "odometer-tick",
    paceProfile: "balanced",
    register: "over_footage",
  },
  {
    id: "glass-verdict-seal",
    styleWorld: "liquid-glass",
    styleFamily: "liquid-glass",
    componentHint: "LiquidGlassObject:toast",
    framing: "talking-head-punch-in",
    motionAction: "pneumatic-stamp-in -> nudge -> pop-down",
    glassPreset: "toast",
    glassRig: "verdict-seal",
    typographyMode: "verdict-anvil-slam",
    defaultSfx: "archival-stamp",
    secondarySfx: "gavel-wood-hit",
    paceProfile: "snappy",
    register: "over_footage",
  },
  {
    id: "glass-compare-scale",
    styleWorld: "liquid-glass",
    styleFamily: "liquid-glass",
    componentHint: "LiquidGlassObject:card",
    framing: "talking-head-with-glass",
    motionAction: "scale-beam-drop -> split-compare -> fade-blur-out",
    glassPreset: "split-modal",
    glassRig: "compare-scale",
    typographyMode: "antithesis-split-lock",
    defaultSfx: "balance-scale-creak",
    secondarySfx: "data-tick",
    paceProfile: "balanced",
    register: "over_footage",
    depthSandwichEligible: true,
  },
  {
    id: "glass-stat-triptych",
    styleWorld: "liquid-glass",
    styleFamily: "liquid-glass",
    componentHint: "LiquidGlassObject:dock",
    framing: "talking-head-with-glass",
    motionAction: "slide-up -> glow-rim -> fade-out",
    glassPreset: "dock",
    glassRig: "stat-triptych",
    typographyMode: "ledger-tabular-rollup",
    defaultSfx: "glass-triptych-cascade",
    secondarySfx: "odometer-tick",
    paceProfile: "balanced",
    register: "over_footage",
  },
];

// 31-60: Remaining 8 Cinema Style Worlds (Macro Telemetry, Forensic Exhibits,
// System Simulators, UI Satire, Vintage Archival, Corridor Maps, Generative Set-Pieces)
STYLE_CATALOG.push(
  // Macro Telemetry (World 4)
  {
    id: "DivergingJawsChart",
    styleWorld: "macro-telemetry",
    styleFamily: "data-maps-3d",
    componentHint: "DataPhysicalCard",
    framing: "fullscreen-cutaway",
    motionAction: "orthographic-extrude -> audit-row-step -> fade-blur-out",
    typographyMode: "chisel-highlighter-sweep",
    defaultSfx: "odometer-tick",
    secondarySfx: "felt-highlighter",
    paceProfile: "calm-hold",
    register: "midnight_telemetry",
  },
  {
    id: "NegativeFcfWaterfall",
    styleWorld: "macro-telemetry",
    styleFamily: "data-maps-3d",
    componentHint: "WhiteModel3D",
    framing: "fullscreen-cutaway",
    motionAction: "isometric-rise -> tranche-waterfall-step -> fade-blur-out",
    typographyMode: "ledger-tabular-rollup",
    defaultSfx: "sub-bass-drop",
    secondarySfx: "audit-row-lock",
    paceProfile: "calm-hold",
    register: "midnight_telemetry",
  },
  {
    id: "AuctionPriceShockwave",
    styleWorld: "macro-telemetry",
    styleFamily: "doc-broadcast",
    componentHint: "VisualInvestigationBoard",
    framing: "fullscreen-cutaway",
    motionAction: "blur-snap -> auction-tail-tremor -> fade-blur-out",
    typographyMode: "verdict-anvil-slam",
    defaultSfx: "high-voltage-arc-snap",
    secondarySfx: "warning-thud",
    paceProfile: "calm-hold",
    peakOnly: true,
    register: "midnight_telemetry",
  },
  {
    id: "SovereignSpreadFlip",
    styleWorld: "macro-telemetry",
    styleFamily: "doc-broadcast",
    componentHint: "LiveCountdownSplit",
    framing: "split-screen",
    motionAction: "slide-up -> yield-spread-widen -> fade-out",
    typographyMode: "antithesis-split-lock",
    defaultSfx: "basis-point-blip",
    secondarySfx: "balance-scale-creak",
    paceProfile: "balanced",
    register: "midnight_telemetry",
  },
  {
    id: "DebtDeflationJaws1933",
    styleWorld: "macro-telemetry",
    styleFamily: "vintage-editorial",
    componentHint: "Newsreel1920s",
    framing: "fullscreen-cutaway",
    motionAction: "iris-reveal -> archive-page-breath -> fade-out",
    typographyMode: "typewriter-1941-ribbon",
    defaultSfx: "newsreel-click",
    secondarySfx: "anvil-iron-clank",
    paceProfile: "calm-hold",
    register: "archival_parchment",
  },
  {
    id: "StackedShareShift",
    styleWorld: "macro-telemetry",
    styleFamily: "data-maps-3d",
    componentHint: "BlobSimulation",
    framing: "fullscreen-cutaway",
    motionAction: "orthographic-extrude -> debt-clock-blur -> fade-blur-out",
    typographyMode: "debt-odometer-inline",
    defaultSfx: "calculator-ribbon-print",
    secondarySfx: "audit-row-lock",
    paceProfile: "calm-hold",
    register: "page_editorial",
  },

  // Forensic Exhibits (World 5)
  {
    id: "FiscalLedgerTableStage",
    styleWorld: "forensic-exhibits",
    styleFamily: "doc-broadcast",
    componentHint: "ArchiveLightTable",
    framing: "fullscreen-cutaway",
    motionAction: "dossier-slide-desk -> loupe-scan-row -> fade-out",
    typographyMode: "ledger-tabular-rollup",
    defaultSfx: "paper-slide",
    secondarySfx: "audit-row-lock",
    paceProfile: "calm-hold",
    register: "archival_parchment",
  },
  {
    id: "SupremeCourtSyllabusStage",
    styleWorld: "forensic-exhibits",
    styleFamily: "doc-broadcast",
    componentHint: "CaptionNewsCard",
    framing: "fullscreen-cutaway",
    motionAction: "paper-unfold -> ink-highlighter-double -> fade-out",
    typographyMode: "court-syllabus-italic",
    defaultSfx: "gavel-wood-hit",
    secondarySfx: "fountain-pen-slash",
    paceProfile: "calm-hold",
    register: "archival_parchment",
  },
  {
    id: "Sec10KFootnoteStretch",
    styleWorld: "forensic-exhibits",
    styleFamily: "doc-broadcast",
    componentHint: "TelestratorOverlay",
    framing: "split-screen",
    motionAction: "loupe-pop-focus -> footnote-zoom-callout -> fade-out",
    typographyMode: "footnote-loupe-zoom",
    defaultSfx: "glass-loupe-click",
    secondarySfx: "felt-highlighter",
    paceProfile: "calm-hold",
    register: "archival_parchment",
  },
  {
    id: "VetoPenBudgetLedger",
    styleWorld: "forensic-exhibits",
    styleFamily: "vintage-editorial",
    componentHint: "SilentFilmCard",
    framing: "fullscreen-cutaway",
    motionAction: "ledger-page-turn -> veto-ink-slash -> fade-out",
    typographyMode: "veto-fountain-strike",
    defaultSfx: "fountain-pen-slash",
    secondarySfx: "archival-stamp",
    paceProfile: "calm-hold",
    register: "archival_parchment",
  },
  {
    id: "ArchivalRationBook1941",
    styleWorld: "forensic-exhibits",
    styleFamily: "vintage-editorial",
    componentHint: "CollageCutout",
    framing: "fullscreen-cutaway",
    motionAction: "carbon-copy-peel -> microfilm-frame-step -> fade-out",
    typographyMode: "typewriter-1941-ribbon",
    defaultSfx: "paper-tear-crisp",
    secondarySfx: "archival-stamp",
    paceProfile: "calm-hold",
    register: "vintage_newsreel",
  },
  {
    id: "FoiaRedactionDeclassify",
    styleWorld: "forensic-exhibits",
    styleFamily: "vintage-editorial",
    componentHint: "SpyTitleSequence",
    framing: "fullscreen-cutaway",
    motionAction: "redaction-bar-reveal -> redact-bar-slide -> fade-out",
    typographyMode: "redacted-declassify",
    defaultSfx: "archival-stamp",
    secondarySfx: "typewriter-strike",
    paceProfile: "balanced",
    register: "archival_parchment",
  },

  // System Simulators (World 8)
  {
    id: "SupplyChainBomStrip",
    styleWorld: "system-simulators",
    styleFamily: "diagram-metaphor",
    componentHint: "IsometricScene",
    framing: "fullscreen-cutaway",
    motionAction: "blueprint-unroll-x -> gear-mesh-cw -> fade-blur-out",
    typographyMode: "blueprint-dimension-callout",
    defaultSfx: "pneumatic-servo",
    secondarySfx: "data-tick",
    paceProfile: "balanced",
    register: "drafting_blueprint",
  },
  {
    id: "PaloAltoWhiteboardFlip",
    styleWorld: "system-simulators",
    styleFamily: "diagram-metaphor",
    componentHint: "InstructionManualCard",
    framing: "fullscreen-cutaway",
    motionAction: "flip-y -> card-flip-180 -> fade-out",
    typographyMode: "antithesis-split-lock",
    defaultSfx: "anvil-iron-clank",
    secondarySfx: "marker-sweep",
    paceProfile: "snappy",
    register: "page_editorial",
  },
  {
    id: "DualTaxPlumbingSchematic",
    styleWorld: "system-simulators",
    styleFamily: "diagram-metaphor",
    componentHint: "IsometricScene",
    framing: "fullscreen-cutaway",
    motionAction: "guillotine-drop -> sankey-particle-stream -> fade-blur-out",
    typographyMode: "blueprint-dimension-callout",
    defaultSfx: "guillotine-slice",
    secondarySfx: "blueprint-unroll",
    paceProfile: "balanced",
    register: "drafting_blueprint",
  },
  {
    id: "SovereignPrioritySpillway",
    styleWorld: "system-simulators",
    styleFamily: "data-maps-3d",
    componentHint: "WhiteModel3D",
    framing: "fullscreen-cutaway",
    motionAction: "hydraulic-press-down -> hydraulic-pressure-tremor -> fade-blur-out",
    typographyMode: "debt-odometer-inline",
    defaultSfx: "hydraulic-press",
    secondarySfx: "vault-bolt-lock",
    paceProfile: "calm-hold",
    register: "drafting_blueprint",
  },
  {
    id: "TransformerQueueBottleneck",
    styleWorld: "system-simulators",
    styleFamily: "diagram-metaphor",
    componentHint: "StickFigureStage",
    framing: "fullscreen-cutaway",
    motionAction: "ratchet-step-in -> transformer-hum-60hz -> fade-out",
    typographyMode: "solari-split-flap",
    defaultSfx: "ratchet-winch-click",
    secondarySfx: "substation-60hz-buzz",
    paceProfile: "balanced",
    register: "drafting_blueprint",
  },

  // UI Satire & Household Balance-Sheet Collage (World 9)
  {
    id: "LongitudinalHouseholdDossier",
    styleWorld: "ui-satire-collage",
    styleFamily: "vintage-editorial",
    componentHint: "StainedGlassFrame",
    framing: "split-screen",
    motionAction: "dossier-slide-desk -> paycheck-erode-pulse -> fade-blur-out",
    typographyMode: "ledger-tabular-rollup",
    defaultSfx: "calculator-ribbon-print",
    secondarySfx: "nsf-decline-buzz",
    paceProfile: "calm-hold",
    register: "page_editorial",
  },
  {
    id: "ClosedComputeScripWallet",
    styleWorld: "ui-satire-collage",
    styleFamily: "diagram-metaphor",
    componentHint: "StickerCutout",
    framing: "talking-head-punch-in",
    motionAction: "turnstile-spin-in -> scrip-token-flicker -> pop-down",
    typographyMode: "statute-clause-box",
    defaultSfx: "coin-brass-clink",
    secondarySfx: "nsf-decline-buzz",
    paceProfile: "snappy",
    register: "over_footage",
  },
  {
    id: "ThermalReceiptInflationRoll",
    styleWorld: "ui-satire-collage",
    styleFamily: "vintage-editorial",
    componentHint: "CollageCutout",
    framing: "fullscreen-cutaway",
    motionAction: "receipt-feed-up -> escrow-mercury-climb -> fade-out",
    typographyMode: "margin-redline-gloss",
    defaultSfx: "calculator-ribbon-print",
    secondarySfx: "paper-tear-crisp",
    paceProfile: "snappy",
    register: "page_editorial",
  },
  {
    id: "FourEscapeHatchesBoard",
    styleWorld: "ui-satire-collage",
    styleFamily: "doc-broadcast",
    componentHint: "KinoMontageStrip",
    framing: "fullscreen-cutaway",
    motionAction: "solari-flap-cascade -> stamp-recoil-hold -> fade-out",
    typographyMode: "chapter-roman-folio",
    defaultSfx: "archival-stamp",
    secondarySfx: "solari-flap",
    paceProfile: "balanced",
    register: "page_editorial",
  },
  {
    id: "UnwrittenTruceToAllowance",
    styleWorld: "ui-satire-collage",
    styleFamily: "vintage-editorial",
    componentHint: "SilentFilmCard",
    framing: "fullscreen-cutaway",
    motionAction: "wax-seal-press -> veto-ink-slash -> fade-out",
    typographyMode: "silent-black-aphorism",
    defaultSfx: "fountain-pen-slash",
    secondarySfx: "resolve-chord-warm",
    paceProfile: "calm-hold",
    register: "page_editorial",
  },

  // Corridor Cartography & 3D Strata (World 7)
  {
    id: "data-transit-map",
    styleWorld: "data-maps-3d",
    styleFamily: "data-maps-3d",
    componentHint: "MapExplainer",
    framing: "fullscreen-cutaway",
    motionAction: "radar-sweep-reveal -> cable-packet-pulse -> fade-out",
    typographyMode: "blueprint-dimension-callout",
    defaultSfx: "map-whoosh",
    secondarySfx: "radar-sonar-ping",
    paceProfile: "calm-hold",
    register: "midnight_telemetry",
  },
  {
    id: "CorridorArcMatrixCard",
    styleWorld: "data-maps-3d",
    styleFamily: "data-maps-3d",
    componentHint: "MapExplainer",
    framing: "fullscreen-cutaway",
    motionAction: "sonar-ping-appear -> chokepoint-gate-clamp -> fade-out",
    typographyMode: "whisper-focus-spotlight",
    defaultSfx: "radar-sonar-ping",
    secondarySfx: "map-whoosh",
    paceProfile: "calm-hold",
    register: "midnight_telemetry",
  },
  {
    id: "IsometricStrataCutaway3D",
    styleWorld: "data-maps-3d",
    styleFamily: "data-maps-3d",
    componentHint: "WhiteModel3D",
    framing: "fullscreen-cutaway",
    motionAction: "isometric-rise -> parallax-hover -> fade-blur-out",
    typographyMode: "blueprint-dimension-callout",
    defaultSfx: "riser-subtle",
    secondarySfx: "odometer-tick",
    paceProfile: "calm-hold",
    register: "drafting_blueprint",
  },

  // Generative Physics & 3D Set-Pieces (World 10)
  {
    id: "setpiece-bom-vaporizer",
    styleWorld: "generative-setpiece",
    styleFamily: "diagram-metaphor",
    componentHint: "IsometricScene",
    framing: "fullscreen-cutaway",
    motionAction: "isometric-rise -> gear-mesh-cw -> fade-blur-out",
    typographyMode: "chisel-highlighter-sweep",
    defaultSfx: "hydraulic-press",
    secondarySfx: "felt-highlighter",
    paceProfile: "calm-hold",
    register: "page_editorial",
    setPieceId: "SP01_SHOE_LABOR_VAPORIZER",
  },
  {
    id: "setpiece-torque-balance",
    styleWorld: "generative-setpiece",
    styleFamily: "diagram-metaphor",
    componentHint: "InstructionManualCard",
    framing: "fullscreen-cutaway",
    motionAction: "scale-beam-drop -> balance-scale-oscillate -> fade-blur-out",
    typographyMode: "antithesis-split-lock",
    defaultSfx: "anvil-iron-clank",
    secondarySfx: "felt-highlighter",
    paceProfile: "balanced",
    register: "page_editorial",
    setPieceId: "SP02_PALO_ALTO_WHITEBOARD_FLIP",
  },
  {
    id: "setpiece-hydraulic-spillway",
    styleWorld: "generative-setpiece",
    styleFamily: "data-maps-3d",
    componentHint: "DataPhysicalCard",
    framing: "fullscreen-cutaway",
    motionAction: "hydraulic-press-down -> vault-drain-vortex -> fade-blur-out",
    typographyMode: "debt-odometer-inline",
    defaultSfx: "vault-bolt-lock",
    secondarySfx: "hydraulic-press",
    paceProfile: "calm-hold",
    register: "drafting_blueprint",
    setPieceId: "SP07_SOVEREIGN_BOND_SPILLWAY",
  },
  {
    id: "setpiece-wattage-scale-ladder",
    styleWorld: "generative-setpiece",
    styleFamily: "data-maps-3d",
    componentHint: "WhiteModel3D",
    framing: "fullscreen-cutaway",
    motionAction: "isometric-rise -> watt-meter-spin -> fade-blur-out",
    typographyMode: "blueprint-dimension-callout",
    defaultSfx: "substation-60hz-buzz",
    secondarySfx: "watt-meter-whir",
    paceProfile: "calm-hold",
    register: "drafting_blueprint",
    setPieceId: "SP11_10W_TO_5GW_POWER_LADDER",
  },
  {
    id: "setpiece-isometric-diorama-3d",
    styleWorld: "generative-setpiece",
    styleFamily: "doc-broadcast",
    componentHint: "CitySymphonyFrame",
    framing: "fullscreen-cutaway",
    motionAction: "isometric-rise -> parallax-hover -> fade-blur-out",
    typographyMode: "blueprint-dimension-callout",
    defaultSfx: "glass-expand",
    secondarySfx: "odometer-tick",
    paceProfile: "calm-hold",
    register: "page_editorial",
  }
);

const RECIPE_BY_ID: Record<string, StyleRecipe> = {};
for (let i = 0; i < STYLE_CATALOG.length; i++) {
  RECIPE_BY_ID[STYLE_CATALOG[i].id] = STYLE_CATALOG[i];
}

const CATEGORY_RECIPE_PRIORITIES: Record<BeatCategory, string[]> = {
  hook: [
    "doc-kino-montage",
    "liquid-glass-card",
    "DivergingJawsChart",
    "vintage-collage",
    "data-physical-card",
    "glass-stat-triptych",
  ],
  "thesis-promise": [
    "liquid-glass-dock",
    "FourEscapeHatchesBoard",
    "diagram-instruction-manual",
    "doc-news-package",
    "vintage-stained-glass",
    "data-white-model-3d",
  ],
  "receipt-proof": [
    "FiscalLedgerTableStage",
    "doc-archive-light-table",
    "data-physical-card",
    "doc-caption-news",
    "glass-dossier-stack",
    "Sec10KFootnoteStretch",
    "liquid-glass-card",
    "doc-telestrator",
    "doc-news-package",
  ],
  "metaphor-story": [
    "SupplyChainBomStrip",
    "diagram-isometric",
    "setpiece-bom-vaporizer",
    "data-white-model-3d",
    "diagram-stick-figure",
    "PaloAltoWhiteboardFlip",
    "liquid-glass-card",
    "doc-city-symphony",
  ],
  "good-work-punchline": [
    "diagram-sticker",
    "liquid-glass-toast",
    "ClosedComputeScripWallet",
    "vintage-collage",
    "glass-verdict-seal",
    "doc-telestrator",
  ],
  "history-archive": [
    "vintage-newsreel",
    "ArchivalRationBook1941",
    "DebtDeflationJaws1933",
    "doc-archive-light-table",
    "vintage-silent-film",
    "vintage-spy-titles",
    "SupremeCourtSyllabusStage",
  ],
  "map-geopolitics": [
    "data-map-explainer",
    "data-transit-map",
    "CorridorArcMatrixCard",
    "doc-city-symphony",
    "vintage-spy-titles",
    "liquid-glass-card",
  ],
  "warning-escalation": [
    "doc-visual-investigation",
    "AuctionPriceShockwave",
    "SovereignSpreadFlip",
    "SovereignPrioritySpillway",
    "data-blob-simulation",
    "doc-live-countdown-split",
    "liquid-glass-toast",
  ],
  "claire-ledger": [
    "LongitudinalHouseholdDossier",
    "diagram-stick-figure",
    "glass-compare-scale",
    "liquid-glass-card",
    "ThermalReceiptInflationRoll",
    "diagram-instruction-manual",
  ],
  "open-loop": [
    "liquid-glass-dock",
    "glass-telemetry-strip",
    "vintage-silent-film",
    "doc-news-package",
    "diagram-instruction-manual",
    "vintage-stained-glass",
  ],
  takeaway: [
    "UnwrittenTruceToAllowance",
    "VetoPenBudgetLedger",
    "liquid-glass-card",
    "vintage-silent-film",
    "doc-city-symphony",
  ],
};

function matchesAny(text: string, patterns: RegExp[]): boolean {
  for (let i = 0; i < patterns.length; i++) {
    if (patterns[i].test(text)) return true;
  }
  return false;
}

const JOKE_PATTERNS = [
  /\blandlord\b/i,
  /\bforwarding that\b/i,
  /\bsee how it goes\b/i,
  /\bwhiteboard in palo alto\b/i,
  /\bdon'?t care what the robots are doing\b/i,
  /\bvote for one on purpose\b/i,
  /\bsave .* in a jar\b/i,
  /\bempty seat on a flight\b/i,
  /\bbad paymasters\b/i,
  /\bthat'?s great,?\s*right\b/i,
  /\bair conditioning\b/i,
  /\bshell company\b/i,
  /\bfunny\b|\bjoking\b|\bsarcas/i,
];

const CLAIRE_PATTERNS = [
  /\bclaire\b/i,
  /\b\$?3,?400\b/i,
  /\bthirty-four hundred\b/i,
  /\bthirty-year loan\b/i,
  /\brefinance\b/i,
  /\bunderwater homeowners?\b/i,
  /\bcounty sheriff\b|\bsheriff\b/i,
  /\b2055\b/i,
  /\bmortgage\b/i,
];

const HISTORY_PATTERNS = [
  /\b(1912|1929|1930s?|1933|1938|1941|1947|1982|2009|2020)\b/i,
  /\birving fisher\b/i,
  /\bharry truman\b/i,
  /\bpaint creek\b/i,
  /\bisland creek\b/i,
  /\bfair labor standards\b/i,
  /\bcompany scrip\b|\bbrass tokens\b/i,
  /\bgerman submarines\b|\bministry of food\b|\brationing\b|\bsixteen points\b/i,
  /\bwielechowski\b/i,
  /\bcentury ago\b/i,
  /\brotterdam\b|\bdetroit\b/i,
];

const MAP_PATTERNS = [
  /\btexas\b|\btaxas\b|\baustin\b/i,
  /\balaska\b|\bjuneau\b/i,
  /\bireland\b|\bdublin\b/i,
  /\bwest london\b|\bm4 corridor\b|\blondon\b/i,
  /\bpjm\b|\bthirteen states\b|\billinois\b|\bnew jersey\b/i,
  /\bohio\b|\bwest virginia\b/i,
  /\bshenzhen\b|\bsuzhou\b|\bjapan\b|\btokyo\b|\btaiwan\b|\bhsinchu\b|\bred sea\b|\bfrance\b|\bgreece\b|\brotterdam\b/i,
  /\bthree mile island\b/i,
  /\bmap\b|\beastern grid\b|\bcorridor\b|\bstrait\b/i,
];

const PRIMARY_SOURCE_PATTERNS = [
  /\btable\s*9\b/i,
  /\bmonthly treasury statement\b/i,
  /\btreasury\b/i,
  /\bcongressional budget office\b|\bcbo\b/i,
  /\bforbes\b/i,
  /\biea\b|\binternational energy agency\b/i,
  /\bnextera\b/i,
  /\balphabet\b|\bamazon\b|\bmeta\b|\bmicrosoft\b|\boracle\b|\baws\b|\bopenai\b/i,
  /\bnvidia\b|\bjensen huang\b/i,
  /\blabor data\b|\bproduce per hour\b/i,
  /\bsupreme court\b/i,
  /\bthe economist\b/i,
  /\ball-in podcast\b/i,
  /\bposted\s+on\s+x\b/i,
];

const NUMERIC_RECEIPT_PATTERNS = [
  /\$[0-9]+(?:\.[0-9]+)?\s*(?:trillion|billion|million|thousand)?/i,
  /\b\d+(?:\.\d+)?\s*(?:percent|%|trillion|billion|gigawatts?|terawatt-hours?|megawatt-day|kilowatt)\b/i,
];

const WARNING_PATTERNS = [
  /\b2036\b/i,
  /\b2033\b|\b2034\b/i,
  /\bdebt deflation\b/i,
  /\bdefault\b/i,
  /\bchopping block\b/i,
  /\bprice crashes\b|\bcrashes right when\b/i,
  /\b833 percent\b/i,
  /\bten-year squeeze\b/i,
  /\bnegative free cash flow\b/i,
  /\bcut every check in half\b|\bcut her check in half\b|\bcuts her check in half\b/i,
  /\bwipes out\b|\bwiped out\b|\bthreat\b|\bcollapse\b/i,
  /\bcan'?t buy a single tin\b|\bvanished\b/i,
];

const OPEN_LOOP_PATTERNS = [
  /\bi'?ll show you why\b/i,
  /\bremember\b/i,
  /\bhang on to\b/i,
  /\bwhy does it break\b/i,
  /\bi know what you'?re thinking\b/i,
  /\bthere'?s a catch\b|\bhere'?s the catch\b/i,
  /\bjump ahead\b|\brun her through\b/i,
  /\bwho gets to decide\b|\bwhat happens to your money\b/i,
];

const THESIS_PATTERNS = [
  /\bthree escape hatches\b|\bescape hatch number\b/i,
  /\bbest argument\b|\bsteelman\b/i,
  /\bthe problem with it\b|\bthat'?s the whole problem\b/i,
  /\bunwritten agreement\b/i,
  /\bdoesn'?t survive\b/i,
  /\bdoes it differently\b|\bskip the government\b/i,
];

const METAPHOR_PATTERNS = [
  /\brunning shoes\b|\bdental x-ray\b/i,
  /\bphone charger\b|\bmicrowave\b/i,
  /\bairline miles\b|\bchecking account\b/i,
  /\bcopper wire\b|\btransformers\b|\bpower plants\b/i,
  /\boil well\b|\bdigital company town\b|\bauction\b/i,
  /\bnothing stops\b/i,
];

const TAKEAWAY_PATTERNS = [
  /\bit'?s an allowance\b|\bthat is an allowance\b/i,
  /\bpart people are missing\b/i,
  /\bnegotiate a check\b|\bcan'?t call it income\b/i,
  /\btell me in the comments\b|\bvideo'?s on screen\b/i,
  /\btwo hundred years\b/i,
];

/**
 * Extract primary source citation when present in spoken text.
 */
export function extractSourceCitation(text: string): string | undefined {
  if (/table\s*9|monthly\s+treasury\s+statement|84(?:\.1)?\s*percent|eighty-four\s*percent/i.test(text)) {
    return "U.S. Treasury — Monthly Treasury Statement, Table 9";
  }
  if (/congressional\s+budget\s+office|\bcbo\b|2\.1\s*trillion|bond\s+interest|1\.83\s*trillion/i.test(text)) {
    return "Congressional Budget Office (CBO) Budget & Interest Projections";
  }
  if (/40\.5\s*trillion|national\s+debt/i.test(text)) {
    return "U.S. Treasury — Fiscal Data (Debt to the Penny)";
  }
  if (/18\.8\s*trillion|household(?:s)?\s+owe/i.test(text)) {
    return "Federal Reserve Bank of New York — Household Debt & Credit";
  }
  if (/the\s+economist/i.test(text)) {
    return "The Economist (July 2026 Elon Musk Interview)";
  }
  if (/posted\s+on\s+x|october\s+29/i.test(text)) {
    return "X Public Statement (Oct 29, 2026)";
  }
  if (/1947|harry\s+truman|labor\s+data|produce\s+per\s+hour/i.test(text)) {
    return "U.S. Bureau of Labor Statistics (BLS) — Productivity & Labor Share";
  }
  if (/\baws\b|\bopenai\b|startup\s+\$[0-9]+|cloud\s+credits/i.test(text)) {
    return "AWS Activate & OpenAI Startup Compute Credit Terms";
  }
  if (/alphabet|amazon|meta|microsoft|oracle|free\s+cash\s+flow/i.test(text)) {
    return "SEC 10-K / Quarterly Filings (Alphabet, Amazon, Meta, Microsoft)";
  }
  if (/all-in\s+podcast|universal\s+basic\s+compute/i.test(text)) {
    return "All-In Podcast — Sam Altman (May 2024)";
  }
  if (/forbes|uber/i.test(text)) {
    return "Forbes — Uber Engineering AI Token Cap Report (2026)";
  }
  if (/nvidia|jensen\s+huang/i.test(text)) {
    return "Nvidia — Token Budget Guidance";
  }
  if (/international\s+energy\s+agency|\biea\b|415\s+terawatt|945/i.test(text)) {
    return "International Energy Agency (IEA) — Electricity 2024–2030";
  }
  if (/nextera/i.test(text)) {
    return "NextEra Energy — Hyperscale Load Guidance";
  }
  if (/ireland|21\s*percent|twenty-one\s+percent|metered\s+power/i.test(text)) {
    return "Central Statistics Office (CSO) Ireland — Metered Electricity";
  }
  if (/west\s+london|m4\s+corridor/i.test(text)) {
    return "Greater London Authority / UK M4 Substation Capacity Notice";
  }
  if (/\bpjm\b|269\.92|833\s*percent/i.test(text)) {
    return "PJM Interconnection — 2025/2026 Capacity Auction";
  }
  if (/three\s+mile\s+island/i.test(text)) {
    return "Constellation Energy / Microsoft 20-Year Nuclear PPA";
  }
  if (/alaska|permanent\s+fund|wielechowski|bill\s+walker|each\s+resident\s+was\s+owed|4\s+billion\s+hole/i.test(text)) {
    return "Alaska Permanent Fund / Wielechowski v. State (2016)";
  }
  if (/fair\s+labor\s+standards|paint\s+creek|island\s+creek|1938|1912/i.test(text)) {
    return "U.S. Fair Labor Standards Act (1938) / WV Scrip Archives";
  }
  if (/shenzhen|suzhou|digital\s+yuan/i.test(text)) {
    return "PBOC Digital Yuan (e-CNY) Pilot Records (2020)";
  }
  if (/ministry\s+of\s+food|1941|sixteen\s+points/i.test(text)) {
    return "UK Ministry of Food — Points Rationing Order (Dec 1941)";
  }
  if (/irving\s+fisher|debt\s+deflation/i.test(text)) {
    return "Irving Fisher — Debt-Deflation Theory (1933)";
  }
  if (/2009|underwater/i.test(text)) {
    return "Federal Reserve / CoreLogic Housing Equity Data (2009)";
  }
  if (/stimulus\s+payments/i.test(text)) {
    return "U.S. Treasury — 2020 CARES Act Disbursement Data";
  }
  if (/\btreasury\b|\bsupreme\s+court\b/i.test(text)) {
    return "U.S. Department of the Treasury / Federal Record";
  }
  if (matchesAny(text, NUMERIC_RECEIPT_PATTERNS)) {
    return "Primary Federal & Institutional Economic Record";
  }
  return undefined;
}

/**
 * Dynamically extracts a clean geographic query and resolved atlas metadata
 * without ever hardcoding Austin, Texas unless Texas/Austin/Claire is in the text.
 */
export function extractGeoQuery(text: string): {
  geoQuery?: string;
  corridorId?: string;
  region?: "us" | "world";
  highlightLabel?: string;
} {
  const clean = (text || "").trim();
  if (!clean) return {};
  if (!matchesAny(clean, MAP_PATTERNS)) return {};

  const resolved = resolveGeoQuery({
    query: clean,
    spokenText: clean,
  });

  if (resolved.matchedBy === "world-overview-fallback") {
    return {};
  }

  return {
    geoQuery: clean,
    corridorId: resolved.corridorId,
    region: resolved.atlasDataset === "usa" ? "us" : "world",
    highlightLabel: resolved.title,
  };
}

/**
 * Matches spoken text to one of the stateful multi-act Continuity Engine entities.
 */
export function detectContinuityEntity(text: string): string | undefined {
  if (/claire|3,400|austin|mortgage|sheriff|refinance/i.test(text)) {
    return "ENT_CLAIRE_AUSTIN";
  }
  if (/escape hatch|three escape hatches|four escape hatches/i.test(text)) {
    return "ENT_ESCAPE_HATCH_BOARD";
  }
  if (/40\.5 trillion|2\.1 trillion|table 9|84(?:\.1)?\s*percent|national debt/i.test(text)) {
    return "ENT_SOVEREIGN_DEBT_WALL";
  }
  if (/allowance|unwritten agreement|bill walker|veto|one signature/i.test(text)) {
    return "ENT_PAYCHECK_TO_ALLOWANCE";
  }
  return undefined;
}

function extractBeatMetrics(text: string): Array<{ raw: string; numeric: number; unit: string }> {
  const regex =
    /([$€£])?\s*(\d+(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)(?:\s*(%|percent\b|trillion\b|billion\b|million\b|thousand\b|gigawatts?\b|terawatt-hours?\b|megawatt-day\b))?/gi;
  const out: Array<{ raw: string; numeric: number; unit: string }> = [];
  let m: RegExpExecArray | null = regex.exec(text);
  while (m !== null) {
    const prefix = m[1] || "";
    const numStr = (m[2] || "").replace(/,/g, "");
    const numeric = Number(numStr);
    const unitRaw = (m[3] || "").toLowerCase();
    if (Number.isFinite(numeric)) {
      const isBareYear =
        !prefix && !unitRaw && Math.floor(numeric) === numeric && numeric >= 1900 && numeric <= 2099;
      if (!isBareYear && (prefix || unitRaw)) {
        let suffix = "";
        if (unitRaw === "%" || unitRaw === "percent") suffix = "%";
        else if (unitRaw === "trillion") suffix = "T";
        else if (unitRaw === "billion") suffix = "B";
        else if (unitRaw === "million") suffix = "M";
        else if (unitRaw === "thousand") suffix = "K";
        else if (unitRaw.indexOf("gigawatt") === 0) suffix = " GW";
        else if (unitRaw.indexOf("terawatt") === 0) suffix = " TWh";
        else if (unitRaw.indexOf("megawatt") === 0) suffix = "/MW-day";
        out.push({
          raw: prefix + m[2] + suffix,
          numeric,
          unit: suffix || prefix,
        });
      }
    }
    m = regex.exec(text);
  }
  return out;
}

export function extractStructuredBeatData(
  text: string,
  category: BeatCategory,
  sourceCitation?: string
): {
  tableRows?: DirectorTableRow[];
  seriesData?: DirectorSeriesPoint[];
  exhibitData?: DirectorExhibitData;
  data: DirectorBeatDataPayload;
} {
  const metrics = extractBeatMetrics(text);
  const primary = metrics[0];
  const secondary = metrics[1];

  const tableRows: DirectorTableRow[] | undefined =
    metrics.length > 0
      ? metrics.slice(0, 3).map((item, idx) => ({
          label: idx === 0 ? "Primary Figure" : idx === 1 ? "Counterpart" : "Reference",
          value: item.raw,
          isHighlight: idx === 0,
          isFlagged: category === "warning-escalation" && idx === 0,
        }))
      : undefined;

  const seriesData: DirectorSeriesPoint[] | undefined =
    primary && secondary
      ? [
          { xLabel: "Baseline", primary: primary.numeric, unit: primary.unit },
          {
            xLabel: "Comparison",
            primary: secondary.numeric,
            unit: secondary.unit,
            isThreshold: category === "warning-escalation",
          },
        ]
      : undefined;

  const exhibitData: DirectorExhibitData | undefined = sourceCitation
    ? {
        filingTitle: sourceCitation,
        highlightedClause: text.slice(0, 140),
        stampLabel: category === "warning-escalation" ? "RISK SIGNAL" : "VERIFIED",
      }
    : undefined;

  const data: DirectorBeatDataPayload = {
    ...(primary ? { primaryMetric: primary.raw } : {}),
    ...(secondary ? { secondaryMetric: secondary.raw } : {}),
    ...(tableRows ? { tableRows } : {}),
    ...(seriesData ? { seriesData } : {}),
    ...(exhibitData ? { exhibitData } : {}),
  };

  return { tableRows, seriesData, exhibitData, data };
}

export function classifyBeat(
  text: string,
  index: number,
  totalSegments: number
): BeatCategory {
  const trimmed = text.trim();
  const safeTotal = Math.max(1, totalSegments);
  const ratio = index / safeTotal;

  if (index === 0) return "hook";
  if (
    index === 1 &&
    safeTotal >= 12 &&
    !matchesAny(trimmed, JOKE_PATTERNS) &&
    !matchesAny(trimmed, THESIS_PATTERNS)
  ) {
    return "hook";
  }

  if (
    (index >= safeTotal - 2 || ratio >= 0.92) &&
    matchesAny(trimmed, TAKEAWAY_PATTERNS)
  ) {
    return "takeaway";
  }

  if (matchesAny(trimmed, JOKE_PATTERNS)) return "good-work-punchline";
  if (matchesAny(trimmed, CLAIRE_PATTERNS)) return "claire-ledger";

  const hasPrimarySource = matchesAny(trimmed, PRIMARY_SOURCE_PATTERNS);
  const hasNumericReceipt = matchesAny(trimmed, NUMERIC_RECEIPT_PATTERNS);
  const hasWarning = matchesAny(trimmed, WARNING_PATTERNS);
  const hasHistory = matchesAny(trimmed, HISTORY_PATTERNS);
  const hasMap = matchesAny(trimmed, MAP_PATTERNS);

  if (hasHistory && !hasMap) return "history-archive";
  if (hasMap && !hasHistory) return "map-geopolitics";
  if (hasHistory && hasMap) return "history-archive";

  if (hasPrimarySource && !/\b(2036|default|crashes|833 percent)\b/i.test(trimmed)) {
    return "receipt-proof";
  }
  if (hasWarning) return "warning-escalation";
  if (matchesAny(trimmed, METAPHOR_PATTERNS)) return "metaphor-story";
  if (hasNumericReceipt) return "receipt-proof";
  if (matchesAny(trimmed, THESIS_PATTERNS)) return "thesis-promise";
  if (matchesAny(trimmed, OPEN_LOOP_PATTERNS) || /\?\s*$/.test(trimmed)) {
    return "open-loop";
  }
  if (index === safeTotal - 1) return "takeaway";
  return "metaphor-story";
}

function isTalkingHeadFraming(framing: CameraFraming): boolean {
  return (
    framing === "talking-head-full" ||
    framing === "talking-head-punch-in" ||
    framing === "talking-head-with-glass"
  );
}

function selectGlassPreset(
  category: BeatCategory,
  basePreset: GlassPreset | undefined,
  text: string
): GlassPreset | undefined {
  if (!basePreset) return undefined;
  if (category === "claire-ledger" || /\bversus\b|\bagainst\b|\bon the one hand\b/i.test(text)) {
    return "split-modal";
  }
  if (category === "open-loop" || /\bremember\b|\bhatch\b/i.test(text)) {
    return "pill";
  }
  return basePreset;
}

function selectGlassRig(
  beatIndex: number,
  category: BeatCategory,
  baseRig: GlassPreset | undefined,
  vaultGlassWeights?: Readonly<Record<string, number>>
): GlassPreset {
  if (baseRig && baseRig !== "card" && baseRig !== "dock" && baseRig !== "toast") {
    return baseRig;
  }
  if (category === "receipt-proof") {
    const receiptRigs: GlassPreset[] = [
      "dossier-stack",
      "evidence-rail",
      "magnifier-card",
      "stat-triptych",
      "receipt-ticker",
      "quote-citation",
    ];
    return receiptRigs[beatIndex % receiptRigs.length];
  }
  if (category === "warning-escalation") {
    const warnRigs: GlassPreset[] = ["verdict-seal", "toast", "telemetry-strip", "terminal-console"];
    return warnRigs[beatIndex % warnRigs.length];
  }
  if (category === "claire-ledger") {
    return beatIndex % 2 === 0 ? "compare-scale" : "receipt-ticker";
  }
  if (category === "map-geopolitics") {
    return "map-callout";
  }

  let bestRig: GlassPreset = CANONICAL_GLASS_PRESET_IDS[
    beatIndex % CANONICAL_GLASS_PRESET_IDS.length
  ] as GlassPreset;
  if (vaultGlassWeights) {
    let bestWeight = -1;
    for (let k = 0; k < CANONICAL_GLASS_PRESET_IDS.length; k++) {
      const candidate = CANONICAL_GLASS_PRESET_IDS[
        (beatIndex + k) % CANONICAL_GLASS_PRESET_IDS.length
      ] as GlassPreset;
      const w = vaultGlassWeights[candidate] ?? 1.0;
      if (w > bestWeight) {
        bestWeight = w;
        bestRig = candidate;
      }
    }
  }
  return bestRig;
}

function selectTypographyMode(
  beatIndex: number,
  category: BeatCategory,
  wordCount: number,
  baseMode: string | undefined,
  isDepthBeat: boolean,
  vaultTypoWeights?: Readonly<Record<string, number>>
): string {
  if (isDepthBeat) return "behind-presenter-monolith";
  if (wordCount <= 5 && (category === "takeaway" || category === "warning-escalation")) {
    return "burstiness-staccato-cuts";
  }
  if (baseMode && beatIndex % 3 !== 2) {
    return baseMode;
  }
  const candidatePool = CANONICAL_TYPOGRAPHY_MODE_IDS;
  let picked: string = candidatePool[beatIndex % candidatePool.length];
  if (vaultTypoWeights) {
    let bestScore = -1;
    for (let k = 0; k < 5; k++) {
      const cand = candidatePool[(beatIndex * 5 + k) % candidatePool.length];
      const w = vaultTypoWeights[cand] ?? 1.0;
      if (w > bestScore) {
        bestScore = w;
        picked = cand;
      }
    }
  }
  return picked;
}

const VITERBI_CAMERA_ACTIONS: readonly string[] = [
  "dolly-creep",
  "static",
  "pan-ledger-right",
  "rack-focus-fg",
  "dolly-pullback",
  "pan-ledger-left",
  "rack-focus-bg",
  "dutch-disequilibrium",
];

const CONJUNCTION_STARTER_RE =
  /^(and|but|so|because|which|while|although|though|whereas|since|unless|until|when|where|before|after|if|or|yet|who|that)$/i;
const CLAUSE_PREP_VERB_RE =
  /^(is|are|was|were|will|would|could|should|can|has|have|had|come|comes|came|from|into|against|across|through|without|between|during|about|like|with)$/i;
const DETERMINER_PREP_RE =
  /^(the|a|an|this|that|these|those|your|our|their|its|of|to|in|on|at|for|by)$/i;
const TRAILING_FUNCTION_RE =
  /^(the|a|an|of|to|in|on|at|for|by|with|from|and|but|or|so|that|which|who|while|when|where|if|as|is|are|was|were|their|our|your|its|this|these|those)$/i;

function cleanAlphaToken(raw: string): string {
  return raw.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "");
}

function findNaturalWordSplitIndex(
  words: string[],
  minK: number,
  maxK: number,
  targetK: number
): number {
  const lo = Math.max(1, Math.min(minK, maxK));
  const hi = Math.min(words.length - 1, Math.max(lo, maxK));
  let bestK = Math.max(lo, Math.min(hi, targetK));
  let bestScore = -1e9;

  for (let k = lo; k <= hi; k++) {
    let score = -Math.abs(k - targetK) * 2;
    const prevRaw = words[k - 1];
    const prevClean = cleanAlphaToken(prevRaw);
    const nextClean = cleanAlphaToken(words[k]);

    if (/[,;:\u2014]$/.test(prevRaw)) {
      score += 100;
    } else if (CONJUNCTION_STARTER_RE.test(nextClean)) {
      score += 75;
    } else if (CLAUSE_PREP_VERB_RE.test(nextClean)) {
      score += 50;
    } else if (DETERMINER_PREP_RE.test(nextClean)) {
      score += 25;
    }

    if (TRAILING_FUNCTION_RE.test(prevClean)) {
      score -= 90;
    }

    if (score > bestScore) {
      bestScore = score;
      bestK = k;
    }
  }
  return bestK;
}

function splitWordsAtNaturalBoundaries(
  words: string[],
  maxWords: number,
  targetWords: number,
  minTailWords: number = 6
): string[][] {
  if (words.length <= maxWords) {
    return [words];
  }
  const chunks: string[][] = [];
  let remaining = words.slice();

  while (remaining.length > maxWords) {
    const safeTail = Math.min(minTailWords, Math.floor(remaining.length / 2));
    const kMax = Math.min(maxWords, remaining.length - safeTail);
    const kMin = Math.min(safeTail, kMax);
    const searchTarget =
      remaining.length - maxWords < safeTail
        ? Math.max(kMin, Math.floor(remaining.length / 2))
        : Math.min(kMax, Math.max(kMin, targetWords));
    const k = findNaturalWordSplitIndex(remaining, kMin, kMax, searchTarget);
    chunks.push(remaining.slice(0, k));
    remaining = remaining.slice(k);
  }
  if (remaining.length > 0) {
    chunks.push(remaining);
  }
  return chunks;
}

function appendBoundedSegment(
  out: TranscriptSegment[],
  seg: TranscriptSegment,
  maxDurSec: number = 12.5
): void {
  const dur = Math.max(0.5, seg.endSec - seg.startSec);
  const words = seg.text.trim().split(/\s+/).filter(Boolean);
  if (dur <= maxDurSec || words.length < 10) {
    out.push(seg);
    return;
  }

  const maxWords = Math.min(28, Math.max(8, Math.floor((11.5 / dur) * words.length)));
  const targetWords = Math.max(6, Math.round(maxWords * 0.8));
  const wordSlices = splitWordsAtNaturalBoundaries(words, maxWords, targetWords, 6);
  if (wordSlices.length <= 1) {
    out.push(seg);
    return;
  }

  let cursor = seg.startSec;
  for (let i = 0; i < wordSlices.length; i++) {
    const slice = wordSlices[i];
    const isLast = i === wordSlices.length - 1;
    const sliceEnd = isLast
      ? seg.endSec
      : Number((cursor + (slice.length / words.length) * dur).toFixed(2));
    out.push({
      ...seg,
      id: seg.id ? seg.id + "-" + String(i + 1) : undefined,
      text: slice.join(" "),
      startSec: Number(cursor.toFixed(2)),
      endSec: Math.max(Number((cursor + 0.5).toFixed(2)), sliceEnd),
    });
    cursor = sliceEnd;
  }
}

function normalizeAndBoundSegments(segments: TranscriptSegment[]): TranscriptSegment[] {
  if (segments.length === 0) return [];
  const bounded: TranscriptSegment[] = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const dur = Math.max(0.5, seg.endSec - seg.startSec);
    const words = seg.text.trim().split(/\s+/).filter(Boolean);

    if (i === 0 && dur > 4.0 && words.length >= 4) {
      const minK = Math.max(2, Math.floor((2.0 / dur) * words.length));
      const maxK = Math.min(words.length - 2, Math.floor((3.9 / dur) * words.length));
      const targetK = Math.max(2, Math.min(words.length - 2, Math.round((3.0 / dur) * words.length)));
      const splitK =
        maxK >= minK ? findNaturalWordSplitIndex(words, minK, maxK, targetK) : targetK;
      const part1Dur = Number(
        Math.min(3.95, Math.max(2.05, (splitK / words.length) * dur)).toFixed(2)
      );
      const splitTime = Number((seg.startSec + part1Dur).toFixed(2));
      bounded.push({
        ...seg,
        text: words.slice(0, splitK).join(" "),
        endSec: splitTime,
      });
      appendBoundedSegment(bounded, {
        ...seg,
        id: seg.id ? seg.id + "-2" : undefined,
        text: words.slice(splitK).join(" "),
        startSec: splitTime,
        endSec: seg.endSec,
      });
    } else {
      appendBoundedSegment(bounded, seg);
    }
  }
  return bounded;
}

export interface WhisperWordInputItem {
  word?: string;
  text?: string;
  startSec?: number;
  endSec?: number;
  start?: number;
  end?: number;
  startFrame?: number;
  endFrame?: number;
}

export interface WhisperDataInput {
  words?: WhisperWordInputItem[];
  segments?: Array<{
    text?: string;
    startSec?: number;
    endSec?: number;
    start?: number;
    end?: number;
  }>;
}

export function segmentWhisperWords(
  data: WhisperWordInputItem[] | WhisperDataInput
): TranscriptSegment[] {
  const rawWords: WhisperWordInputItem[] = Array.isArray(data)
    ? data
    : Array.isArray(data.words)
      ? data.words
      : [];

  if (rawWords.length === 0 && !Array.isArray(data) && Array.isArray(data.segments)) {
    return data.segments.map((s, idx) => ({
      id: "seg-" + String(idx + 1),
      text: String(s.text || "").trim(),
      startSec: Number(s.startSec ?? s.start ?? 0),
      endSec: Number(s.endSec ?? s.end ?? 3),
    }));
  }

  const normalized: Array<{ word: string; startSec: number; endSec: number }> = [];
  for (let i = 0; i < rawWords.length; i++) {
    const w = rawWords[i];
    const word = String(w.word ?? w.text ?? "").trim();
    if (!word) continue;
    const startSec = Number(w.startSec ?? w.start ?? (w.startFrame !== undefined ? w.startFrame / 30 : 0));
    const endSec = Number(
      w.endSec ?? w.end ?? (w.endFrame !== undefined ? w.endFrame / 30 : startSec + 0.3)
    );
    normalized.push({ word, startSec, endSec });
  }

  const segments: TranscriptSegment[] = [];
  let chunk: Array<{ word: string; startSec: number; endSec: number }> = [];

  const flushChunk = (): void => {
    if (chunk.length === 0) return;
    const startSec = chunk[0].startSec;
    const endSec = chunk[chunk.length - 1].endSec;
    const timedWords: TimedWord[] = chunk.map((cw) => ({
      word: cw.word,
      start: Math.max(0, Math.round((cw.startSec - startSec) * 30)),
      end: Math.max(1, Math.round((cw.endSec - startSec) * 30)),
      startSec: cw.startSec,
      endSec: cw.endSec,
    }));
    segments.push({
      text: chunk
        .map((w) => w.word)
        .join(" ")
        .replace(/\s+([.,!?;:])/g, "$1"),
      startSec,
      endSec,
      timedWords,
    });
    chunk = [];
  };

  for (let i = 0; i < normalized.length; i++) {
    const curr = normalized[i];
    chunk.push(curr);

    const dur = curr.endSec - chunk[0].startSec;
    const next = normalized[i + 1];
    const pauseGap = next ? next.startSec - curr.endSec : 1.0;
    const isSentenceEnd = /[.!?]["\u201d']?$/.test(curr.word);
    const isClauseEnd = /[,;:\u2014]$/.test(curr.word);
    const isFirstHookBeat = segments.length === 0;
    const inHook = curr.endSec <= 15;

    if (!next) {
      flushChunk();
      continue;
    }

    if (isFirstHookBeat) {
      const nextTok = cleanAlphaToken(next.word);
      const currTok = cleanAlphaToken(curr.word);
      const naturalClausePivot =
        !TRAILING_FUNCTION_RE.test(currTok) &&
        (CONJUNCTION_STARTER_RE.test(nextTok) || CLAUSE_PREP_VERB_RE.test(nextTok));

      if (isSentenceEnd && dur >= 2.0) flushChunk();
      else if (pauseGap >= 0.42 && dur >= 1.4) flushChunk();
      else if (isClauseEnd && dur >= 2.1) flushChunk();
      else if (dur >= 2.8 && naturalClausePivot) flushChunk();
      else if (dur >= 3.8) flushChunk();
    } else if (isSentenceEnd && dur >= (inHook ? 2.2 : 2.6)) {
      flushChunk();
    } else if (pauseGap >= 0.42 && dur >= 3.0) {
      flushChunk();
    } else if (pauseGap >= 0.8 && dur >= 1.8) {
      flushChunk();
    } else if (isClauseEnd && dur >= (inHook ? 3.5 : 5.4)) {
      flushChunk();
    } else if (dur >= 9.6 && (isClauseEnd || pauseGap >= 0.18)) {
      flushChunk();
    } else if (dur >= 11.2) {
      flushChunk();
    }
  }

  return segments;
}

export function segmentScriptText(rawText: string, wpm: number = 150): TranscriptSegment[] {
  const wordsPerSec = Math.max(80, wpm) / 60;
  const maxHookFirstWords = Math.min(9, Math.max(4, Math.floor((3.85 - 0.25) * wordsPerSec)));
  const targetHookWords = Math.min(maxHookFirstWords, Math.max(5, Math.round(3.0 * wordsPerSec)));
  const maxBodyWords = Math.min(28, Math.max(12, Math.floor((11.6 - 0.25) * wordsPerSec)));
  const targetBodyWords = Math.min(maxBodyWords - 3, Math.max(10, Math.round(8.5 * wordsPerSec)));

  const cleaned = rawText
    .replace(/\r\n/g, "\n")
    .replace(/^#{1,6}\s+.*$/gm, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[*_`~]/g, "");

  const paragraphs = cleaned
    .split(/\n\s*\n+/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  interface RawClause {
    text: string;
    wordCount: number;
    paraEnd: boolean;
    dramaticShort: boolean;
    paragraphIndex: number;
  }

  const rawClauses: RawClause[] = [];

  const pushBoundedSentence = (
    sentenceText: string,
    isParaEnd: boolean,
    pIdx: number,
    isHookOrJoke: boolean,
    isShortDramatic: boolean
  ): void => {
    const words = sentenceText.split(/\s+/).filter(Boolean);
    if (words.length === 0) return;

    const maxSentenceWords = isHookOrJoke ? Math.min(maxBodyWords, 13) : Math.min(maxBodyWords, 24);
    if (words.length <= maxSentenceWords) {
      rawClauses.push({
        text: sentenceText,
        wordCount: words.length,
        paraEnd: isParaEnd,
        dramaticShort: isShortDramatic,
        paragraphIndex: pIdx,
      });
      return;
    }

    const subSlices = splitWordsAtNaturalBoundaries(
      words,
      isHookOrJoke ? Math.min(maxBodyWords, 13) : maxBodyWords,
      isHookOrJoke ? Math.min(10, targetBodyWords) : targetBodyWords,
      isHookOrJoke ? 5 : 6
    );
    for (let c = 0; c < subSlices.length; c++) {
      rawClauses.push({
        text: subSlices[c].join(" "),
        wordCount: subSlices[c].length,
        paraEnd: isParaEnd && c === subSlices.length - 1,
        dramaticShort: false,
        paragraphIndex: pIdx,
      });
    }
  };

  for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
    const para = paragraphs[pIdx];
    const protectedText = para
      .replace(/(\d)\.(\d)/g, "$1<DOT>$2")
      .replace(/\b(v|Mr|Mrs|Ms|Dr|St|U\.S)\./g, "$1<DOT>");

    const sentences = protectedText
      .split(/(?<=[.!?]["\u201d']?)\s+/)
      .map((s) => s.replace(/<DOT>/g, ".").trim())
      .filter(Boolean);

    for (let sIdx = 0; sIdx < sentences.length; sIdx++) {
      const sentence = sentences[sIdx];
      const words = sentence.split(/\s+/).filter(Boolean);
      const isShortDramatic =
        words.length <= 5 &&
        (/allowance|nothing stops|it's|that is/i.test(sentence) || sentences.length === 1);
      const isHookOrJoke = pIdx === 0 || matchesAny(sentence, JOKE_PATTERNS);
      const isParaEnd = sIdx === sentences.length - 1;

      if (rawClauses.length === 0 && words.length > maxHookFirstWords) {
        const minHookK = Math.min(5, Math.floor(words.length / 2));
        const safeTail = Math.min(4, Math.floor(words.length / 2));
        const maxHookK = Math.max(minHookK, Math.min(maxHookFirstWords, words.length - safeTail));
        const hookK = findNaturalWordSplitIndex(words, minHookK, maxHookK, targetHookWords);
        rawClauses.push({
          text: words.slice(0, hookK).join(" "),
          wordCount: hookK,
          paraEnd: false,
          dramaticShort: false,
          paragraphIndex: pIdx,
        });
        pushBoundedSentence(words.slice(hookK).join(" "), isParaEnd, pIdx, isHookOrJoke, false);
      } else {
        pushBoundedSentence(sentence, isParaEnd, pIdx, isHookOrJoke, isShortDramatic);
      }
    }
  }

  const merged: RawClause[] = [];
  for (let i = 0; i < rawClauses.length; i++) {
    const curr = rawClauses[i];
    const prev = merged.length > 0 ? merged[merged.length - 1] : null;
    const maxMergedWords = merged.length === 1 ? maxHookFirstWords : Math.min(26, maxBodyWords);
    if (
      prev &&
      curr.wordCount < 6 &&
      !curr.dramaticShort &&
      prev.paragraphIndex === curr.paragraphIndex &&
      !prev.paraEnd &&
      prev.wordCount + curr.wordCount <= maxMergedWords
    ) {
      prev.text = prev.text + " " + curr.text;
      prev.wordCount += curr.wordCount;
      prev.paraEnd = curr.paraEnd;
    } else {
      merged.push({ ...curr });
    }
  }

  const segments: TranscriptSegment[] = [];
  let cursorSec = 0;
  for (let i = 0; i < merged.length; i++) {
    const item = merged[i];
    const baseDur = item.wordCount / wordsPerSec;
    const pausePad = item.paraEnd ? 0.25 : 0.08;
    const minDur = item.dramaticShort ? 1.8 : i === 0 ? 2.1 : item.paragraphIndex === 0 ? 2.5 : 2.3;
    const durationSec = Math.max(minDur, Number((baseDur + pausePad).toFixed(2)));
    segments.push({
      text: item.text,
      startSec: Number(cursorSec.toFixed(2)),
      endSec: Number((cursorSec + durationSec).toFixed(2)),
      paragraphIndex: item.paragraphIndex,
    });
    cursorSec += durationSec;
  }

  return segments;
}

function buildCutReason(
  category: BeatCategory,
  recipe: StyleRecipe,
  framing: CameraFraming,
  durationSec: number,
  isHeroPeak: boolean,
  isPrePeakQuiet: boolean,
  sourceCitation?: string,
  setPieceTitle?: string
): string {
  const durLabel = durationSec.toFixed(1) + "s";
  if (setPieceTitle) {
    return "Signature Set-Piece [" + setPieceTitle + "] via " + recipe.id + " (" + durLabel + ")";
  }
  if (isHeroPeak) {
    return (
      "Hero peak (60-75% zone): #a3402e brick-red focal " +
      recipe.componentHint +
      " + warning-thud on systemic chokepoint (" +
      durLabel +
      ")"
    );
  }
  if (isPrePeakQuiet && framing === "talking-head-full") {
    return (
      "Quiet-before-reveal room breath (talking-head-full, " +
      durLabel +
      "): drop music bed before peak spike"
    );
  }
  if (framing === "talking-head-full") {
    return (
      "Quiet room breath (talking-head-full, " +
      durLabel +
      ") — Money & Macro anchor without overlay"
    );
  }
  if (isPrePeakQuiet) {
    return (
      "Quiet-before-reveal breath: drop music bed before peak spike (" +
      durLabel +
      ", " +
      recipe.componentHint +
      ")"
    );
  }
  switch (category) {
    case "hook":
      return "0-15s claim-vs-receipt collision in " + recipe.id + " (" + durLabel + ")";
    case "good-work-punchline":
      return "Dry-wit punchline: snappy " + durLabel + " " + framing + " + " + recipe.id;
    case "receipt-proof":
      return (
        "Calm documentary hold (" +
        durLabel +
        ") for primary receipt" +
        (sourceCitation ? " [" + sourceCitation + "]" : "")
      );
    case "history-archive":
      return "Period-anchored archival cutaway (" + durLabel + ") via " + recipe.id;
    case "map-geopolitics":
      return "Spatial grid/region zoom (" + durLabel + ") via " + recipe.id;
    case "claire-ledger":
      return "Human-scale household ledger check (" + durLabel + ") via " + recipe.id;
    case "warning-escalation":
      return "Escalating structural tension (" + durLabel + ") via " + recipe.id;
    case "open-loop":
      return "Retention open-loop plant (" + durLabel + ") on " + recipe.id;
    case "thesis-promise":
      return "Structural roadmap framing (" + durLabel + ") via " + recipe.id;
    case "takeaway":
      return "Grounded Money & Macro room takeaway (" + durLabel + ") via " + recipe.id;
    default:
      return "Tangible metaphor illustration (" + durLabel + ") via " + recipe.id;
  }
}

function resolveStrategyId(raw?: string): StrategyPresetId {
  if (raw) {
    const parsed = StrategyPresetIdSchema.safeParse(raw);
    if (parsed.success) return parsed.data;
  }
  return "STR-GEN-EXPLAINER";
}

export function buildDraftDirectorPlan(
  rawSegments: TranscriptSegment[],
  options: DirectorOptions = {}
): DirectorPlan {
  const fps = options.fps && options.fps > 0 ? Math.round(options.fps) : 30;
  const title = options.title || "The Reading Room — Audience Director Plan";
  const strategyId = resolveStrategyId(options.strategyId);
  const strategyPreset = STRATEGY_PRESETS[strategyId];
  const targetTalkingHeadShare =
    options.targetTalkingHeadShare ?? strategyPreset.presenterARollTarget.targetShare ?? 0.35;
  const heroStartPct = options.heroStartPct ?? 0.6;
  const heroEndPct = options.heroEndPct ?? 0.75;
  const enableDepthSandwich = options.enableDepthSandwich !== false;
  const episodeNumber = options.episodeNumber ?? 1;
  const lutId = options.lutId || "editorial-warm";
  const musicStemId = options.musicStemId || "02-ledger-investigation";

  const segments = normalizeAndBoundSegments(rawSegments);

  if (segments.length === 0) {
    return validateDirectorPlan({
      title,
      fps,
      totalFrames: 0,
      beats: [],
      strategyId,
      episodeNumber,
      lutId,
      musicStemId,
      audit: {
        avgShotDurationSec: 0,
        styleDiversityScore: 0,
        repetitionWarnings: ["No transcript segments provided."],
        heroPeakPercent: 0,
        talkingHeadSharePercent: 0,
      },
    });
  }

  const continuityEngine = createEpisode01ContinuityEngine();
  const totalSec = Math.max(
    0.5,
    segments[segments.length - 1].endSec - segments[0].startSec
  );
  const firstStartSec = segments[0].startSec;

  const categories: BeatCategory[] = [];
  const citations: Array<string | undefined> = [];
  let activeParaIndex: number | undefined = undefined;
  let activeParaCitation: string | undefined = undefined;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const cat = classifyBeat(seg.text, i, segments.length);
    categories.push(cat);
    const directCitation = seg.sourceCitation || extractSourceCitation(seg.text);
    if (seg.paragraphIndex !== undefined && seg.paragraphIndex !== activeParaIndex) {
      activeParaIndex = seg.paragraphIndex;
      activeParaCitation = directCitation;
    } else if (directCitation) {
      activeParaCitation = directCitation;
    }
    const inheritedCitation =
      directCitation ||
      (seg.paragraphIndex !== undefined &&
      seg.paragraphIndex === activeParaIndex &&
      cat === "receipt-proof"
        ? activeParaCitation
        : cat === "receipt-proof"
          ? "Primary Federal & Institutional Economic Record"
          : undefined);
    citations.push(inheritedCitation);
  }

  let heroPeakIdx = -1;
  let bestHeroScore = -1;
  for (let i = 0; i < segments.length; i++) {
    const midRatio =
      ((segments[i].startSec + segments[i].endSec) * 0.5 - firstStartSec) / totalSec;
    if (midRatio >= heroStartPct && midRatio <= heroEndPct) {
      let score = 1;
      if (categories[i] === "warning-escalation") score += 4;
      if (categories[i] === "map-geopolitics") score += 2;
      if (categories[i] === "receipt-proof") score += 2;
      if (/833|auction|frozen|269\.92|nuclear|crashes|2036/i.test(segments[i].text)) {
        score += 3;
      }
      const distPenalty = Math.abs(midRatio - 0.675) * 2;
      const finalScore = score - distPenalty;
      if (finalScore > bestHeroScore) {
        bestHeroScore = finalScore;
        heroPeakIdx = i;
      }
    }
  }
  if (heroPeakIdx === -1 && segments.length >= 2) {
    heroPeakIdx = Math.min(
      segments.length - 1,
      Math.max(1, Math.round((segments.length - 1) * 0.675))
    );
  }
  const prePeakQuietIdx = heroPeakIdx > 0 ? heroPeakIdx - 1 : -1;

  const beats: DirectorBeat[] = [];
  const lastUsedBeatByComponent: Record<string, number> = {};
  const lastUsedBeatByFamily: Record<string, number> = {};
  const usageCountByComponent: Record<string, number> = {};
  const usageCountByRecipe: Record<string, number> = {};
  const usageCountByWorld: Record<string, number> = {};
  const usedSetPieces: Record<string, boolean> = {};

  let talkingHeadSecAccum = 0;
  let fullThBeatsCount = 0;
  let overlayThBeatsCount = 0;
  let lastFullThBeatIdx = -999;
  let totalSecAccum = 0;
  let consecutiveTalkingHeadSec = 0;
  let consecutiveCutawaySec = 0;
  let lastWarningThudSec = -999;
  let prevCamA = "";
  let prevCamB = "";

  const targetFullThRatio = 0.16;
  const targetOverlayThRatio = 0.185;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const category = categories[i];
    const sourceCitation = citations[i];
    const segStartRel = Math.max(0, seg.startSec - firstStartSec);
    const segEndRel = Math.max(segStartRel + 0.5, seg.endSec - firstStartSec);
    const startFrame = Math.round(segStartRel * fps);
    const endFrame = Math.max(startFrame + 15, Math.round(segEndRel * fps));
    const beatFrames = Math.max(15, endFrame - startFrame);
    const durationSec = Number((beatFrames / fps).toFixed(2));
    const midSec = (segStartRel + segEndRel) * 0.5;
    const timelineFrac = Math.max(0, Math.min(1, midSec / totalSec));
    const isHeroPeak = i === heroPeakIdx;
    const isPrePeakQuiet = i === prePeakQuietIdx;
    const wordList = seg.text.trim().split(/\s+/).filter(Boolean);

    const hasPerishability =
      /shenzhen|digital yuan|spoils on the clock|empty seat|plane pushes back/i.test(seg.text);
    const allowedCatalog = filterRecipesByStrategyGuardrails(STYLE_CATALOG, strategyId, [], {
      hasVerifiedPerishabilityMechanism: hasPerishability,
      hasShowablePrimaryArtifact: Boolean(sourceCitation),
    });
    const activePool = allowedCatalog.length > 0 ? allowedCatalog : STYLE_CATALOG;

    let matchedSetPiece: SignatureSetPieceRule | undefined = undefined;
    for (let sIdx = 0; sIdx < SIGNATURE_SET_PIECES.length; sIdx++) {
      const sp = SIGNATURE_SET_PIECES[sIdx];
      if (!usedSetPieces[sp.id] && sp.pattern.test(seg.text)) {
        matchedSetPiece = sp;
        break;
      }
    }

    const prevFamily: StyleEngineFamily | null =
      beats.length > 0 ? beats[beats.length - 1].styleFamily : null;
    const prevFraming: CameraFraming | null =
      beats.length > 0 ? beats[beats.length - 1].framing : null;
    const currentThShare =
      totalSecAccum > 0 ? talkingHeadSecAccum / totalSecAccum : targetTalkingHeadShare;
    const currentFullThBeatRatio = i > 0 ? fullThBeatsCount / i : 0;
    const currentOverlayThBeatRatio = i > 0 ? overlayThBeatsCount / i : 0;
    const needTalkingHead =
      currentThShare < targetTalkingHeadShare - 0.015 || consecutiveCutawaySec >= 13;
    const needCutaway =
      currentThShare > targetTalkingHeadShare + 0.04 || consecutiveTalkingHeadSec >= 13;
    const hasNumericReceipt = matchesAny(seg.text, NUMERIC_RECEIPT_PATTERNS);
    const isCalmConnective =
      i >= 2 &&
      !isHeroPeak &&
      !matchedSetPiece &&
      !sourceCitation &&
      !hasNumericReceipt &&
      durationSec <= 9.5 &&
      (isPrePeakQuiet ||
        category === "thesis-promise" ||
        category === "open-loop" ||
        category === "metaphor-story" ||
        category === "takeaway");
    const wantFullThBreath =
      isCalmConnective &&
      prevFraming !== "talking-head-full" &&
      i - lastFullThBeatIdx >= 4 &&
      currentFullThBeatRatio < targetFullThRatio &&
      currentThShare < Math.min(0.38, targetTalkingHeadShare + 0.025) &&
      (isPrePeakQuiet || needTalkingHead || currentFullThBeatRatio < 0.145);

    const priorityIds = CATEGORY_RECIPE_PRIORITIES[category] || [];
    const candidateRecipes: StyleRecipe[] = [];
    const seenIds: Record<string, boolean> = {};

    for (let p = 0; p < priorityIds.length; p++) {
      const rec = RECIPE_BY_ID[priorityIds[p]];
      if (rec && !seenIds[rec.id] && activePool.indexOf(rec) !== -1) {
        candidateRecipes.push(rec);
        seenIds[rec.id] = true;
      }
    }
    for (let c = 0; c < activePool.length; c++) {
      const rec = activePool[c];
      if (!seenIds[rec.id]) {
        candidateRecipes.push(rec);
        seenIds[rec.id] = true;
      }
    }

    let chosen: StyleRecipe = candidateRecipes[0] || STYLE_CATALOG[0];
    if (isHeroPeak) {
      const investigation = RECIPE_BY_ID["doc-visual-investigation"];
      if (investigation && prevFamily !== investigation.styleFamily) {
        chosen = investigation;
      } else {
        chosen = RECIPE_BY_ID["data-blob-simulation"] || chosen;
      }
    } else {
      // Pass 1 enforces strict >= 6-beat componentHint cooldown; Pass 2 relaxes only if short clip
      for (let pass = 0; pass < 2; pass++) {
        let bestScore = -1e9;
        let foundInPass = false;
        for (let k = 0; k < candidateRecipes.length; k++) {
          const rec = candidateRecipes[k];
          if (prevFamily && rec.styleFamily === prevFamily) continue;
          if (rec.peakOnly && !isHeroPeak) continue;
          if (isPrePeakQuiet && rec.styleFamily === "doc-broadcast") continue;

          const lastCompIdx = lastUsedBeatByComponent[rec.componentHint];
          if (pass === 0 && lastCompIdx !== undefined && i - lastCompIdx < 6) {
            continue;
          }

          let score = 0;
          const priorityIdx = priorityIds.indexOf(rec.id);
          score += priorityIdx !== -1 ? 50 - priorityIdx * 6 : 6;

          if (matchedSetPiece && rec.componentHint === matchedSetPiece.componentHint) {
            score += 36;
          }

          const compUsed = usageCountByComponent[rec.componentHint] || 0;
          score += compUsed === 0 ? 28 : -compUsed * 5;

          const recUsed = usageCountByRecipe[rec.id] || 0;
          score += recUsed === 0 ? 16 : -recUsed * 8;

          const worldKey = rec.styleWorld || rec.styleFamily;
          const worldUsed = usageCountByWorld[worldKey] || 0;
          score += worldUsed === 0 ? 18 : -worldUsed * 2;

          if (options.vaultStyleWeights && options.vaultStyleWeights[rec.id] !== undefined) {
            score += (options.vaultStyleWeights[rec.id] - 0.5) * 20;
          }

          if (lastCompIdx !== undefined && i - lastCompIdx < 6) {
            score -= (6 - (i - lastCompIdx)) * 45 + 20;
          }
          const lastFamIdx = lastUsedBeatByFamily[rec.styleFamily];
          if (lastFamIdx !== undefined) {
            score += Math.min(10, (i - lastFamIdx) * 2);
          }

          const recIsTH = isTalkingHeadFraming(rec.framing);
          if (wantFullThBreath) {
            if (compUsed >= 1) score += 14;
          } else {
            if (needTalkingHead && recIsTH && currentOverlayThBeatRatio < targetOverlayThRatio) {
              score += 32;
            }
            if (needTalkingHead && !recIsTH) score -= 14;
            if (needCutaway && !recIsTH) score += 32;
            if (needCutaway && recIsTH) score -= 24;
            if (
              rec.styleFamily === "liquid-glass" &&
              needTalkingHead &&
              currentOverlayThBeatRatio < targetOverlayThRatio
            ) {
              score += 8;
            }
          }

          if (score > bestScore) {
            bestScore = score;
            chosen = rec;
            foundInPass = true;
          }
        }
        if (foundInPass) break;
      }
    }

    let framing: CameraFraming = chosen.framing;
    const chosenAlreadyRendered = (usageCountByComponent[chosen.componentHint] || 0) >= 1;
    if (wantFullThBreath && (chosenAlreadyRendered || segments.length <= 24)) {
      framing = "talking-head-full";
    } else if (
      needTalkingHead &&
      !isTalkingHeadFraming(framing) &&
      currentOverlayThBeatRatio < targetOverlayThRatio &&
      (chosen.componentHint === "StickerCutout" ||
        chosen.componentHint === "NewsPackageLowerThird" ||
        chosen.componentHint === "TelestratorOverlay")
    ) {
      framing =
        category === "good-work-punchline" ? "talking-head-punch-in" : "talking-head-with-glass";
    } else if (i === segments.length - 1 && category === "takeaway") {
      if (isCalmConnective && prevFraming !== "talking-head-full" && currentFullThBeatRatio < 0.18) {
        framing = "talking-head-full";
      } else if (chosen.styleFamily === "liquid-glass") {
        framing = "talking-head-with-glass";
      }
    }

    const isFullTalkingHead = framing === "talking-head-full";
    const glassPreset = isFullTalkingHead
      ? undefined
      : selectGlassPreset(category, chosen.glassPreset, seg.text);
    const glassRig =
      !isFullTalkingHead && isTalkingHeadFraming(framing)
        ? selectGlassRig(i, category, chosen.glassRig, options.vaultGlassWeights)
        : undefined;

    const paletteMode: PaletteMode =
      framing === "fullscreen-cutaway" ||
      chosen.componentHint === "StainedGlassFrame" ||
      chosen.componentHint === "LiveCountdownSplit"
        ? "page"
        : "over-footage";

    const structured = extractStructuredBeatData(seg.text, category, sourceCitation);
    const isDepthBeat =
      enableDepthSandwich &&
      !isFullTalkingHead &&
      paletteMode === "over-footage" &&
      Boolean(structured.data.primaryMetric) &&
      (Boolean(chosen.depthSandwichEligible) || i % 7 === 3);

    const depthSandwich: DepthSandwichSpec | undefined = isDepthBeat
      ? {
          enabled: true,
          preset:
            category === "warning-escalation"
              ? "spotlight-dim-sandwich"
              : "behind-shoulder-billboard",
          heroFigure: structured.data.primaryMetric,
          foregroundGlass: Boolean(glassPreset || glassRig),
        }
      : undefined;

    const typographyMode = selectTypographyMode(
      i,
      category,
      wordList.length,
      matchedSetPiece ? matchedSetPiece.typographyMode : chosen.typographyMode,
      isDepthBeat,
      options.vaultTypographyWeights
    );

    const geoInfo = extractGeoQuery(seg.text);
    const continuityEntityId = detectContinuityEntity(seg.text);
    if (continuityEntityId) {
      const evaluated = continuityEngine.evaluateAtFrac(continuityEntityId, timelineFrac);
      structured.data.continuityStage = evaluated.activeStage.stageId;
    }

    const activeSetPiece =
      !isFullTalkingHead && paletteMode === "page" && matchedSetPiece ? matchedSetPiece : undefined;
    if (activeSetPiece) {
      usedSetPieces[activeSetPiece.id] = true;
    }
    const setPieceId = activeSetPiece ? activeSetPiece.id : chosen.setPieceId;
    const propIds = activeSetPiece ? activeSetPiece.propIds : undefined;

    let cameraAction =
      wordList.length <= 5 ? "verdict-slam" : VITERBI_CAMERA_ACTIONS[i % VITERBI_CAMERA_ACTIONS.length];
    if (cameraAction === prevCamA && cameraAction === prevCamB) {
      cameraAction = VITERBI_CAMERA_ACTIONS[(i + 1) % VITERBI_CAMERA_ACTIONS.length];
    }
    prevCamB = prevCamA;
    prevCamA = cameraAction;

    const register: CinemaRegister =
      paletteMode === "over-footage"
        ? "over_footage"
        : activeSetPiece
          ? activeSetPiece.register
          : chosen.register || "page_editorial";

    let musicEnergy: MusicEnergy = "calm";
    if (isPrePeakQuiet) musicEnergy = "drop-silence";
    else if (isHeroPeak) musicEnergy = "tense";
    else if (category === "hook" || category === "good-work-punchline") musicEnergy = "pulse";
    else if (category === "warning-escalation") {
      musicEnergy = timelineFrac >= 0.55 ? "tense" : "pulse";
    } else if (category === "takeaway") {
      musicEnergy = "drop-silence";
    }

    const sfxCues: DirectorSfxCue[] = [];
    if (!isFullTalkingHead) {
      const primaryCue =
        isHeroPeak && chosen.secondarySfx === "warning-thud"
          ? "flash-cut"
          : activeSetPiece
            ? activeSetPiece.sfxPrimary
            : chosen.defaultSfx;

      sfxCues.push({
        cue: primaryCue,
        offsetFrame: 0,
        volume: category === "good-work-punchline" ? 0.72 : 0.62,
      });

      if (isHeroPeak && midSec - lastWarningThudSec >= 20) {
        sfxCues.push({
          cue: "warning-thud",
          offsetFrame: Math.min(8, Math.max(2, Math.floor(beatFrames / 4))),
          volume: 0.88,
        });
        lastWarningThudSec = midSec;
      } else {
        const secCue = activeSetPiece ? activeSetPiece.sfxSecondary : chosen.secondarySfx;
        if (secCue && secCue !== "warning-thud" && beatFrames >= 45) {
          sfxCues.push({
            cue: secCue,
            offsetFrame: Math.floor(beatFrames * 0.45),
            volume: 0.52,
          });
        }
      }
    }

    const rawWhisperWords: ReadonlyArray<AnyTimedWord> | undefined = seg.timedWords;
    const timedWords: TimedWord[] =
      rawWhisperWords && rawWhisperWords.length > 0
        ? connectWhisperWordsToBeat(rawWhisperWords, 0, beatFrames, {
            fps,
            rebaseToLocal: false,
          })
        : synthesizeTimedWords(seg.text.trim(), beatFrames, fps);

    const beatNumber = i + 1;
    const beatId =
      "beat-" +
      (beatNumber < 10
        ? "00" + String(beatNumber)
        : beatNumber < 100
          ? "0" + String(beatNumber)
          : String(beatNumber));

    beats.push({
      id: beatId,
      startFrame,
      endFrame,
      durationSec,
      category,
      spokenText: seg.text.trim(),
      framing,
      paletteMode,
      styleFamily: chosen.styleFamily,
      recipeId: chosen.id,
      styleWorld: activeSetPiece ? activeSetPiece.styleWorld : chosen.styleWorld,
      register,
      componentHint: chosen.componentHint,
      motionAction: chosen.motionAction,
      ...(glassPreset ? { glassPreset } : {}),
      ...(glassRig ? { glassRig } : {}),
      ...(typographyMode ? { typographyMode } : {}),
      ...(depthSandwich ? { depthSandwich, layering: "behind-presenter" } : {}),
      ...(setPieceId ? { setPieceId } : {}),
      ...(propIds ? { propIds } : {}),
      ...(geoInfo.geoQuery
        ? {
            geoQuery: geoInfo.geoQuery,
            ...(geoInfo.corridorId ? { geoCorridor: geoInfo.corridorId } : {}),
            ...(geoInfo.region ? { mapRegion: geoInfo.region } : {}),
            ...(geoInfo.highlightLabel ? { highlightLabel: geoInfo.highlightLabel } : {}),
          }
        : {}),
      ...(structured.tableRows ? { tableRows: structured.tableRows } : {}),
      ...(structured.seriesData ? { seriesData: structured.seriesData } : {}),
      ...(structured.exhibitData ? { exhibitData: structured.exhibitData } : {}),
      data: structured.data,
      timedWords,
      ...(continuityEntityId ? { continuityEntityId } : {}),
      lutId,
      musicStemId,
      cameraAction,
      sfxCues,
      musicEnergy,
      cutReason: buildCutReason(
        category,
        chosen,
        framing,
        durationSec,
        isHeroPeak,
        isPrePeakQuiet,
        sourceCitation,
        activeSetPiece ? activeSetPiece.title : undefined
      ),
      ...(sourceCitation ? { sourceCitation } : {}),
    });

    lastUsedBeatByComponent[chosen.componentHint] = i;
    lastUsedBeatByFamily[chosen.styleFamily] = i;
    if (!isFullTalkingHead) {
      usageCountByComponent[chosen.componentHint] =
        (usageCountByComponent[chosen.componentHint] || 0) + 1;
      usageCountByRecipe[chosen.id] = (usageCountByRecipe[chosen.id] || 0) + 1;
      const wKey = chosen.styleWorld || chosen.styleFamily;
      usageCountByWorld[wKey] = (usageCountByWorld[wKey] || 0) + 1;
    }

    totalSecAccum += durationSec;
    if (isTalkingHeadFraming(framing)) {
      talkingHeadSecAccum += durationSec;
      consecutiveTalkingHeadSec += durationSec;
      consecutiveCutawaySec = 0;
      if (isFullTalkingHead) {
        fullThBeatsCount += 1;
        lastFullThBeatIdx = i;
      } else {
        overlayThBeatsCount += 1;
      }
    } else {
      consecutiveCutawaySec += durationSec;
      consecutiveTalkingHeadSec = 0;
    }
  }

  const totalFrames = beats.length > 0 ? beats[beats.length - 1].endFrame : 0;

  return validateDirectorPlan({
    title,
    fps,
    totalFrames,
    beats,
    episodeNumber,
    strategyId,
    lutId,
    musicStemId,
    audit: {
      avgShotDurationSec: 0,
      styleDiversityScore: 0,
      repetitionWarnings: [],
      heroPeakPercent: 0,
      talkingHeadSharePercent: 0,
    },
  });
}

/**
 * Unified Showrunner entrypoint accepting pre-segmented `TranscriptSegment[]`,
 * plain Markdown/text script (`string`), or Whisper word alignment (`WhisperDataInput`).
 */
export function planDocumentaryEdit(
  input: TranscriptSegment[] | string | WhisperDataInput,
  options: DirectorOptions = {}
): DirectorPlan {
  if (typeof input === "string") {
    return buildDraftDirectorPlan(segmentScriptText(input, options.wpm ?? 150), options);
  }
  if (Array.isArray(input)) {
    return buildDraftDirectorPlan(input, options);
  }
  return buildDraftDirectorPlan(segmentWhisperWords(input), options);
}

export function validateDirectorPlan(plan: DirectorPlan): DirectorPlan {
  const beats = plan.beats;
  const fps = plan.fps > 0 ? plan.fps : 30;
  const totalFrames =
    plan.totalFrames > 0
      ? plan.totalFrames
      : beats.length > 0
        ? beats[beats.length - 1].endFrame
        : 0;

  if (beats.length === 0 || totalFrames <= 0) {
    return {
      ...plan,
      fps,
      totalFrames: 0,
      audit: {
        avgShotDurationSec: 0,
        styleDiversityScore: 0,
        repetitionWarnings: ["DirectorPlan contains zero beats."],
        heroPeakPercent: 0,
        talkingHeadSharePercent: 0,
      },
    };
  }

  const warnings: string[] = [];
  const uniqueFamilies: Record<string, boolean> = {};
  const uniqueComponents: Record<string, boolean> = {};
  const uniqueWorlds: Record<string, boolean> = {};
  const uniqueRecipes: Record<string, boolean> = {};
  const uniqueTypo: Record<string, boolean> = {};

  let totalDurationSec = 0;
  let talkingHeadFrames = 0;
  let consecutiveFamilyRepeats = 0;
  let staticRunFrames = 0;
  let setPieceCount = 0;
  let depthSandwichCount = 0;

  let bestPeakScore = -1;
  let bestPeakMidFrame = Math.round(totalFrames * 0.675);

  for (let i = 0; i < beats.length; i++) {
    const b = beats[i];
    const beatFrames = Math.max(1, b.endFrame - b.startFrame);
    const durSec = beatFrames / fps;
    totalDurationSec += durSec;

    uniqueFamilies[b.styleFamily] = true;
    uniqueComponents[b.componentHint] = true;
    if (b.styleWorld) uniqueWorlds[b.styleWorld] = true;
    if (b.recipeId) uniqueRecipes[b.recipeId] = true;
    if (b.typographyMode) uniqueTypo[b.typographyMode] = true;
    if (b.setPieceId) setPieceCount += 1;
    if (b.depthSandwich) depthSandwichCount += 1;

    if (isTalkingHeadFraming(b.framing)) {
      talkingHeadFrames += beatFrames;
    }

    if (durSec > 18) {
      warnings.push(
        "Excessive static gap (" +
          durSec.toFixed(1) +
          "s > 18s) at " +
          b.id +
          " (" +
          b.componentHint +
          ")."
      );
    }

    if (i > 0) {
      const prev = beats[i - 1];
      if (b.styleFamily === prev.styleFamily) {
        consecutiveFamilyRepeats++;
        warnings.push(
          "Consecutive styleFamily '" +
            b.styleFamily +
            "' repeated at " +
            prev.id +
            " -> " +
            b.id +
            "."
        );
      }
      if (
        b.styleFamily === prev.styleFamily &&
        b.componentHint === prev.componentHint &&
        b.framing === prev.framing
      ) {
        staticRunFrames += beatFrames;
      } else {
        staticRunFrames = beatFrames;
      }
      if (staticRunFrames / fps > 18) {
        warnings.push(
          "Unvaried visual run > 18s ending at " + b.id + " (" + b.componentHint + ")."
        );
      }
    } else {
      staticRunFrames = beatFrames;
    }

    if (b.category === "receipt-proof" && (!b.sourceCitation || !b.sourceCitation.trim())) {
      warnings.push(
        "Missing sourceCitation on receipt-proof beat " +
          b.id +
          ' ("' +
          b.spokenText.slice(0, 48) +
          '...").'
      );
    }

    let peakScore = 0;
    for (let s = 0; s < b.sfxCues.length; s++) {
      if (b.sfxCues[s].cue === "warning-thud") peakScore += 4;
    }
    if (b.componentHint === "VisualInvestigationBoard") peakScore += 3;
    if (b.category === "warning-escalation") peakScore += 2;
    if (b.musicEnergy === "tense") peakScore += 2;

    const midFrame = (b.startFrame + b.endFrame) * 0.5;
    const midPct = (midFrame / totalFrames) * 100;
    if (midPct >= 60 && midPct <= 75) {
      peakScore += 1;
    }

    if (peakScore > bestPeakScore) {
      bestPeakScore = peakScore;
      bestPeakMidFrame = midFrame;
    } else if (peakScore === bestPeakScore) {
      const currDist = Math.abs(midPct - 67.5);
      const bestDist = Math.abs((bestPeakMidFrame / totalFrames) * 100 - 67.5);
      if (currDist < bestDist) {
        bestPeakMidFrame = midFrame;
      }
    }
  }

  if (beats[0].category !== "hook") {
    warnings.push("Opening beat (" + beats[0].id + ") is not classified as 'hook'.");
  }

  const avgShotDurationSec = Number((totalDurationSec / beats.length).toFixed(2));
  const familyCount = Object.keys(uniqueFamilies).length;
  const componentCount = Object.keys(uniqueComponents).length;

  const familyRatio = Math.min(1, familyCount / 5);
  const targetCompMax = Math.min(24, beats.length);
  const compRatio = targetCompMax > 0 ? Math.min(1, componentCount / targetCompMax) : 0;
  const transitionScore =
    beats.length > 1 ? Math.max(0, 1 - consecutiveFamilyRepeats / (beats.length - 1)) : 1;

  const styleDiversityScore = Number(
    ((familyRatio * 0.35 + compRatio * 0.4 + transitionScore * 0.25) * 100).toFixed(1)
  );
  const heroPeakPercent = Number(((bestPeakMidFrame / totalFrames) * 100).toFixed(1));
  const talkingHeadSharePercent = Number(((talkingHeadFrames / totalFrames) * 100).toFixed(1));

  const audit: DirectorAudit = {
    avgShotDurationSec,
    styleDiversityScore,
    repetitionWarnings: warnings,
    heroPeakPercent,
    talkingHeadSharePercent,
    uniqueStyleWorlds: Object.keys(uniqueWorlds).length,
    uniqueRecipesUsed: Object.keys(uniqueRecipes).length,
    uniqueTypographyModes: Object.keys(uniqueTypo).length,
    setPieceCount,
    depthSandwichCount,
    strategyId: plan.strategyId,
  };

  return {
    ...plan,
    fps,
    totalFrames,
    audit,
  };
}
