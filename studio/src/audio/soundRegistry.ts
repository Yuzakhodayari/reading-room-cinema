import { z } from "zod";

// ============================================================================
// 1. 96 PROCEDURAL STUDIO FOLEY CUES (8 ACOUSTIC FAMILIES x 12)
// ============================================================================

export type SfxAcousticFamily =
  | "optical-glass"
  | "archival-paper"
  | "editorial-ink-type"
  | "stamps-gavels-locks"
  | "mechanical-industrial"
  | "data-tickers-terminals"
  | "grid-electrical-tactical"
  | "cinematic-transitions";

export const LEGACY_SFX_IDS = [
  "glass-enter",
  "glass-expand",
  "glass-dock",
  "glass-exit",
  "marker-sweep",
  "paper-slide",
  "data-tick",
  "warning-thud",
  "flash-cut",
  "telestrator-draw",
  "sticker-pop",
  "newsreel-click",
  "map-whoosh",
  "type-click",
  "ambient-tension-drone",
  "riser-subtle",
  "chapter-chime",
  "paper-flip-fast",
  "alert-ping",
  "camera-shutter",
] as const;

export type LegacySfxId = (typeof LEGACY_SFX_IDS)[number];

export const SFX_IDS = [
  // Family 1: Optical Glass (12)
  "glass-enter",
  "glass-expand",
  "glass-dock",
  "glass-exit",
  "glass-loupe-click",
  "glass-shimmer-sweep",
  "glass-pill-tick",
  "glass-toast-warn",
  "glass-prism-lock",
  "glass-frosted-slide",
  "glass-triptych-cascade",
  "glass-evaporate-soft",

  // Family 2: Archival Paper (12)
  "paper-slide",
  "paper-slide_v1",
  "paper-slide_v2",
  "paper-slide_v3",
  "paper-slide_v4",
  "paper-flip-fast",
  "marker-sweep",
  "telestrator-draw",
  "fountain-pen-slash",
  "paper-tear-crisp",
  "blueprint-unroll",
  "redaction-tape-pull",

  // Family 3: Editorial Ink & Type (12)
  "felt-highlighter",
  "felt-highlighter_v1",
  "felt-highlighter_v2",
  "felt-highlighter_v3",
  "felt-highlighter_v4",
  "type-click",
  "typewriter-strike",
  "typewriter-strike_v1",
  "typewriter-strike_v2",
  "typewriter-strike_v3",
  "typewriter-strike_v4",
  "microfilm-whir",

  // Family 4: Stamps, Gavels & Locks (12)
  "warning-thud",
  "sticker-pop",
  "archival-stamp",
  "archival-stamp_v1",
  "archival-stamp_v2",
  "archival-stamp_v3",
  "archival-stamp_v4",
  "gavel-wood-hit",
  "guillotine-slice",
  "vault-bolt-lock",
  "coin-brass-clink",
  "anvil-iron-clank",

  // Family 5: Mechanical & Industrial (12)
  "solari-flap",
  "solari-flap_v1",
  "solari-flap_v2",
  "solari-flap_v3",
  "solari-flap_v4",
  "hydraulic-press",
  "pneumatic-servo",
  "jet-gate-retract",
  "pendulum-escapement-tick",
  "ratchet-winch-click",
  "balance-scale-creak",
  "domino-clack-chain",

  // Family 6: Data, Tickers & Terminals (12)
  "data-tick",
  "alert-ping",
  "chapter-chime",
  "odometer-tick",
  "odometer-tick_v1",
  "odometer-tick_v2",
  "odometer-tick_v3",
  "odometer-tick_v4",
  "basis-point-blip",
  "nsf-decline-buzz",
  "calculator-ribbon-print",
  "audit-row-lock",

  // Family 7: Grid, Electrical & Tactical (12)
  "map-whoosh",
  "server-rack-hum",
  "substation-60hz-buzz",
  "radar-sonar-ping",
  "subsea-cable-snap",
  "vls-launch-whoosh",
  "drone-pass-by",
  "high-voltage-arc-snap",
  "watt-meter-whir",
  "euv-laser-pulse",
  "breaker-trip-clunk",
  "anchor-chain-scrape",

  // Family 8: Cinematic Transitions & Room Tone (12)
  "flash-cut",
  "camera-shutter",
  "newsreel-click",
  "riser-subtle",
  "ambient-tension-drone",
  "crowd-cut-mute",
  "sub-bass-drop",
  "register-dissolve-swell",
  "room-tone-library",
  "tape-stop-drop",
  "reverse-glass-suck",
  "resolve-chord-warm",
] as const;

export type SfxCueId = (typeof SFX_IDS)[number];

export type SfxVariantFamilyBase =
  | "odometer-tick"
  | "paper-slide"
  | "felt-highlighter"
  | "solari-flap"
  | "typewriter-strike"
  | "archival-stamp";

export const SFX_VARIANT_FAMILIES: Readonly<
  Record<SfxVariantFamilyBase, readonly [SfxCueId, SfxCueId, SfxCueId, SfxCueId]>
> = {
  "odometer-tick": [
    "odometer-tick_v1",
    "odometer-tick_v2",
    "odometer-tick_v3",
    "odometer-tick_v4",
  ],
  "paper-slide": [
    "paper-slide_v1",
    "paper-slide_v2",
    "paper-slide_v3",
    "paper-slide_v4",
  ],
  "felt-highlighter": [
    "felt-highlighter_v1",
    "felt-highlighter_v2",
    "felt-highlighter_v3",
    "felt-highlighter_v4",
  ],
  "solari-flap": [
    "solari-flap_v1",
    "solari-flap_v2",
    "solari-flap_v3",
    "solari-flap_v4",
  ],
  "typewriter-strike": [
    "typewriter-strike_v1",
    "typewriter-strike_v2",
    "typewriter-strike_v3",
    "typewriter-strike_v4",
  ],
  "archival-stamp": [
    "archival-stamp_v1",
    "archival-stamp_v2",
    "archival-stamp_v3",
    "archival-stamp_v4",
  ],
};

export interface SfxEntry {
  id: SfxCueId;
  path: `sfx/${SfxCueId}.wav`;
  family: SfxAcousticFamily;
  durationSec: number;
  defaultVolume: number;
  minOnsetSpacingMs: number;
  variantGroup?: SfxVariantFamilyBase;
  domains: readonly string[];
  moods: readonly string[];
  isLegacy?: boolean;
}

function mkSfx(
  id: SfxCueId,
  family: SfxAcousticFamily,
  durationSec: number,
  defaultVolume: number,
  domains: readonly string[],
  moods: readonly string[],
  opts?: {
    minOnsetSpacingMs?: number;
    variantGroup?: SfxVariantFamilyBase;
    isLegacy?: boolean;
  }
): SfxEntry {
  return {
    id,
    path: `sfx/${id}.wav`,
    family,
    durationSec,
    defaultVolume,
    minOnsetSpacingMs: opts && opts.minOnsetSpacingMs !== undefined ? opts.minOnsetSpacingMs : 72,
    variantGroup: opts ? opts.variantGroup : undefined,
    domains,
    moods,
    isLegacy: opts ? opts.isLegacy : false,
  };
}

export const SOUND_REGISTRY: Readonly<Record<SfxCueId, SfxEntry>> = {
  // 1. Optical Glass (12)
  "glass-enter": mkSfx("glass-enter", "optical-glass", 0.28, 0.65, ["glass", "ui", "receipt"], ["calm", "analytical"], { isLegacy: true }),
  "glass-expand": mkSfx("glass-expand", "optical-glass", 0.32, 0.65, ["glass", "modal", "zoom"], ["analytical", "reveal"], { isLegacy: true }),
  "glass-dock": mkSfx("glass-dock", "optical-glass", 0.22, 0.6, ["glass", "dock", "pill"], ["calm", "precision"], { isLegacy: true }),
  "glass-exit": mkSfx("glass-exit", "optical-glass", 0.2, 0.58, ["glass", "dismiss"], ["calm"], { isLegacy: true }),
  "glass-loupe-click": mkSfx("glass-loupe-click", "optical-glass", 0.2, 0.62, ["loupe", "magnifier", "forensic"], ["precision", "investigative"]),
  "glass-shimmer-sweep": mkSfx("glass-shimmer-sweep", "optical-glass", 0.42, 0.52, ["glass", "caustic", "highlight"], ["reveal", "warm"]),
  "glass-pill-tick": mkSfx("glass-pill-tick", "optical-glass", 0.08, 0.55, ["pill", "badge", "citation"], ["precision"]),
  "glass-toast-warn": mkSfx("glass-toast-warn", "optical-glass", 0.34, 0.64, ["toast", "alert", "warning"], ["tense", "alert"]),
  "glass-prism-lock": mkSfx("glass-prism-lock", "optical-glass", 0.28, 0.6, ["optics", "focus", "lock"], ["precision", "reveal"]),
  "glass-frosted-slide": mkSfx("glass-frosted-slide", "optical-glass", 0.32, 0.56, ["glass", "drawer", "panel"], ["calm"]),
  "glass-triptych-cascade": mkSfx("glass-triptych-cascade", "optical-glass", 0.36, 0.6, ["triptych", "metrics", "cards"], ["pulse", "analytical"]),
  "glass-evaporate-soft": mkSfx("glass-evaporate-soft", "optical-glass", 0.26, 0.5, ["glass", "fade", "exit"], ["calm"]),

  // 2. Archival Paper (12)
  "paper-slide": mkSfx("paper-slide", "archival-paper", 0.35, 0.65, ["paper", "archive", "filing", "ledger"], ["archival", "calm"], { variantGroup: "paper-slide", isLegacy: true }),
  "paper-slide_v1": mkSfx("paper-slide_v1", "archival-paper", 0.34, 0.65, ["paper", "archive", "ledger"], ["archival", "calm"], { variantGroup: "paper-slide" }),
  "paper-slide_v2": mkSfx("paper-slide_v2", "archival-paper", 0.34, 0.65, ["paper", "archive", "ledger"], ["archival", "calm"], { variantGroup: "paper-slide" }),
  "paper-slide_v3": mkSfx("paper-slide_v3", "archival-paper", 0.34, 0.65, ["paper", "archive", "ledger"], ["archival", "calm"], { variantGroup: "paper-slide" }),
  "paper-slide_v4": mkSfx("paper-slide_v4", "archival-paper", 0.34, 0.65, ["paper", "archive", "ledger"], ["archival", "calm"], { variantGroup: "paper-slide" }),
  "paper-flip-fast": mkSfx("paper-flip-fast", "archival-paper", 0.25, 0.65, ["paper", "page-turn", "dossier"], ["archival", "pulse"], { isLegacy: true }),
  "marker-sweep": mkSfx("marker-sweep", "archival-paper", 0.38, 0.62, ["highlight", "marker", "callout"], ["investigative", "precision"], { isLegacy: true }),
  "telestrator-draw": mkSfx("telestrator-draw", "archival-paper", 0.4, 0.62, ["telestrator", "chalk", "diagram"], ["investigative", "analytical"], { isLegacy: true }),
  "fountain-pen-slash": mkSfx("fountain-pen-slash", "archival-paper", 0.28, 0.68, ["legal", "veto", "signature", "strike"], ["verdict", "tense"]),
  "paper-tear-crisp": mkSfx("paper-tear-crisp", "archival-paper", 0.33, 0.66, ["tear", "scrip", "coupon", "cut"], ["tense", "archival"]),
  "blueprint-unroll": mkSfx("blueprint-unroll", "archival-paper", 0.52, 0.62, ["blueprint", "drafting", "schematic"], ["analytical", "archival"]),
  "redaction-tape-pull": mkSfx("redaction-tape-pull", "archival-paper", 0.3, 0.62, ["redaction", "classified", "censor"], ["investigative", "tense"]),

  // 3. Editorial Ink & Type (12)
  "felt-highlighter": mkSfx("felt-highlighter", "editorial-ink-type", 0.39, 0.6, ["highlighter", "ink", "emphasis"], ["investigative", "archival"], { variantGroup: "felt-highlighter" }),
  "felt-highlighter_v1": mkSfx("felt-highlighter_v1", "editorial-ink-type", 0.39, 0.6, ["highlighter", "ink"], ["investigative"], { variantGroup: "felt-highlighter" }),
  "felt-highlighter_v2": mkSfx("felt-highlighter_v2", "editorial-ink-type", 0.39, 0.6, ["highlighter", "ink"], ["investigative"], { variantGroup: "felt-highlighter" }),
  "felt-highlighter_v3": mkSfx("felt-highlighter_v3", "editorial-ink-type", 0.39, 0.6, ["highlighter", "ink"], ["investigative"], { variantGroup: "felt-highlighter" }),
  "felt-highlighter_v4": mkSfx("felt-highlighter_v4", "editorial-ink-type", 0.39, 0.6, ["highlighter", "ink"], ["investigative"], { variantGroup: "felt-highlighter" }),
  "type-click": mkSfx("type-click", "editorial-ink-type", 0.05, 0.52, ["typewriter", "key", "text"], ["precision"], { isLegacy: true }),
  "typewriter-strike": mkSfx("typewriter-strike", "editorial-ink-type", 0.085, 0.56, ["typewriter", "archival-type", "court"], ["archival", "precision"], { variantGroup: "typewriter-strike" }),
  "typewriter-strike_v1": mkSfx("typewriter-strike_v1", "editorial-ink-type", 0.085, 0.56, ["typewriter"], ["archival"], { variantGroup: "typewriter-strike" }),
  "typewriter-strike_v2": mkSfx("typewriter-strike_v2", "editorial-ink-type", 0.085, 0.56, ["typewriter"], ["archival"], { variantGroup: "typewriter-strike" }),
  "typewriter-strike_v3": mkSfx("typewriter-strike_v3", "editorial-ink-type", 0.085, 0.56, ["typewriter"], ["archival"], { variantGroup: "typewriter-strike" }),
  "typewriter-strike_v4": mkSfx("typewriter-strike_v4", "editorial-ink-type", 0.085, 0.56, ["typewriter"], ["archival"], { variantGroup: "typewriter-strike" }),
  "microfilm-whir": mkSfx("microfilm-whir", "editorial-ink-type", 0.44, 0.58, ["microfilm", "microfiche", "archive"], ["archival", "investigative"]),

  // 4. Stamps, Gavels & Locks (12)
  "warning-thud": mkSfx("warning-thud", "stamps-gavels-locks", 0.55, 0.72, ["warning", "debt", "impact"], ["tense", "verdict"], { isLegacy: true }),
  "sticker-pop": mkSfx("sticker-pop", "stamps-gavels-locks", 0.14, 0.62, ["sticker", "callout", "metaphor"], ["playful", "pulse"], { isLegacy: true }),
  "archival-stamp": mkSfx("archival-stamp", "stamps-gavels-locks", 0.44, 0.74, ["stamp", "verdict", "veto", "seal"], ["verdict", "tense"], { variantGroup: "archival-stamp" }),
  "archival-stamp_v1": mkSfx("archival-stamp_v1", "stamps-gavels-locks", 0.44, 0.74, ["stamp", "verdict"], ["verdict"], { variantGroup: "archival-stamp" }),
  "archival-stamp_v2": mkSfx("archival-stamp_v2", "stamps-gavels-locks", 0.44, 0.74, ["stamp", "verdict"], ["verdict"], { variantGroup: "archival-stamp" }),
  "archival-stamp_v3": mkSfx("archival-stamp_v3", "stamps-gavels-locks", 0.44, 0.74, ["stamp", "verdict"], ["verdict"], { variantGroup: "archival-stamp" }),
  "archival-stamp_v4": mkSfx("archival-stamp_v4", "stamps-gavels-locks", 0.44, 0.74, ["stamp", "verdict"], ["verdict"], { variantGroup: "archival-stamp" }),
  "gavel-wood-hit": mkSfx("gavel-wood-hit", "stamps-gavels-locks", 0.42, 0.75, ["court", "gavel", "statutory", "ruling"], ["verdict", "authoritative"]),
  "guillotine-slice": mkSfx("guillotine-slice", "stamps-gavels-locks", 0.48, 0.72, ["cut", "budget-cut", "veto", "cliff"], ["verdict", "tense"]),
  "vault-bolt-lock": mkSfx("vault-bolt-lock", "stamps-gavels-locks", 0.52, 0.7, ["vault", "treasury", "lockup", "covenant"], ["tense", "sovereign"]),
  "coin-brass-clink": mkSfx("coin-brass-clink", "stamps-gavels-locks", 0.38, 0.62, ["coin", "scrip", "token", "gold"], ["archival", "capital"]),
  "anvil-iron-clank": mkSfx("anvil-iron-clank", "stamps-gavels-locks", 0.56, 0.72, ["industrial", "iron", "heavy", "debt-wall"], ["industrial", "verdict"]),

  // 5. Mechanical & Industrial (12)
  "solari-flap": mkSfx("solari-flap", "mechanical-industrial", 0.11, 0.6, ["solari", "board", "counter", "flip"], ["clockwork", "precision"], { variantGroup: "solari-flap" }),
  "solari-flap_v1": mkSfx("solari-flap_v1", "mechanical-industrial", 0.11, 0.6, ["solari", "flip"], ["clockwork"], { variantGroup: "solari-flap" }),
  "solari-flap_v2": mkSfx("solari-flap_v2", "mechanical-industrial", 0.11, 0.6, ["solari", "flip"], ["clockwork"], { variantGroup: "solari-flap" }),
  "solari-flap_v3": mkSfx("solari-flap_v3", "mechanical-industrial", 0.11, 0.6, ["solari", "flip"], ["clockwork"], { variantGroup: "solari-flap" }),
  "solari-flap_v4": mkSfx("solari-flap_v4", "mechanical-industrial", 0.11, 0.6, ["solari", "flip"], ["clockwork"], { variantGroup: "solari-flap" }),
  "hydraulic-press": mkSfx("hydraulic-press", "mechanical-industrial", 0.68, 0.68, ["hydraulic", "compression", "margin", "industrial"], ["industrial", "tense"]),
  "pneumatic-servo": mkSfx("pneumatic-servo", "mechanical-industrial", 0.26, 0.6, ["robotics", "valve", "automation", "crane"], ["industrial", "clockwork"]),
  "jet-gate-retract": mkSfx("jet-gate-retract", "mechanical-industrial", 0.64, 0.64, ["gate", "airline", "chokepoint", "customs"], ["industrial", "pulse"]),
  "pendulum-escapement-tick": mkSfx("pendulum-escapement-tick", "mechanical-industrial", 0.09, 0.56, ["clockwork", "countdown", "maturity"], ["clockwork", "tense"]),
  "ratchet-winch-click": mkSfx("ratchet-winch-click", "mechanical-industrial", 0.36, 0.62, ["ratchet", "leverage", "tighten"], ["clockwork", "tense"]),
  "balance-scale-creak": mkSfx("balance-scale-creak", "mechanical-industrial", 0.46, 0.58, ["scale", "balance", "comparison"], ["analytical", "archival"]),
  "domino-clack-chain": mkSfx("domino-clack-chain", "mechanical-industrial", 0.44, 0.64, ["domino", "contagion", "cascade"], ["tense", "pulse"]),

  // 6. Data, Tickers & Terminals (12)
  "data-tick": mkSfx("data-tick", "data-tickers-terminals", 0.06, 0.48, ["data", "ticker", "number"], ["telemetry", "precision"], { isLegacy: true }),
  "alert-ping": mkSfx("alert-ping", "data-tickers-terminals", 0.35, 0.62, ["alert", "spike", "notification"], ["telemetry", "alert"], { isLegacy: true }),
  "chapter-chime": mkSfx("chapter-chime", "data-tickers-terminals", 0.8, 0.6, ["chapter", "act", "transition"], ["calm", "warm"], { isLegacy: true }),
  "odometer-tick": mkSfx("odometer-tick", "data-tickers-terminals", 0.036, 0.46, ["odometer", "counter", "roll"], ["telemetry", "precision"], { variantGroup: "odometer-tick" }),
  "odometer-tick_v1": mkSfx("odometer-tick_v1", "data-tickers-terminals", 0.036, 0.46, ["odometer", "counter"], ["telemetry"], { variantGroup: "odometer-tick" }),
  "odometer-tick_v2": mkSfx("odometer-tick_v2", "data-tickers-terminals", 0.036, 0.46, ["odometer", "counter"], ["telemetry"], { variantGroup: "odometer-tick" }),
  "odometer-tick_v3": mkSfx("odometer-tick_v3", "data-tickers-terminals", 0.036, 0.46, ["odometer", "counter"], ["telemetry"], { variantGroup: "odometer-tick" }),
  "odometer-tick_v4": mkSfx("odometer-tick_v4", "data-tickers-terminals", 0.036, 0.46, ["odometer", "counter"], ["telemetry"], { variantGroup: "odometer-tick" }),
  "basis-point-blip": mkSfx("basis-point-blip", "data-tickers-terminals", 0.09, 0.52, ["yield", "spread", "bonds", "telemetry"], ["telemetry", "precision"]),
  "nsf-decline-buzz": mkSfx("nsf-decline-buzz", "data-tickers-terminals", 0.32, 0.62, ["decline", "bounce", "rent", "wallet"], ["tense", "satire"]),
  "calculator-ribbon-print": mkSfx("calculator-ribbon-print", "data-tickers-terminals", 0.24, 0.58, ["ledger", "tax", "accounting", "receipt"], ["archival", "investigative"]),
  "audit-row-lock": mkSfx("audit-row-lock", "data-tickers-terminals", 0.12, 0.56, ["audit", "table", "row", "lock"], ["precision", "investigative"]),

  // 7. Grid, Electrical & Tactical (12)
  "map-whoosh": mkSfx("map-whoosh", "grid-electrical-tactical", 0.45, 0.65, ["map", "camera", "pan", "corridor"], ["geopolitics", "pulse"], { isLegacy: true }),
  "server-rack-hum": mkSfx("server-rack-hum", "grid-electrical-tactical", 2.4, 0.38, ["datacenter", "compute", "ai", "gpu"], ["telemetry", "calm"]),
  "substation-60hz-buzz": mkSfx("substation-60hz-buzz", "grid-electrical-tactical", 1.8, 0.48, ["grid", "transformer", "pjm", "megawatt"], ["industrial", "tense"]),
  "radar-sonar-ping": mkSfx("radar-sonar-ping", "grid-electrical-tactical", 1.15, 0.62, ["naval", "subsea", "sonar", "strait"], ["subsea", "tense"]),
  "subsea-cable-snap": mkSfx("subsea-cable-snap", "grid-electrical-tactical", 0.72, 0.72, ["subsea", "cable", "sabotage", "sever"], ["subsea", "verdict"]),
  "vls-launch-whoosh": mkSfx("vls-launch-whoosh", "grid-electrical-tactical", 0.95, 0.68, ["defense", "missile", "interceptor", "salvo"], ["tense", "tactical"]),
  "drone-pass-by": mkSfx("drone-pass-by", "grid-electrical-tactical", 1.1, 0.62, ["drone", "uav", "lidar", "asymmetric"], ["tactical", "tense"]),
  "high-voltage-arc-snap": mkSfx("high-voltage-arc-snap", "grid-electrical-tactical", 0.22, 0.64, ["grid", "short", "bottleneck", "spark"], ["tense", "industrial"]),
  "watt-meter-whir": mkSfx("watt-meter-whir", "grid-electrical-tactical", 0.5, 0.56, ["meter", "utility", "escrow", "kilowatt"], ["industrial", "telemetry"]),
  "euv-laser-pulse": mkSfx("euv-laser-pulse", "grid-electrical-tactical", 0.18, 0.58, ["silicon", "euv", "wafer", "tsmc"], ["telemetry", "precision"]),
  "breaker-trip-clunk": mkSfx("breaker-trip-clunk", "grid-electrical-tactical", 0.32, 0.68, ["breaker", "kill-switch", "blackout", "shutoff"], ["verdict", "tense"]),
  "anchor-chain-scrape": mkSfx("anchor-chain-scrape", "grid-electrical-tactical", 0.68, 0.64, ["maritime", "anchor", "baltic", "shipping"], ["subsea", "tense"]),

  // 8. Cinematic Transitions & Room Tone (12)
  "flash-cut": mkSfx("flash-cut", "cinematic-transitions", 0.12, 0.64, ["cut", "transition", "snap"], ["pulse", "investigative"], { isLegacy: true }),
  "camera-shutter": mkSfx("camera-shutter", "cinematic-transitions", 0.14, 0.64, ["photo", "exhibit", "evidence"], ["investigative", "archival"], { isLegacy: true }),
  "newsreel-click": mkSfx("newsreel-click", "cinematic-transitions", 0.1, 0.6, ["newsreel", "16mm", "vintage"], ["archival"], { isLegacy: true }),
  "riser-subtle": mkSfx("riser-subtle", "cinematic-transitions", 1.8, 0.58, ["riser", "build", "cliffhanger"], ["tense", "pulse"], { isLegacy: true }),
  "ambient-tension-drone": mkSfx("ambient-tension-drone", "cinematic-transitions", 12.0, 0.3, ["drone", "ambient", "tension"], ["tense", "calm"], { isLegacy: true }),
  "crowd-cut-mute": mkSfx("crowd-cut-mute", "cinematic-transitions", 0.46, 0.65, ["silence", "drop", "punchline", "freeze"], ["drop-silence", "verdict"]),
  "sub-bass-drop": mkSfx("sub-bass-drop", "cinematic-transitions", 0.92, 0.72, ["climax", "cliff", "debt", "drop"], ["verdict", "tense"]),
  "register-dissolve-swell": mkSfx("register-dissolve-swell", "cinematic-transitions", 0.64, 0.56, ["bridge", "dissolve", "register"], ["calm", "speculative"]),
  "room-tone-library": mkSfx("room-tone-library", "cinematic-transitions", 4.0, 0.22, ["room-tone", "library", "reading-room"], ["calm", "archival"]),
  "tape-stop-drop": mkSfx("tape-stop-drop", "cinematic-transitions", 0.48, 0.64, ["tape-stop", "default", "freeze"], ["drop-silence", "satire"]),
  "reverse-glass-suck": mkSfx("reverse-glass-suck", "cinematic-transitions", 0.46, 0.6, ["reverse", "pre-hit", "reveal"], ["pulse", "tense"]),
  "resolve-chord-warm": mkSfx("resolve-chord-warm", "cinematic-transitions", 1.4, 0.56, ["epilogue", "takeaway", "resolution"], ["warm", "calm"]),
};

// ============================================================================
// 2. 12 BUNDLED ROYALTY-FREE DOCUMENTARY MUSIC BEDS
// ============================================================================

export const MUSIC_STEM_IDS = [
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

export type MusicStemId = (typeof MUSIC_STEM_IDS)[number];

export const DEFAULT_MUSIC_STEM_ID: MusicStemId = "02-ledger-investigation";

export type MusicEnergyLevel = "calm" | "pulse" | "tense" | "drop-silence";

export type MusicMood =
  | "archival"
  | "investigative"
  | "telemetry"
  | "clockwork"
  | "sovereign"
  | "subsea"
  | "industrial"
  | "reckoning"
  | "toy-model"
  | "speculative"
  | "verdict"
  | "epilogue";

export interface MusicStemEntry {
  id: MusicStemId;
  path: `music/${MusicStemId}.wav`;
  title: string;
  durationSec: number;
  bpm: number;
  keySignature: string;
  energy: MusicEnergyLevel;
  mood: MusicMood;
  domains: readonly string[];
  recommendedBaseVolume: number;
  recommendedDuckVolume: number;
}

export const MUSIC_STEM_REGISTRY: Readonly<Record<MusicStemId, MusicStemEntry>> = {
  "01-archival-pulse": {
    id: "01-archival-pulse",
    path: "music/01-archival-pulse.wav",
    title: "Archival Pulse",
    durationSec: 8.0,
    bpm: 60,
    keySignature: "D Dorian",
    energy: "pulse",
    mood: "archival",
    domains: ["history", "scrip", "1933", "1941", "archive", "court"],
    recommendedBaseVolume: 0.24,
    recommendedDuckVolume: 0.06,
  },
  "02-ledger-investigation": {
    id: "02-ledger-investigation",
    path: "music/02-ledger-investigation.wav",
    title: "Ledger Investigation",
    durationSec: 8.0,
    bpm: 60,
    keySignature: "A Aeolian",
    energy: "pulse",
    mood: "investigative",
    domains: ["treasury", "forensic", "table-9", "tax", "sec", "investigation"],
    recommendedBaseVolume: 0.25,
    recommendedDuckVolume: 0.06,
  },
  "03-midnight-telemetry": {
    id: "03-midnight-telemetry",
    path: "music/03-midnight-telemetry.wav",
    title: "Midnight Telemetry",
    durationSec: 8.0,
    bpm: 90,
    keySignature: "C Minor 9",
    energy: "pulse",
    mood: "telemetry",
    domains: ["ai", "compute", "silicon", "capex", "datacenter", "telemetry"],
    recommendedBaseVolume: 0.24,
    recommendedDuckVolume: 0.06,
  },
  "04-clockwork-mechanism": {
    id: "04-clockwork-mechanism",
    path: "music/04-clockwork-mechanism.wav",
    title: "Clockwork Mechanism",
    durationSec: 8.0,
    bpm: 120,
    keySignature: "E Dorian",
    energy: "pulse",
    mood: "clockwork",
    domains: ["plumbing", "circular-flow", "spv", "pik", "mechanism", "countdown"],
    recommendedBaseVolume: 0.23,
    recommendedDuckVolume: 0.055,
  },
  "05-sovereign-tension": {
    id: "05-sovereign-tension",
    path: "music/05-sovereign-tension.wav",
    title: "Sovereign Tension",
    durationSec: 8.0,
    bpm: 60,
    keySignature: "F# Phrygian",
    energy: "tense",
    mood: "sovereign",
    domains: ["debt", "bonds", "rollover", "crisis", "warning", "default"],
    recommendedBaseVolume: 0.25,
    recommendedDuckVolume: 0.06,
  },
  "06-subsea-drone": {
    id: "06-subsea-drone",
    path: "music/06-subsea-drone.wav",
    title: "Subsea Drone",
    durationSec: 8.0,
    bpm: 60,
    keySignature: "Eb Minor",
    energy: "tense",
    mood: "subsea",
    domains: ["subsea", "maritime", "cables", "naval", "strait", "geopolitics"],
    recommendedBaseVolume: 0.24,
    recommendedDuckVolume: 0.06,
  },
  "07-industrial-march": {
    id: "07-industrial-march",
    path: "music/07-industrial-march.wav",
    title: "Industrial March",
    durationSec: 8.0,
    bpm: 60,
    keySignature: "G Minor",
    energy: "tense",
    mood: "industrial",
    domains: ["grid", "mining", "transformers", "ports", "labor", "energy"],
    recommendedBaseVolume: 0.24,
    recommendedDuckVolume: 0.06,
  },
  "08-quiet-reckoning": {
    id: "08-quiet-reckoning",
    path: "music/08-quiet-reckoning.wav",
    title: "Quiet Reckoning",
    durationSec: 8.0,
    bpm: 60,
    keySignature: "B Minor",
    energy: "calm",
    mood: "reckoning",
    domains: ["household", "claire", "mortgage", "pension", "demographics", "calm"],
    recommendedBaseVolume: 0.24,
    recommendedDuckVolume: 0.06,
  },
  "09-toy-model-marimba": {
    id: "09-toy-model-marimba",
    path: "music/09-toy-model-marimba.wav",
    title: "Toy Model Marimba",
    durationSec: 8.0,
    bpm: 60,
    keySignature: "F Lydian-Dorian",
    energy: "calm",
    mood: "toy-model",
    domains: ["metaphor", "diagram", "toy-model", "explainer", "blueprint"],
    recommendedBaseVolume: 0.23,
    recommendedDuckVolume: 0.055,
  },
  "10-speculative-horizon": {
    id: "10-speculative-horizon",
    path: "music/10-speculative-horizon.wav",
    title: "Speculative Horizon",
    durationSec: 8.0,
    bpm: 60,
    keySignature: "G Minor 9",
    energy: "calm",
    mood: "speculative",
    domains: ["2036", "future", "allowance", "escape-hatch", "horizon"],
    recommendedBaseVolume: 0.24,
    recommendedDuckVolume: 0.06,
  },
  "11-verdict-drone": {
    id: "11-verdict-drone",
    path: "music/11-verdict-drone.wav",
    title: "Verdict Drone",
    durationSec: 8.0,
    bpm: 60,
    keySignature: "D Open Fifth",
    energy: "drop-silence",
    mood: "verdict",
    domains: ["verdict", "veto", "cliff", "silence", "ruling"],
    recommendedBaseVolume: 0.2,
    recommendedDuckVolume: 0.045,
  },
  "12-epilogue-warmth": {
    id: "12-epilogue-warmth",
    path: "music/12-epilogue-warmth.wav",
    title: "Epilogue Warmth",
    durationSec: 8.0,
    bpm: 60,
    keySignature: "Cadd9 / A Minor 7",
    energy: "calm",
    mood: "epilogue",
    domains: ["takeaway", "epilogue", "ending", "resolution", "human"],
    recommendedBaseVolume: 0.25,
    recommendedDuckVolume: 0.06,
  },
};

// ============================================================================
// 3. 12 CINEMA .CUBE 3D COLOR GRADING LUTS
// ============================================================================

export const LUT_IDS = [
  // Original 3 baseline LUTs (preserved untouched)
  "editorial-warm",
  "documentary-slate",
  "clean-room-pop",
  // 9 Cinema & Register LUTs
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

export type LutId = (typeof LUT_IDS)[number];

export interface LutEntry {
  id: LutId;
  file: `luts/${LutId}.cube`;
  title: string;
  latticeSize: 17 | 33;
  registerAffinity: "archival_parchment" | "midnight_telemetry" | "drafting_blueprint" | "a_roll";
  moods: readonly string[];
  domains: readonly string[];
  isLegacy?: boolean;
}

export const LUT_REGISTRY: Readonly<Record<LutId, LutEntry>> = {
  "editorial-warm": {
    id: "editorial-warm",
    file: "luts/editorial-warm.cube",
    title: "Editorial Warm",
    latticeSize: 17,
    registerAffinity: "a_roll",
    moods: ["warm", "calm", "investigative", "epilogue"],
    domains: ["talking-head", "reading-room", "general"],
    isLegacy: true,
  },
  "documentary-slate": {
    id: "documentary-slate",
    file: "luts/documentary-slate.cube",
    title: "Documentary Slate",
    latticeSize: 17,
    registerAffinity: "midnight_telemetry",
    moods: ["analytical", "tense", "telemetry"],
    domains: ["macro", "warning", "finance"],
    isLegacy: true,
  },
  "clean-room-pop": {
    id: "clean-room-pop",
    file: "luts/clean-room-pop.cube",
    title: "Clean Room Pop",
    latticeSize: 17,
    registerAffinity: "a_roll",
    moods: ["precision", "playful", "pulse"],
    domains: ["silicon", "tech", "cleanroom"],
    isLegacy: true,
  },
  "archival-parchment": {
    id: "archival-parchment",
    file: "luts/archival-parchment.cube",
    title: "Archival Parchment",
    latticeSize: 17,
    registerAffinity: "archival_parchment",
    moods: ["archival", "warm"],
    domains: ["court", "treasury", "scrip", "ledger"],
  },
  "kodak-2383-print": {
    id: "kodak-2383-print",
    file: "luts/kodak-2383-print.cube",
    title: "Kodak 2383 Print",
    latticeSize: 17,
    registerAffinity: "a_roll",
    moods: ["cinema", "investigative", "sovereign"],
    domains: ["documentary", "feature", "narrative"],
  },
  "midnight-desk": {
    id: "midnight-desk",
    file: "luts/midnight-desk.cube",
    title: "Midnight Desk",
    latticeSize: 17,
    registerAffinity: "midnight_telemetry",
    moods: ["telemetry", "investigative", "nocturne"],
    domains: ["capex", "debt", "bloomberg", "sec"],
  },
  "cold-2030-deflation": {
    id: "cold-2030-deflation",
    file: "luts/cold-2030-deflation.cube",
    title: "Cold 2030 Deflation",
    latticeSize: 17,
    registerAffinity: "midnight_telemetry",
    moods: ["tense", "speculative", "deflation"],
    domains: ["2036", "automation", "unemployment", "yields"],
  },
  "austin-august-heat": {
    id: "austin-august-heat",
    file: "luts/austin-august-heat.cube",
    title: "Austin August Heat",
    latticeSize: 17,
    registerAffinity: "archival_parchment",
    moods: ["reckoning", "heat", "household"],
    domains: ["housing", "austin", "claire", "insurance", "grid-peak"],
  },
  "blueprint-cyanotype": {
    id: "blueprint-cyanotype",
    file: "luts/blueprint-cyanotype.cube",
    title: "Blueprint Cyanotype",
    latticeSize: 17,
    registerAffinity: "drafting_blueprint",
    moods: ["clockwork", "toy-model", "analytical"],
    domains: ["blueprint", "schematic", "plumbing", "grid"],
  },
  "silver-gelatin-1941": {
    id: "silver-gelatin-1941",
    file: "luts/silver-gelatin-1941.cube",
    title: "Silver Gelatin 1941",
    latticeSize: 17,
    registerAffinity: "archival_parchment",
    moods: ["archival", "history"],
    domains: ["1912", "1933", "1941", "newsreel", "rationing"],
  },
  "subsea-sodium": {
    id: "subsea-sodium",
    file: "luts/subsea-sodium.cube",
    title: "Subsea Sodium",
    latticeSize: 17,
    registerAffinity: "drafting_blueprint",
    moods: ["subsea", "tactical", "tense"],
    domains: ["subsea", "maritime", "naval", "cables", "strait"],
  },
  "verdict-high-contrast": {
    id: "verdict-high-contrast",
    file: "luts/verdict-high-contrast.cube",
    title: "Verdict High Contrast",
    latticeSize: 17,
    registerAffinity: "midnight_telemetry",
    moods: ["verdict", "drop-silence", "tense"],
    domains: ["veto", "cliff", "default", "ruling"],
  },
};

// ============================================================================
// 4. ZOD RUNTIME SCHEMAS & COUNT ACCESSORS
// ============================================================================

export const SfxCueIdSchema = z.enum(SFX_IDS);
export const MusicStemIdSchema = z.enum(MUSIC_STEM_IDS);
export const LutIdSchema = z.enum(LUT_IDS);

export const SfxScheduledEventSchema = z.object({
  cue: z.string().min(1),
  frame: z.number().int().nonnegative(),
  volume: z.number().min(0).max(2).optional(),
  playbackRate: z.number().min(0.25).max(4).optional(),
  seed: z.union([z.number(), z.string()]).optional(),
});

export function getSfxCount(): number {
  return Object.keys(SOUND_REGISTRY).length;
}

export function getMusicStemCount(): number {
  return Object.keys(MUSIC_STEM_REGISTRY).length;
}

export function getLutCount(): number {
  return Object.keys(LUT_REGISTRY).length;
}

// ============================================================================
// 5. DETERMINISTIC VARIANT ROTATION, ALIAS RESOLUTION & 72MS ONSET GUARD
// ============================================================================

const SFX_ID_SET = new Set<string>(SFX_IDS as readonly string[]);

const SFX_ALIAS_MAP: Readonly<Record<string, SfxCueId>> = {
  paper_slide: "paper-slide",
  felt_highlight: "felt-highlighter",
  "highlighter-sweep": "felt-highlighter",
  odometer_tick: "odometer-tick",
  "ticker-roll": "odometer-tick",
  archival_stamp: "archival-stamp",
  "stamp-slam": "archival-stamp",
  sub_swell: "register-dissolve-swell",
  room_tone: "room-tone-library",
  "gavel-slam": "gavel-wood-hit",
  "gavel-wood-crack": "gavel-wood-hit",
  "guillotine-slice-thud": "guillotine-slice",
  "vault-bolt-clank": "vault-bolt-lock",
  "brass-scrip-clink": "coin-brass-clink",
  "sonar-active-ping": "radar-sonar-ping",
  "fiber-cable-snap-sub": "subsea-cable-snap",
  "vls-hatch-pop-whoosh": "vls-launch-whoosh",
  "drone-prop-buzz-pass": "drone-pass-by",
  "transformer-60hz-hum": "substation-60hz-buzz",
  "sub-bass-cliff-drop": "sub-bass-drop",
  "silence-vacuum-gate": "crowd-cut-mute",
  "tape-stop-pitch-drop": "tape-stop-drop",
};

export function hashDeterministicSeed(input: number | string | undefined, fallback = 0): number {
  if (input === undefined) return fallback >>> 0;
  if (typeof input === "number") {
    return (Math.imul(Math.floor(input) | 0, 2654435761) >>> 0);
  }
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

export function isValidSfxCue(cue: string): cue is SfxCueId {
  return SFX_ID_SET.has(cue);
}

/**
 * Resolve any raw/legacy/underscored SFX token to a canonical `SfxCueId`,
 * optionally rotating across `_v1.._v4` micro-variants deterministically via `seed` & `frame`.
 */
export function resolveSfxCue(
  rawCue: string,
  options?: {
    seed?: number | string;
    frame?: number;
    enableVariants?: boolean;
  }
): SfxCueId {
  const cleaned = rawCue.trim().replace(/\.wav$/i, "").replace(/^sfx\//i, "");
  let baseId: SfxCueId = "data-tick";

  if (isValidSfxCue(cleaned)) {
    baseId = cleaned;
  } else if (SFX_ALIAS_MAP[cleaned]) {
    baseId = SFX_ALIAS_MAP[cleaned];
  } else {
    const hyphenated = cleaned.replace(/_/g, "-");
    if (isValidSfxCue(hyphenated)) {
      baseId = hyphenated;
    }
  }

  const useVariants = options && options.enableVariants !== undefined ? options.enableVariants : false;
  if (useVariants && baseId in SFX_VARIANT_FAMILIES) {
    const variants = SFX_VARIANT_FAMILIES[baseId as SfxVariantFamilyBase];
    const f = options && options.frame !== undefined ? Math.max(0, Math.floor(options.frame)) : 0;
    const h = hashDeterministicSeed(options ? options.seed : undefined, 0);
    const idx = ((h + f) >>> 0) % variants.length;
    return variants[idx];
  }

  return baseId;
}

export interface OnsetTimedCue<T extends { cue: string; frame: number }> {
  item: T;
  resolvedCue: SfxCueId;
}

/**
 * Enforces a minimum `minSpacingMs` (default `72ms`, max ~13.8 hits/sec) onset guard
 * per acoustic variant group / cue ID so rapid counters or multi-word bursts never machine-gun.
 */
export function filterByMinOnsetSpacing<T extends { cue: string; frame: number }>(
  cues: readonly T[],
  fps: number,
  minSpacingMs = 72
): T[] {
  if (cues.length <= 1) return cues.slice();
  const safeFps = fps > 0 ? fps : 30;
  const minFrames = Math.max(1, Math.ceil((minSpacingMs / 1000) * safeFps));

  const indexed = cues.map((c, idx) => ({ c, idx }));
  indexed.sort((a, b) => (a.c.frame !== b.c.frame ? a.c.frame - b.c.frame : a.idx - b.idx));

  const lastAcceptedFrameByGroup: Record<string, number> = {};
  const keptIndices = new Set<number>();

  for (let i = 0; i < indexed.length; i++) {
    const { c, idx } = indexed[i];
    const resolved = resolveSfxCue(c.cue);
    const entry = SOUND_REGISTRY[resolved];
    const groupKey = entry.variantGroup || resolved;
    const prevFrame = lastAcceptedFrameByGroup[groupKey];

    if (prevFrame === undefined || c.frame - prevFrame >= minFrames) {
      lastAcceptedFrameByGroup[groupKey] = c.frame;
      keptIndices.add(idx);
    }
  }

  return cues.filter((_, idx) => keptIndices.has(idx));
}

// ============================================================================
// 6. MOOD / ENERGY / DOMAIN AUTO-MATCHING FOR SFX, MUSIC STEMS & LUTS
// ============================================================================

export function resolveMusicStem(options?: {
  trackId?: string;
  track?: string;
  mood?: string;
  musicEnergy?: string;
  domain?: string;
}): MusicStemEntry {
  const explicit = (options && (options.trackId || options.track)) || "";
  if (explicit) {
    const cleaned = explicit.trim().replace(/^music\//i, "").replace(/\.wav$/i, "");
    if (cleaned in MUSIC_STEM_REGISTRY) {
      return MUSIC_STEM_REGISTRY[cleaned as MusicStemId];
    }
    // Match suffix without numeric prefix (e.g. "ledger-investigation" -> "02-ledger-investigation")
    for (let i = 0; i < MUSIC_STEM_IDS.length; i++) {
      const id = MUSIC_STEM_IDS[i];
      if (id.slice(3) === cleaned || id.indexOf(cleaned) !== -1) {
        return MUSIC_STEM_REGISTRY[id];
      }
    }
  }

  const moodToken = options && options.mood ? options.mood.trim().toLowerCase() : "";
  if (moodToken) {
    const moodDirectMap: Record<string, MusicStemId> = {
      archival: "01-archival-pulse",
      history: "01-archival-pulse",
      investigative: "02-ledger-investigation",
      investigation: "02-ledger-investigation",
      forensic: "02-ledger-investigation",
      ledger: "02-ledger-investigation",
      telemetry: "03-midnight-telemetry",
      midnight: "03-midnight-telemetry",
      clockwork: "04-clockwork-mechanism",
      mechanism: "04-clockwork-mechanism",
      sovereign: "05-sovereign-tension",
      tense: "05-sovereign-tension",
      warning: "05-sovereign-tension",
      subsea: "06-subsea-drone",
      maritime: "06-subsea-drone",
      naval: "06-subsea-drone",
      industrial: "07-industrial-march",
      grid: "07-industrial-march",
      reckoning: "08-quiet-reckoning",
      calm: "08-quiet-reckoning",
      "toy-model": "09-toy-model-marimba",
      marimba: "09-toy-model-marimba",
      playful: "09-toy-model-marimba",
      diagram: "09-toy-model-marimba",
      speculative: "10-speculative-horizon",
      horizon: "10-speculative-horizon",
      verdict: "11-verdict-drone",
      "drop-silence": "11-verdict-drone",
      epilogue: "12-epilogue-warmth",
      warm: "12-epilogue-warmth",
      takeaway: "12-epilogue-warmth",
    };
    if (moodDirectMap[moodToken]) {
      return MUSIC_STEM_REGISTRY[moodDirectMap[moodToken]];
    }
  }

  const domainToken = options && options.domain ? options.domain.trim().toLowerCase() : "";
  if (domainToken) {
    for (let i = 0; i < MUSIC_STEM_IDS.length; i++) {
      const entry = MUSIC_STEM_REGISTRY[MUSIC_STEM_IDS[i]];
      for (let d = 0; d < entry.domains.length; d++) {
        if (domainToken.indexOf(entry.domains[d]) !== -1 || entry.domains[d].indexOf(domainToken) !== -1) {
          return entry;
        }
      }
    }
  }

  const energyToken = options && options.musicEnergy ? options.musicEnergy.trim().toLowerCase() : "";
  if (energyToken) {
    const energyMap: Record<string, MusicStemId> = {
      calm: "08-quiet-reckoning",
      pulse: "02-ledger-investigation",
      tense: "05-sovereign-tension",
      "drop-silence": "11-verdict-drone",
    };
    if (energyMap[energyToken]) {
      return MUSIC_STEM_REGISTRY[energyMap[energyToken]];
    }
  }

  return MUSIC_STEM_REGISTRY[DEFAULT_MUSIC_STEM_ID];
}

export function matchSfxByDomainOrMood(query: {
  domain?: string;
  mood?: string;
  family?: SfxAcousticFamily;
}): SfxCueId[] {
  const dom = query.domain ? query.domain.trim().toLowerCase() : "";
  const mood = query.mood ? query.mood.trim().toLowerCase() : "";
  const fam = query.family;

  const matches: SfxCueId[] = [];
  for (let i = 0; i < SFX_IDS.length; i++) {
    const id = SFX_IDS[i];
    const entry = SOUND_REGISTRY[id];
    if (fam && entry.family !== fam) continue;
    const domOk =
      !dom ||
      entry.domains.some((d) => d.indexOf(dom) !== -1 || dom.indexOf(d) !== -1);
    const moodOk =
      !mood ||
      entry.moods.some((m) => m.indexOf(mood) !== -1 || mood.indexOf(m) !== -1);
    if (domOk && moodOk) {
      matches.push(id);
    }
  }
  return matches;
}

export function matchLutByMoodOrRegister(query: {
  lutId?: string;
  register?: LutEntry["registerAffinity"];
  mood?: string;
  domain?: string;
}): LutEntry {
  if (query.lutId) {
    const cleaned = query.lutId.trim().replace(/^luts\//i, "").replace(/\.cube$/i, "");
    if (cleaned in LUT_REGISTRY) {
      return LUT_REGISTRY[cleaned as LutId];
    }
  }
  const dom = query.domain ? query.domain.trim().toLowerCase() : "";
  if (dom) {
    for (let i = 0; i < LUT_IDS.length; i++) {
      const entry = LUT_REGISTRY[LUT_IDS[i]];
      if (entry.domains.some((d) => dom.indexOf(d) !== -1 || d.indexOf(dom) !== -1)) {
        return entry;
      }
    }
  }
  const mood = query.mood ? query.mood.trim().toLowerCase() : "";
  if (mood) {
    for (let i = 0; i < LUT_IDS.length; i++) {
      const entry = LUT_REGISTRY[LUT_IDS[i]];
      if (entry.moods.some((m) => mood.indexOf(m) !== -1 || m.indexOf(mood) !== -1)) {
        return entry;
      }
    }
  }
  if (query.register) {
    const regMap: Record<LutEntry["registerAffinity"], LutId> = {
      archival_parchment: "archival-parchment",
      midnight_telemetry: "midnight-desk",
      drafting_blueprint: "blueprint-cyanotype",
      a_roll: "editorial-warm",
    };
    return LUT_REGISTRY[regMap[query.register]];
  }
  return LUT_REGISTRY["editorial-warm"];
}
