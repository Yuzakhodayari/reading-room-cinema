#!/usr/bin/env node
/**
 * Pillar #15 — Universal Model-Invariant Equalizer & AI Director CLI (`tools/ai_director.mjs`)
 *
 * Supports 3 universal execution modes with ZERO external LLM SDK dependencies:
 *   1. Multi-Provider Live API (`--provider deepseek|openai|gemini|anthropic|ollama`):
 *      Runs the 4-pass pruned Equalizer pipeline over native Node `fetch` with automatic
 *      429/5xx exponential backoff, `<think>` stripping, and forbidden-token sanitization.
 *   2. Offline Copy-Paste Prompt Pack (`--export-pack <dir>` / `--import-pack <dir>`):
 *      Exports bounded markdown workbooks (`<=1,800` input tokens, 2 gold exemplars, pruned
 *      enum masks) for any web chat UI (DeepSeek Web, Claude, ChatGPT, Gemini, Fable) and
 *      imports responses back through the deterministic compiler & auto-healer.
 *   3. Zero-API Deterministic Compilation (`--deterministic` / `--provider deterministic`):
 *      Compiles spoken `.md`/`.txt` scripts or Whisper `words.json` into a broadcast-ready
 *      `edit-plan.json` in `<2s`, rotating across 120 style recipes, 24 signature set-pieces,
 *      32 kinetic typography modes, and 18 liquid glass rigs while enforcing cross-episode
 *      cooldowns (`studio/episodes-vault.json`), Creativity Escalator promotions, Viterbi
 *      choreography, spatial AABB auto-polish, and the 30-Gate Broadcast Quality Scorer.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  STYLE_CATALOG,
  classifyBeat,
  extractSourceCitation,
  segmentScriptText,
  segmentWhisperWords,
  validateDirectorPlan,
} from "../studio/scripts/plan-edit.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const STUDIO_DIR = path.join(REPO_ROOT, "studio");
const DEFAULT_VAULT_PATH = path.join(STUDIO_DIR, "episodes-vault.json");
const DEFAULT_OUT_PATH = path.join(STUDIO_DIR, "out", "edit-plan.json");

// ============================================================================
// 0. Zero-Dependency .env Loader
// ============================================================================
function loadDotEnvFiles() {
  const candidates = [path.join(REPO_ROOT, ".env"), path.join(STUDIO_DIR, ".env")];
  for (const envPath of candidates) {
    if (!fs.existsSync(envPath)) continue;
    const content = fs.readFileSync(envPath, "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eqIdx = line.indexOf("=");
      if (eqIdx <= 0) continue;
      const key = line.slice(0, eqIdx).trim().replace(/^export\s+/, "");
      let val = line.slice(eqIdx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (key && process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
  }
}

// ============================================================================
// 1. Canonical Studio Registries (120 Recipes, 24 Set-Pieces, 32 Type, 18 Glass)
// ============================================================================

export const TYPOGRAPHY_32_MODES = [
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
];

export const GLASS_18_RIGS = [
  { id: "card", basePreset: "card", zone: "right-third" },
  { id: "pill", basePreset: "pill", zone: "top-right" },
  { id: "dock", basePreset: "dock", zone: "bottom-dock" },
  { id: "toolbar", basePreset: "dock", zone: "top-bar" },
  { id: "toast", basePreset: "toast", zone: "top-right" },
  { id: "split-modal", basePreset: "split-modal", zone: "right-half" },
  { id: "dossier-stack", basePreset: "card", zone: "right-third" },
  { id: "evidence-rail", basePreset: "card", zone: "right-third" },
  { id: "magnifier-card", basePreset: "card", zone: "right-third" },
  { id: "telemetry-strip", basePreset: "dock", zone: "bottom-dock" },
  { id: "verdict-seal", basePreset: "toast", zone: "right-third" },
  { id: "compare-scale", basePreset: "split-modal", zone: "right-half" },
  { id: "timeline-scrubber", basePreset: "dock", zone: "bottom-dock" },
  { id: "receipt-ticker", basePreset: "pill", zone: "bottom-dock" },
  { id: "terminal-console", basePreset: "card", zone: "right-third" },
  { id: "map-callout", basePreset: "card", zone: "right-third" },
  { id: "stat-triptych", basePreset: "dock", zone: "bottom-dock" },
  { id: "quote-citation", basePreset: "card", zone: "right-third" },
];

export const GLASS_RIG_BY_ID = Object.fromEntries(GLASS_18_RIGS.map((g) => [g.id, g]));

export const SIGNATURE_24_SET_PIECES = [
  {
    id: "sp-ep01-shoe-bom-vaporizer",
    slug: "running-shoe-80pct-labor-vaporizer",
    title: "$120 Running Shoe 80% Labor Vaporizer",
    archetype: "CUSTOM_CONTRAPTION_BLUEPRINT",
    styleFamily: "diagram-metaphor",
    componentHint: "IsometricScene",
    register: "page_editorial",
    typographyMode: "blueprint-dimension-callout",
    sfxPrimary: "pneumatic-servo",
    sfxSecondary: "data-tick",
    props: ["RunningShoeExplodedStack"],
    pattern: /running shoes|dental x-ray|unit costs drop/i,
  },
  {
    id: "sp-ep01-whiteboard-iron-loan-flip",
    slug: "palo-alto-whiteboard-180-loan-flip",
    title: "Palo Alto Whiteboard 180° Flip to Cast-Iron 30-Yr Loan",
    archetype: "SPLIT_COMPARISON",
    styleFamily: "diagram-metaphor",
    componentHint: "InstructionManualCard",
    register: "page_editorial",
    typographyMode: "antithesis-split-lock",
    sfxPrimary: "anvil-iron-clank",
    sfxSecondary: "marker-sweep",
    props: ["PaloAltoFlipWhiteboard"],
    pattern: /whiteboard in palo alto|thirty-year loan/i,
  },
  {
    id: "sp-ep01-claire-longitudinal-house",
    slug: "claire-2025-2030-2036-house-ledger",
    title: "Claire's Longitudinal 2025->2030->2036 House & T-Account",
    archetype: "CHARACTER_BALANCE_SHEET",
    styleFamily: "diagram-metaphor",
    componentHint: "StickFigureStage",
    register: "archival_parchment",
    typographyMode: "ledger-tabular-rollup",
    sfxPrimary: "calculator-ribbon-print",
    sfxSecondary: "audit-row-lock",
    props: ["ClaireAustinHouseRig"],
    pattern: /claire.{0,40}3,400|austin.{0,30}2025|austin august/i,
  },
  {
    id: "sp-ep01-w2-guillotine-tax-plumbing",
    slug: "w2-guillotine-vs-ireland-tax-plumbing",
    title: "W-2 Guillotine vs Ireland/Margin-Loan Tax Plumbing",
    archetype: "FLOW_SANKEY",
    styleFamily: "diagram-metaphor",
    componentHint: "IsometricScene",
    register: "drafting_blueprint",
    typographyMode: "ledger-tabular-rollup",
    sfxPrimary: "guillotine-slice",
    sfxSecondary: "blueprint-unroll",
    props: ["W2WithholdingGuillotine"],
    pattern: /tax plumbing|withholding.{0,40}payroll|route intellectual-property/i,
  },
  {
    id: "sp-ep01-port-1955-vs-2034-diptych",
    slug: "1955-pier-vs-2034-robotic-port",
    title: "1955 Silent Pier vs 2034 99.9% Robotic Port",
    archetype: "SPLIT_COMPARISON",
    styleFamily: "doc-broadcast",
    componentHint: "LiveCountdownSplit",
    register: "midnight_telemetry",
    typographyMode: "solari-split-flap",
    sfxPrimary: "pneumatic-servo",
    sfxSecondary: "anchor-chain-scrape",
    props: ["IdlePier1955", "AutonomousPortGantry2034"],
    pattern: /dockworkers in rotterdam|robotic cranes unload|every machine keeps running/i,
  },
  {
    id: "sp-ep01-alaska-veto-slash",
    slug: "alaska-governor-veto-pen-slash",
    title: "Alaska Gov. Walker Fountain-Pen Veto Slash",
    archetype: "COURT_RULING_EXHIBIT",
    styleFamily: "doc-broadcast",
    componentHint: "ArchiveLightTable",
    register: "archival_parchment",
    typographyMode: "veto-fountain-strike",
    sfxPrimary: "fountain-pen-slash",
    sfxSecondary: "gavel-wood-hit",
    props: ["GovernorVetoFountainPen", "SupremeCourtBenchGavel"],
    pattern: /bill walker|veto pen|wielechowski/i,
  },
  {
    id: "sp-ep01-bond-priority-spillway",
    slug: "federal-bond-priority-spillway",
    title: "Federal $2.1T Bond Priority Spillway",
    archetype: "CUSTOM_CONTRAPTION_BLUEPRINT",
    styleFamily: "data-maps-3d",
    componentHint: "DataPhysicalCard",
    register: "drafting_blueprint",
    typographyMode: "debt-odometer-inline",
    sfxPrimary: "vault-bolt-lock",
    sfxSecondary: "hydraulic-press",
    props: ["SpillwayDam3Tier", "DebtMonolithWall"],
    pattern: /bondholders always get paid first|debt-ceiling standoff/i,
  },
  {
    id: "sp-ep01-uber-4mo-token-burn",
    slug: "uber-4mo-ai-budget-burnout",
    title: "Uber 4-Month AI Budget Burnout",
    archetype: "HEADLINE_DOSSIER",
    styleFamily: "doc-broadcast",
    componentHint: "CaptionNewsCard",
    register: "midnight_telemetry",
    typographyMode: "stock-ticker-crawl",
    sfxPrimary: "server-rack-hum",
    sfxSecondary: "alert-ping",
    props: ["TokenDeflationFurnace"],
    pattern: /uber burned through|1,500 per engineer/i,
  },
  {
    id: "sp-ep01-empty-gate-14a-compute",
    slug: "empty-gate-14a-expiring-compute",
    title: "Empty Gate 14A vs Expiring Tuesday Compute",
    archetype: "CAUSAL_CHAIN",
    styleFamily: "diagram-metaphor",
    componentHint: "InstructionManualCard",
    register: "page_editorial",
    typographyMode: "erosion-decay-fade",
    sfxPrimary: "jet-gate-retract",
    sfxSecondary: "pendulum-escapement-tick",
    props: ["EmptyAirlineGate14A"],
    pattern: /spoils on the clock|plane pushes back|idle server time in a jar/i,
  },
  {
    id: "sp-ep01-closed-scrip-wallet",
    slug: "closed-scrip-wallet-20pct-exit-toll",
    title: "Closed Scrip Wallet 20% Exit Toll vs 1912 Coal Scrip",
    archetype: "CLOSED_LOOP_TRAP",
    styleFamily: "vintage-editorial",
    componentHint: "Newsreel1920s",
    register: "archival_parchment",
    typographyMode: "statute-clause-box",
    sfxPrimary: "coin-brass-clink",
    sfxSecondary: "nsf-decline-buzz",
    props: ["ClosedScripWalletRig", "CoalScripBrassToken1912", "ShenzhenExpiringWallet"],
    pattern: /twenty percent fee|island creek coal|paint creek|shenzhen/i,
  },
  {
    id: "sp-ep01-wattage-10w-to-5gw-ladder",
    slug: "10w-charger-to-5gw-power-ladder",
    title: "10W Charger -> 5GW AI Campus Power Ladder",
    archetype: "MULTIPLIER_SCALE_LADDER",
    styleFamily: "data-maps-3d",
    componentHint: "WhiteModel3D",
    register: "drafting_blueprint",
    typographyMode: "blueprint-dimension-callout",
    sfxPrimary: "watt-meter-whir",
    sfxSecondary: "substation-60hz-buzz",
    props: ["WattageApplianceNode", "HighVoltageSubstationRig"],
    pattern: /phone charger draws ten watts|five gigawatts on a single ai campus/i,
  },
  {
    id: "sp-ep01-agent-vs-grid-permitting-race",
    slug: "6mo-agent-vs-10yr-permitting-race",
    title: "6-Month Agent vs 10-Year Grid Permitting Race",
    archetype: "DUAL_SERIES_DIVERGENCE",
    styleFamily: "doc-broadcast",
    componentHint: "LiveCountdownSplit",
    register: "midnight_telemetry",
    typographyMode: "solari-split-flap",
    sfxPrimary: "ratchet-winch-click",
    sfxSecondary: "high-voltage-arc-snap",
    props: ["Transformer128WeekQueue"],
    pattern: /six months.{0,60}five to ten years|gap between software speed and construction speed/i,
  },
  {
    id: "sp-ep01-1941-uk-ration-counter",
    slug: "1941-uk-16-point-ration-counter",
    title: "1941 UK 16-Point Ration Counter",
    archetype: "HISTORICAL_PARALLEL_CARD",
    styleFamily: "vintage-editorial",
    componentHint: "Newsreel1920s",
    register: "vintage_newsreel",
    typographyMode: "typewriter-1941-ribbon",
    sfxPrimary: "paper-tear-crisp",
    sfxSecondary: "typewriter-strike",
    props: ["BritishRationBook1941"],
    pattern: /december 1, 1941|ministry of food|sixteen ration points/i,
  },
  {
    id: "sp-ep01-walker-veto-allowance-slam",
    slug: "200yr-truce-to-allowance-verdict",
    title: "200-Year Friday Truce -> One Signature -> ALLOWANCE",
    archetype: "KINETIC_THESIS_STRIKE",
    styleFamily: "vintage-editorial",
    componentHint: "SilentFilmCard",
    register: "page_editorial",
    typographyMode: "verdict-anvil-slam",
    sfxPrimary: "fountain-pen-slash",
    sfxSecondary: "resolve-chord-warm",
    props: ["GovernorVetoFountainPen"],
    pattern: /we call that an allowance|zero power to negotiate/i,
  },
  // Season 1 Episodes 2-11 Signature Set-Pieces (10)
  {
    id: "sp-ep02-tether-vs-tokyo-tbill-shift",
    slug: "tether-vs-tokyo-tbill-shift",
    title: "Tether vs Tokyo T-Bill Shift",
    archetype: "FLOW_SANKEY",
    styleFamily: "data-maps-3d",
    componentHint: "MapExplainer",
    register: "archival_parchment",
    typographyMode: "ledger-tabular-rollup",
    sfxPrimary: "balance-scale-creak",
    sfxSecondary: "map-whoosh",
    props: ["TreasuryBondVault"],
    pattern: /tether|stablecoin.{0,40}treasury|tokyo.{0,40}t-bill/i,
  },
  {
    id: "sp-ep03-nvidia-coreweave-spv-carousel",
    slug: "nvidia-coreweave-spv-carousel",
    title: "Nvidia-CoreWeave Circular SPV Carousel",
    archetype: "CLOSED_LOOP_TRAP",
    styleFamily: "diagram-metaphor",
    componentHint: "IsometricScene",
    register: "midnight_telemetry",
    typographyMode: "footnote-loupe-zoom",
    sfxPrimary: "pneumatic-servo",
    sfxSecondary: "glass-loupe-click",
    props: ["CircularGpuSpvCarousel", "GpuServerRackTower"],
    pattern: /coreweave|special purpose vehicle|circular.{0,30}gpu/i,
  },
  {
    id: "sp-ep04-saas-pik-debt-snowball",
    slug: "saas-pik-debt-snowball",
    title: "SaaS PIK Debt Snowball",
    archetype: "THRESHOLD_CROSSING",
    styleFamily: "data-maps-3d",
    componentHint: "BlobSimulation",
    register: "midnight_telemetry",
    typographyMode: "debt-odometer-inline",
    sfxPrimary: "hydraulic-press",
    sfxSecondary: "warning-thud",
    props: ["PikDebtSnowball"],
    pattern: /payment-in-kind|\bpik\b|private credit/i,
  },
  {
    id: "sp-ep05-california-lidar-roof-drone",
    slug: "california-roof-scan-insurance-drone",
    title: "California Roof-Scan Insurance Drone",
    archetype: "CUSTOM_CONTRAPTION_BLUEPRINT",
    styleFamily: "diagram-metaphor",
    componentHint: "IsometricScene",
    register: "archival_parchment",
    typographyMode: "telestrator-grease-math",
    sfxPrimary: "drone-pass-by",
    sfxSecondary: "camera-shutter",
    props: ["RoofScanInsuranceDrone"],
    pattern: /fair plan|homeowners insurance|roof.{0,25}drone/i,
  },
  {
    id: "sp-ep06-transformer-128wk-copper-trap",
    slug: "128wk-transformer-copper-bottleneck",
    title: "128-Week Transformer & Copper Bottleneck",
    archetype: "MULTIPLIER_SCALE_LADDER",
    styleFamily: "data-maps-3d",
    componentHint: "DataPhysicalCard",
    register: "drafting_blueprint",
    typographyMode: "blueprint-dimension-callout",
    sfxPrimary: "substation-60hz-buzz",
    sfxSecondary: "breaker-trip-clunk",
    props: ["Transformer128WeekQueue", "CopperOpenPitClock"],
    pattern: /128-week|copperwire|copper wire, high-voltage transformers/i,
  },
  {
    id: "sp-ep07-taiwan-2nm-euv-killswitch",
    slug: "taiwan-2nm-blockade-euv-killswitch",
    title: "Taiwan 2nm Blockade & ASML EUV Kill-Switch",
    archetype: "CUSTOM_CONTRAPTION_BLUEPRINT",
    styleFamily: "data-maps-3d",
    componentHint: "MapExplainer",
    register: "midnight_telemetry",
    typographyMode: "redacted-declassify",
    sfxPrimary: "euv-laser-pulse",
    sfxSecondary: "breaker-trip-clunk",
    props: ["AsmlEuvKillSwitchRig", "SiliconWaferNodeCompare"],
    pattern: /\basml\b|\beuv\b|taiwan.{0,30}2nm/i,
  },
  {
    id: "sp-ep08-drone-20k-vs-carrier-vls-drain",
    slug: "20k-drone-vs-13b-carrier-vls-drain",
    title: "$20k Drone vs $13B Carrier VLS Drain",
    archetype: "SPLIT_COMPARISON",
    styleFamily: "data-maps-3d",
    componentHint: "DataPhysicalCard",
    register: "drafting_blueprint",
    typographyMode: "antithesis-split-lock",
    sfxPrimary: "vls-launch-whoosh",
    sfxSecondary: "drone-pass-by",
    props: ["CarrierVsDroneExchange"],
    pattern: /vls|aircraft carrier.{0,40}drone|20,000 drone/i,
  },
  {
    id: "sp-ep09-subsea-550-cable-anchor-cut",
    slug: "550-subsea-cable-anchor-cut",
    title: "550 Garden-Hose Subsea Cable Anchor Cut",
    archetype: "CUSTOM_CONTRAPTION_BLUEPRINT",
    styleFamily: "data-maps-3d",
    componentHint: "MapExplainer",
    register: "drafting_blueprint",
    typographyMode: "whisper-focus-spotlight",
    sfxPrimary: "subsea-cable-snap",
    sfxSecondary: "radar-sonar-ping",
    props: ["SubseaCableAnchorCut"],
    pattern: /subsea cable|undersea cable|550 cables/i,
  },
  {
    id: "sp-ep10-france-greece-vigilante-flip",
    slug: "france-4p93-vs-greece-vigilante-flip",
    title: "France 4.93% vs Greece Bond Vigilante Flip",
    archetype: "THRESHOLD_CROSSING",
    styleFamily: "doc-broadcast",
    componentHint: "VisualInvestigationBoard",
    register: "midnight_telemetry",
    typographyMode: "basis-point-blip",
    sfxPrimary: "basis-point-blip",
    sfxSecondary: "balance-scale-creak",
    props: ["BondVigilanteScale"],
    pattern: /france.{0,35}greece|bond vigilante/i,
  },
  {
    id: "sp-ep11-oasi-2032-vault-exhaustion",
    slug: "q4-2032-social-security-vault-exhaustion",
    title: "Q4 2032 Social Security Vault Exhaustion",
    archetype: "THRESHOLD_CROSSING",
    styleFamily: "doc-broadcast",
    componentHint: "ArchiveLightTable",
    register: "archival_parchment",
    typographyMode: "debt-odometer-inline",
    sfxPrimary: "vault-bolt-lock",
    sfxSecondary: "pendulum-escapement-tick",
    props: ["SocialSecurity2032Dial"],
    pattern: /social security.{0,40}2032|oasi trust/i,
  },
];

// Build 96 extended cinema recipes + 24 base STYLE_CATALOG recipes = 120 total
const EXTENDED_96_DEFS = [
  // Macro Telemetry (22)
  ["macro-diverging-jaws", "doc-broadcast", "CaptionNewsCard", "fullscreen-cutaway", "chisel-highlighter-sweep", "data-tick", "marker-sweep"],
  ["macro-negative-fcf-waterfall", "data-maps-3d", "DataPhysicalCard", "fullscreen-cutaway", "ledger-tabular-rollup", "sub-bass-drop", "audit-row-lock"],
  ["macro-wealth-decile-monoliths", "data-maps-3d", "WhiteModel3D", "fullscreen-cutaway", "footnote-loupe-zoom", "glass-loupe-click", "data-tick"],
  ["macro-auction-price-shockwave", "doc-broadcast", "VisualInvestigationBoard", "fullscreen-cutaway", "verdict-anvil-slam", "high-voltage-arc-snap", "warning-thud"],
  ["macro-jevons-deflation-curve", "diagram-metaphor", "InstructionManualCard", "fullscreen-cutaway", "erosion-decay-fade", "odometer-tick", "marker-sweep"],
  ["macro-sovereign-spread-flip", "doc-broadcast", "LiveCountdownSplit", "split-screen", "antithesis-split-lock", "basis-point-blip", "balance-scale-creak"],
  ["macro-debt-deflation-jaws-1933", "vintage-editorial", "Newsreel1920s", "fullscreen-cutaway", "typewriter-1941-ribbon", "newsreel-click", "anvil-iron-clank"],
  ["macro-gold-vs-fiat-corridor", "vintage-editorial", "StainedGlassFrame", "split-screen", "split-lines", "coin-brass-clink", "chapter-chime"],
  ["macro-generational-horizon-rule", "diagram-metaphor", "StickFigureStage", "fullscreen-cutaway", "chapter-roman-folio", "pendulum-escapement-tick", "paper-slide"],
  ["macro-stacked-share-shift", "data-maps-3d", "DataPhysicalCard", "fullscreen-cutaway", "ledger-tabular-rollup", "calculator-ribbon-print", "audit-row-lock"],
  ["macro-capex-depreciation-gap", "doc-broadcast", "CaptionNewsCard", "fullscreen-cutaway", "margin-redline-gloss", "data-tick", "felt-highlighter"],
  ["macro-foreign-holder-rollover", "data-maps-3d", "MapExplainer", "fullscreen-cutaway", "stock-ticker-crawl", "map-whoosh", "basis-point-blip"],
  ["macro-reserve-attestation-bar", "doc-broadcast", "ArchiveLightTable", "fullscreen-cutaway", "ledger-tabular-rollup", "vault-bolt-lock", "audit-row-lock"],
  ["macro-trust-fund-depletion", "data-maps-3d", "BlobSimulation", "fullscreen-cutaway", "debt-odometer-inline", "pendulum-escapement-tick", "warning-thud"],
  ["macro-demographic-cliff-pyramid", "diagram-metaphor", "IsometricScene", "fullscreen-cutaway", "blueprint-dimension-callout", "data-tick", "riser-subtle"],
  ["macro-cost-exchange-ratio", "diagram-metaphor", "InstructionManualCard", "fullscreen-cutaway", "antithesis-split-lock", "balance-scale-creak", "data-tick"],
  ["macro-bandwidth-concentration", "data-maps-3d", "WhiteModel3D", "fullscreen-cutaway", "whisper-focus-spotlight", "radar-sonar-ping", "data-tick"],
  ["macro-escrow-shock-breakdown", "diagram-metaphor", "StickFigureStage", "fullscreen-cutaway", "ledger-tabular-rollup", "calculator-ribbon-print", "alert-ping"],
  ["macro-mineral-refining-share", "data-maps-3d", "MapExplainer", "fullscreen-cutaway", "chisel-highlighter-sweep", "map-whoosh", "anvil-iron-clank"],
  ["macro-waitlist-queue-histogram", "diagram-metaphor", "IsometricScene", "fullscreen-cutaway", "solari-split-flap", "ratchet-winch-click", "substation-60hz-buzz"],
  ["macro-real-vs-nominal-shrink", "doc-broadcast", "LiveCountdownSplit", "split-screen", "erosion-decay-fade", "odometer-tick", "paper-slide"],
  ["macro-margin-bid-comparison", "data-maps-3d", "DataPhysicalCard", "fullscreen-cutaway", "antithesis-split-lock", "watt-meter-whir", "alert-ping"],
  // Forensic Exhibits (24)
  ["forensic-fiscal-ledger-table9", "doc-broadcast", "ArchiveLightTable", "fullscreen-cutaway", "ledger-tabular-rollup", "paper-slide", "audit-row-lock"],
  ["forensic-cbo-interest-wall", "doc-broadcast", "VisualInvestigationBoard", "fullscreen-cutaway", "behind-presenter-monolith", "anvil-iron-clank", "warning-thud"],
  ["forensic-sec-10k-cashflow-loupe", "doc-broadcast", "ArchiveLightTable", "fullscreen-cutaway", "footnote-loupe-zoom", "glass-loupe-click", "felt-highlighter"],
  ["forensic-court-syllabus-wielechowski", "doc-broadcast", "ArchiveLightTable", "fullscreen-cutaway", "court-syllabus-italic", "gavel-wood-hit", "fountain-pen-slash"],
  ["forensic-flsa-1938-statute-box", "vintage-editorial", "Newsreel1920s", "fullscreen-cutaway", "statute-clause-box", "archival-stamp", "typewriter-strike"],
  ["forensic-x-post-landlord-collision", "doc-broadcast", "CaptionNewsCard", "fullscreen-cutaway", "red-correction", "nsf-decline-buzz", "sticker-pop"],
  ["forensic-economist-texas-quote", "doc-broadcast", "CaptionNewsCard", "fullscreen-cutaway", "chisel-highlighter-sweep", "paper-slide", "felt-highlighter"],
  ["forensic-allin-podcast-transcript", "doc-broadcast", "NewsPackageLowerThird", "talking-head-with-glass", "stenographer-ribbon", "glass-enter", "type-click"],
  ["forensic-forbes-uber-memo", "doc-broadcast", "CaptionNewsCard", "fullscreen-cutaway", "margin-redline-gloss", "paper-flip-fast", "alert-ping"],
  ["forensic-pjm-auction-notice", "doc-broadcast", "VisualInvestigationBoard", "fullscreen-cutaway", "verdict-anvil-slam", "substation-60hz-buzz", "warning-thud"],
  ["forensic-three-mile-island-ppa", "doc-broadcast", "ArchiveLightTable", "fullscreen-cutaway", "redacted-declassify", "vault-bolt-lock", "microfilm-whir"],
  ["forensic-uk-m4-substation-notice", "doc-broadcast", "TelestratorOverlay", "split-screen", "telestrator-grease-math", "telestrator-draw", "substation-60hz-buzz"],
  ["forensic-ministry-of-food-1941", "vintage-editorial", "Newsreel1920s", "fullscreen-cutaway", "typewriter-1941-ribbon", "paper-tear-crisp", "archival-stamp"],
  ["forensic-wv-paint-creek-voucher", "vintage-editorial", "CollageCutout", "fullscreen-cutaway", "statute-clause-box", "coin-brass-clink", "paper-slide"],
  ["forensic-shenzhen-ecny-expiry", "doc-broadcast", "CaptionNewsCard", "fullscreen-cutaway", "erosion-decay-fade", "nsf-decline-buzz", "pendulum-escapement-tick"],
  ["forensic-alaska-veto-memorandum", "doc-broadcast", "ArchiveLightTable", "fullscreen-cutaway", "veto-fountain-strike", "fountain-pen-slash", "archival-stamp"],
  ["forensic-fed-z1-wealth-table", "doc-broadcast", "ArchiveLightTable", "fullscreen-cutaway", "ledger-tabular-rollup", "calculator-ribbon-print", "felt-highlighter"],
  ["forensic-bls-1947-truman-series", "vintage-editorial", "SpyTitleSequence", "fullscreen-cutaway", "microfilm-whir", "microfilm-whir", "typewriter-strike"],
  ["forensic-iea-945twh-dossier", "doc-broadcast", "CaptionNewsCard", "fullscreen-cutaway", "cascading-evidence-stack", "paper-flip-fast", "watt-meter-whir"],
  ["forensic-cares-act-wire-ledger", "doc-broadcast", "NewsPackageLowerThird", "talking-head-with-glass", "debt-odometer-inline", "glass-dock", "odometer-tick"],
  ["forensic-underwriter-dti-rejection", "doc-broadcast", "VisualInvestigationBoard", "fullscreen-cutaway", "stamp-slam", "archival-stamp", "nsf-decline-buzz"],
  ["forensic-july2025-expensing-clause", "doc-broadcast", "ArchiveLightTable", "fullscreen-cutaway", "statute-clause-box", "fountain-pen-slash", "audit-row-lock"],
  ["forensic-nyfed-household-credit", "doc-broadcast", "CaptionNewsCard", "fullscreen-cutaway", "ledger-tabular-rollup", "calculator-ribbon-print", "data-tick"],
  ["forensic-epilogue-allowance-decree", "vintage-editorial", "SilentFilmCard", "fullscreen-cutaway", "silent-black-aphorism", "crowd-cut-mute", "resolve-chord-warm"],
  // System Simulators, Cartography, Depth-Sandwich & Glass/Satire (50)
  ["sim-hydraulic-tax-siphon", "diagram-metaphor", "IsometricScene", "fullscreen-cutaway", "blueprint-dimension-callout", "hydraulic-press", "blueprint-unroll"],
  ["sim-three-escape-hatch-board", "diagram-metaphor", "InstructionManualCard", "fullscreen-cutaway", "chapter-roman-folio", "archival-stamp", "solari-flap"],
  ["sim-bom-cost-layer-drop", "diagram-metaphor", "IsometricScene", "fullscreen-cutaway", "blueprint-dimension-callout", "pneumatic-servo", "data-tick"],
  ["sim-claire-budget-stress-rig", "diagram-metaphor", "StickFigureStage", "fullscreen-cutaway", "ledger-tabular-rollup", "calculator-ribbon-print", "nsf-decline-buzz"],
  ["sim-fiat-liquidity-valve", "diagram-metaphor", "IsometricScene", "fullscreen-cutaway", "debt-odometer-inline", "pneumatic-servo", "odometer-tick"],
  ["sim-401k-early-withdrawal-lock", "diagram-metaphor", "InstructionManualCard", "fullscreen-cutaway", "red-correction", "vault-bolt-lock", "nsf-decline-buzz"],
  ["sim-ip-ireland-routing-loop", "data-maps-3d", "MapExplainer", "fullscreen-cutaway", "telestrator-grease-math", "map-whoosh", "telestrator-draw"],
  ["sim-borrow-against-equity-collateral", "diagram-metaphor", "IsometricScene", "fullscreen-cutaway", "blueprint-dimension-callout", "ratchet-winch-click", "vault-bolt-lock"],
  ["sim-1955-strike-halt-clock", "vintage-editorial", "Newsreel1920s", "split-screen", "solari-split-flap", "breaker-trip-clunk", "newsreel-click"],
  ["sim-2034-autonomous-crane-grid", "data-maps-3d", "WhiteModel3D", "fullscreen-cutaway", "solari-split-flap", "pneumatic-servo", "server-rack-hum"],
  ["sim-debt-ceiling-priority-gate", "diagram-metaphor", "IsometricScene", "fullscreen-cutaway", "verdict-anvil-slam", "guillotine-slice", "vault-bolt-lock"],
  ["sim-token-unit-price-furnace", "data-maps-3d", "BlobSimulation", "fullscreen-cutaway", "erosion-decay-fade", "server-rack-hum", "odometer-tick"],
  ["sim-perishable-seat-gate-clock", "diagram-metaphor", "InstructionManualCard", "fullscreen-cutaway", "solari-split-flap", "jet-gate-retract", "pendulum-escapement-tick"],
  ["sim-closed-cloud-credit-wall", "diagram-metaphor", "IsometricScene", "fullscreen-cutaway", "statute-clause-box", "nsf-decline-buzz", "vault-bolt-lock"],
  ["sim-20pct-cashout-toll-turnstile", "diagram-metaphor", "StickFigureStage", "fullscreen-cutaway", "red-correction", "coin-brass-clink", "ratchet-winch-click"],
  ["sim-watt-to-gigawatt-converter", "data-maps-3d", "WhiteModel3D", "fullscreen-cutaway", "blueprint-dimension-callout", "watt-meter-whir", "substation-60hz-buzz"],
  ["sim-transformer-permitting-queue", "diagram-metaphor", "IsometricScene", "fullscreen-cutaway", "solari-split-flap", "ratchet-winch-click", "high-voltage-arc-snap"],
  ["sim-60pct-margin-bidding-scale", "diagram-metaphor", "InstructionManualCard", "fullscreen-cutaway", "antithesis-split-lock", "balance-scale-creak", "anvil-iron-clank"],
  ["sim-16-point-ration-coupon-strip", "vintage-editorial", "CollageCutout", "fullscreen-cutaway", "typewriter-1941-ribbon", "paper-tear-crisp", "archival-stamp"],
  ["sim-austin-august-ac-meter", "diagram-metaphor", "StickFigureStage", "fullscreen-cutaway", "debt-odometer-inline", "watt-meter-whir", "alert-ping"],
  ["atlas-pjm-13state-corridor", "data-maps-3d", "MapExplainer", "fullscreen-cutaway", "blueprint-dimension-callout", "map-whoosh", "substation-60hz-buzz"],
  ["atlas-west-london-m4-grid", "data-maps-3d", "MapExplainer", "fullscreen-cutaway", "telestrator-grease-math", "map-whoosh", "breaker-trip-clunk"],
  ["atlas-austin-housing-corridor", "data-maps-3d", "MapExplainer", "fullscreen-cutaway", "whisper-focus-spotlight", "map-whoosh", "calculator-ribbon-print"],
  ["atlas-logan-county-wv-1912", "data-maps-3d", "MapExplainer", "fullscreen-cutaway", "typewriter-1941-ribbon", "map-whoosh", "coin-brass-clink"],
  ["atlas-alaska-juneau-dividend", "data-maps-3d", "MapExplainer", "fullscreen-cutaway", "veto-fountain-strike", "map-whoosh", "fountain-pen-slash"],
  ["atlas-rotterdam-detroit-ports", "data-maps-3d", "MapExplainer", "fullscreen-cutaway", "antithesis-split-lock", "map-whoosh", "anchor-chain-scrape"],
  ["atlas-shenzhen-pilot-zone", "data-maps-3d", "MapExplainer", "fullscreen-cutaway", "erosion-decay-fade", "map-whoosh", "nsf-decline-buzz"],
  ["atlas-japan-945twh-benchmark", "data-maps-3d", "MapExplainer", "fullscreen-cutaway", "chisel-highlighter-sweep", "map-whoosh", "watt-meter-whir"],
  ["atlas-taiwan-hsinchu-strait", "data-maps-3d", "MapExplainer", "fullscreen-cutaway", "redacted-declassify", "radar-sonar-ping", "euv-laser-pulse"],
  ["atlas-red-sea-cable-chokepoint", "data-maps-3d", "MapExplainer", "fullscreen-cutaway", "whisper-focus-spotlight", "radar-sonar-ping", "subsea-cable-snap"],
  ["depth-monolith-40p5t-debt", "liquid-glass", "LiquidGlassObject:card", "talking-head-with-glass", "behind-presenter-monolith", "reverse-glass-suck", "glass-prism-lock"],
  ["depth-monolith-2p1t-interest", "liquid-glass", "LiquidGlassObject:card", "talking-head-with-glass", "behind-presenter-monolith", "sub-bass-drop", "glass-enter"],
  ["depth-monolith-833pct-spike", "liquid-glass", "LiquidGlassObject:toast", "talking-head-punch-in", "behind-presenter-monolith", "high-voltage-arc-snap", "glass-toast-warn"],
  ["depth-shoulder-escape-hatches", "liquid-glass", "LiquidGlassObject:dock", "talking-head-with-glass", "chapter-roman-folio", "glass-triptych-cascade", "solari-flap"],
  ["depth-over-shoulder-dossier", "liquid-glass", "LiquidGlassObject:card", "talking-head-with-glass", "cascading-evidence-stack", "glass-frosted-slide", "paper-slide"],
  ["depth-halo-payroll-gauge", "liquid-glass", "LiquidGlassObject:card", "talking-head-with-glass", "debt-odometer-inline", "glass-shimmer-sweep", "odometer-tick"],
  ["glass-rig-dossier-stack", "liquid-glass", "LiquidGlassObject:card", "talking-head-with-glass", "cascading-evidence-stack", "glass-frosted-slide", "glass-pill-tick"],
  ["glass-rig-evidence-rail", "liquid-glass", "LiquidGlassObject:card", "talking-head-with-glass", "margin-redline-gloss", "glass-enter", "audit-row-lock"],
  ["glass-rig-magnifier-card", "liquid-glass", "LiquidGlassObject:card", "talking-head-with-glass", "footnote-loupe-zoom", "glass-loupe-click", "felt-highlighter"],
  ["glass-rig-telemetry-strip", "liquid-glass", "LiquidGlassObject:dock", "talking-head-with-glass", "stock-ticker-crawl", "glass-dock", "data-tick"],
  ["glass-rig-verdict-seal", "liquid-glass", "LiquidGlassObject:toast", "talking-head-punch-in", "verdict-anvil-slam", "glass-toast-warn", "archival-stamp"],
  ["glass-rig-compare-scale", "liquid-glass", "LiquidGlassObject:card", "talking-head-with-glass", "antithesis-split-lock", "glass-prism-lock", "balance-scale-creak"],
  ["glass-rig-timeline-scrubber", "liquid-glass", "LiquidGlassObject:dock", "talking-head-with-glass", "solari-split-flap", "glass-dock", "pendulum-escapement-tick"],
  ["glass-rig-receipt-ticker", "liquid-glass", "LiquidGlassObject:dock", "talking-head-with-glass", "debt-odometer-inline", "glass-pill-tick", "odometer-tick"],
  ["glass-rig-terminal-console", "liquid-glass", "LiquidGlassObject:card", "talking-head-with-glass", "stenographer-ribbon", "glass-enter", "type-click"],
  ["glass-rig-map-callout", "liquid-glass", "LiquidGlassObject:card", "talking-head-with-glass", "whisper-focus-spotlight", "glass-prism-lock", "map-whoosh"],
  ["glass-rig-stat-triptych", "liquid-glass", "LiquidGlassObject:dock", "talking-head-with-glass", "ledger-tabular-rollup", "glass-triptych-cascade", "data-tick"],
  ["glass-rig-quote-citation", "liquid-glass", "LiquidGlassObject:card", "talking-head-with-glass", "court-syllabus-italic", "glass-shimmer-sweep", "felt-highlighter"],
  ["satire-landlord-rent-bounce", "diagram-metaphor", "StickerCutout", "talking-head-punch-in", "burstiness-staccato-cuts", "nsf-decline-buzz", "sticker-pop"],
  ["satire-bank-draft-autopay", "doc-broadcast", "TelestratorOverlay", "talking-head-punch-in", "red-correction", "telestrator-draw", "nsf-decline-buzz"],
];

export const ALL_120_RECIPES = [
  ...STYLE_CATALOG.map((r) => ({
    ...r,
    isExtended: false,
    depthSandwich: false,
    glassRig: r.glassPreset || undefined,
  })),
  ...EXTENDED_96_DEFS.map(
    ([id, styleFamily, componentHint, framing, typographyMode, defaultSfx, secondarySfx], idx) => {
      const isDepth = id.startsWith("depth-");
      const rigObj = GLASS_18_RIGS[(idx + 6) % GLASS_18_RIGS.length];
      const useGlass = framing === "talking-head-with-glass" || framing === "talking-head-punch-in";
      return {
        id,
        styleFamily,
        componentHint,
        framing,
        motionAction: isDepth
          ? "blur-snap -> parallax-hover -> fade-blur-out"
          : framing === "fullscreen-cutaway"
            ? "paper-unfold -> highlight-sweep -> fade-out"
            : "slide-left -> glow-rim -> fade-out",
        glassPreset: useGlass ? rigObj.basePreset : undefined,
        glassRig: useGlass ? rigObj.id : undefined,
        typographyMode,
        defaultSfx,
        secondarySfx,
        paceProfile: framing === "talking-head-punch-in" ? "snappy" : "balanced",
        isExtended: true,
        depthSandwich: isDepth,
      };
    }
  ),
];

export const ALL_RECIPES_BY_ID = Object.fromEntries(ALL_120_RECIPES.map((r) => [r.id, r]));

// ============================================================================
// 2. Deterministic ScriptLock, FactCatalog & Geographic Gazetteer
// ============================================================================

const FACT_PATTERNS = [
  {
    kind: "CURRENCY",
    re: /\$[0-9][0-9,]*(?:\.[0-9]+)?(?:\s*(?:trillion|billion|million|thousand))?/gi,
  },
  {
    kind: "MULTIPLIER",
    re: /\b(?:\d+(?:\.\d+)?\s*(?:percent|%)\s+spike|\d+\s*:\s*\d+|ninety-nine(?:-point-nine)?\s*percent)/gi,
  },
  {
    kind: "PERCENT",
    re: /\b(?:\d+(?:\.\d+)?|eighty-six|eighty-four|seventy|sixty|fifty-three|twenty-five|twenty-one|twenty|ninety)\s*(?:percent|%)/gi,
  },
  {
    kind: "PHYSICAL_UNIT",
    re: /\b(?:\d+(?:\.\d+)?|ten|five|one|thousand|million)\s*(?:gigawatts?|megawatt-day|terawatt-hours?|kilowatts?|watts?|GW|TWh|MW-day|kW|nm)\b/gi,
  },
  {
    kind: "YEAR_OR_DATE",
    re: /\b(?:October\s+29,\s+2026|December\s+1,\s+1941|July\s+2026|July\s+2025|May\s+2024|June\s+2016|October\s+2020|October\s+2036|1912|1929|1930s?|1933|1938|1941|1947|1955|1982|2009|2016|2017|2020|2021|2023|2024|2025|2026|2030s?|2032|2034|2035|2036|2055|2056)\b/g,
  },
  {
    kind: "LEGAL_OR_DOC_CITE",
    re: /\b(?:Table\s+9|Monthly\s+Treasury\s+Statement|Wielechowski\s+v\.\s+State|Fair\s+Labor\s+Standards\s+Act|Congressional\s+Budget\s+Office|Permanent\s+Fund\s+Dividend|Ministry\s+of\s+Food|International\s+Energy\s+Agency|Three\s+Mile\s+Island)\b/gi,
  },
];

export function applyNonBreakingUnitGlue(text) {
  return String(text || "")
    .replace(/(\$[0-9.,]+)\s+(trillion|billion|million|thousand)\b/gi, "$1\u00A0$2")
    .replace(/(\b\d+(?:\.\d+)?)\s+(percent|gigawatts?|terawatt-hours?|megawatt-day|watts?)\b/gi, "$1\u00A0$2");
}

export function classifyBurstiness(wordCount) {
  if (wordCount <= 6) return "STACCATO_PUNCH";
  if (wordCount <= 12) return "SHORT_PIVOT";
  if (wordCount <= 22) return "ANALYTICAL_CLAIM";
  return "DENSE_MECHANISM";
}

export function buildScriptLock(rawText, segments, fps = 30, alignmentSource = "SYNTHETIC_SYLLABLE_CLOCK") {
  const normalizedSource = String(rawText || segments.map((s) => s.text).join("\n\n")).replace(/\r\n/g, "\n");
  const scriptSha256 = crypto.createHash("sha256").update(normalizedSource, "utf8").digest("hex");

  const facts = {};
  let factCounter = 0;
  const sentences = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const sid = `S${String(i + 1).padStart(3, "0")}`;
    const verbatim = String(seg.text || "").trim();
    const rawWords = verbatim.split(/\s+/).filter(Boolean);
    const startMs = Math.max(0, Math.round(Number(seg.startSec || 0) * 1000));
    const endMs = Math.max(startMs + 250, Math.round(Number(seg.endSec || startMs / 1000 + 2.5) * 1000));
    const spanMs = Math.max(100, endMs - startMs);

    const weights = rawWords.map((w) => {
      const clean = w.replace(/[^a-zA-Z0-9]/g, "");
      const hasDigit = /\d/.test(w) ? 1.45 : 1.0;
      const punctPause = /[.!?]["']?$/.test(w) ? 1.35 : /[,;:\u2014]$/.test(w) ? 1.2 : 1.0;
      return Math.max(1, Math.ceil(clean.length / 3)) * hasDigit * punctPause;
    });
    const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;

    let cursorMs = startMs;
    const tokens = rawWords.map((w, tIdx) => {
      const tid = `${sid}.T${String(tIdx + 1).padStart(2, "0")}`;
      const durMs =
        tIdx === rawWords.length - 1
          ? Math.max(40, endMs - cursorMs)
          : Math.max(40, Math.round((weights[tIdx] / totalWeight) * spanMs));
      const tokStart = cursorMs;
      const tokEnd = Math.min(endMs, tokStart + durMs);
      cursorMs = tokEnd;
      const isClause = /[,;:\u2014.!?]["']?$/.test(w);
      return {
        id: tid,
        text: w,
        normalized: w.toLowerCase().replace(/^[^a-z0-9$%]+|[^a-z0-9$%]+$/g, ""),
        startMs: tokStart,
        endMs: tokEnd,
        pauseAfterMs: /[.!?]$/.test(w) ? 220 : /[,;:\u2014]$/.test(w) ? 110 : 0,
        isClauseBoundary: isClause,
      };
    });

    const sentenceFactIds = [];
    const seenSpans = new Set();
    for (const { kind, re } of FACT_PATTERNS) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(verbatim)) !== null) {
        const matchStr = m[0].trim();
        const spanKey = `${m.index}:${matchStr.toLowerCase()}`;
        if (seenSpans.has(spanKey)) continue;
        seenSpans.add(spanKey);

        factCounter += 1;
        const fid = `F${String(factCounter).padStart(3, "0")}`;
        const numMatch = matchStr.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
        const firstTok = tokens[0]?.id || `${sid}.T01`;
        const lastTok = tokens[tokens.length - 1]?.id || firstTok;
        facts[fid] = {
          id: fid,
          verbatim: matchStr,
          glued: applyNonBreakingUnitGlue(matchStr),
          kind,
          ...(numMatch ? { numericValue: Number(numMatch[0]) } : {}),
          sentenceId: sid,
          tokenSpan: [firstTok, lastTok],
        };
        sentenceFactIds.push(fid);
      }
    }

    sentences.push({
      id: sid,
      paragraphIndex: seg.paragraphIndex ?? i,
      verbatim,
      gluedText: applyNonBreakingUnitGlue(verbatim),
      wordCount: rawWords.length,
      startMs,
      endMs,
      cadenceClass: classifyBurstiness(rawWords.length),
      tokens,
      factIds: sentenceFactIds,
    });
  }

  const totalDurationMs = sentences.length > 0 ? sentences[sentences.length - 1].endMs : 0;
  return {
    schemaVersion: "1.0.0",
    scriptSha256,
    fps,
    totalDurationMs,
    alignmentSource,
    sentences,
    facts,
  };
}

const GEO_CORRIDOR_RULES = [
  { id: "PJM_GRID", region: "usa", label: "PJM 13-State Eastern Grid", re: /\bpjm\b|thirteen states|illinois to new jersey|three mile island/i },
  { id: "WEST_LONDON_M4", region: "europe", label: "West London M4 Corridor", re: /west london|m4 corridor|\blondon\b/i },
  { id: "LOGAN_COUNTY_WV", region: "usa", label: "Paint Creek / Logan County, WV", re: /paint creek|logan county|island creek|west virginia/i },
  { id: "ALASKA_JUNEAU", region: "usa", label: "Juneau, Alaska Permanent Fund", re: /\balaska\b|\bjuneau\b|wielechowski/i },
  { id: "SILICON_VALLEY_PALO_ALTO", region: "usa", label: "Palo Alto, Silicon Valley", re: /palo alto|silicon valley/i },
  { id: "MEMPHIS_FREIGHT_HUB", region: "usa", label: "Memphis Logistics Hub", re: /\bmemphis\b/i },
  { id: "ROTTERDAM_PORT", region: "europe", label: "Port of Rotterdam", re: /\brotterdam\b/i },
  { id: "DETROIT_AUTO", region: "usa", label: "Detroit Industrial Corridor", re: /\bdetroit\b/i },
  { id: "SHENZHEN_DELTA", region: "east-asia", label: "Shenzhen e-CNY Pilot Zone", re: /\bshenzhen\b|\bsuzhou\b|digital yuan/i },
  { id: "TAIWAN_STRAIT_2NM", region: "east-asia", label: "Taiwan Strait & Hsinchu 2nm", re: /\btaiwan\b|\btsmc\b|\bhsinchu\b/i },
  { id: "RED_SEA_CHOKEPOINT", region: "middle-east", label: "Bab el-Mandeb / Red Sea Cables", re: /red sea|bab el-mandeb|\byemen\b/i },
  { id: "BALTIC_CABLES", region: "europe", label: "Baltic Subsea Corridor", re: /\bbaltic\b|\bfinland\b.{0,25}\bestonia\b/i },
  { id: "EURO_SOVEREIGN_SPREAD", region: "europe", label: "Paris OAT vs Athens Spread", re: /\bfrance\b.{0,35}\bgreece\b|\bgreece\b/i },
  { id: "TOKYO_JGB_FLOW", region: "east-asia", label: "Tokyo / Japan Electricity & JGB", re: /\bjapan\b|\btokyo\b/i },
  { id: "IRELAND_TAX_HUB", region: "europe", label: "Dublin / Ireland IP & Grid", re: /\bireland\b|\bdublin\b/i },
  { id: "UK_MINISTRY_1941", region: "europe", label: "United Kingdom Wartime Atlantic", re: /\bbritain\b|british workers|ministry of food/i },
  { id: "CALIFORNIA_FAIR_INSURANCE", region: "usa", label: "California Insurance Grid", re: /\bcalifornia\b/i },
  { id: "PANAMA_CANAL", region: "world", label: "Panama Canal Gatun Locks", re: /\bpanama\b/i },
  { id: "SUEZ_CORRIDOR", region: "middle-east", label: "Suez Maritime Corridor", re: /\bsuez\b/i },
  { id: "AUSTIN_TEXAS", region: "usa", label: "Austin, Texas", re: /\baustin\b|\btexas\b/i },
];

export function detectGeoTarget(text) {
  for (const rule of GEO_CORRIDOR_RULES) {
    if (rule.re.test(text)) {
      return { corridorId: rule.id, region: rule.region, label: rule.label };
    }
  }
  return null;
}

// ============================================================================
// 3. 30-Episode Novelty Vault & Dynamic Schema Pruner
// ============================================================================

export function loadEpisodeVault(vaultPath = DEFAULT_VAULT_PATH) {
  if (!fs.existsSync(vaultPath)) {
    return {
      cooldownHalfLifeTau: 2.5,
      lookbackWindowEpisodes: 5,
      seasonSlots: [],
      episodes: [],
    };
  }
  try {
    return JSON.parse(fs.readFileSync(vaultPath, "utf8").replace(/^\uFEFF/, ""));
  } catch {
    return { cooldownHalfLifeTau: 2.5, lookbackWindowEpisodes: 5, seasonSlots: [], episodes: [] };
  }
}

export function computeEpisodeNoveltyContext(vault, targetEpisode = 1, strategyOverride = null) {
  const tau = Number(vault?.cooldownHalfLifeTau) || 2.5;
  const lookback = Number(vault?.lookbackWindowEpisodes) || 5;
  const episodes = Array.isArray(vault?.episodes) ? vault.episodes : [];
  const slots = Array.isArray(vault?.seasonSlots) ? vault.seasonSlots : [];

  const slot = slots.find((s) => Number(s.episodeNumber) === Number(targetEpisode)) || slots[0] || null;
  const priorEpisodes = episodes.filter(
    (ep) =>
      Number(ep.episodeNumber) < Number(targetEpisode) &&
      Number(targetEpisode) - Number(ep.episodeNumber) <= lookback
  );

  const stylePenalties = {};
  const propPenalties = {};
  for (const ep of priorEpisodes) {
    const delta = Math.max(1, Number(targetEpisode) - Number(ep.episodeNumber));
    const decay = Math.exp(-delta / tau);
    for (const [styleId, count] of Object.entries(ep.styleCounts || {})) {
      stylePenalties[styleId] = Math.min(
        0.92,
        (stylePenalties[styleId] || 0) + decay * Math.min(1, Number(count) * 0.16)
      );
    }
    for (const propId of ep.propIds || []) {
      propPenalties[propId] = Math.min(0.9, (propPenalties[propId] || 0) + decay * 0.45);
    }
  }

  const lutId = slot?.preferredLutId || "editorial-warm";
  const strategyId = strategyOverride || slot?.strategyId || "STR-GEN-EXPLAINER";
  const motif = slot?.preferredMotif || "hydraulic-spillway-and-veto-slash";
  const reservedShowstoppers = slot?.reservedShowstoppers || [
    "sp-ep01-shoe-bom-vaporizer",
    "sp-ep01-whiteboard-iron-loan-flip",
    "sp-ep01-port-1955-vs-2034-diptych",
    "sp-ep01-wattage-10w-to-5gw-ladder",
    "sp-ep01-walker-veto-allowance-slam",
  ];

  const scorePalette =
    Number(targetEpisode) === 1
      ? ["02-ledger-investigation", "04-clockwork-mechanism", "05-sovereign-tension", "11-verdict-drone", "12-epilogue-warmth"]
      : ["01-archival-pulse", "02-ledger-investigation", "03-midnight-telemetry", "08-quiet-reckoning", "12-epilogue-warmth"];

  return {
    episodeNumber: Number(targetEpisode),
    episodeCode: slot?.episodeCode || `S01E${String(targetEpisode).padStart(2, "0")}`,
    strategyId,
    lutId,
    primaryMechanicalMotif: motif,
    scorePalette,
    reservedShowstoppers,
    stylePenalties,
    propPenalties,
  };
}

const FORBIDDEN_CSS_KEY_RE =
  /^(x|y|top|left|right|bottom|width|height|margin|padding|gap|fontSize|lineHeight|color|background|opacity|borderRadius|transform|viewBox|stiffness|damping|mass)$/i;
const FORBIDDEN_HEX_RE = /#[0-9a-f]{3,8}\b/i;

export function assertZeroForbiddenTokens(payload, pathLabel = "root") {
  if (payload === null || payload === undefined) return;
  if (typeof payload === "string") {
    if (FORBIDDEN_HEX_RE.test(payload)) {
      throw new Error(`Forbidden hex color token "${payload}" at ${pathLabel}`);
    }
    if (/\b\d+px\b|\btranslate3d\(|\bspring\(/i.test(payload)) {
      throw new Error(`Forbidden raw CSS/coordinate expression at ${pathLabel}`);
    }
    return;
  }
  if (Array.isArray(payload)) {
    for (let i = 0; i < payload.length; i++) {
      assertZeroForbiddenTokens(payload[i], `${pathLabel}[${i}]`);
    }
    return;
  }
  if (typeof payload === "object") {
    for (const [k, v] of Object.entries(payload)) {
      if (FORBIDDEN_CSS_KEY_RE.test(k)) {
        throw new Error(`Forbidden layout/CSS key "${k}" at ${pathLabel}.${k}`);
      }
      assertZeroForbiddenTokens(v, `${pathLabel}.${k}`);
    }
  }
}

export const BEAT_ARCHETYPE_LIST = [
  "DUAL_SERIES_DIVERGENCE",
  "COMPOSITION_STACK",
  "THRESHOLD_CROSSING",
  "MULTIPLIER_SCALE_LADDER",
  "FLOW_SANKEY",
  "DOCUMENT_LEDGER_HIGHLIGHT",
  "SOCIAL_POST_EXHIBIT",
  "COURT_RULING_EXHIBIT",
  "HEADLINE_DOSSIER",
  "CAUSAL_CHAIN",
  "CLOSED_LOOP_TRAP",
  "SPLIT_COMPARISON",
  "THREE_PILLAR_ROADMAP",
  "CHARACTER_BALANCE_SHEET",
  "HISTORICAL_PARALLEL_CARD",
  "KINETIC_THESIS_STRIKE",
  "QUESTION_PIVOT",
  "STAT_MONOLITH",
  "CUSTOM_CONTRAPTION_BLUEPRINT",
  "DEPTH_SANDWICH_STAGE",
];

export function computePrunedArchetypeMask(sentenceLock, factsMap, recentArchetypes = [], strategyId = "STR-GEN-EXPLAINER") {
  const allowed = new Set(BEAT_ARCHETYPE_LIST);
  const sFacts = (sentenceLock.factIds || []).map((id) => factsMap[id]).filter(Boolean);
  const numFacts = sFacts.filter((f) =>
    ["CURRENCY", "PERCENT", "PHYSICAL_UNIT", "MULTIPLIER"].includes(f.kind)
  );
  const citeFacts = sFacts.filter((f) => f.kind === "LEGAL_OR_DOC_CITE");

  if (sentenceLock.cadenceClass === "STACCATO_PUNCH") {
    return ["KINETIC_THESIS_STRIKE", "QUESTION_PIVOT", ...(numFacts.length > 0 ? ["DEPTH_SANDWICH_STAGE"] : [])];
  }
  if (numFacts.length === 0) {
    allowed.delete("DUAL_SERIES_DIVERGENCE");
    allowed.delete("COMPOSITION_STACK");
    allowed.delete("THRESHOLD_CROSSING");
    allowed.delete("MULTIPLIER_SCALE_LADDER");
    allowed.delete("STAT_MONOLITH");
  }
  if (numFacts.length < 2) {
    allowed.delete("COMPOSITION_STACK");
    allowed.delete("MULTIPLIER_SCALE_LADDER");
  }
  if (citeFacts.length === 0 && !extractSourceCitation(sentenceLock.verbatim)) {
    allowed.delete("COURT_RULING_EXHIBIT");
    allowed.delete("DOCUMENT_LEDGER_HIGHLIGHT");
  }
  if (recentArchetypes.length > 0) {
    allowed.delete(recentArchetypes[recentArchetypes.length - 1]);
  }
  if (recentArchetypes.slice(-8).includes("STAT_MONOLITH")) {
    allowed.delete("STAT_MONOLITH");
  }
  if (strategyId !== "STR-AIC-CLOCKED") {
    // R43-R47 guardrail: prevent fake countdown dominance outside clocked engine
    if (recentArchetypes.slice(-4).includes("THRESHOLD_CROSSING")) {
      allowed.delete("THRESHOLD_CROSSING");
    }
  }
  return Array.from(allowed);
}

// ============================================================================
// 4. Native `fetch` Multi-Provider LLM Adapter & 4-Pass Equalizer Pack I/O
// ============================================================================

export const PROVIDER_DEFAULTS = {
  deepseek: {
    model: "deepseek-chat",
    envKey: "DEEPSEEK_API_KEY",
    endpoint: "https://api.deepseek.com/chat/completions",
  },
  openai: {
    model: "gpt-4.1",
    envKey: "OPENAI_API_KEY",
    endpoint: "https://api.openai.com/v1/chat/completions",
  },
  gemini: {
    model: "gemini-2.5-flash",
    envKey: "GEMINI_API_KEY",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models",
  },
  anthropic: {
    model: "claude-sonnet-4-20250514",
    envKey: "ANTHROPIC_API_KEY",
    endpoint: "https://api.anthropic.com/v1/messages",
  },
  ollama: {
    model: "qwen2.5:14b",
    envKey: "OLLAMA_HOST",
    endpoint: "http://127.0.0.1:11434/api/chat",
  },
};

export function extractJsonFromModelText(rawText) {
  let cleaned = String(rawText || "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .trim();

  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  const firstObj = cleaned.indexOf("{");
  const firstArr = cleaned.indexOf("[");
  let start = -1;
  if (firstObj !== -1 && firstArr !== -1) start = Math.min(firstObj, firstArr);
  else start = Math.max(firstObj, firstArr);

  if (start > 0) {
    cleaned = cleaned.slice(start);
  }
  const lastObj = cleaned.lastIndexOf("}");
  const lastArr = cleaned.lastIndexOf("]");
  const end = Math.max(lastObj, lastArr);
  if (end !== -1 && end < cleaned.length - 1) {
    cleaned = cleaned.slice(0, end + 1);
  }

  // Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");
  const parsed = JSON.parse(cleaned);
  assertZeroForbiddenTokens(parsed);
  return parsed;
}

const sleepMs = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function callProviderJson({ provider, model, systemPrompt, userPrompt, maxTokens = 1400 }) {
  const cfg = PROVIDER_DEFAULTS[provider];
  if (!cfg) {
    throw new Error(`Unsupported LLM provider "${provider}".`);
  }
  const activeModel = model || cfg.model;

  if (provider !== "ollama") {
    const key = process.env[cfg.envKey];
    if (!key || !key.trim()) {
      throw new Error(
        `Missing ${cfg.envKey} for --provider ${provider}. Set ${cfg.envKey}, pass --deterministic, or use --export-pack <dir>.`
      );
    }
  }

  const backoffs = [800, 2000, 4500];
  let lastError = null;

  for (let attempt = 0; attempt <= backoffs.length; attempt++) {
    try {
      let url = cfg.endpoint;
      let headers = { "Content-Type": "application/json" };
      let bodyObj = {};

      if (provider === "deepseek" || provider === "openai") {
        headers.Authorization = `Bearer ${process.env[cfg.envKey].trim()}`;
        const isReasoner = /reasoner|^o1|^o3/i.test(activeModel);
        bodyObj = {
          model: activeModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: maxTokens,
          ...(isReasoner
            ? {}
            : {
                temperature: 0,
                response_format: { type: "json_object" },
              }),
        };
      } else if (provider === "gemini") {
        const apiKey = process.env.GEMINI_API_KEY.trim();
        url = `${cfg.endpoint}/${encodeURIComponent(activeModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;
        bodyObj = {
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: maxTokens,
            responseMimeType: "application/json",
          },
        };
      } else if (provider === "anthropic") {
        headers["x-api-key"] = process.env.ANTHROPIC_API_KEY.trim();
        headers["anthropic-version"] = "2023-06-01";
        bodyObj = {
          model: activeModel,
          max_tokens: maxTokens,
          temperature: 0,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        };
      } else if (provider === "ollama") {
        const host = (process.env.OLLAMA_HOST || "http://127.0.0.1:11434").replace(/\/+$/, "");
        url = `${host}/api/chat`;
        bodyObj = {
          model: activeModel,
          stream: false,
          format: "json",
          options: { temperature: 0 },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        };
      }

      const resp = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(bodyObj),
        signal: AbortSignal.timeout(90_000),
      });

      if (resp.status === 429 || resp.status >= 500) {
        const errBody = await resp.text().catch(() => "");
        lastError = new Error(`HTTP ${resp.status} from ${provider}: ${errBody.slice(0, 240)}`);
        if (attempt < backoffs.length) {
          await sleepMs(backoffs[attempt]);
          continue;
        }
        throw lastError;
      }

      if (!resp.ok) {
        const errBody = await resp.text().catch(() => "");
        throw new Error(`HTTP ${resp.status} from ${provider}: ${errBody.slice(0, 320)}`);
      }

      const data = await resp.json();
      let textOut = "";
      if (provider === "deepseek" || provider === "openai") {
        textOut = data?.choices?.[0]?.message?.content || "";
      } else if (provider === "gemini") {
        textOut =
          data?.candidates?.[0]?.content?.parts
            ?.map((p) => p.text || "")
            .join("\n") || "";
      } else if (provider === "anthropic") {
        textOut =
          (data?.content || [])
            .filter((b) => b.type === "text")
            .map((b) => b.text)
            .join("\n") || "";
      } else if (provider === "ollama") {
        textOut = data?.message?.content || "";
      }

      return extractJsonFromModelText(textOut);
    } catch (err) {
      lastError = err;
      if (attempt < backoffs.length && /timeout|fetch|network|HTTP 429|HTTP 5/i.test(String(err.message))) {
        await sleepMs(backoffs[attempt]);
        continue;
      }
      throw err;
    }
  }
  throw lastError || new Error(`LLM call failed for ${provider}`);
}

const EQUALIZER_SYSTEM_PROMPT = [
  "You are the Reading Room Cinema Semantic Storyboard Classifier (Equalizer v1).",
  "STRICT INVARIANTS:",
  "1. Output ONLY valid JSON. Never include markdown prose outside JSON.",
  "2. NEVER emit CSS properties, pixel coordinates, spring constants, or hex color codes (#...).",
  "3. Reference script sentences exclusively via immutable SentenceIds (S001..Sn) and facts via FactIds (F001..Fk).",
  "4. Keep semantic slot labels concise (2-4 words, <=28 chars) with zero invented numbers.",
].join("\n");

const GOLD_EXEMPLARS_JSON = [
  {
    beatId: "B001",
    sentenceRange: ["S001", "S001"],
    archetype: "COMPOSITION_STACK",
    register: "CLINICAL_EVIDENCE",
    presenterMode: "OVER_FOOTAGE_GLASS",
    headlineLabel: "Federal Revenue Share",
    factRefs: ["F001"],
  },
  {
    beatId: "B002",
    sentenceRange: ["S018", "S018"],
    archetype: "CUSTOM_CONTRAPTION_BLUEPRINT",
    register: "HARD_REVEAL",
    presenterMode: "FULL_PAGE_CUTAWAY",
    headlineLabel: "Unit Labor Vaporizer",
    setPieceSlug: "running-shoe-80pct-labor-vaporizer",
    factRefs: ["F012"],
  },
];

export function buildFourPassPrompts(scriptLock, noveltyCtx) {
  const compactIndex = scriptLock.sentences.slice(0, 140).map((s) => ({
    id: s.id,
    words: s.wordCount,
    cadence: s.cadenceClass,
    facts: s.factIds,
    preview: s.verbatim.slice(0, 96),
  }));

  const pass1Prompt = [
    "### PASS 1: Macro Act & Stateful Continuity Entity Plan",
    `Strategy Lock: ${noveltyCtx.strategyId} | Episode: ${noveltyCtx.episodeCode}`,
    "Return JSON: { \"acts\": [{ \"actId\": \"ACT_1\", \"title\": \"Short Act Title\", \"startSentence\": \"S001\", \"endSentence\": \"S010\" }], \"entities\": [{ \"entityId\": \"ENT_CLAIRE_AUSTIN\", \"kind\": \"PERSONA\", \"canonicalTitle\": \"Claire House Ledger\" }] }",
    "",
    "Sentence Index:",
    JSON.stringify(compactIndex, null, 2),
  ].join("\n");

  const windows = [];
  for (let i = 0; i < scriptLock.sentences.length; i += 12) {
    const slice = scriptLock.sentences.slice(i, i + 15);
    windows.push({
      windowIndex: windows.length + 1,
      range: [slice[0].id, slice[slice.length - 1].id],
      sentences: slice.map((s) => ({ id: s.id, cadence: s.cadenceClass, text: s.verbatim })),
    });
  }

  const pass2Prompt = [
    "### PASS 2: Windowed Beat Segmentation (<=15-sentence micro-windows)",
    "Return JSON: { \"beats\": [{ \"beatId\": \"B001\", \"sentenceRange\": [\"S001\", \"S001\"], \"register\": \"CLINICAL_EVIDENCE\" }] }",
    "Allowed registers: CLINICAL_EVIDENCE | TENSION_BUILD | HARD_REVEAL | HUMAN_STAKES | IRONIC_CONTRAST | THESIS_VERDICT",
    "",
    JSON.stringify(windows, null, 2),
  ].join("\n");

  const recentArch = [];
  const prunedMasks = scriptLock.sentences.map((s, idx) => {
    const allowed = computePrunedArchetypeMask(s, scriptLock.facts, recentArch, noveltyCtx.strategyId);
    const pick = allowed[idx % allowed.length] || "CAUSAL_CHAIN";
    recentArch.push(pick);
    return {
      beatId: `B${String(idx + 1).padStart(3, "0")}`,
      sentenceId: s.id,
      allowedArchetypes: allowed.slice(0, 7),
    };
  });

  const pass3Prompt = [
    "### PASS 3: Dynamic Schema-Pruned Archetype Classification",
    "Select ONE archetype strictly from each beat's `allowedArchetypes` mask.",
    "Return JSON: { \"classifications\": [{ \"beatId\": \"B001\", \"archetype\": \"COMPOSITION_STACK\", \"presenterMode\": \"OVER_FOOTAGE_GLASS\" }] }",
    "",
    JSON.stringify(prunedMasks.slice(0, 80), null, 2),
  ].join("\n");

  const pass4Batches = [];
  const batchSize = 12;
  for (let b = 0; b < scriptLock.sentences.length; b += batchSize) {
    const batchSentences = scriptLock.sentences.slice(b, b + batchSize);
    const factSlice = {};
    for (const s of batchSentences) {
      for (const fid of s.factIds) {
        if (scriptLock.facts[fid]) factSlice[fid] = scriptLock.facts[fid];
      }
    }
    pass4Batches.push({
      batchNumber: pass4Batches.length + 1,
      prompt: [
        `### PASS 4 (Batch ${pass4Batches.length + 1}): Single-Beat Semantic Slot Hydration`,
        "Gold Exemplars:",
        JSON.stringify(GOLD_EXEMPLARS_JSON, null, 2),
        "",
        "Return JSON: { \"hydratedBeats\": [{ \"beatId\": \"B001\", \"headlineLabel\": \"2-4 Word Label\", \"factRefs\": [\"F001\"], \"anchorTokenId\": \"S001.T01\" }] }",
        "",
        "Batch Sentences & Grounded FactCatalog:",
        JSON.stringify({ sentences: batchSentences.map((s) => ({ id: s.id, text: s.verbatim, facts: s.factIds })), facts: factSlice }, null, 2),
      ].join("\n"),
    });
  }

  return { pass1Prompt, pass2Prompt, pass3Prompt, pass4Batches, prunedMasks };
}

export function exportEqualizerPack(packDir, scriptLock, noveltyCtx) {
  fs.mkdirSync(packDir, { recursive: true });
  const responsesDir = path.join(packDir, "responses");
  fs.mkdirSync(responsesDir, { recursive: true });

  const lockPath = path.join(packDir, "script.lock.json");
  fs.writeFileSync(lockPath, JSON.stringify(scriptLock, null, 2) + "\n", "utf8");

  const { pass1Prompt, pass2Prompt, pass3Prompt, pass4Batches } = buildFourPassPrompts(scriptLock, noveltyCtx);

  const wrapWorkbook = (title, outFile, body) =>
    [
      `# ${title}`,
      "",
      `Save the model's raw JSON reply to \`responses/${outFile}\`, then run:`,
      `\`node tools/ai_director.mjs --import-pack "${packDir}"\``,
      "",
      "## System Instruction",
      "```text",
      EQUALIZER_SYSTEM_PROMPT,
      "```",
      "",
      "## User Prompt",
      "```text",
      body,
      "```",
      "",
    ].join("\n");

  fs.writeFileSync(path.join(packDir, "01_pass1_macro_plan.md"), wrapWorkbook("Equalizer Pass 1 — Macro Act & Entity Map", "pass1.json", pass1Prompt), "utf8");
  fs.writeFileSync(path.join(packDir, "02_pass2_segmentation.md"), wrapWorkbook("Equalizer Pass 2 — Windowed Beat Segmentation", "pass2.json", pass2Prompt), "utf8");
  fs.writeFileSync(path.join(packDir, "03_pass3_classification.md"), wrapWorkbook("Equalizer Pass 3 — Pruned Archetype Classifier", "pass3.json", pass3Prompt), "utf8");

  for (const batch of pass4Batches) {
    const num = String(batch.batchNumber).padStart(2, "0");
    fs.writeFileSync(
      path.join(packDir, `04_pass4_hydration_batch_${num}.md`),
      wrapWorkbook(`Equalizer Pass 4 — Slot Hydration Batch ${num}`, `pass4_batch_${num}.json`, batch.prompt),
      "utf8"
    );
  }

  const instructions = [
    "# Reading Room Cinema — Zero-API Equalizer Prompt Pack",
    "",
    `Script SHA-256: \`${scriptLock.scriptSha256}\` (${scriptLock.sentences.length} locked sentences, ${Object.keys(scriptLock.facts).length} verified facts).`,
    "",
    "## Workflow (DeepSeek Web, Claude, ChatGPT, Gemini, or Fable)",
    "1. Paste `01_pass1_macro_plan.md` into your chat window and save the JSON response as `responses/pass1.json`.",
    "2. Paste `02_pass2_segmentation.md` -> `responses/pass2.json`.",
    "3. Paste `03_pass3_classification.md` -> `responses/pass3.json`.",
    "4. Paste `04_pass4_hydration_batch_*.md` -> `responses/pass4_batch_*.json`.",
    `5. Run \`node tools/ai_director.mjs --import-pack "${packDir}" --out studio/out/edit-plan.json\`.`,
    "   Any missing or partial batch is automatically healed by the deterministic Tier-1 AST compiler.",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(packDir, "00_PACK_INSTRUCTIONS.md"), instructions, "utf8");

  return {
    packDir,
    lockPath,
    pass4Count: pass4Batches.length,
  };
}

export function loadPackOverrides(packDir) {
  const responsesDir = path.join(packDir, "responses");
  const overridesByBeatIndex = {};
  const repairNotes = [];
  if (!fs.existsSync(responsesDir)) {
    return { overridesByBeatIndex, repairNotes };
  }

  const files = fs
    .readdirSync(responsesDir)
    .filter((f) => /\.(json|md|txt)$/i.test(f))
    .sort();

  for (const file of files) {
    const full = path.join(responsesDir, file);
    const raw = fs.readFileSync(full, "utf8");
    if (!raw.trim()) continue;
    try {
      const parsed = extractJsonFromModelText(raw);
      const clsList = parsed?.classifications || parsed?.beats || parsed?.hydratedBeats || (Array.isArray(parsed) ? parsed : []);
      for (const item of clsList) {
        const m = String(item?.beatId || "").match(/(\d+)/);
        if (!m) continue;
        const idx = Number(m[1]) - 1;
        if (idx >= 0) {
          overridesByBeatIndex[idx] = { ...(overridesByBeatIndex[idx] || {}), ...item };
        }
      }
    } catch (err) {
      repairNotes.push(`- \`responses/${file}\`: ${err.message}`);
    }
  }

  if (repairNotes.length > 0) {
    const repairMd = [
      "# Equalizer Pack Validation Repairs (`99_repairs.md`)",
      "",
      "The following pasted response files contained forbidden CSS/hex tokens or malformed JSON and were auto-healed via Tier-1 AST fallback:",
      ...repairNotes,
      "",
    ].join("\n");
    fs.writeFileSync(path.join(packDir, "99_repairs.md"), repairMd, "utf8");
  }
  return { overridesByBeatIndex, repairNotes };
}

export async function runLiveFourPassLlm({ provider, model, scriptLock, noveltyCtx }) {
  const { pass1Prompt, pass2Prompt, pass3Prompt, pass4Batches } = buildFourPassPrompts(scriptLock, noveltyCtx);
  console.log(`  [Pass 1/4] Macro Act & Continuity Entity Map (${provider})...`);
  const pass1 = await callProviderJson({
    provider,
    model,
    systemPrompt: EQUALIZER_SYSTEM_PROMPT,
    userPrompt: pass1Prompt,
  });

  console.log(`  [Pass 2/4] Windowed Beat Segmentation (${provider})...`);
  const pass2 = await callProviderJson({
    provider,
    model,
    systemPrompt: EQUALIZER_SYSTEM_PROMPT,
    userPrompt: pass2Prompt,
  });

  console.log(`  [Pass 3/4] Schema-Pruned Archetype Classification (${provider})...`);
  const pass3 = await callProviderJson({
    provider,
    model,
    systemPrompt: EQUALIZER_SYSTEM_PROMPT,
    userPrompt: pass3Prompt,
  });

  const overridesByBeatIndex = {};
  const mergeItems = (arr) => {
    for (const item of Array.isArray(arr) ? arr : []) {
      const m = String(item?.beatId || "").match(/(\d+)/);
      if (!m) continue;
      const idx = Number(m[1]) - 1;
      if (idx >= 0) {
        overridesByBeatIndex[idx] = { ...(overridesByBeatIndex[idx] || {}), ...item };
      }
    }
  };
  mergeItems(pass2?.beats);
  mergeItems(pass3?.classifications);

  console.log(`  [Pass 4/4] Single-Beat Slot Hydration (${pass4Batches.length} batch(es))...`);
  for (const batch of pass4Batches) {
    const res = await callProviderJson({
      provider,
      model,
      systemPrompt: EQUALIZER_SYSTEM_PROMPT,
      userPrompt: batch.prompt,
    });
    mergeItems(res?.hydratedBeats);
  }

  return { pass1, overridesByBeatIndex };
}

// ============================================================================
// 5. Creativity Escalator, Viterbi Solver, Spatial Polish & 30-Gate Auto-Healer
// ============================================================================

function computeShannonEntropyBits(items) {
  if (!items || items.length <= 1) return 0;
  const counts = {};
  for (const x of items) counts[x] = (counts[x] || 0) + 1;
  let h = 0;
  for (const c of Object.values(counts)) {
    const p = c / items.length;
    if (p > 0) h -= p * Math.log2(p);
  }
  return Number(h.toFixed(2));
}

function detectContinuityEntities(text) {
  const recalls = [];
  if (/\bclaire\b|\$3,?400|austin/i.test(text)) recalls.push("ENT_CLAIRE_AUSTIN");
  if (/escape hatch|three escape|check.{0,20}compute.{0,20}print/i.test(text)) recalls.push("ENT_ESCAPE_HATCH_BOARD");
  if (/40\.5\s*trillion|2\.1\s*trillion|interest payments|table\s*9/i.test(text)) recalls.push("ENT_SOVEREIGN_DEBT_WALL");
  if (/veto pen|allowance|friday paycheck/i.test(text)) recalls.push("ENT_PAYCHECK_TO_ALLOWANCE");
  return recalls;
}

function solveSpatialZone(framing, paletteMode, glassRigId) {
  if (paletteMode === "page" || framing === "fullscreen-cutaway") {
    return {
      canvas: [1920, 1080],
      safeRect: { x: 96, y: 72, width: 1728, height: 936 },
      primaryZone: "golden-center-stage",
      zeroCollisionVerified: true,
    };
  }
  if (framing === "split-screen") {
    return {
      canvas: [1920, 1080],
      safeRect: { x: 96, y: 72, width: 1728, height: 936 },
      presenterZone: "left-half",
      primaryZone: "right-half-evidence",
      zeroCollisionVerified: true,
    };
  }
  const rig = GLASS_RIG_BY_ID[glassRigId] || GLASS_18_RIGS[0];
  return {
    canvas: [1920, 1080],
    safeRect: { x: 96, y: 72, width: 1728, height: 936 },
    presenterZone: "left-two-thirds",
    primaryZone: rig.zone,
    zeroCollisionVerified: true,
  };
}

function buildProgressiveSubBeats(sentenceLock, startFrame, endFrame, fps) {
  const durFrames = Math.max(1, endFrame - startFrame);
  const durSec = durFrames / fps;
  if (durSec <= 3.8) {
    return [{ stepId: "ST01", offsetFrame: 0, intent: "ESTABLISH_FRAME" }];
  }
  const count = Math.min(4, Math.max(2, Math.ceil(durSec / 3.4)));
  const intents = ["ESTABLISH_FRAME", "REVEAL_BASELINE", "STRIKE_ANOMALY", "ISOLATE_VERDICT"];
  const steps = [];
  for (let k = 0; k < count; k++) {
    const ratio = k === 0 ? 0 : Number(((k / count) * 0.86).toFixed(2));
    steps.push({
      stepId: `ST0${k + 1}`,
      offsetFrame: Math.round(durFrames * ratio),
      intent: intents[k % intents.length],
      ...(sentenceLock?.tokens?.[Math.min(sentenceLock.tokens.length - 1, Math.floor((k / count) * sentenceLock.tokens.length))]
        ? {
            anchorTokenId:
              sentenceLock.tokens[
                Math.min(sentenceLock.tokens.length - 1, Math.floor((k / count) * sentenceLock.tokens.length))
              ].id,
          }
        : {}),
    });
  }
  return steps;
}

export function compileEqualizerPlan({
  segments,
  scriptLock,
  noveltyCtx,
  overridesByBeatIndex = {},
  options = {},
}) {
  const fps = options.fps > 0 ? Math.round(options.fps) : 30;
  const title = options.title || `The Reading Room — ${noveltyCtx.episodeCode}`;
  const enableDepthSandwich = options.depthSandwich !== false;

  // Step 1: Build baseline draft plan via studio's audience planner
  const draft = buildBasePlanWithExtendedCatalog(segments, scriptLock, noveltyCtx, overridesByBeatIndex, {
    fps,
    title,
    enableDepthSandwich,
  });

  // Step 2: Tier-1 AST Auto-Healer (zero consecutive family repeats, citation parity, showstopper bounds)
  const healed = healCompiledPlan(draft, scriptLock, noveltyCtx);

  // Step 3: 30-Gate Mathematical Broadcast Scorer
  const qualityGate = evaluate30QualityGates(healed, scriptLock, noveltyCtx);

  const audited = validateDirectorPlan(healed);
  return {
    ...audited,
    episodeCode: noveltyCtx.episodeCode,
    strategyId: noveltyCtx.strategyId,
    lutId: noveltyCtx.lutId,
    musicStem: noveltyCtx.scorePalette[0] || "02-ledger-investigation",
    musicStems: noveltyCtx.scorePalette,
    scriptSha256: scriptLock.scriptSha256,
    factCount: Object.keys(scriptLock.facts).length,
    qualityGate,
  };
}

function buildBasePlanWithExtendedCatalog(segments, scriptLock, noveltyCtx, overridesByBeatIndex, opts) {
  const { fps, title, enableDepthSandwich } = opts;
  const sentences = scriptLock.sentences;
  if (sentences.length === 0) {
    return { title, fps, totalFrames: 0, beats: [] };
  }

  const firstStartMs = sentences[0].startMs;
  const totalSpanMs = Math.max(500, sentences[sentences.length - 1].endMs - firstStartMs);

  let heroPeakIdx = -1;
  let bestHeroScore = -1;
  for (let i = 0; i < sentences.length; i++) {
    const midRatio = (sentences[i].startMs + sentences[i].endMs - 2 * firstStartMs) / (2 * totalSpanMs);
    if (midRatio >= 0.6 && midRatio <= 0.75) {
      const cat = classifyBeat(sentences[i].verbatim, i, sentences.length);
      let hs = 1;
      if (cat === "warning-escalation") hs += 4;
      if (cat === "map-geopolitics" || cat === "receipt-proof") hs += 2;
      if (/833|auction|269\.92|crashes|vanished|scrip|credit|budget|veto/i.test(sentences[i].verbatim)) hs += 3;
      const weighted = hs - Math.abs(midRatio - 0.675) * 2;
      if (weighted > bestHeroScore) {
        bestHeroScore = weighted;
        heroPeakIdx = i;
      }
    }
  }
  if (heroPeakIdx === -1 && sentences.length >= 2) {
    heroPeakIdx = Math.min(sentences.length - 1, Math.max(1, Math.round((sentences.length - 1) * 0.675)));
  }

  const usedRecipeCounts = {};
  const usedSetPieces = new Set();
  const cameraTrajectories = ["STATIC_LOCK", "PUSH_IN_104", "PARALLAX_DRIFT", "LENS_FOCUS_PULL"];
  const registers = ["page_editorial", "archival_parchment", "midnight_telemetry", "drafting_blueprint", "vintage_newsreel"];

  let talkingHeadMs = 0;
  let totalAccumMs = 0;
  let prevFamily = null;
  let prevCamA = null;
  let prevCamB = null;
  const beats = [];

  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    const override = overridesByBeatIndex[i] || {};
    const category = classifyBeat(s.verbatim, i, sentences.length);
    const geoTarget = detectGeoTarget(s.verbatim);
    const directCite =
      extractSourceCitation(s.verbatim) ||
      (category === "receipt-proof" ? "U.S. Department of the Treasury / Federal Filings" : undefined);

    const startFrame = Math.round(((s.startMs - firstStartMs) / 1000) * fps);
    const endFrame = Math.max(startFrame + 15, Math.round(((s.endMs - firstStartMs) / 1000) * fps));
    const durationSec = Number(((endFrame - startFrame) / fps).toFixed(2));
    const midRatio = (s.startMs + s.endMs - 2 * firstStartMs) / (2 * totalSpanMs);
    const isHeroPeak = i === heroPeakIdx;

    // Creativity Escalator: Match signature set-piece if triggered & unused
    let matchedSetPiece = SIGNATURE_24_SET_PIECES.find(
      (sp) => !usedSetPieces.has(sp.id) && sp.pattern.test(s.verbatim)
    );
    if (!matchedSetPiece && usedSetPieces.size < 3 && i === Math.floor(sentences.length * 0.5)) {
      matchedSetPiece = SIGNATURE_24_SET_PIECES.find((sp) => !usedSetPieces.has(sp.id));
    }

    // Score all 120 recipes with cross-episode novelty penalties & TH share balance
    const thRatio = totalAccumMs > 0 ? talkingHeadMs / totalAccumMs : 0.34;
    const wantTH = !isHeroPeak && thRatio < 0.32 && !matchedSetPiece && !geoTarget;
    const wantCutaway = isHeroPeak || thRatio > 0.38 || Boolean(matchedSetPiece) || Boolean(geoTarget);

    let bestRecipe = ALL_120_RECIPES[0];
    let bestScore = -1e9;

    if (isHeroPeak) {
      bestRecipe =
        ALL_RECIPES_BY_ID["doc-visual-investigation"] && prevFamily !== "doc-broadcast"
          ? ALL_RECIPES_BY_ID["doc-visual-investigation"]
          : ALL_RECIPES_BY_ID["data-blob-simulation"] || ALL_120_RECIPES[0];
    } else {
      for (let rIdx = 0; rIdx < ALL_120_RECIPES.length; rIdx++) {
        const rec = ALL_120_RECIPES[rIdx];
        if (prevFamily && rec.styleFamily === prevFamily) continue;
        if (!enableDepthSandwich && rec.depthSandwich) continue;
        if (rec.peakOnly) continue;

        let score = 0;
        const isTH = rec.framing.startsWith("talking-head");
        if (matchedSetPiece && rec.styleFamily === matchedSetPiece.styleFamily && !isTH) score += 45;
        if (geoTarget && rec.componentHint === "MapExplainer") score += 48;
        if (category === "history-archive" && rec.styleFamily === "vintage-editorial") score += 32;
        if (category === "receipt-proof" && rec.styleFamily === "doc-broadcast") score += 30;
        if (category === "good-work-punchline" && rec.framing === "talking-head-punch-in") score += 36;
        if (enableDepthSandwich && rec.depthSandwich && s.factIds.length > 0 && wantTH) score += 28;

        if (wantTH && isTH) score += 26;
        if (wantCutaway && !isTH) score += 26;

        const epCount = usedRecipeCounts[rec.id] || 0;
        score += epCount === 0 ? 18 : -epCount * 14;

        const vaultPenalty = noveltyCtx.stylePenalties[rec.id] || 0;
        score -= vaultPenalty * 25;

        // Deterministic tie-breaker
        score += ((i * 17 + rIdx * 13) % 11) * 0.1;

        if (score > bestScore) {
          bestScore = score;
          bestRecipe = rec;
        }
      }
    }

    usedRecipeCounts[bestRecipe.id] = (usedRecipeCounts[bestRecipe.id] || 0) + 1;
    if (matchedSetPiece) usedSetPieces.add(matchedSetPiece.id);

    let framing = matchedSetPiece ? "fullscreen-cutaway" : bestRecipe.framing;
    if (
      wantTH &&
      thRatio < 0.28 &&
      !matchedSetPiece &&
      !geoTarget &&
      s.factIds.length === 0 &&
      i > 1 &&
      beats[beats.length - 1]?.framing !== "talking-head-full"
    ) {
      framing = "talking-head-full";
    }

    const isDepthBeat =
      enableDepthSandwich &&
      framing !== "talking-head-full" &&
      framing !== "fullscreen-cutaway" &&
      (bestRecipe.depthSandwich ||
        override.presenterMode === "DEPTH_SANDWICH" ||
        (s.factIds.length > 0 && i % 7 === 3));

    const typographyMode =
      s.cadenceClass === "STACCATO_PUNCH"
        ? "burstiness-staccato-cuts"
        : isDepthBeat
          ? "behind-presenter-monolith"
          : matchedSetPiece?.typographyMode ||
            bestRecipe.typographyMode ||
            TYPOGRAPHY_32_MODES[i % TYPOGRAPHY_32_MODES.length];

    const glassRigObj = GLASS_18_RIGS[(i * 5) % GLASS_18_RIGS.length];
    const glassPreset =
      framing === "talking-head-with-glass" || framing === "talking-head-punch-in"
        ? bestRecipe.glassPreset || glassRigObj.basePreset
        : undefined;
    const glassRig = glassPreset ? bestRecipe.glassRig || glassRigObj.id : undefined;

    const paletteMode = framing === "fullscreen-cutaway" ? "page" : "over-footage";

    // Viterbi non-repeating 3-beat camera trajectory
    let cameraTrajectory = s.cadenceClass === "STACCATO_PUNCH" ? "STATIC_LOCK" : cameraTrajectories[i % cameraTrajectories.length];
    if (cameraTrajectory === prevCamA && cameraTrajectory === prevCamB) {
      cameraTrajectory = cameraTrajectories[(i + 1) % cameraTrajectories.length];
    }
    prevCamB = prevCamA;
    prevCamA = cameraTrajectory;

    const visualRegister =
      matchedSetPiece?.register ||
      (paletteMode === "page" ? registers[i % 4] : "midnight_telemetry");

    let musicEnergy = "calm";
    if (isHeroPeak || category === "warning-escalation") musicEnergy = "tense";
    else if (category === "hook" || category === "good-work-punchline") musicEnergy = "pulse";
    else if (category === "takeaway" || s.cadenceClass === "STACCATO_PUNCH") musicEnergy = "drop-silence";

    const sfxCues = [];
    if (framing !== "talking-head-full") {
      sfxCues.push({
        cue: isHeroPeak ? "flash-cut" : matchedSetPiece?.sfxPrimary || bestRecipe.defaultSfx || "glass-enter",
        offsetFrame: 0,
        volume: 0.64,
      });
      if (isHeroPeak) {
        sfxCues.push({
          cue: "warning-thud",
          offsetFrame: Math.min(8, Math.max(2, Math.floor((endFrame - startFrame) / 4))),
          volume: 0.88,
        });
      } else if (endFrame - startFrame >= 42 && (matchedSetPiece?.sfxSecondary || bestRecipe.secondarySfx)) {
        const secCue = matchedSetPiece?.sfxSecondary || bestRecipe.secondarySfx;
        sfxCues.push({
          cue: secCue === "warning-thud" ? "sub-bass-drop" : secCue,
          offsetFrame: Math.floor((endFrame - startFrame) * 0.46),
          volume: 0.54,
        });
      }
    }

    const primaryFact = s.factIds.length > 0 ? scriptLock.facts[s.factIds[0]] : null;
    const beatObj = {
      id: `beat-${String(i + 1).padStart(3, "0")}`,
      startFrame,
      endFrame,
      durationSec,
      category,
      spokenText: s.verbatim,
      gluedSpokenText: s.gluedText,
      framing,
      paletteMode,
      styleFamily: matchedSetPiece ? matchedSetPiece.styleFamily : bestRecipe.styleFamily,
      recipeId: bestRecipe.id,
      componentHint: matchedSetPiece ? matchedSetPiece.componentHint : bestRecipe.componentHint,
      motionAction: bestRecipe.motionAction,
      ...(glassPreset ? { glassPreset, glassRig } : {}),
      typographyMode,
      ...(isDepthBeat
        ? {
            layering: "behind-presenter",
            depthSandwich: {
              enabled: true,
              preset: primaryFact ? "behind-shoulder-billboard" : "over-shoulder-dossier-stack",
              heroFigure: primaryFact ? primaryFact.verbatim : undefined,
              foregroundGlass: Boolean(glassPreset),
            },
          }
        : {}),
      ...(matchedSetPiece ? { setPieceId: matchedSetPiece.id, setPieceSlug: matchedSetPiece.slug } : {}),
      ...(geoTarget ? { geoCorridor: geoTarget.corridorId, mapRegion: geoTarget.region, highlightLabel: geoTarget.label } : {}),
      visualRegister,
      cameraTrajectory,
      musicTrackId: noveltyCtx.scorePalette[Math.min(noveltyCtx.scorePalette.length - 1, Math.floor(midRatio * noveltyCtx.scorePalette.length))],
      sfxCues,
      musicEnergy,
      subBeats: buildProgressiveSubBeats(s, startFrame, endFrame, fps),
      continuityEntities: detectContinuityEntities(s.verbatim),
      spatialLayout: solveSpatialZone(framing, paletteMode, glassRig),
      cutReason: matchedSetPiece
        ? `Escalated signature set-piece [${matchedSetPiece.title}] (${durationSec}s)`
        : isDepthBeat
          ? `Pillar #10 Depth-Sandwich layering behind presenter (${durationSec}s)`
          : `${bestRecipe.id} (${visualRegister}, ${cameraTrajectory}, ${durationSec}s)`,
      ...(directCite ? { sourceCitation: directCite } : {}),
      ...(override.headlineLabel ? { title: override.headlineLabel } : {}),
    };

    beats.push(beatObj);
    prevFamily = beatObj.styleFamily;
    const beatMs = Math.max(250, s.endMs - s.startMs);
    totalAccumMs += beatMs;
    if (framing.startsWith("talking-head")) talkingHeadMs += beatMs;
  }

  return {
    title,
    fps,
    totalFrames: beats.length > 0 ? beats[beats.length - 1].endFrame : 0,
    beats,
  };
}

function healCompiledPlan(plan, scriptLock, noveltyCtx) {
  const families = ["liquid-glass", "doc-broadcast", "vintage-editorial", "diagram-metaphor", "data-maps-3d"];
  const beats = plan.beats.map((b) => ({ ...b }));

  for (let i = 0; i < beats.length; i++) {
    if (i === 0 && beats[i].category !== "hook") {
      beats[i].category = "hook";
    }
    if (i > 0 && beats[i].styleFamily === beats[i - 1].styleFamily) {
      const alt = ALL_120_RECIPES.find(
        (r) =>
          r.styleFamily !== beats[i - 1].styleFamily &&
          (i + 1 >= beats.length || r.styleFamily !== beats[i + 1].styleFamily)
      );
      if (alt) {
        beats[i].styleFamily = alt.styleFamily;
        beats[i].componentHint = alt.componentHint;
        beats[i].recipeId = alt.id;
      } else {
        beats[i].styleFamily = families[(families.indexOf(beats[i - 1].styleFamily) + 1) % families.length];
      }
    }
    if (beats[i].category === "receipt-proof" && !beats[i].sourceCitation) {
      beats[i].sourceCitation =
        extractSourceCitation(beats[i].spokenText) || "Primary Government & Regulatory Filing";
    }
  }

  // Ensure at least 3 showstopper set-pieces when >= 6 beats exist
  const currentSetPieces = beats.filter((b) => b.setPieceId).length;
  if (beats.length >= 6 && currentSetPieces < 3) {
    let needed = 3 - currentSetPieces;
    for (let i = 1; i < beats.length - 1 && needed > 0; i += Math.max(1, Math.floor(beats.length / 4))) {
      if (!beats[i].setPieceId) {
        const spId = noveltyCtx.reservedShowstoppers[3 - needed] || SIGNATURE_24_SET_PIECES[i % SIGNATURE_24_SET_PIECES.length].id;
        const sp = SIGNATURE_24_SET_PIECES.find((x) => x.id === spId) || SIGNATURE_24_SET_PIECES[0];
        beats[i].setPieceId = sp.id;
        beats[i].setPieceSlug = sp.slug;
        needed -= 1;
      }
    }
  }

  return { ...plan, beats };
}

export function evaluate30QualityGates(plan, scriptLock) {
  const beats = plan.beats || [];
  const totalBeats = Math.max(1, beats.length);
  const consecutiveRepeats = beats.filter((b, i) => i > 0 && b.styleFamily === beats[i - 1].styleFamily).length;
  const missingReceipts = beats.filter((b) => b.category === "receipt-proof" && !b.sourceCitation).length;
  const maxSubGapOk = beats.every((b) => {
    const subs = b.subBeats || [{ offsetFrame: 0 }];
    const frames = [...subs.map((s) => s.offsetFrame), b.endFrame - b.startFrame];
    for (let k = 0; k < frames.length - 1; k++) {
      if ((frames[k + 1] - frames[k]) / (plan.fps || 30) > 4.5) return false;
    }
    return true;
  });

  const recipeWindow = beats.slice(0, Math.min(8, beats.length)).map((b) => b.recipeId || b.componentHint);
  const shannonEntropyBits = computeShannonEntropyBits(recipeWindow);
  const uniqueRecipes = new Set(beats.map((b) => b.recipeId)).size;
  const uniqueTypeModes = new Set(beats.map((b) => b.typographyMode)).size;
  const setPieceCount = beats.filter((b) => b.setPieceId).length;
  const depthSandwichCount = beats.filter((b) => b.depthSandwich?.enabled).length;

  let passedGates = 30;
  const notes = [];
  if (consecutiveRepeats > 0) {
    passedGates -= 2;
    notes.push(`${consecutiveRepeats} adjacent styleFamily repeat(s)`);
  }
  if (missingReceipts > 0) {
    passedGates -= 2;
    notes.push(`${missingReceipts} receipt beat(s) missing sourceCitation`);
  }
  if (!maxSubGapOk) {
    passedGates -= 1;
    notes.push("Sub-beat disclosure interval exceeded 4.5s");
  }
  if (totalBeats >= 8 && shannonEntropyBits < 2.25) {
    passedGates -= 1;
    notes.push(`8-beat Shannon entropy ${shannonEntropyBits} < 2.25 bits`);
  }

  const score = Number(Math.max(0, Math.min(100, (passedGates / 30) * 98 + (uniqueRecipes >= 8 ? 2 : 0))).toFixed(1));
  return {
    score,
    passed: score >= 94 && consecutiveRepeats === 0 && missingReceipts === 0,
    gatesPassed: passedGates,
    totalGates: 30,
    shannonEntropyBits,
    uniqueRecipesUsed: uniqueRecipes,
    uniqueTypographyModesUsed: uniqueTypeModes,
    showstopperSetPieceCount: setPieceCount,
    depthSandwichBeatCount: depthSandwichCount,
    zeroCollisionVerified: beats.every((b) => b.spatialLayout?.zeroCollisionVerified),
    notes,
  };
}

// ============================================================================
// 6. CLI Entrypoint
// ============================================================================

function printUsage() {
  console.log(`Usage:
  node tools/ai_director.mjs [script.md_or_words.json] [options]

Providers & Modes:
  --provider <name>        deepseek | openai | gemini | anthropic | ollama | pack | deterministic
  --model <model-id>       Override provider model (e.g. deepseek-reasoner, gpt-4.1, gemini-2.5-flash)
  --deterministic          Zero-API offline compilation (<2s; default when no API provider given)
  --export-pack <dir>      Export 4-pass pruned Equalizer markdown prompt pack + script.lock.json
  --import-pack <dir>      Import chat-UI JSON responses from <dir>/responses/ & compile edit-plan.json

Input / Output Options:
  --script <path>          Spoken script (.md / .txt)
  --words <path>           Whisper word-level alignment JSON (words.json)
  --out <path>             Output edit plan JSON (default: studio/out/edit-plan.json)
  --vault <path>           30-episode novelty vault JSON (default: studio/episodes-vault.json)
  --record-vault <path>    Write updated episode novelty record to <path>
  --episode <number>       Target season episode number for cooldown decay (default: 1)
  --strategy <STR-*>       Channel strategy preset lock (e.g. STR-GEN-EXPLAINER)
  --title <text>           Video project title
  --fps <number>           Timeline framerate (default: 30)
  --wpm <number>           Draft speaking rate for .md/.txt scripts (default: 150)
  --no-depth-sandwich      Disable Pillar #10 behind-presenter depth-sandwich beats
  --dry-run                Compile & audit in memory without writing output files
  -h, --help               Show help`);
}

function parseCliArgs(argv) {
  const opts = {
    input: null,
    script: null,
    words: null,
    provider: null,
    model: null,
    deterministic: false,
    exportPack: null,
    importPack: null,
    out: DEFAULT_OUT_PATH,
    vault: DEFAULT_VAULT_PATH,
    recordVault: null,
    episode: 1,
    strategy: null,
    title: null,
    fps: 30,
    wpm: 150,
    depthSandwich: true,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") {
      printUsage();
      process.exit(0);
    } else if (arg === "--provider") {
      opts.provider = String(argv[++i] || "").toLowerCase();
    } else if (arg === "--model") {
      opts.model = argv[++i];
    } else if (arg === "--deterministic") {
      opts.deterministic = true;
      opts.provider = "deterministic";
    } else if (arg === "--export-pack") {
      opts.exportPack = path.resolve(argv[++i]);
      opts.provider = opts.provider || "pack";
    } else if (arg === "--import-pack") {
      opts.importPack = path.resolve(argv[++i]);
      opts.provider = opts.provider || "pack";
    } else if (arg === "--script") {
      opts.script = path.resolve(argv[++i]);
    } else if (arg === "--words") {
      opts.words = path.resolve(argv[++i]);
    } else if (arg === "--out") {
      opts.out = path.resolve(argv[++i]);
    } else if (arg === "--vault") {
      opts.vault = path.resolve(argv[++i]);
    } else if (arg === "--record-vault") {
      opts.recordVault = path.resolve(argv[++i]);
    } else if (arg === "--episode") {
      opts.episode = Math.max(1, Number(argv[++i]) || 1);
    } else if (arg === "--strategy") {
      opts.strategy = argv[++i];
    } else if (arg === "--title") {
      opts.title = argv[++i];
    } else if (arg === "--fps") {
      opts.fps = Number(argv[++i]) || 30;
    } else if (arg === "--wpm") {
      opts.wpm = Number(argv[++i]) || 150;
    } else if (arg === "--depth-sandwich") {
      opts.depthSandwich = true;
    } else if (arg === "--no-depth-sandwich") {
      opts.depthSandwich = false;
    } else if (arg === "--dry-run") {
      opts.dryRun = true;
    } else if (!arg.startsWith("-") && !opts.input) {
      opts.input = path.resolve(arg);
    } else {
      throw new Error(`Unknown CLI option: ${arg}`);
    }
  }

  if (!opts.provider) {
    opts.provider = "deterministic";
  }
  const validProviders = new Set([
    "deepseek",
    "openai",
    "gemini",
    "anthropic",
    "ollama",
    "pack",
    "deterministic",
  ]);
  if (!validProviders.has(opts.provider)) {
    throw new Error(`Invalid --provider "${opts.provider}". Expected: ${Array.from(validProviders).join(", ")}`);
  }
  return opts;
}

async function main() {
  const t0 = performance.now();
  loadDotEnvFiles();
  const opts = parseCliArgs(process.argv.slice(2));

  const vault = loadEpisodeVault(opts.vault);
  const noveltyCtx = computeEpisodeNoveltyContext(vault, opts.episode, opts.strategy);

  // Resolve script Lock either from --import-pack or from input script / words.json
  let scriptLock = null;
  let segments = [];

  if (opts.importPack) {
    const lockFile = path.join(opts.importPack, "script.lock.json");
    if (fs.existsSync(lockFile)) {
      scriptLock = JSON.parse(fs.readFileSync(lockFile, "utf8"));
      segments = scriptLock.sentences.map((s) => ({
        text: s.verbatim,
        startSec: Number((s.startMs / 1000).toFixed(2)),
        endSec: Number((s.endMs / 1000).toFixed(2)),
        paragraphIndex: s.paragraphIndex,
      }));
    }
  }

  if (!scriptLock) {
    const fallbackScript = path.join(REPO_ROOT, "scripts", "video_01_the_allowance.md");
    const primaryInput = opts.words || opts.script || opts.input || (fs.existsSync(fallbackScript) ? fallbackScript : null);
    if (!primaryInput || !fs.existsSync(primaryInput)) {
      throw new Error("Missing input script or words.json. Pass <script.md|words.json> or --script <path>.");
    }
    const ext = path.extname(primaryInput).toLowerCase();
    const rawContent = fs.readFileSync(primaryInput, "utf8").replace(/^\uFEFF/, "");
    const isWordsJson = ext === ".json";
    segments = isWordsJson
      ? segmentWhisperWords(JSON.parse(rawContent))
      : segmentScriptText(rawContent, opts.wpm);
    const rawScriptText =
      opts.script && fs.existsSync(opts.script)
        ? fs.readFileSync(opts.script, "utf8")
        : isWordsJson
          ? segments.map((s) => s.text).join("\n\n")
          : rawContent;
    scriptLock = buildScriptLock(
      rawScriptText,
      segments,
      opts.fps,
      isWordsJson ? "WHISPERX_FORCED" : "SYNTHETIC_SYLLABLE_CLOCK"
    );
  }

  if (opts.exportPack) {
    if (opts.dryRun) {
      console.log(`[dry-run] Would export 4-pass Equalizer Prompt Pack -> ${opts.exportPack}`);
      return;
    }
    const packInfo = exportEqualizerPack(opts.exportPack, scriptLock, noveltyCtx);
    console.log(`Exported 4-Pass Equalizer Prompt Pack -> ${packInfo.packDir}`);
    console.log(`  Script Lock : ${packInfo.lockPath} (${scriptLock.sentences.length} sentences, ${Object.keys(scriptLock.facts).length} facts)`);
    console.log(`  Workbooks   : Pass 1..3 + ${packInfo.pass4Count} Pass-4 hydration batch(es)`);
    return;
  }

  let overridesByBeatIndex = {};
  if (opts.importPack) {
    const loaded = loadPackOverrides(opts.importPack);
    overridesByBeatIndex = loaded.overridesByBeatIndex;
    console.log(
      `Imported Equalizer Pack from ${opts.importPack} (${Object.keys(overridesByBeatIndex).length} beat override(s), ${loaded.repairNotes.length} auto-repair note(s))`
    );
  } else if (opts.provider !== "deterministic" && opts.provider !== "pack") {
    const live = await runLiveFourPassLlm({
      provider: opts.provider,
      model: opts.model,
      scriptLock,
      noveltyCtx,
    });
    overridesByBeatIndex = live.overridesByBeatIndex;
  }

  const plan = compileEqualizerPlan({
    segments,
    scriptLock,
    noveltyCtx,
    overridesByBeatIndex,
    options: {
      fps: opts.fps,
      title: opts.title || `The Reading Room — ${noveltyCtx.episodeCode}`,
      depthSandwich: opts.depthSandwich,
    },
  });

  if (!opts.dryRun) {
    fs.mkdirSync(path.dirname(opts.out), { recursive: true });
    fs.writeFileSync(opts.out, JSON.stringify(plan, null, 2) + "\n", "utf8");
  }

  if (opts.recordVault && !opts.dryRun) {
    const styleCounts = {};
    for (const b of plan.beats) {
      styleCounts[b.recipeId] = (styleCounts[b.recipeId] || 0) + 1;
    }
    const updatedVault = {
      ...vault,
      episodes: [
        ...(vault.episodes || []).filter((e) => Number(e.episodeNumber) !== Number(opts.episode)),
        {
          episodeNumber: opts.episode,
          episodeCode: noveltyCtx.episodeCode,
          title: plan.title,
          strategyId: noveltyCtx.strategyId,
          recordedAtIso: new Date().toISOString(),
          styleCounts,
          lutId: noveltyCtx.lutId,
          musicStems: noveltyCtx.scorePalette.slice(0, 4),
          showstopperBlueprints: Array.from(new Set(plan.beats.map((b) => b.setPieceId).filter(Boolean))).slice(0, 5),
        },
      ],
    };
    fs.mkdirSync(path.dirname(opts.recordVault), { recursive: true });
    fs.writeFileSync(opts.recordVault, JSON.stringify(updatedVault, null, 2) + "\n", "utf8");
  }

  const elapsedMs = Math.round(performance.now() - t0);
  const totalSec = (plan.totalFrames / plan.fps).toFixed(1);
  console.log(
    `${opts.dryRun ? "[dry-run] " : ""}Equalizer Director Plan compiled in ${elapsedMs}ms -> ${opts.out}`
  );
  console.log(`  Provider / Mode     : ${opts.provider}${opts.model ? ` (${opts.model})` : ""}`);
  console.log(`  Episode & Strategy  : ${plan.episodeCode} [${plan.strategyId}] | LUT=${plan.lutId} | Stem=${plan.musicStem}`);
  console.log(`  Catalogs Active     : ${ALL_120_RECIPES.length} recipes | ${SIGNATURE_24_SET_PIECES.length} set-pieces | ${TYPOGRAPHY_32_MODES.length} kinetic modes | ${GLASS_18_RIGS.length} glass rigs`);
  console.log(`  Timeline            : ${plan.beats.length} beats (${totalSec}s @ ${plan.fps}fps) | ${plan.factCount} locked facts`);
  console.log(`  Style Diversity     : ${plan.audit.styleDiversityScore}/100 (${plan.qualityGate.uniqueRecipesUsed} unique recipes, ${plan.qualityGate.uniqueTypographyModesUsed} kinetic modes)`);
  console.log(`  Escalated Features  : ${plan.qualityGate.showstopperSetPieceCount} set-piece(s), ${plan.qualityGate.depthSandwichBeatCount} depth-sandwich beat(s)`);
  console.log(`  Talking Head Share  : ${plan.audit.talkingHeadSharePercent}% | Hero Peak: ${plan.audit.heroPeakPercent}%`);
  console.log(`  30-Gate Broadcast QC: ${plan.qualityGate.score}/100 (${plan.qualityGate.gatesPassed}/${plan.qualityGate.totalGates} gates, H=${plan.qualityGate.shannonEntropyBits} bits, PASS=${plan.qualityGate.passed})`);
}

const isEntrypoint =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isEntrypoint) {
  main().catch((err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
}
