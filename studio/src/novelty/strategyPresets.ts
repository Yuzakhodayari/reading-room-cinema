import { z } from "zod";
import { StyleEngineFamily, StyleRecipe } from "../director/schema";

/**
 * All 9 canonical Channel Strategy Preset IDs from `channel-structure` & Season 1 Roadmap.
 */
export const STRATEGY_PRESET_IDS = [
  "STR-GEN-EXPLAINER",
  "STR-AIC-CLOCKED",
  "STR-AIC-SPECULATIVE",
  "STR-FISHER-ARTIFACT",
  "STR-MAX-ESSAY",
  "STR-AOTP-LADDER",
  "STR-BOYLE-CHAPTERED",
  "STR-HMW-PRIMER",
  "STR-GEN-FIELD",
] as const;

export type StrategyPresetId = (typeof STRATEGY_PRESET_IDS)[number];

export const StrategyPresetIdSchema = z.enum(STRATEGY_PRESET_IDS);

/**
 * Narrative engines across the channel blend (includes `street` so `R46` can explicitly ban it).
 */
export const NATIVE_NARRATIVE_ENGINES = [
  "explainer",
  "clocked",
  "speculative",
  "artifact",
  "essay",
  "ladder",
  "chaptered",
  "primer",
  "field",
  "street",
] as const;

export type NarrativeEngine = (typeof NATIVE_NARRATIVE_ENGINES)[number];

export const NarrativeEngineSchema = z.enum(NATIVE_NARRATIVE_ENGINES);

/**
 * Weighted creator leans in the channel voice blend.
 */
export const CREATOR_LEANS = [
  "AIC",
  "Fisher",
  "Gen",
  "Maxinomics",
  "AotP",
  "Boyle",
  "HMW",
] as const;

export type CreatorLean = (typeof CREATOR_LEANS)[number];

export const CreatorLeanSchema = z.enum(CREATOR_LEANS);

export const CREATOR_BLEND_WEIGHTS: Record<CreatorLean, number> = {
  AIC: 7.0,
  Fisher: 6.0,
  Gen: 5.0,
  Maxinomics: 4.5,
  AotP: 4.0,
  Boyle: 2.5,
  HMW: 2.5,
};

/**
 * Reading Room Cinema multi-register aesthetic taxonomy.
 * Strictly adheres to Dual-Palette rules (`PAGE_PALETTE` milk canvas & `OVER_FOOTAGE_PALETTE` smoked-navy glass).
 */
export const VISUAL_REGISTER_IDS = [
  "milk-page-editorial",
  "smoked-navy-glass",
  "archival-light-table",
  "investigation-switchboard",
  "blueprint-schematic",
  "silver-gelatin-chronicle",
  "geospatial-telemetry",
  "restraint-vellum",
] as const;

export type VisualRegisterId = (typeof VISUAL_REGISTER_IDS)[number];

export const VisualRegisterIdSchema = z.enum(VISUAL_REGISTER_IDS);

/**
 * Lean-matched single CTA archetypes (final 0.90–1.00 verdict & 0.98–1.00 ask window; zero mid-video nag).
 */
export const CTA_ARCHETYPES = [
  "agency-lever-plus-next-video",
  "civic-or-share-ask",
  "restated-claim-uncertainty",
  "footnotes-coda",
  "philosophical-echo-list",
  "dry-verdict-chapter-close",
] as const;

export type CtaArchetype = (typeof CTA_ARCHETYPES)[number];

export const CtaArchetypeSchema = z.enum(CTA_ARCHETYPES);

/**
 * Hard forbidden-engine guardrail rule IDs (`R43–R47`).
 */
export const GUARDRAIL_RULE_IDS = ["R43", "R44", "R45", "R46", "R47"] as const;

export type GuardrailRuleId = (typeof GUARDRAIL_RULE_IDS)[number];

export const GuardrailRuleIdSchema = z.enum(GUARDRAIL_RULE_IDS);

export interface NormalizedWindow {
  readonly start: number;
  readonly end: number;
}

export const NormalizedWindowSchema = z
  .object({
    start: z.number().min(0).max(1),
    end: z.number().min(0).max(1),
  })
  .refine((w) => w.start <= w.end, {
    message: "NormalizedWindow start must be <= end",
  });

export interface ForbiddenEngineGuardrail {
  readonly ruleId: GuardrailRuleId;
  readonly severity: "P0" | "P1";
  readonly title: string;
  readonly triggerCondition: string;
  readonly bannedEngines: readonly NarrativeEngine[];
  readonly bannedStyleRecipeIds: readonly string[];
  readonly bannedVisualPatterns: readonly string[];
  readonly rationale: string;
}

export interface SponsorWindowPolicy {
  readonly allowed: boolean;
  readonly bridgedRequired: boolean;
  readonly cliffhangerEntryRequired: boolean;
  readonly reEntryLineRequired: boolean;
  readonly window: NormalizedWindow | null;
  readonly medianFrac: number | null;
  readonly ruleCards: readonly string[];
  readonly notes: string;
}

export interface DecileRehookPolicy {
  readonly requiredDeciles: 10;
  readonly minDevicesPerDecile: number;
  readonly maxGapWithoutTurnFrac: number;
  readonly allowedDevices: readonly (
    | "contradiction-question"
    | "primary-artifact-open"
    | "numeric-shock"
    | "burstiness-slam"
    | "entity-callback"
    | "counterfactual-turn"
    | "scale-ladder-step"
  )[];
  readonly ruleCards: readonly string[];
}

export interface AdversaryConcessionPolicy {
  readonly required: boolean;
  readonly primaryWindow: NormalizedWindow;
  readonly allowEarlySteelmanBefore: number;
  readonly minConcessions: number;
  readonly ruleCards: readonly string[];
  readonly description: string;
}

export interface BookendVerdictPolicy {
  readonly verdictWindow: NormalizedWindow;
  readonly singleCtaWindow: NormalizedWindow;
  readonly ctaArchetype: CtaArchetype;
  readonly restateTitleClaimRequired: boolean;
  readonly forbidNewFactsAfterFrac: number;
  readonly forbidMidVideoSubscribeAsk: boolean;
  readonly ruleCards: readonly string[];
}

export interface PresenterARollPolicy {
  readonly minShare: number;
  readonly targetShare: number;
  readonly maxShare: number;
  readonly overFootageSafePlacement: readonly (
    | "right-third"
    | "bottom-dock"
    | "top-bar"
  )[];
}

export interface StrategyBeatMilestone {
  readonly id: string;
  readonly window: NormalizedWindow;
  readonly label: string;
  readonly ruleCards: readonly string[];
  readonly preferredArchetypes: readonly string[];
}

export interface StrategyPreset {
  readonly id: StrategyPresetId;
  readonly name: string;
  readonly primaryEngine: NarrativeEngine;
  readonly defaultLean: CreatorLean;
  readonly creatorWeight: number;
  readonly wordCountTarget: {
    readonly min: number;
    readonly median: number;
    readonly max: number;
  };
  readonly spokenDurationTargetMin: {
    readonly min: number;
    readonly max: number;
  };
  readonly hookAndStakeWindow: NormalizedWindow;
  readonly thesisQuestionHardCapFrac: number;
  readonly maxHookWordsToFirstStake: number;
  readonly sponsorPolicy: SponsorWindowPolicy;
  readonly decileRehookPolicy: DecileRehookPolicy;
  readonly adversaryConcessionPolicy: AdversaryConcessionPolicy;
  readonly bookendVerdictPolicy: BookendVerdictPolicy;
  readonly presenterARollTarget: PresenterARollPolicy;
  readonly preferredRegisters: readonly VisualRegisterId[];
  readonly preferredStyleFamilies: readonly StyleEngineFamily[];
  readonly preferredSceneArchetypes: readonly string[];
  readonly defaultForbiddenEngines: readonly NarrativeEngine[];
  readonly activeGuardrails: readonly GuardrailRuleId[];
  readonly beatMap: readonly StrategyBeatMilestone[];
  readonly successTest: string;
}

/**
 * Canonical `R43–R47` Forbidden-Engine Hard Guardrail Definitions.
 */
export const FORBIDDEN_ENGINE_GUARDRAILS: Record<
  GuardrailRuleId,
  ForbiddenEngineGuardrail
> = {
  R43: {
    ruleId: "R43",
    severity: "P0",
    title: "Mandatory Non-Empty Forbidden Engines List",
    triggerCondition: "Every strategy packet must explicitly ban >= 1 incompatible narrative engine.",
    bannedEngines: [],
    bannedStyleRecipeIds: [],
    bannedVisualPatterns: [],
    rationale:
      "An empty forbidden_engines list proves the showrunner did not diagnose title constraints before picking a spine.",
  },
  R44: {
    ruleId: "R44",
    severity: "P0",
    title: "Ban Clocked Engine & Fake Crisis Hour-Clocks Without Dated Hour Facts",
    triggerCondition:
      "Active whenever `clocked` is in `forbiddenEngines` or the topic lacks verified hour-by-hour crisis timestamps.",
    bannedEngines: ["clocked"],
    bannedStyleRecipeIds: ["doc-live-countdown-split"],
    bannedVisualPatterns: [
      "fake-countdown-hour-clock",
      "invented-hh-mm-crisis-stamp",
      "fabricated-2030-hour-ticker",
      "synthetic-defcon-timer",
    ],
    rationale:
      "Inventing hour-stamps on macro/near-future/accounting topics destroys archival trust (R39/T43). Keep dates strictly at verified calendar resolution (e.g. Late 2025, July 2026, Q4 2032, Oct 2036).",
  },
  R45: {
    ruleId: "R45",
    severity: "P1",
    title: "Ban Pure Toy-Model Ladder Spine on Wallet & Household Outrage Titles",
    triggerCondition:
      "Active whenever `ladder` is in `forbiddenEngines` because stakes are household solvency, rent, escrow, or bargaining power.",
    bannedEngines: ["ladder"],
    bannedStyleRecipeIds: [],
    bannedVisualPatterns: [
      "abstract-toy-model-cold-open-without-wallet-stake",
      "pure-textbook-derivation-spine",
    ],
    rationale:
      "Household-solvency titles require kitchen-table wallet stakes by 0.10 (R03); nested physical scale ladders remain allowed inside a single mid-film act (e.g. ARCH-11 10W->5GW).",
  },
  R46: {
    ruleId: "R46",
    severity: "P1",
    title: "Ban Street & Field Engines Off the Street",
    triggerCondition:
      "Active whenever `street` or `field` is in `forbiddenEngines` because production is a studio archival/ledger investigation.",
    bannedEngines: ["street", "field"],
    bannedStyleRecipeIds: [],
    bannedVisualPatterns: [
      "man-on-the-street-vox-pop-frame",
      "handheld-ride-along-bodycam-hud",
      "unverified-passerby-lower-third",
    ],
    rationale:
      "Studio balance-sheet and geopolitical investigations never fake field access or pad runtime with street-survey filler.",
  },
  R47: {
    ruleId: "R47",
    severity: "P0",
    title: "Ban Artifact Engine Without a Showable Primary Document or Map",
    triggerCondition:
      "Active whenever `artifact` is selected without a verified primary filing/table/map, or when `artifact` is forbidden due to concept-only sources.",
    bannedEngines: ["artifact"],
    bannedStyleRecipeIds: ["doc-archive-light-table"],
    bannedVisualPatterns: [
      "fabricated-government-seal",
      "lorem-ipsum-ledger-rows",
      "synthetic-redacted-cia-memo",
    ],
    rationale:
      "Fisher-grade viewers click for authentic statutory/filing lines (Table 9, TIC, 10-K, Form 941). Never render fake documents.",
  },
};

const SHARED_DECILE_REHOOK_POLICY: DecileRehookPolicy = {
  requiredDeciles: 10,
  minDevicesPerDecile: 1,
  maxGapWithoutTurnFrac: 0.18,
  allowedDevices: [
    "contradiction-question",
    "primary-artifact-open",
    "numeric-shock",
    "burstiness-slam",
    "entity-callback",
    "counterfactual-turn",
    "scale-ladder-step",
  ],
  ruleCards: ["R13", "A11", "A16"],
};

/**
 * Complete Registry of all 9 Channel Strategy Presets (`STR-*`).
 */
export const STRATEGY_PRESETS: Record<StrategyPresetId, StrategyPreset> = {
  "STR-GEN-EXPLAINER": {
    id: "STR-GEN-EXPLAINER",
    name: "Gen Money & Power Explainer (Fused w/ Fisher Board & AIC Restraint)",
    primaryEngine: "explainer",
    defaultLean: "Gen",
    creatorWeight: CREATOR_BLEND_WEIGHTS.Gen,
    wordCountTarget: { min: 3300, median: 3900, max: 4500 },
    spokenDurationTargetMin: { min: 20, max: 27 },
    hookAndStakeWindow: { start: 0.0, end: 0.1 },
    thesisQuestionHardCapFrac: 0.08,
    maxHookWordsToFirstStake: 60,
    sponsorPolicy: {
      allowed: true,
      bridgedRequired: true,
      cliffhangerEntryRequired: true,
      reEntryLineRequired: true,
      window: { start: 0.25, end: 0.35 },
      medianFrac: 0.31,
      ruleCards: ["R08", "R09", "R10", "R11"],
      notes:
        "Optional (omitted on AIC-restraint flagship episodes like Ep 01); if used, slot at ~0.30–0.32 right after first major rebuttal with cliffhanger & topical bridge.",
    },
    decileRehookPolicy: SHARED_DECILE_REHOOK_POLICY,
    adversaryConcessionPolicy: {
      required: true,
      primaryWindow: { start: 0.6, end: 0.85 },
      allowEarlySteelmanBefore: 0.25,
      minConcessions: 2,
      ruleCards: ["R07", "R19", "R40"],
      description:
        "Steelman the strongest market/engineering counter-claim early and grant a fair structural concession in 0.60–0.85 so systemic critique never drifts into polemic.",
    },
    bookendVerdictPolicy: {
      verdictWindow: { start: 0.9, end: 1.0 },
      singleCtaWindow: { start: 0.98, end: 1.0 },
      ctaArchetype: "agency-lever-plus-next-video",
      restateTitleClaimRequired: true,
      forbidNewFactsAfterFrac: 0.9,
      forbidMidVideoSubscribeAsk: true,
      ruleCards: ["R25", "R26", "R27", "R38"],
    },
    presenterARollTarget: {
      minShare: 0.2,
      targetShare: 0.28,
      maxShare: 0.36,
      overFootageSafePlacement: ["right-third", "bottom-dock", "top-bar"],
    },
    preferredRegisters: [
      "milk-page-editorial",
      "smoked-navy-glass",
      "archival-light-table",
      "investigation-switchboard",
    ],
    preferredStyleFamilies: [
      "doc-broadcast",
      "liquid-glass",
      "diagram-metaphor",
      "data-maps-3d",
    ],
    preferredSceneArchetypes: [
      "ARCH-01",
      "ARCH-02",
      "ARCH-04",
      "ARCH-06",
      "ARCH-07",
      "ARCH-08",
      "ARCH-13",
    ],
    defaultForbiddenEngines: ["clocked", "street", "field", "ladder"],
    activeGuardrails: ["R43", "R44", "R45", "R46"],
    beatMap: [
      {
        id: "cold-open-hook-stake",
        window: { start: 0.0, end: 0.1 },
        label: "Relatable Kitchen-Table Stake + Core Thesis Question + Numbered Board",
        ruleCards: ["R01", "R02", "R03", "R04"],
        preferredArchetypes: ["ARCH-01", "ARCH-02", "ARCH-04"],
      },
      {
        id: "micro-mechanism-and-pov",
        window: { start: 0.1, end: 0.3 },
        label: "Point 1: Household / Micro Squeeze + Early Steelman",
        ruleCards: ["R07", "R12"],
        preferredArchetypes: ["ARCH-05", "ARCH-06", "ARCH-07"],
      },
      {
        id: "optional-bridged-sponsor-seam",
        window: { start: 0.28, end: 0.34 },
        label: "Optional Bridged Sponsor Seam or Primary Tax/Ledger Turn",
        ruleCards: ["R08", "R09", "R11", "R17"],
        preferredArchetypes: ["ARCH-01", "ARCH-08"],
      },
      {
        id: "numbered-investigation-bays",
        window: { start: 0.34, end: 0.6 },
        label: "Point 2: Institutional Plumbing & Historical Test Case",
        ruleCards: ["R12", "R13"],
        preferredArchetypes: ["ARCH-04", "ARCH-08", "ARCH-09"],
      },
      {
        id: "fair-adversary-concession-and-twist",
        window: { start: 0.6, end: 0.85 },
        label: "Point 3: Fair Adversary Concession + Physical/Accounting Breakdown",
        ruleCards: ["R13", "R19", "R40"],
        preferredArchetypes: ["ARCH-10", "ARCH-11", "ARCH-12"],
      },
      {
        id: "bookend-verdict-and-lever",
        window: { start: 0.9, end: 1.0 },
        label: "POV Convergence + Ownership Lever + Bookend Verdict + Next-Video Bridge",
        ruleCards: ["R25", "R26", "R27", "R38"],
        preferredArchetypes: ["ARCH-06", "ARCH-03", "ARCH-13"],
      },
    ],
    successTest:
      "Viewer can name the exact institutional mechanism, why obvious fixes break, and one concrete balance-sheet lever.",
  },

  "STR-AIC-CLOCKED": {
    id: "STR-AIC-CLOCKED",
    name: "AI In Context True-Event Clocked Reconstruction",
    primaryEngine: "clocked",
    defaultLean: "AIC",
    creatorWeight: CREATOR_BLEND_WEIGHTS.AIC,
    wordCountTarget: { min: 5200, median: 6200, max: 7000 },
    spokenDurationTargetMin: { min: 32, max: 43 },
    hookAndStakeWindow: { start: 0.0, end: 0.1 },
    thesisQuestionHardCapFrac: 0.05,
    maxHookWordsToFirstStake: 55,
    sponsorPolicy: {
      allowed: false,
      bridgedRequired: false,
      cliffhangerEntryRequired: false,
      reEntryLineRequired: false,
      window: null,
      medianFrac: null,
      ruleCards: ["R08"],
      notes: "AIC clocked narratives run ad-free to preserve documentary tension; single civic/share ask at 0.98–1.00.",
    },
    decileRehookPolicy: SHARED_DECILE_REHOOK_POLICY,
    adversaryConcessionPolicy: {
      required: true,
      primaryWindow: { start: 0.6, end: 0.85 },
      allowEarlySteelmanBefore: 0.2,
      minConcessions: 2,
      ruleCards: ["R19", "R40"],
      description:
        "Present board/regulator/executive exhibits fairly in 0.60–0.85 using verbatim filings and testimony before the structural lesson.",
    },
    bookendVerdictPolicy: {
      verdictWindow: { start: 0.9, end: 1.0 },
      singleCtaWindow: { start: 0.97, end: 1.0 },
      ctaArchetype: "civic-or-share-ask",
      restateTitleClaimRequired: true,
      forbidNewFactsAfterFrac: 0.9,
      forbidMidVideoSubscribeAsk: true,
      ruleCards: ["R25", "R27", "R29", "R38"],
    },
    presenterARollTarget: {
      minShare: 0.18,
      targetShare: 0.24,
      maxShare: 0.32,
      overFootageSafePlacement: ["right-third", "bottom-dock"],
    },
    preferredRegisters: [
      "restraint-vellum",
      "archival-light-table",
      "smoked-navy-glass",
      "silver-gelatin-chronicle",
    ],
    preferredStyleFamilies: [
      "doc-broadcast",
      "vintage-editorial",
      "liquid-glass",
    ],
    preferredSceneArchetypes: [
      "ARCH-01",
      "ARCH-02",
      "ARCH-09",
      "ARCH-13",
    ],
    defaultForbiddenEngines: ["street", "field", "ladder", "primer"],
    activeGuardrails: ["R43", "R45", "R46"],
    beatMap: [
      {
        id: "dated-incident-cold-open",
        window: { start: 0.0, end: 0.1 },
        label: "Verified Dated Scene + Thesis Question by 0.05",
        ruleCards: ["R01", "R02", "R29"],
        preferredArchetypes: ["ARCH-01", "ARCH-02"],
      },
      {
        id: "verified-chronology-chapters",
        window: { start: 0.1, end: 0.6 },
        label: "Timestamped True-Event Chapters (Strictly Verified Dates/Hours)",
        ruleCards: ["R13", "R29", "R39"],
        preferredArchetypes: ["ARCH-01", "ARCH-09"],
      },
      {
        id: "board-exhibits-and-counter-case",
        window: { start: 0.6, end: 0.85 },
        label: "Exhibits, Counter-Arguments & Structural Incentives",
        ruleCards: ["R19", "R29"],
        preferredArchetypes: ["ARCH-01", "ARCH-02", "ARCH-07"],
      },
      {
        id: "lesson-and-civic-close",
        window: { start: 0.9, end: 1.0 },
        label: "Institutional Verdict + Single Civic/Share Ask",
        ruleCards: ["R25", "R29", "R38"],
        preferredArchetypes: ["ARCH-13"],
      },
    ],
    successTest:
      "Every timestamp maps to a documented real-world event, and the viewer grasps why incentives produced the crisis.",
  },

  "STR-AIC-SPECULATIVE": {
    id: "STR-AIC-SPECULATIVE",
    name: "AI In Context Near-Future Scenario & Empirical Interleave",
    primaryEngine: "speculative",
    defaultLean: "AIC",
    creatorWeight: CREATOR_BLEND_WEIGHTS.AIC,
    wordCountTarget: { min: 4500, median: 5500, max: 6500 },
    spokenDurationTargetMin: { min: 28, max: 39 },
    hookAndStakeWindow: { start: 0.0, end: 0.1 },
    thesisQuestionHardCapFrac: 0.08,
    maxHookWordsToFirstStake: 58,
    sponsorPolicy: {
      allowed: false,
      bridgedRequired: false,
      cliffhangerEntryRequired: false,
      reEntryLineRequired: false,
      window: null,
      medianFrac: null,
      ruleCards: ["R06", "R08"],
      notes: "Ad-free scenario architecture; requires explicit scenario credibility tag within 0.05 (R06).",
    },
    decileRehookPolicy: SHARED_DECILE_REHOOK_POLICY,
    adversaryConcessionPolicy: {
      required: true,
      primaryWindow: { start: 0.6, end: 0.85 },
      allowEarlySteelmanBefore: 0.25,
      minConcessions: 2,
      ruleCards: ["R06", "R18", "R19"],
      description:
        "Concede defensive countermeasures, fab investments, or statutory fixes in 0.60–0.85 plus an explicit timing-humility hedge.",
    },
    bookendVerdictPolicy: {
      verdictWindow: { start: 0.9, end: 1.0 },
      singleCtaWindow: { start: 0.97, end: 1.0 },
      ctaArchetype: "civic-or-share-ask",
      restateTitleClaimRequired: true,
      forbidNewFactsAfterFrac: 0.9,
      forbidMidVideoSubscribeAsk: true,
      ruleCards: ["R25", "R34", "R38"],
    },
    presenterARollTarget: {
      minShare: 0.18,
      targetShare: 0.25,
      maxShare: 0.32,
      overFootageSafePlacement: ["right-third", "bottom-dock"],
    },
    preferredRegisters: [
      "restraint-vellum",
      "geospatial-telemetry",
      "blueprint-schematic",
      "archival-light-table",
    ],
    preferredStyleFamilies: [
      "data-maps-3d",
      "doc-broadcast",
      "liquid-glass",
      "diagram-metaphor",
    ],
    preferredSceneArchetypes: [
      "ARCH-01",
      "ARCH-03",
      "ARCH-06",
      "ARCH-11",
      "ARCH-12",
      "ARCH-13",
    ],
    defaultForbiddenEngines: ["clocked", "street", "field", "ladder"],
    activeGuardrails: ["R43", "R44", "R45", "R46"],
    beatMap: [
      {
        id: "near-future-scenario-and-credibility-tag",
        window: { start: 0.0, end: 0.1 },
        label: "Dated Near-Future Scenario Open + R06 Credibility Tag + Thesis Question",
        ruleCards: ["R01", "R02", "R06"],
        preferredArchetypes: ["ARCH-01", "ARCH-03", "ARCH-11"],
      },
      {
        id: "interleaved-scenario-and-empirical-filings",
        window: { start: 0.1, end: 0.6 },
        label: "Scenario Progression Interleaved With Today's Verified Statutory/Hardware Data",
        ruleCards: ["R12", "R13", "R34"],
        preferredArchetypes: ["ARCH-01", "ARCH-07", "ARCH-08", "ARCH-11"],
      },
      {
        id: "countermeasures-and-uncertainty-hedge",
        window: { start: 0.6, end: 0.85 },
        label: "Fair Defense/Policy Concession + Calibration Hedge",
        ruleCards: ["R18", "R19", "R40"],
        preferredArchetypes: ["ARCH-12", "ARCH-06"],
      },
      {
        id: "restraint-verdict-and-civic-bridge",
        window: { start: 0.9, end: 1.0 },
        label: "Structural Verdict + Timing Humility + Next-Episode Bridge",
        ruleCards: ["R25", "R38"],
        preferredArchetypes: ["ARCH-03", "ARCH-13"],
      },
    ],
    successTest:
      "Viewer clearly distinguishes today's hard statutory/physical facts from projected scenario beats without fake crisis hour-stamps.",
  },

  "STR-FISHER-ARTIFACT": {
    id: "STR-FISHER-ARTIFACT",
    name: "Max Fisher Primary-Artifact & Numbered-Board Investigation",
    primaryEngine: "artifact",
    defaultLean: "Fisher",
    creatorWeight: CREATOR_BLEND_WEIGHTS.Fisher,
    wordCountTarget: { min: 4400, median: 5400, max: 6200 },
    spokenDurationTargetMin: { min: 26, max: 37 },
    hookAndStakeWindow: { start: 0.0, end: 0.1 },
    thesisQuestionHardCapFrac: 0.08,
    maxHookWordsToFirstStake: 55,
    sponsorPolicy: {
      allowed: true,
      bridgedRequired: true,
      cliffhangerEntryRequired: true,
      reEntryLineRequired: true,
      window: { start: 0.28, end: 0.38 },
      medianFrac: 0.32,
      ruleCards: ["R08", "R09", "R10", "R11"],
      notes: "Placed right after historical/artifact setup and immediately before unlocking Bay 01 of the numbered board.",
    },
    decileRehookPolicy: SHARED_DECILE_REHOOK_POLICY,
    adversaryConcessionPolicy: {
      required: true,
      primaryWindow: { start: 0.6, end: 0.85 },
      allowEarlySteelmanBefore: 0.3,
      minConcessions: 2,
      ruleCards: ["R19", "R30", "R40"],
      description:
        "Explain the rational strategic incentives of foreign central banks, state planners, or counterparties in 0.60–0.85 without caricature.",
    },
    bookendVerdictPolicy: {
      verdictWindow: { start: 0.9, end: 1.0 },
      singleCtaWindow: { start: 0.98, end: 1.0 },
      ctaArchetype: "restated-claim-uncertainty",
      restateTitleClaimRequired: true,
      forbidNewFactsAfterFrac: 0.9,
      forbidMidVideoSubscribeAsk: true,
      ruleCards: ["R25", "R27", "R30", "R38"],
    },
    presenterARollTarget: {
      minShare: 0.18,
      targetShare: 0.26,
      maxShare: 0.34,
      overFootageSafePlacement: ["right-third", "bottom-dock"],
    },
    preferredRegisters: [
      "archival-light-table",
      "investigation-switchboard",
      "geospatial-telemetry",
      "milk-page-editorial",
    ],
    preferredStyleFamilies: [
      "doc-broadcast",
      "data-maps-3d",
      "liquid-glass",
      "vintage-editorial",
    ],
    preferredSceneArchetypes: [
      "ARCH-01",
      "ARCH-04",
      "ARCH-07",
      "ARCH-08",
      "ARCH-11",
      "ARCH-13",
    ],
    defaultForbiddenEngines: ["clocked", "street", "field", "ladder"],
    activeGuardrails: ["R43", "R44", "R45", "R46", "R47"],
    beatMap: [
      {
        id: "artifact-on-platen-open",
        window: { start: 0.0, end: 0.1 },
        label: "Showable Primary Document/Map on Frame 1 + Sharp Structural Question",
        ruleCards: ["R01", "R02", "R30", "R47"],
        preferredArchetypes: ["ARCH-01", "ARCH-11"],
      },
      {
        id: "historical-and-plumbing-setup",
        window: { start: 0.1, end: 0.3 },
        label: "How the Old Equilibrium Worked & Why the Table Just Shifted",
        ruleCards: ["R14", "R30"],
        preferredArchetypes: ["ARCH-07", "ARCH-08", "ARCH-09"],
      },
      {
        id: "optional-sponsor-into-board",
        window: { start: 0.28, end: 0.36 },
        label: "Optional Bridged Sponsor -> Master Numbered Board Initialization",
        ruleCards: ["R08", "R11", "R12"],
        preferredArchetypes: ["ARCH-04"],
      },
      {
        id: "numbered-board-blocks",
        window: { start: 0.36, end: 0.6 },
        label: "Numbered Investigation Bays (One Mechanism / Chokepoint Per Block)",
        ruleCards: ["R12", "R13", "R30"],
        preferredArchetypes: ["ARCH-04", "ARCH-01", "ARCH-11"],
      },
      {
        id: "adversary-logic-and-stress-test",
        window: { start: 0.6, end: 0.85 },
        label: "Fair Counterparty Logic + Final Board Bay Stress-Test",
        ruleCards: ["R19", "R30", "R40"],
        preferredArchetypes: ["ARCH-04", "ARCH-08", "ARCH-12"],
      },
      {
        id: "calibrated-verdict-and-handoff",
        window: { start: 0.9, end: 1.0 },
        label: "Intellectual Humility + Restated Claim + Next Dossier Bridge",
        ruleCards: ["R25", "R30", "R38"],
        preferredArchetypes: ["ARCH-01", "ARCH-13"],
      },
    ],
    successTest:
      "The primary artifact opened in minute 1 anchors every numbered bay and returns transformed in the final verdict.",
  },

  "STR-MAX-ESSAY": {
    id: "STR-MAX-ESSAY",
    name: "Maxinomics Cinematic Object & Game-Theory Concept Essay",
    primaryEngine: "essay",
    defaultLean: "Maxinomics",
    creatorWeight: CREATOR_BLEND_WEIGHTS.Maxinomics,
    wordCountTarget: { min: 3000, median: 3650, max: 4200 },
    spokenDurationTargetMin: { min: 19, max: 26 },
    hookAndStakeWindow: { start: 0.0, end: 0.1 },
    thesisQuestionHardCapFrac: 0.09,
    maxHookWordsToFirstStake: 56,
    sponsorPolicy: {
      allowed: true,
      bridgedRequired: true,
      cliffhangerEntryRequired: true,
      reEntryLineRequired: true,
      window: { start: 0.06, end: 0.14 },
      medianFrac: 0.09,
      ruleCards: ["R08", "R10", "R11", "R32"],
      notes: "Maxinomics supports an early post-vignette bridged slot (0.06–0.14) or ad-free run.",
    },
    decileRehookPolicy: SHARED_DECILE_REHOOK_POLICY,
    adversaryConcessionPolicy: {
      required: true,
      primaryWindow: { start: 0.6, end: 0.85 },
      allowEarlySteelmanBefore: 0.3,
      minConcessions: 1,
      ruleCards: ["R19", "R32", "R40"],
      description:
        "Steelman legacy doctrine / incumbent unit economics in 0.60–0.85 before proving why the cost-exchange ratio inverted.",
    },
    bookendVerdictPolicy: {
      verdictWindow: { start: 0.9, end: 1.0 },
      singleCtaWindow: { start: 0.98, end: 1.0 },
      ctaArchetype: "footnotes-coda",
      restateTitleClaimRequired: true,
      forbidNewFactsAfterFrac: 0.9,
      forbidMidVideoSubscribeAsk: true,
      ruleCards: ["R24", "R25", "R32", "R38"],
    },
    presenterARollTarget: {
      minShare: 0.16,
      targetShare: 0.22,
      maxShare: 0.3,
      overFootageSafePlacement: ["right-third", "bottom-dock"],
    },
    preferredRegisters: [
      "blueprint-schematic",
      "milk-page-editorial",
      "silver-gelatin-chronicle",
      "smoked-navy-glass",
    ],
    preferredStyleFamilies: [
      "diagram-metaphor",
      "data-maps-3d",
      "vintage-editorial",
      "doc-broadcast",
    ],
    preferredSceneArchetypes: [
      "ARCH-05",
      "ARCH-07",
      "ARCH-09",
      "ARCH-12",
      "ARCH-13",
    ],
    defaultForbiddenEngines: ["clocked", "street", "field"],
    activeGuardrails: ["R43", "R44", "R46"],
    beatMap: [
      {
        id: "cinematic-object-vignette",
        window: { start: 0.0, end: 0.1 },
        label: "Concrete Physical Object Collision ($20k Drone vs $4M Interceptor) + Paradox",
        ruleCards: ["R01", "R02", "R32"],
        preferredArchetypes: ["ARCH-05", "ARCH-02"],
      },
      {
        id: "interactive-viewer-game-and-contrast",
        window: { start: 0.1, end: 0.45 },
        label: "Cost-Exchange Game Matrix & Two Contrasting Systems",
        ruleCards: ["R12", "R32"],
        preferredArchetypes: ["ARCH-05", "ARCH-09"],
      },
      {
        id: "empirical-ledger-authority",
        window: { start: 0.45, end: 0.6 },
        label: "Hard Procurement / Industrial Queue Telemetry",
        ruleCards: ["R13", "R32"],
        preferredArchetypes: ["ARCH-01", "ARCH-07"],
      },
      {
        id: "doctrine-concession-and-reframe",
        window: { start: 0.6, end: 0.85 },
        label: "Fair Legacy-Platform Concession + Industrial Reframe",
        ruleCards: ["R19", "R32"],
        preferredArchetypes: ["ARCH-11", "ARCH-12"],
      },
      {
        id: "aphorism-verdict-and-footnotes",
        window: { start: 0.9, end: 1.0 },
        label: "Reframed Principle + Optional Footnotes Coda + Next-Video Bridge",
        ruleCards: ["R24", "R25", "R38"],
        preferredArchetypes: ["ARCH-13"],
      },
    ],
    successTest:
      "A single tangible object-to-object ratio carries the entire macro economic/strategic thesis without jargon.",
  },

  "STR-AOTP-LADDER": {
    id: "STR-AOTP-LADDER",
    name: "Art of the Problem First-Principles Toy-Model Ladder",
    primaryEngine: "ladder",
    defaultLean: "AotP",
    creatorWeight: CREATOR_BLEND_WEIGHTS.AotP,
    wordCountTarget: { min: 2400, median: 3000, max: 3600 },
    spokenDurationTargetMin: { min: 16, max: 23 },
    hookAndStakeWindow: { start: 0.0, end: 0.1 },
    thesisQuestionHardCapFrac: 0.06,
    maxHookWordsToFirstStake: 50,
    sponsorPolicy: {
      allowed: true,
      bridgedRequired: true,
      cliffhangerEntryRequired: true,
      reEntryLineRequired: true,
      window: { start: 0.15, end: 0.23 },
      medianFrac: 0.19,
      ruleCards: ["R08", "R10", "R11", "R33"],
      notes: "Placed right after Rung 1 historical origin before ascending into modern complexity.",
    },
    decileRehookPolicy: SHARED_DECILE_REHOOK_POLICY,
    adversaryConcessionPolicy: {
      required: true,
      primaryWindow: { start: 0.6, end: 0.85 },
      allowEarlySteelmanBefore: 0.25,
      minConcessions: 1,
      ruleCards: ["R19", "R33"],
      description:
        "Show why each historical/engineering patch genuinely solved the prior rung's failure before exposing the next emergent paradox.",
    },
    bookendVerdictPolicy: {
      verdictWindow: { start: 0.9, end: 1.0 },
      singleCtaWindow: { start: 0.98, end: 1.0 },
      ctaArchetype: "philosophical-echo-list",
      restateTitleClaimRequired: true,
      forbidNewFactsAfterFrac: 0.9,
      forbidMidVideoSubscribeAsk: true,
      ruleCards: ["R25", "R33", "R38"],
    },
    presenterARollTarget: {
      minShare: 0.12,
      targetShare: 0.18,
      maxShare: 0.25,
      overFootageSafePlacement: ["right-third", "bottom-dock"],
    },
    preferredRegisters: [
      "blueprint-schematic",
      "silver-gelatin-chronicle",
      "restraint-vellum",
      "milk-page-editorial",
    ],
    preferredStyleFamilies: [
      "diagram-metaphor",
      "vintage-editorial",
      "data-maps-3d",
    ],
    preferredSceneArchetypes: [
      "ARCH-05",
      "ARCH-08",
      "ARCH-09",
      "ARCH-11",
      "ARCH-13",
    ],
    defaultForbiddenEngines: ["clocked", "street", "field", "explainer"],
    activeGuardrails: ["R43", "R44", "R46"],
    beatMap: [
      {
        id: "paradox-cold-open",
        window: { start: 0.0, end: 0.1 },
        label: "Archival Broadcast / Physical Paradox + First-Principles Question",
        ruleCards: ["R01", "R02", "R33"],
        preferredArchetypes: ["ARCH-09", "ARCH-05"],
      },
      {
        id: "rungs-1-to-5",
        window: { start: 0.1, end: 0.6 },
        label: "Sequential Toy-Model Rungs (~1 Rung Per Decile, Nested Complexity)",
        ruleCards: ["R13", "R16", "R33"],
        preferredArchetypes: ["ARCH-05", "ARCH-08", "ARCH-11"],
      },
      {
        id: "modern-echo-and-fair-patch",
        window: { start: 0.6, end: 0.85 },
        label: "Why Modern Institutions Built This Patch + Emergent Instability",
        ruleCards: ["R19", "R33"],
        preferredArchetypes: ["ARCH-07", "ARCH-08"],
      },
      {
        id: "philosophical-verdict",
        window: { start: 0.9, end: 1.0 },
        label: "Present-Day Echo + Philosophical Verdict + Single Reading/Next Link",
        ruleCards: ["R25", "R33", "R38"],
        preferredArchetypes: ["ARCH-13"],
      },
    ],
    successTest:
      "Each rung builds strictly on the prior visual model so a non-specialist derives the complex mechanism from scratch.",
  },

  "STR-BOYLE-CHAPTERED": {
    id: "STR-BOYLE-CHAPTERED",
    name: "Boyle Dry Forensic Accounting & Historical Chaptered Essay",
    primaryEngine: "chaptered",
    defaultLean: "Boyle",
    creatorWeight: CREATOR_BLEND_WEIGHTS.Boyle,
    wordCountTarget: { min: 3800, median: 4600, max: 5800 },
    spokenDurationTargetMin: { min: 23, max: 35 },
    hookAndStakeWindow: { start: 0.0, end: 0.1 },
    thesisQuestionHardCapFrac: 0.08,
    maxHookWordsToFirstStake: 56,
    sponsorPolicy: {
      allowed: true,
      bridgedRequired: true,
      cliffhangerEntryRequired: true,
      reEntryLineRequired: true,
      window: { start: 0.12, end: 0.22 },
      medianFrac: 0.16,
      ruleCards: ["R08", "R10", "R11", "R35"],
      notes: "Dry chapter-break sponsor slot right before Chapter I or between Chapter I and Chapter II.",
    },
    decileRehookPolicy: SHARED_DECILE_REHOOK_POLICY,
    adversaryConcessionPolicy: {
      required: true,
      primaryWindow: { start: 0.6, end: 0.85 },
      allowEarlySteelmanBefore: 0.25,
      minConcessions: 2,
      ruleCards: ["R19", "R35", "R40"],
      description:
        "Grant GAAP legality, management's stated useful-life rationale, or fiscal orthodoxy in 0.60–0.85 before showing cash-flow/spread reality.",
    },
    bookendVerdictPolicy: {
      verdictWindow: { start: 0.9, end: 1.0 },
      singleCtaWindow: { start: 0.98, end: 1.0 },
      ctaArchetype: "dry-verdict-chapter-close",
      restateTitleClaimRequired: true,
      forbidNewFactsAfterFrac: 0.9,
      forbidMidVideoSubscribeAsk: true,
      ruleCards: ["R25", "R35", "R38"],
    },
    presenterARollTarget: {
      minShare: 0.22,
      targetShare: 0.3,
      maxShare: 0.38,
      overFootageSafePlacement: ["right-third", "bottom-dock"],
    },
    preferredRegisters: [
      "archival-light-table",
      "milk-page-editorial",
      "silver-gelatin-chronicle",
      "smoked-navy-glass",
    ],
    preferredStyleFamilies: [
      "doc-broadcast",
      "vintage-editorial",
      "liquid-glass",
      "data-maps-3d",
    ],
    preferredSceneArchetypes: [
      "ARCH-01",
      "ARCH-02",
      "ARCH-07",
      "ARCH-08",
      "ARCH-09",
      "ARCH-13",
    ],
    defaultForbiddenEngines: ["clocked", "street", "field"],
    activeGuardrails: ["R43", "R44", "R46", "R47"],
    beatMap: [
      {
        id: "filing-anomaly-hook",
        window: { start: 0.0, end: 0.1 },
        label: "10-K Footnote / Sovereign Yield Anomaly + Dry Deadpan Thesis",
        ruleCards: ["R01", "R02", "R35", "R47"],
        preferredArchetypes: ["ARCH-01", "ARCH-07"],
      },
      {
        id: "named-historical-and-accounting-chapters",
        window: { start: 0.1, end: 0.6 },
        label: "Named Chronological/Structural Era Chapters (Chapter I -> Chapter III)",
        ruleCards: ["R12", "R13", "R14", "R35"],
        preferredArchetypes: ["ARCH-01", "ARCH-08", "ARCH-09"],
      },
      {
        id: "gaap-or-policy-defense-vs-cash-reality",
        window: { start: 0.6, end: 0.85 },
        label: "Chapter IV: Fair GAAP/Sovereign Defense Colliding With Cash & SPV Math",
        ruleCards: ["R19", "R35", "R40"],
        preferredArchetypes: ["ARCH-07", "ARCH-08"],
      },
      {
        id: "forensic-verdict-close",
        window: { start: 0.9, end: 1.0 },
        label: "Dry Forensic Verdict + Restated Valuation/Spread Reality + Next Dossier",
        ruleCards: ["R25", "R35", "R38"],
        preferredArchetypes: ["ARCH-01", "ARCH-13"],
      },
    ],
    successTest:
      "Viewer can point to the exact 10-K footnote or bond-spread line item and explain the gap between book optics and cash reality.",
  },

  "STR-HMW-PRIMER": {
    id: "STR-HMW-PRIMER",
    name: "How Money Works Plumbing Primer -> Structural Break",
    primaryEngine: "primer",
    defaultLean: "HMW",
    creatorWeight: CREATOR_BLEND_WEIGHTS.HMW,
    wordCountTarget: { min: 3600, median: 4300, max: 5100 },
    spokenDurationTargetMin: { min: 22, max: 31 },
    hookAndStakeWindow: { start: 0.0, end: 0.1 },
    thesisQuestionHardCapFrac: 0.08,
    maxHookWordsToFirstStake: 58,
    sponsorPolicy: {
      allowed: true,
      bridgedRequired: true,
      cliffhangerEntryRequired: true,
      reEntryLineRequired: true,
      window: { start: 0.44, end: 0.54 },
      medianFrac: 0.49,
      ruleCards: ["R08", "R09", "R11", "R35"],
      notes: "Signature HMW pivot seam (~0.48–0.50): 'Now you know how X is supposed to work. Next: why it is breaking.'",
    },
    decileRehookPolicy: SHARED_DECILE_REHOOK_POLICY,
    adversaryConcessionPolicy: {
      required: true,
      primaryWindow: { start: 0.6, end: 0.85 },
      allowEarlySteelmanBefore: 0.45,
      minConcessions: 2,
      ruleCards: ["R19", "R35", "R40"],
      description:
        "Primer builds genuine institutional respect first; 0.60–0.85 concedes PIK flexibility / lender workouts before proving systemic contagion.",
    },
    bookendVerdictPolicy: {
      verdictWindow: { start: 0.9, end: 1.0 },
      singleCtaWindow: { start: 0.98, end: 1.0 },
      ctaArchetype: "dry-verdict-chapter-close",
      restateTitleClaimRequired: true,
      forbidNewFactsAfterFrac: 0.9,
      forbidMidVideoSubscribeAsk: true,
      ruleCards: ["R25", "R35", "R38"],
    },
    presenterARollTarget: {
      minShare: 0.2,
      targetShare: 0.27,
      maxShare: 0.35,
      overFootageSafePlacement: ["right-third", "bottom-dock"],
    },
    preferredRegisters: [
      "blueprint-schematic",
      "archival-light-table",
      "milk-page-editorial",
      "smoked-navy-glass",
    ],
    preferredStyleFamilies: [
      "diagram-metaphor",
      "doc-broadcast",
      "liquid-glass",
      "data-maps-3d",
    ],
    preferredSceneArchetypes: [
      "ARCH-01",
      "ARCH-05",
      "ARCH-07",
      "ARCH-08",
      "ARCH-13",
    ],
    defaultForbiddenEngines: ["clocked", "street", "field", "ladder"],
    activeGuardrails: ["R43", "R44", "R45", "R46"],
    beatMap: [
      {
        id: "shadow-market-pitch-hook",
        window: { start: 0.0, end: 0.1 },
        label: "Trillion-Dollar Market Pitch + What Just Changed + Announced Primer",
        ruleCards: ["R01", "R02", "R04"],
        preferredArchetypes: ["ARCH-01", "ARCH-08"],
      },
      {
        id: "clean-mechanics-primer",
        window: { start: 0.1, end: 0.48 },
        label: "Clean Institutional Plumbing Primer (How BDCs / Covenants / Seats Work)",
        ruleCards: ["R12", "R16"],
        preferredArchetypes: ["ARCH-05", "ARCH-08"],
      },
      {
        id: "mid-pivot-and-optional-sponsor",
        window: { start: 0.46, end: 0.54 },
        label: "'Now You Know How It Works — Time to See Why It Is Breaking' Pivot",
        ruleCards: ["R08", "R09", "R11", "R13"],
        preferredArchetypes: ["ARCH-04", "ARCH-01"],
      },
      {
        id: "structural-break-and-pik-concession",
        window: { start: 0.54, end: 0.85 },
        label: "PIK Workout Concession vs Masked Default Cascade",
        ruleCards: ["R19", "R35", "R40"],
        preferredArchetypes: ["ARCH-01", "ARCH-07", "ARCH-08"],
      },
      {
        id: "who-holds-the-bag-verdict",
        window: { start: 0.9, end: 1.0 },
        label: "Downstream Holder Exposure + Verdict + Next-Episode Bridge",
        ruleCards: ["R25", "R38"],
        preferredArchetypes: ["ARCH-03", "ARCH-13"],
      },
    ],
    successTest:
      "Viewer understands the financial plumbing well enough by midpoint that the second-half breakdown hits like an inevitable machine jam.",
  },

  "STR-GEN-FIELD": {
    id: "STR-GEN-FIELD",
    name: "Gen On-Location Field Investigation & Set-Piece Documentary",
    primaryEngine: "field",
    defaultLean: "Gen",
    creatorWeight: CREATOR_BLEND_WEIGHTS.Gen,
    wordCountTarget: { min: 3400, median: 4200, max: 5000 },
    spokenDurationTargetMin: { min: 21, max: 31 },
    hookAndStakeWindow: { start: 0.0, end: 0.1 },
    thesisQuestionHardCapFrac: 0.07,
    maxHookWordsToFirstStake: 55,
    sponsorPolicy: {
      allowed: true,
      bridgedRequired: true,
      cliffhangerEntryRequired: true,
      reEntryLineRequired: true,
      window: { start: 0.18, end: 0.26 },
      medianFrac: 0.22,
      ruleCards: ["R08", "R09", "R10", "R11"],
      notes: "Placed after initial location arrival & role establishment, right before deep stakeholder interviews.",
    },
    decileRehookPolicy: SHARED_DECILE_REHOOK_POLICY,
    adversaryConcessionPolicy: {
      required: true,
      primaryWindow: { start: 0.6, end: 0.85 },
      allowEarlySteelmanBefore: 0.45,
      minConcessions: 2,
      ruleCards: ["R19", "R40"],
      description:
        "Pair on-site operator/regulator interviews with fair macro constraints in 0.60–0.85 during the physical set-piece climax.",
    },
    bookendVerdictPolicy: {
      verdictWindow: { start: 0.9, end: 1.0 },
      singleCtaWindow: { start: 0.98, end: 1.0 },
      ctaArchetype: "agency-lever-plus-next-video",
      restateTitleClaimRequired: true,
      forbidNewFactsAfterFrac: 0.9,
      forbidMidVideoSubscribeAsk: true,
      ruleCards: ["R25", "R26", "R27", "R38"],
    },
    presenterARollTarget: {
      minShare: 0.34,
      targetShare: 0.42,
      maxShare: 0.52,
      overFootageSafePlacement: ["right-third", "bottom-dock", "top-bar"],
    },
    preferredRegisters: [
      "smoked-navy-glass",
      "geospatial-telemetry",
      "archival-light-table",
      "milk-page-editorial",
    ],
    preferredStyleFamilies: [
      "liquid-glass",
      "data-maps-3d",
      "doc-broadcast",
    ],
    preferredSceneArchetypes: [
      "ARCH-02",
      "ARCH-01",
      "ARCH-11",
      "ARCH-06",
      "ARCH-13",
    ],
    defaultForbiddenEngines: ["clocked", "ladder", "street"],
    activeGuardrails: ["R43", "R44", "R45"],
    beatMap: [
      {
        id: "location-cold-open-and-stakes",
        window: { start: 0.0, end: 0.1 },
        label: "On-Site Stakes Hook + Why We Came Here + Core Question",
        ruleCards: ["R01", "R02", "R03", "R05"],
        preferredArchetypes: ["ARCH-11", "ARCH-02"],
      },
      {
        id: "first-field-access-and-sponsor",
        window: { start: 0.1, end: 0.28 },
        label: "Site Walkthrough + Optional Bridged Sponsor (~0.22)",
        ruleCards: ["R08", "R11"],
        preferredArchetypes: ["ARCH-11", "ARCH-06"],
      },
      {
        id: "interviews-and-document-verify",
        window: { start: 0.28, end: 0.6 },
        label: "Operator Interviews Cross-Checked Against Hard Ledger Filings",
        ruleCards: ["R13", "R17"],
        preferredArchetypes: ["ARCH-01", "ARCH-02", "ARCH-07"],
      },
      {
        id: "physical-set-piece-and-concession",
        window: { start: 0.6, end: 0.88 },
        label: "Set-Piece Climax + Fair Systemic Trade-Off Concession",
        ruleCards: ["R19", "R40"],
        preferredArchetypes: ["ARCH-11", "ARCH-12"],
      },
      {
        id: "field-verdict-and-cta",
        window: { start: 0.9, end: 1.0 },
        label: "Grounded Verdict + Viewer Agency + Next-Video Bridge",
        ruleCards: ["R25", "R26", "R27", "R38"],
        preferredArchetypes: ["ARCH-13"],
      },
    ],
    successTest:
      "Physical on-location access proves a systemic balance-sheet truth that studio commentary alone could not show.",
  },
};

export function getStrategyPreset(id: StrategyPresetId): StrategyPreset {
  return STRATEGY_PRESETS[id];
}

export interface StrategyGuardrailContext {
  /** True only when a specific beat depicts a real statutory perishability timer (e.g. Shenzhen 6-day e-CNY or airline seat gate departure), NEVER a fake crisis clock. */
  readonly hasVerifiedPerishabilityMechanism?: boolean;
  /** True when the episode holds a real primary document/table/map on hand. */
  readonly hasShowablePrimaryArtifact?: boolean;
  /** True when genuine on-location field footage was shot. */
  readonly hasVerifiedFieldShoot?: boolean;
}

/**
 * Checks whether a `StyleRecipe` from `STYLE_CATALOG` is legal under the active strategy's `R43–R47` guardrails.
 */
export function isStyleRecipeAllowedForStrategy(
  recipe: StyleRecipe,
  strategyId: StrategyPresetId,
  extraForbiddenEngines: readonly NarrativeEngine[] = [],
  context: StrategyGuardrailContext = {}
): { readonly allowed: boolean; readonly blockedByRule?: GuardrailRuleId; readonly reason?: string } {
  const preset = STRATEGY_PRESETS[strategyId];
  const forbiddenSet = new Set<NarrativeEngine>([
    ...preset.defaultForbiddenEngines,
    ...extraForbiddenEngines,
  ]);

  // R44: Ban fake countdown hour-clocks (`doc-live-countdown-split`) when `clocked` is forbidden,
  // unless explicitly rendering a verified perishable scrip/seat comparison.
  if (
    forbiddenSet.has("clocked") &&
    FORBIDDEN_ENGINE_GUARDRAILS.R44.bannedStyleRecipeIds.indexOf(recipe.id) !== -1 &&
    !context.hasVerifiedPerishabilityMechanism
  ) {
    return {
      allowed: false,
      blockedByRule: "R44",
      reason:
        "R44: `clocked` engine is forbidden; fake countdown hour-clock split (`doc-live-countdown-split`) is blocked unless grounded in a verified perishability rule.",
    };
  }

  // R47: Ban archival light-table inspection when `artifact` is forbidden and no primary artifact exists.
  if (
    forbiddenSet.has("artifact") &&
    context.hasShowablePrimaryArtifact === false &&
    FORBIDDEN_ENGINE_GUARDRAILS.R47.bannedStyleRecipeIds.indexOf(recipe.id) !== -1
  ) {
    return {
      allowed: false,
      blockedByRule: "R47",
      reason:
        "R47: `artifact` engine is forbidden due to missing primary source document; never fabricate archival light-table filings.",
    };
  }

  return { allowed: true };
}

/**
 * Filters a candidate array of `StyleRecipe`s against `R43–R47` hard guardrails.
 */
export function filterRecipesByStrategyGuardrails(
  recipes: readonly StyleRecipe[],
  strategyId: StrategyPresetId,
  extraForbiddenEngines: readonly NarrativeEngine[] = [],
  context: StrategyGuardrailContext = {}
): StyleRecipe[] {
  const filtered: StyleRecipe[] = [];
  for (let i = 0; i < recipes.length; i++) {
    const check = isStyleRecipeAllowedForStrategy(
      recipes[i],
      strategyId,
      extraForbiddenEngines,
      context
    );
    if (check.allowed) {
      filtered.push(recipes[i]);
    }
  }
  return filtered;
}

export interface StrategyPacketAuditInput {
  readonly strategyId: StrategyPresetId;
  readonly forbiddenEngines: readonly NarrativeEngine[];
  readonly stakes: "wallet" | "civic" | "wonder" | "geopolitical" | "valuation";
  readonly hasDatedHourTimeline: boolean;
  readonly hasShowablePrimaryArtifact: boolean;
  readonly hasFieldOrStreetFootage: boolean;
  readonly hookWordsToFirstStake: number;
  readonly thesisQuestionFrac: number;
  readonly sponsorFrac?: number | null;
  readonly sponsorIsBridged?: boolean;
  readonly coveredRehookDeciles: readonly number[];
  readonly adversaryConcessionFracs: readonly number[];
  readonly verdictFrac: number;
  readonly ctaFrac: number;
  readonly ctaCount: number;
  readonly midVideoSubscribeAskCount?: number;
  readonly latestNewFactFrac: number;
  readonly presenterARollShare?: number;
  readonly plannedVisualPatterns?: readonly string[];
}

export const StrategyPacketAuditInputSchema = z.object({
  strategyId: StrategyPresetIdSchema,
  forbiddenEngines: z.array(NarrativeEngineSchema),
  stakes: z.enum(["wallet", "civic", "wonder", "geopolitical", "valuation"]),
  hasDatedHourTimeline: z.boolean(),
  hasShowablePrimaryArtifact: z.boolean(),
  hasFieldOrStreetFootage: z.boolean(),
  hookWordsToFirstStake: z.number().min(0),
  thesisQuestionFrac: z.number().min(0).max(1),
  sponsorFrac: z.number().min(0).max(1).nullable().optional(),
  sponsorIsBridged: z.boolean().optional(),
  coveredRehookDeciles: z.array(z.number().int().min(1).max(10)),
  adversaryConcessionFracs: z.array(z.number().min(0).max(1)),
  verdictFrac: z.number().min(0).max(1),
  ctaFrac: z.number().min(0).max(1),
  ctaCount: z.number().int().min(0),
  midVideoSubscribeAskCount: z.number().int().min(0).optional(),
  latestNewFactFrac: z.number().min(0).max(1),
  presenterARollShare: z.number().min(0).max(1).optional(),
  plannedVisualPatterns: z.array(z.string()).optional(),
});

export interface StrategyViolationFlag {
  readonly ruleId: string;
  readonly severity: "P0" | "P1";
  readonly message: string;
}

export interface StrategyPacketAuditResult {
  readonly valid: boolean;
  readonly scoreOutOf10: number;
  readonly arithmeticSummary: string;
  readonly p0Flags: readonly StrategyViolationFlag[];
  readonly p1Flags: readonly StrategyViolationFlag[];
}

/**
 * Validates a full episode Strategy Packet against the `channel-structure` rubric and `R43–R47` hard guardrails.
 */
export function validateStrategyPacket(
  rawInput: StrategyPacketAuditInput
): StrategyPacketAuditResult {
  const input = StrategyPacketAuditInputSchema.parse(rawInput);
  const preset = STRATEGY_PRESETS[input.strategyId];

  const p0Flags: StrategyViolationFlag[] = [];
  const p1Flags: StrategyViolationFlag[] = [];

  // R43: Non-empty forbidden engines
  if (input.forbiddenEngines.length === 0) {
    p0Flags.push({
      ruleId: "R43",
      severity: "P0",
      message: "forbiddenEngines cannot be empty; every strategy packet must ban >= 1 incompatible engine.",
    });
  }

  // Primary engine cannot be in forbiddenEngines
  if (input.forbiddenEngines.indexOf(preset.primaryEngine) !== -1) {
    p0Flags.push({
      ruleId: "R42",
      severity: "P0",
      message: `Primary engine "${preset.primaryEngine}" for ${preset.id} is contradicted by forbiddenEngines.`,
    });
  }

  // R44: Clocked guardrail + fake countdown hour-clock check
  if (!input.hasDatedHourTimeline) {
    if (preset.primaryEngine === "clocked") {
      p0Flags.push({
        ruleId: "R44",
        severity: "P0",
        message: "STR-AIC-CLOCKED selected without a real hour-by-hour dated timeline.",
      });
    } else if (input.forbiddenEngines.indexOf("clocked") === -1) {
      p0Flags.push({
        ruleId: "R44",
        severity: "P0",
        message: "No dated hour-level timeline exists; `clocked` MUST be listed in forbiddenEngines.",
      });
    }
  }

  const patterns = input.plannedVisualPatterns ?? [];
  if (input.forbiddenEngines.indexOf("clocked") !== -1) {
    for (let i = 0; i < patterns.length; i++) {
      if (
        FORBIDDEN_ENGINE_GUARDRAILS.R44.bannedVisualPatterns.indexOf(patterns[i]) !== -1
      ) {
        p0Flags.push({
          ruleId: "R44",
          severity: "P0",
          message: `Banned fake countdown hour-clock visual pattern "${patterns[i]}" detected while \`clocked\` is forbidden.`,
        });
      }
    }
  }

  // R45: Ban pure ladder spine on wallet stakes
  if (input.stakes === "wallet" && preset.primaryEngine === "ladder") {
    p1Flags.push({
      ruleId: "R45",
      severity: "P1",
      message: "Wallet/household solvency stakes should not use pure `ladder` as primary spine.",
    });
  }

  // R46: Ban street & field off the street
  if (!input.hasFieldOrStreetFootage) {
    if (preset.primaryEngine === "field" || preset.primaryEngine === "street") {
      p1Flags.push({
        ruleId: "R46",
        severity: "P1",
        message: `Engine "${preset.primaryEngine}" requires verified location/interview footage.`,
      });
    }
    if (input.forbiddenEngines.indexOf("street") === -1) {
      p1Flags.push({
        ruleId: "R46",
        severity: "P1",
        message: "Studio archival episodes must explicitly ban `street` in forbiddenEngines.",
      });
    }
  }

  // R47: Ban artifact without a showable primary document/map
  if (preset.primaryEngine === "artifact" && !input.hasShowablePrimaryArtifact) {
    p0Flags.push({
      ruleId: "R47",
      severity: "P0",
      message: "STR-FISHER-ARTIFACT requires a verified primary filing, table, or map.",
    });
  }

  // R01 & R02: 0.00–0.10 Hook & Stake window
  if (input.hookWordsToFirstStake > preset.maxHookWordsToFirstStake) {
    p0Flags.push({
      ruleId: "R01",
      severity: "P0",
      message: `First stake lands at word ${input.hookWordsToFirstStake} (exceeds ${preset.maxHookWordsToFirstStake}-word 15s cap).`,
    });
  }
  if (input.thesisQuestionFrac > preset.hookAndStakeWindow.end) {
    p0Flags.push({
      ruleId: "R02",
      severity: "P0",
      message: `Thesis question at ${input.thesisQuestionFrac.toFixed(3)} exceeds 0.10 opening cap.`,
    });
  }

  // R08–R11: Optional bridged sponsor window
  if (input.sponsorFrac !== undefined && input.sponsorFrac !== null) {
    if (!preset.sponsorPolicy.allowed || !preset.sponsorPolicy.window) {
      p0Flags.push({
        ruleId: "R08",
        severity: "P0",
        message: `${preset.id} forbids mid-roll sponsor reads (ad-free AIC architecture).`,
      });
    } else {
      const { start, end } = preset.sponsorPolicy.window;
      if (input.sponsorFrac < start || input.sponsorFrac > end) {
        p0Flags.push({
          ruleId: "R08",
          severity: "P0",
          message: `Sponsor at ${input.sponsorFrac.toFixed(3)} falls outside ${preset.id} window [${start.toFixed(2)}, ${end.toFixed(2)}].`,
        });
      }
      if (preset.sponsorPolicy.bridgedRequired && input.sponsorIsBridged === false) {
        p1Flags.push({
          ruleId: "R10",
          severity: "P1",
          message: "Sponsor read must be topically bridged to the surrounding beat.",
        });
      }
    }
  }

  // R13: Decile re-hook coverage (D01–D10)
  const uniqueDeciles = new Set<number>(input.coveredRehookDeciles);
  if (uniqueDeciles.size < 10) {
    p0Flags.push({
      ruleId: "R13",
      severity: "P0",
      message: `Decile re-hook audit covered ${uniqueDeciles.size}/10 deciles; every decile D01–D10 must contain >= 1 active re-hook.`,
    });
  }

  // R19 / R40: Fair adversary concession in 0.60–0.85 (or multi-act steelman + late concession)
  if (preset.adversaryConcessionPolicy.required) {
    const { start, end } = preset.adversaryConcessionPolicy.primaryWindow;
    const hasWindowConcession = input.adversaryConcessionFracs.some(
      (f) => f >= start && f <= end
    );
    if (
      !hasWindowConcession ||
      input.adversaryConcessionFracs.length <
        preset.adversaryConcessionPolicy.minConcessions
    ) {
      p0Flags.push({
        ruleId: "R19",
        severity: "P0",
        message: `${preset.id} requires >= ${preset.adversaryConcessionPolicy.minConcessions} fair adversary concessions including >= 1 inside [${start.toFixed(2)}, ${end.toFixed(2)}].`,
      });
    }
  }

  // R25 / R27 / R38: 0.90–1.00 Bookend verdict + single CTA + no new facts after 0.90
  const { verdictWindow, forbidNewFactsAfterFrac, forbidMidVideoSubscribeAsk } =
    preset.bookendVerdictPolicy;
  if (input.verdictFrac < verdictWindow.start || input.verdictFrac > verdictWindow.end) {
    p0Flags.push({
      ruleId: "R25",
      severity: "P0",
      message: `Bookend verdict at ${input.verdictFrac.toFixed(3)} must land inside [0.90, 1.00].`,
    });
  }
  if (input.latestNewFactFrac > forbidNewFactsAfterFrac) {
    p1Flags.push({
      ruleId: "R38",
      severity: "P1",
      message: `New factual evidence introduced at ${input.latestNewFactFrac.toFixed(3)} (> ${forbidNewFactsAfterFrac.toFixed(2)} close threshold).`,
    });
  }
  if (input.ctaCount !== 1 || input.ctaFrac < verdictWindow.start) {
    p1Flags.push({
      ruleId: "R27",
      severity: "P1",
      message: `Expected exactly 1 lean-matched CTA inside [0.90, 1.00]; received count=${input.ctaCount} at frac=${input.ctaFrac.toFixed(3)}.`,
    });
  }
  if (
    forbidMidVideoSubscribeAsk &&
    (input.midVideoSubscribeAskCount ?? 0) > 0
  ) {
    p1Flags.push({
      ruleId: "R22",
      severity: "P1",
      message: "Mid-video subscribe nag is banned on anchor leans.",
    });
  }

  // Presenter A-roll ratio check
  if (input.presenterARollShare !== undefined) {
    const { minShare, maxShare } = preset.presenterARollTarget;
    if (
      input.presenterARollShare < minShare ||
      input.presenterARollShare > maxShare
    ) {
      p1Flags.push({
        ruleId: "AROLL-RATIO",
        severity: "P1",
        message: `Presenter A-roll share ${(input.presenterARollShare * 100).toFixed(1)}% outside ${preset.id} target band [${(minShare * 100).toFixed(0)}%, ${(maxShare * 100).toFixed(0)}%].`,
      });
    }
  }

  const p0Deduction = p0Flags.length * 2.0;
  const p1Deduction = Math.min(4.0, p1Flags.length * 1.0);
  const rawScore = Math.max(0, 10 - p0Deduction - p1Deduction);
  let cappedScore = rawScore;
  let capNote = "none";
  if (p0Flags.length >= 1 && cappedScore > 6.0) {
    cappedScore = 6.0;
    capNote = "P0<=6.0";
  } else if (p1Flags.length >= 2 && cappedScore > 8.0) {
    cappedScore = 8.0;
    capNote = "2xP1<=8.0";
  }

  return {
    valid: p0Flags.length === 0,
    scoreOutOf10: cappedScore,
    arithmeticSummary: `10 - ${p0Deduction.toFixed(1)} (P0) - ${p1Deduction.toFixed(1)} (P1) = ${rawScore.toFixed(1)}; cap=${capNote}`,
    p0Flags,
    p1Flags,
  };
}
