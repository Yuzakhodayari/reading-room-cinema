import { z } from "zod";
import {
  StrategyPresetId,
  StrategyPresetIdSchema,
  STRATEGY_PRESETS,
  VisualRegisterId,
  VisualRegisterIdSchema,
  VISUAL_REGISTER_IDS,
} from "./strategyPresets";

/**
 * Pillar #14 — 30-Episode Anti-Repetition Novelty Vault (`episodeVault.ts`)
 *
 * Persistent Season Memory across 30+ uploads in 2027. Records every episode's
 * style counts, motion combos, prop IDs, glass presets, typography modes, LUT ID,
 * procedural music stems, and 3–5 Showstopper Set-Pieces. Applies exponential
 * cross-episode cooldown decay `exp(-deltaEp / 2.5)` across the trailing 5-episode
 * window and synthesizes a fresh Episode Visual Signature for each new upload.
 */

export const EPISODE_VAULT_SCHEMA_VERSION = "1.0.0" as const;

/**
 * All 12 canonical `.cube` 3D LUT grades in `studio/luts/*.cube`.
 */
export const CINEMA_LUT_IDS = [
  "editorial-warm",
  "documentary-slate",
  "clean-room-pop",
  "archival-parchment",
  "kodak-2383-print",
  "midnight-desk",
  "cold-2030-deflation",
  "austin-august-heat",
  "blueprint-cyanotype",
  "silver-gelatin-1941",
  "subsea-sodium",
  "verdict-high-contrast",
] as const;

export type CinemaLutId = (typeof CINEMA_LUT_IDS)[number];

export const CinemaLutIdSchema = z.enum(CINEMA_LUT_IDS);

/**
 * All 12 bundled procedural 48kHz stereo documentary score stems (`studio/public/music/*.wav`).
 */
export const CINEMA_MUSIC_STEM_IDS = [
  "01-archival-pulse",
  "02-ledger-investigation",
  "03-midnight-telemetry",
  "04-clockwork-mechanism",
  "05-sovereign-tension",
  "06-subsea-drone",
  "07-industrial-march",
  "08-quiet-reckoning",
  "09-toy-model-marimba",
  "10-speculative-horizon",
  "11-verdict-drone",
  "12-epilogue-warmth",
] as const;

export type CinemaMusicStemId = (typeof CINEMA_MUSIC_STEM_IDS)[number];

export const CinemaMusicStemIdSchema = z.enum(CINEMA_MUSIC_STEM_IDS);

/**
 * 12 tactile physical/editorial mechanical motifs rotated across the 30-episode season.
 */
export const MECHANICAL_MOTIF_IDS = [
  "hydraulic-spillway-and-veto-slash",
  "rollover-conveyor-and-treasury-scale",
  "circular-spv-carousel-and-depreciation-ledger",
  "pik-toggle-valve-and-snowball",
  "lidar-roof-scan-and-escrow-thermometer",
  "transformer-waitlist-and-smelter-funnel",
  "wafer-lithography-and-euv-killswitch",
  "cost-exchange-scale-and-vls-matrix",
  "bathymetry-trench-and-anchor-sever",
  "sovereign-spread-caliper-and-orderbook",
  "trust-vault-hourglass-and-payroll-siphon",
  "split-century-archival-chronometer",
] as const;

export type MechanicalMotifId = (typeof MECHANICAL_MOTIF_IDS)[number];

export const MechanicalMotifIdSchema = z.enum(MECHANICAL_MOTIF_IDS);

/**
 * Canonical 18 Liquid Glass & Depth-Sandwich preset IDs.
 */
export const CANONICAL_GLASS_PRESET_IDS = [
  "card",
  "pill",
  "dock",
  "toolbar",
  "toast",
  "split-modal",
  "dossier-stack",
  "evidence-rail",
  "magnifier-card",
  "telemetry-strip",
  "verdict-seal",
  "compare-scale",
  "timeline-scrubber",
  "receipt-ticker",
  "terminal-console",
  "map-callout",
  "stat-triptych",
  "quote-citation",
] as const;

/**
 * Canonical 32 Kinetic Typography & Stenography mode IDs.
 */
export const CANONICAL_TYPOGRAPHY_MODE_IDS = [
  "word-pop",
  "karaoke-highlight",
  "typewriter",
  "split-lines",
  "stamp-slam",
  "marker-sweep",
  "red-correction",
  "solari-split-flap",
  "redacted-declassify",
  "stenographer-ribbon",
  "verdict-anvil-slam",
  "burstiness-staccato-cuts",
  "chisel-highlighter-sweep",
  "behind-presenter-monolith",
  "ledger-tabular-rollup",
  "court-syllabus-italic",
  "telestrator-grease-math",
  "footnote-loupe-zoom",
  "stock-ticker-crawl",
  "antithesis-split-lock",
  "erosion-decay-fade",
  "veto-fountain-strike",
  "typewriter-1941-ribbon",
  "blueprint-dimension-callout",
  "chapter-roman-folio",
  "debt-odometer-inline",
  "whisper-focus-spotlight",
  "margin-redline-gloss",
  "statute-clause-box",
  "question-inversion-turn",
  "silent-black-aphorism",
  "cascading-evidence-stack",
] as const;

export const SEASON_SLOT_STATUSES = [
  "locked",
  "roadmap-packaged",
  "season-blueprint",
] as const;

export type SeasonSlotStatus = (typeof SEASON_SLOT_STATUSES)[number];

export const SeasonSlotStatusSchema = z.enum(SEASON_SLOT_STATUSES);

export interface EpisodeVisualSignature {
  readonly signatureId: string;
  readonly primaryRegister: VisualRegisterId;
  readonly secondaryRegister: VisualRegisterId;
  readonly lutId: CinemaLutId;
  readonly primaryMechanicalMotif: MechanicalMotifId;
  readonly scorePalette: readonly CinemaMusicStemId[];
}

export const EpisodeVisualSignatureSchema = z.object({
  signatureId: z.string().min(1),
  primaryRegister: VisualRegisterIdSchema,
  secondaryRegister: VisualRegisterIdSchema,
  lutId: CinemaLutIdSchema,
  primaryMechanicalMotif: MechanicalMotifIdSchema,
  scorePalette: z.array(CinemaMusicStemIdSchema).min(2).max(5),
});

export interface EpisodeVaultRecord {
  readonly episodeNumber: number;
  readonly episodeCode: string;
  readonly title: string;
  readonly strategyId: StrategyPresetId;
  readonly recordedAtIso: string;
  readonly styleCounts: Readonly<Record<string, number>>;
  readonly motionCombos: Readonly<Record<string, number>>;
  readonly propIds: readonly string[];
  readonly glassPresets: readonly string[];
  readonly typographyModes: readonly string[];
  readonly lutId: CinemaLutId;
  readonly musicStems: readonly CinemaMusicStemId[];
  readonly showstopperBlueprints: readonly string[];
  readonly visualSignature: EpisodeVisualSignature;
}

export const EpisodeVaultRecordSchema = z.object({
  episodeNumber: z.number().int().min(1),
  episodeCode: z.string().regex(/^S\d{2}E\d{2}$/),
  title: z.string().min(1),
  strategyId: StrategyPresetIdSchema,
  recordedAtIso: z.string().min(1),
  styleCounts: z.record(z.string(), z.number().int().min(0)),
  motionCombos: z.record(z.string(), z.number().int().min(0)),
  propIds: z.array(z.string().min(1)).min(1),
  glassPresets: z.array(z.string().min(1)).min(1),
  typographyModes: z.array(z.string().min(1)).min(1),
  lutId: CinemaLutIdSchema,
  musicStems: z.array(CinemaMusicStemIdSchema).min(1),
  showstopperBlueprints: z.array(z.string().min(1)).min(3).max(5),
  visualSignature: EpisodeVisualSignatureSchema,
});

export interface SeasonVaultSlot {
  readonly episodeNumber: number;
  readonly episodeCode: string;
  readonly status: SeasonSlotStatus;
  readonly strategyId: StrategyPresetId;
  readonly workingTitle: string;
  readonly preferredLutId: CinemaLutId;
  readonly preferredMotif: MechanicalMotifId;
  readonly reservedShowstoppers: readonly string[];
}

export const SeasonVaultSlotSchema = z.object({
  episodeNumber: z.number().int().min(1).max(60),
  episodeCode: z.string().regex(/^S\d{2}E\d{2}$/),
  status: SeasonSlotStatusSchema,
  strategyId: StrategyPresetIdSchema,
  workingTitle: z.string().min(1),
  preferredLutId: CinemaLutIdSchema,
  preferredMotif: MechanicalMotifIdSchema,
  reservedShowstoppers: z.array(z.string().min(1)).min(3).max(5),
});

export interface EpisodeVault {
  readonly schemaVersion: typeof EPISODE_VAULT_SCHEMA_VERSION;
  readonly channelName: string;
  readonly playlistSearchTitle: string;
  readonly seasonNumber: number;
  readonly seasonYear: number;
  readonly targetSeasonEpisodes: number;
  readonly cooldownHalfLifeTau: number;
  readonly lookbackWindowEpisodes: number;
  readonly showstopperBounds: {
    readonly min: 3;
    readonly max: 5;
  };
  readonly seasonSlots: readonly SeasonVaultSlot[];
  readonly episodes: readonly EpisodeVaultRecord[];
}

export const EpisodeVaultSchema = z.object({
  schemaVersion: z.literal(EPISODE_VAULT_SCHEMA_VERSION),
  channelName: z.string().min(1),
  playlistSearchTitle: z.string().min(1),
  seasonNumber: z.number().int().min(1),
  seasonYear: z.number().int().min(2025),
  targetSeasonEpisodes: z.number().int().min(10),
  cooldownHalfLifeTau: z.number().positive(),
  lookbackWindowEpisodes: z.number().int().min(1),
  showstopperBounds: z.object({
    min: z.literal(3),
    max: z.literal(5),
  }),
  seasonSlots: z.array(SeasonVaultSlotSchema).min(30),
  episodes: z.array(EpisodeVaultRecordSchema),
});

export interface ShowstopperBlueprintEntry {
  readonly id: string;
  readonly title: string;
  readonly targetEpisodeNumber: number;
  readonly primaryArchetype: string;
  readonly mechanismSummary: string;
  readonly compatibleStrategies: readonly StrategyPresetId[];
}

// ============================================================================
// 30-Episode Season Slot Definitions & Globally Disjoint Showstopper Catalog
// ============================================================================

function formatEpisodeCode(seasonNum: number, epNum: number): string {
  const s = seasonNum < 10 ? "0" + String(seasonNum) : String(seasonNum);
  const e = epNum < 10 ? "0" + String(epNum) : String(epNum);
  return "S" + s + "E" + e;
}

export const SEASON_01_VAULT_SLOTS: readonly SeasonVaultSlot[] = [
  {
    episodeNumber: 1,
    episodeCode: "S01E01",
    status: "locked",
    strategyId: "STR-GEN-EXPLAINER",
    workingTitle: "The Allowance: AI vs $40.5T Debt",
    preferredLutId: "editorial-warm",
    preferredMotif: "hydraulic-spillway-and-veto-slash",
    reservedShowstoppers: [
      "sp-ep01-shoe-bom-vaporizer",
      "sp-ep01-whiteboard-iron-loan-flip",
      "sp-ep01-port-1955-vs-2034-diptych",
      "sp-ep01-wattage-10w-to-5gw-ladder",
      "sp-ep01-walker-veto-allowance-slam",
    ],
  },
  {
    episodeNumber: 2,
    episodeCode: "S01E02",
    status: "roadmap-packaged",
    strategyId: "STR-FISHER-ARTIFACT",
    workingTitle: "Who Buys America's $40T Debt Now?",
    preferredLutId: "archival-parchment",
    preferredMotif: "rollover-conveyor-and-treasury-scale",
    reservedShowstoppers: [
      "sp-ep02-tether-vs-tokyo-tbill-shift",
      "sp-ep02-90day-rollover-conveyor",
      "sp-ep02-genius-act-statutory-lock",
      "sp-ep02-interest-overtakes-defense-scale",
    ],
  },
  {
    episodeNumber: 3,
    episodeCode: "S01E03",
    status: "roadmap-packaged",
    strategyId: "STR-BOYLE-CHAPTERED",
    workingTitle: "Big Tech's $176B AI Profit Trick?",
    preferredLutId: "midnight-desk",
    preferredMotif: "circular-spv-carousel-and-depreciation-ledger",
    reservedShowstoppers: [
      "sp-ep03-nvidia-coreweave-spv-carousel",
      "sp-ep03-server-lifespan-3yr-to-6yr-stretch",
      "sp-ep03-176b-paper-profit-footnote-loupe",
      "sp-ep03-off-balance-sheet-gpu-collateral-box",
    ],
  },
  {
    episodeNumber: 4,
    episodeCode: "S01E04",
    status: "roadmap-packaged",
    strategyId: "STR-HMW-PRIMER",
    workingTitle: "How AI Agents Break $2.5T Private Credit",
    preferredLutId: "documentary-slate",
    preferredMotif: "pik-toggle-valve-and-snowball",
    reservedShowstoppers: [
      "sp-ep04-saas-pik-debt-snowball",
      "sp-ep04-per-seat-license-evaporator",
      "sp-ep04-bdc-10q-masked-default-unveil",
      "sp-ep04-shadow-bank-tranche-cascade",
    ],
  },
  {
    episodeNumber: 5,
    episodeCode: "S01E05",
    status: "roadmap-packaged",
    strategyId: "STR-GEN-EXPLAINER",
    workingTitle: "How Insurance Breaks $13.4T Mortgages?",
    preferredLutId: "austin-august-heat",
    preferredMotif: "lidar-roof-scan-and-escrow-thermometer",
    reservedShowstoppers: [
      "sp-ep05-california-lidar-roof-drone",
      "sp-ep05-fixed-mortgage-variable-escrow-wedge",
      "sp-ep05-fair-plan-29pct-shock-notice",
      "sp-ep05-force-placed-zero-equity-trap",
    ],
  },
  {
    episodeNumber: 6,
    episodeCode: "S01E06",
    status: "roadmap-packaged",
    strategyId: "STR-FISHER-ARTIFACT",
    workingTitle: "China's 2026 Copper Trap for AI Grids",
    preferredLutId: "blueprint-cyanotype",
    preferredMotif: "transformer-waitlist-and-smelter-funnel",
    reservedShowstoppers: [
      "sp-ep06-transformer-128wk-copper-trap",
      "sp-ep06-17p5yr-copper-mine-chronometer",
      "sp-ep06-china-72pct-refining-chokepoint",
      "sp-ep06-pjm-94gw-deficit-breaker",
    ],
  },
  {
    episodeNumber: 7,
    episodeCode: "S01E07",
    status: "roadmap-packaged",
    strategyId: "STR-AIC-SPECULATIVE",
    workingTitle: "Why $265B Won't Save Apple From Taiwan",
    preferredLutId: "kodak-2383-print",
    preferredMotif: "wafer-lithography-and-euv-killswitch",
    reservedShowstoppers: [
      "sp-ep07-taiwan-2nm-euv-killswitch",
      "sp-ep07-maritime-insurance-monday-pull",
      "sp-ep07-phoenix-4nm-vs-hsinchu-a16-die-split",
      "sp-ep07-10t-blockade-market-cap-domino",
    ],
  },
  {
    episodeNumber: 8,
    episodeCode: "S01E08",
    status: "roadmap-packaged",
    strategyId: "STR-MAX-ESSAY",
    workingTitle: "How $20,000 Drones Break a $1T Budget",
    preferredLutId: "clean-room-pop",
    preferredMotif: "cost-exchange-scale-and-vls-matrix",
    reservedShowstoppers: [
      "sp-ep08-drone-20k-vs-carrier-vls-drain",
      "sp-ep08-100-to-1-interceptor-balance-scale",
      "sp-ep08-96-cell-vls-magazine-depletion",
      "sp-ep08-multiyear-missile-restock-queue",
    ],
  },
  {
    episodeNumber: 9,
    episodeCode: "S01E09",
    status: "roadmap-packaged",
    strategyId: "STR-FISHER-ARTIFACT",
    workingTitle: "How 550 Cables Carry $10T a Day",
    preferredLutId: "subsea-sodium",
    preferredMotif: "bathymetry-trench-and-anchor-sever",
    reservedShowstoppers: [
      "sp-ep09-subsea-550-cable-anchor-cut",
      "sp-ep09-17mm-garden-hose-core-cutaway",
      "sp-ep09-swift-10t-daily-settlement-pulse",
      "sp-ep09-hyperscaler-90pct-atlantic-monopoly",
    ],
  },
  {
    episodeNumber: 10,
    episodeCode: "S01E10",
    status: "roadmap-packaged",
    strategyId: "STR-BOYLE-CHAPTERED",
    workingTitle: "France's 4.93% Debt Cost vs Greece?",
    preferredLutId: "verdict-high-contrast",
    preferredMotif: "sovereign-spread-caliper-and-orderbook",
    reservedShowstoppers: [
      "sp-ep10-france-greece-vigilante-flip",
      "sp-ep10-67bps-spread-inversion-caliper",
      "sp-ep10-tokyo-237pct-debt-jgb-pressure",
      "sp-ep10-g7-status-shield-shatter",
    ],
  },
  {
    episodeNumber: 11,
    episodeCode: "S01E11",
    status: "roadmap-packaged",
    strategyId: "STR-AIC-SPECULATIVE",
    workingTitle: "Why Social Security Runs Dry in 2032",
    preferredLutId: "cold-2030-deflation",
    preferredMotif: "trust-vault-hourglass-and-payroll-siphon",
    reservedShowstoppers: [
      "sp-ep11-oasi-2032-vault-exhaustion",
      "sp-ep11-form-941-human-12p4pct-vs-gpu-zero",
      "sp-ep11-q4-2032-automatic-24pct-guillotine",
      "sp-ep11-south-korea-0p72-demographic-mirror",
    ],
  },
  {
    episodeNumber: 12,
    episodeCode: "S01E12",
    status: "season-blueprint",
    strategyId: "STR-AOTP-LADDER",
    workingTitle: "How Eurodollars Built a Shadow Fed",
    preferredLutId: "silver-gelatin-1941",
    preferredMotif: "split-century-archival-chronometer",
    reservedShowstoppers: [
      "sp-ep12-1957-london-dollar-ledger-rung",
      "sp-ep12-offshore-repo-collateral-chain",
      "sp-ep12-fed-swap-line-emergency-valve",
    ],
  },
  {
    episodeNumber: 13,
    episodeCode: "S01E13",
    status: "season-blueprint",
    strategyId: "STR-AIC-CLOCKED",
    workingTitle: "42 Hours: Inside SVB's $42B Mobile Run",
    preferredLutId: "midnight-desk",
    preferredMotif: "hydraulic-spillway-and-veto-slash",
    reservedShowstoppers: [
      "sp-ep13-svb-slack-channel-deposit-drain",
      "sp-ep13-hold-to-maturity-bond-duration-trap",
      "sp-ep13-fedwire-cutoff-solvency-gate",
    ],
  },
  {
    episodeNumber: 14,
    episodeCode: "S01E14",
    status: "season-blueprint",
    strategyId: "STR-MAX-ESSAY",
    workingTitle: "Why 3 PBMs Control 80% of US Drug Prices",
    preferredLutId: "editorial-warm",
    preferredMotif: "pik-toggle-valve-and-snowball",
    reservedShowstoppers: [
      "sp-ep14-pbm-rebate-siphon-spread",
      "sp-ep14-list-vs-net-insulin-staircase",
      "sp-ep14-vertical-insurer-pharmacy-loop",
    ],
  },
  {
    episodeNumber: 15,
    episodeCode: "S01E15",
    status: "season-blueprint",
    strategyId: "STR-FISHER-ARTIFACT",
    workingTitle: "Panama vs Suez: Who Prices World Trade?",
    preferredLutId: "subsea-sodium",
    preferredMotif: "bathymetry-trench-and-anchor-sever",
    reservedShowstoppers: [
      "sp-ep15-gatun-lake-freshwater-lock-meter",
      "sp-ep15-cape-of-good-hope-reroute-burn",
      "sp-ep15-container-slot-auction-bidding-war",
    ],
  },
  {
    episodeNumber: 16,
    episodeCode: "S01E16",
    status: "season-blueprint",
    strategyId: "STR-HMW-PRIMER",
    workingTitle: "How Private Equity Rolls Up Your Vet",
    preferredLutId: "archival-parchment",
    preferredMotif: "circular-spv-carousel-and-depreciation-ledger",
    reservedShowstoppers: [
      "sp-ep16-clinic-multiple-arbitrage-stack",
      "sp-ep16-sale-leaseback-rent-extraction",
      "sp-ep16-local-brand-camouflage-wall",
    ],
  },
  {
    episodeNumber: 17,
    episodeCode: "S01E17",
    status: "season-blueprint",
    strategyId: "STR-BOYLE-CHAPTERED",
    workingTitle: "Japan's 35-Year Carry Trade Unwind?",
    preferredLutId: "kodak-2383-print",
    preferredMotif: "rollover-conveyor-and-treasury-scale",
    reservedShowstoppers: [
      "sp-ep17-yen-borrow-nasdaq-leverage-bridge",
      "sp-ep17-boj-yield-cap-spring-release",
      "sp-ep17-mrs-watanabe-fx-margin-cascade",
    ],
  },
  {
    episodeNumber: 18,
    episodeCode: "S01E18",
    status: "season-blueprint",
    strategyId: "STR-GEN-EXPLAINER",
    workingTitle: "Why Property Taxes Break Fixed Retirees",
    preferredLutId: "austin-august-heat",
    preferredMotif: "lidar-roof-scan-and-escrow-thermometer",
    reservedShowstoppers: [
      "sp-ep18-municipal-assessment-ratchet",
      "sp-ep18-paid-off-home-tax-lien-trap",
      "sp-ep18-school-bond-levy-waterfall",
    ],
  },
  {
    episodeNumber: 19,
    episodeCode: "S01E19",
    status: "season-blueprint",
    strategyId: "STR-AOTP-LADDER",
    workingTitle: "Why GPS Spoofing Breaks Civil Aviation",
    preferredLutId: "blueprint-cyanotype",
    preferredMotif: "wafer-lithography-and-euv-killswitch",
    reservedShowstoppers: [
      "sp-ep19-20-watt-satellite-signal-budget",
      "sp-ep19-inertial-drift-vs-fake-sky-cone",
      "sp-ep19-black-sea-cockpit-clock-jump",
    ],
  },
  {
    episodeNumber: 20,
    episodeCode: "S01E20",
    status: "season-blueprint",
    strategyId: "STR-FISHER-ARTIFACT",
    workingTitle: "How 4 Traders Move 70% of World Grain",
    preferredLutId: "documentary-slate",
    preferredMotif: "transformer-waitlist-and-smelter-funnel",
    reservedShowstoppers: [
      "sp-ep20-abcd-grain-silo-corridor-map",
      "sp-ep20-fertilizer-natural-gas-feedstock-pipe",
      "sp-ep20-port-elevator-basis-spread",
    ],
  },
  {
    episodeNumber: 21,
    episodeCode: "S01E21",
    status: "season-blueprint",
    strategyId: "STR-AIC-SPECULATIVE",
    workingTitle: "When AI Models Run Out of Human Text",
    preferredLutId: "clean-room-pop",
    preferredMotif: "circular-spv-carousel-and-depreciation-ledger",
    reservedShowstoppers: [
      "sp-ep21-synthetic-data-inbreeding-collapse",
      "sp-ep21-publisher-paywall-licensing-fortress",
      "sp-ep21-verifier-compute-scaling-wall",
    ],
  },
  {
    episodeNumber: 22,
    episodeCode: "S01E22",
    status: "season-blueprint",
    strategyId: "STR-BOYLE-CHAPTERED",
    workingTitle: "America's $1.2T Municipal Pension Hole",
    preferredLutId: "silver-gelatin-1941",
    preferredMotif: "trust-vault-hourglass-and-payroll-siphon",
    reservedShowstoppers: [
      "sp-ep22-7pct-assumed-return-mirage-bar",
      "sp-ep22-private-credit-pension-allocation-shift",
      "sp-ep22-city-service-cut-priority-blade",
    ],
  },
  {
    episodeNumber: 23,
    episodeCode: "S01E23",
    status: "season-blueprint",
    strategyId: "STR-MAX-ESSAY",
    workingTitle: "Why $800B Auto Loans Hit Record Repo",
    preferredLutId: "cold-2030-deflation",
    preferredMotif: "pik-toggle-valve-and-snowball",
    reservedShowstoppers: [
      "sp-ep23-84-month-negative-equity-rollover",
      "sp-ep23-subprime-abs-tranche-delinquency-meter",
      "sp-ep23-lpr-tow-truck-scan-grid",
    ],
  },
  {
    episodeNumber: 24,
    episodeCode: "S01E24",
    status: "season-blueprint",
    strategyId: "STR-GEN-FIELD",
    workingTitle: "Inside Virginia's 4 GW Data Center Alley",
    preferredLutId: "editorial-warm",
    preferredMotif: "transformer-waitlist-and-smelter-funnel",
    reservedShowstoppers: [
      "sp-ep24-loudoun-substation-corridor-walk",
      "sp-ep24-diesel-backup-generator-row-test",
      "sp-ep24-residential-ratepayer-transmission-bill",
    ],
  },
  {
    episodeNumber: 25,
    episodeCode: "S01E25",
    status: "season-blueprint",
    strategyId: "STR-HMW-PRIMER",
    workingTitle: "How Passive Index Funds Lock Up Voting",
    preferredLutId: "archival-parchment",
    preferredMotif: "sovereign-spread-caliper-and-orderbook",
    reservedShowstoppers: [
      "sp-ep25-big-three-proxy-vote-funnel",
      "sp-ep25-inelastic-market-multiplier-spring",
      "sp-ep25-s-and-p-inclusion-liquidity-wave",
    ],
  },
  {
    episodeNumber: 26,
    episodeCode: "S01E26",
    status: "season-blueprint",
    strategyId: "STR-AIC-CLOCKED",
    workingTitle: "36 Minutes: The 2010 Trillion Flash Crash",
    preferredLutId: "verdict-high-contrast",
    preferredMotif: "split-century-archival-chronometer",
    reservedShowstoppers: [
      "sp-ep26-e-mini-spoofing-orderbook-avalanche",
      "sp-ep26-hot-potato-hft-liquidity-vanish",
      "sp-ep26-stub-quote-one-penny-execution",
    ],
  },
  {
    episodeNumber: 27,
    episodeCode: "S01E27",
    status: "season-blueprint",
    strategyId: "STR-FISHER-ARTIFACT",
    workingTitle: "Russia's 600-Ship Shadow Oil Tanker Map",
    preferredLutId: "subsea-sodium",
    preferredMotif: "bathymetry-trench-and-anchor-sever",
    reservedShowstoppers: [
      "sp-ep27-ais-dark-ship-to-ship-transfer",
      "sp-ep27-g7-price-cap-attestation-loophole",
      "sp-ep27-danish-straits-uninsured-hull-risk",
    ],
  },
  {
    episodeNumber: 28,
    episodeCode: "S01E28",
    status: "season-blueprint",
    strategyId: "STR-AOTP-LADDER",
    workingTitle: "Why Enriched Uranium Hitting a Wall?",
    preferredLutId: "blueprint-cyanotype",
    preferredMotif: "wafer-lithography-and-euv-killswitch",
    reservedShowstoppers: [
      "sp-ep28-gas-centrifuge-swu-cascade-ladder",
      "sp-ep28-haleu-19p75pct-smr-fuel-gap",
      "sp-ep28-megatons-to-megawatts-depletion",
    ],
  },
  {
    episodeNumber: 29,
    episodeCode: "S01E29",
    status: "season-blueprint",
    strategyId: "STR-BOYLE-CHAPTERED",
    workingTitle: "How Buy-Now-Pay-Later Hides Consumer Debt",
    preferredLutId: "midnight-desk",
    preferredMotif: "pik-toggle-valve-and-snowball",
    reservedShowstoppers: [
      "sp-ep29-phantom-four-installment-stack",
      "sp-ep29-credit-bureau-blindspot-ledger",
      "sp-ep29-merchant-discount-fee-squeeze",
    ],
  },
  {
    episodeNumber: 30,
    episodeCode: "S01E30",
    status: "season-blueprint",
    strategyId: "STR-GEN-EXPLAINER",
    workingTitle: "The 2035 Sovereign Debt Endgame Matrix",
    preferredLutId: "kodak-2383-print",
    preferredMotif: "rollover-conveyor-and-treasury-scale",
    reservedShowstoppers: [
      "sp-ep30-four-endgame-levers-master-board",
      "sp-ep30-financial-repression-real-yield-clamp",
      "sp-ep30-household-real-asset-shield-ledger",
      "sp-ep30-season-one-callback-synthesis-wall",
    ],
  },
];

function buildShowstopperCatalogFromSlots(
  slots: readonly SeasonVaultSlot[]
): Readonly<Record<string, ShowstopperBlueprintEntry>> {
  const catalog: Record<string, ShowstopperBlueprintEntry> = {
    "sp-ep01-claire-longitudinal-house-ledger": {
      id: "sp-ep01-claire-longitudinal-house-ledger",
      title: "Claire's Longitudinal 2025->2030->2036 House & T-Account",
      targetEpisodeNumber: 1,
      primaryArchetype: "ARCH-06",
      mechanismSummary: "Dual-pane Austin elevation + live household T-account across 11-year arc.",
      compatibleStrategies: ["STR-GEN-EXPLAINER", "STR-AIC-SPECULATIVE"],
    },
    "sp-ep01-w2-guillotine-tax-plumbing": {
      id: "sp-ep01-w2-guillotine-tax-plumbing",
      title: "W-2 Guillotine vs Ireland/Margin-Loan Tax Plumbing",
      targetEpisodeNumber: 1,
      primaryArchetype: "ARCH-08",
      mechanismSummary: "Hydraulic fiscal split slicing top W-2 pipe while capital bypasses Treasury.",
      compatibleStrategies: ["STR-GEN-EXPLAINER", "STR-HMW-PRIMER"],
    },
    "sp-ep01-bond-2p1t-priority-spillway": {
      id: "sp-ep01-bond-2p1t-priority-spillway",
      title: "Federal $2.1T Bond Priority Spillway",
      targetEpisodeNumber: 1,
      primaryArchetype: "ARCH-08",
      mechanismSummary: "Three-tier dam filling $2.1T bondholders first while citizen check stays dry.",
      compatibleStrategies: ["STR-GEN-EXPLAINER", "STR-FISHER-ARTIFACT"],
    },
    "sp-ep01-empty-gate14a-expiring-compute": {
      id: "sp-ep01-empty-gate14a-expiring-compute",
      title: "Empty Gate 14A vs Expiring Tuesday Compute",
      targetEpisodeNumber: 1,
      primaryArchetype: "ARCH-10",
      mechanismSummary: "Departing airliner empty seat paired with perishable GPU quota burn-down.",
      compatibleStrategies: ["STR-GEN-EXPLAINER", "STR-MAX-ESSAY"],
    },
    "sp-ep01-scrip-wallet-vs-1912-coal": {
      id: "sp-ep01-scrip-wallet-vs-1912-coal",
      title: "Closed Scrip Wallet 20% Exit Toll vs 1912 Coal Scrip",
      targetEpisodeNumber: 1,
      primaryArchetype: "ARCH-10",
      mechanismSummary: "Chase $0 rent rejection + 20% haircut juxtaposed with 1912 Island Creek brass scrip.",
      compatibleStrategies: ["STR-GEN-EXPLAINER", "STR-BOYLE-CHAPTERED"],
    },
    "sp-ep01-agent-6mo-vs-grid-10yr-race": {
      id: "sp-ep01-agent-6mo-vs-grid-10yr-race",
      title: "6-Month Agent Rollout vs 10-Year Grid Permitting Race",
      targetEpisodeNumber: 1,
      primaryArchetype: "ARCH-12",
      mechanismSummary: "Dual-speed horizontal chronometer shading the 4.5-9.5 year HV bottleneck.",
      compatibleStrategies: ["STR-GEN-EXPLAINER", "STR-AIC-SPECULATIVE"],
    },
    "sp-ep01-1941-uk-ration-book-counter": {
      id: "sp-ep01-1941-uk-ration-book-counter",
      title: "1941 UK 16-Point Ration Counter",
      targetEpisodeNumber: 1,
      primaryArchetype: "ARCH-01",
      mechanismSummary: "Dec 1, 1941 Ministry of Food coupon ledger proving cash alone cannot print supply.",
      compatibleStrategies: ["STR-GEN-EXPLAINER", "STR-BOYLE-CHAPTERED"],
    },
  };

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const preset = STRATEGY_PRESETS[slot.strategyId];
    for (let j = 0; j < slot.reservedShowstoppers.length; j++) {
      const spId = slot.reservedShowstoppers[j];
      const archetype =
        preset.preferredSceneArchetypes[
          j % preset.preferredSceneArchetypes.length
        ] ?? "ARCH-01";
      catalog[spId] = {
        id: spId,
        title: `${slot.episodeCode} Showstopper #${j + 1}: ${spId.replace(/^sp-ep\d{2}-/, "").replace(/-/g, " ")}`,
        targetEpisodeNumber: slot.episodeNumber,
        primaryArchetype: archetype,
        mechanismSummary: `Bespoke physics & primary-artifact set-piece reserved for ${slot.workingTitle}.`,
        compatibleStrategies: [slot.strategyId],
      };
    }
  }
  return catalog;
}

export const SHOWSTOPPER_BLUEPRINT_CATALOG: Readonly<
  Record<string, ShowstopperBlueprintEntry>
> = buildShowstopperCatalogFromSlots(SEASON_01_VAULT_SLOTS);

/**
 * Verified Episode 01 baseline lock reflecting all 42 sequences (`P01–P58`) of
 * *The Allowance: AI vs $40.5T Debt*.
 */
export const EPISODE_01_BASELINE_VAULT_RECORD: EpisodeVaultRecord = {
  episodeNumber: 1,
  episodeCode: "S01E01",
  title: "The Allowance: AI vs $40.5T Debt",
  strategyId: "STR-GEN-EXPLAINER",
  recordedAtIso: "2027-01-04T00:00:00.000Z",
  styleCounts: {
    "doc-archive-light-table": 6,
    "doc-visual-investigation": 5,
    "doc-split-fact-check": 4,
    "diagram-hydraulic-plumbing": 5,
    "diagram-isometric": 3,
    "data-map-explainer": 3,
    "vintage-1930s-depression-ledger": 2,
    "vintage-company-scrip-voucher": 2,
    "vintage-1941-ration-booklet": 2,
    "liquid-glass-card": 4,
    "liquid-glass-dock": 3,
    "doc-bloomberg-terminal-clean": 3,
  },
  motionCombos: {
    "dossier-slide-desk+loupe-scan-row+fade-out": 6,
    "hydraulic-press-down+stamp-recoil-hold+curtain-close": 5,
    "isometric-rise+orthographic-explode-layers+pop-down": 3,
    "flip-y+card-tilt-3d+slide-left": 2,
    "path-stroke-draw+sankey-particle-stream+fade-blur-out": 5,
    "split-push-left+pendulum-tick-1hz+split-barn-doors": 4,
    "stamp-slam+red-pen-strike+silence-hold": 3,
    "zoom-punch+radar-sweep-reveal+fade-out": 3,
  },
  propIds: [
    "DebtMonolithWall",
    "ClaireAustinHouseRig",
    "RunningShoeExplodedStack",
    "PaloAltoFlipWhiteboard",
    "W2WithholdingGuillotine",
    "SpillwayDam3Tier",
    "AutonomousPortGantry2034",
    "IdlePier1955",
    "GovernorVetoFountainPen",
    "EmptyAirlineGate14A",
    "ClosedScripWalletRig",
    "CoalScripBrassToken1912",
    "ShenzhenExpiringWallet",
    "WattageApplianceNode",
    "NuclearCoolingTowerLock",
    "BritishRationBook1941",
  ],
  glassPresets: [
    "card",
    "dock",
    "pill",
    "magnifier-card",
    "timeline-scrubber",
    "verdict-seal",
  ],
  typographyModes: [
    "cold-open-thesis-lock",
    "ledger-tabular-rollup",
    "chisel-highlighter-sweep",
    "burstiness-staccato-cuts",
    "court-syllabus-italic",
    "veto-fountain-strike",
    "debt-odometer-inline",
    "silent-black-aphorism",
  ],
  lutId: "editorial-warm",
  musicStems: [
    "02-ledger-investigation",
    "04-clockwork-mechanism",
    "05-sovereign-tension",
    "11-verdict-drone",
  ],
  showstopperBlueprints: [
    "sp-ep01-shoe-bom-vaporizer",
    "sp-ep01-whiteboard-iron-loan-flip",
    "sp-ep01-port-1955-vs-2034-diptych",
    "sp-ep01-wattage-10w-to-5gw-ladder",
    "sp-ep01-walker-veto-allowance-slam",
  ],
  visualSignature: {
    signatureId: "sig-ep01-milk-editorial-warm-hydraulic-veto",
    primaryRegister: "milk-page-editorial",
    secondaryRegister: "archival-light-table",
    lutId: "editorial-warm",
    primaryMechanicalMotif: "hydraulic-spillway-and-veto-slash",
    scorePalette: [
      "02-ledger-investigation",
      "04-clockwork-mechanism",
      "05-sovereign-tension",
      "11-verdict-drone",
    ],
  },
};

export function createDefaultEpisodeVault(): EpisodeVault {
  return {
    schemaVersion: EPISODE_VAULT_SCHEMA_VERSION,
    channelName: "Reading Room Cinema",
    playlistSearchTitle: "AI, National Debt & Global Power Explained",
    seasonNumber: 1,
    seasonYear: 2027,
    targetSeasonEpisodes: 30,
    cooldownHalfLifeTau: 2.5,
    lookbackWindowEpisodes: 5,
    showstopperBounds: { min: 3, max: 5 },
    seasonSlots: SEASON_01_VAULT_SLOTS.slice(),
    episodes: [EPISODE_01_BASELINE_VAULT_RECORD],
  };
}

export const DEFAULT_EPISODE_VAULT: EpisodeVault = createDefaultEpisodeVault();

// ============================================================================
// Exponential Cooldown Math & Visual Signature Selection (`computeNoveltyWeights`)
// ============================================================================

export interface ComputeNoveltyOptions {
  readonly strategyOverride?: StrategyPresetId;
  readonly desiredShowstopperCount?: 3 | 4 | 5;
  readonly candidateStyles?: readonly string[];
  readonly candidateMotionCombos?: readonly string[];
  readonly candidateProps?: readonly string[];
}

export interface NoveltyWeightReport {
  readonly targetEpisodeNumber: number;
  readonly targetEpisodeCode: string;
  readonly activeStrategyId: StrategyPresetId;
  readonly trailingEpisodesInspected: readonly number[];
  readonly cooldownTau: number;
  readonly styleWeights: Readonly<Record<string, number>>;
  readonly motionComboWeights: Readonly<Record<string, number>>;
  readonly propWeights: Readonly<Record<string, number>>;
  readonly glassPresetWeights: Readonly<Record<string, number>>;
  readonly typographyModeWeights: Readonly<Record<string, number>>;
  readonly lutWeights: Readonly<Record<CinemaLutId, number>>;
  readonly musicStemWeights: Readonly<Record<CinemaMusicStemId, number>>;
  readonly mechanicalMotifWeights: Readonly<Record<MechanicalMotifId, number>>;
  readonly registerWeights: Readonly<Record<VisualRegisterId, number>>;
  readonly showstopperWeights: Readonly<Record<string, number>>;
  readonly recommendedSignature: EpisodeVisualSignature;
  readonly recommendedShowstoppers: readonly string[];
}

/**
 * Exact exponential cross-episode cooldown kernel: `exp(-deltaEp / tau)` (`tau = 2.5` default).
 */
export function computeCooldownKernel(
  deltaEpisodes: number,
  tau = 2.5
): number {
  if (!Number.isFinite(deltaEpisodes) || deltaEpisodes <= 0) {
    return 1;
  }
  const safeTau = tau > 0 ? tau : 2.5;
  return Math.exp(-deltaEpisodes / safeTau);
}

function pressureToNoveltyWeight(
  pressure: number,
  sensitivity: number,
  minFloor = 0.06
): number {
  if (!Number.isFinite(pressure) || pressure <= 0) {
    return 1;
  }
  const raw = 1 / (1 + sensitivity * pressure);
  return Math.max(minFloor, Math.min(1, Number(raw.toFixed(6))));
}

function deterministicTieBreak(key: string, episodeNumber: number): number {
  let hash = (2166136261 ^ (episodeNumber * 16777619)) >>> 0;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return (hash % 10000) / 10000000;
}

function pickTopWeightedKeys<T extends string>(
  candidates: readonly T[],
  weights: Readonly<Record<string, number>>,
  count: number,
  episodeNumber: number,
  excludeSet: ReadonlySet<string> = new Set<string>()
): T[] {
  const scored: Array<{ readonly item: T; readonly score: number }> = [];
  for (let i = 0; i < candidates.length; i++) {
    const item = candidates[i];
    if (excludeSet.has(item)) {
      continue;
    }
    const baseWeight = weights[item] !== undefined ? weights[item] : 1;
    scored.push({
      item,
      score: baseWeight + deterministicTieBreak(item, episodeNumber),
    });
  }
  scored.sort((a, b) => b.score - a.score);
  const picked: T[] = [];
  for (let i = 0; i < Math.min(count, scored.length); i++) {
    picked.push(scored[i].item);
  }
  return picked;
}

/**
 * Computes exponential cross-episode cooldown weights (`exp(-deltaEp / 2.5)`) across
 * the last 5 episodes in `vault`, synthesizes a fresh `EpisodeVisualSignature`,
 * and selects 3–5 globally unique Showstopper Set-Pieces for `targetEpisodeNumber`.
 */
export function computeNoveltyWeights(
  vault: EpisodeVault,
  targetEpisodeNumber: number,
  options: ComputeNoveltyOptions = {}
): NoveltyWeightReport {
  const safeTargetEp = Math.max(1, Math.floor(targetEpisodeNumber));
  const tau = vault.cooldownHalfLifeTau > 0 ? vault.cooldownHalfLifeTau : 2.5;
  const windowSize =
    vault.lookbackWindowEpisodes > 0 ? vault.lookbackWindowEpisodes : 5;

  let matchingSlot: SeasonVaultSlot | undefined;
  for (let i = 0; i < vault.seasonSlots.length; i++) {
    if (vault.seasonSlots[i].episodeNumber === safeTargetEp) {
      matchingSlot = vault.seasonSlots[i];
      break;
    }
  }

  const activeStrategyId: StrategyPresetId =
    options.strategyOverride ??
    (matchingSlot ? matchingSlot.strategyId : "STR-GEN-EXPLAINER");
  const strategyPreset = STRATEGY_PRESETS[activeStrategyId];

  const trailingEpisodes: EpisodeVaultRecord[] = [];
  const allPriorEpisodes: EpisodeVaultRecord[] = [];
  for (let i = 0; i < vault.episodes.length; i++) {
    const ep = vault.episodes[i];
    const delta = safeTargetEp - ep.episodeNumber;
    if (delta > 0) {
      allPriorEpisodes.push(ep);
      if (delta <= windowSize) {
        trailingEpisodes.push(ep);
      }
    }
  }
  trailingEpisodes.sort((a, b) => b.episodeNumber - a.episodeNumber);

  const stylePressure: Record<string, number> = {};
  const motionPressure: Record<string, number> = {};
  const propPressure: Record<string, number> = {};
  const glassPressure: Record<string, number> = {};
  const typoPressure: Record<string, number> = {};
  const lutPressure: Record<string, number> = {};
  const stemPressure: Record<string, number> = {};
  const motifPressure: Record<string, number> = {};
  const registerPressure: Record<string, number> = {};

  for (let i = 0; i < trailingEpisodes.length; i++) {
    const ep = trailingEpisodes[i];
    const delta = safeTargetEp - ep.episodeNumber;
    const decay = computeCooldownKernel(delta, tau);

    const styleKeys = Object.keys(ep.styleCounts);
    let totalStyleShots = 0;
    for (let k = 0; k < styleKeys.length; k++) {
      totalStyleShots += Math.max(0, ep.styleCounts[styleKeys[k]]);
    }
    const safeStyleDenom = Math.max(1, totalStyleShots);
    for (let k = 0; k < styleKeys.length; k++) {
      const sKey = styleKeys[k];
      const count = ep.styleCounts[sKey];
      const normalizedShare = count / safeStyleDenom;
      const heavyMultiplier = count >= 4 ? 1.85 : 1.0;
      stylePressure[sKey] =
        (stylePressure[sKey] ?? 0) +
        decay * (0.4 + 3.6 * normalizedShare) * heavyMultiplier;
    }

    const motionKeys = Object.keys(ep.motionCombos);
    let totalMotions = 0;
    for (let k = 0; k < motionKeys.length; k++) {
      totalMotions += Math.max(0, ep.motionCombos[motionKeys[k]]);
    }
    const safeMotionDenom = Math.max(1, totalMotions);
    for (let k = 0; k < motionKeys.length; k++) {
      const mKey = motionKeys[k];
      const count = ep.motionCombos[mKey];
      const normalizedShare = count / safeMotionDenom;
      motionPressure[mKey] =
        (motionPressure[mKey] ?? 0) +
        decay * (0.45 + 3.4 * normalizedShare) * (count >= 4 ? 1.75 : 1.0);
    }

    for (let k = 0; k < ep.propIds.length; k++) {
      const propId = ep.propIds[k];
      propPressure[propId] = (propPressure[propId] ?? 0) + decay * 1.35;
    }
    for (let k = 0; k < ep.glassPresets.length; k++) {
      const gId = ep.glassPresets[k];
      glassPressure[gId] = (glassPressure[gId] ?? 0) + decay * 0.9;
    }
    for (let k = 0; k < ep.typographyModes.length; k++) {
      const tId = ep.typographyModes[k];
      typoPressure[tId] = (typoPressure[tId] ?? 0) + decay * 0.85;
    }

    lutPressure[ep.lutId] =
      (lutPressure[ep.lutId] ?? 0) + decay * (delta === 1 ? 6.0 : 2.6);

    for (let k = 0; k < ep.musicStems.length; k++) {
      const stem = ep.musicStems[k];
      stemPressure[stem] = (stemPressure[stem] ?? 0) + decay * 1.25;
    }

    const motif = ep.visualSignature.primaryMechanicalMotif;
    motifPressure[motif] =
      (motifPressure[motif] ?? 0) + decay * (delta === 1 ? 6.0 : 2.8);

    const pReg = ep.visualSignature.primaryRegister;
    const sReg = ep.visualSignature.secondaryRegister;
    registerPressure[pReg] = (registerPressure[pReg] ?? 0) + decay * 1.8;
    registerPressure[sReg] = (registerPressure[sReg] ?? 0) + decay * 1.1;
  }

  const allStyleKeys = new Set<string>([
    ...Object.keys(stylePressure),
    ...(options.candidateStyles ?? []),
  ]);
  const styleWeights: Record<string, number> = {};
  allStyleKeys.forEach((key) => {
    styleWeights[key] = pressureToNoveltyWeight(stylePressure[key] ?? 0, 1.45);
  });

  const allMotionKeys = new Set<string>([
    ...Object.keys(motionPressure),
    ...(options.candidateMotionCombos ?? []),
  ]);
  const motionComboWeights: Record<string, number> = {};
  allMotionKeys.forEach((key) => {
    motionComboWeights[key] = pressureToNoveltyWeight(
      motionPressure[key] ?? 0,
      1.5
    );
  });

  const allPropKeys = new Set<string>([
    ...Object.keys(propPressure),
    ...(options.candidateProps ?? []),
  ]);
  const propWeights: Record<string, number> = {};
  allPropKeys.forEach((key) => {
    propWeights[key] = pressureToNoveltyWeight(propPressure[key] ?? 0, 1.65);
  });

  const glassPresetWeights: Record<string, number> = {};
  for (let i = 0; i < CANONICAL_GLASS_PRESET_IDS.length; i++) {
    const gId = CANONICAL_GLASS_PRESET_IDS[i];
    glassPresetWeights[gId] = pressureToNoveltyWeight(
      glassPressure[gId] ?? 0,
      1.15
    );
  }

  const typographyModeWeights: Record<string, number> = {};
  for (let i = 0; i < CANONICAL_TYPOGRAPHY_MODE_IDS.length; i++) {
    const tId = CANONICAL_TYPOGRAPHY_MODE_IDS[i];
    typographyModeWeights[tId] = pressureToNoveltyWeight(
      typoPressure[tId] ?? 0,
      1.15
    );
  }

  const immediatelyPreviousEp =
    trailingEpisodes.length > 0 &&
    safeTargetEp - trailingEpisodes[0].episodeNumber === 1
      ? trailingEpisodes[0]
      : null;

  const lutWeights = {} as Record<CinemaLutId, number>;
  for (let i = 0; i < CINEMA_LUT_IDS.length; i++) {
    const lut = CINEMA_LUT_IDS[i];
    if (immediatelyPreviousEp && immediatelyPreviousEp.lutId === lut) {
      lutWeights[lut] = 0.02;
    } else {
      lutWeights[lut] = pressureToNoveltyWeight(lutPressure[lut] ?? 0, 1.75);
    }
  }

  const musicStemWeights = {} as Record<CinemaMusicStemId, number>;
  for (let i = 0; i < CINEMA_MUSIC_STEM_IDS.length; i++) {
    const stem = CINEMA_MUSIC_STEM_IDS[i];
    musicStemWeights[stem] = pressureToNoveltyWeight(
      stemPressure[stem] ?? 0,
      1.35
    );
  }

  const mechanicalMotifWeights = {} as Record<MechanicalMotifId, number>;
  for (let i = 0; i < MECHANICAL_MOTIF_IDS.length; i++) {
    const motif = MECHANICAL_MOTIF_IDS[i];
    if (
      immediatelyPreviousEp &&
      immediatelyPreviousEp.visualSignature.primaryMechanicalMotif === motif
    ) {
      mechanicalMotifWeights[motif] = 0.02;
    } else {
      mechanicalMotifWeights[motif] = pressureToNoveltyWeight(
        motifPressure[motif] ?? 0,
        1.8
      );
    }
  }

  const registerWeights = {} as Record<VisualRegisterId, number>;
  for (let i = 0; i < VISUAL_REGISTER_IDS.length; i++) {
    const reg = VISUAL_REGISTER_IDS[i];
    const strategyBonus =
      strategyPreset.preferredRegisters.indexOf(reg) !== -1 ? 0.14 : 0;
    const baseW = pressureToNoveltyWeight(registerPressure[reg] ?? 0, 1.25);
    registerWeights[reg] = Math.min(1, Number((baseW + strategyBonus).toFixed(6)));
  }

  // Showstopper hard season-uniqueness lock: any set-piece already aired gets weight 0
  const claimedShowstoppers = new Set<string>();
  for (let i = 0; i < allPriorEpisodes.length; i++) {
    const used = allPriorEpisodes[i].showstopperBlueprints;
    for (let j = 0; j < used.length; j++) {
      claimedShowstoppers.add(used[j]);
    }
  }

  const showstopperWeights: Record<string, number> = {};
  const catalogIds = Object.keys(SHOWSTOPPER_BLUEPRINT_CATALOG);
  for (let i = 0; i < catalogIds.length; i++) {
    const spId = catalogIds[i];
    if (claimedShowstoppers.has(spId)) {
      showstopperWeights[spId] = 0;
    } else {
      const entry = SHOWSTOPPER_BLUEPRINT_CATALOG[spId];
      let w = 0.72;
      if (entry.targetEpisodeNumber === safeTargetEp) {
        w = 1.0;
      } else if (
        entry.compatibleStrategies.indexOf(activeStrategyId) !== -1
      ) {
        w = 0.88;
      }
      showstopperWeights[spId] = w;
    }
  }

  // Synthesize fresh Episode Visual Signature
  const registerPool =
    strategyPreset.preferredRegisters.length >= 2
      ? strategyPreset.preferredRegisters
      : VISUAL_REGISTER_IDS;
  const topRegisters = pickTopWeightedKeys(
    registerPool,
    registerWeights,
    2,
    safeTargetEp
  );
  const primaryRegister = topRegisters[0] ?? "milk-page-editorial";
  const secondaryRegister =
    topRegisters[1] ??
    (primaryRegister === "milk-page-editorial"
      ? "archival-light-table"
      : "milk-page-editorial");

  let selectedLut: CinemaLutId;
  if (
    matchingSlot &&
    lutWeights[matchingSlot.preferredLutId] >= 0.35
  ) {
    selectedLut = matchingSlot.preferredLutId;
  } else {
    selectedLut =
      pickTopWeightedKeys(CINEMA_LUT_IDS, lutWeights, 1, safeTargetEp)[0] ??
      "documentary-slate";
  }

  let selectedMotif: MechanicalMotifId;
  if (
    matchingSlot &&
    mechanicalMotifWeights[matchingSlot.preferredMotif] >= 0.35
  ) {
    selectedMotif = matchingSlot.preferredMotif;
  } else {
    selectedMotif =
      pickTopWeightedKeys(
        MECHANICAL_MOTIF_IDS,
        mechanicalMotifWeights,
        1,
        safeTargetEp
      )[0] ?? "rollover-conveyor-and-treasury-scale";
  }

  const scorePalette = pickTopWeightedKeys(
    CINEMA_MUSIC_STEM_IDS,
    musicStemWeights,
    3,
    safeTargetEp
  );

  const targetCode = formatEpisodeCode(vault.seasonNumber, safeTargetEp);
  const recommendedSignature: EpisodeVisualSignature = {
    signatureId: `sig-${targetCode.toLowerCase()}-${primaryRegister}-${selectedLut}`,
    primaryRegister,
    secondaryRegister,
    lutId: selectedLut,
    primaryMechanicalMotif: selectedMotif,
    scorePalette,
  };

  // Select 3–5 unique Showstopper Set-Pieces
  const desiredCount =
    options.desiredShowstopperCount ??
    (matchingSlot
      ? (Math.max(
          3,
          Math.min(5, matchingSlot.reservedShowstoppers.length)
        ) as 3 | 4 | 5)
      : 4);

  const recommendedShowstoppers: string[] = [];
  if (matchingSlot) {
    for (let i = 0; i < matchingSlot.reservedShowstoppers.length; i++) {
      const sp = matchingSlot.reservedShowstoppers[i];
      if (
        !claimedShowstoppers.has(sp) &&
        recommendedShowstoppers.indexOf(sp) === -1 &&
        recommendedShowstoppers.length < desiredCount
      ) {
        recommendedShowstoppers.push(sp);
      }
    }
  }
  if (recommendedShowstoppers.length < desiredCount) {
    const excludeSet = new Set<string>([
      ...Array.from(claimedShowstoppers),
      ...recommendedShowstoppers,
    ]);
    const fillers = pickTopWeightedKeys(
      catalogIds,
      showstopperWeights,
      desiredCount - recommendedShowstoppers.length,
      safeTargetEp,
      excludeSet
    );
    for (let i = 0; i < fillers.length; i++) {
      recommendedShowstoppers.push(fillers[i]);
    }
  }

  return {
    targetEpisodeNumber: safeTargetEp,
    targetEpisodeCode: targetCode,
    activeStrategyId,
    trailingEpisodesInspected: trailingEpisodes.map((e) => e.episodeNumber),
    cooldownTau: tau,
    styleWeights,
    motionComboWeights,
    propWeights,
    glassPresetWeights,
    typographyModeWeights,
    lutWeights,
    musicStemWeights,
    mechanicalMotifWeights,
    registerWeights,
    showstopperWeights,
    recommendedSignature,
    recommendedShowstoppers,
  };
}

// ============================================================================
// Showstopper Enforcement, Structural Cosine Audit & Vault Persistence Helpers
// ============================================================================

export interface ShowstopperValidationResult {
  readonly valid: boolean;
  readonly count: number;
  readonly duplicateWithinEpisode: readonly string[];
  readonly collidedWithPriorEpisodes: readonly string[];
  readonly errors: readonly string[];
}

/**
 * Enforces the 3–5 unique Showstopper Set-Pieces rule per episode and guarantees
 * zero set-piece collisions against previously locked uploads in the season vault.
 */
export function validateShowstopperSelection(
  vault: EpisodeVault,
  episodeNumber: number,
  showstopperIds: readonly string[]
): ShowstopperValidationResult {
  const errors: string[] = [];
  const seen = new Set<string>();
  const duplicateWithinEpisode: string[] = [];
  for (let i = 0; i < showstopperIds.length; i++) {
    const id = showstopperIds[i];
    if (seen.has(id)) {
      duplicateWithinEpisode.push(id);
    }
    seen.add(id);
  }

  const priorClaimed = new Set<string>();
  for (let i = 0; i < vault.episodes.length; i++) {
    const ep = vault.episodes[i];
    if (ep.episodeNumber !== episodeNumber) {
      for (let j = 0; j < ep.showstopperBlueprints.length; j++) {
        priorClaimed.add(ep.showstopperBlueprints[j]);
      }
    }
  }

  const collidedWithPriorEpisodes: string[] = [];
  for (let i = 0; i < showstopperIds.length; i++) {
    const id = showstopperIds[i];
    if (priorClaimed.has(id) && collidedWithPriorEpisodes.indexOf(id) === -1) {
      collidedWithPriorEpisodes.push(id);
    }
  }

  if (showstopperIds.length < vault.showstopperBounds.min) {
    errors.push(
      `Episode ${episodeNumber} has ${showstopperIds.length} showstoppers; minimum required is ${vault.showstopperBounds.min}.`
    );
  }
  if (showstopperIds.length > vault.showstopperBounds.max) {
    errors.push(
      `Episode ${episodeNumber} has ${showstopperIds.length} showstoppers; maximum allowed is ${vault.showstopperBounds.max}.`
    );
  }
  if (duplicateWithinEpisode.length > 0) {
    errors.push(
      `Duplicate showstopper IDs within Episode ${episodeNumber}: ${duplicateWithinEpisode.join(", ")}.`
    );
  }
  if (collidedWithPriorEpisodes.length > 0) {
    errors.push(
      `Showstoppers already claimed in earlier season episodes: ${collidedWithPriorEpisodes.join(", ")}.`
    );
  }

  return {
    valid: errors.length === 0,
    count: showstopperIds.length,
    duplicateWithinEpisode,
    collidedWithPriorEpisodes,
    errors,
  };
}

function buildFeatureVector(record: EpisodeVaultRecord): Record<string, number> {
  const vec: Record<string, number> = {};
  const sKeys = Object.keys(record.styleCounts);
  for (let i = 0; i < sKeys.length; i++) {
    vec["style:" + sKeys[i]] = record.styleCounts[sKeys[i]];
  }
  const mKeys = Object.keys(record.motionCombos);
  for (let i = 0; i < mKeys.length; i++) {
    vec["motion:" + mKeys[i]] = record.motionCombos[mKeys[i]];
  }
  for (let i = 0; i < record.propIds.length; i++) {
    vec["prop:" + record.propIds[i]] = 1.5;
  }
  for (let i = 0; i < record.typographyModes.length; i++) {
    vec["typo:" + record.typographyModes[i]] = 1.0;
  }
  vec["lut:" + record.lutId] = 3.0;
  vec["motif:" + record.visualSignature.primaryMechanicalMotif] = 3.0;
  return vec;
}

/**
 * Computes normalized structural cosine similarity `[0, 1]` between two episode records.
 */
export function computeEpisodeCosineSimilarity(
  epA: EpisodeVaultRecord,
  epB: EpisodeVaultRecord
): number {
  const vecA = buildFeatureVector(epA);
  const vecB = buildFeatureVector(epB);
  const keysA = Object.keys(vecA);
  const keysB = Object.keys(vecB);

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < keysA.length; i++) {
    const valA = vecA[keysA[i]];
    normA += valA * valA;
    if (vecB[keysA[i]] !== undefined) {
      dot += valA * vecB[keysA[i]];
    }
  }
  for (let i = 0; i < keysB.length; i++) {
    const valB = vecB[keysB[i]];
    normB += valB * valB;
  }

  if (normA <= 0 || normB <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(1, dot / (Math.sqrt(normA) * Math.sqrt(normB))));
}

export interface EpisodeNoveltyAuditResult {
  readonly passed: boolean;
  readonly noveltyScoreOutOf100: number;
  readonly maxTrailingCosineSimilarity: number;
  readonly showstopperCheck: ShowstopperValidationResult;
  readonly warnings: readonly string[];
}

/**
 * Audits a candidate `EpisodeVaultRecord` against the trailing 5 episodes in `vault`.
 */
export function auditEpisodeNoveltyAgainstVault(
  vault: EpisodeVault,
  candidate: EpisodeVaultRecord
): EpisodeNoveltyAuditResult {
  const parsedCandidate = EpisodeVaultRecordSchema.parse(candidate);
  const showstopperCheck = validateShowstopperSelection(
    vault,
    parsedCandidate.episodeNumber,
    parsedCandidate.showstopperBlueprints
  );

  const warnings: string[] = [...showstopperCheck.errors];
  let maxCosine = 0;

  for (let i = 0; i < vault.episodes.length; i++) {
    const prior = vault.episodes[i];
    const delta = parsedCandidate.episodeNumber - prior.episodeNumber;
    if (delta > 0 && delta <= vault.lookbackWindowEpisodes) {
      const sim = computeEpisodeCosineSimilarity(prior, parsedCandidate);
      if (sim > maxCosine) {
        maxCosine = sim;
      }
      if (delta === 1 && prior.lutId === parsedCandidate.lutId) {
        warnings.push(
          `Back-to-back LUT repeat "${parsedCandidate.lutId}" with Episode ${prior.episodeNumber}.`
        );
      }
      if (
        delta === 1 &&
        prior.visualSignature.primaryMechanicalMotif ===
          parsedCandidate.visualSignature.primaryMechanicalMotif
      ) {
        warnings.push(
          `Back-to-back mechanical motif repeat "${parsedCandidate.visualSignature.primaryMechanicalMotif}" with Episode ${prior.episodeNumber}.`
        );
      }
      if (sim > 0.72) {
        warnings.push(
          `High structural similarity (${sim.toFixed(2)}) against Episode ${prior.episodeNumber}.`
        );
      }
    }
  }

  const baseScore = (1 - maxCosine * 0.65) * 100;
  const penalty = warnings.length * 12;
  const noveltyScoreOutOf100 = Math.max(
    0,
    Math.min(100, Math.round(baseScore - penalty))
  );

  return {
    passed: showstopperCheck.valid && warnings.length === 0,
    noveltyScoreOutOf100,
    maxTrailingCosineSimilarity: Number(maxCosine.toFixed(4)),
    showstopperCheck,
    warnings,
  };
}

/**
 * Immutably records or updates a locked `EpisodeVaultRecord` inside `EpisodeVault`
 * and transitions the corresponding `seasonSlots` entry to `status: "locked"`.
 */
export function recordEpisodeInVault(
  vault: EpisodeVault,
  record: EpisodeVaultRecord
): EpisodeVault {
  const parsedVault = EpisodeVaultSchema.parse(vault);
  const parsedRecord = EpisodeVaultRecordSchema.parse(record);
  const check = validateShowstopperSelection(
    parsedVault,
    parsedRecord.episodeNumber,
    parsedRecord.showstopperBlueprints
  );
  if (!check.valid) {
    throw new Error(
      `recordEpisodeInVault failed showstopper uniqueness check: ${check.errors.join(" | ")}`
    );
  }

  const nextEpisodes: EpisodeVaultRecord[] = [];
  let replaced = false;
  for (let i = 0; i < parsedVault.episodes.length; i++) {
    if (parsedVault.episodes[i].episodeNumber === parsedRecord.episodeNumber) {
      nextEpisodes.push(parsedRecord);
      replaced = true;
    } else {
      nextEpisodes.push(parsedVault.episodes[i]);
    }
  }
  if (!replaced) {
    nextEpisodes.push(parsedRecord);
  }
  nextEpisodes.sort((a, b) => a.episodeNumber - b.episodeNumber);

  const nextSlots: SeasonVaultSlot[] = [];
  for (let i = 0; i < parsedVault.seasonSlots.length; i++) {
    const slot = parsedVault.seasonSlots[i];
    if (slot.episodeNumber === parsedRecord.episodeNumber) {
      nextSlots.push({
        episodeNumber: slot.episodeNumber,
        episodeCode: parsedRecord.episodeCode,
        status: "locked",
        strategyId: parsedRecord.strategyId,
        workingTitle: parsedRecord.title,
        preferredLutId: parsedRecord.lutId,
        preferredMotif: parsedRecord.visualSignature.primaryMechanicalMotif,
        reservedShowstoppers: parsedRecord.showstopperBlueprints,
      });
    } else {
      nextSlots.push(slot);
    }
  }

  return EpisodeVaultSchema.parse({
    ...parsedVault,
    seasonSlots: nextSlots,
    episodes: nextEpisodes,
  });
}

export function parseEpisodeVaultJson(rawJson: string): EpisodeVault {
  const parsedUnknown: unknown = JSON.parse(rawJson);
  return EpisodeVaultSchema.parse(parsedUnknown);
}

export function serializeEpisodeVaultJson(vault: EpisodeVault): string {
  const validated = EpisodeVaultSchema.parse(vault);
  return JSON.stringify(validated, null, 2) + "\n";
}
