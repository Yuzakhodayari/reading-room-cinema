import React, { useMemo } from "react";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { CameraPreviewStage, PreviewMode } from "./glass/CameraPreviewStage";
import { LiquidGlassObject } from "./glass/LiquidGlassObject";
import {
  GlassBottomDock,
  GlassCard,
  GlassCornerPill,
  GlassFloatingToolbar,
  GlassSplitModal,
  GlassToastAlert,
  resolveGlassPreset,
} from "./glass/LiquidGlassPresets";
import {
  DepthSandwichPreset,
  PresenterDepthMode,
  PresenterDepthStage,
} from "./glass/PresenterDepthStage";
import { SfxTimeline, SfxTimelineItem } from "./SfxCue";
import { SourceBadge } from "./SourceBadge";
import { LayerLifecyclePlan } from "../design/choreography";
import { FONTS } from "../design/fonts";
import { COLORS, OVER_FOOTAGE_PALETTE, PAGE_PALETTE } from "../design/tokens";
import type {
  DepthSandwichConfig,
  DepthSandwichSpec,
  DirectorBeat as CanonicalDirectorBeat,
  DirectorSfxCue,
} from "../director/schema";
import { BlueprintThemeRegister, SceneBlueprint } from "../generative/blueprintTypes";
import { SceneBlueprintRenderer } from "../generative/SceneBlueprintRenderer";
import { CorridorId, GeoQueryTarget, resolveGeoQuery } from "../maps";
import { EntryAction, ExitAction, InPlaceAction, ObjectAnimator } from "../motion/ObjectAnimator";
import { isEntryAction, isExitAction, isInPlaceAction } from "../motion/primitives";
import { PropVaultRenderer } from "../registry/props";
import {
  LEGACY_24_STYLE_IDS,
  findStyleRecipe,
  renderStyleRecipe,
} from "../styles";
import {
  BlobSimulation,
  DataPhysicalCard,
  MapExplainer,
  WhiteModel3D,
} from "../styles/dataMaps3D";
import {
  ArchiveLightTable,
  CaptionNewsCard,
  CitySymphonyFrame,
  KinoMontageStrip,
  LiveCountdownSplit,
  NewsPackageLowerThird,
  TelestratorOverlay,
  VisualInvestigationBoard,
} from "../styles/docBroadcast";
import {
  InstructionManualCard,
  IsometricScene,
  StickFigureStage,
  StickerCutout,
} from "../styles/diagramMetaphor";
import {
  CollageCutout,
  Newsreel1920s,
  SilentFilmCard,
  SpyTitleSequence,
  StainedGlassFrame,
} from "../styles/vintageEditorial";
import { DataTicker } from "../typography/DataTicker";
import { EditorialHeadline } from "../typography/EditorialHeadline";
import {
  AnyTimedWord,
  KineticText,
  KineticTextMode,
  connectWhisperWordsToBeat,
  isTypographyMode,
  synthesizeTimedWords,
} from "../typography/KineticText";

export type { DirectorSfxCue };

export interface FlexibleBeatInput {
  id?: string;
  startFrame?: number;
  endFrame?: number;
  durationSec?: number;
  category?: string;
  spokenText?: string;
  text?: string;
  gluedSpokenText?: string;
  framing?: string;
  paletteMode?: "page" | "over-footage";
  styleFamily?: string;
  styleWorld?: string;
  recipeId?: string;
  register?: string;
  visualRegister?: string;
  componentHint?: string;
  motionAction?: string;
  glassPreset?: string;
  glassRig?: string;
  typographyMode?: string;
  depthSandwich?: DepthSandwichSpec;
  depthMode?: PresenterDepthMode;
  layering?: string;
  personAlphaSrc?: string;
  personMaskSrc?: string;
  arollSrc?: string;
  setPieceId?: string;
  setPieceSlug?: string;
  sceneBlueprint?: SceneBlueprint | string;
  propIds?: string[];
  mapTarget?: GeoQueryTarget;
  geoQuery?: string;
  geoCorridor?: string;
  mapRegion?: "us" | "usa" | "world";
  highlightLabel?: string;
  sfxCues?: DirectorSfxCue[];
  musicEnergy?: string;
  cutReason?: string;
  sourceCitation?: string;
  title?: string;
  headline?: string;
  headlineLabel?: string;
  subtitle?: string;
  timedWords?: ReadonlyArray<AnyTimedWord>;
  continuityEntityId?: string;
  continuityEntities?: string[];
  lutId?: string;
  musicStemId?: string;
  musicTrackId?: string;
  cameraAction?: string;
  cameraTrajectory?: string;
  data?: Record<string, unknown>;
}

export type DirectorBeat = FlexibleBeatInput & {
  id: string;
  startFrame: number;
  endFrame: number;
  durationSec: number;
  category: string;
  spokenText: string;
  framing: string;
  styleFamily: string;
  componentHint: string;
  motionAction: string;
  sfxCues: DirectorSfxCue[];
  musicEnergy: string;
  cutReason: string;
};

export interface DirectorPlan {
  title: string;
  fps: number;
  totalFrames: number;
  beats: DirectorBeat[];
  musicStem?: string;
  musicStemId?: string;
  lutId?: string;
}

export type DirectorBeatRendererProps = {
  beat?: FlexibleBeatInput | CanonicalDirectorBeat;
  previewMode?: PreviewMode;
  depthMode?: PresenterDepthMode | null;
  cameraSrc?: string;
  presenterAlphaSrc?: string;
  personMaskSrc?: string;
  renderAudio?: boolean;
};

export const DEFAULT_DIRECTOR_BEAT: DirectorBeat = {
  id: "beat-sample-001",
  startFrame: 0,
  endFrame: 150,
  durationSec: 5,
  category: "receipt-proof",
  spokenText:
    "Individual paychecks now supply 84% of federal receipts while corporate taxes fell to 7%.",
  framing: "talking-head-with-glass",
  paletteMode: "over-footage",
  styleFamily: "liquid-glass",
  recipeId: "liquid-glass-card",
  componentHint: "LiquidGlassObject:card",
  motionAction: "slide-left -> card-tilt-3d -> fade-blur-out",
  glassPreset: "card",
  typographyMode: "marker-sweep",
  sfxCues: [{ cue: "glass-enter", offsetFrame: 0, volume: 0.65 }],
  musicEnergy: "calm",
  cutReason: "Anchor primary statistic while speaker introduces receipt gap.",
  sourceCitation: "U.S. Treasury Monthly Statement, Table 9",
};

const LEGACY_24_SET = new Set<string>(LEGACY_24_STYLE_IDS as readonly string[]);

const EXTENDED_GLASS_RIG_SET = new Set<string>([
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
]);

const AI_DIRECTOR_RECIPE_ALIAS_MAP: Readonly<Record<string, string>> = {
  "macro-diverging-jaws": "DivergingJawsChart",
  "macro-negative-fcf-waterfall": "NegativeFcfWaterfall",
  "macro-wealth-decile-monoliths": "WealthDecileMonoliths",
  "macro-auction-price-shockwave": "AuctionPriceShockwave",
  "macro-jevons-deflation-curve": "JevonsDeflationCurve",
  "macro-sovereign-spread-flip": "SovereignSpreadFlip",
  "macro-debt-deflation-jaws-1933": "DebtDeflationJaws1933",
  "macro-gold-vs-fiat-corridor": "GoldVsFiatFedCorridor",
  "macro-generational-horizon-rule": "GenerationalHorizonRule",
  "macro-stacked-share-shift": "StackedShareShift",
  "macro-capex-depreciation-gap": "CapexVsDepreciationGap",
  "macro-foreign-holder-rollover": "ForeignHolderRollover",
  "macro-reserve-attestation-bar": "ReserveAttestationBar",
  "macro-trust-fund-depletion": "TrustFundDepletionCurve",
  "macro-demographic-cliff-pyramid": "DemographicCliffPyramid",
  "macro-cost-exchange-ratio": "CostExchangeRatioBar",
  "macro-bandwidth-concentration": "BandwidthConcentrationBar",
  "macro-escrow-shock-breakdown": "EscrowShockBreakdown",
  "macro-mineral-refining-share": "MineralRefiningDominance",
  "macro-waitlist-queue-histogram": "WaitlistQueueHistogram",
  "macro-real-vs-nominal-shrink": "RealVsNominalShrink",
  "macro-margin-bid-comparison": "MarginBidComparison",
  "forensic-fiscal-ledger-table9": "FiscalLedgerTableStage",
  "forensic-court-syllabus-wielechowski": "SupremeCourtSyllabusStage",
  "forensic-sec-10k-cashflow-loupe": "Sec10KFootnoteStretch",
  "forensic-alaska-veto-memorandum": "VetoPenBudgetLedger",
  "forensic-ministry-of-food-1941": "ArchivalRationBook1941",
  "forensic-three-mile-island-ppa": "FoiaRedactionDeclassify",
  "sim-hydraulic-tax-siphon": "DualTaxPlumbingSchematic",
  "sim-three-escape-hatch-board": "FourEscapeHatchesBoard",
  "sim-bom-cost-layer-drop": "SupplyChainBomStrip",
  "sim-claire-budget-stress-rig": "LongitudinalHouseholdDossier",
  "sim-debt-ceiling-priority-gate": "SovereignPrioritySpillway",
  "sim-closed-cloud-credit-wall": "ClosedComputeScripWallet",
  "sim-transformer-permitting-queue": "TransformerQueueBottleneck",
};

const NON_BREAKING_ABBREVS = new Set<string>([
  "v",
  "vs",
  "u.s",
  "u.k",
  "dr",
  "mr",
  "mrs",
  "ms",
  "prof",
  "sr",
  "jr",
  "st",
  "no",
  "fig",
  "inc",
  "corp",
  "ltd",
  "co",
  "jan",
  "feb",
  "mar",
  "apr",
  "aug",
  "sept",
  "oct",
  "nov",
  "dec",
  "al",
  "e.g",
  "i.e",
]);

const CATEGORY_LABELS: Record<string, string> = {
  hook: "Opening Hook",
  "thesis-promise": "Core Thesis",
  "receipt-proof": "Key Record",
  "metaphor-story": "Illustration",
  "good-work-punchline": "Aside",
  "history-archive": "Archive",
  "map-geopolitics": "Geography",
  "warning-escalation": "Risk Flag",
  "claire-ledger": "Household Ledger",
  "open-loop": "Looking Ahead",
  takeaway: "Takeaway",
};

const STYLE_LABELS: Record<string, string> = {
  "liquid-glass": "Liquid Glass",
  "doc-broadcast": "Editorial",
  "vintage-editorial": "Archive",
  "diagram-metaphor": "Diagram",
  "data-maps-3d": "Data & Maps",
  "macro-telemetry": "Macro Telemetry",
  "forensic-exhibits": "Forensic Exhibit",
  "system-simulators": "System Simulator",
  "ui-satire-collage": "Household Ledger",
  "generative-setpiece": "Set-Piece Stage",
};

export function resolvePlayableMediaSrc(raw?: string): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (/^(https?:|blob:|data:|\/)/i.test(trimmed)) return trimmed;
  // Local Windows drive path (e.g. D:\...) or UNC path is not directly fetchable in headless Chromium
  if (/^[A-Za-z]:[\\/]/.test(trimmed) || trimmed.indexOf("\\") !== -1) {
    return undefined;
  }
  return staticFile(trimmed);
}

/**
 * Normalizes both `planner.ts`/`plan-edit.mjs` beats and `tools/ai_director.mjs` Equalizer beats
 * into a guaranteed, strictly typed `DirectorBeat`.
 */
export function normalizeDirectorBeat(
  raw?: FlexibleBeatInput | CanonicalDirectorBeat
): DirectorBeat {
  if (!raw) return DEFAULT_DIRECTOR_BEAT;
  const startFrame = typeof raw.startFrame === "number" ? raw.startFrame : 0;
  const durationSec =
    typeof raw.durationSec === "number" && raw.durationSec > 0 ? raw.durationSec : 5;
  const endFrame =
    typeof raw.endFrame === "number" && raw.endFrame > startFrame
      ? raw.endFrame
      : startFrame + Math.max(15, Math.round(durationSec * 30));
  const spokenText = (raw.spokenText || raw.text || raw.gluedSpokenText || "").trim();
  const framing = raw.framing || "talking-head-with-glass";
  const paletteMode =
    raw.paletteMode || (framing === "fullscreen-cutaway" ? "page" : "over-footage");
  const title = raw.title || raw.headline || raw.headlineLabel;
  const register = raw.register || raw.visualRegister;
  const musicStemId = raw.musicStemId || raw.musicTrackId;
  const cameraAction = raw.cameraAction || raw.cameraTrajectory;

  return {
    ...raw,
    id: raw.id || "beat-001",
    startFrame,
    endFrame,
    durationSec,
    category: raw.category || "receipt-proof",
    spokenText,
    framing,
    paletteMode,
    styleFamily: raw.styleFamily || (paletteMode === "page" ? "doc-broadcast" : "liquid-glass"),
    componentHint:
      raw.componentHint || (paletteMode === "page" ? "CaptionNewsCard" : "LiquidGlassObject:card"),
    motionAction: raw.motionAction || "slide-left -> glow-rim -> fade-blur-out",
    sfxCues: Array.isArray(raw.sfxCues) ? raw.sfxCues : [],
    musicEnergy: raw.musicEnergy || "calm",
    cutReason: raw.cutReason || "Editorial beat",
    ...(title ? { title } : {}),
    ...(register ? { register } : {}),
    ...(musicStemId ? { musicStemId } : {}),
    ...(cameraAction ? { cameraAction } : {}),
  };
}

function formatCategoryLabel(category: string): string {
  const key = (category || "").trim().toLowerCase();
  if (CATEGORY_LABELS[key]) return CATEGORY_LABELS[key];
  return (category || "Note").replace(/[-_]+/g, " ");
}

function formatStyleLabel(styleFamily: string, styleWorld?: string): string {
  const worldKey = (styleWorld || "").trim().toLowerCase();
  if (worldKey && STYLE_LABELS[worldKey]) return STYLE_LABELS[worldKey];
  const key = (styleFamily || "").trim().toLowerCase();
  if (STYLE_LABELS[key]) return STYLE_LABELS[key];
  return (styleFamily || "Editorial").replace(/[-_]+/g, " ");
}

function extractAllMetrics(text: string): Array<{
  raw: string;
  numeric: number;
  prefix: string;
  suffix: string;
}> {
  const regex =
    /([$€£])?\s*(\d+(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)(?:\s*(%|percent\b|trillion\b|billion\b|million\b|thousand\b)|([TBMK]\b))?/gi;
  const results: Array<{
    raw: string;
    numeric: number;
    prefix: string;
    suffix: string;
  }> = [];

  let match: RegExpExecArray | null = regex.exec(text);
  while (match !== null) {
    const prefix = match[1] ?? "";
    const numRaw = match[2];
    const numStr = numRaw.replace(/,/g, "");
    const numeric = Number(numStr);
    if (Number.isFinite(numeric)) {
      const unitWord = match[3] ? match[3].toLowerCase() : undefined;
      const unitAbbr = match[4] ? match[4].toUpperCase() : undefined;
      const hasCurrency = Boolean(prefix);
      const hasUnit = Boolean(unitWord || unitAbbr);
      const isYear =
        !hasCurrency &&
        !hasUnit &&
        Math.floor(numeric) === numeric &&
        numeric >= 1900 &&
        numeric <= 2099;

      if (!isYear && (hasCurrency || hasUnit)) {
        let suffix = "";
        if (unitWord === "%" || unitWord === "percent") suffix = "%";
        else if (unitWord === "trillion" || unitAbbr === "T") suffix = "T";
        else if (unitWord === "billion" || unitAbbr === "B") suffix = "B";
        else if (unitWord === "million" || unitAbbr === "M") suffix = "M";
        else if (unitWord === "thousand" || unitAbbr === "K") suffix = "K";

        results.push({
          raw: prefix + numRaw + suffix,
          numeric,
          prefix,
          suffix,
        });
      }
    }
    match = regex.exec(text);
  }

  return results;
}

function extractPrimaryMetric(text: string): {
  raw: string;
  numeric: number | null;
  prefix: string;
  suffix: string;
} | null {
  return extractAllMetrics(text)[0] ?? null;
}

function extractFirstSentence(clean: string): string {
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (ch !== "." && ch !== "!" && ch !== "?") continue;

    if (ch === "!" || ch === "?") {
      return clean.slice(0, i).trim();
    }

    const prev = i > 0 ? clean[i - 1] : "";
    const next = i + 1 < clean.length ? clean[i + 1] : "";
    if (/\d/.test(prev) && /\d/.test(next)) continue;
    if (next && /[A-Za-z.]/.test(next)) continue;

    const before = clean.slice(0, i);
    const tokenMatch = before.match(/([A-Za-z.]+)$/);
    if (tokenMatch) {
      const token = tokenMatch[1];
      const lower = token.toLowerCase();
      if (NON_BREAKING_ABBREVS.has(lower) || /^[A-Z]$/.test(token)) {
        continue;
      }
    }

    return before.trim();
  }

  return clean.replace(/[.!?]+$/, "").trim();
}

const DANGLING_TAIL_WORDS = new Set<string>([
  "of",
  "the",
  "a",
  "an",
  "to",
  "in",
  "for",
  "and",
  "or",
  "while",
  "with",
  "on",
  "at",
  "by",
  "from",
  "that",
  "who",
  "which",
  "than",
  "as",
  "into",
  "between",
]);

function trimToWholeWords(text: string, maxChars: number): string {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= maxChars) return clean;
  const cut = clean.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  const result = (lastSpace > 4 ? cut.slice(0, lastSpace) : cut).trim();
  const words = result.split(/\s+/);
  while (words.length > 2 && DANGLING_TAIL_WORDS.has(words[words.length - 1].toLowerCase())) {
    words.pop();
  }
  return words.join(" ");
}

function deriveHeadline(beat: DirectorBeat): string {
  if (beat.title && beat.title.trim()) return beat.title.trim();
  if (beat.headline && beat.headline.trim()) return beat.headline.trim();

  const clean = (beat.spokenText || "").replace(/\s+/g, " ").trim();
  const citation = (beat.sourceCitation || "").trim();
  const combined = clean + " " + citation;

  if (/\bPJM\b/i.test(combined)) {
    if (/price|auction|833|spiked|jumped|269\.92|megawatt-day/i.test(combined)) {
      return "PJM Grid Price Shock";
    }
    return "PJM Grid Capacity Crunch";
  }
  if (/escape hatch|hatches/i.test(clean)) return "Three Escape Hatches";
  if (/Alaska|Wielechowski|Permanent Fund/i.test(combined)) return "Alaska Dividend Veto";
  if (/Claire|mortgage|\$3,400|thirty-year loan|Austin/i.test(clean)) return "Claire's Mortgage Trap";
  if (/Irving Fisher|1933|debt deflation/i.test(combined)) return "Irving Fisher (1933)";
  if (/Ministry of Food|London|1941|sixteen points|submarines/i.test(combined)) {
    return "London Rationing (1941)";
  }
  if (/Ireland|Irish/i.test(combined)) return "Ireland Grid & Tax Concentration";
  if (/Table 9|paycheck|payroll|individual.*corporate|corporate.*income|federal taxes|federal receipts/i.test(combined)) {
    return "U.S. Tax Receipts";
  }
  if (/CBO|national debt|\$40\.5|\$2\.1|\$1\.83|interest|bond/i.test(combined)) {
    return "Federal Debt & Interest";
  }
  if (/\$18\.8|household.*owe|monthly payment/i.test(clean)) return "Household Debt Burden";
  if (/compute|token|credit|wallet/i.test(clean)) return "Compute Token Risk";
  if (/Three Mile Island|nuclear|reactor|power plant|transformers|electricity|print.*power|megawatts/i.test(clean)) {
    return "Physical Grid Limits";
  }
  if (/Musk|abundance|Palo Alto|whiteboard/i.test(clean)) return "The Abundance Thesis";
  if (/landlord|rent/i.test(clean)) return "Rent Due in Dollars";
  if (/running shoes|dental|robot|cheaper/i.test(clean)) return "AI Price Deflation";
  if (/bargaining|negotiate|allowance|unwritten agreement/i.test(clean)) {
    return "Bargaining Power Shift";
  }

  if (!clean) return formatCategoryLabel(beat.category);

  const firstClause = extractFirstSentence(clean) || clean;
  const subClause = firstClause.split(/[,;\u2014:]/)[0]?.trim() || firstClause;
  const words = subClause.split(/\s+/).filter(Boolean).slice(0, 5);
  while (words.length > 2 && DANGLING_TAIL_WORDS.has(words[words.length - 1].toLowerCase())) {
    words.pop();
  }
  return words.join(" ") || formatCategoryLabel(beat.category);
}

/**
 * Dynamic cartographic resolver wired directly to `resolveGeoQuery` (211 countries,
 * 51 US states, 24 corridors) — ZERO hardcoded Austin/Texas fallback!
 */
function resolveDynamicMapProps(
  beat: DirectorBeat,
  headline: string,
  paletteMode: "page" | "over-footage",
  isWarning: boolean
): {
  query: string;
  corridorId?: CorridorId;
  region: "us" | "world";
  highlightStatesFips?: string[];
  highlightLabel: string;
  routeTone: "alert" | "secondary";
} {
  const dynamicQuery =
    beat.geoQuery ||
    beat.mapTarget?.query ||
    beat.geoCorridor ||
    beat.text ||
    beat.spokenText ||
    beat.headline ||
    headline;

  const target: GeoQueryTarget = {
    ...(beat.mapTarget ? beat.mapTarget : {}),
    ...(beat.geoCorridor ? { corridorId: beat.geoCorridor as CorridorId } : {}),
    query: dynamicQuery,
    label: beat.highlightLabel || beat.mapTarget?.label,
    title: headline,
    subtitle: beat.subtitle,
    spokenText: beat.spokenText,
    ...(beat.mapRegion ? { region: beat.mapRegion } : {}),
    register: paletteMode === "over-footage" ? "over-footage-glass" : "page-editorial",
    routeTone: isWarning ? "alert" : "secondary",
    sourceNote: beat.sourceCitation,
  };

  const resolved = resolveGeoQuery(target);
  const region: "us" | "world" = resolved.atlasDataset === "usa" ? "us" : "world";
  const highlightStatesFips =
    resolved.atlasDataset === "usa"
      ? resolved.primaryStateFips
      : resolved.primaryCountryIds;

  return {
    query: dynamicQuery,
    corridorId: resolved.corridorId,
    region,
    highlightStatesFips: highlightStatesFips.length > 0 ? highlightStatesFips : undefined,
    highlightLabel: beat.highlightLabel || resolved.title || headline,
    routeTone: isWarning ? "alert" : "secondary",
  };
}

function resolveBlueprintThemeRegister(raw?: string): BlueprintThemeRegister {
  if (!raw) return "paper_editorial";
  const norm = raw.trim().toLowerCase();
  if (norm === "archival_parchment" || norm === "archival-light-table") {
    return "archival_parchment";
  }
  if (
    norm === "midnight_telemetry" ||
    norm === "geospatial-telemetry" ||
    norm === "investigation-switchboard"
  ) {
    return "midnight_telemetry";
  }
  if (norm === "drafting_blueprint" || norm === "blueprint-schematic") {
    return "drafting_blueprint";
  }
  if (norm === "vintage_newsreel" || norm === "silver-gelatin-chronicle") {
    return "vintage_newsreel";
  }
  return "paper_editorial";
}

function softenActionToken(tok: string, isPunchline: boolean): string {
  if (tok === "shutter-flash") return "blur-snap";
  if (tok === "shake-alert" && !isPunchline) return "nudge";
  if (tok === "whip-slide") return "slide-left";
  if (tok === "elastic-open" && !isPunchline) return "pop-out";
  return tok;
}

function normalizeComponentHint(beat: DirectorBeat): string {
  const raw = (beat.glassPreset || beat.componentHint || "GlassCard").trim();
  const map: Record<string, string> = {
    card: "GlassCard",
    LiquidGlassObject: "GlassCard",
    "LiquidGlassObject:card": "GlassCard",
    pill: "GlassCornerPill",
    "corner-pill": "GlassCornerPill",
    "LiquidGlassObject:pill": "GlassCornerPill",
    dock: "GlassBottomDock",
    "bottom-dock": "GlassBottomDock",
    "LiquidGlassObject:dock": "GlassBottomDock",
    toolbar: "GlassFloatingToolbar",
    "floating-toolbar": "GlassFloatingToolbar",
    "LiquidGlassObject:toolbar": "GlassFloatingToolbar",
    toast: "GlassToastAlert",
    "toast-alert": "GlassToastAlert",
    "LiquidGlassObject:toast": "GlassToastAlert",
    "split-modal": "GlassSplitModal",
    "LiquidGlassObject:split-modal": "GlassSplitModal",
  };
  return map[raw] ?? raw;
}

function resolveMotionProps(
  beat: DirectorBeat,
  durationFrames: number,
  isFullCanvas: boolean
): {
  enter: EntryAction;
  activeEffect?: InPlaceAction;
  exit?: ExitAction;
  exitDuration: number;
  lifecycle?: LayerLifecyclePlan;
} {
  const rawTokens = (beat.motionAction || "")
    .split("->")
    .map((s) => s.trim())
    .filter(Boolean);

  const isPunchline =
    beat.category.toLowerCase().indexOf("punchline") !== -1 ||
    beat.category.toLowerCase().indexOf("joke") !== -1;
  const isOverlay = beat.framing !== "fullscreen-cutaway";

  let enter: EntryAction = isFullCanvas ? "blur-snap" : isOverlay ? "slide-up" : "blur-snap";
  let activeEffect: InPlaceAction | undefined;
  let exit: ExitAction | undefined;
  let foundEntry = false;

  const entryAliasMap: Record<string, EntryAction> = {
    enter: "slide-up",
    "fade-blur": "blur-snap",
  };
  const inPlaceAliasMap: Record<string, InPlaceAction> = {
    focus: "spotlight-vignette",
    highlight: "highlight-sweep",
    "marker-sweep": "highlight-sweep",
    dock: "float-idle",
    "zoom-burst": "lens-zoom",
  };
  const exitAliasMap: Record<string, ExitAction> = {
    exit: "fade-blur-out",
    "glass-exit": "fade-blur-out",
    "fade-blur": "fade-blur-out",
  };

  for (let i = 0; i < rawTokens.length; i++) {
    const rawTok = rawTokens[i];
    const tok = softenActionToken(rawTok, isPunchline);

    if (!foundEntry && (isEntryAction(tok) || entryAliasMap[tok])) {
      enter = isEntryAction(tok) ? tok : entryAliasMap[tok];
      foundEntry = true;
    } else if (!activeEffect && (isInPlaceAction(tok) || inPlaceAliasMap[tok])) {
      activeEffect = isInPlaceAction(tok) ? tok : inPlaceAliasMap[tok];
      foundEntry = true;
    } else if (!exit && (isExitAction(tok) || exitAliasMap[tok])) {
      exit = isExitAction(tok) ? tok : exitAliasMap[tok];
    }
  }

  const exitDuration = durationFrames >= 24 ? Math.min(10, Math.floor(durationFrames / 5)) : 0;

  const hasLifecycleTokens = rawTokens.some((t) =>
    ["enter", "focus", "dock", "highlight", "highlight-sweep", "marker-sweep", "nudge"].indexOf(
      t
    ) !== -1
  );

  let lifecycle: LayerLifecyclePlan | undefined;
  if (hasLifecycleTokens && durationFrames >= 24) {
    const hint = normalizeComponentHint(beat);
    const isBottomOrTopBar = hint === "GlassBottomDock" || hint === "GlassFloatingToolbar";

    lifecycle = {
      enterFrame: 0,
      enterDuration: 1,
      initial: { x: 0, y: 0, scale: 1, opacity: 1 },
      entered: { x: 0, y: 0, scale: 1, opacity: 1 },
    };

    if (rawTokens.indexOf("focus") !== -1) {
      lifecycle.focusFrame = Math.floor(durationFrames * 0.24);
      lifecycle.focusDuration = 12;
      lifecycle.focused = { scale: 1.03, focusGlow: 0.85 };
    }
    if (
      rawTokens.indexOf("highlight") !== -1 ||
      rawTokens.indexOf("highlight-sweep") !== -1 ||
      rawTokens.indexOf("marker-sweep") !== -1
    ) {
      lifecycle.highlightFrame = Math.floor(durationFrames * 0.42);
      lifecycle.highlightDuration = 16;
    }
    if (rawTokens.indexOf("nudge") !== -1) {
      lifecycle.nudgeFrame = Math.floor(durationFrames * 0.45);
      lifecycle.nudgeDuration = 10;
    }
    if (rawTokens.indexOf("dock") !== -1) {
      lifecycle.dockFrame = Math.floor(durationFrames * 0.66);
      lifecycle.dockDuration = 14;
      lifecycle.docked = isBottomOrTopBar
        ? { x: 0, y: 8, scale: 0.96, opacity: 1 }
        : { x: 0, y: 88, scale: 0.9, opacity: 1 };
    }
  }

  return {
    enter,
    activeEffect,
    exit: exit ?? (exitDuration > 0 ? "fade-blur-out" : undefined),
    exitDuration,
    lifecycle,
  };
}

function resolveDefaultPreviewMode(beat: DirectorBeat, explicit?: PreviewMode): PreviewMode {
  if (explicit) return explicit;
  return beat.framing === "fullscreen-cutaway" ? "light-editorial" : "transparent";
}

function resolveGlassSafeWrapperStyle(
  safePlacement: "right-third" | "bottom-dock" | "top-bar",
  isFullscreen: boolean
): React.CSSProperties {
  if (isFullscreen) {
    return {
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    };
  }
  if (safePlacement === "bottom-dock") {
    return {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: "56px",
      display: "flex",
      justifyContent: "center",
    };
  }
  if (safePlacement === "top-bar") {
    return {
      position: "absolute",
      left: 0,
      right: 0,
      top: "48px",
      display: "flex",
      justifyContent: "center",
    };
  }
  return { position: "absolute", right: "68px", top: "160px" };
}

interface BeatLayoutSlot {
  node: React.ReactNode;
  wrapperStyle?: React.CSSProperties;
  fullCanvas?: boolean;
}

const PagePaperCard: React.FC<{
  badge: string;
  subtitle?: string;
  title: string;
  body: string;
  metric?: { value: string; label?: string };
  citation?: string;
  isWarning?: boolean;
  width?: number;
}> = ({
  badge,
  subtitle,
  title,
  body,
  metric,
  citation,
  isWarning = false,
  width = 680,
}) => (
  <div
    style={{
      width,
      padding: "32px 36px",
      borderRadius: "16px",
      backgroundColor: PAGE_PALETTE.paperLight,
      border: `1px solid ${isWarning ? PAGE_PALETTE.riskBorder : PAGE_PALETTE.paperBorder}`,
      borderTop: `4px solid ${isWarning ? PAGE_PALETTE.brickRed : PAGE_PALETTE.navy}`,
      boxShadow: "0 22px 48px -12px rgba(28, 43, 58, 0.14)",
      userSelect: "none",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        paddingBottom: "14px",
        marginBottom: "18px",
        borderBottom: `1px solid ${PAGE_PALETTE.paperBorder}`,
      }}
    >
      <span
        style={{
          fontFamily: FONTS.mono,
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: isWarning ? PAGE_PALETTE.brickRed : PAGE_PALETTE.paperLight,
          backgroundColor: isWarning ? PAGE_PALETTE.riskFill : PAGE_PALETTE.navy,
          border: `1px solid ${isWarning ? PAGE_PALETTE.riskBorder : PAGE_PALETTE.navy}`,
          borderRadius: "8px",
          padding: "4px 10px",
        }}
      >
        {badge}
      </span>
      {subtitle && (
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: "11px",
            color: PAGE_PALETTE.muted,
            letterSpacing: "0.04em",
          }}
        >
          {subtitle}
        </span>
      )}
    </div>

    <h3
      style={{
        margin: 0,
        fontFamily: FONTS.serif,
        fontSize: "28px",
        fontWeight: 700,
        lineHeight: 1.24,
        letterSpacing: "-0.015em",
        color: PAGE_PALETTE.navy,
      }}
    >
      {title}
    </h3>

    {metric && (
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "16px",
          marginTop: "18px",
          padding: "16px 20px",
          borderRadius: "12px",
          backgroundColor: isWarning ? PAGE_PALETTE.riskFill : PAGE_PALETTE.paper,
          border: `1px solid ${isWarning ? PAGE_PALETTE.riskBorder : PAGE_PALETTE.paperBorder}`,
        }}
      >
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: "38px",
            fontWeight: 800,
            fontVariantNumeric: "tabular-nums lining-nums",
            color: isWarning ? PAGE_PALETTE.brickRed : PAGE_PALETTE.navy,
            lineHeight: 1,
          }}
        >
          {metric.value}
        </span>
        {metric.label && (
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: "11px",
              color: PAGE_PALETTE.muted,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {metric.label}
          </span>
        )}
      </div>
    )}

    <div
      style={{
        marginTop: "16px",
        fontFamily: FONTS.sans,
        fontSize: "16px",
        fontWeight: 500,
        lineHeight: 1.58,
        color: PAGE_PALETTE.navy,
      }}
    >
      {body}
    </div>

    {citation && (
      <div
        style={{
          marginTop: "20px",
          paddingTop: "14px",
          borderTop: `1px solid ${PAGE_PALETTE.paperBorder}`,
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "3px",
            height: "14px",
            borderRadius: "2px",
            backgroundColor: isWarning ? PAGE_PALETTE.brickRed : PAGE_PALETTE.navy,
          }}
        />
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: "11px",
            color: PAGE_PALETTE.muted,
            letterSpacing: "0.03em",
          }}
        >
          {citation}
        </span>
      </div>
    )}
  </div>
);

function renderBeatComponent(
  beat: DirectorBeat,
  beatFrames: number,
  fps: number,
  glassLifecycle?: LayerLifecyclePlan,
  mediaOpts?: {
    cameraSrc?: string;
    presenterAlphaSrc?: string;
    personMaskSrc?: string;
  }
): BeatLayoutSlot {
  const hint = normalizeComponentHint(beat);
  const headline = deriveHeadline(beat);
  const metrics = extractAllMetrics(beat.spokenText);
  const metric = metrics[0] ?? null;
  const secondMetric = metrics[1] ?? null;
  const categoryLabel = formatCategoryLabel(beat.category);
  const styleLabel = formatStyleLabel(beat.styleFamily, beat.styleWorld);

  const isWarning =
    beat.category.toLowerCase().indexOf("warn") !== -1 ||
    beat.category.toLowerCase().indexOf("flag") !== -1 ||
    beat.category.toLowerCase().indexOf("risk") !== -1;
  const isJoke =
    beat.category.toLowerCase().indexOf("joke") !== -1 ||
    beat.category.toLowerCase().indexOf("aside") !== -1 ||
    beat.category.toLowerCase().indexOf("humor") !== -1 ||
    beat.category.toLowerCase().indexOf("punchline") !== -1;

  const isFullscreen = beat.framing === "fullscreen-cutaway";
  const isPageCutaway =
    beat.paletteMode === "page" || (beat.paletteMode !== "over-footage" && isFullscreen);
  const overFootageGlassTint = isWarning ? "warning" : "navy-glass";
  const kineticMode: KineticTextMode = isTypographyMode(beat.typographyMode ?? "")
    ? (beat.typographyMode as KineticTextMode)
    : "word-pop";

  // 0A. Declarative Custom SceneBlueprint or 24 Signature Set-Pieces (Pillar #13)
  const blueprintTarget = beat.sceneBlueprint || beat.setPieceId || beat.setPieceSlug;
  if (blueprintTarget) {
    const bpThemeReg = resolveBlueprintThemeRegister(beat.register);
    return {
      fullCanvas: true,
      node: (
        <SceneBlueprintRenderer
          blueprint={blueprintTarget}
          surfaceMode={isPageCutaway ? "page" : "over-footage"}
          overFootagePlacement={isPageCutaway ? "right-third" : "right-third"}
          themeRegister={bpThemeReg}
          cameraSrc={mediaOpts?.cameraSrc}
          presenterAlphaSrc={mediaOpts?.presenterAlphaSrc}
          personMaskSrc={mediaOpts?.personMaskSrc}
        />
      ),
    };
  }

  // 0B. Extended 18-Preset Smoked-Navy Liquid Glass Rigs (Pillar #1)
  const rawGlassRig = (beat.glassRig || beat.glassPreset || "").trim().toLowerCase();
  if (!isPageCutaway && EXTENDED_GLASS_RIG_SET.has(rawGlassRig)) {
    const presetMeta = resolveGlassPreset(rawGlassRig);
    return {
      wrapperStyle: resolveGlassSafeWrapperStyle(presetMeta.safePlacement, isFullscreen),
      node: renderStyleRecipe("liquid-glass-" + presetMeta.id, {
        title: headline,
        subtitle: beat.spokenText,
        eyebrow: categoryLabel,
        headline,
        body: beat.spokenText,
        metric: metric ? metric.raw : undefined,
        secondaryMetric: secondMetric ? secondMetric.raw : undefined,
        delta: isWarning ? "Risk Signal" : undefined,
        sourceCitation: beat.sourceCitation,
        paletteMode: "over-footage",
        atFrame: 0,
        duration: beatFrames,
        enableSfx: false,
      }),
    };
  }

  // 0C. Unified 162-Recipe Style Worlds Dispatch (Macro Telemetry, Forensic Exhibits,
  // System Simulators, UI Satire, Corridor Cartography, Generative Set-Pieces)
  const rawRecipeKey = beat.recipeId ? (AI_DIRECTOR_RECIPE_ALIAS_MAP[beat.recipeId] || beat.recipeId) : undefined;
  const matchedExtendedRecipe =
    rawRecipeKey && !LEGACY_24_SET.has(rawRecipeKey)
      ? findStyleRecipe(rawRecipeKey)
      : !LEGACY_24_SET.has(beat.componentHint)
        ? findStyleRecipe(beat.componentHint)
        : undefined;

  if (
    matchedExtendedRecipe &&
    !matchedExtendedRecipe.isLegacy24 &&
    matchedExtendedRecipe.styleWorld !== "liquid-glass" &&
    matchedExtendedRecipe.componentName !== "MapExplainer"
  ) {
    const dynMap =
      matchedExtendedRecipe.styleWorld === "data-maps-3d"
        ? resolveDynamicMapProps(beat, headline, isPageCutaway ? "page" : "over-footage", isWarning)
        : undefined;

    return {
      fullCanvas: isPageCutaway || isFullscreen,
      wrapperStyle:
        isPageCutaway || isFullscreen ? undefined : { position: "absolute", right: "68px", top: "150px" },
      node: renderStyleRecipe(matchedExtendedRecipe.id, {
        title: headline,
        subtitle: beat.spokenText,
        eyebrow: categoryLabel,
        headline,
        body: beat.spokenText,
        metric: metric ? metric.raw : undefined,
        secondaryMetric: secondMetric ? secondMetric.raw : undefined,
        delta: isWarning ? "Risk Signal" : undefined,
        sourceCitation: beat.sourceCitation,
        paletteMode: isPageCutaway ? "page" : "over-footage",
        atFrame: 0,
        duration: beatFrames,
        enableSfx: false,
        blueprintId: beat.setPieceId,
        corridorId: dynMap?.corridorId,
      }),
    };
  }

  // 1. Six Core Apple Liquid Glass Presets or Page Cutaway Card
  if (hint === "GlassCard") {
    if (isPageCutaway) {
      return {
        wrapperStyle: {
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        node: (
          <PagePaperCard
            badge={categoryLabel}
            subtitle={styleLabel}
            title={headline}
            metric={metric ? { value: metric.raw, label: "Key Figure" } : undefined}
            body={beat.spokenText}
            citation={beat.sourceCitation}
            isWarning={isWarning}
            width={720}
          />
        ),
      };
    }

    return {
      wrapperStyle: isFullscreen
        ? {
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }
        : { position: "absolute", right: "68px", top: "170px" },
      node: (
        <GlassCard
          badge={categoryLabel}
          badgeTone={isWarning ? "warning" : "gold"}
          subtitle={styleLabel}
          title={headline}
          metric={
            metric
              ? {
                  value: metric.raw,
                  label: "Key Figure",
                  delta: isWarning ? "Risk Signal" : undefined,
                  deltaPositive: !isWarning,
                }
              : undefined
          }
          body={beat.spokenText}
          citation={beat.sourceCitation}
          tint={overFootageGlassTint}
          lifecycle={glassLifecycle}
          enableSfx={false}
        />
      ),
    };
  }

  if (hint === "GlassCornerPill") {
    return {
      wrapperStyle: { position: "absolute", top: "52px", right: "64px" },
      node: (
        <GlassCornerPill
          badge={categoryLabel}
          label={headline}
          value={metric ? metric.raw : undefined}
          tint={overFootageGlassTint}
          lifecycle={glassLifecycle}
          enableSfx={false}
        />
      ),
    };
  }

  if (hint === "GlassBottomDock") {
    return {
      wrapperStyle: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: "56px",
        display: "flex",
        justifyContent: "center",
      },
      node: (
        <GlassBottomDock
          caption={categoryLabel}
          activeIndex={1}
          tint={overFootageGlassTint}
          lifecycle={glassLifecycle}
          items={[
            { label: "Format", value: styleLabel, icon: "01" },
            {
              label: trimToWholeWords(headline, 26),
              value: metric ? metric.raw : "Key Point",
              icon: "02",
              active: true,
            },
            { label: "Pace", value: beat.durationSec.toFixed(1) + "s", icon: "03" },
          ]}
          enableSfx={false}
        />
      ),
    };
  }

  if (hint === "GlassFloatingToolbar") {
    return {
      wrapperStyle: {
        position: "absolute",
        left: 0,
        right: 0,
        top: "48px",
        display: "flex",
        justifyContent: "center",
      },
      node: (
        <GlassFloatingToolbar
          prefix={categoryLabel}
          autoCycleFrames={Math.max(15, Math.floor(beatFrames / 3))}
          tint={overFootageGlassTint}
          lifecycle={glassLifecycle}
          items={[
            { tag: "01", label: "Baseline" },
            { tag: "02", label: trimToWholeWords(headline, 24) },
            { tag: "03", label: "Impact" },
          ]}
          rightSlot={metric ? metric.raw : undefined}
          enableSfx={false}
        />
      ),
    };
  }

  if (hint === "GlassToastAlert") {
    return {
      wrapperStyle: { position: "absolute", top: "52px", right: "64px" },
      node: (
        <GlassToastAlert
          title={headline}
          message={beat.spokenText}
          variant={isWarning ? "warning" : isJoke ? "joke" : "info"}
          tint={isWarning ? "warning" : isJoke ? "gold" : "navy-glass"}
          tag={categoryLabel}
          timestamp={beat.durationSec.toFixed(1) + "s"}
          lifecycle={glassLifecycle}
          enableSfx={false}
        />
      ),
    };
  }

  if (hint === "GlassSplitModal") {
    const parts = beat.spokenText.split(/\bvs\.?\b|\bwhile\b|\bversus\b/i);
    const leftText = (parts[0] || "").trim() || headline;
    const rightText = (parts[1] || "").trim() || beat.cutReason || "Counterpoint";
    const leftMetric = extractPrimaryMetric(leftText);
    const rightMetric = extractPrimaryMetric(rightText);

    return {
      wrapperStyle: isFullscreen
        ? {
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }
        : { position: "absolute", right: "64px", top: "160px" },
      node: (
        <GlassSplitModal
          eyebrow={categoryLabel}
          title={headline}
          tint="navy-glass"
          lifecycle={glassLifecycle}
          left={{
            label: "Baseline",
            value: leftMetric ? leftMetric.raw : "Current",
            sublabel: leftText.slice(0, 80),
            highlight: true,
          }}
          right={{
            label: isWarning ? "Risk Shift" : "Impact",
            value: rightMetric ? rightMetric.raw : "Shift",
            sublabel: rightText.slice(0, 80),
            isRisk: isWarning,
          }}
          footer={beat.sourceCitation}
          width={isFullscreen ? 860 : 660}
          enableSfx={false}
        />
      ),
    };
  }

  // 2. Broadcast & Document Components
  if (hint === "NewsPackageLowerThird") {
    return {
      fullCanvas: true,
      node: (
        <NewsPackageLowerThird
          category={categoryLabel}
          title={headline}
          source={beat.sourceCitation || "Editorial Record"}
          mode={isWarning ? "LIVE" : "ANALYSIS"}
          atFrame={0}
        />
      ),
    };
  }

  if (hint === "CaptionNewsCard") {
    return {
      fullCanvas: true,
      node: (
        <CaptionNewsCard
          dateline={categoryLabel}
          headline={headline}
          body={beat.spokenText}
          atFrame={0}
        />
      ),
    };
  }

  if (hint === "VisualInvestigationBoard") {
    return {
      fullCanvas: true,
      node: (
        <VisualInvestigationBoard
          atFrame={0}
          pointerTargetId="e2"
          evidenceItems={[
            { id: "e1", label: "Topic", value: trimToWholeWords(headline, 28) },
            {
              id: "e2",
              label: categoryLabel,
              value: metric ? metric.raw : "Risk Flag",
              isFlagged: true,
            },
            {
              id: "e3",
              label: "Source",
              value: trimToWholeWords(beat.sourceCitation || "Editorial Record", 32),
            },
          ]}
        />
      ),
    };
  }

  if (hint === "LiveCountdownSplit") {
    return {
      fullCanvas: true,
      node: (
        <LiveCountdownSplit
          leftTitle={trimToWholeWords(headline, 28)}
          rightTitle={categoryLabel}
          atFrame={0}
          duration={Math.max(30, beatFrames - 15)}
        />
      ),
    };
  }

  if (hint === "TelestratorOverlay") {
    return {
      fullCanvas: true,
      node: (
        <TelestratorOverlay
          atFrame={0}
          duration={Math.min(30, beatFrames)}
          circleTarget={{ cx: 1320, cy: 480, r: 160, label: metric ? metric.raw : headline }}
        />
      ),
    };
  }

  if (hint === "KinoMontageStrip") {
    return {
      fullCanvas: isFullscreen,
      wrapperStyle: isFullscreen
        ? undefined
        : { position: "absolute", left: "80px", bottom: "140px" },
      node: (
        <KinoMontageStrip
          numberText={metric ? metric.raw : "01"}
          headerText={headline}
          subtitle={beat.spokenText}
          category={categoryLabel}
          fullScene={isFullscreen}
          atFrame={0}
        />
      ),
    };
  }

  if (hint === "ArchiveLightTable") {
    return {
      fullCanvas: true,
      node: (
        <ArchiveLightTable>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              padding: "96px",
            }}
          >
            <PagePaperCard
              badge={categoryLabel}
              subtitle="Archive Record"
              title={headline}
              body={beat.spokenText}
              citation={beat.sourceCitation}
              isWarning={isWarning}
              width={680}
            />
          </div>
        </ArchiveLightTable>
      ),
    };
  }

  if (hint === "CitySymphonyFrame") {
    const secs = Math.floor(beat.startFrame / 30);
    const tcSec = secs < 10 ? "0" + String(secs) : String(secs % 60);
    return {
      fullCanvas: true,
      node: (
        <>
          <CitySymphonyFrame timecode={"00:" + tcSec + ":00"} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "96px",
            }}
          >
            <EditorialHeadline
              variant="chapter-card"
              category={categoryLabel}
              title={headline}
              subtitle={beat.spokenText}
              atFrame={0}
              duration={beatFrames}
              enableSfx={false}
            />
          </div>
        </>
      ),
    };
  }

  if (hint === "StainedGlassFrame") {
    return {
      fullCanvas: true,
      node: (
        <StainedGlassFrame>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              padding: "80px",
            }}
          >
            <PagePaperCard
              badge={categoryLabel}
              subtitle={styleLabel}
              title={headline}
              metric={metric ? { value: metric.raw, label: "Key Figure" } : undefined}
              body={beat.spokenText}
              citation={beat.sourceCitation}
              isWarning={isWarning}
              width={720}
            />
          </div>
        </StainedGlassFrame>
      ),
    };
  }

  if (hint === "IsometricScene") {
    return {
      fullCanvas: true,
      node: (
        <IsometricScene>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              padding: "80px",
            }}
          >
            <EditorialHeadline
              variant="newspaper-cutout"
              category={categoryLabel}
              title={headline}
              subtitle={beat.spokenText}
              atFrame={0}
              duration={beatFrames}
              enableSfx={false}
            />
          </div>
        </IsometricScene>
      ),
    };
  }

  // 3. Vintage & Diagram Metaphor Components
  if (hint === "Newsreel1920s") {
    return {
      fullCanvas: true,
      node: (
        <Newsreel1920s placeDate={categoryLabel} headline={headline} atFrame={0}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              padding: "96px",
              textAlign: "center",
              fontFamily: FONTS.serif,
              fontSize: "34px",
              color: "#EFE6CF",
            }}
          >
            {beat.spokenText}
          </div>
        </Newsreel1920s>
      ),
    };
  }

  if (hint === "SilentFilmCard") {
    return {
      fullCanvas: true,
      node: <SilentFilmCard title={headline} dialogue={beat.spokenText} atFrame={0} />,
    };
  }

  if (hint === "SpyTitleSequence") {
    return {
      fullCanvas: true,
      node: <SpyTitleSequence title={headline} codeName={categoryLabel} atFrame={0} />,
    };
  }

  if (hint === "CollageCutout") {
    return {
      wrapperStyle: { position: "absolute", right: "96px", top: "200px" },
      node: (
        <CollageCutout atFrame={0}>
          <div style={{ padding: "24px 32px", maxWidth: "460px", color: COLORS.navy }}>
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: "12px",
                fontWeight: 700,
                color: COLORS.brickRed,
              }}
            >
              {categoryLabel}
            </div>
            <div
              style={{
                fontFamily: FONTS.serif,
                fontSize: "28px",
                fontWeight: 800,
                marginTop: "8px",
              }}
            >
              {headline}
            </div>
          </div>
        </CollageCutout>
      ),
    };
  }

  if (hint === "StickerCutout" || hint === "StickFigureStage") {
    return {
      wrapperStyle: { position: "absolute", right: "96px", top: "140px" },
      node: (
        <StickerCutout atFrame={0}>
          <div style={{ backgroundColor: PAGE_PALETTE.paperLight, padding: "16px 24px" }}>
            <StickFigureStage
              pose={isWarning ? "shocked" : "pointing"}
              caption={headline}
              accentColor={COLORS.brickRed}
            />
          </div>
        </StickerCutout>
      ),
    };
  }

  if (hint === "InstructionManualCard") {
    const isTaxBeat = /paycheck|payroll|tax|receipt/i.test(beat.spokenText);
    return {
      wrapperStyle: { position: "absolute", right: "72px", top: "180px" },
      node: (
        <InstructionManualCard
          stepNumber={1}
          title={headline}
          leftLabel={isTaxBeat ? "TAXES (84%)" : "BASELINE"}
          rightLabel={isTaxBeat ? "TREASURY" : "OUTCOME"}
          atFrame={0}
        />
      ),
    };
  }

  // 4. Data, Maps & 3D Components (Dynamic Cartography — Zero Hardcoded Texas)
  if (hint === "MapExplainer") {
    const mapCfg = resolveDynamicMapProps(
      beat,
      headline,
      isPageCutaway ? "page" : "over-footage",
      isWarning
    );
    return {
      fullCanvas: true,
      node: (
        <MapExplainer
          query={mapCfg.query}
          corridorId={mapCfg.corridorId}
          region={mapCfg.region}
          highlightStatesFips={mapCfg.highlightStatesFips}
          highlightLabel={mapCfg.highlightLabel}
          title={headline}
          subtitle={beat.subtitle}
          spokenText={beat.spokenText}
          sourceCitation={beat.sourceCitation}
          metricValue={metric ? metric.raw : undefined}
          routeTone={mapCfg.routeTone}
          paletteMode={isPageCutaway ? "page" : "over-footage"}
          atFrame={0}
        />
      ),
    };
  }

  if (hint === "DataPhysicalCard") {
    const val1 = metrics[0] ? metrics[0].numeric : 84;
    const hasSecond = metrics.length >= 2;
    const val2 = hasSecond
      ? metrics[1].numeric
      : Math.max(5, Math.min(40, Math.round(100 - val1)));

    const isReceipts = /paycheck|payroll|corporate/i.test(beat.spokenText);
    const label1 = isReceipts
      ? "Paychecks (" + (metrics[0] ? metrics[0].raw : String(Math.round(val1)) + "%") + ")"
      : trimToWholeWords(headline, 22);
    const label2 = isReceipts
      ? "Corporate (" + (metrics[1] ? metrics[1].raw : String(Math.round(val2)) + "%") + ")"
      : hasSecond
        ? "Comparison (" + metrics[1].raw + ")"
        : "Baseline";

    return {
      wrapperStyle: isPageCutaway
        ? {
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }
        : { position: "absolute", right: "72px", top: "160px" },
      node: (
        <DataPhysicalCard
          label1={label1}
          value1={Math.min(100, Math.max(5, Math.round(val1)))}
          label2={label2}
          value2={Math.min(100, Math.max(5, Math.round(val2)))}
          atFrame={0}
        />
      ),
    };
  }

  if (hint === "WhiteModel3D") {
    return {
      wrapperStyle: { position: "absolute", right: "72px", top: "180px" },
      node: <WhiteModel3D width={580} height={380} />,
    };
  }

  if (hint === "BlobSimulation") {
    return {
      wrapperStyle: { position: "absolute", right: "72px", top: "220px" },
      node: <BlobSimulation />,
    };
  }

  if (hint === "DataTicker" && metric && metric.numeric !== null) {
    if (!isPageCutaway) {
      return {
        wrapperStyle: { position: "absolute", right: "72px", top: "200px" },
        node: (
          <LiquidGlassObject borderRadius={22} tint={overFootageGlassTint} enableSfx={false}>
            <div style={{ padding: "28px 36px" }}>
              <DataTicker
                startValue={0}
                endValue={metric.numeric}
                prefix={metric.prefix}
                suffix={metric.suffix}
                label={headline}
                color={OVER_FOOTAGE_PALETTE.textHeadline}
                accentColor={
                  isWarning
                    ? OVER_FOOTAGE_PALETTE.brickRedText
                    : OVER_FOOTAGE_PALETTE.accentPrimary
                }
                darkSurface={true}
                atFrame={0}
                duration={Math.min(45, Math.max(18, beatFrames - 12))}
                enableSfx={false}
              />
            </div>
          </LiquidGlassObject>
        ),
      };
    }
    return {
      wrapperStyle: { position: "absolute", right: "72px", top: "200px" },
      node: (
        <div
          style={{
            padding: "28px 36px",
            borderRadius: "20px",
            backgroundColor: PAGE_PALETTE.paperLight,
            border: `1px solid ${PAGE_PALETTE.paperBorder}`,
            boxShadow: "0 20px 44px rgba(28, 43, 58, 0.14)",
          }}
        >
          <DataTicker
            startValue={0}
            endValue={metric.numeric}
            prefix={metric.prefix}
            suffix={metric.suffix}
            label={headline}
            color={PAGE_PALETTE.navy}
            accentColor={isWarning ? PAGE_PALETTE.brickRed : PAGE_PALETTE.navy}
            atFrame={0}
            duration={Math.min(45, Math.max(18, beatFrames - 12))}
            enableSfx={false}
          />
        </div>
      ),
    };
  }

  if (hint === "KineticText") {
    const resolvedTimedWords =
      beat.timedWords && beat.timedWords.length > 0
        ? connectWhisperWordsToBeat(beat.timedWords, 0, beatFrames, {
            fps,
            rebaseToLocal: false,
          })
        : synthesizeTimedWords(beat.spokenText, beatFrames, fps);

    if (!isPageCutaway) {
      return {
        wrapperStyle: {
          position: "absolute",
          left: "80px",
          right: "80px",
          bottom: "96px",
          display: "flex",
          justifyContent: "center",
        },
        node: (
          <LiquidGlassObject borderRadius={16} tint={overFootageGlassTint} enableSfx={false}>
            <div style={{ padding: "18px 32px" }}>
              <KineticText
                text={beat.spokenText}
                timedWords={resolvedTimedWords}
                mode={kineticMode}
                atFrame={0}
                duration={beatFrames}
                fontSize={32}
                paletteMode="over-footage"
                color={OVER_FOOTAGE_PALETTE.textHeadline}
                highlightColor={
                  isWarning
                    ? OVER_FOOTAGE_PALETTE.brickRedText
                    : OVER_FOOTAGE_PALETTE.accentPrimary
                }
                style={{ textShadow: OVER_FOOTAGE_PALETTE.textShadow }}
                enableSfx={false}
              />
            </div>
          </LiquidGlassObject>
        ),
      };
    }
    return {
      wrapperStyle: {
        position: "absolute",
        left: "80px",
        right: "80px",
        bottom: "96px",
        display: "flex",
        justifyContent: "center",
      },
      node: (
        <div
          style={{
            backgroundColor: "rgba(250, 248, 243, 0.95)",
            padding: "18px 32px",
            borderRadius: "14px",
            border: `1px solid ${PAGE_PALETTE.paperBorder}`,
            borderLeft: `4px solid ${PAGE_PALETTE.navy}`,
            boxShadow: "0 18px 40px rgba(28, 43, 58, 0.14)",
          }}
        >
          <KineticText
            text={beat.spokenText}
            timedWords={resolvedTimedWords}
            mode={kineticMode}
            atFrame={0}
            duration={beatFrames}
            fontSize={32}
            paletteMode="page"
            color={PAGE_PALETTE.navy}
            highlightColor={isWarning ? PAGE_PALETTE.brickRed : PAGE_PALETTE.navy}
            enableSfx={false}
          />
        </div>
      ),
    };
  }

  if (hint === "EditorialHeadline" || isFullscreen) {
    return {
      wrapperStyle: {
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px",
      },
      node: (
        <EditorialHeadline
          variant={
            beat.styleFamily === "vintage-editorial" && beat.componentHint === "SpyTitleSequence"
              ? "spy-title"
              : "chapter-card"
          }
          category={categoryLabel}
          title={headline}
          subtitle={beat.spokenText}
          atFrame={0}
          duration={beatFrames}
          enableSfx={false}
        />
      ),
    };
  }

  if (isPageCutaway) {
    return {
      wrapperStyle: {
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      node: (
        <PagePaperCard
          badge={categoryLabel}
          subtitle={styleLabel}
          title={headline}
          body={beat.spokenText}
          citation={beat.sourceCitation}
          isWarning={isWarning}
        />
      ),
    };
  }

  return {
    wrapperStyle: { position: "absolute", right: "68px", top: "170px" },
    node: (
      <GlassCard
        badge={categoryLabel}
        badgeTone={isWarning ? "warning" : "gold"}
        title={headline}
        body={beat.spokenText}
        citation={beat.sourceCitation}
        tint={overFootageGlassTint}
        lifecycle={glassLifecycle}
        enableSfx={false}
      />
    ),
  };
}

const VALID_DEPTH_PRESETS = new Set<string>([
  "behind-shoulder-billboard",
  "dual-shoulder-wings",
  "halo-arc-gauge",
  "pass-through-conveyor",
  "over-shoulder-dossier-stack",
  "subsea-horizon-split",
  "colossus-prop-backdrop",
  "spotlight-dim-sandwich",
]);

function resolveDepthConfig(
  beat: DirectorBeat,
  propDepthMode?: PresenterDepthMode | null
): {
  isActive: boolean;
  mode?: PresenterDepthMode;
  preset: DepthSandwichPreset;
  heroFigure?: string;
  eyebrow?: string;
  sublabel?: string;
  foregroundGlass: boolean;
} {
  const dsObj: DepthSandwichConfig | undefined =
    typeof beat.depthSandwich === "object" && beat.depthSandwich !== null
      ? beat.depthSandwich
      : undefined;

  const explicitMode =
    propDepthMode || beat.depthMode || dsObj?.mode || dsObj?.renderPass;

  const isActive =
    Boolean(explicitMode) ||
    beat.layering === "behind-presenter" ||
    beat.layering === "depth-sandwich" ||
    beat.depthSandwich === true ||
    (dsObj !== undefined && dsObj.enabled !== false) ||
    beat.typographyMode === "behind-presenter-monolith";

  const rawPreset = dsObj?.preset || "behind-shoulder-billboard";
  const preset: DepthSandwichPreset = VALID_DEPTH_PRESETS.has(rawPreset)
    ? (rawPreset as DepthSandwichPreset)
    : "behind-shoulder-billboard";

  return {
    isActive,
    mode: explicitMode,
    preset,
    heroFigure: dsObj?.heroFigure,
    eyebrow: dsObj?.eyebrow,
    sublabel: dsObj?.sublabel,
    foregroundGlass: dsObj?.foregroundGlass !== false,
  };
}

/**
 * Grand Unification DirectorBeatRenderer:
 * - Renders all 162 Style Recipes across 10 Style Worlds
 * - Renders custom SceneBlueprints & 24 Signature Set-Pieces
 * - Renders all 18 Smoked-Navy Liquid Glass Rigs & 32 Kinetic Typography Modes
 * - Renders 545 Parametric Props (`PropVaultRenderer`) & 96 Studio Foley SFX (`SfxTimeline`)
 * - Honors Pillar #10 Depth-Sandwich (`behind-only-alpha`, `front-only-alpha`, `masked-video`, `simulated-depth`)
 * - Eliminates hardcoded Texas cartography via `resolveGeoQuery`
 */
export const DirectorBeatRenderer: React.FC<DirectorBeatRendererProps> = ({
  beat: rawBeat,
  previewMode,
  depthMode,
  cameraSrc,
  presenterAlphaSrc,
  personMaskSrc,
  renderAudio = true,
}) => {
  const { durationInFrames, fps } = useVideoConfig();
  const beat = useMemo(() => normalizeDirectorBeat(rawBeat), [rawBeat]);

  const effectiveCameraSrc = resolvePlayableMediaSrc(cameraSrc || beat.arollSrc);
  const effectivePersonAlphaSrc = resolvePlayableMediaSrc(
    presenterAlphaSrc || beat.personAlphaSrc
  );
  const effectivePersonMaskSrc = resolvePlayableMediaSrc(personMaskSrc || beat.personMaskSrc);

  const resolvedPreview = resolveDefaultPreviewMode(beat, previewMode);
  const normalizedHint = normalizeComponentHint(beat);
  const isFullCanvas =
    Boolean(beat.sceneBlueprint || beat.setPieceId || beat.setPieceSlug) ||
    [
      "NewsPackageLowerThird",
      "CaptionNewsCard",
      "VisualInvestigationBoard",
      "LiveCountdownSplit",
      "TelestratorOverlay",
      "ArchiveLightTable",
      "CitySymphonyFrame",
      "StainedGlassFrame",
      "IsometricScene",
      "Newsreel1920s",
      "SilentFilmCard",
      "SpyTitleSequence",
      "MapExplainer",
    ].indexOf(normalizedHint) !== -1 ||
    (normalizedHint === "KinoMontageStrip" && beat.framing === "fullscreen-cutaway");

  const { enter, activeEffect, exit, exitDuration, lifecycle } = resolveMotionProps(
    beat,
    durationInFrames,
    isFullCanvas
  );

  const slot = renderBeatComponent(beat, durationInFrames, fps, lifecycle, {
    cameraSrc: effectiveCameraSrc,
    presenterAlphaSrc: effectivePersonAlphaSrc,
    personMaskSrc: effectivePersonMaskSrc,
  });

  const enterDuration = Math.min(14, Math.max(6, Math.floor(durationInFrames / 6)));
  const sfxItems: SfxTimelineItem[] = useMemo(
    () =>
      (beat.sfxCues || []).map((c) => ({
        cue: c.cue,
        frame: Math.max(0, Math.round(c.offsetFrame ?? 0)),
        volume: c.volume ?? 0.65,
      })),
    [beat.sfxCues]
  );

  const depthCfg = resolveDepthConfig(beat, depthMode);
  const primaryPropId =
    beat.propIds && beat.propIds.length > 0 && !beat.sceneBlueprint && !beat.setPieceId
      ? beat.propIds[0]
      : undefined;

  const animatedForegroundNode = slot.fullCanvas ? (
    <ObjectAnimator
      enter={enter}
      enterDuration={enterDuration}
      activeEffect={activeEffect}
      exit={exit}
      exitDuration={exitDuration}
      atFrame={0}
      duration={durationInFrames}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      {slot.node}
    </ObjectAnimator>
  ) : (
    <div style={slot.wrapperStyle}>
      <ObjectAnimator
        enter={enter}
        enterDuration={enterDuration}
        activeEffect={activeEffect}
        exit={exit}
        exitDuration={exitDuration}
        atFrame={0}
        duration={durationInFrames}
      >
        {slot.node}
      </ObjectAnimator>
    </div>
  );

  // Pillar #10 Depth-Sandwich Path (Dual-pass alpha stems OR full 4-plane occluded stage)
  const useDepthStage =
    depthCfg.isActive &&
    beat.framing !== "fullscreen-cutaway" &&
    (Boolean(depthCfg.mode) || resolvedPreview !== "transparent");

  if (useDepthStage) {
    const headline = deriveHeadline(beat);
    const metric = extractPrimaryMetric(beat.spokenText);
    const isWarning =
      beat.category.toLowerCase().indexOf("warn") !== -1 ||
      beat.category.toLowerCase().indexOf("risk") !== -1;
    const resolvedStageMode: PresenterDepthMode =
      depthCfg.mode ||
      (effectiveCameraSrc || effectivePersonAlphaSrc ? "masked-video" : "simulated-depth");

    return (
      <>
        {renderAudio && sfxItems.length > 0 && (
          <SfxTimeline cues={sfxItems} seed={beat.id} />
        )}
        <PresenterDepthStage
          mode={resolvedStageMode}
          preset={depthCfg.preset}
          cameraSrc={effectiveCameraSrc}
          presenterAlphaSrc={effectivePersonAlphaSrc}
          personMaskSrc={effectivePersonMaskSrc}
          heroBackdropFigure={{
            figure: depthCfg.heroFigure || (metric ? metric.raw : headline),
            eyebrow: depthCfg.eyebrow || formatCategoryLabel(beat.category),
            sublabel: depthCfg.sublabel || headline,
            tone: isWarning ? "liability" : "cream",
          }}
          behindPresenter={
            primaryPropId ? (
              <div style={{ position: "absolute", right: "140px", bottom: "110px", opacity: 0.92 }}>
                <PropVaultRenderer
                  propId={primaryPropId}
                  width={340}
                  height={240}
                  paletteMode="over-footage"
                />
              </div>
            ) : undefined
          }
          foregroundGlass={depthCfg.foregroundGlass ? animatedForegroundNode : undefined}
        />
      </>
    );
  }

  return (
    <CameraPreviewStage previewMode={resolvedPreview} cameraSrc={effectiveCameraSrc}>
      {renderAudio && sfxItems.length > 0 && (
        <SfxTimeline cues={sfxItems} seed={beat.id} />
      )}

      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {animatedForegroundNode}

        {primaryPropId && beat.framing === "fullscreen-cutaway" && (
          <div style={{ position: "absolute", right: "76px", bottom: "76px", zIndex: 24 }}>
            <PropVaultRenderer
              propId={primaryPropId}
              width={260}
              height={190}
              paletteMode="page"
            />
          </div>
        )}
      </AbsoluteFill>

      {beat.sourceCitation &&
        beat.framing === "fullscreen-cutaway" &&
        !beat.sceneBlueprint &&
        !beat.setPieceId &&
        ![
          "GlassCard",
          "GlassSplitModal",
          "NewsPackageLowerThird",
          "ArchiveLightTable",
          "StainedGlassFrame",
        ].includes(normalizedHint) && (
          <SourceBadge sourceText={beat.sourceCitation} startFrame={8} />
        )}
    </CameraPreviewStage>
  );
};
